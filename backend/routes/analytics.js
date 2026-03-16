import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:chatbotId', authenticateToken, async (req, res) => {
    const { chatbotId } = req.params;

    try {
        // Verify ownership
        const checkResult = await pool.query(
            "SELECT id FROM chatbots WHERE id = $1 AND organization_id = $2",
            [chatbotId, req.user.organizationId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(403).json({ error: "Unauthorized access to chatbot analytics" });
        }

        // Get total conversations
        const convResult = await pool.query(
            "SELECT COUNT(*) FROM conversations WHERE chatbot_id = $1",
            [chatbotId]
        );
        const totalConversations = parseInt(convResult.rows[0].count, 10);

        // Get total leads
        const leadsResult = await pool.query(
            "SELECT COUNT(*) FROM leads WHERE chatbot_id = $1",
            [chatbotId]
        );
        const totalLeads = parseInt(leadsResult.rows[0].count, 10);

        // Get recent questions as fake "top questions" since analyzing top NLP questions requires more logic
        const topQuestionsResult = await pool.query(
            `SELECT user_message, COUNT(*) as frequency 
             FROM conversations 
             WHERE chatbot_id = $1 
             GROUP BY user_message 
             ORDER BY frequency DESC 
             LIMIT 5`,
            [chatbotId]
        );
        const topQuestions = topQuestionsResult.rows;

        // Optionally get leads summary
        const recentLeadsResult = await pool.query(
            "SELECT name, email, phone, created_at FROM leads WHERE chatbot_id = $1 ORDER BY created_at DESC LIMIT 5",
            [chatbotId]
        );

        res.json({
            totalConversations,
            totalLeads,
            topQuestions,
            recentLeads: recentLeadsResult.rows
        });
    } catch (error) {
        console.error("Analytics fetch error:", error);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
});

export default router;
