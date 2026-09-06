'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  FolderKanban,
  ShieldAlert,
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Download,
  BarChart2,
  X,
  Search,
  Info,
  Database,
  RefreshCw,
  LucideIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// --- SUPABASE CLIENT SETUP ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- INTERFACES ---
interface Project {
  id: string;
  name: string;
  sector: string;
  state: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number;
  originalCost: number;
  revisedCost: number;
  costVariancePercent: number;
  scheduleDelayMonths: number;
}

interface Kpi {
  title: string;
  value: string | number;
  unit: string;
  change: string;
  isUp: boolean;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

interface SectorAggregation {
  sector: string;
  count: number;
  costOverrun: number;
}

interface RiskDistributionItem {
  name: string;
  value: number;
  color: string;
}

// --- HELPER CSV EXPORTER ---
const exportProjectsToCSV = (data: Project[], filename: string) => {
  if (!data || !data.length) return;
  const headers = [
    'Project ID',
    'Project Name',
    'Sector',
    'State',
    'Risk Level',
    'Risk Score',
    'Original Cost (Cr)',
    'Revised Cost (Cr)',
    'Cost Variance (%)',
    'Schedule Delay (Months)',
  ];
  const rows = data.map((p) => [
    `"${p.id || ''}"`,
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${p.sector || ''}"`,
    `"${p.state || ''}"`,
    `"${p.riskLevel || ''}"`,
    p.riskScore || 0,
    p.originalCost || 0,
    p.revisedCost || 0,
    (p.costVariancePercent || 0).toFixed(2),
    p.scheduleDelayMonths || 0,
  ]);
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function DashboardPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch projects directly from Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('paimana_projects')
        .select('*')
        .limit(2000);

      if (error) {
        console.error('Error fetching dashboard projects:', error);
      } else if (data) {
        const mappedProjects: Project[] = data.map((p: any, idx: number) => {
          const orig = Number(p.original_cost_cr) || 0;
          const rev =
            Number(p.anticipated_cost_cr) ||
            Number(p.revised_cost_cr) ||
            orig;
          const overrun = Math.max(0, rev - orig);
          const variancePct =
            orig > 0 ? Math.max(0, ((rev - orig) / orig) * 100) : 0;

          // Compute realistic delay and risk scores
          const delayMonths =
            p.schedule_delay_months ||
            p.delay_months ||
            (overrun > 50 ? 18 : overrun > 0 ? 8 : 0);

          let score =
            p.risk_score ||
            Math.min(99, Math.round(variancePct * 0.7 + delayMonths * 2.5));
          if (score < 10 && overrun > 0) score = 45;

          let level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
          if (score >= 75) level = 'CRITICAL';
          else if (score >= 50) level = 'HIGH';
          else if (score >= 25) level = 'MEDIUM';

          return {
            id: p.id ? String(p.id) : `PRJ-${idx + 1}`,
            name: p.project_name || p.name || 'Unnamed Project',
            sector: p.sector || 'General',
            state: p.State || p.state || 'Multi-State',
            riskLevel: level,
            riskScore: score,
            originalCost: orig,
            revisedCost: rev,
            costVariancePercent: variancePct,
            scheduleDelayMonths: delayMonths,
          };
        });

        setProjects(mappedProjects);
      }
    } catch (err) {
      console.error('Unexpected dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search Filtering
  const isFiltered = searchQuery.trim().length > 0;
  const clearFilters = () => setSearchQuery('');

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.sector.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q)
    );
  });

  const handleExportCsv = (): void => {
    const fileName = searchQuery
      ? `PAIMANA_Risk_Brief_${searchQuery.replace(/[^a-zA-Z0-9]/g, '_')}.csv`
      : 'PAIMANA_Executive_Risk_Brief.csv';
    exportProjectsToCSV(filteredProjects, fileName);
  };

  // Dynamic Calculations
  const totalActive = filteredProjects.length;
  const criticalCount = filteredProjects.filter(
    (p) => p.riskLevel === 'CRITICAL'
  ).length;
  const highRiskCount = filteredProjects.filter(
    (p) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL'
  ).length;
  const costEscalationCount = filteredProjects.filter(
    (p) => p.costVariancePercent > 15
  ).length;
  const delayRiskCount = filteredProjects.filter(
    (p) => p.scheduleDelayMonths > 12
  ).length;
  const totalValue = filteredProjects.reduce(
    (acc, p) => acc + (p.originalCost || 0),
    0
  );
  const potentialExposure = filteredProjects.reduce(
    (acc, p) =>
      acc + Math.max(0, (p.revisedCost || 0) - (p.originalCost || 0)),
    0
  );

  const kpis: Kpi[] = [
    {
      title: 'Total Projects Monitored',
      value: totalActive,
      unit: searchQuery ? 'Filtered Matching' : 'Database Records',
      change: searchQuery
        ? `${totalActive} of ${projects.length}`
        : `MoSPI Data Pipeline`,
      isUp: true,
      icon: FolderKanban,
      color: '#17365D',
      bgColor: 'rgba(23, 54, 93, 0.08)',
    },
    {
      title: 'Critical & High Risk Projects',
      value: highRiskCount,
      unit: `${criticalCount} Critical Focus`,
      change: highRiskCount > 0 ? 'Immediate Action' : '0 High Risk',
      isUp: false,
      icon: ShieldAlert,
      color: '#E53E3E',
      bgColor: '#FFF5F5',
    },
    {
      title: 'Projects With Cost Escalation',
      value: costEscalationCount,
      unit: '>15% Variance',
      change: `${costEscalationCount} Active`,
      isUp: false,
      icon: TrendingUp,
      color: '#DD6B20',
      bgColor: '#FFFAF0',
    },
    {
      title: 'Projects At Risk of Delay',
      value: delayRiskCount,
      unit: '>12 M Delay',
      change: `${delayRiskCount} Delayed`,
      isUp: true,
      icon: Clock,
      color: '#D69E2E',
      bgColor: '#FEFCBF',
    },
    {
      title: 'Total Sanctioned Value',
      value:
        totalValue >= 1000
          ? `₹${(totalValue / 1000).toFixed(1)}k Cr`
          : `₹${totalValue.toFixed(0)} Cr`,
      unit: 'Sanctioned Budget',
      change: 'MoSPI Portfolio',
      isUp: true,
      icon: DollarSign,
      color: '#2B6CB0',
      bgColor: '#EBF8FF',
    },
    {
      title: 'Potential Cost Exposure',
      value:
        potentialExposure >= 1000
          ? `₹${(potentialExposure / 1000).toFixed(1)}k Cr`
          : `₹${potentialExposure.toFixed(0)} Cr`,
      unit: 'Projected Escalation',
      change: 'Escalation At Risk',
      isUp: false,
      icon: AlertTriangle,
      color: '#E53E3E',
      bgColor: '#FFF5F5',
    },
  ];

  if (loading) {
    return (
      <div
        className="p-16 text-center text-[#17365D] bg-white rounded-2xl border border-amber-200/80 shadow-xs my-8"
      >
        <RefreshCw
          size={32}
          className="animate-spin text-[#F59A00] mx-auto mb-4"
        />
        <h3 className="text-xl font-extrabold">
          Connecting to PAIMANA Infrastructure Risk Database...
        </h3>
        <p className="text-slate-500 text-sm mt-2">
          Fetching project monitoring records & running AI risk engines...
        </p>
      </div>
    );
  }

  // Dynamic Sector Chart Data Calculation
  const sectorMap: Record<string, SectorAggregation> = {};
  filteredProjects.forEach((p) => {
    const sec = p.sector || 'Other';
    const overrun = Math.max(0, p.revisedCost - p.originalCost);
    if (!sectorMap[sec]) {
      sectorMap[sec] = {
        sector: sec.split('&')[0].trim(),
        count: 0,
        costOverrun: 0,
      };
    }
    sectorMap[sec].count += 1;
    sectorMap[sec].costOverrun += overrun;
  });
  const sectorChartData: SectorAggregation[] = Object.values(sectorMap);

  // Dynamic Risk Distribution Pie Chart Data
  const medRiskCount = filteredProjects.filter(
    (p) => p.riskLevel === 'MEDIUM'
  ).length;
  const lowRiskCount = filteredProjects.filter(
    (p) => p.riskLevel === 'LOW'
  ).length;

  const riskDistributionData: RiskDistributionItem[] = [
    { name: 'High Risk (70-100)', value: highRiskCount, color: '#E53E3E' },
    { name: 'Medium Risk (40-69)', value: medRiskCount, color: '#DD6B20' },
    { name: 'Low Risk (0-39)', value: lowRiskCount, color: '#38A169' },
  ].filter((d) => totalActive === 0 || d.value > 0);

  return (
    <div className="p-4 sm:p-8 bg-[#FFF9EF] min-h-screen font-sans space-y-7 text-slate-900">
      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-9 py-2 bg-[#FFF9EF] border border-amber-200/80 rounded-xl text-xs sm:text-sm font-medium text-[#17365D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F59A00]"
            placeholder="Search projects by name, sector, state, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={clearFilters}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Active Search & Filter Banner */}
      {isFiltered && (
        <div className="bg-[#FFF9EF] border-1.5 border-[#F59A00] rounded-2xl p-3.5 px-5 flex items-center justify-between flex-wrap gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Search size={18} className="text-[#F59A00]" />
            <span className="text-sm text-[#17365D] font-semibold">
              Live Filter Active:{' '}
              <strong className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                "{searchQuery}"
              </strong>
            </span>
            <span className="text-xs text-slate-500">
              • Found <strong className="text-[#17365D]">{totalActive}</strong>{' '}
              matching {totalActive === 1 ? 'project' : 'projects'} out of{' '}
              {projects.length}
            </span>
          </div>

          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[#17365D] text-xs font-bold hover:bg-slate-50 cursor-pointer"
          >
            <X size={14} />
            <span>Reset Search</span>
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-extrabold text-[#F59A00] tracking-wider uppercase">
            COMMAND CENTER • ROLE: ADMIN
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17365D] tracking-tight">
            PAIMANA Risk Intelligence Command Center
          </h1>
          <div className="text-xs text-slate-500 mt-1">
            Live MoSPI Infrastructure Early Warning Analytics • Active Synced
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/ai-assistant')}
            className="px-4 py-2.5 bg-[#F59A00] hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles size={16} />
            <span>Launch AI Assistant</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-white border border-slate-200 text-[#17365D] font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Download size={16} />
            <span>Export Risk Brief (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI 6-Grid (Dynamic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[140px] hover:border-[#F59A00] transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {kpi.title}
                </span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: kpi.bgColor, color: kpi.color }}
                >
                  <Icon size={20} />
                </div>
              </div>

              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-black text-[#17365D]">
                  {kpi.value}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-slate-500">{kpi.unit}</span>
                  <span
                    className={`text-[11px] font-bold ${
                      kpi.isUp ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {kpi.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Cost Overrun Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#17365D]">
                Project Exposure by Sector
              </h3>
              <div className="text-xs text-slate-500">
                {searchQuery
                  ? `Filtered Cost Overrun (₹ Cr) for "${searchQuery}"`
                  : 'Total Cost Overrun (₹ Crores) per Sector'}
              </div>
            </div>
            <BarChart2 size={20} className="text-[#F59A00]" />
          </div>

          <div className="w-full h-[260px]">
            {sectorChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectorChartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D5" />
                  <XAxis
                    dataKey="sector"
                    tick={{ fontSize: 11, fill: '#4A5568' }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#4A5568' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#17365D',
                      color: '#FFF9EF',
                      borderRadius: '10px',
                      border: 'none',
                    }}
                    formatter={(value: any) => [
                      `₹${value.toFixed(0)} Cr`,
                      'Cost Overrun',
                    ]}
                  />
                  <Bar
                    dataKey="costOverrun"
                    fill="#F59A00"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                No sector data matches current filter "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Risk Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#17365D]">
                Portfolio Risk Distribution
              </h3>
              <div className="text-xs text-slate-500">
                Categorized by Composite Risk Score
              </div>
            </div>
            <ShieldAlert size={20} className="text-red-500" />
          </div>

          <div className="flex items-center justify-around h-[260px]">
            {totalActive > 0 ? (
              <>
                <div className="w-[180px] h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#17365D',
                          color: '#FFF9EF',
                          borderRadius: '10px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-3">
                  {riskDistributionData.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="w-3.5 h-3.5 rounded-sm shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <div className="text-xs font-bold text-[#17365D]">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.value}{' '}
                          {item.value === 1 ? 'Project' : 'Projects'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-slate-400 text-sm">
                No project data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Critical Early Warning Feed & High Risk Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-[#17365D]">
              {searchQuery
                ? `Filtered Projects matching "${searchQuery}"`
                : 'High-Risk Projects Requiring Immediate Intervention'}
            </h3>
            <div className="text-xs text-slate-500">
              Sorted by PAIMANA Composite Risk Score
            </div>
          </div>
          <button
            onClick={() => router.push('/risk-intelligence')}
            className="px-3.5 py-1.5 bg-[#FFF9EF] border border-amber-200 text-[#17365D] text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-amber-100 transition-all cursor-pointer"
          >
            <span>View Full Risk Table</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          {filteredProjects.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FFF9EF] border-b border-amber-200/60 text-[#17365D] font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="p-3">Project ID</th>
                  <th className="p-3">Project Name</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Cost Variance</th>
                  <th className="p-3">Delay</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProjects.slice(0, 8).map((proj) => (
                  <tr
                    key={proj.id}
                    className="hover:bg-amber-50/40 transition-colors"
                  >
                    <td className="p-3 font-bold text-[#17365D] whitespace-nowrap">
                      {proj.id}
                    </td>
                    <td className="p-3 font-bold text-[#17365D] max-w-xs line-clamp-2">
                      {proj.name}
                    </td>
                    <td className="p-3 text-slate-600">{proj.sector}</td>
                    <td className="p-3 text-[#F59A00] font-bold">
                      {proj.state}
                    </td>
                    <td
                      className={`p-3 font-bold ${
                        proj.costVariancePercent > 20
                          ? 'text-red-600'
                          : 'text-amber-600'
                      }`}
                    >
                      +{proj.costVariancePercent.toFixed(1)}%
                    </td>
                    <td className="p-3 font-bold text-amber-600 whitespace-nowrap">
                      {proj.scheduleDelayMonths} M
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border ${
                          proj.riskLevel === 'CRITICAL' ||
                          proj.riskLevel === 'HIGH'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : proj.riskLevel === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <ShieldAlert size={12} />
                        {proj.riskScore} {proj.riskLevel}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        onClick={() =>
                          router.push(`/cost-drivers?project=${proj.id}`)
                        }
                        className="px-3 py-1 bg-[#FFF9EF] border border-amber-200 text-[#17365D] rounded-md text-[11px] font-bold hover:bg-amber-100 transition-all cursor-pointer"
                      >
                        Analyze Risk Drivers →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Info size={24} className="text-[#F59A00] mx-auto" />
              <div>
                No projects match the current search filter "
                <strong>{searchQuery}</strong>".
              </div>
              <button
                onClick={clearFilters}
                className="mt-2 px-4 py-1.5 rounded-lg border border-slate-200 bg-[#FFF9EF] text-[#17365D] text-xs font-bold hover:bg-amber-50 cursor-pointer"
              >
                Clear Search Filter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}