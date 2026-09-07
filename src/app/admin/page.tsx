'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getDynamic2FACode } from '@/lib/auth-utils'
import {
  LogOut,
  ShieldCheck,
  Building2,
  TrendingUp,
  AlertTriangle,
  Activity,
  Key,
  X,
  Users,
  Search,
  RefreshCw,
  LayoutDashboard,
  FileSpreadsheet,
  ShieldAlert,
  UserPlus,
} from 'lucide-react'

// Match with your Supabase schema
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
  const [searchTerm, setSearchTerm] = useState('')

  // Modal State (Only for Provision User)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  // Logged-in Admin Role (Fetch from backend/session or state)
  // Defaulting to 'super_admin' so you can test all permissions. Set to 'admin' to restrict.
  const [currentAdminRole, setCurrentAdminRole] = useState<'admin' | 'super_admin'>('super_admin')

  // 🕒 Dynamic 6-Hour Code & Monthly Cipher State
  const dailyCode = getDynamic2FACode()
  const [monthlyCipher, setMonthlyCipher] = useState('84920193')
  const [isRotating, setIsRotating] = useState(false)

  // Form State for User Provisioning
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'officer', // 'officer' | 'admin'
    secretKey: '',
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
    // Session Check
    if (!document.cookie.includes('paimana_session=true')) {
      window.location.href = '/login'
      return
    }
    fetchProjects()
  }, [])

  const handleLogout = () => {
    document.cookie = 'paimana_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    window.location.href = '/login'
  }

  // 🔑 Rotate Monthly Admin Cipher
  const handleRotateCipher = () => {
    setIsRotating(true)
    setTimeout(() => {
      const generated = Math.floor(10000000 + Math.random() * 90000000).toString()
      setMonthlyCipher(generated)
      setIsRotating(false)
    }, 500)
  }

  // 🛡️ Create New User (Provision Account)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      alert(data.message || 'User account provisioned successfully!')
      setIsModalOpen(false)
      setNewUser({ email: '', password: '', role: 'officer', secretKey: '' })
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setSubmitLoading(false)
    }
  }

  const totalProjects = projects.length
  const delayedProjects = projects.filter((p) => (p.cost_overrun_cr || 0) > 0).length

  // Filtered Projects for Live Search
  const filteredProjects = projects.filter(
    (p) =>
      p.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.Sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.State?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex">
      {/* 🔵 LEFT SIDEBAR */}
      <aside className="w-64 bg-[#0B192C] text-white flex flex-col justify-between p-5 hidden lg:flex shrink-0 border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EA580C] to-[#F59A00] flex items-center justify-center font-black text-xl shadow-md">
              P
            </div>
            <div>
              <h1 className="font-black tracking-wider text-base text-white">PAIMANA</h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                Admin Console
              </p>
            </div>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold">
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl transition-all"
            >
              <LayoutDashboard size={16} /> Admin Control
            </a>
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-400 hover:text-white rounded-xl transition-all text-left"
            >
              <FileSpreadsheet size={16} /> Main User Dashboard
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-400 transition-all p-2 rounded-xl"
        >
          <LogOut size={16} /> Logout Admin
        </button>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVBAR */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm px-4 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Admin Console</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                MoSPI Data & Access Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="hidden sm:flex text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              View Main Dashboard
            </button>
            <div className="w-px h-5 bg-slate-200 hidden sm:block"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* 🔐 SECURITY CLEARANCE & CIPHER CARDS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Dynamic 6-Hour Officer Code */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm border border-slate-800">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2 text-white">
                  <Key className="w-4 h-4 text-emerald-400" /> Dynamic Officer 2FA Code
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  6-hour auto-rotating validation key for officers.
                </p>
              </div>
              <div className="bg-black/60 border border-slate-700 px-5 py-2 rounded-xl font-mono text-xl font-black tracking-[0.2em] text-emerald-400 shrink-0">
                {dailyCode}
              </div>
            </div>

            {/* Monthly Admin Cipher */}
            <div className="bg-emerald-900 rounded-2xl p-5 text-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm border border-emerald-700/50">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2 text-white">
                  <ShieldAlert className="w-4 h-4 text-emerald-300" /> Active Monthly Admin Cipher
                </h2>
                <p className="text-xs text-emerald-200/80 mt-1">
                  Master cipher for admin portal verification.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="bg-black/30 border border-emerald-600 px-4 py-2 rounded-xl font-mono text-lg font-black tracking-[0.2em] text-white">
                  {monthlyCipher}
                </div>
                <button
                  onClick={handleRotateCipher}
                  disabled={isRotating}
                  className="p-2.5 bg-emerald-800 hover:bg-emerald-700 rounded-xl text-emerald-200 transition-all"
                  title="Generate New Monthly Cipher"
                >
                  <RefreshCw size={16} className={isRotating ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>

          {/* 📊 DYNAMIC STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Recent Projects</p>
                <h3 className="text-2xl font-black text-slate-900">{totalProjects}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Database Status</p>
                <h3 className="text-lg font-black text-emerald-600">Synced Live</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="p-3.5 bg-red-50 text-red-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Critical / Delayed</p>
                <h3 className="text-2xl font-black text-red-600">{delayedProjects}</h3>
              </div>
            </div>
          </div>

          {/* 📋 LIVE PROJECTS TABLE WITH USER PROVISIONING ACTION */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-900">Managed Projects Database</h2>
                <p className="text-xs text-slate-500">
                  Live infrastructure records synced directly from Supabase
                </p>
              </div>

              {/* Action Buttons & Search */}
              <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={14} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search project, sector, state..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Users className="w-3.5 h-3.5" /> Provision User / Officer
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Sector & State
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Cost (Cr)
                    </th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-xs">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No projects found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900 line-clamp-2">
                            {project.project_name}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{project.Sector}</div>
                          <div className="text-[11px] text-slate-500">{project.State}</div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          <div className="font-bold text-slate-800">
                            ₹{project.original_cost_cr?.toLocaleString() || '0'}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          {(project.cost_overrun_cr || 0) > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              <AlertTriangle className="w-3 h-3" /> Overrun
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3" /> On Track
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
      </div>

      {/* 🛡️ PROVISION USER / OFFICER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-1.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5 flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 text-slate-900 rounded-xl">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Provision Account</h2>
                <p className="text-xs text-slate-500">Create new credentials & assign authority</p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="officer@mospi.gov.in"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Account Role *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all font-semibold"
                >
                  {/* Officer Option: Available to both Admin & Super Admin */}
                  <option value="officer">Officer</option>

                  {/* Admin Option: Only allowed if logged in as Super Admin */}
                  {currentAdminRole === 'super_admin' && (
                    <option value="admin">Admin</option>
                  )}
                </select>
                {currentAdminRole === 'admin' && (
                  <p className="text-[10px] text-amber-600 font-semibold mt-1">
                    * Admin users are restricted to provisioning Officer accounts only.
                  </p>
                )}
              </div>

              <div className="pt-1">
                <label className="block text-xs font-bold text-red-600 mb-1">
                  Security Clearance Code *
                </label>
                <input
                  type="password"
                  required
                  value={newUser.secretKey}
                  onChange={(e) => setNewUser({ ...newUser, secretKey: e.target.value })}
                  className="w-full bg-red-50 border border-red-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-red-500 outline-none transition-all font-mono tracking-widest placeholder-red-300"
                  placeholder="Enter 2FA dynamic clearance code"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full mt-4 bg-slate-900 hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitLoading ? (
                  <Activity className="w-4 h-4 animate-spin" />
                ) : (
                  'Provision Account'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}