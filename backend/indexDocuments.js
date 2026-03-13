import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import dotenv from "dotenv";

dotenv.config();

const docsDir = "./documents";
const saveDir = "./vector_store";

// Create vector_store directory if it doesn't exist
if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir);
}

const files = fs.readdirSync(docsDir).filter(file => file.endsWith(".pdf"));

const allChunks = [];

for (const file of files) {
    console.log(`Processing ${file}...`);
    try {
        const dataBuffer = fs.readFileSync(path.join(docsDir, file));
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        const text = data.text;

        const chunks = text.match(/.{1,1000}/g) || [];
        allChunks.push(...chunks);
    } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
    }
}

console.log(`Total chunks extracted: ${allChunks.length}`);

if (allChunks.length === 0) {
    console.log("No text found in PDFs. Exiting.");
    process.exit(0);
}

const embeddings = new OpenAIEmbeddings();

console.log("Creating vector store...");
const vectorStore = await MemoryVectorStore.fromTexts(
    allChunks,
    allChunks.map((_, i) => ({ id: i })),
    embeddings
);

// Save the vector store to disk
// note: MemoryVectorStore save/load is sometimes custom, 
// using a standard approach here for persistence
const jsonData = JSON.stringify(vectorStore.memoryVectors);
fs.writeFileSync(path.join(saveDir, "data.json"), jsonData);

console.log("Documents indexed and saved to ./vector_store!");