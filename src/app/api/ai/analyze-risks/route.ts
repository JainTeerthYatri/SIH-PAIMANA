import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'GEMINI_API_KEY is missing' }, { status: 500 });
    }

    const { count, error: countError } = await supabase
      .from('paimana_projects')
      .select('*', { count: 'exact', head: true });

    const totalCount = count || 819;

    const { data: rawProjects, error: dbError } = await supabase
      .from('paimana_projects')
      .select('*')
      .range(offset, offset + limit - 1);

    if (dbError || !rawProjects || rawProjects.length === 0) {
      return NextResponse.json({ 
        success: true, 
        analysis: [], 
        total: totalCount, 
        hasMore: false 
      });
    }

    const projects = rawProjects.map((p: any) => ({
      projectName: p.project_name || p.name || 'Unnamed Infrastructure Project',
      state: p.State || p.state || 'National',
      originalCost: Number(p.original_cost_cr || p.original_cost || 100),
      anticipatedCost: Number(p.anticipated_cost_cr || p.anticipated_cost || 120),
      cumulativeExp: Number(p.cumulative_exp_cr || p.cumulative_exp || 50),
      physicalProgress: Number(p.physical_progress_pct || p.physical_progress || 45),
    }));

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      You are an elite Infrastructure Audit AI and Risk Analysis Expert for government projects.
      Analyze the following infrastructure projects dataset chunk and perform deep predictive anomaly detection.
      
      Projects Data:
      ${JSON.stringify(projects, null, 2)}

      CRITICAL RULES:
      1. Maintain a realistic, varied portfolio distribution across HIGH, MEDIUM, and LOW risk levels.
      2. For EACH project, compute:
         - riskLevel ('HIGH', 'MEDIUM', or 'LOW')
         - riskScore (Integer 0 to 100, uniquely calculated per project)
         - estimatedDelayMonths (Unique string like "14 Months", "On Track", "6 Months Slipped")
         - costOverrun (Calculated precisely as anticipatedCost - originalCost)
         - anomalies (An array of 2 sharp, distinct audit finding statements)

      You MUST respond with a valid JSON array ONLY. Start strictly with [ and end with ]. Do not include any conversational text or markdown code blocks.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiText = response.text || '';
    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('AI response did not return a valid JSON array format.');
    }

    const aiAnalysisResult = JSON.parse(jsonMatch[0]);
    const nextOffset = offset + limit;
    const hasMore = nextOffset < totalCount;

    return NextResponse.json({
      success: true,
      analysis: aiAnalysisResult,
      total: totalCount,
      nextOffset,
      hasMore,
    });

  } catch (err: any) {
    console.error('Pure AI API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'AI execution failed' },
      { status: 500 }
    );
  }
}