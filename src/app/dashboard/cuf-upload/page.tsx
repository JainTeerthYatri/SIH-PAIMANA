'use client'

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  Database,
  Sparkles,
  Zap,
  AlertTriangle,
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface InvalidSample {
  row: number;
  projectId: string;
  reason: string;
}

interface ValidationSummary {
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  validPayload: any[];
  invalidSamples: InvalidSample[];
}

export default function CufUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [summary, setSummary] = useState<ValidationSummary | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      processCsvFile(uploadedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      processCsvFile(droppedFile);
    }
  };

  const processCsvFile = (fileToProcess: File): void => {
    setParsing(true);
    setError(null);
    setSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('Empty file content');

        const lines = text.split(/\r\n|\n/).filter((line) => line.trim() !== '');
        if (lines.length < 2) throw new Error('CSV file must contain a header and at least one data row.');

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const validPayload: any[] = [];
        const invalidSamples: InvalidSample[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim());
          const rowNum = i + 1;

          const rowObj: Record<string, string> = {};
          headers.forEach((h, index) => {
            rowObj[h] = values[index] || '';
          });

          const projectName = rowObj['project_name'] || rowObj['project_id'] || rowObj['name'];
          const state = rowObj['state'] || 'Unknown';
          const originalCost = Number(rowObj['original_cost_cr'] || rowObj['original_cost'] || 0);
          const anticipatedCost = Number(rowObj['anticipated_cost_cr'] || rowObj['revised_cost_cr'] || originalCost);

          if (!projectName) {
            invalidSamples.push({ row: rowNum, projectId: 'N/A', reason: 'Missing Project Name or ID' });
            continue;
          }

          if (isNaN(originalCost) || rowObj['original_cost_cr'] === 'INVALID') {
            invalidSamples.push({ row: rowNum, projectId: projectName, reason: `Invalid numeric cost value` });
            continue;
          }

          validPayload.push({
            project_name: projectName,
            State: state,
            original_cost_cr: originalCost,
            anticipated_cost_cr: anticipatedCost,
          });
        }

        setSummary({
          fileName: fileToProcess.name,
          totalRows: lines.length - 1,
          validRows: validPayload.length,
          invalidRows: invalidSamples.length,
          validPayload,
          invalidSamples,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to parse CSV file.');
      } finally {
        setParsing(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading uploaded file.');
      setParsing(false);
    };

    reader.readAsText(fileToProcess);
  };

  const handleConfirmImport = async (): Promise<void> => {
    if (!summary || summary.validPayload.length === 0) return;

    try {
      setSaving(true);
      setError(null);

      const { error: dbError } = await supabase
        .from('paimana_projects')
        .upsert(summary.validPayload, { onConflict: 'project_name' });

      if (dbError) throw dbError;

      setSuccessMessage(
        `Successfully synced ${summary.validRows} CUF records into Supabase! Existing matching projects were updated successfully.`
      );
    } catch (err: any) {
      console.error('Supabase upsert error:', err);
      setError(err.message || 'Failed to save records to Supabase.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-[#FFF9EF] min-h-screen text-slate-900 font-sans space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#F59A00] tracking-wider uppercase">
              DATA INGESTION PIPELINE
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-extrabold rounded-md border border-sky-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F59A00]" />
              CUF BATCH SYNC
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold">
            <Database className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Supabase Upsert Ready</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
          MoSPI CUF Data Management & Ingestion
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Upload Common Upload Form (CUF) infrastructure CSV datasets. Matching projects are automatically updated with new metrics.
        </p>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-xs font-bold text-red-700">{error}</p>
        </div>
      )}

      {/* SUCCESS BANNER */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-bold text-emerald-700">{successMessage}</p>
        </div>
      )}

      {/* DRAG & DROP CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#F59A00] bg-[#FFF9EF] rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all hover:bg-amber-50/50"
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            id="cuf-file-input"
            className="hidden"
          />
          <label
            htmlFor="cuf-file-input"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 rounded-full bg-white text-[#F59A00] flex items-center justify-center shadow-lg shadow-amber-500/10">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#17365D]">
                {file ? file.name : 'Upload Common Upload Form Dataset (CSV)'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Drag and drop your MoSPI .csv file here, or click to browse filesystem
              </p>
            </div>

            <div className="text-[11px] text-slate-400 border border-slate-200 px-3 py-1 rounded-full bg-white font-medium">
              Supported: MoSPI CUF Standard Schema v2.4 (.csv up to 50MB)
            </div>
          </label>
        </div>
      </div>

      {/* PARSING LOADER */}
      {parsing && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center">
          <Zap className="w-6 h-6 text-[#F59A00] animate-bounce mb-2" />
          <p className="text-xs font-bold text-[#17365D]">Parsing & validating MoSPI CUF dataset rows...</p>
        </div>
      )}

      {/* VALIDATION SUMMARY */}
      {summary && !parsing && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#17365D]">CUF Dataset Validation Summary</h3>
                <p className="text-xs text-slate-500">File: {summary.fileName}</p>
              </div>
              <button
                onClick={handleConfirmImport}
                disabled={saving || summary.validRows === 0}
                className="px-5 py-2.5 bg-[#F59A00] hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Syncing to Supabase...' : `Sync ${summary.validRows} Records to Supabase`}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FFF9EF] rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">TOTAL ROWS PARSED</div>
                <div className="text-2xl font-black text-[#17365D] mt-1">
                  {summary.totalRows.toLocaleString()}
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">VALID ROWS READY</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {summary.validRows.toLocaleString()}
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="text-[10px] font-bold text-red-700 uppercase">INVALID ROWS DROPPED</div>
                <div className="text-2xl font-black text-red-600 mt-1">
                  {summary.invalidRows}
                </div>
              </div>
            </div>
          </div>

          {/* INVALID ROWS BREAKDOWN TABLE */}
          {summary.invalidSamples.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-[#17365D] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>Validation Exception Log (Sample Flagged Rows)</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[#17365D]">
                      <th className="p-3 font-bold">Row #</th>
                      <th className="p-3 font-bold">Project Name / ID</th>
                      <th className="p-3 font-bold">Validation Error Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.invalidSamples.map((inv, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="p-3 font-bold text-red-600">Row {inv.row}</td>
                        <td className="p-3 font-semibold text-[#17365D]">{inv.projectId}</td>
                        <td className="p-3 text-slate-500">{inv.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}