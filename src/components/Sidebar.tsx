'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSwitcher from '@/context/LanguageSwitcher'
import { 
  LayoutDashboard, 
  FolderKanban, 
  ShieldAlert, 
  BarChart3, 
  Bot, 
  Cpu, 
  Bell, 
  UploadCloud, 
  FileSpreadsheet, 
  Users,
  LogOut,
  ChevronLeft,
  Menu,
  Landmark
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
  onCloseMobile?: () => void
}

export default function Sidebar({ isOpen, setIsOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [activeAlertCount, setActiveAlertCount] = useState<number>(0)
  const sidebarRef = useRef<HTMLElement>(null)

  // Real-time Active Warnings Count
  useEffect(() => {
    async function fetchAlertCount() {
      try {
        const { count, error } = await supabase
          .from('paimana_projects')
          .select('*', { count: 'exact', head: true })
          .gt('cost_overrun_cr', 0)

        if (!error && count !== null) {
          setActiveAlertCount(count)
        }
      } catch (err) {
        console.warn('Sidebar alert fetch error:', err)
      }
    }

    fetchAlertCount()

    const channel = supabase
      .channel('sidebar_alert_counter')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'paimana_projects' }, () => {
        fetchAlertCount()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!sidebarRef.current) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      sidebarRef.current.scrollBy({ top: 60, behavior: 'smooth' })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      sidebarRef.current.scrollBy({ top: -60, behavior: 'smooth' })
    }
  }

  const handleMouseEnter = () => {
    sidebarRef.current?.focus({ preventScroll: true })
  }

  const navGroups = [
    {
      title: t('Sidebar.overview'),
      items: [
        { path: '/dashboard', label: t('Sidebar.dashboard'), icon: LayoutDashboard },
        { path: '/dashboard/projects', label: t('Sidebar.projects'), icon: FolderKanban }
      ]
    },
    {
      title: t('Sidebar.riskAi'),
      items: [
        { path: '/dashboard/composite-risk', label: t('Sidebar.compositeRisk'), icon: ShieldAlert },
        { path: '/dashboard/chatbot', label: t('Sidebar.chatbot'), icon: Bot },
        { path: '/dashboard/benchmarking', label: t('Sidebar.benchmarking'), icon: Cpu }
      ]
    },
    {
      title: t('Sidebar.intelligence'),
      items: [
        { path: '/dashboard/ai-analytics', label: t('Sidebar.analytics'), icon: BarChart3 },
        { 
          path: '/dashboard/alert-center', 
          label: t('Sidebar.alertCenter'), 
          icon: Bell, 
          badge: activeAlertCount > 0 ? String(activeAlertCount) : undefined 
        }
      ]
    },
    {
      title: t('Sidebar.dataReports'),
      items: [
        { path: '/dashboard/cuf-upload', label: t('Sidebar.cufUpload'), icon: UploadCloud },
        { path: '/dashboard/reports', label: t('Sidebar.reports'), icon: FileSpreadsheet }
      ]
    },
    {
      title: t('Sidebar.system'),
      items: [
        { path: '/admin', label: t('Sidebar.admin'), icon: Users }
      ]
    }
  ]

  const handleLogout = () => {
    document.cookie = "paimana_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "paimana_godmode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = '/login'
  }

  return (
    <aside 
      ref={sidebarRef}
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onKeyDown={handleKeyDown}
      className={`fixed left-0 top-0 h-screen bg-[#17365D] text-white transition-all duration-300 z-50 flex flex-col shadow-[4px_0_20px_rgba(13,33,59,0.15)] overflow-y-auto overflow-x-hidden outline-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
        isOpen ? 'w-[265px]' : 'w-20'
      }`}
    >
      {/* Header */}
      <div className={`p-4 flex items-center border-b border-white/10 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F59A00] rounded-xl flex items-center justify-center text-[#17365D] font-black shadow-md">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
                {t('Common.appName')}
              </h1>
              <p className="text-[10px] font-bold text-[#F59A00] uppercase tracking-widest mt-1">
                MoSPI Portal
              </p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 bg-[#F59A00] rounded-xl flex items-center justify-center text-[#17365D] font-black">
            <Landmark className="w-5 h-5" />
          </div>
        )}

        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#F59A00]" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            {isOpen && (
              <div className="text-[11px] font-extrabold text-white/45 tracking-wider px-3 mb-1.5 uppercase">
                {group.title}
              </div>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.path
                const IconComponent = item.icon

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={onCloseMobile}
                    title={!isOpen ? item.label : undefined}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 border-l-4 ${
                      isActive
                        ? 'bg-[#FFF9EF] text-[#17365D] font-bold border-[#F59A00] shadow-sm'
                        : 'text-white/80 hover:bg-white/10 hover:text-white border-transparent font-medium'
                    } ${!isOpen ? 'justify-center' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#17365D]' : 'text-white/80'}`} />
                      {isOpen && <span className="truncate">{item.label}</span>}
                    </div>

                    {isOpen && item.badge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {/* Language Switcher */}
        {isOpen && (
          <div className="px-1">
            <LanguageSwitcher />
          </div>
        )}

        {isOpen && (
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-white/70">
            <div className="font-bold text-[#F59A00] mb-0.5">MoSPI CUF Platform</div>
            <div>v2.4 Predictive Intelligence</div>
            <div className="text-[10px] text-white/40 mt-1">Live Sync Active</div>
          </div>
        )}

        <button 
          onClick={handleLogout} 
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-semibold text-sm cursor-pointer ${
            !isOpen ? 'justify-center' : ''
          }`}
          title={!isOpen ? t('Common.logout') : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {isOpen && <span>{t('Common.logout')}</span>}
        </button>
      </div>
    </aside>
  )
}