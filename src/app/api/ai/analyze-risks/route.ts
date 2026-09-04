import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Initialize Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);

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
      return NextResponse.json({ 
        success: true, 
        analysis: [], 
        total: totalCount, 
        hasMore: false 
      });
    }

    const projects = rawProjects.map((p: any) => ({
      projectName: p.project_name || p.name || 'Unnamed Project',
      state: p.State || p.state || 'National',
      originalCost: Number(p.original_cost_cr || p.original_cost || 100),
      anticipatedCost: Number(p.anticipated_cost_cr || p.anticipated_cost || 120),
      cumulativeExp: Number(p.cumulative_exp_cr || p.cumulative_exp || 50),
      physicalProgress: Number(p.physical_progress_pct || p.physical_progress || 45),
    }));

    const prompt = `
      Analyze these infrastructure projects and return a strict JSON array containing the analysis for each. 
      Projects data: ${JSON.stringify(projects)}

      Required JSON Schema per item in array:
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

      CRITICAL: Return ONLY a valid JSON array starting with [ and ending with ]. Do not use markdown backticks or extra text.
    `;

    let aiAnalysisResult = null;
    let usedProvider = 'gemini';

    // Ultra-fast timeout wrapper (0.5 seconds / 500ms check)
    const fetchWithTimeout = async (promise: Promise<any>, timeoutMs: number = 500) => {
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Timeout exceeded')), timeoutMs);
      });
      try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId!);
        return result;
      } catch (err) {
        clearTimeout(timeoutId!);
        throw err;
      }
    };

    // Try Gemini First with 0.5s timeout constraint
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiPromise = ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const response = await fetchWithTimeout(geminiPromise, 500);
        const aiText = response.text || '';
        const cleanedText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBracket = cleanedText.indexOf('[');
        const lastBracket = cleanedText.lastIndexOf(']');

        if (firstBracket !== -1 && lastBracket !== -1) {
          aiAnalysisResult = JSON.parse(cleanedText.substring(firstBracket, lastBracket + 1));
        }
      } catch (err) {
        // Gemini failed or took > 0.5s (likely 429 quota exhaustion), fallback triggers instantly
        usedProvider = 'huggingface';
      }
    } else {
      usedProvider = 'huggingface';
    }

    // Fallback to Hugging Face if Gemini failed or wasn't available
    if (!aiAnalysisResult) {
      const hfPrompt = `[INST] ${prompt} [/INST]`;
      const hfResponse = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: hfPrompt,
            parameters: { max_new_tokens: 2000, temperature: 0.2, return_full_text: false }
          }),
        }
      );

      const hfResult = await hfResponse.json();
      const aiText = Array.isArray(hfResult) ? hfResult[0]?.generated_text : hfResult?.generated_text || '';
      const cleanedText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBracket = cleanedText.indexOf('[');
      const lastBracket = cleanedText.lastIndexOf(']');

      if (firstBracket === -1 || lastBracket === -1) {
        return NextResponse.json({ success: false, error: 'All AI providers failed to return valid JSON' }, { status: 500 });
      }

      aiAnalysisResult = JSON.parse(cleanedText.substring(firstBracket, lastBracket + 1));
    }

    const nextOffset = offset + limit;
    const hasMore = nextOffset < totalCount;

    return NextResponse.json({
      success: true,
      provider: usedProvider,
      analysis: aiAnalysisResult,
      total: totalCount,
      nextOffset,
      hasMore,
    });

  } catch (err: any) {
    console.error('Fallback Pipeline Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}