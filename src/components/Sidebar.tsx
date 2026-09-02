'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, BarChart3, Bot, Activity, Menu, ChevronLeft, LogOut } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()

  // Links updated to match the new nested routing
  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'All Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'AI Chatbot', href: '/dashboard/chatbot', icon: Bot },
  ]

  const handleLogout = () => {
    document.cookie = "paimana_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = '/login'
  }

  return (
    <div className={`fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-50 flex flex-col shadow-2xl ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className={`p-4 flex items-center border-b border-slate-800 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <div className="flex items-center gap-3">
            <Activity className="text-blue-500 w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-wider">PAIMANA</h1>
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 hover:text-blue-400">
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-6 h-6 text-blue-500" />}
        </button>
      </div>
      
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.name} href={item.href} title={!isOpen ? item.name : ''} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${!isOpen && 'justify-center'}`}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className={`${!isOpen && 'hidden'}`}>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className={`p-4 border-t border-slate-800 ${!isOpen && 'flex justify-center'}`}>
        <button onClick={handleLogout} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 ${!isOpen && 'justify-center'}`} title={!isOpen ? "Logout" : ""}>
          <LogOut className="w-5 h-5 shrink-0" />
          <span className={`${!isOpen && 'hidden'}`}>Logout</span>
        </button>
      </div>
    </div>
  )
}