import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface ProjectRow {
  project_name: string;
  State: string;
  original_cost_cr: number;
  anticipated_cost_cr: number;
  cumulative_exp_cr: number;
  physical_progress_pct: number;
  cost_overrun_cr: number;
}

function loadDataset(): ProjectRow[] {
  try {
    const filePath = path.join(process.cwd(), 'clean_paimana_data.csv');
    if (!fs.existsSync(filePath)) return [];
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const rows: ProjectRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
      });

      rows.push({
        project_name: row['project_name'] || 'Unknown Project',
        State: row['State'] || 'N/A',
        original_cost_cr: parseFloat(row['original_cost_cr']) || 0,
        anticipated_cost_cr: parseFloat(row['anticipated_cost_cr']) || 0,
        cumulative_exp_cr: parseFloat(row['cumulative_exp_cr']) || 0,
        physical_progress_pct: parseFloat(row['physical_progress_pct']) || 0,
        cost_overrun_cr: parseFloat(row['cost_overrun_cr']) || 0,
      });
    }
    return rows;
  } catch (e) {
    console.error("Data Load Error:", e);
    return [];
  }
}

async function getActiveGroqModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.data) && data.data.length > 0) {
        return data.data.map((m: any) => m.id);
      }
    }
  } catch (err) {
    console.warn("Failed to fetch Groq models:", err);
  }
  return ["llama-3.1-8b-instant", "gemma2-9b-it"];
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessageObj = messages[messages.length - 1];
    const userQuery = latestMessageObj.content.trim();
    const queryLower = userQuery.toLowerCase();
    const dataset = loadDataset();

    // 1. SMART KEYWORD EXTRACTION (Ignoring Common Stop Words)
    const STOP_WORDS = new Set([
      "show", "projects", "project", "list", "give", "tell", "details", "status", 
      "about", "what", "which", "where", "have", "with", "from", "for", "state", 
      "states", "major", "cost", "overrun", "overruns", "delay", "delays", "in", "the", "of", "and"
    ]);

    const rawWords = queryLower.replace(/[^\w\s]/gi, '').split(/\s+/);
    const searchKeywords = rawWords.filter((w: string) => w.length > 2 && !STOP_WORDS.has(w));

    // 2. FILTER DATASET BY SPECIFIC SEARCH KEYWORDS
    let matchedProjects: ProjectRow[] = [];

    if (searchKeywords.length > 0) {
      matchedProjects = dataset.filter(p => {
        const stateLower = p.State.toLowerCase();
        const nameLower = p.project_name.toLowerCase();
        return searchKeywords.some((kw: string) => stateLower.includes(kw) || nameLower.includes(kw));
      });
    }

    // Top Overruns context
    const sortedOverruns = [...dataset].sort((a, b) => b.cost_overrun_cr - a.cost_overrun_cr);
    
    // Select top 8 matched or fallback overruns
    const contextProjects = matchedProjects.length > 0 ? matchedProjects.slice(0, 10) : sortedOverruns.slice(0, 8);

    const matchedContext = contextProjects.map((p, i) => 
      `${i+1}. ${p.project_name} | State: ${p.State} | OrigCost: ₹${p.original_cost_cr}Cr | AntCost: ₹${p.anticipated_cost_cr}Cr | Overrun: ₹${p.cost_overrun_cr}Cr | Progress: ${p.physical_progress_pct}%`
    ).join('\n');

    const systemPrompt = `You are PAIMANA AI, an official infrastructure monitoring assistant for MoSPI (Ministry of Statistics and Programme Implementation, Govt of India).

CORE MANDATE & RULES:
1. Answer queries strictly related to Central Sector Infrastructure projects, cost overruns, delays, state allocations, and dataset statistics.
2. Rely strictly on the dataset provided below to answer the user's specific query.
3. Provide complete, structured, human-readable responses with concrete numbers and project names.

RELEVANT DATASET CONTEXT FOR USER QUERY:
${matchedContext}
`;

    const groqApiKey = process.env.GROQ_API_KEY;

    // 3. GROQ API EXECUTION
    if (groqApiKey) {
      const recentMessages = messages.slice(-4).map((m: any) => ({
        role: m.role === 'ai' || m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const modelsToTry = await getActiveGroqModels(groqApiKey);

      for (const model of modelsToTry) {
        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${groqApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: "system", content: systemPrompt },
                ...recentMessages
              ],
              temperature: 0.2,
              max_tokens: 1000
            })
          });

          if (!groqRes.ok) continue;

          const groqData = await groqRes.json();
          if (groqData?.choices?.[0]?.message?.content) {
            return NextResponse.json({ reply: groqData.choices[0].message.content });
          }
        } catch (e) {
          console.warn(`Model ${model} failed, trying next...`);
        }
      }
    }

    // 4. LOCAL FALLBACK (If Groq API fails)
    if (matchedProjects.length > 0) {
      const projectList = matchedProjects.slice(0, 5).map((p, idx) => 
        `**${idx + 1}. ${p.project_name}**\n   - **State:** ${p.State}\n   - **Anticipated Cost:** ₹${p.anticipated_cost_cr.toLocaleString('en-IN')} Cr\n   - **Cost Overrun:** ₹${p.cost_overrun_cr.toLocaleString('en-IN')} Cr\n   - **Progress:** ${p.physical_progress_pct}%`
      ).join('\n\n');

      return NextResponse.json({ 
        reply: `Found **${matchedProjects.length}** project(s) matching your query:\n\n${projectList}` 
      });
    }

    return NextResponse.json({ 
      reply: "I am the PAIMANA Infrastructure Assistant. I can only answer queries related to central sector infrastructure projects, state progress, and cost overruns." 
    });

  } catch (error: any) {
    console.error("Server API Route Error:", error);
    return NextResponse.json({ 
      reply: "Internal server processing error. Please try again." 
    }, { status: 500 });
  }
}