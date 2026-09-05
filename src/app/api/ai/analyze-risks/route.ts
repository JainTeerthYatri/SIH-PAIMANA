import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Collect all 5 Gemini keys from Vercel environment variables
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

// Collect both Groq keys for fallback
const GROQ_KEYS = Array.from(
  new Set(
    [
      process.env.GROQ_ANALYTICS_API_KEY,
      process.env.GROQ_API_KEY,
    ].filter(Boolean)
  )
) as string[];

let currentGeminiIndex = 0;

async function analyzeUnprocessedProjects(projects: any[]) {
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

  // 1. Attempt Gemini Pool (Tries every Gemini key sequentially if 429 occurs)
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

      // Rotate pointer for next incoming batch
      currentGeminiIndex = (keyIdx + 1) % GEMINI_KEYS.length;
      break; // Successfully obtained output; exit loop
    } catch (geminiErr: any) {
      console.warn(`🔴 [${keyLabel}] Failed/Limited:`, geminiErr.message || geminiErr);
    }
  }

  // 2. Failover: If all 5 Gemini keys fail, switch to Groq Key Pool
  if (aiResults.length === 0 && GROQ_KEYS.length > 0) {
    console.warn('🔴 All Gemini keys failed or rate-limited. Redirecting to Groq AI pool...');

    for (let gIdx = 0; gIdx < GROQ_KEYS.length; gIdx++) {
      const groqKey = GROQ_KEYS[gIdx];
      const groqLabel = `Groq Key #${gIdx + 1}`;

      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
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
          providerUsed = `groq-llama-3.3 (${groqLabel} - Redirected from Gemini)`;
          break;
        }
      } catch (groqErr: any) {
        console.error(`🔴 [${groqLabel}] Failed:`, groqErr.message || groqErr);
      }
    }
  }

  // Persist successful AI output directly to database
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    const { data: rawProjects, count, error } = await supabase
      .from('paimana_projects')
      .select(`
        project_name,
        State,
        original_cost_cr,
        anticipated_cost_cr,
        cumulative_exp_cr,
        physical_progress_pct,
        paimana_project_analytics (
          risk_level,
          risk_score,
          anomalies,
          estimated_delay_months,
          ai_provider
        )
      `, { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const unanalyzedList: any[] = [];
    (rawProjects || []).forEach((p: any) => {
      const analytics = Array.isArray(p.paimana_project_analytics)
        ? p.paimana_project_analytics[0]
        : p.paimana_project_analytics;

      if (!analytics) {
        unanalyzedList.push({
          projectName: p.project_name,
          state: p.State,
          originalCost: p.original_cost_cr,
          anticipatedCost: p.anticipated_cost_cr,
          physicalProgress: p.physical_progress_pct,
        });
      }
    });

    // Execute batch processing across the active key pool
    if (unanalyzedList.length > 0) {
      const batchSize = 5;
      for (let i = 0; i < unanalyzedList.length; i += batchSize) {
        const subBatch = unanalyzedList.slice(i, i + batchSize);
        await analyzeUnprocessedProjects(subBatch);
      }

      // Re-fetch updated analytics
      const { data: refreshedData } = await supabase
        .from('paimana_projects')
        .select(`
          project_name,
          State,
          original_cost_cr,
          anticipated_cost_cr,
          cumulative_exp_cr,
          physical_progress_pct,
          paimana_project_analytics (
            risk_level,
            risk_score,
            anomalies,
            estimated_delay_months,
            ai_provider
          )
        `)
        .range(offset, offset + limit - 1);

      if (refreshedData) {
        rawProjects.splice(0, rawProjects.length, ...refreshedData);
      }
    }

    const formatted = (rawProjects || []).map((p: any, idx: number) => {
      const analytics = Array.isArray(p.paimana_project_analytics)
        ? p.paimana_project_analytics[0]
        : p.paimana_project_analytics;

      const orig = Number(p.original_cost_cr || 0);
      const anti = Number(p.anticipated_cost_cr || 0);
      const overrun = orig > 0 ? Number(((anti - orig) / orig * 100).toFixed(1)) : 0;

      return {
        projectName: p.project_name || `Project #${offset + idx + 1}`,
        state: p.State || 'N/A',
        originalCost: orig,
        anticipatedCost: anti,
        cumulativeExp: Number(p.cumulative_exp_cr || 0),
        physicalProgress: Number(p.physical_progress_pct || 0),
        costOverrun: overrun,

        estimatedDelayMonths: analytics?.estimated_delay_months || 'Unanalyzed',
        riskLevel: analytics?.risk_level || 'PENDING_AI',
        riskScore: analytics?.risk_score ?? 0,
        anomalies: analytics?.anomalies || [
          '⚠️ All 5 Gemini keys failed -> Redirected to Groq pool -> Both AI failed. Ready for Mathematical Fallback.',
        ],
        aiProvider: analytics?.ai_provider || 'AI_FAILED_PENDING_MATH_FALLBACK',
      };
    });

    const nextOffset = offset + (rawProjects?.length || 0);
    const totalCount = count || 819;

    return NextResponse.json({
      success: true,
      analysis: formatted,
      total: totalCount,
      nextOffset: nextOffset,
      hasMore: nextOffset < totalCount,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}