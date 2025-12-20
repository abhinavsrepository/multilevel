import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
  Alert,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Download,
  PictureAsPdf,
  TableChart,
  TrendingUp,
  People,
  AccountBalance,
  EmojiEvents,
} from '@mui/icons-material';

import { getTeamReport, downloadTeamReport } from '@/api/team.api';
import type { TeamReport as TeamReportType } from '@/types';

/**
 * TeamReport Page
 *
 * Comprehensive team report with 5 sections:
 * 1. Team Summary
 * 2. Business Volume
 * 3. Team Performance
 * 4. Top Performers
 * 5. Level-wise Analysis
 */
const TeamReport: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<TeamReportType | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  /**
   * Fetch team report
   */
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getTeamReport();

        if (response.success && response.data) {
          setReport(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load team report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  /**
   * Format currency
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Handle export
   */
  const handleExport = async (format: 'PDF' | 'EXCEL') => {
    try {
      const blob = await downloadTeamReport({
        reportType: 'FULL',
        format,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team-report-${Date.now()}.${format === 'PDF' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportMenuAnchor(null);
    } catch (err: any) {
      setError(err.message || 'Failed to export report');
    }
  };

  /**
   * Render loading state
   */
  if (loading) {
    return (
      
        <Box>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} key={i}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      
    );
  }

  /**
   * Render error state
   */
  if (error || !report) {
    return (
      
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || 'Failed to load team report'}
        </Alert>
      
    );
  }

  return (
    
      <Box>
        {/* Page Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Team Report
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive analysis of your team network
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
          >
            Export Report
          </Button>
        </Box>

        {/* Section 1: Team Summary */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            1. Team Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Members
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {report.summary.totalMembers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'success.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Left Leg
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {report.summary.legComparison.left}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'secondary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Right Leg
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {report.summary.legComparison.right}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Level Breakdown
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Level</strong></TableCell>
                  <TableCell align="right"><strong>Members</strong></TableCell>
                  <TableCell align="right"><strong>Percentage</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.summary.levelBreakdown.map((level) => (
                  <TableRow key={level.level}>
                    <TableCell>Level {level.level}</TableCell>
                    <TableCell align="right">{level.members}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${level.percentage.toFixed(1)}%`}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Section 2: Business Volume */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            2. Business Volume
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Personal BV
                </Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {report.businessVolume.personalBV.toLocaleString()} BV
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Team BV
                </Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {report.businessVolume.teamBV.toLocaleString()} BV
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Matching BV
                </Typography>
                <Typography variant="h5" fontWeight={700} color="info.main">
                  {report.businessVolume.matchingBV.toLocaleString()} BV
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Left Leg BV
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {report.businessVolume.leftBV.toLocaleString()} BV
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Right Leg BV
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {report.businessVolume.rightBV.toLocaleString()} BV
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Carry Forward
                </Typography>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  {report.businessVolume.carryForward.toLocaleString()} BV
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Section 3: Team Performance */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            3. Team Performance
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}
                    >
                      <AccountBalance />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Investment
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(report.performance.totalInvestment)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'success.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}
                    >
                      <People />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Active Investors
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {report.performance.activeInvestors}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'info.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}
                    >
                      <TrendingUp />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Properties Invested
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {report.performance.propertiesInvested}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Section 4: Top Performers */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            4. Top Performers
          </Typography>
          <Grid container spacing={3}>
            {/* By Investment */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Top by Investment
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {report.topPerformers.byInvestment.slice(0, 5).map((member, index) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Chip label={index + 1} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {member.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.userId}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            {formatCurrency(member.totalInvestment)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* By Team Size */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Top by Team Size
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {report.topPerformers.byTeamSize.slice(0, 5).map((member, index) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Chip label={index + 1} size="small" color="secondary" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {member.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.userId}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            {member.teamSize}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* By Earnings */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Top by Earnings
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {report.topPerformers.byEarnings.slice(0, 5).map((member, index) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Chip label={index + 1} size="small" color="warning" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {member.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.userId}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600} color="warning.main">
                            {member.bv.total.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Paper>

        {/* Section 5: Level-wise Analysis */}
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            5. Level-wise Analysis
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Level</strong></TableCell>
                  <TableCell align="right"><strong>Total Members</strong></TableCell>
                  <TableCell align="right"><strong>Active</strong></TableCell>
                  <TableCell align="right"><strong>Investment</strong></TableCell>
                  <TableCell align="right"><strong>Business Volume</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.levelAnalysis.map((level) => (
                  <TableRow
                    key={level.level}
                    sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}
                  >
                    <TableCell>
                      <Chip label={`Level ${level.level}`} color="primary" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {level.members}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={level.active}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(level.investment)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {level.bv.toLocaleString()} BV
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Export Menu */}
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={() => setExportMenuAnchor(null)}
        >
          <MenuItem onClick={() => handleExport('PDF')}>
            <ListItemIcon>
              <PictureAsPdf fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as PDF</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExport('EXCEL')}>
            <ListItemIcon>
              <TableChart fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as Excel</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    
  );
};

export default TeamReport;
