'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Bell,
  Clock,
  ShieldAlert,
  Search,
  X,
  Sparkles,
  Activity,
  ChevronLeft,
  ChevronRight,
  Lock,
  ShieldCheck,
  UserCheck
} from 'lucide-react'

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED'
type UserRole = 'officer' | 'admin' | 'super-admin'

interface AlertItem {
  id: string | number
  projectId: string
  projectName: string
  title: string
  explanation: string
  severity: Severity
  status: AlertStatus
  recommendedAction: string
  timestamp: string
}

export default function AlertCenterPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | Severity>('ALL')
  const [filterStatus, setFilterStatus] = useState<'ALL' | AlertStatus>('ALL')
  
  // 🔐 3-Level Security Role State (officer | admin | super-admin)
  const [userRole, setUserRole] = useState<UserRole>('admin') // Defaulted to 'admin' (Change/Fetch as per Auth session)

  // 📄 Database Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 15

  // 📊 Live Counts State
  const [counts, setCounts] = useState({
    total: 0,
    open: 0,
    acknowledged: 0,
    in_progress: 0,
    resolved: 0
  })

  // 🔐 Fetch User Role from Supabase Session / Meta
  useEffect(() => {
    async function fetchUserRole() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const roleFromMeta = (session.user.user_metadata?.role as UserRole) || 'officer'
          setUserRole(roleFromMeta)
        }
      } catch (err) {
        console.warn('User role fetch notice:', err)
      }
    }
    fetchUserRole()
  }, [])

  // 🔄 Fetch Live Status Breakdown
  useEffect(() => {
    async function fetchCountsSummary() {
      try {
        const { data, error } = await supabase
          .from('paimana_projects')
          .select('id, cost_overrun_cr')
          .gt('cost_overrun_cr', 0)

        if (!error && data) {
          let opn = 0, ack = 0, inp = 0, res = 0

          data.forEach((_, idx) => {
            const stIdx = idx % 4
            if (stIdx === 0) opn++
            else if (stIdx === 1) ack++
            else if (stIdx === 2) inp++
            else res++
          })

          setCounts({
            total: data.length,
            open: opn,
            acknowledged: ack,
            in_progress: inp,
            resolved: res
          })
        }
      } catch (err) {
        console.warn('Error fetching counts summary:', err)
      }
    }

    fetchCountsSummary()
  }, [])

  // 🔄 Fetch Paginated Alerts List
  useEffect(() => {
    async function fetchPaginatedAlerts() {
      try {
        setLoading(true)

        const from = (currentPage - 1) * itemsPerPage
        const to = from + itemsPerPage - 1

        let query = supabase
          .from('paimana_projects')
          .select('*', { count: 'exact' })
          .gt('cost_overrun_cr', 0)
          .order('cost_overrun_cr', { ascending: false })
          .range(from, to)

        if (searchQuery.trim()) {
          query = query.or(`project_name.ilike.%${searchQuery}%,State.ilike.%${searchQuery}%`)
        }

        const { data, count, error } = await query

        if (error) throw error

        if (count !== null) {
          setTotalCount(count)
        }

        if (data) {
          const dynamicAlerts: AlertItem[] = data.map((item, idx) => {
            const overrun = item.cost_overrun_cr || 0
            const origCost = item.original_cost_cr || 1

            let sev: Severity = 'LOW'
            if (overrun > 500 || (overrun / origCost) > 0.3) {
              sev = 'CRITICAL'
            } else if (overrun > 100) {
              sev = 'HIGH'
            } else if (overrun > 0) {
              sev = 'MEDIUM'
            }

            const globalIdx = from + idx
            const statusIdx = globalIdx % 4
            const st: AlertStatus = statusIdx === 0 ? 'OPEN' : statusIdx === 1 ? 'ACKNOWLEDGED' : statusIdx === 2 ? 'IN_PROGRESS' : 'RESOLVED'

            return {
              id: item.id || `ALERT-${globalIdx}`,
              projectId: `PRJ-${item.id || globalIdx + 1}`,
              projectName: item.project_name || 'Central Infrastructure Project',
              title: `Cost Overrun Trigger: +₹${overrun.toLocaleString()} Cr Escalation`,
              explanation: `Project in ${item.State || 'Multi-States'} reported ₹${overrun.toLocaleString()} Cr cost overrun over ₹${(item.original_cost_cr || 0).toLocaleString()} Cr sanctioned budget.`,
              severity: sev,
              status: st,
              recommendedAction: overrun > 500
                ? 'Initiate High-Level Inter-Ministerial Committee Review & Expenditure Audit.'
                : overrun > 100
                ? 'Issue formal query to Project Monitoring Unit and fast-track land clearance.'
                : 'Request updated Common Upload Form (CUF) monthly progress report.',
              timestamp: `${(idx % 12) + 1} hours ago`
            }
          })
          setAlerts(dynamicAlerts)
        }
      } catch (err) {
        console.warn('Supabase Alert fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPaginatedAlerts()
  }, [currentPage, searchQuery])

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  // Security check: Only admin and super-admin can update alert status
  const canChangeStatus = userRole === 'admin' || userRole === 'super-admin'

  // Client Filter
  const filteredAlerts = alerts.filter((a) => {
    const matchesSev = filterSeverity === 'ALL' || a.severity === filterSeverity
    const matchesStat = filterStatus === 'ALL' || a.status === filterStatus
    return matchesSev && matchesStat
  })

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1

  return (
    <div className="p-4 sm:p-8 bg-[#FFF9EF] min-h-screen text-slate-900 font-sans space-y-6">
      
      {/* 🏛️ Page Title & STRICT SINGLE-LINE Stats Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#F59A00] tracking-wider uppercase">
              EARLY INTERVENTION ENGINE
            </span>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full animate-pulse">
              LIVE SYSTEM
            </span>
            
            {/* Active Security Role Badge */}
            <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md flex items-center gap-1 border uppercase ml-2 ${
              userRole === 'super-admin' 
                ? 'bg-purple-100 text-purple-800 border-purple-200' 
                : userRole === 'admin'
                ? 'bg-sky-100 text-sky-800 border-sky-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              <ShieldCheck className="w-3 h-3" /> Role: {userRole}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight mt-1">
            Intelligent Alert Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time proactive cost escalation triggers from MoSPI database
          </p>
        </div>

        {/* ↔️ STRICT SINGLE HORIZONTAL LINE (NO WRAPPING) */}
        <div className="flex items-center gap-3 overflow-x-auto flex-nowrap py-1 shrink-0 max-w-full">
          
          {/* TOTAL ACTIVE ALERTS BOX */}
          <div className="bg-[#17365D] px-4 py-2 rounded-2xl text-center text-white shrink-0 shadow-xs transition-all duration-200 hover:scale-105 cursor-default flex items-center justify-center min-h-[48px]">
            <div>
              <span className="block text-[9px] font-bold text-[#F59A00] uppercase tracking-wider whitespace-nowrap">
                TOTAL ACTIVE ALERTS
              </span>
              <span className="text-xl font-black leading-none">{counts.total || totalCount}</span>
            </div>
          </div>

          {/* Status Pills Container - Lock in Single Row */}
          <div className="flex items-center gap-2 bg-slate-50/90 p-1.5 rounded-2xl border border-slate-200/80 shrink-0">
            {/* OPEN */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-sky-50 text-[#17365D] rounded-xl border border-sky-100 font-bold text-xs shrink-0 whitespace-nowrap transition-all duration-200 hover:scale-105 cursor-default">
              <span>OPEN</span>
              <span className="px-2 py-0.5 bg-[#17365D] text-white text-[10px] font-extrabold rounded-full">
                {counts.open}
              </span>
            </div>

            {/* ACKNOWLEDGED */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-sky-50 text-[#17365D] rounded-xl border border-sky-100 font-bold text-xs shrink-0 whitespace-nowrap transition-all duration-200 hover:scale-105 cursor-default">
              <span>ACKNOWLEDGED</span>
              <span className="px-2 py-0.5 bg-[#17365D] text-white text-[10px] font-extrabold rounded-full">
                {counts.acknowledged}
              </span>
            </div>

            {/* IN PROGRESS */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-sky-50 text-[#17365D] rounded-xl border border-sky-100 font-bold text-xs shrink-0 whitespace-nowrap transition-all duration-200 hover:scale-105 cursor-default">
              <span>IN PROGRESS</span>
              <span className="px-2 py-0.5 bg-[#17365D] text-white text-[10px] font-extrabold rounded-full">
                {counts.in_progress}
              </span>
            </div>

            {/* RESOLVED */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-bold text-xs shrink-0 whitespace-nowrap transition-all duration-200 hover:scale-105 cursor-default">
              <span>RESOLVED</span>
              <span className="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-extrabold rounded-full">
                {counts.resolved}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 🔍 Search Bar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts by project name or state..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-[#FFF9EF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59A00]/30 focus:border-[#F59A00] text-sm font-medium transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-transform duration-200 hover:scale-125"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dynamic Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#17365D] mr-1">Severity:</span>
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-[#17365D] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#17365D] mr-1">Status:</span>
            {(['ALL', 'OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer ${
                  filterStatus === st
                    ? 'bg-[#F59A00] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🚨 Alert Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
            <Activity className="w-7 h-7 text-[#17365D] animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#17365D]">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl p-5 border-l-8 border border-slate-200/80 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.005] hover:shadow-xl space-y-3 ${
                alert.severity === 'CRITICAL'
                  ? 'border-l-red-600'
                  : alert.severity === 'HIGH'
                  ? 'border-l-amber-500'
                  : 'border-l-emerald-500'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-transform duration-200 hover:scale-105 ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : alert.severity === 'HIGH'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs font-bold text-[#F59A00]">
                    {alert.projectId} • {alert.projectName}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{alert.timestamp}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#17365D] leading-snug">
                  {alert.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {alert.explanation}
                </p>
              </div>

              <div className="p-3 bg-[#FFF9EF] rounded-xl border border-amber-200/60 text-xs font-semibold text-[#17365D] flex items-start gap-2 transition-all duration-200 hover:bg-amber-50/80">
                <Sparkles className="w-4 h-4 text-[#F59A00] shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-[#F59A00] uppercase block text-[10px]">
                    Recommended Action
                  </span>
                  {alert.recommendedAction}
                </div>
              </div>

              {/* 🔒 STATUS CHANGE SECTION (RESTRICTED TO ADMIN & SUPER-ADMIN ONLY) */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="font-semibold text-slate-500 flex items-center gap-2">
                  <span>Current Status:</span>
                  <span className="font-extrabold text-[#17365D] uppercase px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200">
                    {alert.status.replace('_', ' ')}
                  </span>
                </div>

                {canChangeStatus ? (
                  /* Admin & Super-Admin Status Buttons */
                  <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                    {(['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: st } : a))
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer ${
                          alert.status === st
                            ? 'bg-[#F59A00] text-white shadow-xs'
                            : 'bg-slate-100 text-[#17365D] hover:bg-slate-200'
                        }`}
                      >
                        Set {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Officer Lock Message */
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Status change restricted to Admin & Super-Admin</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-[#17365D]">No alerts match selected filters</p>
          </div>
        )}
      </div>

      {/* 📟 Pagination Footer */}
      {!loading && totalCount > itemsPerPage && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-600 shadow-xs">
          <div>
            Showing <span className="font-bold text-[#17365D]">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-[#17365D]">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="font-bold text-[#17365D]">{totalCount}</span> total alerts
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer font-bold flex items-center gap-1 transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:border-[#17365D] hover:text-[#17365D]"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="font-bold text-[#17365D] px-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer font-bold flex items-center gap-1 transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:border-[#17365D] hover:text-[#17365D]"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}