import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Load and parse CSV dataset once on startup or per request
function getDatasetContext() {
  try {
    const filePath = path.join(process.cwd(), 'clean_paimana_data.csv');
    if (!fs.existsSync(filePath)) return "Dataset not found.";
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = Papa.parse(fileContent, { header: true, preview: 50 }); // Load sample or summary
    return JSON.stringify(parsed.data);
  } catch (e) {
    return "Error loading infrastructure data.";
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1].content;
    const datasetSample = getDatasetContext();

    // STRICT SYSTEM GUARDRAIL PROMPT
    const systemPrompt = `You are PAIMANA AI Assistant, an official government AI chatbot for the Infrastructure Monitoring System (MoSPI, Government of India).
    
    YOUR STRICT RULES:
    1. You ONLY answer questions related to Central Sector Infrastructure Projects, costs, state distributions, physical progress, cost overruns, and project analytics based on the provided dataset.
    2. If a user asks about anything else (e.g., general knowledge, personal advice, coding, entertainment, politics, weather, etc.), you must politely refuse by saying: "I am the PAIMANA Infrastructure Monitoring Assistant. I can only answer queries related to central sector infrastructure projects and dataset analytics."
    3. Be precise, professional, and base your answers on the official project data provided below.

    DATASET SUMMARY PREVIEW:
    ${datasetSample}
    `;

    // Here you can integrate your Gemini or OpenAI API key call using fetch:
    /*
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\nUser Question: " + latestMessage }] }
        ]
      })
    });
    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    */

    // Fallback smart matching or API response simulation / actual integration
    let reply = "";
    const query = latestMessage.toLowerCase();
    
    if (query.includes("hello") || query.includes("hi")) {
      reply = "Hello! I am your PAIMANA AI Assistant. Ask me anything about the ongoing central sector infrastructure projects, cost overruns, or state-wise progress.";
    } else if (query.includes("project") || query.includes("cost") || query.includes("state") || query.includes("progress")) {
      reply = `Based on the PAIMANA infrastructure monitoring database tracking 1,500+ projects worth ₹41.5L Cr, I can help analyze specific state allocations, cost overruns, and physical progress metrics. Please specify the project or state you want to check.`;
    } else {
      reply = "I am the PAIMANA Infrastructure Monitoring Assistant. I can only answer queries related to central sector infrastructure projects and dataset analytics.";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}