import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Client Initialization (Make sure env variables are set)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get('project');

    // 1. Fetch all projects joined with analytics based on your schema structure
    const { data: rawData, error } = await supabase
      .from('paimana_projects')
      .select(`
        project_name,
        State,
        original_cost_cr,
        anticipated_cost_cr,
        cumulative_exp_cr,
        physical_progress_pct,
        Cost_overrun_cr,
        start_date,
        target_completion,
        completion_month,
        completion_year,
        paimana_project_analytics (
          risk_level,
          risk_score,
          anomalies,
          estimated_delay_months,
          ai_provider
        )
      `);

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format data to match UI requirements cleanly
    const formattedProjects = rawData?.map((item: any, index: number) => {
      const analytics = Array.isArray(item.paimana_project_analytics) 
        ? item.paimana_project_analytics[0] 
        : item.paimana_project_analytics || {};

      const orig = item.original_cost_cr || 100;
      const ant = item.anticipated_cost_cr || orig;
      const variance = orig > 0 ? ((ant - orig) / orig) * 100 : 0;

      return {
        id: `PIM-${1001 + index}`,
        name: item.project_name,
        sector: 'Infrastructure', // Default or derived if sector field exists
        state: item.State || 'Pan-India',
        department: 'MoSPI / Line Ministry',
        riskLevel: analytics.risk_level || 'Medium',
        riskScore: analytics.risk_score || 55,
        costVariancePercent: parseFloat(variance.toFixed(1)),
        originalCost: orig,
        anticipatedCost: ant,
        physicalProgress: item.physical_progress_pct || 0,
        costOverrun: item.Cost_overrun_cr || 0,
        delayMonths: analytics.estimated_delay_months || '6 Months',
        anomalies: analytics.anomalies || [],
      };
    }) || [];

    if (projectName) {
      const targetProj = formattedProjects.find((p: any) => p.name === projectName || p.id === projectName);
      return NextResponse.json({ projects: formattedProjects, currentProject: targetProj || formattedProjects[0] });
    }

    return NextResponse.json({ projects: formattedProjects, currentProject: formattedProjects[0] });
  } catch (err: any) {
    console.error('API Route Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}