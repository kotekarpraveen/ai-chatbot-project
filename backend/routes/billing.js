import express from 'express';
import Stripe from 'stripe';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Initialize Stripe gracefully - don't crash the server if key is missing
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
    console.warn("[WARNING] STRIPE_SECRET_KEY is missing. Billing features will be disabled.");
}

// Get current subscription
router.get('/subscription', authenticateToken, async (req, res) => {
    try {
        const subResult = await pool.query(
            "SELECT plan, status, current_period_end FROM subscriptions WHERE organization_id = $1",
            [req.user.organizationId]
        );
        
        if (subResult.rows.length === 0) {
            return res.json({ plan: "Free", status: "none" });
        }

        res.json(subResult.rows[0]);
    } catch (error) {
        console.error("Subscription fetch error:", error);
        res.status(500).json({ error: "Failed to fetch subscription" });
    }
});

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
    if (!stripe) return res.status(503).json({ error: "Billing service is not configured (Missing ID)." });
    const { plan } = req.body;
    
    let priceId;
    if (plan === 'Starter') priceId = process.env.STRIPE_PRICE_STARTER;
    if (plan === 'Pro') priceId = process.env.STRIPE_PRICE_PRO;

    if (!priceId) {
        return res.status(400).json({ error: "Invalid plan or price not configured in .env" });
    }

    console.log(`[DEBUG] Creating session for Plan: ${plan} with PriceID: ${priceId}`);

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: req.user.email,
            client_reference_id: req.user.organizationId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.VITE_API_URL || 'http://localhost:5173'}/billing?success=true`,
            cancel_url: `${process.env.VITE_API_URL || 'http://localhost:5173'}/billing?canceled=true`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Stripe session error:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});

// Webhook for Stripe events
router.post('/webhook', async (req, res) => {
    if (!stripe) return res.status(503).send("Webhook ignored: Service unconfigured.");
    const sig = req.headers['stripe-signature'];
    let event;

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error("[ERROR] Missing STRIPE_WEBHOOK_SECRET in .env");
        return res.status(500).send("Webhook secret not configured");
    }

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Signature Verification Failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[DEBUG] Received Stripe Event: ${event.type}`);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                console.log("[DEBUG] Session Object:", JSON.stringify(session, null, 2));

                const orgId = session.client_reference_id;
                const subscriptionId = session.subscription;
                const customerId = session.customer;

                if (!subscriptionId) {
                    console.error("[ERROR] No subscription found in Checkout Session", session.id);
                    return res.status(400).send("No subscription in session");
                }
                
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                
                if (!subscription) {
                    console.error("[ERROR] Could not retrieve subscription", subscriptionId);
                    return res.status(404).send("Subscription not found");
                }

                // In newer Stripe API versions, period dates move into items.data[0]
                const item = subscription.items?.data?.[0];
                const rawEnd = subscription.current_period_end || item?.current_period_end;
                const rawStart = subscription.current_period_start || item?.current_period_start;

                if (!rawEnd || !rawStart) {
                    console.error("[ERROR] Missing period dates in subscription object", subscriptionId);
                    console.log("[DEBUG] Full Subscription:", JSON.stringify(subscription, null, 2));
                    return res.status(400).send("Invalid subscription structure");
                }

                const priceId = item?.price?.id || subscription.plan?.id;
                
                let planName = 'Starter'; 
                if (priceId === process.env.STRIPE_PRICE_PRO) planName = 'Pro';
                if (priceId === process.env.STRIPE_PRICE_STARTER) planName = 'Starter';

                const endDate = new Date(parseInt(rawEnd, 10) * 1000).toISOString();
                const startDate = new Date(parseInt(rawStart, 10) * 1000).toISOString();

                console.log(`[DEBUG] Upserting subscription for Org: ${orgId}, Plan: ${planName}, Period: ${startDate} to ${endDate}`);

                // Upsert subscription
                await pool.query(
                    `INSERT INTO subscriptions (organization_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     ON CONFLICT (organization_id) DO UPDATE 
                     SET plan = EXCLUDED.plan, 
                         status = EXCLUDED.status, 
                         stripe_subscription_id = EXCLUDED.stripe_subscription_id,
                         current_period_start = EXCLUDED.current_period_start,
                         current_period_end = EXCLUDED.current_period_end`,
                    [orgId, planName, subscription.status, customerId, subscriptionId, startDate, endDate]
                );
                console.log(`[SUCCESS] Plan activated for organization ${orgId}`);
                break;
            }
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                if (invoice.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
                    
                    const item = subscription.items?.data?.[0];
                    const rawEnd = subscription.current_period_end || item?.current_period_end;
                    
                    if (rawEnd) {
                        const endDate = new Date(parseInt(rawEnd, 10) * 1000).toISOString();
                        await pool.query(
                            "UPDATE subscriptions SET status = $1, current_period_end = $2 WHERE stripe_subscription_id = $3",
                            [subscription.status, endDate, invoice.subscription]
                        );
                        console.log(`[SUCCESS] Subscription renewed for ${invoice.subscription}`);
                    }
                }
                break;
            }
            case 'customer.subscription.deleted':
            case 'invoice.payment_failed': {
                const session = event.data.object;
                const subscriptionId = session.subscription || session.id;
                
                if (subscriptionId) {
                     await pool.query(
                        "UPDATE subscriptions SET status = 'inactive' WHERE stripe_subscription_id = $1",
                        [subscriptionId]
                     );
                }
                break;
            }
        }
        res.json({ received: true });
    } catch (dbError) {
        console.error("Database update failed inside Webhook", dbError);
        res.status(500).json({ error: "Database failure" });
    }
});

// Get current usage
router.get('/usage', authenticateToken, async (req, res) => {
    try {
        // Use moment or basic logic to get YYYY-MM
        const month = new Date().toISOString().slice(0, 7);
        const usageResult = await pool.query(
            "SELECT SUM(messages_used) as total_messages FROM usage_tracking WHERE organization_id = $1 AND month = $2",
            [req.user.organizationId, month]
        );
        
        let used = 0;
        if (usageResult.rows[0].total_messages) {
            used = parseInt(usageResult.rows[0].total_messages, 10);
        }

        res.json({ messagesUsed: used });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch usage" });
    }
});

export default router;
