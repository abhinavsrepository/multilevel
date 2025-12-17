import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  IconButton,
  Paper,
  Button,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  MonetizationOn as MoneyIcon,
  EmojiEvents as TrophyIcon,
  PersonAdd as PersonAddIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Circle as CircleIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import api from '../../api/config/axiosConfig';

// --- Types ---
interface Notification {
  id: number;
  title: string;
  message: string;
  type: string; // 'info', 'success', 'warning', 'error', 'bonus', 'rank', 'referral'
  isRead: boolean;
  createdAt: string;
}

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

const Notifications: React.FC = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // --- Fetch Notifications ---
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      if (response.data.status === 'success') {
        const sortedData = response.data.data.sort((a: Notification, b: Notification) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(sortedData);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // --- Actions ---
  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic UI update - functionality might not be in backend yet, but UI should support it if needed
    // For now, let's just mark as read if delete isn't supported, or implement delete api call
    // Assuming a delete endpoint exists or just hiding it for now
    try {
      // await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification', error);
    }
  };


  // --- Helper Functions ---
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bonus':
      case 'commission':
        return <MoneyIcon sx={{ color: '#4caf50' }} />;
      case 'rank':
      case 'achievement':
        return <TrophyIcon sx={{ color: '#ffca28' }} />;
      case 'referral':
        return <PersonAddIcon sx={{ color: '#2196f3' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'success':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      default:
        return <NotificationsIcon sx={{ color: theme.palette.primary.main }} />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box
        component={motion.div}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="700" sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stay updated with your latest activities and alerts
          </Typography>
        </Box>

        <Tooltip title="Mark all displayed notifications as read">
          <Button
            variant="contained"
            startIcon={<DoneAllIcon />}
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
              background: unreadCount > 0 ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' : undefined,
              boxShadow: unreadCount > 0 ? '0 3px 5px 2px rgba(33, 203, 243, .3)' : undefined,
            }}
          >
            Mark all read
          </Button>
        </Tooltip>
      </Box>

      {/* Filter Tabs */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          bgcolor: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={filter}
          onChange={(_, newValue) => setFilter(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              py: 2
            }
          }}
        >
          <Tab label={`All (${notifications.length})`} value="all" />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Unread
                {unreadCount > 0 && (
                  <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: '16px', minWidth: '16px' } }} />
                )}
              </Box>
            }
            value="unread"
          />
          <Tab label="Read" value="read" />
        </Tabs>
      </Paper>

      {/* Notifications List */}
      <Box sx={{ minHeight: 400 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress />
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height={300}
            textAlign="center"
            color="text.secondary"
          >
            <NotificationsIcon sx={{ fontSize: 60, mb: 2, opacity: 0.2 }} />
            <Typography variant="h6">No notifications found</Typography>
            <Typography variant="body2">You're all caught up!</Typography>
          </Box>
        ) : (
          <AnimatePresence mode='popLayout'>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  variants={itemVariants}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Paper
                    elevation={0}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    sx={{
                      mb: 2,
                      p: 2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      borderRadius: 3,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: notification.isRead ? 'transparent' : alpha(theme.palette.primary.main, 0.2),
                      background: notification.isRead
                        ? alpha(theme.palette.background.paper, 0.4)
                        : alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                        borderColor: alpha(theme.palette.primary.main, 0.3)
                      },
                      '&::before': !notification.isRead ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        backgroundColor: theme.palette.primary.main,
                      } : {}
                    }}
                  >
                    {/* Icon Box */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(
                          notification.isRead ? theme.palette.action.disabled : theme.palette.primary.main,
                          notification.isRead ? 0.05 : 0.1
                        ),
                      }}
                    >
                      {getIcon(notification.type || 'default')}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography
                          variant="subtitle1"
                          fontWeight={notification.isRead ? 500 : 700}
                          color={notification.isRead ? 'text.secondary' : 'text.primary'}
                          sx={{ mb: 0.5, lineHeight: 1.2 }}
                        >
                          {notification.title}
                        </Typography>

                        {!notification.isRead && (
                          <CircleIcon sx={{ fontSize: 10, color: theme.palette.primary.main, ml: 1 }} />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
                        {notification.message}
                      </Typography>

                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </Typography>

                        {/* {notification.isRead && (
                             <IconButton 
                                size="small" 
                                onClick={(e) => deleteNotification(notification.id, e)}
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.error.main } }}
                             >
                                <DeleteIcon fontSize="small" />
                             </IconButton>
                        )} */}
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </Box>
    </Container>
  );
};

export default Notifications;
