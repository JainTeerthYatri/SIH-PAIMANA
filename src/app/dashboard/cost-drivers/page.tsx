'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  sector: string;
  state: string;
  department: string;
  riskScore: number;
  riskLevel: string;
  costVariancePercent: number;
}

interface RiskDriver {
  factor: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impactPercent: number;
  description: string;
}

interface SeverityStyle {
  bg: string;
  color: string;
  border: string;
  fill: string;
}

// Fallback dummy data in case API or mock services are not available
const DUMMY_PROJECTS: Project[] = [
  {
    id: 'PIM-1001',
    name: 'Eastern Dedicated Freight Corridor Expansion',
    sector: 'Railway Infrastructure',
    state: 'Uttar Pradesh',
    department: 'Ministry of Railways',
    riskScore: 78,
    riskLevel: 'HIGH',
    costVariancePercent: 14.2
  },
  {
    id: 'PIM-1002',
    name: 'National Expressway 4 Phase-II',
    sector: 'Roads & Highways',
    state: 'Maharashtra',
    department: 'MoRTH',
    riskScore: 65,
    riskLevel: 'MEDIUM',
    costVariancePercent: 8.5
  }
];

const DUMMY_DRIVERS: Record<string, RiskDriver[]> = {
  'PIM-1001': [
    {
      factor: 'Land Acquisition & Right of Way Delays',
      severity: 'CRITICAL',
      impactPercent: 34,
      description: 'Pending clearances in Sector 4 are compounding contractor holding costs.'
    },
    {
      factor: 'Vendor Cash Flow & Liquidity Squeeze',
      severity: 'HIGH',
      impactPercent: 28,
      description: 'Delayed milestone disbursements affecting sub-contractor allocation.'
    },
    {
      factor: 'Environmental & Statutory Clearances',
      severity: 'MEDIUM',
      impactPercent: 18,
      description: 'Stage-2 forest clearance pending final state-level review.'
    }
  ],
  'PIM-1002': [
    {
      factor: 'Subgrade Material Supply Constraints',
      severity: 'HIGH',
      impactPercent: 30,
      description: 'Local quarry restrictions limiting raw aggregate logistics.'
    },
    {
      factor: 'Utility Shifting Bottlenecks',
      severity: 'MEDIUM',
      impactPercent: 22,
      description: 'High-tension power line relocation delayed by local utility board.'
    }
  ]
};

function CostDriversContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjId = searchParams.get('project') || 'PIM-1001';

  const [projects, setProjects] = useState<Project[]>(DUMMY_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjId);
  const [project, setProject] = useState<Project | null>(DUMMY_PROJECTS[0]);
  const [drivers, setDrivers] = useState<RiskDriver[]>(DUMMY_DRIVERS['PIM-1001'] || []);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const currentProj = projects.find(p => p.id === selectedProjectId) || projects[0];
    setProject(currentProj);
    setDrivers(DUMMY_DRIVERS[currentProj.id] || [
      {
        factor: 'General Execution Delay Factor',
        severity: 'MEDIUM',
        impactPercent: 25,
        description: 'Standard operational lag detected across milestones.'
      }
    ]);
  }, [selectedProjectId, projects]);

  const getSeverityStyle = (severity: string): SeverityStyle => {
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      return { bg: '#FFF5F5', color: '#E53E3E', border: '#FEB2B2', fill: '#E53E3E' };
    }
    if (severity === 'MEDIUM') {
      return { bg: '#FFFAF0', color: '#DD6B20', border: '#FBD38D', fill: '#DD6B20' };
    }
    return { bg: '#F0FFF4', color: '#38A169', border: '#9AE6B4', fill: '#38A169' };
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Project Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59A00', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            EXPLAINABLE AI ENGINE (XAI)
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17365D' }}>
            Why Is This Project At Risk? (SHAP Factor Attribution)
          </h1>
          <div style={{ fontSize: '0.82rem', color: '#718096' }}>
            Deconstructing predictive risk factors using SHAP (SHapley Additive exPlanations) values from MoSPI CUF parameters
          </div>
        </div>

        {/* Project Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#17365D' }}>Select Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              const newId = e.target.value;
              setSelectedProjectId(newId);
              router.push(`/dashboard/cost-drivers?project=${newId}`);
            }}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              border: '1px solid #F59A00',
              backgroundColor: '#FFF9EF',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#17365D',
              boxShadow: '0 2px 8px rgba(245, 154, 0, 0.15)'
            }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.name} ({p.riskLevel} Risk)
              </option>
            ))}
          </select>
        </div>
      </div>

      {project && (
        <>
          {/* Project Summary Banner */}
          <div className="card-paimana" style={{ backgroundColor: '#17365D', color: '#FFFFFF', padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#F59A00', fontWeight: 700, letterSpacing: '0.05em' }}>
                  PROJECT INTELLIGENCE CARD • {project.id}
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF9EF', marginTop: '0.2rem' }}>
                  {project.name}
                </h2>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#A0AEC0', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span>Sector: <strong style={{ color: '#FFF9EF' }}>{project.sector}</strong></span>
                  <span>State: <strong style={{ color: '#FFF9EF' }}>{project.state}</strong></span>
                  <span>Department: <strong style={{ color: '#FFF9EF' }}>{project.department}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 1.5rem', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#A0AEC0', fontWeight: 700 }}>COMPOSITE RISK</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: project.riskScore >= 70 ? '#FEB2B2' : '#FBD38D' }}>
                    {project.riskScore} <span style={{ fontSize: '1rem' }}>/ 100</span>
                  </div>
                </div>
                <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.15)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#A0AEC0', fontWeight: 700 }}>COST VARIANCE</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59A00' }}>
                    +{project.costVariancePercent.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explainable AI SHAP Factor Breakdown */}
          <div className="card-paimana">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#17365D' }}>Risk Factor Impact Breakdown (SHAP Feature Attribution)</h3>
                <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                  Relative contribution of top bottleneck parameters driving risk score to {project.riskScore}/100
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#F59A00', backgroundColor: '#FFF9EF', padding: '0.4rem 0.85rem', borderRadius: '20px', border: '1px solid #F59A00', fontWeight: 700 }}>
                <Sparkles size={14} />
                <span>Model Confidence: 93.4%</span>
              </div>
            </div>

            {/* SHAP Bars Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {drivers.map((drv, idx) => {
                const style = getSeverityStyle(drv.severity);
                return (
                  <div key={idx} style={{
                    padding: '1.1rem 1.25rem',
                    borderRadius: '12px',
                    border: `1px solid ${style.border}`,
                    backgroundColor: style.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          backgroundColor: style.color,
                          color: '#FFFFFF',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          {drv.severity}
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#17365D' }}>
                          {drv.factor}
                        </span>
                      </div>

                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: style.color, fontFamily: 'Outfit, sans-serif' }}>
                        {drv.impactPercent}% Weight Impact
                      </div>
                    </div>

                    {/* SHAP Progress Bar */}
                    <div className="progress-bar-container" style={{ height: '10px' }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${drv.impactPercent * 2.2}%`,
                          backgroundColor: style.fill
                        }}
                      />
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#4A5568', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <Info size={14} style={{ color: style.color }} />
                      <span>{drv.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Interventions Card */}
          <div className="card-paimana" style={{ borderLeft: '5px solid #F59A00' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <Sparkles size={20} style={{ color: '#F59A00' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#17365D' }}>PAIMANA AI Recommended Strategic Interventions</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ padding: '0.85rem', backgroundColor: '#FFF9EF', borderRadius: '10px', border: '1px solid #E2D9CC' }}>
                <div style={{ fontWeight: 700, color: '#17365D', marginBottom: '0.2rem' }}>1. Fast-Track Inter-Departmental Clearances</div>
                <div style={{ color: '#718096' }}>Issue urgent directive to SLAO & Ministry of Environment for fast-tracked stage-2 forest clearance.</div>
              </div>
              <div style={{ padding: '0.85rem', backgroundColor: '#FFF9EF', borderRadius: '10px', border: '1px solid #E2D9CC' }}>
                <div style={{ fontWeight: 700, color: '#17365D', marginBottom: '0.2rem' }}>2. Accelerated Equity Release</div>
                <div style={{ color: '#718096' }}>Sanction Q3 grant release to prevent contractor liquidity bottlenecks and interest penalty accumulation.</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function CostDriversPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#17365D', fontWeight: 600 }}>Loading Cost Drivers Engine...</div>}>
      <CostDriversContent />
    </Suspense>
  );
}