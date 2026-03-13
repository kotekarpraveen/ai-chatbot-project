import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import dotenv from "dotenv";

dotenv.config();

const embeddings = new OpenAIEmbeddings();
const vectorStore = new MemoryVectorStore(embeddings);

console.log("addTexts:", typeof vectorStore.addTexts);
console.log("addDocuments:", typeof vectorStore.addDocuments);
console.log("similaritySearch:", typeof vectorStore.similaritySearch);
