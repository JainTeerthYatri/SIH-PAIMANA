import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Ultra-fast timeout helper (0.5s / 500ms check)
async function fetchWithTimeout(promise: Promise<Response>, timeoutMs: number = 500): Promise<Response> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('AI Provider Timeout exceeded')), timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result as Response;
  } catch (err) {
    clearTimeout(timeoutId!);
    throw err;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    // 1. Fetch total count from Supabase
    const { count, error: countErr } = await supabase
      .from('paimana_projects')
      .select('*', { count: 'exact', head: true });

    if (countErr) {
      return NextResponse.json({ success: false, error: `Supabase Count Error: ${countErr.message}` }, { status: 500 });
    }

    const totalCount = count || 819;

    // 2. Fetch raw project records for this chunk
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

    const projectsPayload = rawProjects.map((p: any) => ({
      projectName: p.project_name || p.name || 'Unnamed Project',
      state: p.State || p.state || 'National',
      originalCost: Number(p.original_cost_cr || p.original_cost || 100),
      anticipatedCost: Number(p.anticipated_cost_cr || p.anticipated_cost || 120),
      cumulativeExp: Number(p.cumulative_exp_cr || p.cumulative_exp || 50),
      physicalProgress: Number(p.physical_progress_pct || p.physical_progress || 45),
    }));

    const prompt = `
      Analyze these infrastructure projects and return a strict JSON array containing the analysis for each item. 
      Projects data: ${JSON.stringify(projectsPayload)}

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

    // 3. Try Gemini First with 0.5s timeout
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const geminiPromise = fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            }),
          }
        );

        const geminiRes = await fetchWithTimeout(geminiPromise, 500);
        const geminiJson = await geminiRes.json();
        
        const aiText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanedText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBracket = cleanedText.indexOf('[');
        const lastBracket = cleanedText.lastIndexOf(']');

        if (firstBracket !== -1 && lastBracket !== -1) {
          aiAnalysisResult = JSON.parse(cleanedText.substring(firstBracket, lastBracket + 1));
        }
      } catch (geminiError) {
        console.warn('Gemini primary timeout or error, switching to Hugging Face...', geminiError);
        usedProvider = 'huggingface';
      }
    } else {
      usedProvider = 'huggingface';
    }

    // 4. Fallback to Hugging Face if Gemini failed or wasn't configured
    if (!aiAnalysisResult) {
      const hfKey = process.env.HUGGINGFACE_API_KEY;
      if (!hfKey) {
        return NextResponse.json(
          { success: false, error: 'Both Gemini and Hugging Face API keys are missing in environment variables.' },
          { status: 500 }
        );
      }

      const hfPrompt = `[INST] ${prompt} [/INST]`;
      const hfResponse = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
          headers: {
            Authorization: `Bearer ${hfKey}`,
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

      if (hfResult.error) {
        throw new Error(`Hugging Face API Error: ${hfResult.error}`);
      }

      const aiText = Array.isArray(hfResult) ? hfResult[0]?.generated_text : hfResult?.generated_text || '';
      const cleanedText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBracket = cleanedText.indexOf('[');
      const lastBracket = cleanedText.lastIndexOf(']');

      if (firstBracket === -1 || lastBracket === -1) {
        throw new Error('AI model failed to return valid JSON structure');
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
    console.error('AI Pipeline Critical Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}