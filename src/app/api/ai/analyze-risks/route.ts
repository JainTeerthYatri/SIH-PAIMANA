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

    const { count, error: countErr } = await supabase
      .from('paimana_projects')
      .select('*', { count: 'exact', head: true });

    if (countErr) {
      return NextResponse.json({ success: false, error: `Supabase Count Error: ${countErr.message}` }, { status: 500 });
    }

    const totalCount = count || 819;

    const { data: rawProjects, error: dbError } = await supabase
      .from('paimana_projects')
      .select('*')
      .range(offset, offset + limit - 1);

    if (dbError || !rawProjects || rawProjects.length === 0) {
      return NextResponse.json({ success: false, error: `Supabase DB Error: ${dbError?.message || 'No data found'}` }, { status: 500 });
    }

    const projects = rawProjects.map((p: any) => ({
      projectName: p.project_name || p.name || 'Unnamed Project',
      state: p.State || p.state || 'National',
      originalCost: Number(p.original_cost_cr || p.original_cost || 100),
      anticipatedCost: Number(p.anticipated_cost_cr || p.anticipated_cost || 120),
      cumulativeExp: Number(p.cumulative_exp_cr || p.cumulative_exp || 50),
      physicalProgress: Number(p.physical_progress_pct || p.physical_progress || 45),
    }));

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Analyze these infrastructure projects and return a strict JSON array containing the analysis for each:
      ${JSON.stringify(projects, null, 2)}

      Required JSON Schema per item in array:
      {
        "projectName": "string",
        "state": "string",
        "originalCost": number,
        "anticipatedCost": number,
        "cumulativeExp": number,
        "physicalProgress": number,
        "costOverrun": number,
        "estimatedDelayMonths": "string",
        "riskLevel": "HIGH" | "MEDIUM" | "LOW",
        "riskScore": number,
        "anomalies": ["string", "string"]
      }

      CRITICAL: Return ONLY a valid JSON array starting with [ and ending with ]. Do not use markdown backticks.
    `;

    // Updated to the current gemini-3.5-flash model
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const aiText = response.text || '';
    const cleanedText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBracket = cleanedText.indexOf('[');
    const lastBracket = cleanedText.lastIndexOf(']');

    if (firstBracket === -1 || lastBracket === -1) {
      return NextResponse.json({ success: false, error: `AI returned invalid non-JSON output: ${aiText.substring(0, 100)}` }, { status: 500 });
    }

    const aiAnalysisResult = JSON.parse(cleanedText.substring(firstBracket, lastBracket + 1));
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
    console.error('Detailed API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}