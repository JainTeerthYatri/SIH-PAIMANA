import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; // Set maximum execution time for Vercel
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. Collect 5 Gemini Keys into Pool
const GEMINI_KEYS = Array.from(
  new Set(
    [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
    ].filter(Boolean)
  )
) as string[];

// 2. ONLY Groq Analytics Key (Ignoring main GROQ_API_KEY reserved for chatbot)
const GROQ_ANALYTICS_KEY = process.env.GROQ_ANALYTICS_API_KEY;

let currentGeminiIndex = 0;

async function analyzeChunk(projects: any[]) {
  if (!projects || projects.length === 0) return [];

  const prompt = `
Analyze these infrastructure projects and determine risk metrics:
${JSON.stringify(projects)}

Return ONLY a valid JSON array without markdown codeblocks:
[
  {
    "projectName": "Exact Project Name",
    "riskLevel": "HIGH" | "MEDIUM" | "LOW",
    "riskScore": number (0-100),
    "estimatedDelayMonths": "X Months",
    "anomalies": ["Key Issue 1", "Key Issue 2"]
  }
]`;

  let aiResults: any[] = [];
  let providerUsed = '';

  // 1. Attempt Gemini Pool
  for (let attempt = 0; attempt < GEMINI_KEYS.length; attempt++) {
    const keyIdx = (currentGeminiIndex + attempt) % GEMINI_KEYS.length;
    const activeKey = GEMINI_KEYS[keyIdx];
    const keyLabel = `Gemini Key #${keyIdx + 1}`;

    try {
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const res = await model.generateContent(prompt);
      const text = res.response.text().replace(/```json|```/g, '').trim();

      aiResults = JSON.parse(text);
      providerUsed = `gemini-1.5-flash (${keyLabel})`;

      currentGeminiIndex = (keyIdx + 1) % GEMINI_KEYS.length;
      break;
    } catch (err: any) {
      console.warn(`⚠️ [${keyLabel}] failed or rate-limited:`, err.message || err);
    }
  }

  // 2. Failover to GROQ_ANALYTICS_API_KEY only
  if (aiResults.length === 0 && GROQ_ANALYTICS_KEY) {
    console.warn('🔄 All Gemini keys exhausted. Falling back to GROQ_ANALYTICS_API_KEY...');

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_ANALYTICS_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You output strict JSON arrays only.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
        }),
      });

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.replace(/```json|```/g, '').trim();

      if (text) {
        aiResults = JSON.parse(text);
        providerUsed = 'groq-llama-3.3 (GROQ_ANALYTICS_API_KEY)';
      }
    } catch (groqErr: any) {
      console.error('❌ Groq Analytics Key failed:', groqErr.message || groqErr);
    }
  }

  // Upsert into database
  if (aiResults.length > 0) {
    const upsertPayload = aiResults.map((item: any) => ({
      project_name: item.projectName,
      risk_level: item.riskLevel || 'MEDIUM',
      risk_score: item.riskScore || 50,
      anomalies: item.anomalies || ['Operational timeline under review'],
      estimated_delay_months: item.estimatedDelayMonths || '3 Months',
      ai_provider: providerUsed,
      updated_at: new Date().toISOString(),
    }));

    await supabase
      .from('paimana_project_analytics')
      .upsert(upsertPayload, { onConflict: 'project_name' });
  }

  return aiResults;
}

export async function POST(request: Request) {
  try {
    // 1. Fetch raw projects
    const { data: rawProjects, error: fetchErr } = await supabase
      .from('paimana_projects')
      .select('project_name, State, original_cost_cr, anticipated_cost_cr, physical_progress_pct');

    if (fetchErr || !rawProjects) {
      return NextResponse.json({ success: false, error: fetchErr?.message || 'No projects found' }, { status: 500 });
    }

    // 2. Fetch existing analytics
    const { data: existingAnalytics } = await supabase
      .from('paimana_project_analytics')
      .select('project_name');

    const analyzedSet = new Set((existingAnalytics || []).map((a) => a.project_name));
    const pendingProjects = rawProjects.filter((p) => !analyzedSet.has(p.project_name));

    if (pendingProjects.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All projects are already analyzed!',
        total: rawProjects.length,
        analyzed: analyzedSet.size,
        processedInThisRun: 0,
      });
    }

    // 3. Process in batches of 5
    const batchSize = 5;
    let totalProcessedInRun = 0;

    for (let i = 0; i < pendingProjects.length; i += batchSize) {
      const chunk = pendingProjects.slice(i, i + batchSize);

      const formattedChunk = chunk.map((p) => ({
        projectName: p.project_name,
        state: p.State,
        originalCost: p.original_cost_cr,
        anticipatedCost: p.anticipated_cost_cr,
        physicalProgress: p.physical_progress_pct,
      }));

      const res = await analyzeChunk(formattedChunk);
      totalProcessedInRun += res.length;
    }

    return NextResponse.json({
      success: true,
      message: 'Batch processing executed successfully.',
      totalProjects: rawProjects.length,
      previouslyAnalyzed: analyzedSet.size,
      newlyProcessed: totalProcessedInRun,
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Support GET requests as well for easy triggering via browser or cron
export async function GET(request: Request) {
  return POST(request);
}