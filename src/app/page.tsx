'use client'
import Link from 'next/link'
import { Activity, ArrowRight, ShieldCheck, BarChart3, Globe, Building, Clock, Target, AlertCircle, Landmark } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 🇮🇳 GOVT OF INDIA TOP BAR */}
      <div className="bg-slate-900 text-slate-300 text-[10px] md:text-xs py-1.5 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center tracking-wider font-medium">
        <div className="flex gap-4">
          <span>GOVERNMENT OF INDIA</span>
          <span className="hidden md:inline">|</span>
          <span>MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION (MoSPI)</span>
        </div>
        <div className="flex gap-4 mt-1 md:mt-0">
          <Link href="#" className="hover:text-white transition-colors">Skip to Main Content</Link>
          <Link href="#" className="hover:text-white transition-colors">A- | A | A+</Link>
          <Link href="#" className="hover:text-white transition-colors">English / हिन्दी</Link>
        </div>
      </div>

      {/* 🔵 PUBLIC NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo Area */}
            <div className="flex items-center gap-4">
              <Landmark className="w-12 h-12 text-slate-800" />
              <div className="border-l-2 border-slate-200 pl-4">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">PAIMANA</h1>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-0.5">
                  Infrastructure Monitoring System
                </p>
              </div>
            </div>

            {/* Nav Links & Login Button */}
            <div className="hidden lg:flex items-center gap-8">
              <Link href="#about" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">About Portal</Link>
              <Link href="#sectors" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Key Sectors</Link>
              <Link href="#guidelines" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Guidelines</Link>
              <div className="h-8 w-px bg-slate-200"></div>
              <Link 
                href="/login" 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-blue-500/25"
              >
                <ShieldCheck className="w-4 h-4" />
                Officer Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 🔴 LIVE NEWS TICKER (Modern CSS Animation) */}
      <div className="bg-blue-50 border-b border-blue-100 flex items-center text-sm relative overflow-hidden">
        <div className="bg-blue-600 text-white px-4 py-2 font-bold shrink-0 flex items-center gap-2 z-10 shadow-[4px_0_10px_rgba(0,0,0,0.1)]">
          <AlertCircle className="w-4 h-4 animate-pulse" />
          LATEST UPDATES
        </div>
        
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            .animate-marquee {
              display: inline-block;
              animation: marquee 25s linear infinite;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}</style>
          
          <div className="animate-marquee text-blue-800 font-medium py-2">
            * 14 New Mega Projects added in Q4 FY26 &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; AI Predictive Module v2.0 is now live for all central ministries &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; Deadline for physical progress submission extended to 31st March *
          </div>
        </div>
      </div>

      {/* 🌟 HERO SECTION */}
      <main className="flex-1">
        <div className="relative bg-slate-900 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
             {/* Abstract Infrastructure Pattern */}
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              {/* Changed Tagline to sound official */}
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full mb-6 inline-block border border-blue-500/30 uppercase tracking-wider">
                MoSPI Project Appraisal Division
              </span>
              
              {/* Changed Headline to Government Standard */}
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                Real-Time Monitoring of Central Sector <span className="text-blue-400">Infrastructure Projects.</span>
              </h1>
              
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                The official portal for monitoring ongoing Central Sector Infrastructure Projects costing ₹150 crore and above. PAIMANA ensures transparency, mitigates cost-overruns, and predicts project delays.
              </p>
              
              <div className="flex gap-4">
                <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2">
                  Access Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="#about" className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-bold border border-slate-700 transition-all">
                  Read Mandate
                </Link>
              </div>
            </div>

            {/* Hero Quick Stats - UPDATED WITH REAL MOSPI 2026 DATA */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center shadow-lg">
                <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-3xl font-black">1,500+</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Projects Tracked</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center shadow-lg">
                <Globe className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-3xl font-black">₹41.5L Cr</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Total Investment</p>
              </div>
            </div>
          </div>
        </div>

        {/* 📖 ABOUT & MANDATE SECTION */}
        <section id="about" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900">Mandate of PAIMANA</h2>
              <div className="w-20 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"></div>
              <p className="mt-4 text-slate-500 max-w-2xl mx-auto font-medium">
                The Infrastructure and Project Monitoring Division (IPMD) is mandated to monitor Central Sector infrastructure projects based on information provided by the implementing agencies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Cost Threshold</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Focusing on high-impact Central Sector projects with anticipated investments of ₹150 Crore and above across the nation.
                </p>
              </div>
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Early Warning System</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Utilizing Machine Learning to flag potential time and cost overruns before they escalate, saving taxpayer money.
                </p>
              </div>
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <Building className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Sector Integration</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Consolidated tracking across Railways, Road Transport, Power, Coal, Petroleum, and 17 other critical sectors.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 📜 NIC/GOVT STYLE FOOTER */}
      <footer className="bg-slate-900 pt-12 pb-6 border-t-[6px] border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-700 text-sm">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-bold text-white">PAIMANA Secure Portal</h3>
              </div>
              <p className="text-slate-400 max-w-sm">
                Project Appraisal, Infrastructure Monitoring and Analytics. An initiative by the Government of India for transparent governance.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#" className="hover:text-blue-400">Ministry of Statistics</Link></li>
                <li><Link href="#" className="hover:text-blue-400">PM Gati Shakti</Link></li>
                <li><Link href="#" className="hover:text-blue-400">National Informatics Centre</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Policies</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#" className="hover:text-blue-400">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-blue-400">Terms of Use</Link></li>
                <li><Link href="#" className="hover:text-blue-400">Hyperlinking Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>Designed & Developed for Smart India Hackathon (MoSPI Problem Statement).</p>
            <p>© {new Date().getFullYear()} Government of India. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}