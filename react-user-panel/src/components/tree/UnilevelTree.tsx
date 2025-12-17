import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Button,
  ButtonGroup,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Collapse,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as ExitFullscreenIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import Tree from 'react-d3-tree';
import { motion, AnimatePresence } from 'framer-motion';
import TreeNode from './TreeNode';
import { TreeNode as TreeNodeType } from '../../types/team.types';

/**
 * UnilevelTree Component Props
 */
interface UnilevelTreeProps {
  data: TreeNodeType;
  currentUserId?: string;
  loading?: boolean;
  error?: string | null;
  onNodeClick?: (node: TreeNodeType) => void;
  onNodeInfoClick?: (node: TreeNodeType) => void;
  onNavigate?: (userId: string) => void;
  onRefresh?: () => void;
  showControls?: boolean;
  initialZoom?: number;
  enableFullscreen?: boolean;
  maxDepth?: number;
}

/**
 * Custom D3 Node Component for Unilevel Tree
 */
interface CustomNodeProps {
  nodeDatum: any;
  toggleNode: () => void;
  onNodeClick?: (node: TreeNodeType) => void;
  onNodeInfoClick?: (node: TreeNodeType) => void;
  currentUserId?: string;
}

const CustomNode: React.FC<CustomNodeProps> = ({
  nodeDatum,
  toggleNode,
  onNodeClick,
  onNodeInfoClick,
  currentUserId,
}) => {
  const theme = useTheme();
  const nodeData = nodeDatum.attributes as TreeNodeType;

  if (!nodeData) return null;

  const isCurrentUser = currentUserId === nodeData.userId;
  const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;

  return (
    <g>
      {/* Foreign object for custom HTML */}
      <foreignObject
        x={-90}
        y={-75}
        width={180}
        height={150}
        style={{ overflow: 'visible' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TreeNode
            node={nodeData}
            onClick={onNodeClick}
            onInfoClick={onNodeInfoClick}
            variant="default"
            showBV={true}
            showTeamSize={true}
            isCurrentUser={isCurrentUser}
            animationEnabled={true}
          />
        </div>
      </foreignObject>

      {/* Expand/Collapse indicator for nodes with children */}
      {hasChildren && (
        <g onClick={toggleNode} style={{ cursor: 'pointer' }}>
          <circle
            r={10}
            y={85}
            fill={theme.palette.primary.main}
            stroke={theme.palette.background.paper}
            strokeWidth={2}
          />
          <text
            y={85}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '14px',
              fill: theme.palette.primary.contrastText,
              fontWeight: 'bold',
              pointerEvents: 'none',
            }}
          >
            {nodeDatum.__rd3t?.collapsed ? '+' : '-'}
          </text>
          {nodeDatum.__rd3t?.collapsed && (
            <text
              y={105}
              textAnchor="middle"
              style={{
                fontSize: '10px',
                fill: theme.palette.text.secondary,
                pointerEvents: 'none',
              }}
            >
              {nodeDatum.children.length}
            </text>
          )}
        </g>
      )}
    </g>
  );
};

/**
 * UnilevelTree Component
 *
 * Unilevel tree visualization using react-d3-tree.
 * Shows all direct referrals in a hierarchical structure.
 */
const UnilevelTree: React.FC<UnilevelTreeProps> = ({
  data,
  currentUserId,
  loading = false,
  error = null,
  onNodeClick,
  onNodeInfoClick,
  onNavigate,
  onRefresh,
  showControls = true,
  initialZoom = 0.7,
  enableFullscreen = true,
  maxDepth,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialZoom);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const treeContainerRef = React.useRef<HTMLDivElement>(null);

  /**
   * Convert TreeNode to D3 tree format (unilevel structure)
   */
  const convertToD3Format = useCallback(
    (node: TreeNodeType, depth: number = 0): any => {
      const d3Node: any = {
        name: node.name,
        attributes: node,
        children: [],
      };

      // Check if we should stop at max depth
      if (maxDepth && depth >= maxDepth) {
        return d3Node;
      }

      if (node.children && node.children.length > 0) {
        // Unilevel: all children are direct referrals
        d3Node.children = node.children.map((child) =>
          convertToD3Format(child, depth + 1)
        );
      }

      return d3Node;
    },
    [maxDepth]
  );

  /**
   * Filter tree data based on search term
   */
  const filterTreeData = useCallback(
    (node: any, term: string): any | null => {
      if (!term) return node;

      const nodeData = node.attributes as TreeNodeType;
      const matchesSearch =
        nodeData?.name.toLowerCase().includes(term.toLowerCase()) ||
        nodeData?.userId.toLowerCase().includes(term.toLowerCase());

      if (matchesSearch) return node;

      // Check if any children match
      if (node.children && node.children.length > 0) {
        const filteredChildren = node.children
          .map((child: any) => filterTreeData(child, term))
          .filter((child: any) => child !== null);

        if (filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
          };
        }
      }

      return null;
    },
    []
  );

  /**
   * D3 tree data
   */
  const treeData = useMemo(() => {
    const d3Data = convertToD3Format(data);
    return searchTerm ? filterTreeData(d3Data, searchTerm) || d3Data : d3Data;
  }, [data, searchTerm, convertToD3Format, filterTreeData]);

  /**
   * Update dimensions on mount and resize
   */
  React.useEffect(() => {
    const updateDimensions = () => {
      if (treeContainerRef.current) {
        const { width, height } = treeContainerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        setTranslate({ x: width / 2, y: 100 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  /**
   * Zoom controls
   */
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.3));
  };

  const handleCenter = () => {
    if (treeContainerRef.current) {
      const { width } = treeContainerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 100 });
      setZoom(initialZoom);
    }
  };

  /**
   * Fullscreen controls
   */
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement && treeContainerRef.current) {
      treeContainerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  /**
   * Navigate to home (root user)
   */
  const handleNavigateHome = () => {
    if (onNavigate && currentUserId) {
      onNavigate(currentUserId);
    }
  };

  /**
   * Custom path function for links
   */
  const pathFunc = (linkDatum: any, orientation: string) => {
    const { source, target } = linkDatum;

    if (orientation === 'vertical') {
      // Curved path
      const midY = (source.y + target.y) / 2;
      return `M${source.x},${source.y} C${source.x},${midY} ${target.x},${midY} ${target.x},${target.y}`;
    }

    return `M${source.y},${source.x}L${target.y},${target.x}`;
  };

  /**
   * Calculate tree stats
   */
  const treeStats = useMemo(() => {
    const calculateStats = (node: any): any => {
      let count = 1;
      let maxDepth = 1;
      let activeCount = node.attributes?.status === 'ACTIVE' ? 1 : 0;

      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => {
          const childStats = calculateStats(child);
          count += childStats.count;
          maxDepth = Math.max(maxDepth, childStats.maxDepth + 1);
          activeCount += childStats.activeCount;
        });
      }

      return { count, maxDepth, activeCount };
    };

    return calculateStats(treeData);
  }, [treeData]);

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <Paper
        sx={{
          height: isFullscreen ? '100vh' : 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Unilevel Tree...
          </Typography>
        </Box>
      </Paper>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <Paper
        sx={{
          height: isFullscreen ? '100vh' : 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Alert
          severity="error"
          action={
            onRefresh && (
              <Button color="inherit" size="small" onClick={onRefresh}>
                Retry
              </Button>
            )
          }
        >
          {error}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper
      ref={treeContainerRef}
      sx={{
        position: 'relative',
        height: isFullscreen ? '100vh' : isMobile ? 500 : 700,
        overflow: 'hidden',
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                right: 16,
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {/* Top Controls Row */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
              >
                {/* Navigation Controls */}
                <ButtonGroup variant="contained" size="small">
                  <Tooltip title="Go to Root">
                    <Button onClick={handleNavigateHome} startIcon={<HomeIcon />}>
                      {!isMobile && 'Home'}
                    </Button>
                  </Tooltip>
                  {onRefresh && (
                    <Tooltip title="Refresh">
                      <Button onClick={onRefresh}>
                        <RefreshIcon />
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip title="Filter">
                    <Button onClick={() => setShowFilters(!showFilters)}>
                      <FilterIcon />
                    </Button>
                  </Tooltip>
                </ButtonGroup>

                {/* Zoom Controls */}
                <Box display="flex" gap={1}>
                  <ButtonGroup variant="outlined" size="small">
                    <Tooltip title="Zoom Out">
                      <Button onClick={handleZoomOut}>
                        <ZoomOutIcon />
                      </Button>
                    </Tooltip>
                    <Button disabled sx={{ minWidth: 70 }}>
                      {Math.round(zoom * 100)}%
                    </Button>
                    <Tooltip title="Zoom In">
                      <Button onClick={handleZoomIn}>
                        <ZoomInIcon />
                      </Button>
                    </Tooltip>
                  </ButtonGroup>

                  <Tooltip title="Center Tree">
                    <IconButton size="small" onClick={handleCenter} color="primary">
                      <CenterIcon />
                    </IconButton>
                  </Tooltip>

                  {enableFullscreen && (
                    <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                      <IconButton size="small" onClick={handleToggleFullscreen} color="primary">
                        {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              {/* Filters Row */}
              <Collapse in={showFilters}>
                <Box
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    p: 2,
                    borderRadius: 1,
                    boxShadow: theme.shadows[2],
                  }}
                >
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Collapse>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tree Visualization */}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Tree
          data={treeData}
          translate={translate}
          zoom={zoom}
          scaleExtent={{ min: 0.3, max: 2 }}
          nodeSize={{ x: 220, y: 180 }}
          separation={{ siblings: 1.2, nonSiblings: 1.5 }}
          orientation="vertical"
          pathFunc={pathFunc}
          renderCustomNodeElement={(rd3tProps) => (
            <CustomNode
              {...rd3tProps}
              onNodeClick={onNodeClick}
              onNodeInfoClick={onNodeInfoClick}
              currentUserId={currentUserId}
            />
          )}
          enableLegacyTransitions={true}
          transitionDuration={300}
          depthFactor={180}
          collapsible={true}
          shouldCollapseNeighborNodes={false}
          styles={{
            links: {
              stroke: theme.palette.divider,
              strokeWidth: 2,
            },
            nodes: {
              node: {
                circle: {
                  fill: theme.palette.primary.main,
                  stroke: theme.palette.primary.dark,
                  strokeWidth: 2,
                },
                name: {
                  stroke: 'none',
                  fill: theme.palette.text.primary,
                  fontWeight: 600,
                },
                attributes: {
                  stroke: 'none',
                  fill: theme.palette.text.secondary,
                },
              },
              leafNode: {
                circle: {
                  fill: theme.palette.success.main,
                  stroke: theme.palette.success.dark,
                },
              },
            },
          }}
        />
      )}

      {/* Stats Panel */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          bgcolor: theme.palette.background.paper,
          p: 2,
          borderRadius: 1,
          boxShadow: theme.shadows[2],
          minWidth: 200,
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Tree Statistics
        </Typography>
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Typography variant="caption" color="text.secondary">
            Total Members: <strong>{treeStats.count}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Active Members: <strong>{treeStats.activeCount}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Max Depth: <strong>{treeStats.maxDepth}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Direct Referrals: <strong>{data.children?.length || 0}</strong>
          </Typography>
        </Box>
      </Box>

      {/* Current User Info */}
      <Box
        sx={{
          position: 'absolute',
          top: showFilters ? 140 : 80,
          right: 16,
          bgcolor: theme.palette.background.paper,
          p: 1.5,
          borderRadius: 1,
          boxShadow: theme.shadows[2],
          maxWidth: 250,
        }}
      >
        <Typography variant="caption" color="text.secondary" display="block">
          <strong>{data.name}</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ID: {data.userId} | Team: {data.teamSize}
        </Typography>
      </Box>
    </Paper>
  );
};

export default UnilevelTree;
