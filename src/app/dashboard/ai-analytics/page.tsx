'use client'
import { useEffect, useState } from 'react'
import { Sparkles, BarChart2, PieChart as PieChartIcon } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

export default function AIAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [topStatesData, setTopStatesData] = useState<any[]>([])
  const [riskData, setRiskData] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/ai/analyze-risks')
        const data = await res.json()
        
        if (data.success && data.analysis) {
          const projects = data.analysis

          // 1. Process Data for "Top 5 States by Cost Overrun"
          const stateMap: Record<string, number> = {}
          projects.forEach((p: any) => {
            if (p.costOverrun > 0) {
              stateMap[p.state] = (stateMap[p.state] || 0) + p.costOverrun
            }
          })
          
          const sortedStates = Object.entries(stateMap)
            .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5) // Get Top 5
            
          setTopStatesData(sortedStates)

          // 2. Process Data for "Project Risk Distribution"
          let critical = 0, warning = 0, stable = 0
          projects.forEach((p: any) => {
            if (p.riskLevel === 'HIGH') critical++
            else if (p.riskLevel === 'MEDIUM') warning++
            else stable++
          })

          setRiskData([
            { name: 'Critical Risk', value: critical, color: '#ef4444' }, // Red
            { name: 'Stable', value: stable, color: '#10b981' }, // Green
            { name: 'Warning (<50Cr)', value: warning, color: '#f59e0b' } // Orange/Yellow
          ])
        }
      } catch (err) {
        console.error('Failed to fetch AI data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen text-slate-900">
      
      {/* Header matching your screenshot */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002244] flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-blue-600" />
          AI Analytics & Insights
        </h1>
        <p className="text-slate-500 mt-1">Predictive visual insights of infrastructure projects</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Top 5 States by Cost Overrun */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-[#002244]">Top 5 States by Cost Overrun (Cr)</h2>
          </div>
          
          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full flex justify-center items-center text-slate-400">Loading AI Data...</div>
            ) : topStatesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topStatesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex justify-center items-center text-slate-400">No Overrun Data Found</div>
            )}
          </div>
        </div>

        {/* Chart 2: Project Risk Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-[#002244]">Project Risk Distribution</h2>
          </div>
          
          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full flex justify-center items-center text-slate-400">Classifying Risks...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value, entry: any) => <span style={{ color: entry.color, fontWeight: 500 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}