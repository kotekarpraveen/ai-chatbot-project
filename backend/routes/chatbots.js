import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkPlanLimits } from '../middleware/usage.js';

const router = express.Router();

// Get all chatbots for the organization
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, description, created_at FROM chatbots WHERE organization_id = $1 ORDER BY created_at DESC",
            [req.user.organizationId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Get chatbots error:", error);
        res.status(500).json({ error: "Failed to fetch chatbots" });
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
