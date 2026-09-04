'use client'
import { useEffect, useState } from 'react'
import { Sparkles, ShieldAlert, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

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
        const limit = 10;
        let hasMore = true;
        let accumulated: RiskProject[] = [];

        while (hasMore) {
          const res = await fetch(`/api/ai/analyze-risks?offset=${offset}&limit=${limit}`);
          if (!res.ok) throw new Error(`Server returned status ${res.status}`);
          const data = await res.json();

          if (data.success && Array.isArray(data.analysis)) {
            accumulated = [...accumulated, ...data.analysis];
            setProjects([...accumulated].sort((a, b) => b.riskScore - a.riskScore));
            setLoadingProgress({ loaded: accumulated.length, total: data.total || 819 });
            
            offset = data.nextOffset;
            hasMore = data.hasMore;
          } else {
            break;
          }
        }
      } catch (err) {
        console.error('Failed to load AI analytics chunks', err);
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
    const matchesSearch = p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || p.state.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = filterRisk === 'ALL' || p.riskLevel === filterRisk
    return matchesSearch && matchesRisk
  })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen text-slate-900">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002244] flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            Project-Wise AI Insights & Audit
          </h1>
          <p className="text-slate-500 mt-1">100% LLM-driven predictive risk scoring and neural anomaly detection across all infrastructure records</p>
        </div>

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

      {loading && projects.length === 0 ? (
        <div className="p-20 text-center text-slate-700 font-semibold flex flex-col items-center justify-center gap-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 bg-blue-500/20 rounded-full animate-ping"></div>
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-7 h-7 text-white animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-base font-bold text-[#002244]">Initializing Neural Audit Engine...</p>
            <p className="text-xs text-slate-400 mt-1">Connecting to Gemini AI and executing batch infrastructure parsing</p>
          </div>
        </div>
      ) : (
        <>
          {loading && (
            <div className="mb-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
                <div>
                  <p className="text-xs font-bold text-cyan-300 uppercase tracking-wide">Live AI Model Execution</p>
                  <p className="text-sm font-medium text-slate-100">
                    Analyzed <span className="font-bold text-white">{loadingProgress.loaded}</span> of <span className="font-bold text-white">{loadingProgress.total || 819}</span> infrastructure projects in optimized batches...
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-48 bg-white/20 rounded-full h-2.5 overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-400 h-full rounded-full transition-all duration-300 shadow-sm" 
                  style={{ width: `${Math.round((loadingProgress.loaded / (loadingProgress.total || 819)) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="p-20 text-center text-slate-500 font-medium bg-white border border-slate-200 rounded-2xl">
              No infrastructure projects found matching your filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paginated.map((project, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
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

                    <h3 className="text-base font-bold text-[#002244] leading-snug mb-4">{project.projectName}</h3>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Physical Progress</p>
                        <p className="text-base font-extrabold text-blue-600 mt-0.5">{project.physicalProgress}%</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">AI Risk Score</p>
                        <p className="text-base font-extrabold text-[#002244] mt-0.5">{project.riskScore}/100</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Original</p>
                        <p className="text-xs font-bold text-slate-700">₹{project.originalCost}Cr</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Anticipated</p>
                        <p className="text-xs font-bold text-slate-700">₹{project.anticipatedCost}Cr</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Overrun</p>
                        <p className="text-xs font-bold text-red-600">₹{project.costOverrun}Cr</p>
                      </div>
                      <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                        <p className="text-[9px] text-amber-600 uppercase font-bold">Delay</p>
                        <p className="text-xs font-bold text-amber-700 truncate">{project.estimatedDelayMonths}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/85 rounded-xl p-3.5 border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" /> AI-Generated Audit Findings
                      </p>
                      <div className="space-y-1.5">
                        {project.anomalies?.map((anomaly, i) => (
                          <div key={i} className="text-xs text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-start gap-2">
                            <span className="text-red-500 font-bold">•</span>
                            <span className="leading-tight">{anomaly}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 px-6 py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
              <p className="text-xs text-slate-500">
                Showing page <span className="font-bold text-slate-700">{currentPage}</span> of <span className="font-bold text-slate-700">{totalPages}</span> ({filtered.length} total projects)
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
        </>
      )}
    </div>
  )
}