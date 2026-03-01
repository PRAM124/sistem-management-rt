import React from 'react';
import { FileText, Table, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '@/src/lib/exportUtils';

interface ExportButtonsProps {
  data: any[];
  fileName: string;
  title: string;
}

export default function ExportButtons({ data, fileName, title }: ExportButtonsProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => exportToCSV(data, fileName)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all text-xs font-bold"
        title="Export to CSV"
      >
        <Table size={16} />
        CSV
      </button>
      <button
        onClick={() => exportToExcel(data, fileName)}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all text-xs font-bold"
        title="Export to Excel"
      >
        <FileSpreadsheet size={16} />
        Excel
      </button>
      <button
        onClick={() => exportToPDF(data, fileName, title)}
        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all text-xs font-bold"
        title="Export to PDF"
      >
        <FileText size={16} />
        PDF
      </button>
    </div>
  );
}
