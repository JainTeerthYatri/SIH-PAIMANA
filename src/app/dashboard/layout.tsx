'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LayoutDashboard, FolderKanban, PieChart, Bot, ShieldCheck, LogOut, Menu, X, Landmark } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  // 🛡️ NAYA STATE: User ka role store karne ke liye
  const [userRole, setUserRole] = useState<string>('officer')

  useEffect(() => {
    // Component load hote hi Supabase se current user ka data nikalenge
    async function fetchUserRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.role) {
        setUserRole(user.user_metadata.role)
      }
    }
    fetchUserRole()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    document.cookie = "paimana_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = '/login'
  }

  const navLinks = [
    { name: 'Dashboard Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Project Directory', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'AI Analytics', href: '/dashboard/analytics', icon: PieChart },
    { name: 'Predictive Chatbot', href: '/dashboard/chatbot', icon: Bot },
  ]

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* 📱 Mobile Menu Toggle */}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* 💻 SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Brand Logo */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/50">
          <Landmark className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">PAIMANA</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Workspace</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <link.icon className={`w-5 h-5 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* 🛡️ BOTTOM SECTION: ADMIN CONTROLS & LOGOUT */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 space-y-2">
          
          {/* THE MAGIC TRICK: Ye link sirf Admin ko dikhega */}
          {userRole === 'admin' && (
            <Link 
              href="/admin"
              className="flex items-center justify-between px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl transition-all font-bold text-sm"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" />
                Admin Panel
              </div>
            </Link>
          )}

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 📄 MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}
    </div>
  )
}