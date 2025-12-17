import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate, formatCurrency } from './helpers';

// Export to Excel
export const exportToExcel = (data: any[], filename: string): void => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Export to CSV
export const exportToCSV = (data: any[], filename: string): void => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to PDF
export const exportToPDF = (
  data: any[],
  columns: { header: string; dataKey: string }[],
  filename: string,
  title?: string
): void => {
  const doc = new jsPDF();

  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 15);
  }

  autoTable(doc, {
    startY: title ? 25 : 15,
    head: [columns.map((col) => col.header)],
    body: data.map((row) => columns.map((col) => row[col.dataKey] || '')),
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [24, 144, 255] },
  });

  doc.save(`${filename}.pdf`);
};

// Export table to Excel
export const exportTableToExcel = (tableId: string, filename: string): void => {
  const table = document.getElementById(tableId);
  if (table) {
    const workbook = XLSX.utils.table_to_book(table);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }
};

// Format data for export
export const formatDataForExport = (data: any[], formatters?: Record<string, (value: any) => any>): any[] => {
  return data.map((row) => {
    const formatted: any = {};
    Object.keys(row).forEach((key) => {
      if (formatters && formatters[key]) {
        formatted[key] = formatters[key](row[key]);
      } else {
        formatted[key] = row[key];
      }
    });
    return formatted;
  });
};
