import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import fs from "fs";

dotenv.config();

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
if (fs.existsSync(dataPath)) {
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    vectorStore.memoryVectors = data;
    console.log("Vector store loaded from disk.");
} else {
    console.log("No vector store found. Please run indexDocuments.js first.");
}

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