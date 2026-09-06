'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { ShieldAlert, X } from 'lucide-react'

interface ToastNotice {
  id: string
  title: string
  message: string
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [toast, setToast] = useState<ToastNotice | null>(null)

  // 🔔 Listen for new Warning Projects added/updated in DB
  useEffect(() => {
    const channel = supabase
      .channel('dashboard_realtime_toast')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'paimana_projects' },
        (payload) => {
          const rec = payload.new as any
          if (rec && (rec.cost_overrun_cr || 0) > 0) {
            setToast({
              id: `${Date.now()}`,
              title: `PAIMANA Early Warning Alert!`,
              message: `${rec.project_name || 'New Project'} in ${rec.State || 'India'} reported +₹${rec.cost_overrun_cr} Cr cost overrun.`
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="flex h-screen bg-[#FFF9EF] font-sans overflow-hidden relative">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main 
        className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:ml-[265px]' : 'lg:ml-20'
        }`}
      >
        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* 🚨 Live Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white border-2 border-[#F59A00] rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-100 text-red-600 rounded-xl shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black text-[#F59A00] uppercase tracking-wider block">
                  NEW EARLY INTERVENTION TRIGGER
                </span>
                <h4 className="font-bold text-[#17365D] text-sm mt-0.5">
                  {toast.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {toast.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}