import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
  TrendingUp,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  BarChart,
  ArrowRight,
  Sparkles,
  Info,
  Database,
} from 'lucide-react';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface Project {
  id: string;
  name: string;
  riskLevel: string;
  sector: string;
  state: string;
  department: string;
  riskScore: number;
  costVariancePercent: number;
}

interface RiskDriver {
  factor: string;
  severity: Severity;
  impactPercent: number;
  description: string;
}

interface SeverityStyle {
  bg: string;
  color: string;
  border: string;
  fill: string;
}

// Initialize Supabase Client using Vercel Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const CostDrivers: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialProjId = searchParams.get('project') || 'PIM-1001';

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjId);
  const [project, setProject] = useState<Project | null>(null);
  const [drivers, setDrivers] = useState<RiskDriver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Projects List on Mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { data, error: dbError } = await supabase.from('projects').select('*');
        if (dbError) throw dbError;

        if (data && data.length > 0) {
          const mappedProjects: Project[] = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            riskLevel: p.risk_level || 'HIGH',
            sector: p.sector || 'Infrastructure',
            state: p.state || 'National',
            department: p.department || 'MoSPI',
            riskScore: Number(p.risk_score || 75),
            costVariancePercent: Number(p.cost_variance_percent || 12.5),
          }));
          setProjects(mappedProjects);

          const current = mappedProjects.find((p) => p.id === selectedProjectId) || mappedProjects[0];
          setProject(current);
          setSelectedProjectId(current.id);
        }
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch Project Specific Drivers whenever selectedProjectId changes
  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchDrivers = async () => {
      try {
        const currentProj = projects.find((p) => p.id === selectedProjectId);
        if (currentProj) setProject(currentProj);

        const { data, error: dbError } = await supabase
          .from('project_risk_drivers')
          .select('*')
          .eq('project_id', selectedProjectId);

        if (dbError) throw dbError;

        if (data && data.length > 0) {
          const formattedDrivers: RiskDriver[] = data.map((d: any) => ({
            factor: d.factor,
            severity: d.severity as Severity,
            impactPercent: Number(d.impact_percent),
            description: d.description,
          }));
          setDrivers(formattedDrivers);
        } else {
          // Fallback empty if no drivers configured for this specific project yet
          setDrivers([]);
        }
      } catch (err: any) {
        console.error('Error fetching risk drivers:', err);
      }
    };

    fetchDrivers();
  }, [selectedProjectId, projects]);

  const getSeverityStyle = (severity: Severity): SeverityStyle => {
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      return {
        bg: '#FFF5F5',
        color: '#E53E3E',
        border: '#FEB2B2',
        fill: '#E53E3E',
      };
    }
    if (severity === 'MEDIUM') {
      return {
        bg: '#FFFAF0',
        color: '#DD6B20',
        border: '#FBD38D',
        fill: '#DD6B20',
      };
    }
    return {
      bg: '#F0FFF4',
      color: '#38A169',
      border: '#9AE6B4',
      fill: '#38A169',
    };
  };

  return (
    <div
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
    >
      {/* Header & Project Selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#F59A00',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            EXPLAINABLE AI ENGINE (XAI) - LIVE SUPABASE
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17365D' }}>
            Why Is This Project At Risk? (SHAP Factor Attribution)
          </h1>
          <div style={{ fontSize: '0.82rem', color: '#718096' }}>
            Deconstructing predictive risk factors dynamically using live project telemetry
          </div>
        </div>

        {/* Project Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <label
            style={{ fontSize: '0.82rem', fontWeight: 700, color: '#17365D' }}
          >
            Select Project:
          </label>
          <select
            value={selectedProjectId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedProjectId(e.target.value)
            }
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              border: '1px solid #F59A00',
              backgroundColor: '#FFF9EF',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#17365D',
              boxShadow: '0 2px 8px rgba(245, 154, 0, 0.15)',
            }}
          >
            {projects.map((p) => (
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
          <div
            className="card-paimana"
            style={{
              backgroundColor: '#17365D',
              color: '#FFFFFF',
              padding: '1.5rem 2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#F59A00',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}
                >
                  PROJECT INTELLIGENCE CARD • {project.id}
                </div>
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: '#FFF9EF',
                    marginTop: '0.2rem',
                  }}
                >
                  {project.name}
                </h2>
                <div
                  style={{
                    display: 'flex',
                    gap: '1.5rem',
                    fontSize: '0.85rem',
                    color: '#A0AEC0',
                    marginTop: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>
                    Sector:{' '}
                    <strong style={{ color: '#FFF9EF' }}>{project.sector}</strong>
                  </span>
                  <span>
                    State:{' '}
                    <strong style={{ color: '#FFF9EF' }}>{project.state}</strong>
                  </span>
                  <span>
                    Department:{' '}
                    <strong style={{ color: '#FFF9EF' }}>
                      {project.department}
                    </strong>
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '1rem 1.5rem',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#A0AEC0',
                      fontWeight: 700,
                    }}
                  >
                    COMPOSITE RISK
                  </div>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 900,
                      color:
                        project.riskScore >= 70 ? '#FEB2B2' : '#FBD38D',
                    }}
                  >
                    {project.riskScore}{' '}
                    <span style={{ fontSize: '1rem' }}>/ 100</span>
                  </div>
                </div>
                <div
                  style={{
                    width: '1px',
                    height: '40px',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  }}
                />
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#A0AEC0',
                      fontWeight: 700,
                    }}
                  >
                    COST VARIANCE
                  </div>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: '#F59A00',
                    }}
                  >
                    +{project.costVariancePercent.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explainable AI SHAP Factor Breakdown */}
          <div className="card-paimana">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#17365D' }}>
                  Risk Factor Impact Breakdown (Supabase Live Telemetry)
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                  Dynamic bottleneck parameters driving risk score for {project.id}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  color: '#F59A00',
                  backgroundColor: '#FFF9EF',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  border: '1px solid #F59A00',
                  fontWeight: 700,
                }}
              >
                <Database size={14} />
                <span>Live DB Sync Active</span>
              </div>
            </div>

            {/* SHAP Bars Container */}
            {drivers.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#718096', fontSize: '0.9rem' }}>
                No specific risk drivers found in database for project <strong>{project.id}</strong>.
              </div>
            ) : (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                {drivers.map((drv, idx) => {
                  const style = getSeverityStyle(drv.severity);
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '1.1rem 1.25rem',
                        borderRadius: '12px',
                        border: `1px solid ${style.border}`,
                        backgroundColor: style.bg,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                          }}
                        >
                          <span
                            style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              backgroundColor: style.color,
                              color: '#FFFFFF',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                            }}
                          >
                            {drv.severity}
                          </span>
                          <span
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              color: '#17365D',
                            }}
                          >
                            {drv.factor}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: '1.1rem',
                            fontWeight: 900,
                            color: style.color,
                            fontFamily: 'Outfit, sans-serif',
                          }}
                        >
                          {drv.impactPercent}% Weight Impact
                        </div>
                      </div>

                      {/* SHAP Progress Bar */}
                      <div
                        className="progress-bar-container"
                        style={{ height: '10px' }}
                      >
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.min(drv.impactPercent * 2.2, 100)}%`,
                            backgroundColor: style.fill,
                          }}
                        />
                      </div>

                      <div
                        style={{
                          fontSize: '0.82rem',
                          color: '#4A5568',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          marginTop: '0.2rem',
                        }}
                      >
                        <Info size={14} style={{ color: style.color }} />
                        <span>{drv.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};