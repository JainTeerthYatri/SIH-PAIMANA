import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const getGeminiKeys = () => {
  return [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
  ].filter(Boolean) as string[];
};

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

    const projectsPayload = rawProjects.map((p: Record<string, any>) => ({
      projectName: p.project_name || p.name || 'Unnamed Project',
      state: p.State || p.state || 'National',
      originalCost: Number(p.original_cost_cr || p.original_cost || 100),
      anticipatedCost: Number(p.anticipated_cost_cr || p.anticipated_cost || 120),
      cumulativeExp: Number(p.cumulative_exp_cr || p.cumulative_exp || 50),
      physicalProgress: Number(p.physical_progress_pct || p.physical_progress || 45),
    }));

    const prompt = `
      Analyze these infrastructure projects using deep AI intelligence and return a strict JSON array containing the risk analysis for each item. 
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
    let usedProvider = 'gemini-cluster';
    const geminiKeys = getGeminiKeys();

    // Continuous Self-Healing Retry Loop (Cycles through keys and providers until valid AI result is returned)
    let attemptCycle = 0;
    const maxCycles = 4; // Max retry cycles before giving up

    while (!aiAnalysisResult && attemptCycle < maxCycles) {
      attemptCycle++;

      // 1. Try looping through all Gemini Keys sequentially in this cycle
      for (let i = 0; i < geminiKeys.length; i++) {
        const currentKey = geminiKeys[i];
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${currentKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            }
          );

          if (geminiRes.ok) {
            const geminiJson = await geminiRes.json();
            const aiText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanedText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
            const firstBracket = cleanedText.indexOf('[');
            const lastBracket = cleanedText.lastIndexOf(']');

            if (firstBracket !== -1 && lastBracket !== -1) {
              aiAnalysisResult = JSON.parse(cleanedText.substring(firstBracket, lastBracket + 1));
              usedProvider = `gemini-key-${i + 1}`;
              break; // Success! Exit inner loop
            }
          }
        } catch (err) {
          console.warn(`Cycle ${attemptCycle}: Gemini Key ${i + 1} failed, rotating to next key...`);
        }
      }

      // 2. If Gemini keys failed in this cycle, try Hugging Face AI
      if (!aiAnalysisResult && process.env.HUGGINGFACE_API_KEY) {
        try {
          const hfRes = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
            {
              headers: {
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
              },
              method: 'POST',
              body: JSON.stringify({
                inputs: `[INST] ${prompt} [/INST]`,
                parameters: { max_new_tokens: 2000, temperature: 0.2, return_full_text: false }
              }),
            }
          );

          if (hfRes.ok) {
            const hfResult = await hfRes.json();
            const aiText = Array.isArray(hfResult) ? hfResult[0]?.generated_text : hfResult?.generated_text || '';
            const cleanedText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
            const firstBracket = cleanedText.indexOf('[');
            const lastBracket = cleanedText.lastIndexOf(']');

            if (firstBracket !== -1 && lastBracket !== -1) {
              aiAnalysisResult = JSON.parse(cleanedText.substring(firstBracket, lastBracket + 1));
              usedProvider = 'huggingface-fallback';
              break; // Success! Exit loop
            }
          }
        } catch (hfErr) {
          console.warn(`Cycle ${attemptCycle}: Hugging Face failed, re-running cycle...`);
        }
      }

      // Brief pause before starting the next continuous cycle
      if (!aiAnalysisResult) {
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }

    if (!aiAnalysisResult) {
      throw new Error('All AI providers and keys exhausted after continuous retry cycles.');
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
    console.error('Continuous AI Loop Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}