'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'

interface Project {
  id: number
  project_name: string
  Sector: string
  State: string
  original_cost_cr: number
  anticipated_cost_cr: number
  cost_overrun_cr: number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    async function fetchProjects() {
      try {
        // limit(3000) lagaya hai taaki hackathon ke saare 1500+ projects aa jayein 
        // (Supabase by default sirf 1000 bhejta hai)
        const { data, error } = await supabase.from('paimana_projects').select('*').limit(3000)
        if (data) setProjects(data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  // Jab bhi user kuch search kare, toh automatically Page 1 par aa jaye
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // 1. Pehle data ko search ke hisaab se filter karo
  const filteredProjects = projects.filter(p => 
    p.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.State?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.Sector?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 2. Phir filtered data ko Pagination ke hisaab se kaato (Slice)
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Directory</h1>
          <p className="text-slate-500 mt-1">Monitor and filter all ongoing Central Sector Infrastructure Projects</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm shadow-sm transition-all"
            placeholder="Search by project name, state, or sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Project Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sector & State</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Cost (Cr)</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr key="loading-state">
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">Loading projects data...</td>
                </tr>
              ) : paginatedProjects.length === 0 ? (
                <tr key="empty-state">
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">No projects found for "{searchTerm}"</td>
                </tr>
              ) : (
                paginatedProjects.map((project, index) => (
                  <tr key={project.id || `project-${index}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900 line-clamp-2">{project.project_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 font-medium">{project.Sector || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{project.State || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-slate-900 font-bold">₹{project.anticipated_cost_cr?.toLocaleString() || '0'}</div>
                      <div className="text-xs text-slate-500">Original: ₹{project.original_cost_cr?.toLocaleString() || '0'}</div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {(project.cost_overrun_cr || 0) > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Overrun: ₹{project.cost_overrun_cr}Cr
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle className="w-3.5 h-3.5" />
                          On Track
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 📟 Pagination Footer */}
        {!loading && filteredProjects.length > 0 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              Showing <span className="font-bold text-slate-900">{startIndex + 1}</span> to <span className="font-bold text-slate-900">{Math.min(startIndex + itemsPerPage, filteredProjects.length)}</span> of <span className="font-bold text-slate-900">{filteredProjects.length}</span> projects
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="px-4 text-sm font-bold text-slate-700">
                Page {currentPage} of {totalPages}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}