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

interface Project {
  id?: string | number;
  project_name: string;
  State: string;
  original_cost_cr: number;
  anticipated_cost_cr: number;
  cumulative_exp_cr?: number;
  physical_progress_pct?: number;
  cost_overrun_cr?: number;
  start_date?: string;
  target_completion?: string;
  completion_month?: string;
  completion_year?: number;
  sector?: string;
  contractor?: string;
  expected_completion_date?: string;
}

interface ProjectFormData {
  project_name: string;
  sector: string;
  State: string;
  contractor: string;
  original_cost_cr: string;
  anticipated_cost_cr: string;
  target_completion: string;
  expected_completion_date: string;
}

const defaultFormData: ProjectFormData = {
  project_name: '',
  sector: 'General', // Default General
  State: '',
  contractor: '',
  original_cost_cr: '',
  anticipated_cost_cr: '',
  target_completion: '',
  expected_completion_date: '',
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

  const filteredProjects = projects.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.project_name || '').toLowerCase().includes(q) ||
      String(p.id || '').toLowerCase().includes(q) ||
      (p.State || '').toLowerCase().includes(q) ||
      (p.sector || '').toLowerCase().includes(q) ||
      (p.contractor || '').toLowerCase().includes(q)
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
    setFormData(defaultFormData);
    setShowModal(true);
  };

  const handleOpenEditModal = (proj: Project): void => {
    setEditingProject(proj);
    setFormData({
      project_name: proj.project_name || '',
      sector: proj.sector || 'General',
      State: proj.State || '',
      contractor: proj.contractor || '',
      original_cost_cr: proj.original_cost_cr !== undefined ? String(proj.original_cost_cr) : '',
      anticipated_cost_cr: proj.anticipated_cost_cr !== undefined ? String(proj.anticipated_cost_cr) : '',
      target_completion: proj.target_completion || '',
      expected_completion_date: proj.expected_completion_date || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const orig = parseFloat(formData.original_cost_cr) || 0;
    const rev = parseFloat(formData.anticipated_cost_cr) || 0;
    const overrun = Math.max(0, rev - orig);

    // Completion Month & Year Auto Calculation
    let compMonth = '';
    let compYear: number | null = null;
    const dateForComp = formData.expected_completion_date || formData.target_completion;
    if (dateForComp) {
      const d = new Date(dateForComp);
      if (!isNaN(d.getTime())) {
        compMonth = d.toLocaleString('default', { month: 'long' });
        compYear = d.getFullYear();
      }
    }

    const payload = {
      project_name: formData.project_name,
      sector: formData.sector || 'General',
      State: formData.State,
      contractor: formData.contractor,
      original_cost_cr: orig,
      anticipated_cost_cr: rev,
      cost_overrun_cr: overrun,
      target_completion: formData.target_completion || null,
      expected_completion_date: formData.expected_completion_date || null,
      completion_month: compMonth || null,
      completion_year: compYear,
    };

    try {
      if (editingProject) {
        let query = supabase.from('paimana_projects').update(payload);
        if (editingProject.id !== undefined) {
          query = query.eq('id', editingProject.id);
        } else {
          query = query.eq('project_name', editingProject.project_name);
        }
        const { error } = await query;
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
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-9 py-2.5 bg-[#FFF9EF] border border-amber-200/80 rounded-xl text-xs sm:text-sm font-medium text-[#17365D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F59A00] transition-all"
              placeholder="Search by project name, state, sector, contractor..."
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

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#FFF9EF] border-b border-amber-200/60 text-[#17365D] font-extrabold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3.5">Project Name</th>
                <th className="px-4 py-3.5">Sector & State</th>
                <th className="px-4 py-3.5 text-right">Original Cost</th>
                <th className="px-4 py-3.5 text-right">Anticipated Cost</th>
                <th className="px-4 py-3.5 text-center">Status / Overrun</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#F59A00] border-t-transparent rounded-full animate-spin" />
                      Fetching projects data from Supabase...
                    </div>
                  </td>
                </tr>
              ) : paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No projects found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((p, index) => {
                  const overrun = p.cost_overrun_cr || Math.max(0, (p.anticipated_cost_cr || 0) - (p.original_cost_cr || 0));
                  return (
                    <tr
                      key={p.id || `proj-${index}`}
                      className="hover:bg-amber-50/40 transition-colors"
                    >
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-bold text-[#17365D] line-clamp-2">
                          {p.project_name || 'N/A'}
                        </div>
                        {p.contractor && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Agency: {p.contractor}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{p.sector || 'General'}</div>
                        <div className="text-[11px] text-[#F59A00] font-bold">
                          {p.State || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-600 whitespace-nowrap">
                        ₹{(p.original_cost_cr || 0).toLocaleString()} Cr
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-[#17365D] whitespace-nowrap">
                        ₹{(p.anticipated_cost_cr || 0).toLocaleString()} Cr
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

      {/* 🖼️ EXACT MATCH MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-7 border border-slate-100 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-black text-[#F59A00] tracking-wider uppercase block mb-0.5">
                  UPDATE RECORD
                </span>
                <h2 className="text-xl font-black text-[#0B2545]">
                  Edit Project {editingProject?.id ? `#${editingProject.id}` : ''}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs font-bold text-[#17365D]">
              {/* Row 1: Project Name & Sector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label>Project Name *</label>
                  <input
                    type="text"
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    required
                    className="w-full p-3 bg-[#FFFBF0] border border-amber-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F59A00] text-slate-800 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label>Sector *</label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full p-3 bg-[#FFFBF0] border border-amber-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F59A00] text-slate-800 font-medium"
                  >
                    <option value="General">General</option>
                    <option value="Urban Infrastructure">Urban Infrastructure</option>
                    <option value="Transport & Highways">Transport & Highways</option>
                    <option value="Railways">Railways</option>
                    <option value="Water Resources">Water Resources</option>
                    <option value="Power & Energy">Power & Energy</option>
                    <option value="Renewable Energy">Renewable Energy</option>
                  </select>
                </div>
              </div>

              {/* Row 2: State & Contractor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label>State *</label>
                  <input
                    type="text"
                    value={formData.State}
                    onChange={(e) => setFormData({ ...formData, State: e.target.value })}
                    required
                    className="w-full p-3 bg-[#FFFBF0] border border-amber-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F59A00] text-slate-800 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label>Contractor / Executing Agency</label>
                  <input
                    type="text"
                    value={formData.contractor}
                    onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                    className="w-full p-3 bg-[#FFFBF0] border border-amber-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F59A00] text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Row 3: Costs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label>Original Sanctioned Cost (₹ Cr) *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.original_cost_cr}
                    onChange={(e) => setFormData({ ...formData, original_cost_cr: e.target.value })}
                    required
                    className="w-full p-3 bg-[#FFFBF0] border border-amber-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F59A00] text-slate-800 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label>Revised Project Cost (₹ Cr) *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.anticipated_cost_cr}
                    onChange={(e) => setFormData({ ...formData, anticipated_cost_cr: e.target.value })}
                    required
                    className="w-full p-3 bg-[#FFFBF0] border border-amber-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F59A00] text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Row 4: Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label>Original Completion Date</label>
                  <input
                    type="date"
                    value={formData.target_completion}
                    onChange={(e) => setFormData({ ...formData, target_completion: e.target.value })}
                    className="w-full p-3 bg-[#FFFBF0] border border-amber-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F59A00] text-slate-800 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label>Expected Completion Date</label>
                  <input
                    type="date"
                    value={formData.expected_completion_date}
                    onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })}
                    className="w-full p-3 bg-[#FFFBF0] border border-amber-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F59A00] text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-extrabold rounded-2xl hover:bg-slate-50 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#F59A00] hover:bg-amber-600 text-white font-extrabold rounded-2xl shadow-md transition-all cursor-pointer active:scale-95"
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