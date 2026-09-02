'use client'
import { useEffect, useState } from 'react'
import { ShieldAlert, Users, Activity, Key, LogOut, ShieldCheck, Database, RefreshCcw, Plus, X, Lock } from 'lucide-react'

interface Officer {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  user_metadata: { role?: string; monthly_admin_code?: string }
}

export default function SuperAdminPage() {
  const [loading, setLoading] = useState(true)
  const [officers, setOfficers] = useState<Officer[]>([])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({ 
    email: '', 
    password: '', 
    role: 'officer', 
    secretKey: '' 
  })
  const [modalStatus, setModalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [modalMsg, setModalMsg] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const fetchRealUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.users) setOfficers(data.users)
    } catch (error) {
      console.error("Failed to fetch users", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!document.cookie.includes('paimana_godmode=true')) {
      window.location.href = '/register'
      return
    }
    fetchRealUsers()
  }, [])

  const handleLogout = () => {
    document.cookie = "paimana_godmode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = '/register'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never Logged In'
    return new Date(dateString).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
  }

  // 🔄 Regenerate 8-Digit Monthly Code for Specific Admin
  const handleRegenerateCode = async (userId: string) => {
    setActionLoadingId(userId)
    try {
      const res = await fetch('/api/admin/regenerate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      fetchRealUsers()
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate code')
    } finally {
      setActionLoadingId(null)
    }
  }

  // 🔑 Reset Password for Any User
  const handleResetPassword = async (userId: string, email: string) => {
    const newPassword = prompt(`Enter new temporary password for ${email}:`)
    if (!newPassword) return

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.')
      return
    }

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      alert('Password updated successfully!')
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalStatus('loading')
    setModalMsg('')
    
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setModalStatus('success')
      setModalMsg(data.message)
      fetchRealUsers() 
      
      setNewUser({ email: '', password: '', role: 'officer', secretKey: '' }) 
      
      setTimeout(() => {
        setIsModalOpen(false)
        setModalStatus('idle')
      }, 2000)

    } catch (err: any) {
      setModalStatus('error')
      setModalMsg(err.message)
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Activity className="w-8 h-8 text-red-500 animate-spin" /></div>

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-red-500/30 relative overflow-x-hidden">
      
      <div className="bg-red-600 text-white text-xs py-1.5 px-6 flex justify-between items-center font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(239,68,68,0.5)]">
        <div className="flex items-center gap-2 animate-pulse">
          <ShieldAlert className="w-4 h-4" />
          TOP SECRET - SUPER ADMIN CLEARANCE ACTIVE
        </div>
        <span className="hidden sm:inline">MoSPI Central Command</span>
      </div>

      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] shrink-0">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">GOD MODE</h1>
              <p className="text-[10px] sm:text-xs font-bold text-red-400 uppercase tracking-widest">Live Database Sync</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-slate-800 hover:bg-red-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all border border-slate-700 hover:border-red-500">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Terminate Session</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-4 bg-blue-500/10 text-blue-500 rounded-xl"><Users className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Total Accounts</p>
              <h3 className="text-3xl font-black text-white">{officers.length}</h3>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-xl"><ShieldCheck className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Admins Active</p>
              <h3 className="text-3xl font-black text-white">
                {officers.filter(o => o.user_metadata?.role === 'admin').length}
              </h3>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10 text-purple-500"><Database className="w-24 h-24" /></div>
            <div className="p-4 bg-purple-500/10 text-purple-500 rounded-xl relative z-10"><RefreshCcw className="w-8 h-8 animate-spin-slow" /></div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-slate-500 uppercase">Supabase Connect</p>
              <h3 className="text-3xl font-black text-emerald-400">Live</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Live Officer & Admin Directory</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage network access, roles, and 8-digit monthly ciphers</p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Provision New Account
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-950/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role Level</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Admin Cipher</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Created On</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions / Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {officers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Fetching network identities...</td>
                  </tr>
                ) : (
                  officers.map((officer) => (
                    <tr key={officer.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-200">{officer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {officer.user_metadata?.role === 'super_admin' ? (
                          <span className="text-red-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs bg-red-500/10 px-2 py-1 rounded">Super Admin</span>
                        ) : officer.user_metadata?.role === 'admin' ? (
                          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs bg-emerald-500/10 px-2 py-1 rounded">Admin</span>
                        ) : (
                          <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs bg-blue-500/10 px-2 py-1 rounded">Officer</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {officer.user_metadata?.role === 'admin' ? (
                          <div className="flex items-center gap-3">
                            <span className="font-mono bg-slate-950 px-3 py-1 rounded border border-slate-700 text-emerald-400 font-bold tracking-widest">
                              {officer.user_metadata?.monthly_admin_code || 'Not Set'}
                            </span>
                            <button
                              onClick={() => handleRegenerateCode(officer.id)}
                              disabled={actionLoadingId === officer.id}
                              className="bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded font-semibold transition-all border border-slate-700 flex items-center gap-1 disabled:opacity-50"
                            >
                              <RefreshCcw className={`w-3 h-3 ${actionLoadingId === officer.id ? 'animate-spin' : ''}`} />
                              Regenerate
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs italic">N/A (Standard Officer)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-slate-400">{formatDate(officer.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-slate-500 flex items-center gap-3">
                        <span>{formatDate(officer.last_sign_in_at)}</span>
                        {officer.user_metadata?.role !== 'super_admin' && (
                          <button
                            onClick={() => handleResetPassword(officer.id, officer.email)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-400 px-3 py-1.5 rounded font-semibold transition-all border border-amber-500/30"
                          >
                            🔑 Reset Pass
                          </button>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => {
                setIsModalOpen(false)
                setModalStatus('idle')
                setNewUser({ email: '', password: '', role: 'officer', secretKey: '' })
              }} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-2">Create New Account</h2>
            <p className="text-sm text-slate-400 mb-6">Provision access for a new MoSPI official.</p>
            
            {modalStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p>{modalMsg}</p>
              </div>
            )}
            {modalStatus === 'success' && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <p>{modalMsg}</p>
              </div>
            )}
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Official Email</label>
                <input 
                  type="email" required 
                  value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-600" 
                  placeholder="name@mospi.gov.in"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Temporary Password</label>
                <input 
                  type="password" required minLength={6}
                  value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-600" 
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Clearance Role</label>
                <select 
                  value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="officer">Standard Officer (View Only)</option>
                  <option value="admin">Admin (Manage Data)</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-bold text-red-400 mb-1 flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  Admin Creation Key (Mandatory)
                </label>
                <div className="relative">
                  <input 
                    type="password" required 
                    value={newUser.secretKey} onChange={e => setNewUser({...newUser, secretKey: e.target.value})}
                    className="w-full bg-slate-950 border border-red-500/50 rounded-xl px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all font-mono tracking-widest placeholder-slate-600" 
                    placeholder="Enter Secondary Authorization"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">*Required to verify your intent to create this user.</p>
              </div>

              <button 
                type="submit" disabled={modalStatus === 'loading' || modalStatus === 'success'}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {modalStatus === 'loading' ? (
                  <Activity className="w-5 h-5 animate-spin" />
                ) : modalStatus === 'success' ? (
                  <ShieldCheck className="w-5 h-5" />
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