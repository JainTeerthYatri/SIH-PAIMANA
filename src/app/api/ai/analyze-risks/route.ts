import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { data: projects, error } = await supabaseAdmin
      .from('paimana_projects')
      .select('*')

    if (error) throw error

    if (!projects || projects.length === 0) {
      return NextResponse.json({ message: 'No projects found', analysis: [] }, { status: 200 })
    }

    // AI Financial & Implied Timeline Risk Engine
    const analyzedProjects = projects.map((project) => {
      let riskScore = 0
      let anomalies: string[] = []

      const originalCost = project.original_cost_cr || 0
      const anticipatedCost = project.anticipated_cost_cr || originalCost
      const cumulativeExp = project.cumulative_exp_cr || 0
      const physicalProgress = project.physical_progress_pct || 0
      const costOverrun = project.cost_overrun_cr || 0

      // 🕒 IMPLICIT TIMELINE & EXTENSION ESTIMATION LOGIC
      // Agar physical progress 100% se kam hai, toh bache hue progress ke basis par delay calculate hoga
      const remainingProgress = Math.max(0, 100 - physicalProgress)
      
      // Cost escalation factor (Kitna budget badh gaya)
      const costInflationFactor = anticipatedCost > 0 ? anticipatedCost / (originalCost || 1) : 1
      
      // Estimated Delay in Months (Heuristic model based on cost overrun & slow progress)
      let estimatedDelayMonths = 0
      if (physicalProgress < 50 && costInflationFactor > 1.2) {
        estimatedDelayMonths = Math.round((remainingProgress / 10) * costInflationFactor * 1.5)
      } else if (costOverrun > 0) {
        estimatedDelayMonths = Math.round(costOverrun * 0.4) // Har 1Cr overrun par roughly delay factor
      }

      // 1. Cost Overrun Anomaly Check
      if (costOverrun > 0) {
        riskScore += 30
        anomalies.push(`Cost Overrun: Exceeding baseline by ₹${costOverrun} Cr.`)
      }

      // 2. Budget Inflation Check
      if (costInflationFactor > 1.25) {
        riskScore += 25
        anomalies.push(`Severe Budget Inflation: Anticipated cost is ${(costInflationFactor * 100 - 100).toFixed(1)}% higher than original.`)
      }

      // 3. Capital Inefficiency & Timeline Extension Risk
      if (cumulativeExp > (originalCost * 0.5) && physicalProgress < 40) {
        riskScore += 25
        anomalies.push('Capital Drain: High expenditure with critically low physical completion.')
      }

      if (estimatedDelayMonths > 12) {
        riskScore += 20
        anomalies.push(`Critical Timeline Risk: Implied schedule extension projected at ~${estimatedDelayMonths} months delay.`)
      }

      // Final Risk Categorization
      let riskLevel = 'LOW'
      if (riskScore >= 55) riskLevel = 'HIGH'
      else if (riskScore >= 25) riskLevel = 'MEDIUM'

      return {
        projectName: project.project_name,
        state: project.State,
        originalCost,
        anticipatedCost,
        cumulativeExp,
        physicalProgress,
        costOverrun,
        estimatedDelayMonths: `${estimatedDelayMonths} Months`,
        riskLevel,
        riskScore,
        anomalies,
      }
    })

    return NextResponse.json({ success: true, analysis: analyzedProjects }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}