'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BarChart3, PieChart as PieChartIcon, Sparkles } from 'lucide-react'

interface Project {
  id: number
  State: string
  original_cost_cr: number
  cost_overrun_cr: number
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444'] // Green, Yellow, Red

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        const { data, error } = await supabase.from('paimana_projects').select('id, State, original_cost_cr, cost_overrun_cr')
        if (data) setProjects(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalyticsData()
  }, [])

  // Data processing for charts
  const stateDataMap: Record<string, number> = {}
  let safe = 0, warning = 0, critical = 0

  projects.forEach(p => {
    // Bar Chart Logic
    const stateName = p.State || 'Multi-State'
    const overrun = p.cost_overrun_cr || 0
    stateDataMap[stateName] = (stateDataMap[stateName] || 0) + overrun

    // Pie Chart Logic
    if (overrun <= 0) safe++
    else if (overrun > 0 && overrun <= 50) warning++
    else critical++
  })

  const barChartData = Object.keys(stateDataMap)
    .map(key => ({ name: key, Overrun: Math.round(stateDataMap[key]) }))
    .sort((a, b) => b.Overrun - a.Overrun)
    .slice(0, 5)

  const pieChartData = [
    { name: 'Stable', value: safe },
    { name: 'Warning (<50Cr)', value: warning },
    { name: 'Critical Risk', value: critical },
  ]

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-blue-600" />
          AI Analytics & Insights
        </h1>
        <p className="text-slate-500 mt-1">Predictive visual insights of infrastructure projects</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Top 5 States by Cost Overrun (Cr)</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="Overrun" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <PieChartIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Project Risk Distribution</h2>
          </div>
          <div className="h-80 w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Legend iconType="circle" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}