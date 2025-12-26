import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Stack,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import Tree from 'react-d3-tree';
import { toast } from 'react-toastify';
import { getLevelTreeView, searchTreeMembers } from '@/api/team.api';

interface TreeNodeData {
  name: string;
  attributes?: Record<string, any>;
  children?: TreeNodeData[];
  nodeSvgShape?: {
    shape: string;
    shapeProps: Record<string, any>;
  };
}

interface APITreeNode {
  userId: number;
  username: string;
  fullName: string;
  firstName: string;
  lastName: string;
  rank: string;
  status: string;
  joiningDate: string;
  personalBv: number;
  teamBv: number;
  totalBv: number;
  totalInvestment: number;
  totalDownline: number;
  directReferralCount: number;
  activeDirectReferrals: number;
  inactiveDirectReferrals: number;
  profilePicture?: string;
  level: number;
  isLevelUnlocked: boolean;
  hasChildren: boolean;
  children: APITreeNode[];
}

const TeamLevelTreeView: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeNodeData | null>(null);
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [maxLevels] = useState(3);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'tree' | 'heatmap'>('tree');

  const dimensions = useMemo(() => ({
    width: window.innerWidth - 300,
    height: window.innerHeight - 200,
  }), []);

  // Load tree data
  const loadTreeData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getLevelTreeView({ maxLevels });

      if (response.success && response.data) {
        setApiData(response.data);

        // Transform API data to react-d3-tree format
        const transformedData = transformNodeToD3Format(response.data.tree as APITreeNode, response.data.levelUnlockStatus);
        setTreeData(transformedData);
      } else {
        toast.error('Failed to load tree data');
      }
    } catch (error: any) {
      console.error('Error loading tree data:', error);
      toast.error(error.response?.data?.message || 'Failed to load tree data');
    } finally {
      setLoading(false);
    }
  }, [maxLevels]);

  useEffect(() => {
    loadTreeData();
  }, [loadTreeData]);

  // Center tree on mount
  useEffect(() => {
    if (treeData && dimensions) {
      setTranslate({
        x: dimensions.width / 2,
        y: 50,
      });
    }
  }, [treeData, dimensions]);

  // Transform API node to D3 tree format
  const transformNodeToD3Format = (node: APITreeNode, levelUnlockStatus: Record<number, boolean>): TreeNodeData => {
    const isLocked = !levelUnlockStatus[node.level];
    const statusColor = node.status === 'ACTIVE' ? '#22c55e' : '#ef4444';

    return {
      name: node.fullName || `${node.firstName} ${node.lastName}`,
      attributes: {
        userId: node.userId,
        username: node.username,
        rank: node.rank,
        status: node.status,
        level: node.level,
        directReferrals: node.directReferralCount,
        totalDownline: node.totalDownline,
        totalBv: node.totalBv,
        totalInvestment: node.totalInvestment,
        activeDirectReferrals: node.activeDirectReferrals,
        inactiveDirectReferrals: node.inactiveDirectReferrals,
        isLocked,
        hasChildren: node.hasChildren,
        profilePicture: node.profilePicture,
        statusColor,
      },
      children: node.children && node.children.length > 0
        ? node.children.map(child => transformNodeToD3Format(child, levelUnlockStatus))
        : undefined,
    };
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) {
      toast.warning('Please enter at least 2 characters');
      return;
    }

    try {
      setSearchLoading(true);
      const response = await searchTreeMembers({
        query: searchQuery,
        rootUserId: apiData?.rootUser?.userId,
      });

      if (response.success && response.data) {
        setSearchResults(response.data);
        setSearchDialogOpen(true);
      }
    } catch (error: any) {
      console.error('Error searching:', error);
      toast.error('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle node click
  const handleNodeClick = useCallback(async (nodeDatum: any) => {
    const nodeData = nodeDatum.data.attributes;

    // If node has children and is not expanded, show option to expand
    if (nodeData.hasChildren && !expandedNodes.has(nodeData.userId)) {
      // Lazy load children
      try {
        toast.info('Loading node data...');
        // This would expand children - for now just mark as expanded
        setExpandedNodes(prev => new Set(prev).add(nodeData.userId));
      } catch (error) {
        console.error('Error expanding node:', error);
      }
    }
  }, [expandedNodes]);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.2));
  const handleCenter = () => {
    setTranslate({ x: dimensions.width / 2, y: 50 });
    setZoom(1);
  };

  // Custom node render
  const renderCustomNode = ({ nodeDatum, toggleNode }: any) => {
    const attrs = nodeDatum.attributes || {};
    const isLocked = attrs.isLocked;
    const isHeatmap = viewMode === 'heatmap';

    // Calculate heatmap color based on business volume
    let heatmapColor = '#f3f4f6';
    if (isHeatmap) {
      const bv = attrs.totalBv || 0;
      if (bv > 100000) heatmapColor = '#065f46'; // Dark green
      else if (bv > 50000) heatmapColor = '#047857'; // Green
      else if (bv > 25000) heatmapColor = '#10b981'; // Light green
      else if (bv > 10000) heatmapColor = '#34d399'; // Lighter green
      else if (bv > 0) heatmapColor = '#6ee7b7'; // Very light green
    }

    const nodeOpacity = isLocked ? 0.4 : 1;
    const borderColor = isLocked ? '#9ca3af' : attrs.statusColor;
    const fillColor = isHeatmap ? heatmapColor : (isLocked ? '#e5e7eb' : '#ffffff');

    return (
      <g opacity={nodeOpacity}>
        {/* Node background card */}
        <rect
          width="180"
          height="120"
          x="-90"
          y="-60"
          fill={fillColor}
          stroke={borderColor}
          strokeWidth="2"
          rx="8"
          style={{ cursor: 'pointer' }}
          onClick={toggleNode}
        />

        {/* Lock icon if locked */}
        {isLocked && (
          <g transform="translate(70, -50)">
            <circle r="12" fill="#9ca3af" />
            <text fill="white" fontSize="12" textAnchor="middle" y="4">
              🔒
            </text>
          </g>
        )}

        {/* Status badge */}
        <circle
          r="6"
          cx="75"
          cy="-50"
          fill={attrs.statusColor}
        />

        {/* User name */}
        <text
          fill={isLocked ? '#6b7280' : '#111827'}
          fontSize="14"
          fontWeight="600"
          textAnchor="middle"
          y="-30"
        >
          {nodeDatum.name.length > 18 ? `${nodeDatum.name.substring(0, 18)}...` : nodeDatum.name}
        </text>

        {/* Username */}
        <text
          fill={isLocked ? '#9ca3af' : '#6b7280'}
          fontSize="11"
          textAnchor="middle"
          y="-15"
        >
          @{attrs.username}
        </text>

        {/* Rank */}
        <text
          fill={isLocked ? '#9ca3af' : '#3b82f6'}
          fontSize="10"
          fontWeight="500"
          textAnchor="middle"
          y="0"
        >
          {attrs.rank}
        </text>

        {/* Direct Referrals */}
        <text
          fill={isLocked ? '#9ca3af' : '#059669'}
          fontSize="10"
          textAnchor="middle"
          y="15"
        >
          👥 {attrs.directReferrals} Direct
        </text>

        {/* Total Downline */}
        <text
          fill={isLocked ? '#9ca3af' : '#7c3aed'}
          fontSize="10"
          textAnchor="middle"
          y="30"
        >
          📊 {attrs.totalDownline} Team
        </text>

        {/* Business Volume or Investment */}
        <text
          fill={isLocked ? '#9ca3af' : '#dc2626'}
          fontSize="10"
          textAnchor="middle"
          y="45"
        >
          {isHeatmap ? `💰 ₹${(attrs.totalBv / 1000).toFixed(1)}K` : `💼 ₹${(attrs.totalInvestment / 1000).toFixed(1)}K`}
        </text>

        {/* Expand indicator if has children */}
        {attrs.hasChildren && nodeDatum.children && nodeDatum.children.length === 0 && (
          <g transform="translate(0, 55)">
            <rect width="30" height="20" x="-15" y="-10" fill="#3b82f6" rx="4" />
            <text fill="white" fontSize="14" textAnchor="middle" y="4">
              +
            </text>
          </g>
        )}
      </g>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Team Level Tree View
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Interactive visualization of your team hierarchy with level unlock logic
      </Typography>

      {/* Level Unlock Status Alert */}
      {apiData && (
        <Alert severity={apiData.nextUnlockRequirement.needed === 0 ? 'success' : 'info'} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Direct Referrals: {apiData.rootUser.directReferralCount}
              </Typography>
              <Typography variant="body2">
                {apiData.nextUnlockRequirement.message}
              </Typography>
            </Box>
          </Stack>
        </Alert>
      )}

      {/* Global KPIs */}
      {apiData && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <GroupIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Members
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {apiData.globalKPIs.totalNodesRendered}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TrendingUpIcon color="success" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Active Members
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="success.main">
                      {apiData.globalKPIs.totalActiveMembers}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon color="error" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Inactive Members
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="error.main">
                      {apiData.globalKPIs.totalInactiveMembers}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <BusinessIcon color="warning" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Business Volume
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      ₹{(apiData.globalKPIs.totalBusinessVolume / 1000).toFixed(1)}K
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchLoading && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={searchLoading}
            >
              Search
            </Button>
          </Grid>
          <Grid item xs>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Tooltip title="Zoom In">
                <IconButton onClick={handleZoomIn} size="small">
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom Out">
                <IconButton onClick={handleZoomOut} size="small">
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Center">
                <IconButton onClick={handleCenter} size="small">
                  <CenterIcon />
                </IconButton>
              </Tooltip>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="tree">
                  Tree
                </ToggleButton>
                <ToggleButton value="heatmap">
                  Heatmap
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Tree Visualization */}
      {treeData && (
        <Paper
          sx={{
            height: dimensions.height,
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tree
            data={treeData}
            orientation="vertical"
            pathFunc="step"
            translate={translate}
            zoom={zoom}
            scaleExtent={{ min: 0.1, max: 2 }}
            nodeSize={{ x: 200, y: 150 }}
            separation={{ siblings: 1, nonSiblings: 1.5 }}
            renderCustomNodeElement={renderCustomNode}
            onNodeClick={handleNodeClick}
            enableLegacyTransitions
            transitionDuration={500}
          />

          {/* Legend */}
          <Paper
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              p: 2,
              minWidth: 200,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Legend
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: '#22c55e',
                  }}
                />
                <Typography variant="caption">Active</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: '#ef4444',
                  }}
                />
                <Typography variant="caption">Inactive</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <LockIcon fontSize="small" sx={{ color: '#9ca3af' }} />
                <Typography variant="caption">Locked Level</Typography>
              </Stack>
              {viewMode === 'heatmap' && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" fontWeight={600}>
                    Business Volume Heatmap
                  </Typography>
                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 16, height: 16, bgcolor: '#065f46' }} />
                      <Typography variant="caption">&gt; ₹100K</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 16, height: 16, bgcolor: '#10b981' }} />
                      <Typography variant="caption">₹25K - ₹100K</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 16, height: 16, bgcolor: '#6ee7b7' }} />
                      <Typography variant="caption">&lt; ₹25K</Typography>
                    </Stack>
                  </Stack>
                </>
              )}
            </Stack>
          </Paper>
        </Paper>
      )}

      {/* Search Results Dialog */}
      <Dialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Search Results</DialogTitle>
        <DialogContent>
          {searchResults.length === 0 ? (
            <Typography color="text.secondary">No results found</Typography>
          ) : (
            <List>
              {searchResults.map((result, index) => (
                <ListItem key={index} divider>
                  <ListItemAvatar>
                    <Avatar src={result.profilePicture}>
                      {result.fullName?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={result.fullName}
                    secondary={
                      <Stack spacing={0.5}>
                        <Typography variant="caption">@{result.username}</Typography>
                        <Typography variant="caption">{result.rank} • {result.status}</Typography>
                        {result.uplinePath && result.uplinePath.length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Path: {result.uplinePath.map((u: any) => u.username).join(' → ')}
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TeamLevelTreeView;
