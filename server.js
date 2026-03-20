require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenAI } = require('@google/genai');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '')));

// Multer for file uploads (store in memory for immediate processing)
const upload = multer({ storage: multer.memoryStorage() });

// In-memory "database" to hold extracted texts, pre-loaded for demo
const notesDB = [
    {
        id: 1, 
        title: "Quantum Mechanics - Wave Functions",
        text: "Quantum mechanics is a fundamental theory in physics. The wave function, represented by the Greek letter psi (Ψ), describes the quantum state of an isolated system. The Schrödinger equation governs the time evolution of the wave function. The probability of finding a particle at a given point is proportional to the square of the absolute value of its wave function. Erwin Schrödinger formulated this wave equation in 1925."
    },
    {
        id: 2, 
        title: "Organic Chemistry Reactions",
        text: "Organic chemistry focuses on carbon compounds. Nucleophilic substitution reactions are common. In an SN1 reaction, the rate-determining step is unimolecular, involving the formation of a carbocation intermediate. In an SN2 reaction, the reaction is biomolecular with simultaneous bond-making and bond-breaking, resulting in inversion of stereochemistry. Essential elements for SN2 include a good nucleophile, a good leaving group, and a less sterically hindered substrate."
    },
    {
        id: 3, 
        title: "Data Structures - Trees & Graphs",
        text: "In computer science, a tree is a widely used abstract data type that simulates a hierarchical tree structure, with a root value and subtrees of children with a parent node. A Binary Search Tree (BST) is a node-based binary tree data structure where the left subtree contains only nodes with keys lesser than the node's key, and the right subtree contains greater keys. A graph is a non-linear data structure consisting of nodes (vertices) and edges. Graphs can be directed or undirected, and are often traversed using Breadth-First Search (BFS) or Depth-First Search (DFS)."
    }
];

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Ensure API key exists
app.use((req, res, next) => {
    if (req.path.startsWith('/api/') && !ai) {
        return res.status(500).json({ error: "Gemini API key is not configured in .env file." });
    }
    next();
});

// Endpoint: Upload and Summarize PDF
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const fileName = req.file.originalname;
        const fileExt = fileName.split('.').pop().toUpperCase();
        
        let extractedText = '';

        if (fileExt === 'PDF') {
            const data = await pdfParse(req.file.buffer);
            extractedText = data.text;
        } else if (fileExt === 'TXT') {
            extractedText = req.file.buffer.toString('utf-8');
        } else if (fileExt === 'DOCX') {
            const data = await mammoth.extractRawText({ buffer: req.file.buffer });
            extractedText = data.value;
        } else {
            return res.status(400).json({ error: 'Currently only PDF, TXT, and DOCX files are supported.' });
        }

        // Limit text length to avoid token limits if necessary, though Gemini handles large contexts
        const contextText = extractedText.substring(0, 30000); // Send first ~30k chars for fast summary

        const prompt = `
You are NoteGenie, an AI study assistant.
Analyze this document text and provide a JSON response summarizing it.
The document text is:
${contextText}

Respond ONLY with valid JSON in this exact structure:
{
  "title": "A short, readable title based on the content",
  "topic": "The broad academic subject (e.g. Physics, Computer Science, Biology, etc)",
  "summary": "A 2-3 sentence engaging summary of the key concepts covered."
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const aiData = JSON.parse(response.text);

        const newNote = {
            id: notesDB.length + 1,
            title: aiData.title || fileName.replace(/\.[^.]+$/, ''),
            topic: aiData.topic || 'Uncategorized',
            type: fileExt,
            size: (req.file.size / (1024 * 1024)).toFixed(1) + ' MB',
            date: 'Just now',
            icon: fileExt === 'PDF' ? '📄' : '📝',
            color: '#7C3AED', 
            lastRevised: 0,
            starred: false,
            summary: aiData.summary,
            fullText: extractedText // STORE for chat context
        };

        notesDB.push({ id: newNote.id, text: extractedText, title: newNote.title });

        res.json(newNote);

    } catch (error) {
        console.error("Upload error details:", error);
        res.status(500).json({ error: 'AI Error: ' + (error.message || String(error)) });
    }
});

// Endpoint: Chat with Notes
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history, sourceIds } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        // Filter notes by selected sourceIds if provided
        let filteredNotes = notesDB;
        if (sourceIds && Array.isArray(sourceIds) && sourceIds.length > 0) {
            filteredNotes = notesDB.filter(n => sourceIds.includes(n.id));
        }

        // Combine all note texts into a context knowledge base
        let knowledgeBase = filteredNotes.map(n => `--- Document: ${n.title} ---\n${n.text.substring(0, 10000)}...`).join('\n\n');

        if (!knowledgeBase) {
            knowledgeBase = "The user hasn't uploaded any documents yet.";
        }

        const systemPrompt = `
You are NoteGenie, an AI study assistant.

First, try to answer the user's question using ONLY the provided knowledge base below.
If the required information is in the knowledge base, provide the answer and quote concepts directly if useful.

If the user asks for information THAT IS NOT in the knowledge base, you MUST STILL ANSWER their question using your general knowledge. However, if you do this, you MUST explicitly start your answer with a disclaimer like: "This information is not in your uploaded notes, but here is the answer: " (or something similar in your own friendly words).

Be concise, helpful, and format your response beautifully with markdown.

KNOWLEDGE BASE:
${knowledgeBase}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                // simplified history injection 
                { role: 'user', parts: [{ text: message }] }
            ]
        });

        res.json({ answer: response.text });

    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: 'Chat AI Error: ' + (error.message || String(error)) });
    }
});

// Endpoint to get all notes (mocking out the hardcoded ones if needed)
app.get('/api/notes', (req, res) => {
    res.json(notesDB);
});

app.listen(port, () => {
    console.log(`🧞 NoteGenie Server running at http://localhost:${port}`);
    if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️  WARNING: GEMINI_API_KEY is not set in .env file. AI features will fail.');
    }
});
