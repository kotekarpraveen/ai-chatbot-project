import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import fs from "fs";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import path from "path";
import { scrapeWebsite } from "./websiteCrawler.js";
import { v4 as uuidv4 } from "uuid";

import authRoutes from './routes/auth.js';
import chatbotsRoutes from './routes/chatbots.js';
import leadsRoutes from './routes/leads.js';
import analyticsRoutes from './routes/analytics.js';
import billingRoutes from './routes/billing.js';
import { authenticateToken } from './middleware/auth.js';
import { checkPlanLimits, incrementUsage } from './middleware/usage.js';
import pool from './db.js';

dotenv.config();

const upload = multer({ dest: "uploads/" });
const app = express();
app.use(cors({ origin: true }));

// Stripe webhook must be raw to verify signature
app.use('/billing/webhook', express.raw({ type: 'application/json' }), billingRoutes);

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/chatbots', chatbotsRoutes);
app.use('/leads', leadsRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/billing', billingRoutes);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const embeddings = new OpenAIEmbeddings();
const vectorStore = new MemoryVectorStore(embeddings);

// Load the persisted data
const dataPath = "./vector_store/data.json";
const sourcesPath = "./vector_store/sources.json";

if (fs.existsSync(dataPath)) {
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    vectorStore.memoryVectors = data;
    console.log("Vector store loaded from disk.");
} else {
    console.log("No vector store found. Initializing empty store.");
    if (!fs.existsSync("./vector_store")) fs.mkdirSync("./vector_store");
}

let sources = [];
if (fs.existsSync(sourcesPath)) {
    sources = JSON.parse(fs.readFileSync(sourcesPath, "utf8"));
}

const saveSources = () => {
    fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));
};



app.post("/upload", authenticateToken, checkPlanLimits, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { chatbotId } = req.body;
        if (!chatbotId) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "chatbotId is required" });
        }

        // Verify ownership
        const checkResult = await pool.query(
            "SELECT id FROM chatbots WHERE id = $1 AND organization_id = $2",
            [chatbotId, req.user.organizationId]
        );
        if (checkResult.rows.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(403).json({ error: "Unauthorized access to this chatbot" });
        }

        const filePath = req.file.path;
        console.log("Indexing uploaded file:", req.file.originalname, "for chatbot:", chatbotId);

        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        const text = data.text;

        if (!text || text.trim().length === 0) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(400).json({ error: "PDF has no readable text" });
        }

        const chunks = text.match(/.{1,1000}/g) || [];

        const sourceId = uuidv4();
        await vectorStore.addDocuments(
            chunks.map(chunk => ({
                pageContent: chunk,
                metadata: { source: req.file.originalname, sourceId, chatbotId }
            }))
        );

        sources.push({
            id: sourceId,
            type: "PDF",
            name: req.file.originalname,
            createdAt: new Date()
        });
        saveSources();

        // Persist the updated vector store
        const jsonData = JSON.stringify(vectorStore.memoryVectors);
        fs.writeFileSync(dataPath, jsonData);

        // Cleanup temporary file
        fs.unlinkSync(filePath);

        res.json({
            message: "Document indexed successfully",
            chunks: chunks.length,
            id: sourceId
        });

    } catch (error) {
        console.error("Upload error:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            error: "Document upload failed"
        });
    }
});

app.post("/train-website", authenticateToken, checkPlanLimits, async (req, res) => {
    try {
        const { url, chatbotId } = req.body;
        if (!url || !chatbotId) {
            return res.status(400).json({ error: "URL and chatbotId are required" });
        }

        // Verify ownership
        const checkResult = await pool.query(
            "SELECT id FROM chatbots WHERE id = $1 AND organization_id = $2",
            [chatbotId, req.user.organizationId]
        );
        if (checkResult.rows.length === 0) {
            return res.status(403).json({ error: "Unauthorized access to this chatbot" });
        }

        console.log("Training on website:", url, "for chatbot:", chatbotId);
        const text = await scrapeWebsite(url);

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: "No readable content found on the website" });
        }

        const chunks = text.match(/.{1,1000}/g) || [];

        const sourceId = uuidv4();
        // Use addDocuments as fixed previously for MemoryVectorStore
        await vectorStore.addDocuments(
            chunks.map(chunk => ({
                pageContent: chunk,
                metadata: { source: url, sourceId, chatbotId }
            }))
        );

        sources.push({
            id: sourceId,
            type: "Website",
            name: url,
            createdAt: new Date()
        });
        saveSources();

        // Persist the updated vector store
        const jsonData = JSON.stringify(vectorStore.memoryVectors);
        fs.writeFileSync(dataPath, jsonData);

        res.json({
            message: "Website indexed successfully",
            chunks: chunks.length,
            id: sourceId
        });
    } catch (error) {
        console.error("Website training error:", error);
        res.status(500).json({
            error: "Website training failed"
        });
    }
});

app.get("/sources", authenticateToken, async (req, res) => {
    const { chatbotId } = req.query;
    if (chatbotId) {
        // Return sources only for this chatbot
        const botSources = sources.filter(s => {
            // Because our sources.json might not have chatbotId perfectly if they were created before MVP, 
            // we will find it by checking if vector vectors have this sourceId mapping to chatbotId
            const hasVector = vectorStore.memoryVectors.find(v => v.metadata && v.metadata.sourceId === s.id && v.metadata.chatbotId === chatbotId);
            return typeof s.chatbotId !== 'undefined' ? s.chatbotId === chatbotId : !!hasVector;
        });
        return res.json(botSources);
    }
    // Default return all sources
    res.json(sources);
});

app.delete("/sources/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const initialCount = sources.length;

    // We should ideally verify if the source belongs to the organization.
    // Simplifying for MVP by relying on UI correctness, but robustly we should verify.

    sources = sources.filter(s => s.id !== id);

    if (sources.length === initialCount) {
        return res.status(404).json({ error: "Source not found" });
    }

    // Filter out memory vectors that belong to this source
    vectorStore.memoryVectors = (vectorStore.memoryVectors || []).filter(
        v => v.metadata && v.metadata.sourceId !== id
    );

    saveSources();
    fs.writeFileSync(dataPath, JSON.stringify(vectorStore.memoryVectors));

    res.json({ message: "Source deleted successfully" });
});

app.delete("/sources", (req, res) => {
    sources = [];
    vectorStore.memoryVectors = [];
    saveSources();
    if (fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify([]));
    res.json({ message: "Knowledge base cleared successfully" });
});

app.post("/chat", checkPlanLimits, async (req, res) => {
    try {
        const { message, messages, chatbotId } = req.body;
        const userMessage = message || messages;

        if (!chatbotId) {
            return res.status(400).json({ error: "chatbotId is required" });
        }

        const checkBot = await pool.query("SELECT id FROM chatbots WHERE id = $1", [chatbotId]);
        if (checkBot.rows.length === 0) {
            return res.status(404).json({ error: "Chatbot not found" });
        }

        console.log("Incoming message for chatbot", chatbotId, ":", userMessage);

        if (!userMessage || typeof userMessage !== "string") {
            return res.status(400).json({ error: "Message is required and must be a string." });
        }

        let context = "";
        if (vectorStore.memoryVectors && vectorStore.memoryVectors.length > 0) {
            const docs = await vectorStore.similaritySearch(userMessage, 3, (doc) => doc.metadata && doc.metadata.chatbotId === chatbotId);
            context = docs.map(d => d.pageContent).join("\n");
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "Answer using the provided context. If no context answers the question, do your best."
                },
                {
                    role: "user",
                    content: `Context:\n${context}\n\nQuestion:${userMessage}`
                }
            ]
        });

        const reply = completion.choices[0].message.content;

        // Log the conversation
        await pool.query(
            "INSERT INTO conversations (chatbot_id, user_message, bot_response) VALUES ($1, $2, $3)",
            [chatbotId, userMessage, reply]
        );
        
        // Track the message usage
        await incrementUsage(req.resolvedOrgId, chatbotId);

        res.json({ reply });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Something went wrong. Please check the backend logs." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});