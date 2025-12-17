import { useState } from 'react';
import { message } from 'antd';
import { exportToExcel, exportToCSV, exportToPDF } from '@/utils/exportUtils';

export const useExport = () => {
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async (data: any[], filename: string) => {
    try {
      setExporting(true);
      exportToExcel(data, filename);
      message.success('Exported to Excel successfully');
    } catch (error) {
      message.error('Failed to export to Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async (data: any[], filename: string) => {
    try {
      setExporting(true);
      exportToCSV(data, filename);
      message.success('Exported to CSV successfully');
    } catch (error) {
      message.error('Failed to export to CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async (
    data: any[],
    columns: { header: string; dataKey: string }[],
    filename: string,
    title?: string
  ) => {
    try {
      setExporting(true);
      exportToPDF(data, columns, filename, title);
      message.success('Exported to PDF successfully');
    } catch (error) {
      message.error('Failed to export to PDF');
    } finally {
      setExporting(false);
    }
  };

  return {
    exporting,
    exportExcel: handleExportExcel,
    exportCSV: handleExportCSV,
    exportPDF: handleExportPDF,
  };
};
