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
    async function fetchAllChunksInBatch() {
      try {
        let offset = 0;
        const limit = 15;
        let hasMore = true;
        let accumulatedProjects: RiskProject[] = [];

        // First fetch to get total count
        const initialRes = await fetch(`/api/ai/analyze-risks?offset=0&limit=${limit}`);
        if (!initialRes.ok) throw new Error(`Server returned status ${initialRes.status}`);
        const initialData = await initialRes.json();

        if (initialData.success && Array.isArray(initialData.analysis)) {
          accumulatedProjects = [...initialData.analysis];
          setProjects([...accumulatedProjects].sort((a, b) => b.riskScore - a.riskScore));
          setLoadingProgress({ loaded: accumulatedProjects.length, total: initialData.total });
          
          offset = initialData.nextOffset;
          hasMore = initialData.hasMore;
        }

        // Background loop to fetch rest of the 819 projects seamlessly
        while (hasMore) {
          const res = await fetch(`/api/ai/analyze-risks?offset=${offset}&limit=${limit}`);
          if (!res.ok) break;
          const data = await res.json();

          if (data.success && Array.isArray(data.analysis)) {
            accumulatedProjects = [...accumulatedProjects, ...data.analysis];
            setProjects([...accumulatedProjects].sort((a, b) => b.riskScore - a.riskScore));
            setLoadingProgress({ loaded: accumulatedProjects.length, total: data.total });
            
            offset = data.nextOffset;
            hasMore = data.hasMore;
          } else {
            break;
          }
        }
      } catch (err) {
        console.error('Failed to load full AI analytics batch', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllChunksInBatch();
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
        <div className="p-20 text-center text-slate-500 font-semibold flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          Initializing Neural Audit Engine for all records...
        </div>
      ) : (
        <>
          {loading && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-xs font-bold text-blue-900">
                  Background AI Analysis in Progress: Analyzed {loadingProgress.loaded} of {loadingProgress.total} infrastructure projects...
                </span>
              </div>
              <div className="w-32 bg-blue-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300" 
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