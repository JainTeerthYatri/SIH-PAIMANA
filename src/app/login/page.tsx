'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getDynamic2FACode } from '@/lib/auth-utils'
import { Activity, Lock, Mail, ShieldCheck, KeyRound, ShieldAlert } from 'lucide-react'

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'standard' | 'godmode'>('standard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Standard Form States (Officer & Admin)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactor, setTwoFactor] = useState('') // Daily 2FA Code

  // God Mode Form States (Super Admin - 3 Factor Auth)
  const [godEmail, setGodEmail] = useState('')
  const [godPassword, setGodPassword] = useState('')
  const [secretKey, setSecretKey] = useState('') // Master Key

  // 1️⃣ STANDARD LOGIN (Strict 2FA Enforced for Officers)
  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Step 1: Check credentials with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Agar role missing hai (purane accounts), toh default 'officer' maano
      const role = data.user?.user_metadata?.role || 'officer'

      // 🛡️ STRICT DUAL-FACTOR SECURITY CHECK
      // Agar banda admin nahi hai, toh 2FA lazmi hai (No Bypass allowed!)
      if (role !== 'admin') {
        
        // Check 1: Code daala bhi hai ya nahi?
        if (!twoFactor) {
          await supabase.auth.signOut()
          throw new Error('2FA REQUIRED: Please enter the 6-Digit Daily Security Code.')
        }

        const currentDynamicCode = getDynamic2FACode()
        
        // Check 2: Code sahi hai ya nahi?
        if (twoFactor !== currentDynamicCode) {
          await supabase.auth.signOut() 
          throw new Error('2FA FAILED: Invalid or expired Security Code. Please contact your Admin.')
        }
      }

      // Step 2: Set session cookie for Middleware ONLY if 2FA is passed
      document.cookie = `paimana_session=true; path=/; max-age=86400`

      // Step 3: Redirect based on role
      if (role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 2️⃣ GOD MODE BYPASS (3-Factor Authentication)
  const handleGodModeLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Server se 3 cheezein verify hongi ab!
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
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-red-100/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Toggle Buttons */}
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 mb-6">
          <button 
            onClick={() => { setLoginType('standard'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${loginType === 'standard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Official Login
          </button>
          <button 
            onClick={() => { setLoginType('godmode'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${loginType === 'godmode' ? 'bg-slate-900 text-red-400 shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ShieldAlert className="w-4 h-4" /> Top Secret
          </button>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 transition-all">
          <div className="flex flex-col items-center mb-8">
            <div className={`p-4 rounded-2xl shadow-lg mb-4 ${loginType === 'godmode' ? 'bg-slate-900 text-red-500' : 'bg-blue-100 text-blue-600'}`}>
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {loginType === 'godmode' ? 'Super Admin Portal' : 'PAIMANA Gateway'}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider text-center">
              {loginType === 'godmode' ? 'Restricted Access Only' : 'Enter your credentials'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* 🔵 STANDARD LOGIN FORM */}
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

              {/* DYNAMIC 2FA CODE FIELD */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-sm font-bold text-emerald-600 mb-2">Security Clearance Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-emerald-500" /></div>
                  <input type="password" value={twoFactor} onChange={(e) => setTwoFactor(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-emerald-200 rounded-xl text-slate-900 placeholder-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-emerald-50 focus:bg-white transition-all font-mono tracking-widest"
                    placeholder="Enter 6-Digit Code"
                  />
                </div>
                <p className="text-[10px] font-semibold text-slate-500 mt-2">*Mandatory for Standard Officers. Admins may leave this blank.</p>
              </div>

              <button type="submit" disabled={loading} className="w-full mt-4 flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70">
                {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Authenticate System'}
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