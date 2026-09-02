'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getDynamic2FACode } from '@/lib/auth-utils'
import { LogOut, Plus, ShieldCheck, Database, Building2, TrendingUp, AlertTriangle, Activity, Key, X, Users } from 'lucide-react'

// Match this with your Supabase schema
interface Project {
  id: number
  project_name: string
  Sector: string
  State: string
  original_cost_cr: number
  anticipated_cost_cr: number
  cost_overrun_cr: number
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'project' | 'user'>('project')
  const [submitLoading, setSubmitLoading] = useState(false)

  // 🕒 Generate Today's Dynamic 6-Hour Code
  const dailyCode = getDynamic2FACode()

  // Form States
  const [newProject, setNewProject] = useState({
    name: '', sector: 'Road Transport', state: '', cost: ''
  })
  
  const [newUser, setNewUser] = useState({ 
    email: '', password: '', role: 'officer', secretKey: '' 
  })

  // 🔄 Fetch Real Data from Supabase
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('paimana_projects')
        .select('*')
        .order('id', { ascending: false })
        .limit(50)
      
      if (data) setProjects(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!document.cookie.includes('paimana_session=true')) {
      window.location.href = '/login'
      return
    }
    fetchProjects()
  }, [])

  const handleLogout = () => {
    document.cookie = "paimana_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = '/login'
  }

  // 🚀 Insert Data into Supabase (Add Project)
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    
    try {
    const originalCost = parseFloat(newProject.cost)
    const { data, error } = await supabase.from('paimana_projects').insert([
        {
        project_name: newProject.name,
        Sector: newProject.sector,
        State: newProject.state,
        original_cost_cr: originalCost,
        anticipated_cost_cr: originalCost, 
        cost_overrun_cr: 0 
        }
      ])

      if (error) throw error

      alert(`Success: Project "${newProject.name}" added to live database!`)
      setIsModalOpen(false)
      setNewProject({ name: '', sector: 'Road Transport', state: '', cost: '' })
      fetchProjects()

    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSubmitLoading(false)
    }
  }

  // 🛡️ Create New User (Provision Officer)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      alert(data.message)
      setIsModalOpen(false)
      setNewUser({ email: '', password: '', role: 'officer', secretKey: '' })

    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setSubmitLoading(false)
    }
  }

  const totalProjects = projects.length
  const delayedProjects = projects.filter(p => (p.cost_overrun_cr || 0) > 0).length

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      
      {/* 🔵 NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Admin Console</h1>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Live Data Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="hidden sm:flex text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              View Main Dashboard
            </button>
            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all border border-slate-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        
        {/* 🔐 2FA DISPLAY CARD (NEW) */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl border border-slate-800">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-white">
              <Key className="w-5 h-5 text-red-400" /> Active Security Clearance Code
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Provide this code to officers. It auto-rotates strictly every 6 hours.
            </p>
          </div>
          <div className="bg-black/50 border border-slate-700 px-8 py-3 rounded-xl font-mono text-3xl font-black tracking-[0.2em] text-emerald-400 shadow-inner">
            {dailyCode}
          </div>
        </div>

        {/* 📊 DYNAMIC STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Building2 className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Recent Projects</p>
              <h3 className="text-3xl font-black text-slate-900">{totalProjects}</h3>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Database Status</p>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-600">Synced Live</h3>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-4 bg-red-50 text-red-600 rounded-xl"><AlertTriangle className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Critical / Delayed</p>
              <h3 className="text-3xl font-black text-red-600">{delayedProjects}</h3>
            </div>
          </div>
        </div>

        {/* 📋 LIVE PROJECTS TABLE & ACTIONS */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Managed Projects Database</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Live data from Supabase Infrastructure Schema</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button 
                onClick={() => { setModalType('project'); setIsModalOpen(true) }}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
              <button 
                onClick={() => { setModalType('user'); setIsModalOpen(true) }}
                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md"
              >
                <Users className="w-4 h-4" /> Provision Officer
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sector & State</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Cost (Cr)</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">No projects found in database.</td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 line-clamp-2">{project.project_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{project.Sector}</div>
                        <div className="text-xs text-slate-500">{project.State}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-slate-700">₹{project.original_cost_cr?.toLocaleString() || '0'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {(project.cost_overrun_cr || 0) > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> Overrun
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5" /> On Track
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ➕ DYNAMIC MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            
            {modalType === 'project' ? (
              /* --- ADD PROJECT FORM --- */
              <>
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Database className="w-6 h-6" /></div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Add Infrastructure Project</h2>
                    <p className="text-sm text-slate-500">Secure entry to Supabase database</p>
                  </div>
                </div>
                
                <form onSubmit={handleAddProject} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Project Name</label>
                    <input 
                      type="text" required 
                      value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all focus:bg-white" 
                      placeholder="e.g. NH-24 Widening Project"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Sector</label>
                      <select 
                        value={newProject.sector} onChange={e => setNewProject({...newProject, sector: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all focus:bg-white"
                      >
                        <option value="Road Transport">Road Transport</option>
                        <option value="Railways">Railways</option>
                        <option value="Power">Power</option>
                        <option value="Petroleum">Petroleum</option>
                        <option value="Civil Aviation">Civil Aviation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">State / Region</label>
                      <input 
                        type="text" required 
                        value={newProject.state} onChange={e => setNewProject({...newProject, state: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all focus:bg-white" 
                        placeholder="e.g. Maharashtra"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Estimated Cost (in Crores)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none font-bold text-slate-500">₹</div>
                      <input 
                        type="number" required min="150"
                        value={newProject.cost} onChange={e => setNewProject({...newProject, cost: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all focus:bg-white font-mono" 
                        placeholder="Minimum 150"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" disabled={submitLoading}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitLoading ? <Activity className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Submit to Database</>}
                  </button>
                </form>
              </>
            ) : (
              /* --- PROVISION OFFICER FORM --- */
              <>
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-3 bg-slate-100 text-slate-900 rounded-xl"><ShieldCheck className="w-6 h-6" /></div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Provision Officer Account</h2>
                    <p className="text-sm text-slate-500">Create login credentials for new staff</p>
                  </div>
                </div>
                
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Official Email</label>
                    <input 
                      type="email" required 
                      value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 outline-none transition-all focus:bg-white" 
                      placeholder="officer@mospi.gov.in"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Temporary Password</label>
                    <input 
                      type="password" required minLength={6}
                      value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 outline-none transition-all focus:bg-white" 
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-bold text-red-600 mb-1">Security Clearance Code</label>
                    <input 
                      type="password" required 
                      value={newUser.secretKey} onChange={e => setNewUser({...newUser, secretKey: e.target.value})}
                      className="w-full bg-red-50 border-2 border-red-200 rounded-xl px-4 py-2.5 text-slate-900 focus:border-red-500 focus:ring-1 outline-none transition-all font-mono tracking-widest placeholder-red-300" 
                      placeholder="Enter 6-digit code from dashboard"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">*Required for secondary validation.</p>
                  </div>

                  <button 
                    type="submit" disabled={submitLoading}
                    className="w-full mt-6 bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitLoading ? <Activity className="w-5 h-5 animate-spin" /> : 'Provision Account'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}