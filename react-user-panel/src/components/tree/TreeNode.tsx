import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  Chip,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Person as PersonIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  HourglassEmpty as PendingIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { TreeNode as TreeNodeType } from '../../types/team.types';

/**
 * TreeNode Component Props
 */
interface TreeNodeProps {
  node: TreeNodeType;
  onClick?: (node: TreeNodeType) => void;
  onInfoClick?: (node: TreeNodeType) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showBV?: boolean;
  showTeamSize?: boolean;
  showInvestment?: boolean;
  isCurrentUser?: boolean;
  animationEnabled?: boolean;
}

/**
 * Get status color based on status
 */
const getStatusColor = (status: string, theme: any) => {
  switch (status) {
    case 'ACTIVE':
      return theme.palette.success.main;
    case 'INACTIVE':
      return theme.palette.error.main;
    case 'PENDING':
      return theme.palette.warning.main;
    default:
      return theme.palette.grey[500];
  }
};

/**
 * Get status icon based on status
 */
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return <ActiveIcon fontSize="small" />;
    case 'INACTIVE':
      return <InactiveIcon fontSize="small" />;
    case 'PENDING':
      return <PendingIcon fontSize="small" />;
    default:
      return <PersonIcon fontSize="small" />;
  }
};

/**
 * TreeNode Component
 *
 * Reusable tree node component showing user information.
 * Supports multiple variants and customization options.
 */
const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  onClick,
  onInfoClick,
  variant = 'default',
  showBV = true,
  showTeamSize = true,
  showInvestment = false,
  isCurrentUser = false,
  animationEnabled = true,
}) => {
  const theme = useTheme();
  const statusColor = getStatusColor(node.status, theme);

  /**
   * Handle node click
   */
  const handleClick = () => {
    if (onClick) {
      onClick(node);
    }
  };

  /**
   * Handle info button click
   */
  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInfoClick) {
      onInfoClick(node);
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
   * Render compact variant
   */
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={animationEnabled ? { scale: 1.05 } : undefined}
        whileTap={animationEnabled ? { scale: 0.95 } : undefined}
      >
        <Card
          onClick={handleClick}
          sx={{
            minWidth: 120,
            maxWidth: 150,
            cursor: onClick ? 'pointer' : 'default',
            border: isCurrentUser ? `2px solid ${theme.palette.primary.main}` : 'none',
            boxShadow: isCurrentUser ? theme.shadows[4] : theme.shadows[1],
            transition: 'all 0.2s',
            '&:hover': onClick
              ? {
                  boxShadow: theme.shadows[4],
                  transform: 'translateY(-2px)',
                }
              : {},
          }}
        >
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
              <Box position="relative">
                <Avatar
                  src={node.profilePicture}
                  alt={node.name}
                  sx={{
                    width: 40,
                    height: 40,
                    border: `2px solid ${statusColor}`,
                  }}
                >
                  {node.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: statusColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${theme.palette.background.paper}`,
                  }}
                >
                  {getStatusIcon(node.status)}
                </Box>
              </Box>

              <Typography
                variant="caption"
                fontWeight={600}
                textAlign="center"
                noWrap
                sx={{ width: '100%', fontSize: '0.7rem' }}
              >
                {node.name}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.65rem' }}
              >
                {node.userId}
              </Typography>

              {showBV && (
                <Chip
                  label={`BV: ${node.bv.total}`}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    bgcolor: theme.palette.primary.main + '20',
                    color: theme.palette.primary.main,
                  }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  /**
   * Render detailed variant
   */
  if (variant === 'detailed') {
    return (
      <motion.div
        whileHover={animationEnabled ? { scale: 1.02 } : undefined}
        whileTap={animationEnabled ? { scale: 0.98 } : undefined}
      >
        <Card
          onClick={handleClick}
          sx={{
            minWidth: 200,
            maxWidth: 250,
            cursor: onClick ? 'pointer' : 'default',
            border: isCurrentUser ? `2px solid ${theme.palette.primary.main}` : 'none',
            boxShadow: isCurrentUser ? theme.shadows[6] : theme.shadows[2],
            transition: 'all 0.2s',
            '&:hover': onClick
              ? {
                  boxShadow: theme.shadows[6],
                  transform: 'translateY(-4px)',
                }
              : {},
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {/* Header with Avatar and Info */}
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box position="relative">
                  <Avatar
                    src={node.profilePicture}
                    alt={node.name}
                    sx={{
                      width: 56,
                      height: 56,
                      border: `3px solid ${statusColor}`,
                    }}
                  >
                    {node.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: statusColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${theme.palette.background.paper}`,
                    }}
                  >
                    {getStatusIcon(node.status)}
                  </Box>
                </Box>

                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {node.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {node.userId}
                  </Typography>
                  {node.rank && (
                    <Chip
                      label={node.rank}
                      size="small"
                      color="primary"
                      sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>

                {onInfoClick && (
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={handleInfoClick}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* Stats Grid */}
              <Box
                display="grid"
                gridTemplateColumns="1fr 1fr"
                gap={1}
                sx={{
                  pt: 1,
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                {showBV && (
                  <>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Left BV
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {node.bv.left.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Right BV
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="secondary.main">
                        {node.bv.right.toLocaleString()}
                      </Typography>
                    </Box>
                  </>
                )}

                {showTeamSize && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Team Size
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {node.teamSize.toLocaleString()}
                    </Typography>
                  </Box>
                )}

                {showInvestment && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Investment
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(node.totalInvestment)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Status Badge */}
              <Box>
                <Chip
                  label={node.status}
                  size="small"
                  sx={{
                    bgcolor: statusColor + '20',
                    color: statusColor,
                    fontWeight: 600,
                    width: '100%',
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  /**
   * Render default variant
   */
  return (
    <motion.div
      whileHover={animationEnabled ? { scale: 1.03 } : undefined}
      whileTap={animationEnabled ? { scale: 0.97 } : undefined}
    >
      <Card
        onClick={handleClick}
        sx={{
          minWidth: 160,
          maxWidth: 180,
          cursor: onClick ? 'pointer' : 'default',
          border: isCurrentUser ? `2px solid ${theme.palette.primary.main}` : 'none',
          boxShadow: isCurrentUser ? theme.shadows[4] : theme.shadows[2],
          transition: 'all 0.2s',
          '&:hover': onClick
            ? {
                boxShadow: theme.shadows[4],
                transform: 'translateY(-2px)',
              }
            : {},
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            <Box position="relative">
              <Avatar
                src={node.profilePicture}
                alt={node.name}
                sx={{
                  width: 50,
                  height: 50,
                  border: `2px solid ${statusColor}`,
                }}
              >
                {node.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  bgcolor: statusColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${theme.palette.background.paper}`,
                }}
              >
                {getStatusIcon(node.status)}
              </Box>
            </Box>

            <Box textAlign="center" width="100%">
              <Tooltip title={node.name}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {node.name}
                </Typography>
              </Tooltip>
              <Typography variant="caption" color="text.secondary" display="block">
                {node.userId}
              </Typography>
              {node.rank && (
                <Chip
                  label={node.rank}
                  size="small"
                  color="primary"
                  sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }}
                />
              )}
            </Box>

            {showBV && (
              <Box
                display="flex"
                gap={0.5}
                width="100%"
                sx={{
                  pt: 1,
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Tooltip title="Left BV">
                  <Chip
                    label={`L: ${node.bv.left}`}
                    size="small"
                    sx={{
                      flex: 1,
                      height: 20,
                      fontSize: '0.65rem',
                      bgcolor: theme.palette.primary.main + '20',
                      color: theme.palette.primary.main,
                    }}
                  />
                </Tooltip>
                <Tooltip title="Right BV">
                  <Chip
                    label={`R: ${node.bv.right}`}
                    size="small"
                    sx={{
                      flex: 1,
                      height: 20,
                      fontSize: '0.65rem',
                      bgcolor: theme.palette.secondary.main + '20',
                      color: theme.palette.secondary.main,
                    }}
                  />
                </Tooltip>
              </Box>
            )}

            {showTeamSize && (
              <Typography variant="caption" color="text.secondary">
                Team: {node.teamSize}
              </Typography>
            )}

            {onInfoClick && (
              <Tooltip title="View Details">
                <IconButton size="small" onClick={handleInfoClick} sx={{ mt: 0.5 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TreeNode;
