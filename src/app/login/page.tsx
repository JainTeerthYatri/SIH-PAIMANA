'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getDynamic2FACode } from '@/lib/auth-utils'
import {
  Lock,
  Mail,
  ShieldCheck,
  KeyRound,
  ShieldAlert,
  UserCog,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'standard' | 'admin' | 'godmode'>('standard')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)

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
          secretKey: secretKey,
        }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      if (data.role === 'super_admin') {
        document.cookie = 'paimana_godmode=true; path=/; max-age=86400'
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
    <div className="min-h-screen bg-[#FFF9EF] flex items-center justify-center p-4 md:p-10 font-sans">
      {/* Main Login Container */}
      <div className="flex flex-col lg:flex-row w-[1060px] max-w-full min-h-[640px] rounded-3xl overflow-hidden shadow-2xl border border-[#EAE2D5] bg-white">
        
        {/* LEFT COLUMN: Government / PAIMANA Branding */}
        <div className="lg:w-[52%] bg-[#0B192C] bg-[radial-gradient(circle_at_20%_20%,rgba(14,116,144,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(245,154,0,0.08)_0%,transparent_50%)] p-8 md:p-11 flex flex-col justify-between text-white relative overflow-hidden">
          <div>
            {/* Header / Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EA580C] to-[#F59A00] flex items-center justify-center text-white font-black text-xl shadow-lg">
                P
              </div>
              <div>
                <span className="text-xl font-black tracking-wider text-white">PAIMANA</span>
                <span className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase">MoSPI Analytics</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-2xl md:text-3xl font-extrabold leading-snug mb-4 tracking-tight">
              Predict infrastructure project risks <span className="text-[#F59A00]">before</span> they impact cost & schedule.
            </h1>

            {/* Description */}
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-6">
              AI-powered intelligence platform transforming Common Upload Form (CUF) infrastructure data into early risk intervention indicators for national decision makers.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {[
                'Explainable SHAP Cost Driver Factorization',
                'Statistical & Gradient Boosted Model Benchmarking',
                'Automated MoSPI CUF CSV Record Parser',
                'Role-Based Executive Risk Dashboards',
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 text-xs md:text-sm text-slate-200 font-medium">
                  <div className="w-5 h-5 rounded-full bg-[#F59A00]/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={15} className="text-[#F59A00]" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Illuminated Bridge SVG Graphic */}
          <div className="w-full mt-auto relative h-36 overflow-hidden">
            <svg viewBox="0 0 600 200" className="w-full h-full block">
              <defs>
                <linearGradient id="bridgeLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#F59A00" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <g opacity="0.25">
                {[...Array(12)].map((_, i) => (
                  <circle key={i} cx={50 * i + 20} cy={120 - (i % 4) * 15} r="2" fill="#38BDF8" />
                ))}
              </g>
              <path d="M 0,130 Q 150,170 300,120 T 600,100" stroke="url(#bridgeLineGrad)" strokeWidth="2.5" fill="none" />
              <path d="M 0,140 Q 200,185 400,135 T 600,120" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.6" />
              <line x1="180" y1="190" x2="180" y2="100" stroke="#38BDF8" strokeWidth="3" opacity="0.7" />
              <line x1="380" y1="190" x2="380" y2="90" stroke="#38BDF8" strokeWidth="3" opacity="0.7" />
              {[40, 70, 100, 130, 160, 210, 240, 270, 300, 330, 360, 410, 440, 470, 500, 530, 560].map((x, idx) => (
                <line key={idx} x1={x} y1="170" x2={x} y2={120 + Math.sin(idx) * 20} stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" />
              ))}
              <line x1="0" y1="170" x2="600" y2="170" stroke="#F59A00" strokeWidth="3.5" />
              <circle cx="180" cy="100" r="4" fill="#F59A00" />
              <circle cx="380" cy="90" r="4" fill="#F59A00" />
              <circle cx="300" cy="120" r="3" fill="#38BDF8" />
              <circle cx="450" cy="145" r="3" fill="#38BDF8" />
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: Mode Selector & Form */}
        <div className="lg:w-[48%] bg-white p-8 md:p-10 flex flex-col justify-center">
          
          {/* Top Mode Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => { setLoginType('standard'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                loginType === 'standard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Officer
            </button>
            <button
              type="button"
              onClick={() => { setLoginType('admin'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                loginType === 'admin' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => { setLoginType('godmode'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                loginType === 'godmode' ? 'bg-slate-900 text-red-400 shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> God Mode
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className={`p-3 rounded-2xl shadow-sm ${
              loginType === 'godmode' ? 'bg-slate-900 text-red-400' : loginType === 'admin' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {loginType === 'admin' ? <UserCog className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {loginType === 'godmode' ? 'Super Admin Portal' : loginType === 'admin' ? 'Admin Gateway' : 'PAIMANA Gateway'}
              </h2>
              <p className="text-xs font-medium text-slate-500">
                {loginType === 'godmode' ? 'Restricted Access Only' : loginType === 'admin' ? 'Enter 8-Digit Monthly Cipher' : 'Officer Credentials'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium flex items-start gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 🔵 1. OFFICER LOGIN FORM */}
          {loginType === 'standard' && (
            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFBF5] border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="officer@mospi.gov.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FFFBF5] border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-emerald-600 mb-1.5">Daily Security Clearance Code *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={twoFactor}
                    onChange={(e) => setTwoFactor(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm text-slate-900 font-mono tracking-widest focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="Enter 6-Digit Code"
                  />
                </div>
                <p className="text-[10px] font-medium text-slate-400 mt-1">*Mandatory 6-Hour Dynamic 2FA for Officers.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-[#F59A00] to-[#EA580C] text-white rounded-xl text-sm font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Authenticate Officer</span> <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* 🟢 2. ADMIN LOGIN FORM */}
          {loginType === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Admin Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFBF5] border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="admin@mospi.gov.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FFFBF5] border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-emerald-600 mb-1.5">8-Digit Monthly Master Cipher *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    maxLength={8}
                    required
                    value={monthlyCode}
                    onChange={(e) => setMonthlyCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl text-sm text-slate-900 font-mono tracking-widest text-center focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="--------"
                  />
                </div>
                <p className="text-[10px] font-medium text-slate-400 mt-1">*Issued monthly by Super Admin.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 mt-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Authorize Admin Session</span> <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* 🔴 3. GOD MODE LOGIN FORM */}
          {loginType === 'godmode' && (
            <form onSubmit={handleGodModeLogin} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">Root Email *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={godEmail}
                      onChange={(e) => setGodEmail(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                      placeholder="Root ID"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">Root Password *</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={godPassword}
                      onChange={(e) => setGodPassword(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Authorization Secret Key *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 text-white border border-slate-800 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:border-red-500 transition-all placeholder:text-slate-500"
                    placeholder="Enter Master Secret Key"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !secretKey || !godEmail || !godPassword}
                className="w-full py-3.5 px-4 mt-2 bg-slate-900 text-red-400 border border-red-500/30 rounded-xl text-sm font-bold shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <><span>Verify God Clearance</span> <ShieldAlert size={16} /></>}
              </button>
            </form>
          )}

          {/* Contact Admin Footer */}
          <div className="text-center mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
            Having trouble logging in?{' '}
            <span
              onClick={() => alert('Please contact MoSPI System Administrator for access & credentials.')}
              className="text-slate-900 font-bold cursor-pointer hover:underline"
            >
              Contact Administrator
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}