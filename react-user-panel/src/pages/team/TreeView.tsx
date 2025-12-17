import React, { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  useTheme,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import {
  LockOpen,
  Lock,
  TrendingUp,
  Group,
  PersonAdd,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Close
} from '@mui/icons-material';
import { getUnilevelTree, getDirectReferralsStats } from '@/api/team.api';
import { TreeNode } from '@/types';
import { toast } from 'react-toastify';
import ReferralRegistrationForm from '@/components/referral/ReferralRegistrationForm';

const TreeView: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<any>(null); // react-d3-tree data/TreeNode
  const [stats, setStats] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [openRegistration, setOpenRegistration] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const dimensions = containerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: 50
      });
    }
  }, [containerRef]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [treeRes, statsRes] = await Promise.all([
        getUnilevelTree({ maxLevels: 5 }), // Initial fetch depth
        getDirectReferralsStats()
      ]);

      if (treeRes.data) {
        // Transform data for react-d3-tree if necessary
        // The API returns 'children' array which works, ensuring 'name' property exists
        const transformNode = (node: TreeNode): any => ({
          name: node.name,
          attributes: {
            Rank: node.rank,
            ID: node.userId,
            Status: node.status,
            'Team Size': node.teamSize,
            'Total Inv': `$${node.totalInvestment?.toLocaleString() || 0}`
          },
          children: node.children?.map(transformNode),
          nodeSvgShape: {
            shape: 'circle',
            shapeProps: {
              r: 10,
              fill: node.status === 'ACTIVE' ? theme.palette.success.main : theme.palette.error.main,
              stroke: theme.palette.background.paper,
              strokeWidth: 1
            },
          },
        }); // Simplified mapping

        // Root node
        setTreeData(transformNode(treeRes.data));
      }

      setStats(statsRes.data);

    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load tree data');
    } finally {
      setLoading(false);
    }
  };

  const calculateEligibility = (totalDirects: number) => {
    let unlockedLevels = 0;
    let nextGoal = '';
    let progress = 0;

    if (totalDirects >= 5) {
      unlockedLevels = 10;
      nextGoal = "Max Levels Unlocked!";
      progress = 100;
    } else if (totalDirects >= 3) {
      unlockedLevels = 5;
      nextGoal = `Sponsor ${5 - totalDirects} more to unlock 10 Levels!`;
      progress = (totalDirects / 5) * 100;
    } else if (totalDirects >= 2) {
      unlockedLevels = 2;
      nextGoal = `Sponsor ${3 - totalDirects} more to unlock 5 Levels!`;
      progress = (totalDirects / 3) * 100;
    } else if (totalDirects >= 1) {
      unlockedLevels = 1;
      nextGoal = `Sponsor ${2 - totalDirects} more to unlock 2 Levels!`;
      progress = (totalDirects / 2) * 100;
    } else {
      unlockedLevels = 0;
      nextGoal = "Sponsor 1 Direct to unlock Level 1!";
      progress = 0;
    }

    return { unlockedLevels, nextGoal, progress };
  };

  const eligibility = stats ? calculateEligibility(stats.total) : { unlockedLevels: 0, nextGoal: '', progress: 0 };

  const handleOpenRegistration = () => {
    setOpenRegistration(true);
  };

  const handleCloseRegistration = () => {
    setOpenRegistration(false);
  };

  const handleRegistrationSuccess = () => {
    toast.success('Member registered successfully!');
    setOpenRegistration(false);
    // Refresh tree data to show new member
    fetchData();
  };

  const renderCustomNodeElement = ({ nodeDatum, toggleNode }: any) => (
    <g>
      <circle r={15} fill={nodeDatum.nodeSvgShape?.shapeProps?.fill || "#ccc"} onClick={toggleNode} />
      <text fill="black" x="20" dy="-5" strokeWidth="0" fontSize="14px" fontWeight="bold">
        {nodeDatum.name}
      </text>
      <text fill="#666" x="20" dy="15" strokeWidth="0" fontSize="12px">
        {nodeDatum.attributes?.Rank || 'Member'}
      </text>
      <text fill="#666" x="20" dy="30" strokeWidth="0" fontSize="10px">
        Inv: {nodeDatum.attributes?.['Total Inv']}
      </text>
    </g>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Level Tree View
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenRegistration}
            startIcon={<PersonAdd />}
          >
            Register New Member
          </Button>
          <Button variant="outlined" onClick={fetchData} startIcon={<ZoomIn />}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Eligibility Widget */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <Group fontSize="large" sx={{ mr: 2 }} />
                  <Typography variant="h6">Direct Referrals</Typography>
                </Box>
                <IconButton
                  onClick={handleOpenRegistration}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                    color: 'inherit'
                  }}
                  size="small"
                  title="Register New Member"
                >
                  <PersonAdd />
                </IconButton>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {stats?.total || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Total Personally Sponsored
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: eligibility.unlockedLevels > 0 ? 'success.light' : 'warning.light', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LockOpen fontSize="large" sx={{ mr: 2 }} />
                <Typography variant="h6">Levels Unlocked</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {eligibility.unlockedLevels}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Eligible Levels for Commission
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Next Goal</Typography>
              </Box>
              <Typography variant="h6" color="secondary" gutterBottom>
                {eligibility.nextGoal}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">Progress</Typography>
                  <Typography variant="caption" color="text.secondary">{Math.round(eligibility.progress)}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={eligibility.progress}
                  sx={{ height: 10, borderRadius: 5 }}
                  color="secondary"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tree Visualization */}
      <Card sx={{ height: '80vh', overflow: 'hidden' }}>
        <Box
          id="treeWrapper"
          sx={{ width: '100%', height: '100%' }}
          ref={containerRef}
        >
          {treeData ? (
            <Tree
              data={treeData}
              translate={translate}
              orientation="vertical"
              pathFunc="step"
              renderCustomNodeElement={renderCustomNodeElement}
              separation={{ siblings: 2, nonSiblings: 2.5 }}
              zoomable={true}
              collapsible={true}
              draggable={true}
            />
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography color="text.secondary">No tree data available.</Typography>
            </Box>
          )}
        </Box>
      </Card>

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          * Scroll to zoom, Drag to move. Click nodes to expand/collapse.
        </Typography>
      </Box>

      {/* Registration Dialog */}
      <Dialog
        open={openRegistration}
        onClose={handleCloseRegistration}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              Register New Member
            </Typography>
            <IconButton onClick={handleCloseRegistration} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <ReferralRegistrationForm onSuccess={handleRegistrationSuccess} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TreeView;
