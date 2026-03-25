import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkPlanLimits } from '../middleware/usage.js';

const router = express.Router();

// Diagnostic route (Temporary)
router.get('/debug/db', authenticateToken, async (req, res) => {
    try {
        const bots = await pool.query("SELECT id, name, organization_id FROM chatbots");
        const orgs = await pool.query("SELECT id, name FROM organizations");
        res.json({
            userOrgId: req.user.organizationId,
            chatbots: bots.rows,
            organizations: orgs.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const month = new Date().toISOString().slice(0, 7);
        const result = await pool.query(
            `SELECT c.id, c.name, c.description, c.created_at, 
             COALESCE(u.messages_used, 0) as messages_used 
             FROM chatbots c 
             LEFT JOIN usage_tracking u ON c.id = u.chatbot_id AND u.month = $2
             WHERE c.organization_id = $1 
             ORDER BY c.created_at DESC`,
            [req.user.organizationId, month]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Get chatbots error:", error);
        res.status(500).json({ error: "Failed to fetch chatbots" });
    }
});

// Get a single chatbot's details (Publicly accessible for Demo Player)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`[DEBUG] Publicly fetching chatbot details. ID: ${id}`);
    try {
        const month = new Date().toISOString().slice(0, 7);
        
        // Fetch bot basic info
        const result = await pool.query(
            "SELECT id, organization_id, name, description, created_at FROM chatbots WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Chatbot not found" });
        }

        const bot = result.rows[0];
        
        // Attempt to authenticate optionally to see if we can provide more info
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        let isOwner = false;

        if (token) {
            try {
                const jwt = (await import('jsonwebtoken')).default;
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key");
                if (decoded && decoded.organizationId === bot.organization_id) {
                    isOwner = true;
                }
            } catch (e) {
                // Ignore decoding error, just treat as non-owner
            }
        }

        // Return full info for owner, limited for public
        if (!isOwner) {
            return res.json({
                id: bot.id,
                name: bot.name,
                description: bot.description,
                created_at: bot.created_at
            });
        }

        // Full Info for Owner
        const usageResult = await pool.query(
            "SELECT COALESCE(messages_used, 0) as count FROM usage_tracking WHERE chatbot_id = $1 AND month = $2",
            [id, month]
        );

        const sourcesCount = await pool.query(
            "SELECT COUNT(*) FROM knowledge_sources WHERE chatbot_id = $1",
            [id]
        );

        const leadsCount = await pool.query(
            "SELECT COUNT(*) FROM leads WHERE chatbot_id = $1",
            [id]
        );

        res.json({
            ...bot,
            messagesUsed: usageResult.rows[0]?.count || 0,
            sourcesCount: parseInt(sourcesCount.rows[0].count, 10),
            leadsCount: parseInt(leadsCount.rows[0].count, 10)
        });
    } catch (error) {
        console.error("Get chatbot details error:", error);
        res.status(500).json({ error: "Failed to fetch chatbot details" });
    }
});
// Create a new chatbot
router.post('/', authenticateToken, checkPlanLimits, async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Chatbot name is required" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO chatbots (name, description, organization_id) VALUES ($1, $2, $3) RETURNING id, name, description, created_at",
            [name, description || '', req.user.organizationId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Create chatbot error:", error);
        res.status(500).json({ error: "Failed to create chatbot" });
    }
});

// Delete a chatbot
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const checkResult = await pool.query(
            "SELECT id FROM chatbots WHERE id = $1 AND organization_id = $2",
            [id, req.user.organizationId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: "Chatbot not found or unauthorized" });
        }

        await pool.query("DELETE FROM chatbots WHERE id = $1", [id]);

        // Return a simple success message
        res.json({ message: "Chatbot deleted successfully" });
    } catch (error) {
        console.error("Delete chatbot error:", error);
        res.status(500).json({ error: "Failed to delete chatbot" });
    }
});

export default router;
