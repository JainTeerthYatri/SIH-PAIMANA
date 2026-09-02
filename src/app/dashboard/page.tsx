'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AlertTriangle, FolderKanban, IndianRupee, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'

interface Project {
  id: number
  project_name: string
  State: string
  original_cost_cr: number
  anticipated_cost_cr: number
  cost_overrun_cr: number
  physical_progress_pct: number
}

// 🖼️ Upgraded Slide Vault Images (8 Major MoSPI Sectors)
const slideImages = [
  {
    url: "https://images.unsplash.com/photo-1465447142348-e9952c393450?q=80&w=1080&auto=format&fit=crop",
    title: "National Highway Development",
    subtitle: "Road Transport & Logistics Corridors"
  },
  {
    url: "https://images.unsplash.com/photo-1496350718501-8fc23cc66f10?q=80&w=1080&auto=format&fit=crop",
    title: "Dedicated Freight Corridors",
    subtitle: "Railway Network Expansion & Modernization"
  },
  {
    url: "https://images.unsplash.com/photo-1549463991-628d05b55013?q=80&w=1080&auto=format&fit=crop",
    title: "Thermal & Hydro Power Plants",
    subtitle: "Energy Sector Capacity Enhancement"
  },
  {
    url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1080&auto=format&fit=crop",
    title: "Metro Rail Projects",
    subtitle: "Smart City & Urban Transit Infrastructure"
  },
  {
    url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1080&auto=format&fit=crop",
    title: "Airport Modernization",
    subtitle: "Civil Aviation & Terminal Upgrades"
  },
  {
    url: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=1080&auto=format&fit=crop",
    title: "Port Capacity Expansion",
    subtitle: "Shipping, Waterways & Maritime Trade"
  },
  {
    url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1080&auto=format&fit=crop",
    title: "BharatNet Optical Fiber",
    subtitle: "Telecommunications & Digital Infrastructure"
  },
  {
    url: "https://images.unsplash.com/photo-1582040645607-47b8da5a38ef?q=80&w=1080&auto=format&fit=crop",
    title: "Refinery Upgradations",
    subtitle: "Petroleum, Natural Gas & Petrochemicals"
  }
]

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-play Slide Vault
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data, error } = await supabase.from('paimana_projects').select('*')
        if (error) throw error
        if (data) setProjects(data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const totalProjects = projects.length
  const totalOriginalCost = projects.reduce((acc, p) => acc + (p.original_cost_cr || 0), 0)
  const totalOverrun = projects.reduce((acc, p) => acc + (p.cost_overrun_cr || 0), 0)
  const highRiskProjects = projects.filter(p => p.cost_overrun_cr > 100).sort((a, b) => b.cost_overrun_cr - a.cost_overrun_cr).slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Overview</h1>
        <p className="text-slate-500 mt-1">Real-time infrastructure monitoring metrics across India</p>
      </header>

      {/* 📊 ROW 1: Premium Metric Cards at the Top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50/50 p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-5 hover:shadow-md transition-all">
          <div className="p-4 bg-blue-100/50 text-blue-600 rounded-xl shadow-sm">
            <FolderKanban className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Monitored</p>
            <p className="text-3xl font-black text-slate-800">{totalProjects}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50/50 p-6 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-5 hover:shadow-md transition-all">
          <div className="p-4 bg-emerald-100/50 text-emerald-600 rounded-xl shadow-sm">
            <IndianRupee className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Outlay</p>
            <p className="text-3xl font-black text-slate-800">₹{(totalOriginalCost / 1000).toFixed(2)}k Cr</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-red-50/50 p-6 rounded-2xl shadow-sm border border-red-100 flex items-center gap-5 hover:shadow-md transition-all">
          <div className="p-4 bg-red-100/50 text-red-600 rounded-xl shadow-sm">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Overrun</p>
            <p className="text-3xl font-black text-red-600">₹{(totalOverrun / 1000).toFixed(2)}k Cr</p>
          </div>
        </div>
      </div>

      {/* 🧩 ROW 2: Split Layout (Slide Vault + Risk List) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side (Col-2): Slide Vault */}
        <div className="lg:col-span-2 relative h-[420px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
          {slideImages.map((slide, idx) => (
            <div 
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img src={slide.url} alt={slide.title} className="object-cover object-center w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full mb-3 inline-block">LIVE VAULT</span>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{slide.title}</h2>
                <p className="text-slate-300 mt-2 text-lg font-medium">{slide.subtitle}</p>
              </div>
            </div>
          ))}
          <button 
            onClick={() => setCurrentSlide(prev => prev === 0 ? slideImages.length - 1 : prev - 1)}
            className="absolute z-20 left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setCurrentSlide(prev => (prev + 1) % slideImages.length)}
            className="absolute z-20 right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Right Side (Col-1): Critical Risk Projects List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[420px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2 shrink-0 rounded-t-2xl">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-slate-800">Critical Risk Escalations</h2>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
            {highRiskProjects.map((project, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50/30 transition-all cursor-default">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 mb-1.5 inline-block">
                      {project.State || 'Multi-State'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{project.project_name}</h3>
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center border-t border-slate-50 pt-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overrun</p>
                  <p className="text-sm font-bold text-red-600">+₹{project.cost_overrun_cr} Cr</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}