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
  Zoom,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as ExitFullscreenIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import Tree from 'react-d3-tree';
import { motion, AnimatePresence } from 'framer-motion';
import TreeNode from './TreeNode';
import { TreeNode as TreeNodeType } from '../../types/team.types';

/**
 * BinaryTree Component Props
 */
interface BinaryTreeProps {
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
}

/**
 * Custom D3 Node Component
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
            variant="compact"
            showBV={true}
            showTeamSize={false}
            isCurrentUser={isCurrentUser}
            animationEnabled={true}
          />
        </div>
      </foreignObject>

      {/* Expand/Collapse indicator for nodes with children */}
      {nodeDatum.__rd3t?.collapsed !== undefined && (
        <g onClick={toggleNode} style={{ cursor: 'pointer' }}>
          <circle
            r={8}
            y={80}
            fill={theme.palette.primary.main}
            stroke={theme.palette.background.paper}
            strokeWidth={2}
          />
          <text
            y={80}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '12px',
              fill: theme.palette.primary.contrastText,
              fontWeight: 'bold',
              pointerEvents: 'none',
            }}
          >
            {nodeDatum.__rd3t?.collapsed ? '+' : '-'}
          </text>
        </g>
      )}
    </g>
  );
};

/**
 * BinaryTree Component
 *
 * Binary tree visualization using react-d3-tree.
 * Features:
 * - Interactive zoom and pan
 * - Collapsible nodes
 * - User navigation
 * - Fullscreen mode
 * - Responsive design
 */
const BinaryTree: React.FC<BinaryTreeProps> = ({
  data,
  currentUserId,
  loading = false,
  error = null,
  onNodeClick,
  onNodeInfoClick,
  onNavigate,
  onRefresh,
  showControls = true,
  initialZoom = 0.8,
  enableFullscreen = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialZoom);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const treeContainerRef = React.useRef<HTMLDivElement>(null);

  /**
   * Convert TreeNode to D3 tree format
   */
  const convertToD3Format = useCallback((node: TreeNodeType): any => {
    const d3Node: any = {
      name: node.name,
      attributes: node,
      children: [],
    };

    if (node.children && node.children.length > 0) {
      // Binary tree: left and right children
      const leftChild = node.children.find((child) => child.placement === 'LEFT');
      const rightChild = node.children.find((child) => child.placement === 'RIGHT');

      if (leftChild) {
        d3Node.children.push(convertToD3Format(leftChild));
      } else {
        // Add empty placeholder for left position
        d3Node.children.push({
          name: 'Empty',
          attributes: null,
          children: [],
        });
      }

      if (rightChild) {
        d3Node.children.push(convertToD3Format(rightChild));
      } else {
        // Add empty placeholder for right position
        d3Node.children.push({
          name: 'Empty',
          attributes: null,
          children: [],
        });
      }
    }

    return d3Node;
  }, []);

  /**
   * D3 tree data
   */
  const treeData = useMemo(() => {
    return convertToD3Format(data);
  }, [data, convertToD3Format]);

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
   * Navigate back to parent
   */
  const handleNavigateBack = () => {
    // This would require tracking navigation history
    // For now, just navigate home
    handleNavigateHome();
  };

  /**
   * Custom path function for links (straight lines)
   */
  const pathFunc = (linkDatum: any, orientation: string) => {
    const { source, target } = linkDatum;
    return orientation === 'horizontal'
      ? `M${source.y},${source.x}L${target.y},${target.x}`
      : `M${source.x},${source.y}L${target.x},${target.y}`;
  };

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
            Loading Tree...
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
        height: isFullscreen ? '100vh' : isMobile ? 400 : 600,
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
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              {/* Navigation Controls */}
              <ButtonGroup variant="contained" size="small">
                <Tooltip title="Go to Root">
                  <Button onClick={handleNavigateHome} startIcon={<HomeIcon />}>
                    {!isMobile && 'Home'}
                  </Button>
                </Tooltip>
                <Tooltip title="Go Back">
                  <Button onClick={handleNavigateBack}>
                    <BackIcon />
                  </Button>
                </Tooltip>
                {onRefresh && (
                  <Tooltip title="Refresh">
                    <Button onClick={onRefresh}>
                      <RefreshIcon />
                    </Button>
                  </Tooltip>
                )}
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
          nodeSize={{ x: 200, y: 200 }}
          separation={{ siblings: 1.5, nonSiblings: 2 }}
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
          depthFactor={200}
          collapsible={true}
          shouldCollapseNeighborNodes={false}
          pathClassFunc={() => 'custom-link'}
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

      {/* Info Overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          bgcolor: theme.palette.background.paper,
          p: 1.5,
          borderRadius: 1,
          boxShadow: theme.shadows[2],
        }}
      >
        <Typography variant="caption" color="text.secondary" display="block">
          <strong>{data.name}</strong> ({data.userId})
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Team Size: {data.teamSize} | Total BV: {data.bv.total.toLocaleString()}
        </Typography>
      </Box>

      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          bgcolor: theme.palette.background.paper,
          p: 1.5,
          borderRadius: 1,
          boxShadow: theme.shadows[2],
        }}
      >
        <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
          Status Legend
        </Typography>
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: theme.palette.success.main,
              }}
            />
            <Typography variant="caption">Active</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: theme.palette.warning.main,
              }}
            />
            <Typography variant="caption">Pending</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: theme.palette.error.main,
              }}
            />
            <Typography variant="caption">Inactive</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default BinaryTree;
