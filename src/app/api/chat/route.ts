import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Load and parse CSV dataset dynamically
function searchDataset(query: string) {
  try {
    const filePath = path.join(process.cwd(), 'clean_paimana_data.csv');
    if (!fs.existsSync(filePath)) return "Dataset file not found.";
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const results = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
      });
      
      // Match query against project_name or State
      const pName = (row['project_name'] || '').toLowerCase();
      const pState = (row['State'] || '').toLowerCase();
      
      if (pName.includes(query) || pState.includes(query)) {
        results.push(row);
      }
    }
    return results;
  } catch (e) {
    console.error("Search Error:", e);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessageObj = messages[messages.length - 1];
    const latestMessage = latestMessageObj.content.toLowerCase().trim();

    let reply = "";

    if (latestMessage.includes("hello") || latestMessage.includes("hi") || latestMessage.includes("namaste")) {
      reply = "Namaste! I am your PAIMANA AI Assistant. Ask me about any central sector infrastructure project, cost overrun, or state-wise progress from our database.";
    } else {
      const matches = searchDataset(latestMessage);
      
      if (Array.isArray(matches) && matches.length > 0) {
        // Return top 2 matching projects dynamically
        const topMatches = matches.slice(0, 2).map((p: any, idx: number) => 
          `\n\n${idx + 1}. **${p.project_name}**\n- **State:** ${p.State}\n- **Original Cost:** ₹${p.original_cost_cr} Cr\n- **Anticipated Cost:** ₹${p.anticipated_cost_cr} Cr\n- **Physical Progress:** ${p.physical_progress_pct}%`
        ).join('');
        
        reply = `Found ${matches.length} matching project(s) in the MoSPI database:${topMatches}`;
      } else if (
        latestMessage.includes("project") || 
        latestMessage.includes("cost") || 
        latestMessage.includes("state") || 
        latestMessage.includes("progress") ||
        latestMessage.includes("overrun")
      ) {
        reply = "I am connected to the PAIMANA database tracking 800+ central sector projects. Please provide a specific keyword, state name (e.g., Assam, Delhi), or project title to get exact details.";
      } else {
        // Strict Guardrail
        reply = "I am the PAIMANA Infrastructure Monitoring Assistant. I can only answer queries related to central sector infrastructure projects, state progress, and dataset analytics.";
      }
    }

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}