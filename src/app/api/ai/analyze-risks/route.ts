import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

// Initialize Supabase Admin (Bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Gemini AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET(request: Request) {
  try {
    // 1. Fetch raw projects from Supabase database
    const { data: rawProjects, error } = await supabase
      .from('paimana_projects')
      .select('*')
      .limit(15); // Analyzing top projects per inference batch

    if (error) throw error;
    if (!rawProjects || rawProjects.length === 0) {
      return NextResponse.json({ success: true, analysis: [] });
    }

    // 2. Normalize and map snake_case columns to clean camelCase fields
    const projects = rawProjects.map((p: any) => ({
      projectName: p.project_name || p.projectName || 'Unnamed Project',
      state: p.state || 'National',
      originalCost: p.original_cost_cr || p.originalCost || 0,
      anticipatedCost: p.anticipated_cost_cr || p.anticipatedCost || 0,
      cumulativeExp: p.cumulative_exp_cr || p.cumulativeExp || 0,
      physicalProgress: p.physical_progress || p.physicalProgress || 0,
      costOverrun: (p.anticipated_cost_cr || p.anticipatedCost || 0) - (p.original_cost_cr || p.originalCost || 0),
    }));

    // 3. Construct intelligent prompt for Gemini LLM
    const prompt = `
      You are an elite Infrastructure Audit AI and Risk Analysis Expert for government projects.
      Analyze the following infrastructure projects dataset and perform deep predictive anomaly detection.
      
      Projects Data:
      ${JSON.stringify(projects, null, 2)}

      For EACH project, evaluate and compute:
      1. riskLevel ('HIGH', 'MEDIUM', or 'LOW')
      2. riskScore (Integer 0 to 100 based on cost overruns, fund leaks, and lagging physical progress)
      3. estimatedDelayMonths (string like "12 Months", "6 Months", or "On Track")
      4. costOverrun (Calculated as anticipatedCost - originalCost, ensure precise number)
      5. anomalies (An array of 2 precise, granular AI audit warning statements based on financial/physical progress discrepancies).

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

    // 4. Invoke Gemini Model for Neural Audit Analysis
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