import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET(request: Request) {
  try {
    const { data: projects, error } = await supabase
      .from('paimana_projects')
      .select('*')
      .limit(15);

    if (error) throw error;
    if (!projects || projects.length === 0) {
      return NextResponse.json({ success: true, analysis: [] });
    }

    const prompt = `
      You are an elite Infrastructure Audit AI and Risk Analysis Expert. 
      Analyze the following government infrastructure projects dataset and perform deep predictive anomaly detection.
      
      Projects Data:
      ${JSON.stringify(projects, null, 2)}

      For EACH project, evaluate:
      1. riskLevel ('HIGH', 'MEDIUM', 'LOW')
      2. riskScore (0 to 100 integer based on cost overruns and lagging physical progress)
      3. estimatedDelayMonths (string like "12 Months" or "On Track")
      4. costOverrun (anticipatedCost - originalCost, if anticipated is missing use estimated logic)
      5. anomalies (An array of 2-3 precise, granular AI-generated audit findings/warnings based on the financial and physical progress discrepancy).

      You MUST respond ONLY with a valid JSON array of objects with this exact structure:
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
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const aiText = response.text;
    const aiAnalysisResult = JSON.parse(aiText || '[]');

    return NextResponse.json({
      success: true,
      analysis: aiAnalysisResult,
      source: 'Gemini AI Neural Audit Engine'
    });

  } catch (err: any) {
    console.error('AI Analysis Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate AI insights' },
      { status: 500 }
    );
  }
}