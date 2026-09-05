import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Dual-LLM Resilient Caller (Gemini 3.7 Flash -> Groq Fallback)
async function callDualAI(prompt: string) {
  // 1. Try Primary: Gemini 3.7 Flash
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.7-flash' });
    const res = await model.generateContent(prompt);
    const text = res.response.text();
    return { text, provider: 'gemini-3.7-flash' };
  } catch (geminiErr) {
    console.warn('Gemini 3.7 Flash Limit Hit/Error, switching to Dedicated Groq Key...');
  }

  // 2. Try Secondary: Groq API with Analytics Key
  try {
    const groqKey = process.env.GROQ_ANALYTICS_API_KEY;
    if (!groqKey) throw new Error('GROQ_ANALYTICS_API_KEY missing');

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You output strict JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1
      })
    });

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response from Groq');

    return { text, provider: 'groq-llama-3.3' };
  } catch (groqErr) {
    throw new Error('Both Gemini and Groq Analytics APIs failed!');
  }
}

export async function POST(request: Request) {
  try {
    // Un-analyzed projects find karo using LEFT JOIN logic
    const { data: allProjects, error: fetchErr } = await supabase
      .from('paimana_projects')
      .select('project_name, State, original_cost_cr, anticipated_cost_cr, physical_progress_pct')
      .limit(10); // Batch of 10

    if (fetchErr || !allProjects) throw fetchErr;

    // Filter projects not in paimana_project_analytics
    const { data: existingAnalytics } = await supabase
      .from('paimana_project_analytics')
      .select('project_name');

    const processedNames = new Set(existingAnalytics?.map(a => a.project_name) || []);
    const unanalyzedBatch = allProjects.filter(p => !processedNames.has(p.project_name));

    if (unanalyzedBatch.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All projects are fully analyzed in paimana_project_analytics table!'
      });
    }

    const prompt = `
Analyze these ${unanalyzedBatch.length} infrastructure projects and perform risk evaluation.

Input Data:
${JSON.stringify(unanalyzedBatch)}

Return ONLY a valid JSON array without markdown formatting:
[
  {
    "projectName": "Exact Project Name",
    "riskLevel": "HIGH" | "MEDIUM" | "LOW",
    "riskScore": number (0-100),
    "estimatedDelayMonths": "X Months",
    "anomalies": ["Finding 1", "Finding 2"]
  }
]`;

    const { text, provider } = await callDualAI(prompt);
    const cleanedJson = text.replace(/```json|```/g, '').trim();
    const aiResults = JSON.parse(cleanedJson);

    // Write results to paimana_project_analytics table
    const upsertPayload = aiResults.map((item: any) => ({
      project_name: item.projectName,
      risk_level: item.riskLevel,
      risk_score: item.riskScore,
      anomalies: item.anomalies,
      estimated_delay_months: item.estimatedDelayMonths,
      ai_provider: provider,
      updated_at: new Date().toISOString()
    }));

    const { error: insertErr } = await supabase
      .from('paimana_project_analytics')
      .upsert(upsertPayload, { onConflict: 'project_name' });

    if (insertErr) throw insertErr;

    return NextResponse.json({
      success: true,
      processed: upsertPayload.length,
      providerUsed: provider
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}