'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Download,
  Sparkles,
  Clock,
  Database,
  RefreshCw,
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ReportItem {
  id: string;
  tableName: 'paimana_projects' | 'paimana_projects_analytics';
  title: string;
  type: string;
  size: string;
  date: string;
  timestamp: number;
  isRevised: boolean;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Strictly 2 base reports for the 2 active tables
  const baseTables: Array<{
    id: string;
    tableName: 'paimana_projects' | 'paimana_projects_analytics';
    type: string;
  }> = [
    {
      id: 'paimana_projects_master',
      tableName: 'paimana_projects',
      type: 'CSV',
    },
    {
      id: 'paimana_projects_analytics_master',
      tableName: 'paimana_projects_analytics',
      type: 'CSV',
    },
  ];

  useEffect(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    // New cache key to clear any legacy 9-item cache
    const STORAGE_KEY = 'paimana_v2_reports_data';
    const saved = localStorage.getItem(STORAGE_KEY);

    const now = Date.now();
    const dateObj = new Date(now);
    const monthStr = dateObj.toLocaleString('default', { month: 'long' });
    const yearStr = dateObj.getFullYear();
    const monthYearStr = `${monthStr} ${yearStr}`;

    let initialized: ReportItem[] = [];

    if (saved) {
      try {
        const parsed: ReportItem[] = JSON.parse(saved);
        // Retain non-expired reports & filter strictly for 2 active tables
        initialized = parsed.filter(
          (r) =>
            r.timestamp > thirtyDaysAgo &&
            (r.tableName === 'paimana_projects' ||
              r.tableName === 'paimana_projects_analytics')
        );
      } catch (e) {
        initialized = [];
      }
    }

    // If cache was empty or invalid, construct default 2 links
    if (initialized.length === 0) {
      initialized = baseTables.map((b, idx) => ({
        ...b,
        // Default Format: "'Month' - 'Year' Projects record of this year till now"
        title: `${monthStr} - ${yearStr} Projects record of this year till now`,
        size: idx === 0 ? '4.2 MB' : '2.8 MB',
        date: monthYearStr,
        timestamp: now,
        isRevised: false,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialized));
    }

    setReports(initialized);
  }, []);

  const handleDownload = async (rep: ReportItem) => {
    try {
      setDownloadingId(rep.id);

      // Realtime fetch from Supabase table
      const { data, error } = await supabase.from(rep.tableName).select('*');
      if (error) throw error;

      if (!data || data.length === 0) {
        alert('No records found in table to export.');
        return;
      }

      // Generate CSV
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((field) => {
              const val = row[field];
              const escaped = '' + (val === null || val === undefined ? '' : val);
              return `"${escaped.replace(/"/g, '""')}"`;
            })
            .join(',')
        ),
      ];
      const csvContent = csvRows.join('\n');

      // Trigger Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${rep.tableName}_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Dynamic update logic on export/update
      const now = Date.now();
      const dateObj = new Date(now);
      const monthStr = dateObj.toLocaleString('default', { month: 'long' });
      const yearStr = dateObj.getFullYear();

      // Title switches to: "'Revised version of project report' of 'Month'"
      const updatedTitle = `Revised version of project report of ${monthStr}`;

      const updatedReports = reports.map((r) => {
        if (r.id === rep.id) {
          return {
            ...r,
            title: updatedTitle,
            date: `${monthStr} ${yearStr}`,
            timestamp: now,
            size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
            isRevised: true,
          };
        }
        return r;
      });

      setReports(updatedReports);
      localStorage.setItem('paimana_v2_reports_data', JSON.stringify(updatedReports));
    } catch (err: any) {
      console.error('Export failed:', err.message);
      alert('Failed to generate report export from Supabase.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-[#FFF9EF] min-h-screen text-slate-900 font-sans space-y-6">
      {/* 🏛️ HEADER (Static - Aligned with Early Warning Center) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#F59A00] tracking-wider uppercase">
              EXECUTIVE REPORTING HUB
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-extrabold rounded-md border border-sky-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F59A00]" />
              PRIMARY TABLES SYNCED
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs font-bold text-[#17365D]">
            <Database className="w-4 h-4 text-[#F59A00]" />
            <span>Active Datasets: 2 Main Tables</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
            Risk Briefs & Dynamic Export Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live auto-generated datasets sourced directly from <span className="font-mono text-[#F59A00]">paimana_projects</span> & <span className="font-mono text-[#F59A00]">paimana_projects_analytics</span>.
          </p>
        </div>
      </div>

      {/* 📋 REPORTS CONTAINER */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-[#F59A00]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#17365D]">
            Available Generated Risk Reports ({reports.length} Active Links)
          </h3>
          <span className="text-xs text-slate-400 font-medium">Real-time DB Sync</span>
        </div>

        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-[#FFF9EF] rounded-2xl p-4 sm:p-5 border-l-8 border-l-[#17365D] border border-amber-200/70 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.005] hover:shadow-xl hover:border-[#F59A00] flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#17365D] text-[#F59A00] flex items-center justify-center font-black text-xs shadow-md shrink-0">
                  {rep.type}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-[#17365D]">
                      {rep.title}
                    </h2>
                    {rep.isRevised && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold rounded-md flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-[#F59A00]" /> REVISED
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-[#F59A00] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {rep.date}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                      Table: {rep.tableName}
                    </span>
                    <span>•</span>
                    <span>{rep.size}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownload(rep)}
                disabled={downloadingId === rep.id}
                className="px-4 py-2.5 bg-[#F59A00] hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 hover:shadow-[0_0_15px_rgba(245,154,0,0.5)]"
              >
                <Download className="w-4 h-4" />
                <span>
                  {downloadingId === rep.id ? 'Generating...' : `Export ${rep.type}`}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}