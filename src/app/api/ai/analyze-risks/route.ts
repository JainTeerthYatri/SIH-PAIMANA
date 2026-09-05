import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Dual-AI Engine (Gemini -> Groq Fallback)
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
  let providerUsed = 'gemini';

  // 1. Try Gemini
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const res = await model.generateContent(prompt);
    const text = res.response.text().replace(/```json|```/g, '').trim();
    aiResults = JSON.parse(text);
  } catch (geminiErr) {
    console.warn('Gemini limit or error, falling back to Groq...', geminiErr);
    
    // 2. Try Groq Fallback
    try {
      const groqKey = process.env.GROQ_ANALYTICS_API_KEY;
      if (groqKey) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'You output strict JSON arrays only.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1
          })
        });
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content?.replace(/```json|```/g, '').trim();
        if (text) {
          aiResults = JSON.parse(text);
          providerUsed = 'groq';
        }
      }
    } catch (groqErr) {
      console.error('Groq fallback failed as well:', groqErr);
    }
  }

  if (aiResults.length > 0) {
    // Save generated analytics directly into `paimana_project_analytics`
    const upsertPayload = aiResults.map((item: any) => ({
      project_name: item.projectName,
      risk_level: item.riskLevel || 'MEDIUM',
      risk_score: item.riskScore || 50,
      anomalies: item.anomalies || ["Monitoring operational timeline"],
      estimated_delay_months: item.estimatedDelayMonths || "3 Months",
      ai_provider: providerUsed,
      updated_at: new Date().toISOString()
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

    // Fetch projects along with linked analytics from new table
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

    // Check which projects are missing analytics in this chunk
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
          physicalProgress: p.physical_progress_pct
        });
      }
    });

    // Auto-analyze missing projects on the fly (up to 5 per request to prevent timeout)
    if (unanalyzedList.length > 0) {
      await analyzeUnprocessedProjects(unanalyzedList.slice(0, 5));
      
      // Re-fetch updated join
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

    // Format output
    const formatted = (rawProjects || []).map((p: any, idx: number) => {
      const analytics = Array.isArray(p.paimana_project_analytics)
        ? p.paimana_project_analytics[0]
        : p.paimana_project_analytics;

      const orig = Number(p.original_cost_cr || 100);
      const anti = Number(p.anticipated_cost_cr || orig);
      const overrun = orig > 0 ? Number(((anti - orig) / orig * 100).toFixed(1)) : 0;
      const progress = Number(p.physical_progress_pct || 50);

      // Smart Fallback Logic
      const fallbackRisk = overrun > 20 || progress < 30 ? 'HIGH' : overrun > 10 || progress < 60 ? 'MEDIUM' : 'LOW';
      const fallbackScore = fallbackRisk === 'HIGH' ? 85 : fallbackRisk === 'MEDIUM' ? 55 : 25;
      
      let fallbackDelay = "1-2 Months";
      if (fallbackRisk === 'HIGH') {
        fallbackDelay = `${Math.max(8, Math.round(overrun * 0.4))} Months`;
      } else if (fallbackRisk === 'MEDIUM') {
        fallbackDelay = `${Math.max(4, Math.round(overrun * 0.3))} Months`;
      }

      return {
        projectName: p.project_name || `Project #${offset + idx + 1}`,
        state: p.State || 'N/A',
        originalCost: orig,
        anticipatedCost: anti,
        cumulativeExp: Number(p.cumulative_exp_cr || 0),
        physicalProgress: progress,
        costOverrun: overrun,
        estimatedDelayMonths: analytics?.estimated_delay_months || fallbackDelay,
        riskLevel: analytics?.risk_level || fallbackRisk,
        riskScore: analytics?.risk_score || fallbackScore,
        anomalies: analytics?.anomalies || [
          fallbackRisk === 'HIGH' ? "Significant overrun detected" : "Project progressing normally"
        ],
        aiProvider: analytics?.ai_provider || 'algorithmic-fallback'
      };
    });

    const nextOffset = offset + (rawProjects?.length || 0);
    const totalCount = count || 819;

    return NextResponse.json({
      success: true,
      analysis: formatted,
      total: totalCount,
      nextOffset: nextOffset, // Fixed: Added nextOffset back
      hasMore: nextOffset < totalCount
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}