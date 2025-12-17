import React, { useState, useEffect, useCallback } from 'react';
import Tree from 'react-d3-tree';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Drawer,
  Divider,
  Chip,
  Avatar,
  Button,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Menu as MenuIcon,
  Close,
  Person,
  TrendingUp,
  Groups,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store';

interface TreeNode {
  name: string;
  attributes?: {
    userId: string;
    fullName: string;
    investment: number;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    leftBV?: number;
    rightBV?: number;
    position?: 'LEFT' | 'RIGHT';
  };
  children?: TreeNode[];
}

interface UserDetails {
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  investment: number;
  status: string;
  joinedDate: string;
  totalEarnings: number;
  directReferrals: number;
  teamSize: number;
  leftBV: number;
  rightBV: number;
}

const Genealogy: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [selectedNode, setSelectedNode] = useState<UserDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // Mock data - Replace with API call
  useEffect(() => {
    const mockTreeData: TreeNode = {
      name: user?.fullName || 'You',
      attributes: {
        userId: user?.id || 'USER001',
        fullName: user?.fullName || 'Current User',
        investment: 100000,
        status: 'ACTIVE',
        leftBV: 450000,
        rightBV: 380000,
      },
      children: [
        {
          name: 'Rahul Kumar',
          attributes: {
            userId: 'USER002',
            fullName: 'Rahul Kumar',
            investment: 50000,
            status: 'ACTIVE',
            position: 'LEFT',
            leftBV: 200000,
            rightBV: 250000,
          },
          children: [
            {
              name: 'Priya Sharma',
              attributes: {
                userId: 'USER004',
                fullName: 'Priya Sharma',
                investment: 25000,
                status: 'ACTIVE',
                position: 'LEFT',
              },
            },
            {
              name: 'Amit Patel',
              attributes: {
                userId: 'USER005',
                fullName: 'Amit Patel',
                investment: 30000,
                status: 'INACTIVE',
                position: 'RIGHT',
              },
            },
          ],
        },
        {
          name: 'Sneha Verma',
          attributes: {
            userId: 'USER003',
            fullName: 'Sneha Verma',
            investment: 75000,
            status: 'ACTIVE',
            position: 'RIGHT',
            leftBV: 150000,
            rightBV: 230000,
          },
          children: [
            {
              name: 'Vikram Singh',
              attributes: {
                userId: 'USER006',
                fullName: 'Vikram Singh',
                investment: 40000,
                status: 'PENDING',
                position: 'LEFT',
              },
            },
            {
              name: 'Anjali Gupta',
              attributes: {
                userId: 'USER007',
                fullName: 'Anjali Gupta',
                investment: 35000,
                status: 'ACTIVE',
                position: 'RIGHT',
              },
            },
          ],
        },
      ],
    };

    setTreeData(mockTreeData);
  }, [user]);

  // Calculate tree stats
  const calculateTreeStats = useCallback(() => {
    if (!treeData) return { leftTeam: 0, rightTeam: 0, totalBV: 0, carryForward: 0 };

    const leftBV = treeData.attributes?.leftBV || 0;
    const rightBV = treeData.attributes?.rightBV || 0;
    const totalBV = leftBV + rightBV;
    const carryForward = Math.abs(leftBV - rightBV);

    return {
      leftTeam: leftBV,
      rightTeam: rightBV,
      totalBV,
      carryForward,
    };
  }, [treeData]);

  const stats = calculateTreeStats();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get node color based on status
  const getNodeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#06d6a0';
      case 'INACTIVE':
        return '#ef476f';
      case 'PENDING':
        return '#ffd166';
      default:
        return '#9e9e9e';
    }
  };

  // Custom node rendering
  const renderCustomNode = ({ nodeDatum }: any) => {
    const status = nodeDatum.attributes?.status || 'INACTIVE';
    const nodeColor = getNodeColor(status);

    return (
      <g>
        <circle
          r={25}
          fill={nodeColor}
          stroke="#fff"
          strokeWidth={3}
          style={{ cursor: 'pointer' }}
          onClick={() => handleNodeClick(nodeDatum)}
        />
        <text
          fill="#fff"
          strokeWidth="0"
          x="0"
          y="5"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {nodeDatum.attributes?.fullName?.charAt(0).toUpperCase()}
        </text>
        <text
          fill="#333"
          x="0"
          y="45"
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          style={{ pointerEvents: 'none' }}
        >
          {nodeDatum.attributes?.fullName}
        </text>
        <text
          fill="#666"
          x="0"
          y="60"
          textAnchor="middle"
          fontSize="9"
          style={{ pointerEvents: 'none' }}
        >
          {formatCurrency(nodeDatum.attributes?.investment || 0)}
        </text>
      </g>
    );
  };

  // Handle node click
  const handleNodeClick = (nodeDatum: any) => {
    const userDetails: UserDetails = {
      userId: nodeDatum.attributes?.userId || '',
      fullName: nodeDatum.attributes?.fullName || '',
      email: 'user@example.com', // Replace with API data
      mobile: '+91 98765 43210', // Replace with API data
      investment: nodeDatum.attributes?.investment || 0,
      status: nodeDatum.attributes?.status || 'INACTIVE',
      joinedDate: '2024-01-15', // Replace with API data
      totalEarnings: 25000, // Replace with API data
      directReferrals: 5, // Replace with API data
      teamSize: 15, // Replace with API data
      leftBV: nodeDatum.attributes?.leftBV || 0,
      rightBV: nodeDatum.attributes?.rightBV || 0,
    };

    setSelectedNode(userDetails);
    setDialogOpen(true);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.3));
  };

  const handleCenter = () => {
    setZoom(1);
    setTranslate({ x: 0, y: 0 });
  };

  // Search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    // Implement search logic - highlight node or navigate to it
    alert(`Searching for: ${searchQuery}`);
  };

  // Stats Sidebar
  const StatsSidebar = () => (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Team Statistics
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)} size="small">
            <Close />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* User Info */}
      <Card variant="outlined" sx={{ mb: 2, bgcolor: 'primary.main', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 2 }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                ID: {user?.referralCode}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Team Stats */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'success.lighter' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Groups sx={{ mr: 1, color: 'success.main' }} />
          <Typography variant="body2" fontWeight="600">
            Left Team BV
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight="bold" color="success.main">
          {formatCurrency(stats.leftTeam)}
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'info.lighter' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Groups sx={{ mr: 1, color: 'info.main' }} />
          <Typography variant="body2" fontWeight="600">
            Right Team BV
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight="bold" color="info.main">
          {formatCurrency(stats.rightTeam)}
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'primary.lighter' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" fontWeight="600">
            Total BV
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight="bold" color="primary.main">
          {formatCurrency(stats.totalBV)}
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'warning.lighter' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccountBalanceWallet sx={{ mr: 1, color: 'warning.main' }} />
          <Typography variant="body2" fontWeight="600">
            Carry Forward
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight="bold" color="warning.main">
          {formatCurrency(stats.carryForward)}
        </Typography>
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* Legend */}
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
        Status Legend
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: '#06d6a0',
              mr: 1,
            }}
          />
          <Typography variant="body2">Active</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: '#ef476f',
              mr: 1,
            }}
          />
          <Typography variant="body2">Inactive</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: '#ffd166',
              mr: 1,
            }}
          />
          <Typography variant="body2">Pending</Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            top: isMobile ? 0 : 64,
            height: isMobile ? '100%' : 'calc(100% - 64px)',
          },
        }}
      >
        <StatsSidebar />
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Top Controls */}
        <Paper
          elevation={2}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            zIndex: 1000,
            p: 2,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
          }}
        >
          {isMobile && (
            <IconButton onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}

          <TextField
            size="small"
            placeholder="Search user by ID or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleZoomIn} size="small" color="primary">
              <ZoomIn />
            </IconButton>
            <IconButton onClick={handleZoomOut} size="small" color="primary">
              <ZoomOut />
            </IconButton>
            <IconButton onClick={handleCenter} size="small" color="primary">
              <CenterFocusStrong />
            </IconButton>
          </Box>
        </Paper>

        {/* Tree Visualization */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: '#f5f5f5',
          }}
        >
          {treeData && (
            <Tree
              data={treeData}
              orientation="vertical"
              pathFunc="step"
              translate={{
                x: translate.x || window.innerWidth / 2,
                y: translate.y || 100,
              }}
              zoom={zoom}
              nodeSize={{ x: 200, y: 150 }}
              separation={{ siblings: 1.5, nonSiblings: 2 }}
              renderCustomNodeElement={renderCustomNode}
              enableLegacyTransitions
              transitionDuration={500}
            />
          )}
        </Box>
      </Box>

      {/* User Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">
              User Details
            </Typography>
            <IconButton onClick={() => setDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedNode && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: getNodeColor(selectedNode.status),
                    fontSize: '2rem',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {selectedNode.fullName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {selectedNode.fullName}
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

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {selectedNode.userId}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Joined Date
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {new Date(selectedNode.joinedDate).toLocaleDateString('en-IN')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {selectedNode.email}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Mobile
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {selectedNode.mobile}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Investment
                  </Typography>
                  <Typography variant="body2" fontWeight="600" color="primary">
                    {formatCurrency(selectedNode.investment)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Total Earnings
                  </Typography>
                  <Typography variant="body2" fontWeight="600" color="success.main">
                    {formatCurrency(selectedNode.totalEarnings)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Direct Referrals
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {selectedNode.directReferrals}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Team Size
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {selectedNode.teamSize}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Left BV
                  </Typography>
                  <Typography variant="body2" fontWeight="600" color="success.main">
                    {formatCurrency(selectedNode.leftBV)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Right BV
                  </Typography>
                  <Typography variant="body2" fontWeight="600" color="info.main">
                    {formatCurrency(selectedNode.rightBV)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Genealogy;
