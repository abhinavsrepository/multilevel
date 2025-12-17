import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Slider,
} from '@mui/material';
import {
  Search,
  Download,
  Refresh,
  Layers,
} from '@mui/icons-material';
import html2canvas from 'html2canvas';

import UnilevelTree from '@/components/tree/UnilevelTree';
import { getUnilevelTree, getLevelBreakdown } from '@/api/team.api';
import type { TreeNode, LevelAnalysis } from '@/types';

/**
 * UnilevelTree Page
 *
 * Unilevel tree visualization page with:
 * - UnilevelTree component
 * - Level summary cards
 * - Expand/collapse by level
 * - Search functionality
 */
const UnilevelTreePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [searchUserId, setSearchUserId] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [maxDepth, setMaxDepth] = useState(5);
  const [levelSummary, setLevelSummary] = useState<LevelAnalysis[]>([]);

  /**
   * Fetch unilevel tree data
   */
  const fetchTreeData = async (userId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const [treeRes, levelRes] = await Promise.all([
        getUnilevelTree({
          userId,
          maxLevels: maxDepth,
        }),
        getLevelBreakdown(),
      ]);

      if (treeRes.success && treeRes.data) {
        setTreeData(treeRes.data);
        setCurrentUserId(treeRes.data.userId);
      }

      if (levelRes.success && levelRes.data) {
        setLevelSummary(levelRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load unilevel tree');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initial load
   */
  useEffect(() => {
    fetchTreeData();
  }, [maxDepth]);

  /**
   * Handle search
   */
  const handleSearch = () => {
    if (searchUserId.trim()) {
      fetchTreeData(searchUserId.trim());
    } else {
      fetchTreeData();
    }
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    fetchTreeData(currentUserId);
  };

  /**
   * Handle node click
   */
  const handleNodeClick = (node: TreeNode) => {
    setSelectedNode(node);
    setShowNodeDialog(true);
  };

  /**
   * Handle node info click
   */
  const handleNodeInfoClick = (node: TreeNode) => {
    setSelectedNode(node);
    setShowNodeDialog(true);
  };

  /**
   * Handle navigate to user
   */
  const handleNavigate = (userId: string) => {
    setSearchUserId(userId);
    fetchTreeData(userId);
  };

  /**
   * Download tree as image
   */
  const handleDownloadImage = async () => {
    const treeElement = document.querySelector('[data-tree-container]');
    if (treeElement) {
      try {
        const canvas = await html2canvas(treeElement as HTMLElement, {
          backgroundColor: theme.palette.background.default,
          scale: 2,
        });
        const link = document.createElement('a');
        link.download = `unilevel-tree-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (err) {
        console.error('Failed to download image:', err);
      }
    }
  };

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
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <DashboardLayout title="Unilevel Tree" showBreadcrumb={false}>
      <Box>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Unilevel Tree
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View your unilevel genealogy structure
          </Typography>
        </Box>

        {/* Level Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {levelSummary.slice(0, 5).map((level) => (
            <Grid item xs={12} sm={6} md={2.4} key={level.level}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Level {level.level}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                    {level.members}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Active
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color="success.main">
                      {level.active}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      BV
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {(level.bv / 1000).toFixed(0)}k
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Search and Controls */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by User ID..."
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Layers fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Max Depth: {maxDepth}
                  </Typography>
                </Box>
                <Slider
                  value={maxDepth}
                  onChange={(e, value) => setMaxDepth(value as number)}
                  min={1}
                  max={10}
                  step={1}
                  marks
                  size="small"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download />}
                  onClick={handleDownloadImage}
                  disabled={loading || !treeData}
                >
                  Download
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Unilevel Tree Component */}
        <Box data-tree-container sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {treeData ? (
            <UnilevelTree
              data={treeData}
              currentUserId={currentUserId}
              loading={loading}
              error={error}
              onNodeClick={handleNodeClick}
              onNodeInfoClick={handleNodeInfoClick}
              onNavigate={handleNavigate}
              onRefresh={handleRefresh}
              showControls={true}
              initialZoom={0.7}
              enableFullscreen={true}
              maxDepth={maxDepth}
            />
          ) : (
            !loading && (
              <Paper
                sx={{
                  height: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No tree data available
                </Typography>
              </Paper>
            )
          )}
        </Box>

        {/* Node Detail Dialog */}
        <Dialog
          open={showNodeDialog}
          onClose={() => setShowNodeDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          {selectedNode && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight={600}>
                    User Details
                  </Typography>
                  <Chip
                    label={selectedNode.status}
                    color={
                      selectedNode.status === 'ACTIVE'
                        ? 'success'
                        : selectedNode.status === 'PENDING'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Name
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedNode.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      User ID
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedNode.userId}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rank
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedNode.rank || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Team Size
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedNode.teamSize}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Investment
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatCurrency(selectedNode.totalInvestment)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total BV
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="success.main">
                      {selectedNode.bv.total.toLocaleString()} BV
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Direct Referrals
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedNode.children?.length || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Joining Date
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatDate(selectedNode.joiningDate)}
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowNodeDialog(false)}>Close</Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    handleNavigate(selectedNode.userId);
                    setShowNodeDialog(false);
                  }}
                >
                  View Tree
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default UnilevelTreePage;
