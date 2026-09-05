import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. SUPABASE CLIENT INITIALIZATION
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface ProjectRow {
  project_name: string;
  State: string;
  original_cost_cr: number;
  anticipated_cost_cr: number;
  cumulative_exp_cr: number;
  physical_progress_pct: number;
  cost_overrun_cr: number;
  completion_month?: string;
  completion_year?: number;
}

// Helper: Dynamic Groq Active Models Fetching
async function getActiveGroqModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.data) && data.data.length > 0) {
        return data.data.map((m: { id: string }) => m.id);
      }
    }
  } catch (err) {
    console.warn("Failed to fetch Groq active models, using default fallbacks:", err);
  }
  return ["llama-3.1-8b-instant", "gemma2-9b-it"];
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessageObj = messages[messages.length - 1];
    const userQuery = latestMessageObj.content.trim();
    const queryLower = userQuery.toLowerCase();

    // 2. STOP-WORDS FILTERING
    const STOP_WORDS = new Set([
      "show", "projects", "project", "list", "give", "tell", "details", "status", 
      "about", "what", "which", "where", "have", "with", "from", "for", "state", 
      "states", "major", "cost", "overrun", "overruns", "delay", "delays", "in", "the", "of", "and"
    ]);

    const rawWords = queryLower.replace(/[^\w\s]/gi, '').split(/\s+/);
    const searchKeywords = rawWords.filter((w: string) => w.length > 2 && !STOP_WORDS.has(w));

    let matchedProjects: ProjectRow[] = [];
    let totalMatchCount = 0;

    // 3. DIRECT QUERY TO SUPABASE DATABASE WITH EXACT COUNT
    if (searchKeywords.length > 0) {
      const orConditions = searchKeywords.map((kw: string) => `State.ilike.%${kw}%,project_name.ilike.%${kw}%`).join(',');
      
      const { data, count, error } = await supabase
        .from('paimana_projects')
        .select('*', { count: 'exact' })
        .or(orConditions)
        .order('cost_overrun_cr', { ascending: false })
        .limit(10);

      if (!error && data) {
        matchedProjects = data as ProjectRow[];
        totalMatchCount = count || matchedProjects.length;
      } else if (error) {
        console.error("Supabase Query Error:", error);
      }
    }

    // 4. FETCH TOP OVERRUNS FROM SUPABASE AS FALLBACK CONTEXT
    const { data: topOverrunsData } = await supabase
      .from('paimana_projects')
      .select('*')
      .order('cost_overrun_cr', { ascending: false })
      .limit(8);

    const contextProjects = matchedProjects.length > 0 ? matchedProjects : (topOverrunsData || []);

    const matchedContext = contextProjects.map((p: ProjectRow, i: number) => 
      `${i+1}. ${p.project_name} | State: ${p.State} | OrigCost: ₹${p.original_cost_cr || 0}Cr | AntCost: ₹${p.anticipated_cost_cr || 0}Cr | Overrun: ₹${p.cost_overrun_cr || 0}Cr | Progress: ${p.physical_progress_pct || 0}%`
    ).join('\n');

    const systemPrompt = `You are PAIMANA AI, an official infrastructure monitoring assistant for MoSPI (Ministry of Statistics and Programme Implementation, Govt of India).

CORE MANDATE & RULES:
1. Answer queries strictly related to Central Sector Infrastructure projects, cost overruns, delays, state allocations, and dataset statistics.
2. Rely strictly on the Supabase database snapshot provided below.
3. CRITICAL: Always explicitly state the TOTAL count of matching projects found in the database (e.g., "There are 56 projects in Assam in the MoSPI database..."), and then present/detail the top key projects provided in the context below.
4. Provide complete, structured, human-readable responses with concrete numbers and project names.

TOTAL MATCHING PROJECTS IN SUPABASE DATABASE: ${totalMatchCount > 0 ? totalMatchCount : matchedProjects.length}

TOP MATCHED PROJECTS CONTEXT:
${matchedContext || "No direct matches found in database."}`;

    const groqApiKey = process.env.GROQ_API_KEY;

    // 5. GROQ AI EXECUTION
    if (groqApiKey) {
      const recentMessages = messages.slice(-4).map((m: { role: string; content: string }) => ({
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
          console.warn(`Model ${model} failed, attempting next available model...`);
        }
      }
    }

    // 6. LOCAL DIRECT FORMATTED RESPONSE (Fallback)
    if (matchedProjects.length > 0) {
      const projectList = matchedProjects.slice(0, 10).map((p: ProjectRow, idx: number) => 
        `**${idx + 1}. ${p.project_name}**\n   - **State:** ${p.State}\n   - **Anticipated Cost:** ₹${(p.anticipated_cost_cr || 0).toLocaleString('en-IN')} Cr\n   - **Cost Overrun:** ₹${(p.cost_overrun_cr || 0).toLocaleString('en-IN')} Cr\n   - **Progress:** ${p.physical_progress_pct || 0}%`
      ).join('\n\n');

      return NextResponse.json({ 
        reply: `There are **${totalMatchCount}** project(s) matching your query in the Supabase database. Here are the top major projects:\n\n${projectList}` 
      });
    }

    return NextResponse.json({ 
      reply: "I am the PAIMANA Infrastructure Assistant. I can only answer queries related to central sector infrastructure projects, state progress, and cost overruns." 
    });

  } catch (error: unknown) {
    console.error("Server API Route Error:", error);
    return NextResponse.json({ 
      reply: "Internal server processing error. Please check Supabase configuration and try again." 
    }, { status: 500 });
  }
}