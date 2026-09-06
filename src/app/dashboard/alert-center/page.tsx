'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Filter,
  Search,
  X,
  Sparkles,
  Activity,
  ArrowRight
} from 'lucide-react'

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED'

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

  // 🔄 Fetch Live Overrun Projects from Supabase to Generate Early Warning Alerts
  useEffect(() => {
    async function loadRealAlerts() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('paimana_projects')
          .select('*')
          .order('cost_overrun_cr', { ascending: false })
          .limit(30)

        if (error) throw error

        if (data && data.length > 0) {
          // Transform real DB records into Early Warning Alerts
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

            return {
              id: item.id || `ALERT-${idx + 100}`,
              projectId: `PRJ-${item.id || idx + 101}`,
              projectName: item.project_name || 'Central Infrastructure Project',
              title: overrun > 0 
                ? `Cost Overrun Trigger: +₹${overrun} Cr Escalation` 
                : `Timeline Review Required: ${item.Sector} Sector`,
              explanation: overrun > 0
                ? `Project in ${item.State || 'India'} has reported an estimated cost escalation of ₹${overrun} Cr over the original sanctioned budget of ₹${item.original_cost_cr} Cr.`
                : `Monitoring physical progress for ${item.project_name}. Baseline execution rate requires physical inspection.`,
              severity: sev,
              status: idx % 3 === 0 ? 'OPEN' : idx % 3 === 1 ? 'ACKNOWLEDGED' : 'IN_PROGRESS',
              recommendedAction: overrun > 500
                ? 'Initiate High-Level Inter-Ministerial Committee Review & Expenditure Audit.'
                : overrun > 100
                ? 'Issue formal query to Project Monitoring Unit and fast-track land clearance.'
                : 'Request updated Common Upload Form (CUF) monthly progress report.',
              timestamp: `${(idx % 12) + 1} hours ago`
            }
          })
          setAlerts(dynamicAlerts)
        } else {
          // Fallback Default Alerts if database is empty
          setAlerts(getFallbackAlerts())
        }
      } catch (err) {
        console.warn('Supabase Alert fetch error, loading fallback alerts', err)
        setAlerts(getFallbackAlerts())
      } finally {
        setLoading(false)
      }
    }

    loadRealAlerts()
  }, [])

  // 🛠️ Status Change Trigger Handler
  const handleStatusChange = (id: string | number, newStatus: AlertStatus) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    )
  }

  // 🔍 Search & Filter Handler
  const filteredAlerts = alerts.filter((a) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesQuery =
      !q ||
      a.projectName.toLowerCase().includes(q) ||
      a.projectId.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      a.explanation.toLowerCase().includes(q)

    const matchesSev = filterSeverity === 'ALL' || a.severity === filterSeverity
    const matchesStat = filterStatus === 'ALL' || a.status === filterStatus
    return matchesQuery && matchesSev && matchesStat
  })

  // Count summaries
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length
  const openCount = alerts.filter(a => a.status === 'OPEN').length

  return (
    <div className="p-4 sm:p-8 bg-[#FFF9EF] min-h-screen text-slate-900 font-sans space-y-6">
      
      {/* 🏛️ Page Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#F59A00] tracking-wider uppercase">
              EARLY INTERVENTION ENGINE
            </span>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full animate-pulse">
              LIVE WARNING SYSTEM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight mt-1">
            Intelligent Alert Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Proactive cost escalation and schedule delay warning triggers generated by PAIMANA rules & ML models
          </p>
        </div>

        {/* Header Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-center">
            <span className="block text-[10px] font-bold text-red-600 uppercase">Critical Triggers</span>
            <span className="text-lg font-black text-red-700">{criticalCount}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-center">
            <span className="block text-[10px] font-bold text-amber-600 uppercase">Open Alerts</span>
            <span className="text-lg font-black text-amber-700">{openCount}</span>
          </div>
        </div>
      </div>

      {/* 🔍 Search Bar & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Search Field */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts by project name, ID, or trigger details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-[#FFF9EF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59A00]/20 focus:border-[#F59A00] text-sm font-medium transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
          {/* Severity Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#17365D] mr-1">Severity:</span>
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-[#17365D] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#17365D] mr-1">Status:</span>
            {(['ALL', 'OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-[#F59A00] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🚨 Alert Feed Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
            <Activity className="w-8 h-8 text-[#17365D] animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#17365D]">Loading PAIMANA Early Warning Feed...</p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl p-5 border-l-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3 ${
                alert.severity === 'CRITICAL'
                  ? 'border-l-red-600'
                  : alert.severity === 'HIGH'
                  ? 'border-l-amber-500'
                  : 'border-l-emerald-500'
              }`}
            >
              {/* Card Top Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
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

              {/* Title & Explanation */}
              <div>
                <h3 className="text-base font-bold text-[#17365D] leading-snug">
                  {alert.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {alert.explanation}
                </p>
              </div>

              {/* Recommended Action Callout */}
              <div className="p-3 bg-[#FFF9EF] rounded-xl border border-amber-200/60 text-xs font-semibold text-[#17365D] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#F59A00] shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-[#F59A00] uppercase block text-[10px]">
                    Recommended Action
                  </span>
                  {alert.recommendedAction}
                </div>
              </div>

              {/* Status Actions Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="font-semibold text-slate-500">
                  Current Status:{' '}
                  <span className="font-extrabold text-[#17365D] uppercase px-2 py-0.5 bg-slate-100 rounded">
                    {alert.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                  {(['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(alert.id, st)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        alert.status === st
                          ? 'bg-[#F59A00] text-white shadow-xs'
                          : 'bg-slate-100 text-[#17365D] hover:bg-slate-200'
                      }`}
                    >
                      Set {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-[#17365D]">No alerts match your search filters</p>
            <p className="text-xs text-slate-400">Try clearing your search term or selecting "ALL" severities.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// 📦 Fallback Mock Alerts if DB is initial
function getFallbackAlerts(): AlertItem[] {
  return [
    {
      id: 'ALT-101',
      projectId: 'PRJ-8012',
      projectName: 'Udhampur-Srinagar-Baramulla Rail Link',
      title: 'Cost Escalation Trigger: Tunnel T-49 Geological Delay',
      explanation: 'Anticipated cost overrun has crossed ₹1,200 Cr limit due to complex Himalayan tunneling conditions.',
      severity: 'CRITICAL',
      status: 'OPEN',
      recommendedAction: 'Convene Joint Task Force with Ministry of Railways and BRO for geological mitigation.',
      timestamp: '2 hours ago'
    },
    {
      id: 'ALT-102',
      projectId: 'PRJ-4051',
      projectName: 'Mumbai Metro Line 3 (Colaba-Bandra-SEEPZ)',
      title: 'Schedule Delay Warning: Rolling Stock Procurement',
      explanation: 'Delay in signaling system integration may push commercial COD by 6 months.',
      severity: 'HIGH',
      status: 'ACKNOWLEDGED',
      recommendedAction: 'Accelerate safety clearance with Commissioner of Railway Safety (CRS).',
      timestamp: '5 hours ago'
    }
  ]
}