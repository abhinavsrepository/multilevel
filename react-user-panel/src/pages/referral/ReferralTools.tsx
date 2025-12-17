import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  useTheme,
  Skeleton,
  Alert,
  InputAdornment,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  ContentCopy,
  Share,
  QrCode2,
  WhatsApp,
  Facebook,
  Twitter,
  Telegram,
  Email,
  Link as LinkIcon,
  Download,
  People,
  CheckCircle,
  TrendingUp,
  Visibility,
  Assessment,
  Instagram,
  LinkedIn,
} from '@mui/icons-material';

import DashboardLayout from '../../layouts/DashboardLayout';

import { getReferralLink } from '@/api/user.api';
import { getDirectReferrals } from '@/api/team.api';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';
import ReferralRegistrationForm from '../../components/referral/ReferralRegistrationForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ReferralTools: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralData, setReferralData] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [linkResponse, referralsResponse] = await Promise.all([
        getReferralLink(),
        getDirectReferrals({ page: 0, size: 10 }),
      ]);

      setReferralData({
        referralCode: linkResponse?.data?.referralCode || '',
        referralLink: linkResponse?.data?.referralLink || '',
        // Mock stats - replace with actual API
        stats: {
          totalReferrals: referralsResponse?.data?.totalElements || 0,
          thisMonth: 5,
          activeReferrals: referralsResponse?.data?.content?.filter((r: any) => r.isActive).length || 0,
          totalEarnings: 25000,
          linkClicks: 156,
          conversionRate: 12.5,
        },
      });

      setReferrals(referralsResponse?.data?.content || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCopyLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform: string) => {
    if (!referralData) return;

    const message = `Join me on this amazing MLM Real Estate platform! Use my referral code: ${referralData.referralCode}`;
    const url = referralData.referralLink;

    const shareUrls: { [key: string]: string } = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent('Join MLM Real Estate')}&body=${encodeURIComponent(message + ' ' + url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
  };

  const handleDownloadQR = () => {
    // Implement QR code download logic
    console.log('Downloading QR code');
  };

  // Pre-composed messages
  const messageTemplates = [
    {
      id: 1,
      title: 'Standard Invitation',
      message: `Hi! 👋\n\nI wanted to share an exciting opportunity with you. I've been using this amazing MLM Real Estate platform and thought you might be interested!\n\nJoin using my referral code: {CODE}\n\nLink: {LINK}\n\nLet me know if you have any questions!`,
    },
    {
      id: 2,
      title: 'Investment Opportunity',
      message: `Hey there! 💰\n\nLooking for smart real estate investment opportunities? Check out this platform I'm using!\n\nWith my referral code {CODE}, you can get started right away.\n\nClick here: {LINK}\n\nHappy to help you get started!`,
    },
    {
      id: 3,
      title: 'Team Building',
      message: `Hello! 🚀\n\nWant to build passive income through real estate? Join my team on this MLM platform!\n\nUse code: {CODE}\nJoin here: {LINK}\n\nLet's grow together!`,
    },
  ];

  const getCopyMessageWithData = (template: string) => {
    return template
      .replace('{CODE}', referralData?.referralCode || '')
      .replace('{LINK}', referralData?.referralLink || '');
  };

  if (loading) {
    return (
      <DashboardLayout title="Referral Tools">
        <Box>
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 3 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} md={6} lg={3} key={i}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Referral Tools">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </DashboardLayout>
    );
  }

  if (!referralData) {
    return null;
  }

  const { stats } = referralData;

  return (
    <DashboardLayout title="Referral Tools">
      <Box>
        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.totalReferrals}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total Referrals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ fontSize: 28, color: 'success.main', mr: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.thisMonth}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  This Month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ fontSize: 28, color: 'info.main', mr: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.activeReferrals}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Visibility sx={{ fontSize: 28, color: 'warning.main', mr: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.linkClicks}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Link Clicks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Assessment sx={{ fontSize: 28, color: 'secondary.main', mr: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.conversionRate}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Conversion
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatCurrency(stats.totalEarnings)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total Earnings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label="Overview" />
              <Tab label="Share" />
              <Tab label="Link" />
              <Tab label="QR Code" />
              <Tab label="Direct Registration" />
              <Tab label="My Referrals" />
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Referral Code Card */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Your Referral Code
                    </Typography>
                    <Box
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: 4 }}>
                        {referralData.referralCode}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleCopyCode}
                      startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                      sx={{
                        bgcolor: 'white',
                        color: theme.palette.primary.main,
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                    >
                      {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* QR Code Card */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Your QR Code
                    </Typography>
                    <Box
                      sx={{
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        p: 3,
                        mb: 2,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 200,
                      }}
                    >
                      <QrCode2 sx={{ fontSize: 150, color: 'text.secondary' }} />
                    </Box>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleDownloadQR}
                      startIcon={<Download />}
                    >
                      Download QR Code
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Referral Link */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Your Referral Link
                    </Typography>
                    <TextField
                      fullWidth
                      value={referralData.referralLink}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title={copied ? 'Copied!' : 'Copy Link'}>
                              <IconButton onClick={handleCopyLink} edge="end">
                                {copied ? <CheckCircle color="success" /> : <ContentCopy />}
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleShare('whatsapp')}
                          startIcon={<WhatsApp />}
                          sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#1fa855' } }}
                        >
                          Share on WhatsApp
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => handleShare('email')}
                          startIcon={<Email />}
                        >
                          Share via Email
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Share Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {/* Message Templates */}
              <Grid item xs={12} md={8}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Pre-Composed Messages
                </Typography>
                <Grid container spacing={2}>
                  {messageTemplates.map((template) => (
                    <Grid item xs={12} key={template.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                            {template.title}
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={getCopyMessageWithData(template.message)}
                            InputProps={{ readOnly: true }}
                            sx={{ mb: 2 }}
                          />
                          <Button
                            variant="outlined"
                            onClick={() => {
                              navigator.clipboard.writeText(getCopyMessageWithData(template.message));
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                          >
                            {copied ? 'Copied!' : 'Copy Message'}
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Share Buttons */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Share On
                </Typography>
                <List>
                  <ListItem
                    button
                    onClick={() => handleShare('whatsapp')}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': { bgcolor: alpha('#25D366', 0.1) },
                    }}
                  >
                    <ListItemIcon>
                      <WhatsApp sx={{ color: '#25D366' }} />
                    </ListItemIcon>
                    <ListItemText primary="WhatsApp" />
                  </ListItem>

                  <ListItem
                    button
                    onClick={() => handleShare('facebook')}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': { bgcolor: alpha('#1877F2', 0.1) },
                    }}
                  >
                    <ListItemIcon>
                      <Facebook sx={{ color: '#1877F2' }} />
                    </ListItemIcon>
                    <ListItemText primary="Facebook" />
                  </ListItem>

                  <ListItem
                    button
                    onClick={() => handleShare('twitter')}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': { bgcolor: alpha('#1DA1F2', 0.1) },
                    }}
                  >
                    <ListItemIcon>
                      <Twitter sx={{ color: '#1DA1F2' }} />
                    </ListItemIcon>
                    <ListItemText primary="Twitter" />
                  </ListItem>

                  <ListItem
                    button
                    onClick={() => handleShare('telegram')}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': { bgcolor: alpha('#0088cc', 0.1) },
                    }}
                  >
                    <ListItemIcon>
                      <Telegram sx={{ color: '#0088cc' }} />
                    </ListItemIcon>
                    <ListItemText primary="Telegram" />
                  </ListItem>

                  <ListItem
                    button
                    onClick={() => handleShare('linkedin')}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': { bgcolor: alpha('#0A66C2', 0.1) },
                    }}
                  >
                    <ListItemIcon>
                      <LinkedIn sx={{ color: '#0A66C2' }} />
                    </ListItemIcon>
                    <ListItemText primary="LinkedIn" />
                  </ListItem>

                  <ListItem
                    button
                    onClick={() => handleShare('email')}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.1) },
                    }}
                  >
                    <ListItemIcon>
                      <Email color="action" />
                    </ListItemIcon>
                    <ListItemText primary="Email" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Link Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Your Referral Link
                    </Typography>
                    <TextField
                      fullWidth
                      value={referralData.referralLink}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleCopyLink} edge="end">
                              {copied ? <CheckCircle color="success" /> : <ContentCopy />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 3 }}
                    />

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                      Link Performance
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {stats.linkClicks}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total Clicks
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.lighter', borderRadius: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {stats.totalReferrals}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Conversions
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.lighter', borderRadius: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                            {stats.conversionRate}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Conversion Rate
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Tips to Increase Conversions
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Share on social media"
                          secondary="Reach a wider audience"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Personal message"
                          secondary="Add a personal touch"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Follow up"
                          secondary="Check in with prospects"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Share success stories"
                          secondary="Build trust and credibility"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* QR Code Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Your Referral QR Code
                    </Typography>
                    <Box
                      sx={{
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 300,
                      }}
                    >
                      <QrCode2 sx={{ fontSize: 250, color: 'text.secondary' }} />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleDownloadQR}
                        startIcon={<Download />}
                      >
                        Download QR Code
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Download Options
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Button variant="outlined" fullWidth>
                          PNG Format
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button variant="outlined" fullWidth>
                          SVG Format
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button variant="outlined" fullWidth>
                          PDF Format
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button variant="outlined" fullWidth>
                          High Quality
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      How to Use QR Code
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Typography sx={{ fontWeight: 700 }}>1.</Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary="Download the QR code"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Typography sx={{ fontWeight: 700 }}>2.</Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary="Print and display at events"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Typography sx={{ fontWeight: 700 }}>3.</Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary="Add to business cards"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Typography sx={{ fontWeight: 700 }}>4.</Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary="Share on social media posts"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Typography sx={{ fontWeight: 700 }}>5.</Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary="Include in email signatures"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Direct Registration Tab */}
          <TabPanel value={tabValue} index={4}>
            <ReferralRegistrationForm onSuccess={() => setTabValue(5)} />
          </TabPanel>

          {/* My Referrals Tab */}
          <TabPanel value={tabValue} index={5}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Join Date</TableCell>
                    <TableCell>Investment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Rank</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {referrals.length > 0 ? (
                    referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1.5, width: 40, height: 40 }}>
                              {referral.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {referral.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {referral.email || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {referral.userId || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {referral.joiningDate ? formatDate(referral.joiningDate) : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(referral.totalInvestment || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={referral.isActive ? 'Active' : 'Inactive'}
                            color={referral.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={referral.rank?.name || 'N/A'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box sx={{ py: 4 }}>
                          <People sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            No referrals yet. Start sharing your referral link!
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>
      </Box >
    </DashboardLayout >
  );
};

export default ReferralTools;
