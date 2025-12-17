import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Description as ReportIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Assessment as AssessmentIcon,
  AccountBalance as InvestmentIcon,
  People as TeamIcon,
  Receipt as TaxIcon,
  TrendingUp as CommissionIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNotification } from '@/hooks/useNotification';
import {
  generateReport,
  checkReportStatus,
  emailReport,
  downloadMonthlyStatement,
  downloadTaxReport,
  downloadInvestmentReport,
  downloadCommissionReport,
  downloadTeamReport,
} from '@/api/report.api';
import { ReportRequest } from '@/types';

/**
 * Report Type Card Data
 */
interface ReportCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'FINANCIAL' | 'TEAM' | 'TAX' | 'INVESTMENT';
  color: string;
}

/**
 * Report Filter State
 */
interface ReportFilters {
  startDate: string;
  endDate: string;
  format: 'PDF' | 'EXCEL' | 'CSV';
  year?: number;
  month?: number;
  financialYear?: string;
  reportType?: string;
}

/**
 * Report Generation Status
 */
interface ReportStatus {
  reportId: string;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  downloadUrl?: string;
  error?: string;
}

/**
 * Reports Page Component
 *
 * Displays available reports, allows generation with filters,
 * shows preview, and provides download/email options.
 */
const Reports: React.FC = () => {
  const { success, error } = useNotification();

  // State
  const [reportTypes, setReportTypes] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportCard | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<ReportStatus | null>(null);
  const [polling, setPolling] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'PDF',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  /**
   * Predefined report cards
   */
  const predefinedReports: ReportCard[] = [
    {
      id: 'monthly-statement',
      name: 'Monthly Statement',
      description: 'Comprehensive monthly financial statement with all transactions',
      icon: <ReportIcon fontSize="large" />,
      category: 'FINANCIAL',
      color: '#1976d2',
    },
    {
      id: 'commission-report',
      name: 'Commission Report',
      description: 'Detailed commission earnings breakdown by type and period',
      icon: <CommissionIcon fontSize="large" />,
      category: 'FINANCIAL',
      color: '#2e7d32',
    },
    {
      id: 'investment-report',
      name: 'Investment Report',
      description: 'Portfolio summary with all investments and returns',
      icon: <InvestmentIcon fontSize="large" />,
      category: 'INVESTMENT',
      color: '#ed6c02',
    },
    {
      id: 'team-report',
      name: 'Team Report',
      description: 'Complete team structure and performance metrics',
      icon: <TeamIcon fontSize="large" />,
      category: 'TEAM',
      color: '#9c27b0',
    },
    {
      id: 'tax-report',
      name: 'Tax Report',
      description: 'Annual tax report with TDS details and Form 26AS',
      icon: <TaxIcon fontSize="large" />,
      category: 'TAX',
      color: '#d32f2f',
    },
    {
      id: 'annual-report',
      name: 'Annual Report',
      description: 'Complete annual performance and financial summary',
      icon: <AssessmentIcon fontSize="large" />,
      category: 'FINANCIAL',
      color: '#0288d1',
    },
  ];

  /**
   * Load report types on mount
   */
  useEffect(() => {
    setReportTypes(predefinedReports);
  }, []);

  /**
   * Handle report card click
   */
  const handleReportClick = (report: ReportCard) => {
    setSelectedReport(report);
    setShowFilterModal(true);
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (field: keyof ReportFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Handle generate report
   */
  const handleGenerateReport = async () => {
    if (!selectedReport) return;

    try {
      setLoading(true);

      // For specific reports, use direct download
      if (selectedReport.id === 'monthly-statement') {
        const blob = await downloadMonthlyStatement({
          year: filters.year!,
          month: filters.month!,
          format: filters.format,
        });
        downloadBlob(blob, `monthly-statement-${filters.year}-${filters.month}.${filters.format.toLowerCase()}`);
        success('Monthly statement downloaded successfully');
      } else if (selectedReport.id === 'tax-report') {
        const blob = await downloadTaxReport({
          financialYear: filters.financialYear || `${filters.year}-${filters.year! + 1}`,
          format: filters.format as 'PDF' | 'EXCEL',
        });
        downloadBlob(blob, `tax-report-${filters.financialYear}.${filters.format.toLowerCase()}`);
        success('Tax report downloaded successfully');
      } else if (selectedReport.id === 'investment-report') {
        const blob = await downloadInvestmentReport({
          startDate: filters.startDate,
          endDate: filters.endDate,
          format: filters.format,
        });
        downloadBlob(blob, `investment-report.${filters.format.toLowerCase()}`);
        success('Investment report downloaded successfully');
      } else if (selectedReport.id === 'commission-report') {
        const blob = await downloadCommissionReport({
          startDate: filters.startDate,
          endDate: filters.endDate,
          format: filters.format,
        });
        downloadBlob(blob, `commission-report.${filters.format.toLowerCase()}`);
        success('Commission report downloaded successfully');
      } else if (selectedReport.id === 'team-report') {
        const blob = await downloadTeamReport({
          reportType: 'FULL',
          format: filters.format,
        });
        downloadBlob(blob, `team-report.${filters.format.toLowerCase()}`);
        success('Team report downloaded successfully');
      } else {
        // Generic report generation
        const requestData: ReportRequest = {
          reportType: selectedReport.id,
          startDate: filters.startDate,
          endDate: filters.endDate,
          format: filters.format,
          filters: {
            year: filters.year,
            month: filters.month,
            financialYear: filters.financialYear,
          },
        };

        const response = await generateReport(requestData);

        if (response.success && response.data) {
          setGenerationStatus({
            reportId: response.data.reportId,
            status: response.data.status,
            downloadUrl: response.data.downloadUrl,
          });

          if (response.data.status === 'GENERATING') {
            // Start polling for status
            startPolling(response.data.reportId);
          } else if (response.data.status === 'COMPLETED' && response.data.downloadUrl) {
            // Download immediately
            window.open(response.data.downloadUrl, '_blank');
            success('Report generated successfully');
          }
        }
      }

      setShowFilterModal(false);
    } catch (err: any) {
      console.error('Generate report error:', err);
      error(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Poll for report generation status
   */
  const startPolling = (reportId: string) => {
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const response = await checkReportStatus(reportId);
        if (response.success && response.data) {
          setGenerationStatus(response.data);

          if (response.data.status === 'COMPLETED') {
            clearInterval(interval);
            setPolling(false);
            success('Report generated successfully');
            if (response.data.downloadUrl) {
              window.open(response.data.downloadUrl, '_blank');
            }
          } else if (response.data.status === 'FAILED') {
            clearInterval(interval);
            setPolling(false);
            error(response.data.error || 'Report generation failed');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        clearInterval(interval);
        setPolling(false);
      }
    }, 3000);

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      setPolling(false);
    }, 300000);
  };

  /**
   * Download blob as file
   */
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  /**
   * Handle email report
   */
  const handleEmailReport = async () => {
    if (!generationStatus) return;

    try {
      const response = await emailReport(generationStatus.reportId);
      if (response.success) {
        success('Report sent to your email');
      }
    } catch (err: any) {
      error(err.message || 'Failed to email report');
    }
  };

  /**
   * Close filter modal
   */
  const handleCloseFilterModal = () => {
    setShowFilterModal(false);
    setSelectedReport(null);
  };

  /**
   * Get financial years for dropdown
   */
  const getFinancialYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(`${currentYear - i}-${currentYear - i + 1}`);
    }
    return years;
  };

  /**
   * Render report filter fields based on report type
   */
  const renderFilterFields = () => {
    if (!selectedReport) return null;

    switch (selectedReport.id) {
      case 'monthly-statement':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Year"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Month"
                value={filters.month}
                onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <MenuItem key={month} value={month}>
                    {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </>
        );

      case 'tax-report':
        return (
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Financial Year"
              value={filters.financialYear || getFinancialYears()[0]}
              onChange={(e) => handleFilterChange('financialYear', e.target.value)}
            >
              {getFinancialYears().map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        );

      default:
        return (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </>
        );
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate and download various financial, investment, and team reports
        </Typography>
      </Box>

      {/* Generation Status Alert */}
      {generationStatus && polling && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            generationStatus.status === 'GENERATING' ? (
              <CircularProgress size={24} />
            ) : null
          }
        >
          {generationStatus.status === 'GENERATING' && (
            <>
              Generating report... {generationStatus.progress && `${generationStatus.progress}%`}
            </>
          )}
          {generationStatus.status === 'COMPLETED' && 'Report generated successfully!'}
          {generationStatus.status === 'FAILED' && `Report generation failed: ${generationStatus.error}`}
        </Alert>
      )}

      {/* Report Cards Grid */}
      <Grid container spacing={3}>
        {reportTypes.map((report, index) => (
          <Grid item xs={12} sm={6} md={4} key={report.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 8,
                  },
                  borderTop: 3,
                  borderColor: report.color,
                }}
                onClick={() => handleReportClick(report)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: `${report.color}15`,
                        color: report.color,
                        mr: 2,
                      }}
                    >
                      {report.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {report.name}
                      </Typography>
                      <Chip
                        label={report.category}
                        size="small"
                        sx={{
                          bgcolor: `${report.color}20`,
                          color: report.color,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {report.description}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: report.color,
                      '&:hover': {
                        bgcolor: report.color,
                        opacity: 0.9,
                      },
                    }}
                    startIcon={<ReportIcon />}
                  >
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Filter Modal */}
      <Dialog
        open={showFilterModal}
        onClose={handleCloseFilterModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600}>
              Generate {selectedReport?.name}
            </Typography>
            <IconButton onClick={handleCloseFilterModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              {renderFilterFields()}

              {/* Format Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Format</InputLabel>
                  <Select
                    value={filters.format}
                    label="Format"
                    onChange={(e) => handleFilterChange('format', e.target.value)}
                  >
                    <MenuItem value="PDF">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PdfIcon fontSize="small" color="error" />
                        PDF
                      </Box>
                    </MenuItem>
                    {selectedReport?.id !== 'tax-report' && (
                      <>
                        <MenuItem value="EXCEL">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ExcelIcon fontSize="small" color="success" />
                            Excel
                          </Box>
                        </MenuItem>
                        <MenuItem value="CSV">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ExcelIcon fontSize="small" />
                            CSV
                          </Box>
                        </MenuItem>
                      </>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={handleCloseFilterModal} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          >
            {loading ? 'Generating...' : 'Generate & Download'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;
