'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { BarChart3, TrendingUp, MapPin, Search, Database, Sparkles, Zap, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Project {
  project_name?: string;
  State?: string;
  original_cost_cr?: number;
  anticipated_cost_cr?: number;
  [key: string]: unknown;
}

interface StateAggregation {
  state: string;
  projects: number;
  costEscalationCr: number;
}

interface HistoricalTrend {
  year: string;
  avgDelayMonths: number;
  avgCostOverrunPct: number;
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSupabaseProjects() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: dbError } = await supabase
          .from('paimana_projects')
          .select('*');

        if (dbError) throw dbError;

        if (data) {
          setProjects(data);
        }
      } catch (err: any) {
        console.error('Supabase fetch error:', err);
        setError(err.message || 'Failed to fetch analytics data from Supabase.');
      } finally {
        setLoading(false);
      }
    }

    fetchSupabaseProjects();
  }, []);

  const filteredProjects = searchQuery
    ? projects.filter((p) => 
        JSON.stringify(p).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  const isFiltered = Boolean(searchQuery);

  const stateMap: Record<string, StateAggregation> = {};

  filteredProjects.forEach((p) => {
    const st = p.State || 'Unknown';
    const original = Number(p.original_cost_cr || 0);
    const revised = Number(p.anticipated_cost_cr || 0);
    const overrun = Math.max(0, revised - original);

    if (!stateMap[st]) {
      stateMap[st] = { state: st, projects: 0, costEscalationCr: 0 };
    }

    stateMap[st].projects += 1;
    stateMap[st].costEscalationCr += overrun;
  });

  const stateData: StateAggregation[] = Object.values(stateMap);

  const historicalTrendData: HistoricalTrend[] = [
    { year: '2022', avgDelayMonths: 11.2, avgCostOverrunPct: 16.8 },
    { year: '2023', avgDelayMonths: 15.4, avgCostOverrunPct: 22.1 },
    { year: '2024', avgDelayMonths: 18.2, avgCostOverrunPct: 28.5 },
    { year: '2025', avgDelayMonths: 20.1, avgCostOverrunPct: 31.0 },
    { year: '2026 (P)', avgDelayMonths: 23.4, avgCostOverrunPct: 36.8 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-2xl border border-slate-200">
        <Zap className="w-8 h-8 text-[#F59A00] animate-bounce mb-3" />
        <p className="text-sm font-bold text-[#17365D]">Loading Analytics from Supabase...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-2xl border border-red-200">
        <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
        <p className="text-sm font-bold text-red-600">Database Connection / Query Error</p>
        <p className="text-xs text-slate-500 mt-1 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-[#FFF9EF] min-h-screen text-slate-900 font-sans space-y-6 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#F59A00] tracking-wider uppercase">
              DEEP ANALYTICS LAB
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-extrabold rounded-md border border-sky-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F59A00]" />
              RISK DISTRIBUTION & TRENDS
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold">
            <Database className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Supabase Direct Sync</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
          Sector & State Infrastructure Risk Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Cross-sectional risk distribution and multi-year historical delay acceleration trends
        </p>
      </div>

      {/* ACTIVE SEARCH FILTER BANNER */}
      {isFiltered && (
        <div className="bg-[#FFF9EF] border-1.5 border-[#F59A00] rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#F59A00]" />
            <span className="text-xs sm:text-sm text-[#17365D] font-semibold">
              Live Filter Active: <strong className="text-amber-600">"{searchQuery}"</strong> • Found <strong className="text-[#17365D]">{filteredProjects.length}</strong> matching projects across {stateData.length} states
            </span>
          </div>
        </div>
      )}

      {/* ANALYTICS CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* State-wise Cost Exposure Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#17365D]">State-wise Cost Exposure</h3>
              <p className="text-xs text-slate-500 mt-0.5">Aggregated Cost Escalation (₹ Cr) by State</p>
            </div>
            <div className="p-2.5 bg-[#FFF9EF] rounded-xl border border-[#F59A00]/50">
              <MapPin className="w-5 h-5 text-[#F59A00]" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4">
            <div className="w-full h-[280px]">
              {stateData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stateData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D5" />
                    <XAxis dataKey="state" tick={{ fontSize: 12, fill: '#4A5568' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#4A5568' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        borderRadius: '12px', 
                        border: '1px solid #CBD5E1', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)', 
                        fontSize: '12px', 
                        fontWeight: 600 
                      }} 
                      formatter={(val: any) => [`₹${Number(val || 0).toFixed(0)} Cr`, 'Cost Overrun']} 
                    />
                    <Bar dataKey="costEscalationCr" fill="#17365D" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col h-full items-center justify-center text-slate-500 gap-1.5">
                  <span className="font-semibold text-xs">No state data found</span>
                  <span className="text-[11px]">Loaded records: {projects.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Multi-Year Historical Trend Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#17365D]">Multi-Year Escalation Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Average Schedule Delay vs Cost Overrun %</p>
            </div>
            <div className="p-2.5 bg-red-50 rounded-xl border border-red-200">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4">
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D5" />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#4A5568' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#4A5568' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderRadius: '12px', 
                      border: '1px solid #CBD5E1', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.08)', 
                      fontSize: '12px', 
                      fontWeight: 600 
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontWeight: 700 }} />
                  <Line type="monotone" dataKey="avgDelayMonths" name="Avg Delay (Months)" stroke="#E53E3E" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="avgCostOverrunPct" name="Avg Cost Variance %" stroke="#F59A00" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Analytics() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-bold text-[#17365D]">Loading Analytics...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}