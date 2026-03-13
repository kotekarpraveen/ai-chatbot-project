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

dotenv.config();

const upload = multer({ dest: "uploads/" });
const app = express();
app.use(cors());
app.use(express.json());

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



app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        console.log("Indexing uploaded file:", req.file.originalname);

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
                metadata: { source: req.file.originalname, sourceId }
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

app.post("/train-website", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        console.log("Training on website:", url);
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
                metadata: { source: url, sourceId }
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

app.get("/sources", (req, res) => {
    res.json(sources);
});

app.delete("/sources/:id", (req, res) => {
    const { id } = req.params;
    const initialCount = sources.length;
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

app.post("/chat", async (req, res) => {
    try {
        const message = req.body.message || req.body.messages;
        console.log("Incoming message:", message);

        if (!message || typeof message !== "string") {
            return res.status(400).json({ error: "Message is required and must be a string." });
        }

        if (!vectorStore.memoryVectors || vectorStore.memoryVectors.length === 0) {
            return res.json({ reply: "I don't have any documents indexed yet. Please run indexDocuments.js first." });
        }

        const docs = await vectorStore.similaritySearch(message, 3);
        const context = docs.map(d => d.pageContent).join("\n");

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "Answer using the provided context."
                },
                {
                    role: "user",
                    content: `Context:\n${context}\n\nQuestion:${message}`
                }
            ]
        });

        res.json({
            reply: completion.choices[0].message.content
        });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Something went wrong. Please check the backend logs." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});