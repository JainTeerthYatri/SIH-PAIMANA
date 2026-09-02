'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getDynamic2FACode } from '@/lib/auth-utils'
import { Activity, Lock, Mail, ShieldCheck, KeyRound, ShieldAlert, UserCog } from 'lucide-react'

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'standard' | 'admin' | 'godmode'>('standard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Standard Form States (Officer)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactor, setTwoFactor] = useState('') // Daily 6-digit Code

  // Admin Form States (Admin - Password + 8-Digit Monthly Code)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [monthlyCode, setMonthlyCode] = useState('') // 8-Digit Cipher

  // God Mode Form States (Super Admin - 3 Factor Auth)
  const [godEmail, setGodEmail] = useState('')
  const [godPassword, setGodPassword] = useState('')
  const [secretKey, setSecretKey] = useState('') // Master Key

  // 1️⃣ STANDARD OFFICER LOGIN (Strict 6-Hour Dynamic 2FA Enforced)
  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const role = data.user?.user_metadata?.role || 'officer'

      if (role === 'admin' || role === 'super_admin') {
        await supabase.auth.signOut()
        throw new Error('Unauthorized portal: Admins must use the Admin Gateway tab.')
      }

      if (!twoFactor) {
        await supabase.auth.signOut()
        throw new Error('2FA REQUIRED: Please enter the 6-Digit Daily Security Code.')
      }

      const currentDynamicCode = getDynamic2FACode()
      if (twoFactor !== currentDynamicCode) {
        await supabase.auth.signOut() 
        throw new Error('2FA FAILED: Invalid or expired Security Code.')
      }

      document.cookie = `paimana_session=true; path=/; max-age=86400`
      window.location.href = '/dashboard'

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 2️⃣ ADMIN LOGIN (Password + 8-Digit Monthly Master Cipher)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      })

      if (error) throw error

      const role = data.user?.user_metadata?.role
      const serverStoredCode = data.user?.user_metadata?.monthly_admin_code

      if (role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Access Denied: Account lacks Admin clearance privileges.')
      }

      if (serverStoredCode && monthlyCode !== serverStoredCode) {
        await supabase.auth.signOut()
        throw new Error('Access Denied: Invalid or Expired Monthly Admin Security Cipher.')
      }

      document.cookie = `paimana_session=true; path=/; max-age=86400`
      window.location.href = '/admin'

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 3️⃣ GOD MODE BYPASS (Super Admin 3-Factor Authentication)
  const handleGodModeLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: godEmail, 
          password: godPassword, 
          secretKey: secretKey 
        })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      if (data.role === 'super_admin') {
        document.cookie = "paimana_godmode=true; path=/; max-age=86400"
        window.location.href = '/super-admin'
      } else {
        throw new Error('Key is valid but God Mode clearance is missing.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-red-100/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Toggle 3 Modes */}
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 mb-6">
          <button 
            onClick={() => { setLoginType('standard'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginType === 'standard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Officer
          </button>
          <button 
            onClick={() => { setLoginType('admin'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginType === 'admin' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Admin
          </button>
          <button 
            onClick={() => { setLoginType('godmode'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${loginType === 'godmode' ? 'bg-slate-900 text-red-400 shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> God Mode
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 transition-all">
          <div className="flex flex-col items-center mb-8">
            <div className={`p-4 rounded-2xl shadow-lg mb-4 ${loginType === 'godmode' ? 'bg-slate-900 text-red-500' : loginType === 'admin' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
              {loginType === 'admin' ? <UserCog className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {loginType === 'godmode' ? 'Super Admin Portal' : loginType === 'admin' ? 'Admin Gateway' : 'PAIMANA Gateway'}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider text-center">
              {loginType === 'godmode' ? 'Restricted Access Only' : loginType === 'admin' ? 'Enter 8-Digit Monthly Cipher' : 'Officer Credentials'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* 🔵 STANDARD OFFICER LOGIN FORM */}
          {loginType === 'standard' && (
            <form onSubmit={handleStandardLogin} className="space-y-5 animate-in fade-in">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                    placeholder="officer@mospi.gov.in"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-sm font-bold text-emerald-600 mb-2">Daily Security Clearance Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-emerald-500" /></div>
                  <input type="password" value={twoFactor} onChange={(e) => setTwoFactor(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-emerald-200 rounded-xl text-slate-900 placeholder-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-emerald-50 focus:bg-white transition-all font-mono tracking-widest"
                    placeholder="Enter 6-Digit Code"
                  />
                </div>
                <p className="text-[10px] font-semibold text-slate-500 mt-2">*Mandatory for standard officers.</p>
              </div>

              <button type="submit" disabled={loading} className="w-full mt-4 flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70">
                {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Authenticate System'}
              </button>
            </form>
          )}

          {/* 🟢 ADMIN LOGIN FORM (8-Digit Monthly Cipher) */}
          {loginType === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-5 animate-in fade-in">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Email ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
                  <input type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition-all"
                    placeholder="admin@mospi.gov.in"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                  <input type="password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-sm font-bold text-emerald-600 mb-2">8-Digit Monthly Master Cipher</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-emerald-500" /></div>
                  <input type="password" maxLength={8} required value={monthlyCode} onChange={(e) => setMonthlyCode(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-emerald-300 rounded-xl text-slate-900 placeholder-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-emerald-50 focus:bg-white transition-all font-mono tracking-widest text-center"
                    placeholder="--------"
                  />
                </div>
                <p className="text-[10px] font-semibold text-slate-500 mt-2">*Provided by Super Admin for this month.</p>
              </div>

              <button type="submit" disabled={loading} className="w-full mt-4 flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-70">
                {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Authorize Admin Session'}
              </button>
            </form>
          )}

          {/* 🔴 GOD MODE LOGIN FORM (3-Factor Auth) */}
          {loginType === 'godmode' && (
            <form onSubmit={handleGodModeLogin} className="space-y-5 animate-in slide-in-from-right-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Root Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-slate-400" /></div>
                    <input type="email" required value={godEmail} onChange={(e) => setGodEmail(e.target.value)}
                      className="block w-full pl-9 pr-3 py-3 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-0 transition-all bg-slate-50 text-sm"
                      placeholder="Root ID"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Root Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-slate-400" /></div>
                    <input type="password" required value={godPassword} onChange={(e) => setGodPassword(e.target.value)}
                      className="block w-full pl-9 pr-3 py-3 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-0 transition-all bg-slate-50 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Authorization Secret Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-red-400" /></div>
                  <input type="password" required value={secretKey} onChange={(e) => setSecretKey(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-0 transition-all font-mono tracking-widest bg-slate-50"
                    placeholder="Enter Master Key"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading || !secretKey || !godEmail || !godPassword} className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-black transition-all disabled:opacity-70">
                {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify Clearance Level'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}