/**
 * PDF Export Utilities
 * Provides functions to export data and HTML content to PDF using jsPDF and html2canvas
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDate, formatCurrency } from './formatters';
import { APP_INFO, DATE_FORMATS } from './constants';

/**
 * PDF export options
 */
export interface PDFExportOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  unit?: 'pt' | 'mm' | 'cm' | 'in';
  format?: 'a4' | 'letter' | 'legal';
  compress?: boolean;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
}

/**
 * Export HTML element to PDF
 */
export const exportElementToPDF = async (
  elementId: string,
  options: PDFExportOptions = {}
): Promise<void> => {
  try {
    const {
      filename = 'document.pdf',
      orientation = 'portrait',
      format = 'a4',
      compress = true,
      title = 'Document',
      author = APP_INFO.NAME,
    } = options;

    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Capture element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
      compress,
    });

    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;

    // Add metadata
    pdf.setProperties({
      title,
      author,
      subject: title,
      creator: APP_INFO.NAME,
    });

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, scaledWidth, scaledHeight);

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

/**
 * Export HTML element to PDF with multiple pages
 */
export const exportElementToPDFMultiPage = async (
  elementId: string,
  options: PDFExportOptions = {}
): Promise<void> => {
  try {
    const {
      filename = 'document.pdf',
      orientation = 'portrait',
      format = 'a4',
      compress = true,
      title = 'Document',
      author = APP_INFO.NAME,
    } = options;

    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Capture element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format,
      compress,
    });

    // Add metadata
    pdf.setProperties({
      title,
      author,
      subject: title,
      creator: APP_INFO.NAME,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const widthRatio = pdfWidth / imgWidth;
    const heightRatio = pdfHeight / imgHeight;
    const ratio = widthRatio > heightRatio ? heightRatio : widthRatio;

    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;

    let heightLeft = scaledHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, scaledWidth, scaledHeight);
    heightLeft -= pdfHeight;

    // Add remaining pages
    while (heightLeft >= 0) {
      position = heightLeft - scaledHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, scaledWidth, scaledHeight);
      heightLeft -= pdfHeight;
    }

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

/**
 * Export table data to PDF
 */
export interface TableColumn {
  header: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}

export interface TableExportOptions extends PDFExportOptions {
  columns: TableColumn[];
  data: any[];
  tableTitle?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  footerText?: string;
  styles?: {
    headerFontSize?: number;
    bodyFontSize?: number;
    footerFontSize?: number;
    headerColor?: string;
    bodyColor?: string;
    footerColor?: string;
    alternateRowColor?: string;
  };
}

export const exportTableToPDF = (options: TableExportOptions): void => {
  try {
    const {
      filename = 'table.pdf',
      orientation = 'portrait',
      format = 'a4',
      compress = true,
      title = 'Table',
      author = APP_INFO.NAME,
      columns,
      data,
      tableTitle,
      showHeader = true,
      showFooter = true,
      footerText,
      styles = {},
    } = options;

    const {
      headerFontSize = 12,
      bodyFontSize = 10,
      footerFontSize = 8,
      headerColor = '#1976d2',
      bodyColor = '#000000',
      footerColor = '#666666',
      alternateRowColor = '#f5f5f5',
    } = styles;

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
      compress,
    });

    // Add metadata
    pdf.setProperties({
      title,
      author,
      subject: title,
      creator: APP_INFO.NAME,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Add title
    if (tableTitle) {
      pdf.setFontSize(16);
      pdf.setTextColor(headerColor);
      pdf.text(tableTitle, margin, yPosition);
      yPosition += 10;
    }

    // Add timestamp
    if (showHeader) {
      pdf.setFontSize(8);
      pdf.setTextColor(footerColor);
      const timestamp = `Generated on: ${formatDate(new Date(), DATE_FORMATS.DISPLAY_WITH_TIME)}`;
      pdf.text(timestamp, margin, yPosition);
      yPosition += 8;
    }

    // Calculate column widths
    const totalWidth = pageWidth - 2 * margin;
    const columnWidths = columns.map((col) => {
      if (col.width) return col.width;
      return totalWidth / columns.length;
    });

    // Draw table header
    pdf.setFillColor(headerColor);
    pdf.rect(margin, yPosition, totalWidth, 10, 'F');

    pdf.setFontSize(headerFontSize);
    pdf.setTextColor('#ffffff');

    let xPosition = margin;
    columns.forEach((col, index) => {
      const align = col.align || 'left';
      const textWidth = pdf.getTextWidth(col.header);
      let textX = xPosition + 2;

      if (align === 'center') {
        textX = xPosition + (columnWidths[index] - textWidth) / 2;
      } else if (align === 'right') {
        textX = xPosition + columnWidths[index] - textWidth - 2;
      }

      pdf.text(col.header, textX, yPosition + 7);
      xPosition += columnWidths[index];
    });

    yPosition += 10;

    // Draw table rows
    pdf.setFontSize(bodyFontSize);
    pdf.setTextColor(bodyColor);

    data.forEach((row, rowIndex) => {
      // Check if we need a new page
      if (yPosition + 10 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      // Alternate row color
      if (rowIndex % 2 === 1) {
        pdf.setFillColor(alternateRowColor);
        pdf.rect(margin, yPosition, totalWidth, 10, 'F');
      }

      xPosition = margin;
      columns.forEach((col, colIndex) => {
        const value = row[col.key];
        const displayValue = col.format ? col.format(value) : String(value || '-');
        const align = col.align || 'left';
        const textWidth = pdf.getTextWidth(displayValue);
        let textX = xPosition + 2;

        if (align === 'center') {
          textX = xPosition + (columnWidths[colIndex] - textWidth) / 2;
        } else if (align === 'right') {
          textX = xPosition + columnWidths[colIndex] - textWidth - 2;
        }

        pdf.text(displayValue, textX, yPosition + 7);
        xPosition += columnWidths[colIndex];
      });

      yPosition += 10;
    });

    // Add footer
    if (showFooter) {
      const footer = footerText || APP_INFO.COPYRIGHT;
      pdf.setFontSize(footerFontSize);
      pdf.setTextColor(footerColor);
      pdf.text(footer, margin, pageHeight - 10);

      // Add page numbers
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margin - 20,
          pageHeight - 10
        );
      }
    }

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting table to PDF:', error);
    throw error;
  }
};

/**
 * Export invoice to PDF
 */
export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date | string;
  dueDate?: Date | string;
  from: {
    name: string;
    address: string;
    email?: string;
    phone?: string;
    gst?: string;
  };
  to: {
    name: string;
    address: string;
    email?: string;
    phone?: string;
    gst?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax?: number;
  taxPercentage?: number;
  discount?: number;
  total: number;
  notes?: string;
  terms?: string;
}

export const exportInvoiceToPDF = (
  invoiceData: InvoiceData,
  options: PDFExportOptions = {}
): void => {
  try {
    const {
      filename = `invoice-${invoiceData.invoiceNumber}.pdf`,
      orientation = 'portrait',
      format = 'a4',
      compress = true,
    } = options;

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
      compress,
    });

    // Add metadata
    pdf.setProperties({
      title: `Invoice ${invoiceData.invoiceNumber}`,
      author: APP_INFO.NAME,
      subject: `Invoice ${invoiceData.invoiceNumber}`,
      creator: APP_INFO.NAME,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Header
    pdf.setFontSize(24);
    pdf.setTextColor('#1976d2');
    pdf.text('INVOICE', margin, yPosition);

    pdf.setFontSize(10);
    pdf.setTextColor('#000000');
    pdf.text(`#${invoiceData.invoiceNumber}`, pageWidth - margin - 30, yPosition);

    yPosition += 10;

    // Invoice details
    pdf.setFontSize(9);
    pdf.setTextColor('#666666');
    pdf.text(`Date: ${formatDate(invoiceData.invoiceDate)}`, pageWidth - margin - 40, yPosition);
    yPosition += 5;

    if (invoiceData.dueDate) {
      pdf.text(`Due Date: ${formatDate(invoiceData.dueDate)}`, pageWidth - margin - 40, yPosition);
      yPosition += 5;
    }

    yPosition += 5;

    // From section
    pdf.setFontSize(10);
    pdf.setTextColor('#000000');
    pdf.text('From:', margin, yPosition);
    yPosition += 5;

    pdf.setFontSize(9);
    pdf.text(invoiceData.from.name, margin, yPosition);
    yPosition += 5;
    pdf.setTextColor('#666666');
    const fromAddressLines = pdf.splitTextToSize(invoiceData.from.address, 80);
    pdf.text(fromAddressLines, margin, yPosition);
    yPosition += fromAddressLines.length * 5;

    if (invoiceData.from.email) {
      pdf.text(invoiceData.from.email, margin, yPosition);
      yPosition += 5;
    }
    if (invoiceData.from.phone) {
      pdf.text(invoiceData.from.phone, margin, yPosition);
      yPosition += 5;
    }
    if (invoiceData.from.gst) {
      pdf.text(`GST: ${invoiceData.from.gst}`, margin, yPosition);
      yPosition += 5;
    }

    // To section
    yPosition = margin + 30;

    pdf.setFontSize(10);
    pdf.setTextColor('#000000');
    pdf.text('Bill To:', pageWidth - margin - 80, yPosition);
    yPosition += 5;

    pdf.setFontSize(9);
    pdf.text(invoiceData.to.name, pageWidth - margin - 80, yPosition);
    yPosition += 5;
    pdf.setTextColor('#666666');
    const toAddressLines = pdf.splitTextToSize(invoiceData.to.address, 80);
    pdf.text(toAddressLines, pageWidth - margin - 80, yPosition);
    yPosition += toAddressLines.length * 5;

    if (invoiceData.to.email) {
      pdf.text(invoiceData.to.email, pageWidth - margin - 80, yPosition);
      yPosition += 5;
    }
    if (invoiceData.to.phone) {
      pdf.text(invoiceData.to.phone, pageWidth - margin - 80, yPosition);
      yPosition += 5;
    }
    if (invoiceData.to.gst) {
      pdf.text(`GST: ${invoiceData.to.gst}`, pageWidth - margin - 80, yPosition);
      yPosition += 5;
    }

    yPosition += 10;

    // Items table
    const tableWidth = pageWidth - 2 * margin;
    const colWidths = {
      description: tableWidth * 0.5,
      quantity: tableWidth * 0.15,
      rate: tableWidth * 0.175,
      amount: tableWidth * 0.175,
    };

    // Table header
    pdf.setFillColor('#1976d2');
    pdf.rect(margin, yPosition, tableWidth, 10, 'F');

    pdf.setFontSize(9);
    pdf.setTextColor('#ffffff');
    pdf.text('Description', margin + 2, yPosition + 7);
    pdf.text('Qty', margin + colWidths.description + 2, yPosition + 7);
    pdf.text('Rate', margin + colWidths.description + colWidths.quantity + 2, yPosition + 7);
    pdf.text('Amount', margin + colWidths.description + colWidths.quantity + colWidths.rate + 2, yPosition + 7);

    yPosition += 10;

    // Table rows
    pdf.setTextColor('#000000');
    invoiceData.items.forEach((item, index) => {
      if (index % 2 === 1) {
        pdf.setFillColor('#f5f5f5');
        pdf.rect(margin, yPosition, tableWidth, 8, 'F');
      }

      pdf.text(item.description, margin + 2, yPosition + 6);
      pdf.text(String(item.quantity), margin + colWidths.description + 2, yPosition + 6);
      pdf.text(formatCurrency(item.rate), margin + colWidths.description + colWidths.quantity + 2, yPosition + 6);
      pdf.text(formatCurrency(item.amount), margin + colWidths.description + colWidths.quantity + colWidths.rate + 2, yPosition + 6);

      yPosition += 8;
    });

    yPosition += 5;

    // Totals
    const totalX = pageWidth - margin - 50;

    pdf.setFontSize(9);
    pdf.setTextColor('#666666');
    pdf.text('Subtotal:', totalX - 30, yPosition);
    pdf.setTextColor('#000000');
    pdf.text(formatCurrency(invoiceData.subtotal), totalX, yPosition);
    yPosition += 6;

    if (invoiceData.discount) {
      pdf.setTextColor('#666666');
      pdf.text('Discount:', totalX - 30, yPosition);
      pdf.setTextColor('#000000');
      pdf.text(`-${formatCurrency(invoiceData.discount)}`, totalX, yPosition);
      yPosition += 6;
    }

    if (invoiceData.tax) {
      pdf.setTextColor('#666666');
      const taxLabel = invoiceData.taxPercentage ? `Tax (${invoiceData.taxPercentage}%):` : 'Tax:';
      pdf.text(taxLabel, totalX - 30, yPosition);
      pdf.setTextColor('#000000');
      pdf.text(formatCurrency(invoiceData.tax), totalX, yPosition);
      yPosition += 6;
    }

    // Total
    pdf.setDrawColor('#1976d2');
    pdf.line(totalX - 35, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    pdf.setFontSize(11);
    pdf.setTextColor('#1976d2');
    pdf.text('Total:', totalX - 30, yPosition);
    pdf.text(formatCurrency(invoiceData.total), totalX, yPosition);

    yPosition += 10;

    // Notes
    if (invoiceData.notes) {
      pdf.setFontSize(9);
      pdf.setTextColor('#000000');
      pdf.text('Notes:', margin, yPosition);
      yPosition += 5;
      pdf.setTextColor('#666666');
      const notesLines = pdf.splitTextToSize(invoiceData.notes, pageWidth - 2 * margin);
      pdf.text(notesLines, margin, yPosition);
      yPosition += notesLines.length * 5 + 5;
    }

    // Terms
    if (invoiceData.terms) {
      pdf.setFontSize(9);
      pdf.setTextColor('#000000');
      pdf.text('Terms & Conditions:', margin, yPosition);
      yPosition += 5;
      pdf.setTextColor('#666666');
      const termsLines = pdf.splitTextToSize(invoiceData.terms, pageWidth - 2 * margin);
      pdf.text(termsLines, margin, yPosition);
    }

    // Footer
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(8);
    pdf.setTextColor('#999999');
    pdf.text(APP_INFO.COPYRIGHT, margin, pageHeight - 10);

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting invoice to PDF:', error);
    throw error;
  }
};

/**
 * Export simple text to PDF
 */
export const exportTextToPDF = (
  text: string,
  options: PDFExportOptions = {}
): void => {
  try {
    const {
      filename = 'document.pdf',
      orientation = 'portrait',
      format = 'a4',
      compress = true,
      title = 'Document',
      author = APP_INFO.NAME,
    } = options;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
      compress,
    });

    pdf.setProperties({
      title,
      author,
      subject: title,
      creator: APP_INFO.NAME,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;

    pdf.setFontSize(12);
    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);

    let yPosition = margin;
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 7;
    });

    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting text to PDF:', error);
    throw error;
  }
};

export default {
  exportElementToPDF,
  exportElementToPDFMultiPage,
  exportTableToPDF,
  exportInvoiceToPDF,
  exportTextToPDF,
};
