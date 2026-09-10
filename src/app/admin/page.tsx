'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDynamic2FACode } from '@/lib/auth-utils'
import {
  LogOut,
  ShieldCheck,
  Activity,
  Key,
  X,
  Users,
  Search,
  FileSpreadsheet,
  UserPlus,
  Mail,
  Shield,
  UserCheck,
  RefreshCw,
} from 'lucide-react'

interface SupabaseUser {
  id: string
  email: string
  role: 'officer' | 'admin' | 'super_admin'
  department: string
  status: string
  createdAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [fetchingUsers, setFetchingUsers] = useState(true)

  // Real Supabase Auth Users State
  const [officers, setOfficers] = useState<SupabaseUser[]>([])

  // 🕒 6-Hour Refreshing Dynamic Code for Officers
  const dailyCode = getDynamic2FACode()

  // Form State for User Provisioning
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'officer', // Strictly locked to 'officer' for standard admin
    department: '',
    secretKey: '',
  })

  // 🔄 Fetch Users directly from your existing API (/api/admin/user)
  const fetchSupabaseUsers = async () => {
    setFetchingUsers(true)
    try {
      const res = await fetch('/api/admin/user')
      const data = await res.json()
      if (res.ok && data.users) {
        setOfficers(data.users)
      }
    } catch (err) {
      console.error('Failed to fetch Supabase users:', err)
    } finally {
      setFetchingUsers(false)
    }
  }

  useEffect(() => {
    // Session Verification
    if (!document.cookie.includes('paimana_session=true') && !document.cookie.includes('paimana_godmode=true')) {
      router.push('/login')
      return
    }
    fetchSupabaseUsers()
  }, [router])

  const handleLogout = () => {
    document.cookie = 'paimana_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'paimana_godmode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/login')
  }

  // 🛡️ Provision New Officer Account
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, role: 'officer' }), // Locked to officer
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      alert(data.message || 'Officer account provisioned successfully in Supabase Auth!')
      setIsModalOpen(false)
      setNewUser({ email: '', password: '', role: 'officer', department: '', secretKey: '' })
      
      // Refresh list from Supabase Auth
      fetchSupabaseUsers()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setSubmitLoading(false)
    }
  }

  // Live Search Filter for Officers
  const filteredOfficers = officers.filter(
    (o) =>
      o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                Officer Management
              </p>
            </div>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold">
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl transition-all"
            >
              <Users size={16} /> Officers Console
            </a>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-400 hover:text-white rounded-xl transition-all text-left"
            >
              <FileSpreadsheet size={16} /> Main Dashboard
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
                MoSPI Officer Directory & Clearance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
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
          
          {/* 🔐 6-HOUR OFFICER DYNAMIC CLEARANCE CODE */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md border border-slate-800">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 text-white">
                <Key className="w-5 h-5 text-emerald-400" /> Active Security Clearance Code (Officer 2FA)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Provide this dynamic 6-digit verification code to officers. It rotates strictly every 6 hours.
              </p>
            </div>
            <div className="bg-black/60 border border-slate-700 px-6 py-2.5 rounded-xl font-mono text-2xl font-black tracking-[0.25em] text-emerald-400 shrink-0 shadow-inner">
              {dailyCode}
            </div>
          </div>

          {/* 📋 REAL SUPABASE OFFICERS DIRECTORY TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-900">Registered Officers & Personnel</h2>
                <p className="text-xs text-slate-500">
                  Live data fetched directly from Supabase Auth Database
                </p>
              </div>

              {/* Search & Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={14} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search officer email, role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={fetchSupabaseUsers}
                  disabled={fetchingUsers}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-all border border-slate-200"
                  title="Refresh Users"
                >
                  <RefreshCw size={14} className={fetchingUsers ? 'animate-spin' : ''} />
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <UserPlus className="w-4 h-4" /> Provision New Officer
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Official Email
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Department / Wing
                    </th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Assigned Role
                    </th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-xs">
                  {fetchingUsers ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        <Activity className="w-5 h-5 animate-spin inline mr-2 text-emerald-600" />
                        Fetching live Supabase Auth users...
                      </td>
                    </tr>
                  ) : filteredOfficers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No registered users found in Supabase Auth.
                      </td>
                    </tr>
                  ) : (
                    filteredOfficers.map((officer) => (
                      <tr key={officer.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <Mail size={14} className="text-slate-400" />
                          {officer.email}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-600">
                          {officer.department}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              officer.role === 'admin' || officer.role === 'super_admin'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            <Shield size={10} />
                            {officer.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <UserCheck size={10} />
                            {officer.status}
                          </span>
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

      {/* 🛡️ PROVISION OFFICER MODAL */}
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
                <h2 className="text-base font-bold text-slate-900">Provision Officer Account</h2>
                <p className="text-xs text-slate-500">Create new credentials in Supabase Auth</p>
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
                  Department / Division *
                </label>
                <input
                  type="text"
                  required
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="e.g. NHAI Directorate"
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
                  Assigned Role
                </label>
                <input
                  type="text"
                  readOnly
                  value="Officer (Admin Restricted)"
                  className="w-full bg-slate-100 border border-slate-200 text-slate-500 font-semibold rounded-xl px-3.5 py-2 text-xs cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  * Admins are strictly restricted to creating Officer accounts only.
                </p>
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
                  placeholder="Enter 6-digit dynamic code"
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
                  'Provision Officer Account'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}