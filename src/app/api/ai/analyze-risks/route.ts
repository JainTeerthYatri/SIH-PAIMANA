import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    // Fetch projects along with their linked analytics
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

    const formatted = (rawProjects || []).map((p: any, idx: number) => {
      // Extract linked analytics data if present
      const analytics = Array.isArray(p.paimana_project_analytics) 
        ? p.paimana_project_analytics[0] 
        : p.paimana_project_analytics;

      const orig = Number(p.original_cost_cr || 100);
      const anti = Number(p.anticipated_cost_cr || orig * 1.2);
      const overrun = Number(((anti - orig) / orig * 100).toFixed(1));
      const progress = Number(p.physical_progress_pct || 40);

      // Algorithmic Fallback if AI background job hasn't processed this row yet
      const fallbackRisk = overrun > 20 || progress < 30 ? 'HIGH' : overrun > 10 ? 'MEDIUM' : 'LOW';
      const fallbackScore = fallbackRisk === 'HIGH' ? 85 : fallbackRisk === 'MEDIUM' ? 60 : 30;

      return {
        projectName: p.project_name || `Infrastructure Project #${offset + idx + 1}`,
        state: p.State || 'National Capital Region',
        originalCost: orig,
        anticipatedCost: anti,
        cumulativeExp: Number(p.cumulative_exp_cr || orig * 0.5),
        physicalProgress: progress,
        costOverrun: overrun,
        estimatedDelayMonths: analytics?.estimated_delay_months || `${Math.max(2, Math.round(overrun * 0.3))} Months`,
        riskLevel: analytics?.risk_level || fallbackRisk,
        riskScore: analytics?.risk_score || fallbackScore,
        anomalies: analytics?.anomalies || [
          overrun > 15 ? "Fund allocation mismatch flagged" : "Expenditure tracking within parameters",
          progress < 40 ? "Execution velocity lower than target" : "Site progress aligns with operational schedule"
        ],
        aiProvider: analytics?.ai_provider || 'algorithmic-fallback'
      };
    });

    return NextResponse.json({
      success: true,
      analysis: formatted,
      total: count || 0,
      nextOffset: offset + (rawProjects?.length || 0),
      hasMore: offset + (rawProjects?.length || 0) < (count || 0)
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}