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

  // 1. Primary Attempt: Gemini Flash API
  try {
    console.log('🤖 Attempting primary processing with Gemini Flash...');
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    const res = await model.generateContent(prompt);
    const text = res.response.text().replace(/```json|```/g, '').trim();
    aiResults = JSON.parse(text);
    providerUsed = 'gemini-flash';
  } catch (geminiErr: any) {
    console.warn('🔴 Gemini API Failed! Status: Redirecting to Groq AI...', geminiErr.message || geminiErr);
    
    // 2. Secondary Attempt: Groq AI
    try {
      const groqKey = process.env.GROQ_ANALYTICS_API_KEY;
      if (groqKey) {
        console.log('🔄 Redirecting request to Groq AI...');
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
          providerUsed = 'groq-llama-3.3 (Redirected from Gemini)';
        } else {
          console.error('🔴 Groq AI returned empty response:', data);
        }
      } else {
        console.error('🔴 GROQ_ANALYTICS_API_KEY missing in environment variables.');
      }
    } catch (groqErr: any) {
      console.error('🔴 Groq AI failed as well:', groqErr.message || groqErr);
    }
  }

  // Database me save sirf tabhi hoga jab kisi AI ne response diya ho
  if (aiResults.length > 0) {
    const upsertPayload = aiResults.map((item: any) => ({
      project_name: item.projectName,
      risk_level: item.riskLevel || 'MEDIUM',
      risk_score: item.riskScore || 50,
      anomalies: item.anomalies || ["Operational timeline under review"],
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
          physicalProgress: p.physical_progress_pct
        });
      }
    });

    if (unanalyzedList.length > 0) {
      await analyzeUnprocessedProjects(unanalyzedList.slice(0, 5));
      
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
        
        // Status Messaging
        estimatedDelayMonths: analytics?.estimated_delay_months || "Unanalyzed",
        riskLevel: analytics?.risk_level || "PENDING_AI",
        riskScore: analytics?.risk_score ?? 0,
        anomalies: analytics?.anomalies || [
          "⚠️ Gemini failed -> Redirected to Groq AI -> Both AI failed. Ready for Mathematical Fallback."
        ],
        aiProvider: analytics?.ai_provider || "AI_FAILED_PENDING_MATH_FALLBACK"
      };
    });

    const nextOffset = offset + (rawProjects?.length || 0);
    const totalCount = count || 819;

    return NextResponse.json({
      success: true,
      analysis: formatted,
      total: totalCount,
      nextOffset: nextOffset,
      hasMore: nextOffset < totalCount
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}