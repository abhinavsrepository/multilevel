import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  Chip,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  LinearProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  AccountTree,
  People,
  Refresh,
  Person,
  CheckCircle,
  Lock,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import BinaryTree from '../../components/tree/BinaryTree';
import BarChart from '../../components/charts/BarChart';
import { getBinaryTree, getTeamStats, getLevelBreakdown } from '../../api/team.api';
import { getDirectReferralsStats } from '../../api/team.api';
import { TreeNode as TreeNodeType, TeamStats } from '../../types/team.types';
import { formatCurrency } from '../../utils/formatters';

interface LevelIncomeData {
  level: number;
  income: number;
  members: number;
  percentage: string;
  status: 'unlocked' | 'locked';
}

interface LevelBreakdown {
  level: number;
  members: number;
  active: number;
  investment: number;
  bv: number;
  percentage: number;
}

const BinaryTreeWithStats: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<TreeNodeType | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [levelBreakdown, setLevelBreakdown] = useState<LevelBreakdown[]>([]);
  const [directReferrals, setDirectReferrals] = useState(0);
  const [selectedNode, setSelectedNode] = useState<TreeNodeType | null>(null);
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [treeDepth, setTreeDepth] = useState(3);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, [treeDepth]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tree data
      const treeResponse = await getBinaryTree({ depth: treeDepth });
      if (treeResponse.success && treeResponse.data) {
        setTreeData(treeResponse.data);
        setCurrentUserId(treeResponse.data.userId);
      }

      // Fetch team stats
      const statsResponse = await getTeamStats();
      if (statsResponse.success && statsResponse.data) {
        setTeamStats(statsResponse.data);
      }

      // Fetch level breakdown
      const levelResponse = await getLevelBreakdown();
      if (levelResponse.success && levelResponse.data) {
        setLevelBreakdown(levelResponse.data || []);
      }

      // Fetch direct referrals
      const directResponse = await getDirectReferralsStats();
      if (directResponse.success && directResponse.data) {
        setDirectReferrals(directResponse.data.total || 0);
      }
    } catch (err: any) {
      console.error('Error fetching tree data:', err);
      setError(err.response?.data?.message || 'Failed to load tree data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  const handleDepthChange = (depth: number) => {
    setTreeDepth(depth);
  };

  const handleNodeClick = (node: TreeNodeType) => {
    setSelectedNode(node);
    setNodeDialogOpen(true);
  };

  const handleNodeInfoClick = (node: TreeNodeType) => {
    navigate(`/team/members/${node.id}`);
  };

  const handleNavigateToUser = async (userId: string) => {
    try {
      setTreeLoading(true);
      const response = await getBinaryTree({ userId, depth: treeDepth });
      if (response.success && response.data) {
        setTreeData(response.data);
        setCurrentUserId(userId);
      }
    } catch (err: any) {
      console.error('Error navigating to user:', err);
    } finally {
      setTreeLoading(false);
    }
  };

  // Calculate level unlock status based on direct referrals
  const getLevelUnlockStatus = () => {
    if (directReferrals >= 5) return { unlockedLevels: 10, nextTarget: null, progress: 100 };
    if (directReferrals >= 3) return { unlockedLevels: 5, nextTarget: 5, progress: (directReferrals / 5) * 100 };
    return { unlockedLevels: 2, nextTarget: 3, progress: (directReferrals / 3) * 100 };
  };

  const { unlockedLevels, nextTarget, progress } = getLevelUnlockStatus();

  // Transform level breakdown into chart data with unlock status
  const levelIncomeChartData = useMemo(() => {
    if (!levelBreakdown || levelBreakdown.length === 0) {
      // Generate default 10 levels with 0 values
      return Array.from({ length: 10 }, (_, i) => ({
        level: `L${i + 1}`,
        income: 0,
        members: 0,
        status: i + 1 <= unlockedLevels ? 'unlocked' : 'locked',
      }));
    }

    return levelBreakdown.slice(0, 10).map((level, index) => ({
      level: `L${level.level}`,
      income: level.bv || 0,
      members: level.members || 0,
      status: index + 1 <= unlockedLevels ? 'unlocked' : 'locked',
    }));
  }, [levelBreakdown, unlockedLevels]);

  // Level income data with percentages
  const levelIncomeData: LevelIncomeData[] = useMemo(() => {
    const percentages = [30, 20, 15, 5, 5, 5, 5, 5, 5, 5]; // Level 1-10 commission percentages

    return Array.from({ length: 10 }, (_, i) => {
      const levelData = levelBreakdown.find(l => l.level === i + 1);
      return {
        level: i + 1,
        income: levelData?.bv || 0,
        members: levelData?.members || 0,
        percentage: `${percentages[i]}%`,
        status: (i + 1 <= unlockedLevels ? 'unlocked' : 'locked') as 'unlocked' | 'locked',
      };
    });
  }, [levelBreakdown, unlockedLevels]);

  // Calculate total income
  const totalLevelIncome = useMemo(() => {
    return levelIncomeData
      .filter(l => l.status === 'unlocked')
      .reduce((sum, l) => sum + l.income, 0);
  }, [levelIncomeData]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Binary Tree & Level Income
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualize your team structure and level income breakdown
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Team
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {teamStats?.totalTeam || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Left Leg
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {teamStats?.leftLeg || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <AccountTree />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Right Leg
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {teamStats?.rightLeg || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <AccountTree />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Direct Referrals
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {directReferrals}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <Person />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content - Tree and Level Income */}
      <Grid container spacing={3}>
        {/* Binary Tree Visualization */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  Binary Tree Structure
                </Typography>
                <ButtonGroup size="small" variant="outlined">
                  {[2, 3, 4, 5].map((depth) => (
                    <Button
                      key={depth}
                      onClick={() => handleDepthChange(depth)}
                      variant={treeDepth === depth ? 'contained' : 'outlined'}
                    >
                      {depth} Levels
                    </Button>
                  ))}
                </ButtonGroup>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {treeData ? (
                <BinaryTree
                  data={treeData}
                  currentUserId={currentUserId || undefined}
                  loading={treeLoading}
                  onNodeClick={handleNodeClick}
                  onNodeInfoClick={handleNodeInfoClick}
                  onNavigate={handleNavigateToUser}
                  onRefresh={handleRefresh}
                  showControls={true}
                  initialZoom={0.7}
                  enableFullscreen={true}
                />
              ) : (
                <Alert severity="info">No tree data available</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Level Income Panel */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Level Unlock Progress */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Level Unlock Progress
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {Math.round(progress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

          <Box sx={{
            p: 2,
            bgcolor: 'primary.lighter',
            borderRadius: 2,
            textAlign: 'center',
            mb: 2,
          }}>
            <Typography variant="h3" fontWeight="bold" color="primary.main">
              {unlockedLevels}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Levels Unlocked
            </Typography>
          </Box>

          <Alert severity="info" icon={<Info />}>
            {directReferrals < 3 && (
              <>Need {3 - directReferrals} more direct referrals to unlock Level 5</>
            )}
            {directReferrals >= 3 && directReferrals < 5 && (
              <>Need {5 - directReferrals} more direct referrals to unlock all levels</>
            )}
            {directReferrals >= 5 && (
              <>All levels unlocked! 🎉</>
            )}
          </Alert>
        </CardContent>
      </Card>

            {/* Business Volume Stats */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Business Volume
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Left Leg BV
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="info.main">
                      {formatCurrency(teamStats?.leftBV || 0)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Right Leg BV
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="warning.main">
                      {formatCurrency(teamStats?.rightBV || 0)}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Matching BV
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {formatCurrency(teamStats?.matchingBV || 0)}
                    </Typography>
                  </Box>

                  {(teamStats?.carryForward || 0) > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Carry Forward
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(teamStats?.carryForward || 0)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Level Income Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Level Income Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Commission income from each level in your downline
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <BarChart
                data={levelIncomeChartData.map(item => ({
                  ...item,
                  income: item.status === 'unlocked' ? item.income : 0,
                }))}
                bars={[
                  {
                    dataKey: 'income',
                    fill: theme.palette.primary.main,
                    name: 'Income',
                  }
                ]}
                xAxisKey="level"
                height={300}
                showGrid={true}
                showLegend={false}
                showTooltip={true}
                tooltipFormatter={(value) => formatCurrency(value)}
                xAxisLabel="Level"
                yAxisLabel="Income"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Level Income Details Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Level Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {levelIncomeData.map((level) => (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={level.level}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: level.status === 'unlocked' ? 'success.lighter' : 'grey.100',
                        border: 1,
                        borderColor: level.status === 'unlocked' ? 'success.main' : 'grey.300',
                        opacity: level.status === 'unlocked' ? 1 : 0.6,
                      }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                        <Typography variant="subtitle2" fontWeight="bold" mr={1}>
                          Level {level.level}
                        </Typography>
                        {level.status === 'unlocked' ? (
                          <CheckCircle fontSize="small" color="success" />
                        ) : (
                          <Lock fontSize="small" color="disabled" />
                        )}
                      </Box>

                      <Chip
                        label={level.percentage}
                        size="small"
                        color={level.status === 'unlocked' ? 'success' : 'default'}
                        sx={{ mb: 1 }}
                      />

                      <Typography variant="h6" fontWeight="bold" color={level.status === 'unlocked' ? 'success.main' : 'text.disabled'}>
                        {formatCurrency(level.income)}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {level.members} members
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Level Income (Unlocked Levels)
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {formatCurrency(totalLevelIncome)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Node Detail Dialog */}
      <Dialog
        open={nodeDialogOpen}
        onClose={() => setNodeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Member Details
        </DialogTitle>
        <DialogContent>
          {selectedNode && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Name</Typography>
                <Typography variant="h6" fontWeight="bold">{selectedNode.name}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">User ID</Typography>
                <Typography variant="body1">{selectedNode.userId}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedNode.status}
                  color={
                    selectedNode.status === 'ACTIVE' ? 'success' :
                    selectedNode.status === 'PENDING' ? 'warning' : 'error'
                  }
                  size="small"
                />
              </Box>

              {selectedNode.placement && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Placement</Typography>
                  <Chip
                    label={selectedNode.placement}
                    color={selectedNode.placement === 'LEFT' ? 'info' : 'warning'}
                    size="small"
                  />
                </Box>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary">Team Size</Typography>
                <Typography variant="body1">{selectedNode.teamSize}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Business Volume</Typography>
                <Stack direction="row" spacing={2}>
                  <Box>
                    <Typography variant="caption" color="info.main">Left: {selectedNode.bv.left}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="warning.main">Right: {selectedNode.bv.right}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight="bold">Total: {selectedNode.bv.total}</Typography>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Total Investment</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatCurrency(selectedNode.totalInvestment)}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNodeDialogOpen(false)}>Close</Button>
          {selectedNode && (
            <>
              <Button
                onClick={() => {
                  handleNodeInfoClick(selectedNode);
                  setNodeDialogOpen(false);
                }}
                variant="outlined"
              >
                View Full Details
              </Button>
              <Button
                onClick={() => {
                  handleNavigateToUser(selectedNode.userId);
                  setNodeDialogOpen(false);
                }}
                variant="contained"
              >
                View as Root
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BinaryTreeWithStats;
