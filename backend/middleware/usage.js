import pool from '../db.js';

export const checkPlanLimits = async (req, res, next) => {
    // Determine what action they are taking: create_chatbot, upload_document, chat
    let action = req.path;
    let orgId = req.user?.organizationId;
    let chatbotId = req.body?.chatbotId || req.query?.chatbotId;

    if (!orgId && chatbotId) {
        // Unauthenticated chat request, lookup orgId
        const botResult = await pool.query("SELECT organization_id FROM chatbots WHERE id = $1", [chatbotId]);
        if (botResult.rows.length > 0) {
            orgId = botResult.rows[0].organization_id;
            req.resolvedOrgId = orgId; // Save for usage tracking
        }
    }

    if (!orgId) return res.status(401).json({ error: "Missing organization info" });

    try {
        // Fetch plan
        const planResult = await pool.query(
            "SELECT plan, status FROM subscriptions WHERE organization_id = $1 AND status = 'active'",
            [orgId]
        );
        let plan = 'Free';
        if (planResult.rows.length > 0) {
            plan = planResult.rows[0].plan;
        }

        let maxChatbots = 1;
        let maxMessages = 1000;
        let maxDocs = 5;

        // "Free" is same as Starter if they just signed up, or we can enforce 0
        // Based on instructions: Starter: chatbots 1, msg 1000, docs 5
        // Pro: chatbots 5, msg 10000, docs 20
        // Enterprise: unlimited
        if (plan === 'Pro') {
            maxChatbots = 5;
            maxMessages = 10000;
            maxDocs = 20;
        } else if (plan === 'Enterprise') {
            maxChatbots = Infinity;
            maxMessages = Infinity;
            maxDocs = Infinity;
        }

        // Apply rules
        if (action === '/chatbots' && req.method === 'POST') {
            const botCount = await pool.query("SELECT count(*) FROM chatbots WHERE organization_id = $1", [orgId]);
            if (parseInt(botCount.rows[0].count, 10) >= maxChatbots) {
                return res.status(403).json({ error: "Chatbot limit reached. Please upgrade your plan." });
            }
        }

        if (action === '/upload' || action === '/train-website') {
            if(chatbotId) {
                const docCount = await pool.query("SELECT count(*) FROM knowledge_sources WHERE chatbot_id = $1", [chatbotId]);
                if (parseInt(docCount.rows[0].count, 10) >= maxDocs) {
                    return res.status(403).json({ error: "Document limit reached for this chatbot. Please upgrade your plan." });
                }
            }
        }

        if (action === '/chat') {
            const month = new Date().toISOString().slice(0, 7);
            const usageResult = await pool.query(
                "SELECT SUM(messages_used) as total_messages FROM usage_tracking WHERE organization_id = $1 AND month = $2",
                [orgId, month]
            );
            const used = usageResult.rows[0].total_messages ? parseInt(usageResult.rows[0].total_messages, 10) : 0;
            if (used >= maxMessages) {
                return res.status(403).json({ error: "You have reached your monthly chat limit. Please upgrade your plan." });
            }
        }

        next();
    } catch (error) {
         console.error("Usage limit check error:", error);
         res.status(500).json({ error: "Internal server error while checking limits" });
    }
};

export const incrementUsage = async (orgId, chatbotId) => {
    try {
        const month = new Date().toISOString().slice(0, 7);
        // Find existing usage row for this format
        const existing = await pool.query(
            "SELECT id FROM usage_tracking WHERE organization_id = $1 AND chatbot_id = $2 AND month = $3",
            [orgId, chatbotId, month]
        );

        if (existing.rows.length > 0) {
            await pool.query(
                "UPDATE usage_tracking SET messages_used = messages_used + 1 WHERE id = $1",
                [existing.rows[0].id]
            );
        } else {
            await pool.query(
                "INSERT INTO usage_tracking (organization_id, chatbot_id, month, messages_used) VALUES ($1, $2, $3, 1)",
                [orgId, chatbotId, month]
            );
        }
    } catch (error) {
        console.error("Failed to increment usage:", error);
    }
};
