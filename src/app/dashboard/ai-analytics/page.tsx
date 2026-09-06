'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart3, TrendingUp, MapPin, Search } from 'lucide-react';
import { motion } from 'framer-motion';
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
        
        if (data) {
          const rawList = Array.isArray(data) ? data : (data.projects || data.data || []);
          const mapped = rawList.map((p: any) => ({
            id: p.id || p._id,
            state: p.state || p.stateName || 'Unknown',
            originalCost: Number(p.originalCost || p.costOriginal || 0),
            revisedCost: Number(p.anticipatedCost || p.revisedCost || p.costRevised || 0),
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
    { year: '2022', avgDelayMonths: 11.2, avgCostOverrunPct: 16.8 },
    { year: '2023', avgDelayMonths: 15.4, avgCostOverrunPct: 22.1 },
    { year: '2024', avgDelayMonths: 18.2, avgCostOverrunPct: 28.5 },
    { year: '2025', avgDelayMonths: 20.1, avgCostOverrunPct: 31.0 },
    { year: '2026 (P)', avgDelayMonths: 23.4, avgCostOverrunPct: 36.8 },
  ];

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', fontWeight: 700, color: '#17365D' }}>Loading Analytics Data...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header Card */}
      <motion.div 
        className="card-paimana"
        whileHover={{ scale: 1.008, y: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '1.75rem 2rem', boxShadow: '0 8px 24px rgba(23,54,93,0.06)', border: '1px solid #EAE2D5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F59A00', letterSpacing: '0.05em', textTransform: 'uppercase', backgroundColor: '#FFF9EF', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #F59A00' }}>
              DEEP ANALYTICS LAB
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17365D', margin: 0 }}>
            Sector & State Infrastructure Risk Analytics
          </h1>
          <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.2rem' }}>
            Cross-sectional risk distribution and multi-year historical delay acceleration trends
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <BarChart3 size={18} style={{ color: '#17365D' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#17365D' }}>Live Data Feed</span>
        </div>
      </motion.div>

      {/* Active Search Filter Banner */}
      {isFiltered && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: '#FFF9EF', border: '1.5px solid #F59A00', borderRadius: '14px', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(245,154,0,0.1)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Search size={18} style={{ color: '#F59A00' }} />
            <span style={{ fontSize: '0.9rem', color: '#17365D', fontWeight: 600 }}>
              Live Filter Active: <strong style={{ color: '#EA580C' }}>"{searchQuery}"</strong> • Found <strong>{filteredProjects.length}</strong> matching projects across {stateData.length} states
            </span>
          </div>
        </motion.div>
      )}

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        
        {/* State-wise Cost Escalation Card */}
        <motion.div 
          className="card-paimana"
          whileHover={{ scale: 1.015, y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 8px 24px rgba(23,54,93,0.06)', border: '1px solid #EAE2D5' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#17365D', fontWeight: 700 }}>State-wise Cost Exposure</h3>
              <div style={{ fontSize: '0.78rem', color: '#718096' }}>Aggregated Cost Escalation (₹ Cr) by State</div>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#FFF9EF', borderRadius: '10px', border: '1px solid #F59A00' }}>
              <MapPin size={20} style={{ color: '#F59A00' }} />
            </div>
          </div>

          {/* Inner card padding and border matching the benchmark reference style */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE2D5', borderRadius: '12px', padding: '1rem' }}>
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
                <div style={{ display: 'flex', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#718096', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>No state data found</span>
                  <span style={{ fontSize: '0.75rem' }}>Total loaded records: {projects.length}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Multi-Year Historical Trend Card */}
        <motion.div 
          className="card-paimana"
          whileHover={{ scale: 1.015, y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 8px 24px rgba(23,54,93,0.06)', border: '1px solid #EAE2D5' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#17365D', fontWeight: 700 }}>Multi-Year Escalation Trend</h3>
              <div style={{ fontSize: '0.78rem', color: '#718096' }}>Average Schedule Delay vs Cost Overrun %</div>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#FFF5F5', borderRadius: '10px', border: '1px solid #FEB2B2' }}>
              <TrendingUp size={20} style={{ color: '#E53E3E' }} />
            </div>
          </div>

          {/* Inner card padding and border matching the benchmark reference style */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE2D5', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer>
                <LineChart data={historicalTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D5" />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#4A5568' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#4A5568' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#17365D', color: '#FFF9EF', borderRadius: '10px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="avgDelayMonths" name="Avg Delay (Months)" stroke="#E53E3E" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="avgCostOverrunPct" name="Avg Cost Variance %" stroke="#F59A00" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

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