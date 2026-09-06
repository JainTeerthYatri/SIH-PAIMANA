'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart3, TrendingUp, MapPin, Search } from 'lucide-react';
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

interface Project {
  id?: string | number;
  state?: string;
  originalCost?: number;
  revisedCost?: number;
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

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const res = await fetch('/api/projects/drivers');
        const data = await res.json();
        if (data && data.projects) {
          // Map database schema fields to Analytics component interface
          const mapped = data.projects.map((p: any) => ({
            id: p.id,
            state: p.state,
            originalCost: p.originalCost,
            revisedCost: p.anticipatedCost,
          }));
          setProjects(mapped);
        }
      } catch (err) {
        console.error('Failed to load analytics projects:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const filteredProjects = searchQuery
    ? projects.filter((p) => 
        JSON.stringify(p).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  const isFiltered = Boolean(searchQuery);

  // Dynamic State Aggregation
  const stateMap: Record<string, StateAggregation> = {};

  filteredProjects.forEach((p) => {
    const st = p.state || 'Unknown';
    const overrun = Math.max(0, (p.revisedCost || 0) - (p.originalCost || 0));

    if (!stateMap[st]) {
      stateMap[st] = { state: st, projects: 0, costEscalationCr: 0 };
    }

    stateMap[st].projects += 1;
    stateMap[st].costEscalationCr += overrun;
  });

  const stateData: StateAggregation[] = Object.values(stateMap);

  const historicalTrendData: HistoricalTrend[] = [
    { year: '2021', avgDelayMonths: 8.5, avgCostOverrunPct: 12.4 },
    { year: '2022', avgDelayMonths: 11.2, avgCostOverrunPct: 16.8 },
    { year: '2023', avgDelayMonths: 15.4, avgCostOverrunPct: 22.1 },
    { year: '2024', avgDelayMonths: 18.2, avgCostOverrunPct: 28.5 },
    { year: '2025 (P)', avgDelayMonths: 21.0, avgCostOverrunPct: 34.2 },
  ];

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', fontWeight: 700, color: '#17365D' }}>Loading Analytics Data...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Active Search Filter Banner */}
      {isFiltered && (
        <div style={{ backgroundColor: '#FFF9EF', border: '1.5px solid #F59A00', borderRadius: '14px', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Search size={18} style={{ color: '#F59A00' }} />
            <span style={{ fontSize: '0.9rem', color: '#17365D', fontWeight: 600 }}>
              Live Filter Active: <strong style={{ color: '#EA580C' }}>"{searchQuery}"</strong> • Found <strong>{filteredProjects.length}</strong> matching projects across {stateData.length} states
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59A00', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          DEEP ANALYTICS LAB
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17365D' }}>
          Sector & State Infrastructure Risk Analytics
        </h1>
        <div style={{ fontSize: '0.82rem', color: '#718096' }}>
          Cross-sectional risk distribution and multi-year historical delay acceleration trends
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* State-wise Cost Escalation Chart */}
        <div className="card-paimana">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#17365D' }}>State-wise Cost Exposure</h3>
              <div style={{ fontSize: '0.78rem', color: '#718096' }}>Aggregated Cost Escalation (₹ Cr) by State</div>
            </div>
            <MapPin size={20} style={{ color: '#F59A00' }} />
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            {stateData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={stateData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D5" />
                  <XAxis dataKey="state" tick={{ fontSize: 12, fill: '#4A5568' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#4A5568' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#17365D', color: '#FFF9EF', borderRadius: '10px' }} formatter={(val: any) => [`₹${Number(val || 0).toFixed(0)} Cr`, 'Cost Overrun']} />
                  <Bar dataKey="costEscalationCr" fill="#17365D" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>
                No state data for search query "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Multi-Year Historical Trend Line */}
        <div className="card-paimana">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#17365D' }}>Multi-Year Escalation Trend</h3>
              <div style={{ fontSize: '0.78rem', color: '#718096' }}>Average Schedule Delay vs Cost Overrun %</div>
            </div>
            <TrendingUp size={20} style={{ color: '#E53E3E' }} />
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <LineChart data={historicalTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D5" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#4A5568' }} />
                <YAxis tick={{ fontSize: 12, fill: '#4A5568' }} />
                <Tooltip contentStyle={{ backgroundColor: '#17365D', color: '#FFF9EF', borderRadius: '10px' }} />
                <Legend />
                <Line type="monotone" dataKey="avgDelayMonths" name="Avg Delay (Months)" stroke="#E53E3E" strokeWidth={3} />
                <Line type="monotone" dataKey="avgCostOverrunPct" name="Avg Cost Variance %" stroke="#F59A00" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center', fontWeight: 700, color: '#17365D' }}>Loading Analytics...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}