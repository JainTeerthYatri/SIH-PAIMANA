'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  FileSpreadsheet,
  Download,
  FileText,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ReportItem {
  id: string;
  title: string;
  tableName: 'paimana_projects' | 'paimana_projects_analytics';
  type: string;
  size: string;
  date: string;
  timestamp: number;
}

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const itemsPerPage = 8;

  // Base reports restricted to the two heavy main tables: paimana_projects & paimana_projects_analytics
  const baseReports: Omit<ReportItem, 'date' | 'timestamp' | 'size'>[] = [
    {
      id: 'paimana_projects_full',
      title: 'Complete Paimana Projects Master Dump',
      tableName: 'paimana_projects',
      type: 'CSV',
    },
    {
      id: 'paimana_projects_analytics_full',
      title: 'Complete Paimana Projects Analytics Data',
      tableName: 'paimana_projects_analytics',
      type: 'CSV',
    },
    {
      id: 'paimana_projects_cost_audit',
      title: 'Projects Cost Overrun & Escalation Audit',
      tableName: 'paimana_projects',
      type: 'CSV',
    },
    {
      id: 'paimana_projects_schedule_audit',
      title: 'Projects Target Completion Schedule Matrix',
      tableName: 'paimana_projects',
      type: 'CSV',
    },
    {
      id: 'paimana_analytics_risk_matrix',
      title: 'Analytics Risk & Performance Indicators Matrix',
      tableName: 'paimana_projects_analytics',
      type: 'CSV',
    },
    {
      id: 'paimana_projects_state_summary',
      title: 'State-wise Consolidated Project Allocations',
      tableName: 'paimana_projects',
      type: 'CSV',
    },
    {
      id: 'paimana_analytics_predictive_logs',
      title: 'Predictive Modeling & Simulation Audit Logs',
      tableName: 'paimana_projects_analytics',
      type: 'CSV',
    },
    {
      id: 'paimana_projects_active_tracking',
      title: 'Active Execution Progress Tracking Register',
      tableName: 'paimana_projects',
      type: 'CSV',
    },
    {
      id: 'paimana_analytics_historical_trends',
      title: 'Historical Cost & Milestone Variance Archive',
      tableName: 'paimana_projects_analytics',
      type: 'CSV',
    }
  ];

  useEffect(() => {
    // 30-day link expiry cleanup check
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const savedReports = localStorage.getItem('paimana_generated_reports');
    let initializedReports: ReportItem[] = [];

    if (savedReports) {
      const parsed: ReportItem[] = JSON.parse(savedReports);
      initializedReports = parsed.filter((r) => r.timestamp > thirtyDaysAgo);
    }

    if (initializedReports.length === 0) {
      const now = Date.now();
      const dateObj = new Date(now);
      const monthYearStr = `${dateObj.toLocaleString('default', { month: 'long' })} ${dateObj.getFullYear()}`;
      
      initializedReports = baseReports.map((b, idx) => ({
        ...b,
        size: idx % 2 === 0 ? '4.2 MB' : '2.8 MB',
        date: monthYearStr,
        timestamp: now,
      }));
      localStorage.setItem('paimana_generated_reports', JSON.stringify(initializedReports));
    }

    setReports(initializedReports);
  }, []);

  const handleDownload = async (rep: ReportItem) => {
    try {
      setDownloadingId(rep.id);

      // Fetch fresh data from the specified heavy main table
      const { data, error } = await supabase.from(rep.tableName).select('*');
      if (error) throw error;

      if (!data || data.length === 0) {
        alert('No records found in table to export.');
        return;
      }

      // Convert JSON data to CSV format
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

      // Trigger file download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${rep.id}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update timestamp and format date using Month and Year on update
      const now = Date.now();
      const dateObj = new Date(now);
      const monthYearStr = `${dateObj.toLocaleString('default', { month: 'long' })} ${dateObj.getFullYear()}`;

      const updatedReports = reports.map((r) => {
        if (r.id === rep.id) {
          return {
            ...r,
            date: monthYearStr,
            timestamp: now,
            size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
          };
        }
        return r;
      });

      setReports(updatedReports);
      localStorage.setItem('paimana_generated_reports', JSON.stringify(updatedReports));
    } catch (err: any) {
      console.error('Export failed:', err.message);
      alert('Failed to generate report export from Supabase.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Pagination Logic (8 items per page)
  const totalPages = Math.ceil(reports.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReports = reports.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
    >
      {/* HEADER (Static - Completely excluded from hover spring & neon effects as requested) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#F59A00] tracking-wider uppercase">
              EXECUTIVE REPORTING HUB
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-extrabold rounded-md border border-sky-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F59A00]" />
              PRIMARY TABLES SYNCED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight mt-1">
            Risk Briefs & Dynamic Export Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Live auto-generated datasets sourced from <span className="font-mono text-[#F59A00]">paimana_projects</span> & <span className="font-mono text-[#F59A00]">paimana_projects_analytics</span>. Links auto-refresh with Month & Year stamps and prune after 30 days.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-[#17365D]">
          <Database className="w-4 h-4 text-[#F59A00]" />
          <span>Active Datasets: 2 Main Tables</span>
        </div>
      </div>

      {/* REPORTS LIST CONTAINER (Spring Lift & Neon Amber Glow Card) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_0_35px_rgba(245,154,0,0.4)] hover:border-[#F59A00]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#17365D]">
            Available Generated Risk Reports (Showing {currentReports.length} of {reports.length})
          </h3>
          <span className="text-xs text-slate-400 font-medium">Max 8 links per page</span>
        </div>

        <div className="space-y-3">
          {currentReports.map((rep) => (
            <div
              key={rep.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#FFF9EF] border border-[#E2D9CC] rounded-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(245,154,0,0.3)] hover:border-[#F59A00]"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#17365D] text-[#F59A00] flex items-center justify-center font-black text-xs shadow-md">
                  {rep.type}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#17365D]">
                    {rep.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
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
                <span>{downloadingId === rep.id ? 'Generating...' : `Export ${rep.type}`}</span>
              </button>
            </div>
          ))}
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              Page <strong className="text-[#17365D]">{currentPage}</strong> of <strong className="text-[#17365D]">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-amber-50 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-amber-50 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;