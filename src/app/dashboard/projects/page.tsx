'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Plus,
  Edit2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Database,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const supabase = createClient(supabaseUrl, supabaseKey);

type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
type ProjectStatus = 'UNDER_IMPLEMENTATION' | 'COMPLETED' | 'DELAYED' | string;
type LandAcquisitionStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | string;

interface Project {
  id: string | number;
  project_name?: string;
  name?: string;
  Sector?: string;
  sector?: string;
  State?: string;
  state?: string;
  ministry?: string;
  department?: string;
  original_cost_cr?: number;
  originalCost?: number;
  anticipated_cost_cr?: number;
  revisedCost?: number;
  cost_overrun_cr?: number;
  originalCompletion?: string;
  expectedCompletion?: string;
  physicalProgressPercent?: number;
  financialProgressPercent?: number;
  contractor?: string;
  fundingSource?: string;
  landAcquisitionStatus?: LandAcquisitionStatus;
  costVariancePercent?: number;
  scheduleDelayMonths?: number;
  riskScore?: number;
  riskLevel?: RiskLevel;
  status?: ProjectStatus;
}

interface ProjectFormData {
  name: string;
  sector: string;
  state: string;
  ministry: string;
  department: string;
  originalCost: string;
  revisedCost: string;
  originalCompletion: string;
  expectedCompletion: string;
  physicalProgressPercent: number;
  financialProgressPercent: number;
  contractor: string;
  fundingSource: string;
  landAcquisitionStatus: LandAcquisitionStatus;
}

const defaultFormData: ProjectFormData = {
  name: '',
  sector: 'Transport & Highways',
  state: 'Maharashtra',
  ministry: 'Ministry of Road Transport and Highways',
  department: 'NHAI',
  originalCost: '',
  revisedCost: '',
  originalCompletion: '',
  expectedCompletion: '',
  physicalProgressPercent: 50,
  financialProgressPercent: 50,
  contractor: '',
  fundingSource: 'Central Sector Scheme',
  landAcquisitionStatus: 'COMPLETED',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadProjects = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('paimana_projects')
        .select('*')
        .limit(3000);

      if (error) {
        console.error('Error fetching data:', error);
      } else if (data) {
        setProjects(data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper getters for unified data structure
  const getProjectName = (p: Project) => p.project_name || p.name || 'Unnamed Project';
  const getProjectSector = (p: Project) => p.Sector || p.sector || 'General';
  const getProjectState = (p: Project) => p.State || p.state || 'N/A';
  const getOriginalCost = (p: Project) => p.original_cost_cr ?? p.originalCost ?? 0;
  const getRevisedCost = (p: Project) => p.anticipated_cost_cr ?? p.revisedCost ?? 0;
  const getCostOverrun = (p: Project) => {
    if (p.cost_overrun_cr !== undefined) return p.cost_overrun_cr;
    const rev = getRevisedCost(p);
    const orig = getOriginalCost(p);
    return Math.max(0, rev - orig);
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      getProjectName(p).toLowerCase().includes(q) ||
      String(p.id).toLowerCase().includes(q) ||
      getProjectState(p).toLowerCase().includes(q) ||
      getProjectSector(p).toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleOpenCreateModal = (): void => {
    setEditingProject(null);
    setFormData({
      name: '',
      sector: 'Transport & Highways',
      state: 'Maharashtra',
      ministry: 'Ministry of Road Transport and Highways',
      department: 'NHAI',
      originalCost: '1000',
      revisedCost: '1200',
      originalCompletion: '2025-06-30',
      expectedCompletion: '2025-12-31',
      physicalProgressPercent: 50,
      financialProgressPercent: 50,
      contractor: 'Larsen & Toubro',
      fundingSource: 'Central Sector Scheme',
      landAcquisitionStatus: 'COMPLETED',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (proj: Project): void => {
    setEditingProject(proj);
    setFormData({
      name: getProjectName(proj),
      sector: getProjectSector(proj),
      state: getProjectState(proj),
      ministry: proj.ministry || '',
      department: proj.department || '',
      originalCost: String(getOriginalCost(proj)),
      revisedCost: String(getRevisedCost(proj)),
      originalCompletion: proj.originalCompletion || '',
      expectedCompletion: proj.expectedCompletion || '',
      physicalProgressPercent: proj.physicalProgressPercent || 50,
      financialProgressPercent: proj.financialProgressPercent || 50,
      contractor: proj.contractor || '',
      fundingSource: proj.fundingSource || '',
      landAcquisitionStatus: proj.landAcquisitionStatus || 'COMPLETED',
    });
    setShowModal(true);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    const orig = parseFloat(formData.originalCost) || 0;
    const rev = parseFloat(formData.revisedCost) || 0;
    const overrun = Math.max(0, rev - orig);

    const payload = {
      project_name: formData.name,
      Sector: formData.sector,
      State: formData.state,
      ministry: formData.ministry,
      department: formData.department,
      original_cost_cr: orig,
      anticipated_cost_cr: rev,
      cost_overrun_cr: overrun,
      originalCompletion: formData.originalCompletion,
      expectedCompletion: formData.expectedCompletion,
      physicalProgressPercent: formData.physicalProgressPercent,
      financialProgressPercent: formData.financialProgressPercent,
      contractor: formData.contractor,
      fundingSource: formData.fundingSource,
      landAcquisitionStatus: formData.landAcquisitionStatus,
    };

    try {
      if (editingProject) {
        const { error } = await supabase
          .from('paimana_projects')
          .update(payload)
          .eq('id', editingProject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('paimana_projects').insert([payload]);
        if (error) throw error;
      }

      setShowModal(false);
      loadProjects();
    } catch (err: any) {
      console.error('Error saving project:', err.message);
      alert('Failed to save project into database.');
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-[#FFF9EF] min-h-screen text-slate-900 font-sans space-y-6">
      {/* 🏛️ HEADER SECTION */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#F59A00] tracking-wider uppercase">
              PROJECT REGISTRY CRUD
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-extrabold rounded-md border border-sky-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F59A00]" />
              ACTIVE DIRECTORY SYNCED
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs font-bold text-[#17365D]">
            <Database className="w-4 h-4 text-[#F59A00]" />
            <span>Total Projects: {projects.length}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
              Infrastructure Project Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add, edit, or filter active MoSPI infrastructure projects and financial milestones.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-[#F59A00] hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 hover:shadow-[0_0_15px_rgba(245,154,0,0.5)]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Infrastructure Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📋 MAIN CONTENT CONTAINER */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-[#F59A00]">
        {/* Search & Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-9 py-2.5 bg-[#FFF9EF] border border-amber-200/80 rounded-xl text-xs sm:text-sm font-medium text-[#17365D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F59A00] transition-all"
              placeholder="Search by project name, state, or sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-500 self-center">
            Showing <strong className="text-[#F59A00]">{filteredProjects.length}</strong> of{' '}
            <strong className="text-[#17365D]">{projects.length}</strong> Projects
          </div>
        </div>

        {/* Projects Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#FFF9EF] border-b border-amber-200/60 text-[#17365D] font-extrabold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Project Name</th>
                <th className="px-4 py-3.5">Sector & State</th>
                <th className="px-4 py-3.5 text-right">Original Cost</th>
                <th className="px-4 py-3.5 text-right">Revised Cost</th>
                <th className="px-4 py-3.5 text-center">Status / Risk</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#F59A00] border-t-transparent rounded-full animate-spin" />
                      Fetching projects data from Supabase...
                    </div>
                  </td>
                </tr>
              ) : paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No projects found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((p, index) => {
                  const overrun = getCostOverrun(p);
                  return (
                    <tr
                      key={p.id || `proj-${index}`}
                      className="hover:bg-amber-50/40 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-bold font-mono text-[#17365D] text-xs">
                        #{p.id}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-bold text-[#17365D] line-clamp-2">
                          {getProjectName(p)}
                        </div>
                        {p.contractor && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Agency: {p.contractor}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{getProjectSector(p)}</div>
                        <div className="text-[11px] text-[#F59A00] font-bold">
                          {getProjectState(p)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-600 whitespace-nowrap">
                        ₹{getOriginalCost(p).toLocaleString()} Cr
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-[#17365D] whitespace-nowrap">
                        ₹{getRevisedCost(p).toLocaleString()} Cr
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {overrun > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-red-50 text-red-700 border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            Overrun: ₹{overrun.toLocaleString()}Cr
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            On Track
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="px-3 py-1.5 bg-[#FFF9EF] hover:bg-amber-100 border border-amber-200 text-[#17365D] text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#F59A00]" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && filteredProjects.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
            <div>
              Showing <strong className="text-[#17365D]">{startIndex + 1}</strong> to{' '}
              <strong className="text-[#17365D]">
                {Math.min(startIndex + itemsPerPage, filteredProjects.length)}
              </strong>{' '}
              of <strong className="text-[#17365D]">{filteredProjects.length}</strong> Infrastructure Records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer font-bold flex items-center gap-1 transition-all hover:border-[#17365D] hover:text-[#17365D]"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              <span className="px-2 font-bold text-[#17365D]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer font-bold flex items-center gap-1 transition-all hover:border-[#17365D] hover:text-[#17365D]"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🏛️ CRUD MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-[#F59A00] tracking-wider uppercase">
                  {editingProject ? 'UPDATE RECORD' : 'NEW INFRASTRUCTURE RECORD'}
                </span>
                <h2 className="text-lg font-extrabold text-[#17365D]">
                  {editingProject
                    ? `Edit Project #${editingProject.id}`
                    : 'Create New Infrastructure Project'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#17365D] font-bold">Project Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full p-2.5 bg-[#FFF9EF] border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59A00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#17365D] font-bold">Sector *</label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full p-2.5 bg-[#FFF9EF] border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59A00]"
                  >
                    <option value="Transport & Highways">Transport & Highways</option>
                    <option value="Railways">Railways</option>
                    <option value="Water Resources">Water Resources</option>
                    <option value="Power & Energy">Power & Energy</option>
                    <option value="Renewable Energy">Renewable Energy</option>
                    <option value="Urban Infrastructure">Urban Infrastructure</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#17365D] font-bold">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="w-full p-2.5 bg-[#FFF9EF] border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59A00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#17365D] font-bold">Contractor / Executing Agency</label>
                  <input
                    type="text"
                    value={formData.contractor}
                    onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                    className="w-full p-2.5 bg-[#FFF9EF] border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59A00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#17365D] font-bold">Original Sanctioned Cost (₹ Cr) *</label>
                  <input
                    type="number"
                    value={formData.originalCost}
                    onChange={(e) => setFormData({ ...formData, originalCost: e.target.value })}
                    required
                    className="w-full p-2.5 bg-[#FFF9EF] border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59A00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#17365D] font-bold">Revised Project Cost (₹ Cr) *</label>
                  <input
                    type="number"
                    value={formData.revisedCost}
                    onChange={(e) => setFormData({ ...formData, revisedCost: e.target.value })}
                    required
                    className="w-full p-2.5 bg-[#FFF9EF] border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59A00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#17365D] font-bold">Original Completion Date</label>
                  <input
                    type="date"
                    value={formData.originalCompletion}
                    onChange={(e) => setFormData({ ...formData, originalCompletion: e.target.value })}
                    className="w-full p-2.5 bg-[#FFF9EF] border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59A00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#17365D] font-bold">Expected Completion Date</label>
                  <input
                    type="date"
                    value={formData.expectedCompletion}
                    onChange={(e) => setFormData({ ...formData, expectedCompletion: e.target.value })}
                    className="w-full p-2.5 bg-[#FFF9EF] border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59A00]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F59A00] hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                >
                  {editingProject ? 'Update Project' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}