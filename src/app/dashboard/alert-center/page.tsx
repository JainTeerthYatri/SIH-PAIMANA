'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  ShieldCheck
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
  
  // 🔐 Security Role State
  const [userRole, setUserRole] = useState<UserRole>('admin')

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

  // 🔐 Fetch User Role
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

  // 🔄 Fetch Projects & Merge Status from isolated 'alert_statuses' table
  const fetchAlertsAndCounts = useCallback(async () => {
    try {
      setLoading(true)

      // 1. Fetch all projects with overrun
      const { data: projectsData, error: prjError } = await supabase
        .from('paimana_projects')
        .select('*')
        .gt('cost_overrun_cr', 0)
        .order('cost_overrun_cr', { ascending: false })

      if (prjError) throw prjError

      // 2. Fetch all statuses from NAYI TABLE 'alert_statuses'
      const { data: statusData, error: stError } = await supabase
        .from('alert_statuses')
        .select('project_id, status')

      if (stError) {
        console.warn('Status table read warning (will default to OPEN):', stError)
      }

      // Map status table entries to dictionary
      const statusMap = new Map<string | number, AlertStatus>()
      if (statusData) {
        statusData.forEach((st) => {
          statusMap.set(st.project_id, st.status as AlertStatus)
        })
      }

      if (projectsData) {
        // Build all dynamic alert items
        const allAlerts: AlertItem[] = projectsData.map((item, idx) => {
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

          // Fetch status from new table or default to OPEN
          const currentStatus: AlertStatus = statusMap.get(item.id) || 'OPEN'

          return {
            id: item.id,
            projectId: `PRJ-${item.id}`,
            projectName: item.project_name || 'Central Infrastructure Project',
            title: `Cost Overrun Trigger: +₹${overrun.toLocaleString()} Cr Escalation`,
            explanation: `Project in ${item.State || 'Multi-States'} reported ₹${overrun.toLocaleString()} Cr cost overrun over ₹${(item.original_cost_cr || 0).toLocaleString()} Cr sanctioned budget.`,
            severity: sev,
            status: currentStatus,
            recommendedAction: overrun > 500
              ? 'Initiate High-Level Inter-Ministerial Committee Review & Expenditure Audit.'
              : overrun > 100
              ? 'Issue formal query to Project Monitoring Unit and fast-track land clearance.'
              : 'Request updated Common Upload Form (CUF) monthly progress report.',
            timestamp: `${(idx % 12) + 1} hours ago`
          }
        })

        // 📊 Accurately Calculate Header Metric Summary
        let opn = 0, ack = 0, inp = 0, res = 0
        allAlerts.forEach(a => {
          if (a.status === 'OPEN') opn++
          else if (a.status === 'ACKNOWLEDGED') ack++
          else if (a.status === 'IN_PROGRESS') inp++
          else if (a.status === 'RESOLVED') res++
        })

        setCounts({
          total: allAlerts.length,
          open: opn,
          acknowledged: ack,
          in_progress: inp,
          resolved: res
        })

        // Filter Logic
        let filtered = allAlerts

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          filtered = filtered.filter(a => 
            a.projectName.toLowerCase().includes(q) || 
            a.explanation.toLowerCase().includes(q)
          )
        }

        if (filterStatus !== 'ALL') {
          filtered = filtered.filter(a => a.status === filterStatus)
        }

        if (filterSeverity !== 'ALL') {
          filtered = filtered.filter(a => a.severity === filterSeverity)
        }

        setTotalCount(filtered.length)

        // Paginate client side
        const from = (currentPage - 1) * itemsPerPage
        const paginated = filtered.slice(from, from + itemsPerPage)

        setAlerts(paginated)
      }
    } catch (err) {
      console.error('Error fetching alerts:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, filterStatus, filterSeverity])

  // Initial Load + Realtime Listener on Nayi Table 'alert_statuses'
  useEffect(() => {
    fetchAlertsAndCounts()

    // ⚡ Realtime subscription ONLY on the isolated 'alert_statuses' table
    const channel = supabase
      .channel('realtime_alert_statuses')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alert_statuses' },
        () => {
          fetchAlertsAndCounts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAlertsAndCounts])

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  // ⚡ Status Save in Isolated Nayi Table (`alert_statuses`)
  const handleStatusUpdate = async (alertId: string | number, newStatus: AlertStatus) => {
    if (!canChangeStatus) return

    // Optimistic UI update
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: newStatus } : a))

    // Upsert into isolated alert_statuses table
    const { error } = await supabase
      .from('alert_statuses')
      .upsert(
        { project_id: alertId, status: newStatus, updated_at: new Date().toISOString() },
        { onConflict: 'project_id' }
      )

    if (error) {
      console.error('Failed to update status in alert_statuses:', error)
      fetchAlertsAndCounts()
    } else {
      fetchAlertsAndCounts()
    }
  }

  const canChangeStatus = userRole === 'admin' || userRole === 'super-admin'
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1

  return (
    <div className="p-4 sm:p-8 bg-[#FFF9EF] min-h-screen text-slate-900 font-sans space-y-6">
      
      {/* 🏛️ RE-DESIGNED CLEAN HEADER */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Top Meta Line */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#F59A00] tracking-wider uppercase">
              EARLY INTERVENTION ENGINE
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-extrabold rounded-md border border-red-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE REALTIME ENGINE
            </span>
          </div>

          <div className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md flex items-center gap-1 border uppercase ${
            userRole === 'super-admin' 
              ? 'bg-purple-50 text-purple-700 border-purple-200' 
              : userRole === 'admin'
              ? 'bg-sky-50 text-sky-700 border-sky-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            <ShieldCheck className="w-3 h-3" /> Role: {userRole}
          </div>
        </div>

        {/* Title + Compact Metric Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
              Intelligent Alert Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time proactive cost escalation triggers from MoSPI database
            </p>
          </div>

          {/* 📊 REALTIME ACCURATE METRIC BAR */}
          <div className="flex items-center gap-1 bg-slate-50/90 p-1.5 rounded-xl border border-slate-200/80 shrink-0 self-start lg:self-auto overflow-x-auto max-w-full">
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#17365D] text-white rounded-lg text-xs font-bold shrink-0 transition-transform hover:scale-[1.02]">
              <span className="text-[10px] text-[#F59A00] uppercase tracking-wider font-extrabold">TOTAL ALERTS</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs font-black">{counts.total}</span>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 my-auto mx-1 shrink-0" />

            {/* OPEN */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-700 rounded-lg border border-slate-200/70 text-xs font-semibold shrink-0 transition-all hover:scale-[1.02]">
              <span className="text-slate-500 text-[11px] font-bold">OPEN</span>
              <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[11px] font-black rounded-md">{counts.open}</span>
            </div>

            {/* ACKNOWLEDGED */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-700 rounded-lg border border-slate-200/70 text-xs font-semibold shrink-0 transition-all hover:scale-[1.02]">
              <span className="text-slate-500 text-[11px] font-bold">ACKNOWLEDGED</span>
              <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[11px] font-black rounded-md">{counts.acknowledged}</span>
            </div>

            {/* IN PROGRESS */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-700 rounded-lg border border-slate-200/70 text-xs font-semibold shrink-0 transition-all hover:scale-[1.02]">
              <span className="text-slate-500 text-[11px] font-bold">IN PROGRESS</span>
              <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[11px] font-black rounded-md">{counts.in_progress}</span>
            </div>

            {/* RESOLVED */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-semibold shrink-0 transition-all hover:scale-[1.02]">
              <span className="text-emerald-800 text-[11px] font-bold">RESOLVED</span>
              <span className="px-2 py-0.5 bg-emerald-700 text-white text-[11px] font-black rounded-md">{counts.resolved}</span>
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
                onClick={() => { setFilterSeverity(sev); setCurrentPage(1); }}
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
                onClick={() => { setFilterStatus(st); setCurrentPage(1); }}
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
            <p className="text-xs font-bold text-[#17365D]">Loading real-time alerts...</p>
          </div>
        ) : alerts.length > 0 ? (
          alerts.map((alert) => (
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

              {/* 🔒 STATUS CHANGE SECTION */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="font-semibold text-slate-500 flex items-center gap-2">
                  <span>Current Status:</span>
                  <span className="font-extrabold text-[#17365D] uppercase px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200">
                    {alert.status.replace('_', ' ')}
                  </span>
                </div>

                {canChangeStatus ? (
                  <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                    {(['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusUpdate(alert.id, st)}
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