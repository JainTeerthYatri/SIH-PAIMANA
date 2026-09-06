'use client'

import { useEffect, useState } from 'react'
import { Sparkles, ShieldAlert, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Search, SlidersHorizontal, Activity } from 'lucide-react'

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
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0 })
  const [projects, setProjects] = useState<RiskProject[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL')
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    async function fetchAllChunks() {
      try {
        let offset = 0;
        const limit = 25; 
        let hasMore = true;
        let accumulated: RiskProject[] = [];

        while (hasMore) {
          const res = await fetch(`/api/ai/analyze-risks?offset=${offset}&limit=${limit}`);
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server returned status ${res.status}`);
          }
          const data = await res.json();

          if (data.success && Array.isArray(data.analysis)) {
            accumulated = [...accumulated, ...data.analysis];
            setProjects([...accumulated].sort((a, b) => b.riskScore - a.riskScore));
            setLoadingProgress({ loaded: accumulated.length, total: data.total || 819 });
            
            offset = data.nextOffset;
            hasMore = data.hasMore;

            if (hasMore) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          } else {
            break;
          }
        }
      } catch (err) {
        console.error('Failed to load AI analytics chunks:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllChunks();
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterRisk])

  const filtered = projects.filter(p => {
    const matchesSearch = p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.state.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = filterRisk === 'ALL' || p.riskLevel === filterRisk
    return matchesSearch && matchesRisk
  })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const highRiskCount = projects.filter(p => p.riskLevel === 'HIGH').length
  const medRiskCount = projects.filter(p => p.riskLevel === 'MEDIUM').length
  const lowRiskCount = projects.filter(p => p.riskLevel === 'LOW').length

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 min-h-screen text-slate-900 font-sans">
      {/* Header Section */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            Neural Infrastructure Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Project-Wise AI Insights & Audit
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            100% LLM-driven predictive risk scoring and real-time anomaly detection engine.
          </p>
        </div>

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:flex sm:items-center">
          <div className="bg-red-50/80 border border-red-100 px-4 py-2.5 rounded-2xl text-center">
            <span className="block text-[10px] font-bold text-red-600 uppercase tracking-wider">High Risk</span>
            <span className="text-lg font-black text-red-700">{highRiskCount}</span>
          </div>
          <div className="bg-amber-50/80 border border-amber-100 px-4 py-2.5 rounded-2xl text-center">
            <span className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider">Medium</span>
            <span className="text-lg font-black text-amber-700">{medRiskCount}</span>
          </div>
          <div className="bg-emerald-50/80 border border-emerald-100 px-4 py-2.5 rounded-2xl text-center">
            <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Low Risk</span>
            <span className="text-lg font-black text-emerald-700">{lowRiskCount}</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search projects or filter by state name..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 ml-2 mr-1 hidden sm:block" />
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterRisk(lvl)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-xs ${
                filterRisk === lvl 
                  ? lvl === 'HIGH' ? 'bg-red-600 text-white shadow-red-500/20' 
                  : lvl === 'MEDIUM' ? 'bg-amber-500 text-white shadow-amber-500/20' 
                  : lvl === 'LOW' ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-blue-600 text-white shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-200/60 bg-transparent shadow-none'
              }`}
            >
              {lvl} RISK
            </button>
          ))}
        </div>
      </div>

      {/* Initial Loading Skeleton */}
      {loading && projects.length === 0 ? (
        <div className="p-20 text-center bg-white border border-slate-200 rounded-3xl shadow-xs flex flex-col items-center justify-center gap-5">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-20 h-20 bg-blue-500/20 rounded-full animate-ping"></div>
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-black text-slate-900">Initializing Neural Audit Engine...</p>
            <p className="text-xs text-slate-400 font-medium">Connecting to Gemini AI and executing high-speed infrastructure parallel parsing</p>
          </div>
        </div>
      ) : (
        <>
          {/* Live Progress Bar during Chunk Loading */}
          {loading && (
            <div className="mb-8 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-inner">
                  <Activity className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <p className="text-xs font-black text-cyan-300 uppercase tracking-wider">Live AI Model Execution</p>
                  </div>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">
                    Stream processed <span className="font-bold text-white">{loadingProgress.loaded}</span> of <span className="font-bold text-white">{loadingProgress.total || 819}</span> infrastructure projects in turbo stream mode...
                  </p>
                </div>
              </div>
              <div className="w-full md:w-64 bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/10 relative z-10">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/50" 
                  style={{ width: `${Math.round((loadingProgress.loaded / (loadingProgress.total || 819)) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Empty Filter State */}
          {filtered.length === 0 ? (
            <div className="p-16 text-center bg-white border border-slate-200 rounded-3xl shadow-xs space-y-2">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-slate-800">No matching infrastructure found</p>
              <p className="text-xs text-slate-400">Try tweaking your search keywords or resetting your risk filters.</p>
            </div>
          ) : (
            /* Projects Grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paginated.map((project, idx) => (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div>
                    {/* Card Top Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/60 shadow-xs">
                        {project.state}
                      </span>
                      <span className={`text-xs font-black px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs ${
                        project.riskLevel === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' :
                        project.riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {project.riskLevel === 'HIGH' ? <ShieldAlert className="w-4 h-4 text-red-600" /> : 
                         project.riskLevel === 'MEDIUM' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : 
                         <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {project.riskLevel} RISK
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-5">
                      {project.projectName}
                    </h3>

                    {/* Metric Highlights */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Physical Progress</p>
                          <p className="text-lg font-black text-blue-600 mt-0.5">{project.physicalProgress}%</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-100/60 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {project.physicalProgress}%
                        </div>
                      </div>
                      <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">AI Risk Score</p>
                          <p className="text-lg font-black text-slate-900 mt-0.5">{project.riskScore}<span className="text-xs text-slate-400">/100</span></p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                          project.riskScore > 70 ? 'bg-red-100 text-red-700' : project.riskScore > 40 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {project.riskScore}
                        </div>
                      </div>
                    </div>

                    {/* Financial Breakdown */}
                    <div className="grid grid-cols-4 gap-2 mb-5 text-center">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs">
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Original</p>
                        <p className="text-xs font-bold text-slate-800 mt-1">₹{project.originalCost}Cr</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs">
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Anticipated</p>
                        <p className="text-xs font-bold text-slate-800 mt-1">₹{project.anticipatedCost}Cr</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs">
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Overrun</p>
                        <p className="text-xs font-bold text-red-600 mt-1">₹{project.costOverrun}Cr</p>
                      </div>
                      <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 shadow-xs">
                        <p className="text-[9px] text-amber-600 uppercase font-black tracking-wider">Delay</p>
                        <p className="text-xs font-bold text-amber-800 mt-1 truncate">{project.estimatedDelayMonths}</p>
                      </div>
                    </div>

                    {/* AI Audit Findings */}
                    <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/60 shadow-inner">
                      <p className="text-xs font-black text-slate-600 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" /> AI-Generated Audit Findings
                      </p>
                      <div className="space-y-2">
                        {project.anomalies?.map((anomaly, i) => (
                          <div key={i} className="text-xs text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                            <span className="leading-relaxed font-medium">{anomaly}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 px-6 py-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">
                Showing page <span className="font-bold text-slate-800">{currentPage}</span> of <span className="font-bold text-slate-800">{totalPages}</span> 
                <span className="text-slate-300 mx-2">•</span> 
                Total <span className="font-bold text-slate-800">{filtered.length}</span> projects matched
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-1.5 transition-all shadow-xs"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}