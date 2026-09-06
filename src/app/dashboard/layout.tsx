'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Sidebar expand/collapse state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-[#FFF9EF] font-sans overflow-hidden">
      {/* 🏛️ Naya PAIMANA Navy/Saffron Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* 📄 Main Dashboard Content Viewport */}
      <main 
        className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:ml-[265px]' : 'lg:ml-20'
        }`}
      >
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}