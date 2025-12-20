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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  Download,
  Refresh,
} from '@mui/icons-material';
import html2canvas from 'html2canvas';

import BinaryTree from '@/components/tree/BinaryTree';
import { getBinaryTree } from '@/api/team.api';
import type { TreeNode } from '@/types';

/**
 * BinaryTree Page
 *
 * Binary tree visualization page with:
 * - BinaryTree component
 * - Search user input
 * - Zoom controls
 * - Download as image button
 * - User detail popup on node click
 */
const BinaryTreePage: React.FC = () => {
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

  /**
   * Fetch binary tree data
   */
  const fetchTreeData = async (userId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBinaryTree({
        userId,
        depth: 3,
      });

      if (response.success && response.data) {
        setTreeData(response.data);
        setCurrentUserId(response.data.userId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load binary tree');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initial load
   */
  useEffect(() => {
    fetchTreeData();
  }, []);

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
        link.download = `binary-tree-${Date.now()}.png`;
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
      
      <Box>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Binary Tree
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View your binary genealogy structure
          </Typography>
        </Box>

        {/* Search and Controls */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
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

        {/* Binary Tree Component */}
        <Box data-tree-container sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {treeData ? (
            <BinaryTree
              data={treeData}
              currentUserId={currentUserId}
              loading={loading}
              error={error}
              onNodeClick={handleNodeClick}
              onNodeInfoClick={handleNodeInfoClick}
              onNavigate={handleNavigate}
              onRefresh={handleRefresh}
              showControls={true}
              initialZoom={0.8}
              enableFullscreen={true}
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
                      Placement
                    </Typography>
                    <Chip
                      label={selectedNode.placement}
                      color={selectedNode.placement === 'LEFT' ? 'primary' : 'secondary'}
                      size="small"
                    />
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
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Business Volume
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Left
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="primary.main">
                          {selectedNode.bv.left.toLocaleString()} BV
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Right
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="secondary.main">
                          {selectedNode.bv.right.toLocaleString()} BV
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="success.main">
                          {selectedNode.bv.total.toLocaleString()} BV
                        </Typography>
                      </Box>
                    </Box>
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
    
  );
};


export default BinaryTreePage;
