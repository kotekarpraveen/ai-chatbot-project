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

        // Get total unique chats (sessions)
        const chatResult = await pool.query(
            "SELECT COUNT(DISTINCT session_id) FROM conversations WHERE chatbot_id = $1",
            [chatbotId]
        );
        const totalChats = parseInt(chatResult.rows[0].count, 10);
        
        // Get total messages (all interactions)
        const interactionsResult = await pool.query(
            "SELECT COUNT(*) FROM conversations WHERE chatbot_id = $1",
            [chatbotId]
        );
        const totalMessages = parseInt(interactionsResult.rows[0].count, 10);

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

        // Get daily chats trend
        const dailyTrendsResult = await pool.query(
            `SELECT DATE(created_at) as day, COUNT(*) as count 
             FROM conversations 
             WHERE chatbot_id = $1 
             AND created_at > NOW() - INTERVAL '30 days'
             GROUP BY DATE(created_at) 
             ORDER BY day ASC`,
            [chatbotId]
        );

        // Get messages used for this specific chatbot this month
        const month = new Date().toISOString().slice(0, 7);
        const chatbotUsageResult = await pool.query(
            "SELECT messages_used FROM usage_tracking WHERE chatbot_id = $1 AND month = $2",
            [chatbotId, month]
        );
        const messagesUsed = chatbotUsageResult.rows.length > 0 ? parseInt(chatbotUsageResult.rows[0].messages_used, 10) : 0;

        res.json({
            totalChats,
            totalMessages,
            totalLeads,
            messagesUsed,
            topQuestions,
            recentLeads: recentLeadsResult.rows,
            dailyTrends: dailyTrendsResult.rows
        });
    } catch (error) {
        console.error("Analytics fetch error:", error);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
});

export default router;
