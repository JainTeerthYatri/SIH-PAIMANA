'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getDynamic2FACode } from '@/lib/auth-utils'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSwitcher from '@/context/LanguageSwitcher'
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
  ArrowLeft,
} from 'lucide-react'

type Role = 'officer' | 'admin' | 'super_admin'

export default function LoginPage() {
  const { t } = useLanguage()

  const [step, setStep] = useState<'email' | 'credentials'>('email')
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [extraCode, setExtraCode] = useState('')

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Account not found')

      setRole(data.role as Role)
      setPassword('')
      setExtraCode('')
      setStep('credentials')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (role === 'super_admin') {
        const res = await fetch('/api/admin/godmode-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            secretKey: extraCode,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'God Mode authentication failed.')
        window.location.href = '/super-admin'
        return
      }

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (authErr) throw authErr

      const userRole = data.user?.user_metadata?.role || 'officer'

      if (role === 'officer') {
        if (userRole === 'admin' || userRole === 'super_admin') {
          await supabase.auth.signOut()
          throw new Error('Unauthorized: This account is not an Officer account.')
        }
        if (!extraCode) {
          await supabase.auth.signOut()
          throw new Error('2FA REQUIRED: Please enter the 6-Digit Daily Security Code.')
        }
        const currentDynamicCode = getDynamic2FACode()
        if (extraCode !== currentDynamicCode) {
          await supabase.auth.signOut()
          throw new Error('2FA FAILED: Invalid or expired Security Code.')
        }
        document.cookie = `paimana_session=true; path=/; max-age=86400`
        window.location.href = '/dashboard'
        return
      }

      if (role === 'admin') {
        if (userRole !== 'admin') {
          await supabase.auth.signOut()
          throw new Error('Access Denied: Account lacks Admin clearance privileges.')
        }
        if (!extraCode) {
          await supabase.auth.signOut()
          throw new Error('Monthly Admin Cipher is required.')
        }
        const serverStoredCode = data.user?.user_metadata?.monthly_admin_code
        if (serverStoredCode && extraCode !== serverStoredCode) {
          await supabase.auth.signOut()
          throw new Error('Access Denied: Invalid or Expired Monthly Admin Security Cipher.')
        }
        document.cookie = `paimana_session=true; path=/; max-age=86400`
        window.location.href = '/admin'
        return
      }

      throw new Error('Unknown role.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const goBackToEmail = () => {
    setStep('email')
    setRole(null)
    setPassword('')
    setExtraCode('')
    setError('')
  }

  const headerIcon =
    role === 'admin' ? (
      <UserCog className="w-5 h-5" />
    ) : role === 'super_admin' ? (
      <ShieldAlert className="w-5 h-5" />
    ) : (
      <ShieldCheck className="w-5 h-5" />
    )

  const headerBg =
    role === 'super_admin'
      ? 'bg-slate-900 text-red-400'
      : role === 'admin'
      ? 'bg-emerald-100 text-emerald-600'
      : 'bg-blue-100 text-blue-600'

  const title =
    role === 'super_admin'
      ? t('Login.superAdminPortal')
      : role === 'admin'
      ? t('Login.adminGateway')
      : t('Login.gateway')

  const subtitle =
    role === 'super_admin'
      ? t('Login.restrictedAccess')
      : role === 'admin'
      ? t('Login.monthlyCode')
      : t('Login.officerCredentials')

  const submitLabel =
    role === 'super_admin'
      ? t('Login.verifyGod')
      : role === 'admin'
      ? t('Login.authorizeAdmin')
      : t('Login.authenticate')

  const submitClass =
    role === 'super_admin'
      ? 'bg-slate-900 text-red-400 border border-red-500/30 hover:bg-black'
      : role === 'admin'
      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
      : 'bg-gradient-to-r from-[#F59A00] to-[#EA580C] text-white hover:opacity-95'

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FFF9EF] flex items-center justify-center p-3 font-sans">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="flex flex-col lg:flex-row w-[920px] max-w-full max-h-[92vh] rounded-2xl overflow-hidden shadow-xl border border-[#EAE2D5] bg-white">
        {/* LEFT */}
        <div className="lg:w-[50%] bg-[#0B192C] bg-[radial-gradient(circle_at_20%_20%,rgba(14,116,144,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(245,154,0,0.08)_0%,transparent_50%)] p-5 md:p-6 flex flex-col justify-between text-white relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#EA580C] to-[#F59A00] flex items-center justify-center text-white font-black text-base shadow-md">
                P
              </div>
              <div>
                <span className="text-base font-black tracking-wider text-white">{t('Common.appName')}</span>
                <span className="block text-[9px] font-bold text-slate-400 tracking-widest uppercase">MoSPI Analytics</span>
              </div>
            </div>

            <h1 className="text-base md:text-lg font-extrabold leading-snug mb-2 tracking-tight">
              {t('Login.headline')}
            </h1>

            <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
              {t('Login.description')}
            </p>

            <div className="space-y-1.5 mb-2">
              {[t('Login.feat1'), t('Login.feat2'), t('Login.feat3'), t('Login.feat4')].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-200 font-medium">
                  <div className="w-4 h-4 rounded-full bg-[#F59A00]/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={12} className="text-[#F59A00]" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full mt-auto relative h-20 overflow-hidden">
            <svg viewBox="0 0 600 200" className="w-full h-full block">
              <defs>
                <linearGradient id="bridgeLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#F59A00" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <path d="M 0,130 Q 150,170 300,120 T 600,100" stroke="url(#bridgeLineGrad)" strokeWidth="2.5" fill="none" />
              <path d="M 0,140 Q 200,185 400,135 T 600,120" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.6" />
              <line x1="180" y1="190" x2="180" y2="100" stroke="#38BDF8" strokeWidth="3" opacity="0.7" />
              <line x1="380" y1="190" x2="380" y2="90" stroke="#38BDF8" strokeWidth="3" opacity="0.7" />
              <line x1="0" y1="170" x2="600" y2="170" stroke="#F59A00" strokeWidth="3.5" />
              <circle cx="180" cy="100" r="4" fill="#F59A00" />
              <circle cx="380" cy="90" r="4" fill="#F59A00" />
            </svg>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:w-[50%] bg-white p-5 md:p-6 flex flex-col justify-center">
          <div className="mb-4 flex items-center gap-2.5">
            <div className={`p-2 rounded-xl shadow-sm ${step === 'email' ? 'bg-blue-100 text-blue-600' : headerBg}`}>
              {step === 'email' ? <ShieldCheck className="w-5 h-5" /> : headerIcon}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                {step === 'email' ? t('Login.gateway') : title}
              </h2>
              <p className="text-[11px] font-medium text-slate-500">
                {step === 'email' ? t('Login.email') : subtitle}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[11px] font-medium flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleCheckEmail} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('Login.email')} *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FFFBF5] border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="officer@mospi.gov.in"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-2.5 px-3 mt-1 bg-gradient-to-r from-[#F59A00] to-[#EA580C] text-white rounded-lg text-xs font-bold shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'credentials' && role && (
            <form onSubmit={handleLogin} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('Login.email')}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 cursor-not-allowed"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={goBackToEmail}
                    className="px-2.5 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 text-xs"
                    title="Change email"
                  >
                    <ArrowLeft size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('Login.password')} *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-[#FFFBF5] border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-100">
                {role === 'officer' && (
                  <>
                    <label className="block text-[11px] font-bold text-emerald-600 mb-1">{t('Login.dailyCode')} *</label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={extraCode}
                        onChange={(e) => setExtraCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs text-slate-900 font-mono tracking-widest focus:outline-none focus:border-emerald-500 transition-all"
                        placeholder="Enter 6-Digit Code"
                      />
                    </div>
                    <p className="text-[9px] font-medium text-slate-400 mt-0.5">{t('Login.twoFaNote')}</p>
                  </>
                )}

                {role === 'admin' && (
                  <>
                    <label className="block text-[11px] font-bold text-emerald-600 mb-1">{t('Login.monthlyCode')} *</label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        maxLength={8}
                        required
                        value={extraCode}
                        onChange={(e) => setExtraCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-lg text-xs text-slate-900 font-mono tracking-widest text-center focus:outline-none focus:border-emerald-500 transition-all"
                        placeholder="--------"
                      />
                    </div>
                    <p className="text-[9px] font-medium text-slate-400 mt-0.5">{t('Login.monthlyNote')}</p>
                  </>
                )}

                {role === 'super_admin' && (
                  <>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">{t('Login.secretKey')} *</label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-red-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={extraCode}
                        onChange={(e) => setExtraCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 text-white border border-slate-800 rounded-lg text-xs font-mono tracking-widest focus:outline-none focus:border-red-500 transition-all placeholder:text-slate-500"
                        placeholder="Enter Master Secret Key"
                      />
                    </div>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !password || !extraCode}
                className={`w-full py-2.5 px-3 mt-1 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 ${submitClass}`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{submitLabel}</span>
                    {role === 'super_admin' ? <ShieldAlert size={14} /> : <ArrowRight size={14} />}
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {t('Login.trouble')}{' '}
            <span
              onClick={() => alert('Please contact MoSPI System Administrator for access & credentials.')}
              className="text-slate-900 font-bold cursor-pointer hover:underline"
            >
              {t('Login.contactAdmin')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}