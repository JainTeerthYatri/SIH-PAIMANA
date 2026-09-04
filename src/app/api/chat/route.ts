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

// Load and parse CSV dataset
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

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessageObj = messages[messages.length - 1];
    const userQuery = latestMessageObj.content.trim();
    const dataset = loadDataset();

    // Generate Top Overruns Summary Context for Groq LLM
    const sortedOverruns = [...dataset].sort((a, b) => b.cost_overrun_cr - a.cost_overrun_cr);
    const topOverrunsContext = sortedOverruns.slice(0, 15).map(p => 
      `- Project: ${p.project_name} | State: ${p.State} | OrigCost: ₹${p.original_cost_cr}Cr | AntCost: ₹${p.anticipated_cost_cr}Cr | Overrun: ₹${p.cost_overrun_cr}Cr | Progress: ${p.physical_progress_pct}%`
    ).join('\n');

    // Filter relevant projects matching user query keywords for targeted LLM context
    const queryKeywords = userQuery.toLowerCase().split(' ').filter((w: string) => w.length > 2);
    const matchedProjects = dataset.filter(p => 
      queryKeywords.some((kw: string) => 
        p.project_name.toLowerCase().includes(kw) || 
        p.State.toLowerCase().includes(kw)
      )
    ).slice(0, 15);

    const matchedContext = matchedProjects.map(p => 
      `- Project: ${p.project_name} | State: ${p.State} | OrigCost: ₹${p.original_cost_cr}Cr | AntCost: ₹${p.anticipated_cost_cr}Cr | Overrun: ₹${p.cost_overrun_cr}Cr | Progress: ${p.physical_progress_pct}%`
    ).join('\n');

    // System Prompt for Strict Guardrails & MoSPI Infrastructure Identity
    const systemPrompt = `You are PAIMANA AI, an official infrastructure monitoring assistant for MoSPI (Ministry of Statistics and Programme Implementation, Govt of India).

STRICT GUARDRAIL RULES:
1. You ONLY answer queries related to central sector infrastructure projects, state-wise progress, cost overruns, and dataset analytics.
2. If a user asks about general knowledge, coding, weather, entertainment, or anything off-topic, politely refuse: "I am the PAIMANA Infrastructure Assistant. I can only answer queries related to central sector infrastructure projects and dataset analytics."
3. Always provide analytical, concise, and structured answers using markdown lists or bold headers.

TOP COST OVERRUN PROJECTS IN DATABASE:
${topOverrunsContext}

MATCHED PROJECTS FOR USER QUERY:
${matchedContext.length > 0 ? matchedContext : "No direct keyword match found in sample index, use dataset intelligence."}`;

    // 1. GROQ API CALL
    const groqApiKey = process.env.GROQ_API_KEY;

    if (groqApiKey) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.map((m: any) => ({
                role: m.role === 'ai' || m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content
              }))
            ],
            temperature: 0.2,
            max_tokens: 800
          })
        });

        const groqData = await groqRes.json();
        if (groqData?.choices?.[0]?.message?.content) {
          return NextResponse.json({ reply: groqData.choices[0].message.content });
        }
      } catch (err) {
        console.warn("Groq API call failed, falling back to local engine:", err);
      }
    }

    // 2. LOCAL ENGINE FALLBACK (If Groq API key is missing or fails)
    const queryLower = userQuery.toLowerCase();
    let reply = "";

    if (queryLower.includes("overrun") || queryLower.includes("exceed") || queryLower.includes("delay")) {
      const top5 = sortedOverruns.slice(0, 5);
      const listStr = top5.map((p, idx) => 
        `**${idx + 1}. ${p.project_name}**\n   - **State:** ${p.State}\n   - **Original Cost:** ₹${p.original_cost_cr.toLocaleString('en-IN')} Cr\n   - **Anticipated Cost:** ₹${p.anticipated_cost_cr.toLocaleString('en-IN')} Cr\n   - **Cost Overrun:** 🚨 **₹${p.cost_overrun_cr.toLocaleString('en-IN')} Cr**\n   - **Progress:** ${p.physical_progress_pct}%`
      ).join('\n\n');

      reply = `Based on the MoSPI PAIMANA database, here are the top 5 central sector infrastructure projects with the highest cost overruns:\n\n${listStr}`;
    } else if (matchedProjects.length > 0) {
      const top3 = matchedProjects.slice(0, 3);
      const projectList = top3.map((p, idx) => 
        `**${idx + 1}. ${p.project_name}**\n   - **State:** ${p.State}\n   - **Anticipated Cost:** ₹${p.anticipated_cost_cr.toLocaleString('en-IN')} Cr\n   - **Progress:** ${p.physical_progress_pct}%`
      ).join('\n\n');

      reply = `Found **${matchedProjects.length}** matching project(s) in the database:\n\n${projectList}`;
    } else {
      reply = "I am the PAIMANA Infrastructure Assistant. I can only answer queries related to central sector infrastructure projects, state progress, and cost overruns.";
    }

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}