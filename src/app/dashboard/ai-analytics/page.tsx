'use client'
import { useEffect, useState } from 'react'
import { Sparkles, ShieldAlert, AlertTriangle, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

interface RiskProject {
  projectName: string
  state: string
  originalCost: number
  anticipatedCost: number
  cumulativeExp: number
  physicalProgress: number
  costOverrun: number
  estimatedDelayMonths: string
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  riskScore: number
  anomalies: string[]
}

export default function AIAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<RiskProject[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL')
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4 // Clean view layout per page

  useEffect(() => {
    async function fetchRiskAnalysis() {
      try {
        const res = await fetch('/api/ai/analyze-risks')
        const data = await res.json()
        if (data.success && Array.isArray(data.analysis)) {
          const sortedProjects = data.analysis.sort((a: RiskProject, b: RiskProject) => b.riskScore - a.riskScore)
          setProjects(sortedProjects)
        }
      } catch (err) {
        console.error('Failed to fetch AI analysis', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRiskAnalysis()
  }, [])

  // Reset page when filter or search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterRisk])

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || p.state.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = filterRisk === 'ALL' || p.riskLevel === filterRisk
    return matchesSearch && matchesRisk
  })

  // Pagination slice calculations
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen text-slate-900">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002244] flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            Project-Wise AI Insights & Audit
          </h1>
          <p className="text-slate-500 mt-1">Real-time LLM-driven risk scoring and anomaly detection per infrastructure project</p>
        </div>

        {/* Search & Risk Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Search projects or states..." 
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm w-full sm:w-64 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex bg-white border border-slate-300 rounded-lg p-1">
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterRisk(lvl)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filterRisk === lvl 
                    ? lvl === 'HIGH' ? 'bg-red-100 text-red-700' 
                    : lvl === 'MEDIUM' ? 'bg-amber-100 text-amber-700' 
                    : lvl === 'LOW' ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        {loading ? (
          <div className="p-16 text-center text-slate-500 font-semibold animate-pulse flex flex-col items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-500 animate-spin" />
            Running Gemini Neural Audit Engine across project records...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-16 text-center text-slate-500 font-medium">No infrastructure projects found matching your filter criteria.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedProjects.map((project, idx) => (
              <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col lg:flex-row gap-6">
                  
                  {/* Left Column: Project Identity & Scores */}
                  <div className="lg:w-1/3 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {project.state}
                        </span>
                        <span className={`text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 ${
                          project.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' :
                          project.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {project.riskLevel === 'HIGH' ? <ShieldAlert className="w-3.5 h-3.5" /> : 
                           project.riskLevel === 'MEDIUM' ? <AlertTriangle className="w-3.5 h-3.5" /> : 
                           <CheckCircle2 className="w-3.5 h-3.5" />}
                          {project.riskLevel} RISK
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#002244] leading-snug">{project.projectName}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Physical Progress</p>
                        <p className="text-lg font-extrabold text-blue-600">{project.physicalProgress}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">AI Risk Score</p>
                        <p className="text-lg font-extrabold text-[#002244]">{project.riskScore}/100</p>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: LLM AI Detected Anomalies */}
                  <div className="lg:w-1/3 bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" /> AI-Generated Audit Findings
                    </p>
                    <div className="space-y-2">
                      {project.anomalies && project.anomalies.length > 0 ? (
                        project.anomalies.map((anomaly, i) => (
                          <div key={i} className="text-xs text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-xs flex items-start gap-2">
                            <span className="text-red-500 font-bold mt-0.5">•</span>
                            <span className="leading-relaxed">{anomaly}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                          ✓ No structural anomalies detected by neural audit.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Financial & Delay Breakdown */}
                  <div className="lg:w-1/3 grid grid-cols-2 gap-3 content-center">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Original Cost</p>
                      <p className="text-sm font-bold text-slate-700">₹{project.originalCost} Cr</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Anticipated Cost</p>
                      <p className="text-sm font-bold text-slate-700">₹{project.anticipatedCost} Cr</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Cost Overrun</p>
                      <p className="text-sm font-bold text-red-600">₹{project.costOverrun} Cr</p>
                    </div>
                    <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-100 shadow-xs">
                      <p className="text-[10px] text-amber-600 uppercase font-bold">Implied Delay</p>
                      <p className="text-sm font-bold text-amber-700 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" /> {project.estimatedDelayMonths}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginated Footer Controls */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing page <span className="font-bold text-slate-700">{currentPage}</span> of <span className="font-bold text-slate-700">{totalPages}</span> ({filteredProjects.length} analyzed projects)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 flex items-center gap-1 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}