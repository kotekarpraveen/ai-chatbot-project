# AI Chatbot with PDF Document RAG

A powerful AI Chatbot built with Node.js, Express, React, and LangChain that uses Retrieval-Augmented Generation (RAG) to answer questions based on your local PDF documents.

## Features
- **Local PDF Indexing**: Efficiently parses and indexes PDFs from a local directory.
- **RAG Capability**: Uses OpenAI Embeddings and `MemoryVectorStore` to retrieve relevant context for every query.
- **Persistent Storage**: Saves indexed vector data locally to avoid re-processing documents on every startup.
- **Clean UI**: Minimalist React frontend for seamless interaction.

## Project Structure
- `backend/`: Node.js server and document processing logic.
- `ui/`: React frontend application.

## Getting Started

### Prerequisites
- Node.js (v20+)
- OpenAI API Key

### Installation

1. Clone the repository (once you've pushed it to GitHub).
2. Install dependencies for both backend and frontend:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../ui
   npm install
   ```

3. Configure your Environment:
   Create a `.env` file in the `backend/` directory:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

### Usage

1. **Index Documents**:
   Place your PDFs in `backend/documents/` and run:
   ```bash
   node indexDocuments.js
   ```

2. **Start the Server**:
   ```bash
   node server.js
   ```

3. **Run the Frontend**:
   ```bash
   cd ui
   npm run dev
   ```

## License
MIT
