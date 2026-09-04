import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing in environment variables.');
    }

    // 1. Fetch all records from Supabase
    const { data: rawProjects, error: dbError } = await supabase
      .from('paimana_projects')
      .select('*');

    if (dbError) throw dbError;
    if (!rawProjects || rawProjects.length === 0) {
      return NextResponse.json({ success: true, analysis: [] });
    }

    // 2. Map exact database schema columns
    const projects = rawProjects.map((p: any) => ({
      projectName: p.project_name || 'Unnamed Project',
      state: p.State || 'National',
      originalCost: p.original_cost_cr || 0,
      anticipatedCost: p.anticipated_cost_cr || 0,
      cumulativeExp: p.cumulative_exp_cr || 0,
      physicalProgress: p.physical_progress_pct || 0,
    }));

    // 3. 100% Pure Gemini AI Execution
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an elite Infrastructure Audit AI and Risk Analysis Expert for government projects.
      Analyze the following infrastructure projects dataset and perform deep predictive anomaly detection.
      
      Projects Data:
      ${JSON.stringify(projects, null, 2)}

      CRITICAL RULES:
      1. Maintain a realistic, balanced portfolio distribution across HIGH, MEDIUM, and LOW risk levels.
      2. For EACH project, compute:
         - riskLevel ('HIGH', 'MEDIUM', or 'LOW')
         - riskScore (Integer 0 to 100)
         - estimatedDelayMonths (string like "12 Months" or "On Track")
         - costOverrun (Calculated precisely as anticipatedCost - originalCost)
         - anomalies (An array of 2 precise AI audit finding statements)

      You MUST respond with a valid JSON array ONLY. Do NOT wrap the JSON in markdown code blocks like \`\`\`json. Return raw JSON string starting with [ and ending with ].
      
      [
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
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    let aiText = response.text || '[]';
    aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const aiAnalysisResult = JSON.parse(aiText);

    return NextResponse.json({
      success: true,
      analysis: aiAnalysisResult,
    });

  } catch (err: any) {
    console.error('100% Pure AI Audit Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'AI processing failed' },
      { status: 500 }
    );
  }
}