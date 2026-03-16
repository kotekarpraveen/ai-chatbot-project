import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { chatbotId, name, email, phone, message } = req.body;

    if (!chatbotId || (!email && !phone)) {
        return res.status(400).json({ error: "Chatbot ID, and either email or phone are required" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO leads (chatbot_id, name, email, phone, message) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [chatbotId, name || '', email || '', phone || '', message || '']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Create lead error:", error);
        res.status(500).json({ error: "Failed to capture lead" });
    }
});

export default router;
