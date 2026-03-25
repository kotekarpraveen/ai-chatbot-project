import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { name, email, password, orgName } = req.body;

    if (!name || !email || !password || !orgName) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Check if user exists
        const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Create organization
        const orgResult = await pool.query(
            "INSERT INTO organizations (name) VALUES ($1) RETURNING id",
            [orgName]
        );
        const orgId = orgResult.rows[0].id;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const userResult = await pool.query(
            "INSERT INTO users (email, password, role, organization_id) VALUES ($1, $2, $3, $4) RETURNING id, email, role, organization_id",
            [email, hashedPassword, 'admin', orgId]
        );

        const newUser = userResult.rows[0];

        // Generate token
        const token = jwt.sign(
            { userId: newUser.id, organizationId: newUser.organization_id, role: newUser.role },
            process.env.JWT_SECRET || "default_secret_key",
            { expiresIn: '7d' }
        );

        res.json({ user: newUser, token });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Server error during signup" });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id, organizationId: user.organization_id, role: user.role },
            process.env.JWT_SECRET || "default_secret_key",
            { expiresIn: '7d' }
        );

        res.json({
            user: { id: user.id, email: user.email, role: user.role, organizationId: user.organization_id },
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
});

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userResult = await pool.query(
            `SELECT u.id, u.email, u.role, u.organization_id, o.name as "organizationName"
             FROM users u
             JOIN organizations o ON u.organization_id = o.id
             WHERE u.id = $1`,
            [req.user.userId]
        );
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(userResult.rows[0]);
    } catch (error) {
        console.error("Auth me error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
