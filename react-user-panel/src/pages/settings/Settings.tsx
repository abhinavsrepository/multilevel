import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  IconButton,
  Chip,
  Stack,
  Paper,
  Avatar,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  ListItemIcon,
  ListItemButton,
} from '@mui/material';
import {
  AccountCircle as ProfileIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as ThemeIcon,
  Language as LanguageIcon,
  Accessibility as AccessibilityIcon,
  Info as InfoIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Pin as PinIcon,
  Shield as ShieldIcon,
  Devices as DevicesIcon,
  History as HistoryIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  PhoneAndroid as PushIcon,
  ExpandMore as ExpandIcon,
  Brightness4 as DarkModeIcon,
  BrightnessHigh as LightModeIcon,
  Brightness6 as AutoModeIcon,
  AttachMoney as CurrencyIcon,
  TextFields as FontIcon,
  Contrast as ContrastIcon,
  Description as TermsIcon,
  PrivacyTip as PrivacyIcon,
  MoneyOff as RefundIcon,
  ContactSupport as ContactIcon,
  CheckCircle as VerifiedIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNotification } from '@/hooks/useNotification';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  getNotificationSettings,
  updateNotificationSettings,
  toggleEmailNotifications,
  toggleSMSNotifications,
  togglePushNotifications,
  updateNotificationPreference,
} from '@/api/notification.api';
import {
  getUserSettings,
  updateUserSettings,
  getActiveSessions,
  terminateSession,
  terminateAllOtherSessions,
  getLoginHistory,
  changeTransactionPIN,
} from '@/api/user.api';
import {
  changePassword,
  enableTwoFactor,
  disableTwoFactor,
  verifyTwoFactor,
} from '@/api/auth.api';
import { useAuthContext } from '@/context/AuthContext';
import { NotificationSettings, Session, LoginHistory } from '@/types';

/**
 * Settings Section Type
 */
type SettingsSection =
  | 'account'
  | 'security'
  | 'notifications'
  | 'app'
  | 'accessibility'
  | 'about';

/**
 * Theme Mode Type
 */
type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Settings Page Component
 *
 * Comprehensive settings page with multiple sections.
 */
const Settings: React.FC = () => {
  const { success, error } = useNotification();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  // State
  const [loading, setLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('INR');
  const [fontSize, setFontSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Dialog states
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showChangePINDialog, setShowChangePINDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [twoFASecret, setTwoFASecret] = useState('');

  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pinForm, setPinForm] = useState({
    oldPin: '',
    newPin: '',
    confirmPin: '',
  });
  const [twoFACode, setTwoFACode] = useState('');

  /**
   * Load settings on mount
   */
  useEffect(() => {
    loadNotificationSettings();
    loadActiveSessions();
    loadLoginHistory();
    loadUserSettings();
  }, []);

  /**
   * Load notification settings
   */
  const loadNotificationSettings = async () => {
    try {
      const response = await getNotificationSettings();
      if (response.success && response.data) {
        setNotificationSettings(response.data);
      }
    } catch (error) {
      console.error('Load notification settings error:', error);
    }
  };

  /**
   * Load active sessions
   */
  const loadActiveSessions = async () => {
    try {
      const response = await getActiveSessions();
      if (response.success && response.data) {
        setActiveSessions(response.data);
      }
    } catch (error) {
      console.error('Load active sessions error:', error);
    }
  };

  /**
   * Load login history
   */
  const loadLoginHistory = async () => {
    try {
      const response = await getLoginHistory({ page: 1, limit: 5 });
      if (response.success && response.data) {
        setLoginHistory(response.data.content || []);
      }
    } catch (error) {
      console.error('Load login history error:', error);
    }
  };

  /**
   * Load user settings
   */
  const loadUserSettings = async () => {
    try {
      const response = await getUserSettings();
      if (response.success && response.data) {
        setThemeMode(response.data.theme || 'system');
        setLanguage(response.data.language || 'en');
        setCurrency(response.data.currency || 'INR');
        setFontSize(response.data.fontSize || 'medium');
        setHighContrast(response.data.highContrast || false);
        setTwoFactorEnabled(response.data.twoFactorEnabled || false);
      }
    } catch (error) {
      console.error('Load user settings error:', error);
    }
  };

  /**
   * Handle notification toggle
   */
  const handleNotificationToggle = async (
    type: 'email' | 'sms' | 'push',
    enabled: boolean
  ) => {
    try {
      if (type === 'email') {
        await toggleEmailNotifications(enabled);
      } else if (type === 'sms') {
        await toggleSMSNotifications(enabled);
      } else if (type === 'push') {
        await togglePushNotifications(enabled);
      }

      setNotificationSettings((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          [`${type}Notifications`]: enabled,
        };
      });

      success(`${type.toUpperCase()} notifications ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      error(error.message || 'Failed to update notification settings');
    }
  };

  /**
   * Handle notification preference toggle
   */
  const handlePreferenceToggle = async (
    preference: keyof NotificationSettings['preferences'],
    enabled: boolean
  ) => {
    try {
      await updateNotificationPreference(preference, enabled);

      setNotificationSettings((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            [preference]: enabled,
          },
        };
      });

      success('Notification preference updated');
    } catch (error: any) {
      error(error.message || 'Failed to update preference');
    }
  };

  /**
   * Handle change password
   */
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      success('Password changed successfully');
      setShowChangePasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle change PIN
   */
  const handleChangePIN = async () => {
    if (pinForm.newPin !== pinForm.confirmPin) {
      error('PINs do not match');
      return;
    }

    try {
      setLoading(true);
      await changeTransactionPIN({
        oldPin: pinForm.oldPin,
        newPin: pinForm.newPin,
        confirmPin: pinForm.confirmPin,
      });

      success('PIN changed successfully');
      setShowChangePINDialog(false);
      setPinForm({ oldPin: '', newPin: '', confirmPin: '' });
    } catch (error: any) {
      error(error.message || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle enable 2FA
   */
  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      const response = await enableTwoFactor();
      if (response.success && response.data) {
        setQrCode(response.data.qrCode);
        setTwoFASecret(response.data.secret);
        setShow2FADialog(true);
      }
    } catch (error: any) {
      error(error.message || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle verify and activate 2FA
   */
  const handleVerify2FA = async () => {
    try {
      setLoading(true);
      await verifyTwoFactor(twoFACode);
      setTwoFactorEnabled(true);
      setShow2FADialog(false);
      setTwoFACode('');
      success('Two-factor authentication enabled successfully');
    } catch (error: any) {
      error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle disable 2FA
   */
  const handleDisable2FA = async () => {
    try {
      setLoading(true);
      await disableTwoFactor(passwordForm.currentPassword);
      setTwoFactorEnabled(false);
      success('Two-factor authentication disabled');
    } catch (error: any) {
      error(error.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle terminate session
   */
  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSession(sessionId);
      setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
      success('Session terminated');
    } catch (error: any) {
      error(error.message || 'Failed to terminate session');
    }
  };

  /**
   * Handle terminate all sessions
   */
  const handleTerminateAllSessions = async () => {
    try {
      await terminateAllOtherSessions();
      loadActiveSessions();
      success('All other sessions terminated');
    } catch (error: any) {
      error(error.message || 'Failed to terminate sessions');
    }
  };

  /**
   * Handle theme change
   */
  const handleThemeChange = async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      await updateUserSettings({ theme: mode });
      success('Theme updated');
    } catch (error: any) {
      error(error.message || 'Failed to update theme');
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Account Settings */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ProfileIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Account Settings
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EditIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Edit Profile"
                    secondary="Update your personal information"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/profile/edit')}
                    >
                      Edit
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <LockIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Change Password"
                    secondary="Update your login password"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowChangePasswordDialog(true)}
                    >
                      Change
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <PinIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Change Transaction PIN"
                    secondary="Update your transaction PIN"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowChangePINDialog(true)}
                    >
                      Change
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SecurityIcon color="error" />
                <Typography variant="h6" fontWeight={600}>
                  Security
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ShieldIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary={twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={twoFactorEnabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleEnable2FA();
                        } else {
                          handleDisable2FA();
                        }
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <DevicesIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Active Sessions (${activeSessions.length})`}
                    secondary="Manage your active sessions"
                  />
                  <ListItemSecondaryAction>
                    {activeSessions.length > 1 && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={handleTerminateAllSessions}
                      >
                        Logout All
                      </Button>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                {activeSessions.slice(0, 3).map((session) => (
                  <ListItem key={session.id} sx={{ pl: 8 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {session.device}
                          {session.current && (
                            <Chip label="Current" size="small" color="success" />
                          )}
                        </Box>
                      }
                      secondary={`${session.location} • ${formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}`}
                    />
                    {!session.current && (
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <HistoryIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Login History"
                    secondary="View recent login activity"
                  />
                </ListItem>
                {loginHistory.slice(0, 3).map((history, index) => (
                  <ListItem key={index} sx={{ pl: 8 }}>
                    <ListItemText
                      primary={history.device}
                      secondary={`${history.location} • ${new Date(history.loginTime).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <NotificationsIcon color="warning" />
                <Typography variant="h6" fontWeight={600}>
                  Notifications
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {notificationSettings && (
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive notifications via email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => handleNotificationToggle('email', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <SmsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="SMS Notifications"
                      secondary="Receive notifications via SMS"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onChange={(e) => handleNotificationToggle('sms', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <PushIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Push Notifications"
                      secondary="Receive push notifications"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => handleNotificationToggle('push', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={<Typography variant="subtitle2" fontWeight={600}>Notification Preferences</Typography>}
                    />
                  </ListItem>
                  {Object.entries(notificationSettings.preferences).map(([key, value]) => (
                    <ListItem key={key} sx={{ pl: 4 }}>
                      <ListItemText
                        primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={value}
                          onChange={(e) =>
                            handlePreferenceToggle(
                              key as keyof NotificationSettings['preferences'],
                              e.target.checked
                            )
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* App Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ThemeIcon color="info" />
                <Typography variant="h6" fontWeight={600}>
                  App Settings
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItem>
                  <ListItemText primary="Theme" secondary="Choose your preferred theme" />
                </ListItem>
                <ListItem sx={{ pl: 4 }}>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant={themeMode === 'light' ? 'contained' : 'outlined'}
                      startIcon={<LightModeIcon />}
                      onClick={() => handleThemeChange('light')}
                    >
                      Light
                    </Button>
                    <Button
                      variant={themeMode === 'dark' ? 'contained' : 'outlined'}
                      startIcon={<DarkModeIcon />}
                      onClick={() => handleThemeChange('dark')}
                    >
                      Dark
                    </Button>
                    <Button
                      variant={themeMode === 'system' ? 'contained' : 'outlined'}
                      startIcon={<AutoModeIcon />}
                      onClick={() => handleThemeChange('system')}
                    >
                      System
                    </Button>
                  </Stack>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <LanguageIcon />
                  </ListItemIcon>
                  <ListItemText primary="Language" />
                  <TextField
                    select
                    size="small"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="hi">Hindi</MenuItem>
                    <MenuItem value="mr">Marathi</MenuItem>
                  </TextField>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <CurrencyIcon />
                  </ListItemIcon>
                  <ListItemText primary="Currency" />
                  <TextField
                    select
                    size="small"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="INR">INR (₹)</MenuItem>
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                  </TextField>
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Accessibility Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccessibilityIcon color="success" />
                <Typography variant="h6" fontWeight={600}>
                  Accessibility
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <FontIcon />
                  </ListItemIcon>
                  <ListItemText primary="Font Size" />
                  <TextField
                    select
                    size="small"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </TextField>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <ContrastIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="High Contrast"
                    secondary="Increase contrast for better visibility"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={highContrast}
                      onChange={(e) => setHighContrast(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* About */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <InfoIcon color="action" />
                <Typography variant="h6" fontWeight={600}>
                  About
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItem>
                  <ListItemText
                    primary="App Version"
                    secondary="1.0.0"
                  />
                </ListItem>
                <Divider />
                <ListItemButton onClick={() => navigate('/terms')}>
                  <ListItemIcon>
                    <TermsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Terms of Service" />
                </ListItemButton>
                <Divider />
                <ListItemButton onClick={() => navigate('/privacy')}>
                  <ListItemIcon>
                    <PrivacyIcon />
                  </ListItemIcon>
                  <ListItemText primary="Privacy Policy" />
                </ListItemButton>
                <Divider />
                <ListItemButton onClick={() => navigate('/refund-policy')}>
                  <ListItemIcon>
                    <RefundIcon />
                  </ListItemIcon>
                  <ListItemText primary="Refund Policy" />
                </ListItemButton>
                <Divider />
                <ListItemButton onClick={() => navigate('/support')}>
                  <ListItemIcon>
                    <ContactIcon />
                  </ListItemIcon>
                  <ListItemText primary="Contact Support" />
                </ListItemButton>
              </List>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Logout */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'error.lighter', borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LogoutIcon color="error" />
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="error">
                      Logout
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sign out of your account
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={() => setShowLogoutDialog(true)}
                >
                  Logout
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={showChangePasswordDialog} onClose={() => setShowChangePasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowChangePasswordDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangePassword} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change PIN Dialog */}
      <Dialog open={showChangePINDialog} onClose={() => setShowChangePINDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Transaction PIN</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Current PIN"
              value={pinForm.oldPin}
              onChange={(e) => setPinForm({ ...pinForm, oldPin: e.target.value })}
              inputProps={{ maxLength: 6 }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="New PIN"
              value={pinForm.newPin}
              onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })}
              inputProps={{ maxLength: 6 }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New PIN"
              value={pinForm.confirmPin}
              onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value })}
              inputProps={{ maxLength: 6 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowChangePINDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangePIN} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Change PIN'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onClose={() => setShow2FADialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, textAlign: 'center' }}>
            <Typography variant="body2" paragraph>
              Scan this QR code with your authenticator app
            </Typography>
            {qrCode && (
              <Box sx={{ mb: 2 }}>
                <img src={qrCode} alt="2FA QR Code" style={{ maxWidth: '100%' }} />
              </Box>
            )}
            <Typography variant="caption" color="text.secondary" paragraph>
              Or enter this code manually: {twoFASecret}
            </Typography>
            <TextField
              fullWidth
              label="Verification Code"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value)}
              placeholder="Enter 6-digit code"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShow2FADialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleVerify2FA} disabled={loading || !twoFACode}>
            {loading ? <CircularProgress size={24} /> : 'Verify & Enable'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onClose={() => setShowLogoutDialog(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
