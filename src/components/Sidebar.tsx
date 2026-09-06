'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderKanban, 
  ShieldAlert, 
  TrendingUp, 
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

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
  badge?: string
}

interface NavGroup {
  title: string
  items: NavItem[]
}

export default function Sidebar({ isOpen, setIsOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname()

  // 📂 Unke saare groups ko aapki Next.js App Router directory paths me map kar diya hai
  const navGroups: NavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        { path: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { path: '/dashboard/projects', label: 'Projects Registry', icon: FolderKanban }
      ]
    },
    {
      title: 'RISK & PREDICTIVE AI',
      items: [
        { path: '/dashboard/composite-risk', label: 'Composite Risk Score', icon: ShieldAlert },
        { path: '/dashboard/cost-drivers', label: 'Cost Driver Analysis', icon: TrendingUp },
        { path: '/dashboard/chatbot', label: 'PAIMANA AI Assistant', icon: Bot },
        { path: '/dashboard/benchmarking', label: 'Model Benchmarking', icon: Cpu }
      ]
    },
    {
      title: 'INTELLIGENCE & ALERTS',
      items: [
        { path: '/dashboard/ai-analytics', label: 'Sector & State Analytics', icon: BarChart3 },
        { path: '/dashboard/alert-center', label: 'Early Warning Center', icon: Bell, badge: '4' }
      ]
    },
    {
      title: 'DATA & REPORTS',
      items: [
        { path: '/dashboard/cuf-upload', label: 'CUF Data Management', icon: UploadCloud },
        { path: '/dashboard/reports', label: 'Executive Reports', icon: FileSpreadsheet }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { path: '/admin', label: 'User & System Config', icon: Users }
      ]
    }
  ]

  // 🔑 Aapka existing authentication & session cookies clear karne ka function
  const handleLogout = () => {
    document.cookie = "paimana_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "paimana_godmode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = '/login'
  }

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-[#17365D] text-white transition-all duration-300 z-50 flex flex-col shadow-[4px_0_20px_rgba(13,33,59,0.15)] overflow-y-auto overflow-x-hidden ${
        isOpen ? 'w-[265px]' : 'w-20'
      }`}
    >
      {/* 🏛️ Header with PAIMANA Branding & Dynamic Collapse Button */}
      <div className={`p-4 flex items-center border-b border-white/10 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F59A00] rounded-xl flex items-center justify-center text-[#17365D] font-black shadow-md">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">PAIMANA</h1>
              <p className="text-[10px] font-bold text-[#F59A00] uppercase tracking-widest mt-1">MoSPI Portal</p>
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

      {/* 🧭 Navigation Groups & Items */}
      <nav className="flex-1 px-3 py-4 space-y-4">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            {/* Section Title (Only visible when expanded) */}
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

                    {/* Badge Indicator */}
                    {isOpen && item.badge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
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

      {/* 📌 Footer Info Badge & Sign Out Button */}
      <div className="p-3 border-t border-white/10 space-y-2">
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
          title={!isOpen ? "Sign Out" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}