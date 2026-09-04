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

// Fetch active Groq models directly from API key
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
    console.warn("Failed to dynamically fetch active models from Groq:", err);
  }
  return ["gemma2-9b-it", "llama-3.2-3b-preview", "llama-3.1-8b-instant"];
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessageObj = messages[messages.length - 1];
    const userQuery = latestMessageObj.content.trim();
    const queryLower = userQuery.toLowerCase();
    const dataset = loadDataset();

    // Context Preparation
    const sortedOverruns = [...dataset].sort((a, b) => b.cost_overrun_cr - a.cost_overrun_cr);
    const topOverrunsContext = sortedOverruns.slice(0, 15).map((p, i) => 
      `${i+1}. ${p.project_name} | State: ${p.State} | OrigCost: ₹${p.original_cost_cr}Cr | AntCost: ₹${p.anticipated_cost_cr}Cr | CostOverrun: ₹${p.cost_overrun_cr}Cr | Progress: ${p.physical_progress_pct}%`
    ).join('\n');

    const queryKeywords = queryLower.split(' ').filter((w: string) => w.length > 2);
    const matchedProjects = dataset.filter(p => 
      queryKeywords.some((kw: string) => 
        p.project_name.toLowerCase().includes(kw) || 
        p.State.toLowerCase().includes(kw)
      )
    ).slice(0, 15);

    const matchedContext = matchedProjects.map((p, i) => 
      `${i+1}. ${p.project_name} | State: ${p.State} | OrigCost: ₹${p.original_cost_cr}Cr | AntCost: ₹${p.anticipated_cost_cr}Cr | CostOverrun: ₹${p.cost_overrun_cr}Cr | Progress: ${p.physical_progress_pct}%`
    ).join('\n');

    const systemPrompt = `You are PAIMANA AI, an official infrastructure monitoring assistant for MoSPI (Ministry of Statistics and Programme Implementation, Govt of India).

CORE MANDATE & RULES:
1. You answer queries strictly related to Central Sector Infrastructure projects, cost overruns, delays, state allocations, and dataset statistics.
2. If asked anything irrelevant (movies, coding, general trivia), REFUSE directly.
3. Always analyze the provided dataset below and give COMPLETE, clear, structured responses with numbers and project names.

TOP COST OVERRUN PROJECTS IN MOSPI DATABASE:
${topOverrunsContext}

MATCHED DATASET CONTEXT FOR QUERY:
${matchedContext || "No direct string match found, rely on overall database summary above."}`;

    const groqApiKey = process.env.GROQ_API_KEY;

    // 1. DYNAMIC GROQ LLM CALL
    if (groqApiKey) {
      const recentMessages = messages.slice(-6).map((m: any) => ({
        role: m.role === 'ai' || m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      // Fetch live available models for your API key
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
              max_tokens: 1500
            })
          });

          if (!groqRes.ok) {
            continue;
          }

          const groqData = await groqRes.json();
          if (groqData?.choices?.[0]?.message?.content) {
            return NextResponse.json({ reply: groqData.choices[0].message.content });
          }
        } catch (e) {
          console.warn(`Execution failed for model ${model}, moving to next...`);
        }
      }
    }

    // 2. LOCAL ANALYTICAL ENGINE FALLBACK (If Groq API completely fails)
    if (queryLower.includes("overrun") || queryLower.includes("exceed") || queryLower.includes("delay") || queryLower.includes("cost")) {
      const top5 = sortedOverruns.slice(0, 5);
      const listStr = top5.map((p, idx) => 
        `**${idx + 1}. ${p.project_name}**\n   - **State:** ${p.State}\n   - **Original Cost:** ₹${p.original_cost_cr.toLocaleString('en-IN')} Cr\n   - **Anticipated Cost:** ₹${p.anticipated_cost_cr.toLocaleString('en-IN')} Cr\n   - **Cost Overrun:** 🚨 **₹${p.cost_overrun_cr.toLocaleString('en-IN')} Cr**\n   - **Progress:** ${p.physical_progress_pct}%`
      ).join('\n\n');

      return NextResponse.json({ 
        reply: `Based on the MoSPI PAIMANA database, here are the top 5 central sector infrastructure projects with the **highest cost overruns**:\n\n${listStr}` 
      });
    }

    if (matchedProjects.length > 0) {
      const top3 = matchedProjects.slice(0, 3);
      const projectList = top3.map((p, idx) => 
        `**${idx + 1}. ${p.project_name}**\n   - **State:** ${p.State}\n   - **Anticipated Cost:** ₹${p.anticipated_cost_cr.toLocaleString('en-IN')} Cr\n   - **Progress:** ${p.physical_progress_pct}%`
      ).join('\n\n');

      return NextResponse.json({ 
        reply: `Found **${matchedProjects.length}** matching project(s) in the MoSPI database for "${userQuery}":\n\n${projectList}` 
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