import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  Skeleton,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  VerifiedUser,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  CloudUpload,
  Description,
  Image as ImageIcon,
  AccountBalance,
  Home,
  MonetizationOn,
  Photo,
  CreditCard,
  Close,
  Info,
} from '@mui/icons-material';

import { FileUpload } from '@/components/forms';
import { getKYCStatus, uploadKYCDocument } from '@/api/user.api';
import { KYCDocument, DocumentType } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

const KYCStatus: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kycData, setKycData] = useState<any>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);
  const [frontImageFiles, setFrontImageFiles] = useState<File[]>([]);
  const [backImageFiles, setBackImageFiles] = useState<File[]>([]);
  const [documentNumber, setDocumentNumber] = useState('');

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getKYCStatus();
      setKycData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load KYC status');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUploadDialog = (docType: DocumentType) => {
    setSelectedDocType(docType);
    setUploadDialogOpen(true);
    setFrontImageFiles([]);
    setBackImageFiles([]);
    setDocumentNumber('');
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setSelectedDocType(null);
    setFrontImageFiles([]);
    setBackImageFiles([]);
    setDocumentNumber('');
  };

  const handleUploadDocument = async () => {
    if (!selectedDocType || frontImageFiles.length === 0) {
      return;
    }

    try {
      setUploading(true);
      await uploadKYCDocument(selectedDocType, {
        frontImage: frontImageFiles[0],
        backImage: backImageFiles.length > 0 ? backImageFiles[0] : undefined,
        documentNumber: documentNumber || undefined,
      });

      // Refresh KYC status
      await fetchKYCStatus();
      handleCloseUploadDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle color="success" />;
      case 'PENDING':
        return <HourglassEmpty color="warning" />;
      case 'REJECTED':
        return <Cancel color="error" />;
      default:
        return <CloudUpload color="action" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDocumentIcon = (docType: DocumentType) => {
    switch (docType) {
      case 'PAN_CARD':
        return <CreditCard />;
      case 'AADHAAR_CARD':
        return <Photo />;
      case 'BANK_PROOF':
        return <AccountBalance />;
      case 'ADDRESS_PROOF':
        return <Home />;
      case 'INCOME_PROOF':
        return <MonetizationOn />;
      case 'SELFIE_WITH_PAN':
        return <ImageIcon />;
      default:
        return <Description />;
    }
  };

  const getDocumentName = (docType: DocumentType) => {
    return docType.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  const getKYCLevelProgress = () => {
    const levels = ['NOT_UPLOADED', 'BASIC', 'FULL', 'PREMIUM'];
    const currentIndex = levels.indexOf(kycData?.kycLevel || 'NOT_UPLOADED');
    return ((currentIndex + 1) / levels.length) * 100;
  };

  const getInvestmentLimitForLevel = (level: string) => {
    const limits: { [key: string]: number } = {
      NOT_UPLOADED: 0,
      BASIC: 50000,
      FULL: 500000,
      PREMIUM: 10000000,
    };
    return limits[level] || 0;
  };

  if (loading) {
    return (
      <Box>
        <Box>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
          <Grid container spacing={3}>
            {[1, 2].map((i) => (
              <Grid item xs={12} md={6} key={i}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      
    );
  }

  if (error && !kycData) {
    return (
      <Box>
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      
    );
  }

  if (!kycData) {
    return null;
  }

  const { kycStatus, kycLevel, documents, investmentLimit } = kycData;
  const verifiedDocs = documents.filter((d: KYCDocument) => d.status === 'VERIFIED').length;
  const totalDocs = documents.length;

  return (
      <Box>
      <Box>
        {/* Overall KYC Status Card */}
        <Paper
          sx={{
            p: 4,
            mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VerifiedUser sx={{ fontSize: 48, mr: 2 }} />
                <Box>
                  <Typography variant="overline" sx={{ opacity: 0.9 }}>
                    KYC Status
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {kycLevel.charAt(0) + kycLevel.slice(1).toLowerCase()}
                  </Typography>
                </Box>
              </Box>


              <Box
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">KYC Completion</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {verifiedDocs}/{totalDocs} Documents Verified
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(verifiedDocs / totalDocs) * 100}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white',
                      borderRadius: 5,
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Level: ${kycLevel}`}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={`Investment Limit: ${formatCurrency(investmentLimit || 0)}`}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <VerifiedUser sx={{ fontSize: 64 }} />
              </Box>
              {kycLevel !== 'PREMIUM' && (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => navigate('/kyc/upload')}
                  startIcon={<CloudUpload />}
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                >
                  Complete Full KYC
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Info Alert */}
        {kycLevel !== 'PREMIUM' && (
          <Alert severity="info" sx={{ mb: 3 }} icon={<Info />}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Increase your KYC level to unlock higher investment limits
            </Typography>
            <Typography variant="caption">
              Complete all document verifications to reach Premium level and invest up to{' '}
              {formatCurrency(getInvestmentLimitForLevel('PREMIUM'))}
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* KYC Levels */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  KYC Levels
                </Typography>
                <List>
                  <ListItem
                    sx={{
                      bgcolor: kycLevel === 'BASIC' ? 'primary.lighter' : 'transparent',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemIcon>
                      {kycLevel === 'BASIC' ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Description color="action" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary="Basic KYC"
                      secondary={`Limit: ${formatCurrency(getInvestmentLimitForLevel('BASIC'))}`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    />
                  </ListItem>

                  <ListItem
                    sx={{
                      bgcolor: kycLevel === 'FULL' ? 'primary.lighter' : 'transparent',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemIcon>
                      {kycLevel === 'FULL' ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Description color="action" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary="Full KYC"
                      secondary={`Limit: ${formatCurrency(getInvestmentLimitForLevel('FULL'))}`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    />
                  </ListItem>

                  <ListItem
                    sx={{
                      bgcolor: kycLevel === 'PREMIUM' ? 'primary.lighter' : 'transparent',
                      borderRadius: 1,
                    }}
                  >
                    <ListItemIcon>
                      {kycLevel === 'PREMIUM' ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Description color="action" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary="Premium KYC"
                      secondary={`Limit: ${formatCurrency(getInvestmentLimitForLevel('PREMIUM'))}`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Documents Table */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Document Verification Status
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Document Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Upload Date</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documents.map((doc: KYCDocument) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getDocumentIcon(doc.documentType)}
                              <Typography variant="body2" sx={{ ml: 1.5, fontWeight: 600 }}>
                                {getDocumentName(doc.documentType)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(doc.status)}
                              label={doc.status.replace('_', ' ')}
                              color={getStatusColor(doc.status) as any}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {doc.uploadedDate ? formatDate(doc.uploadedDate) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {doc.status === 'NOT_UPLOADED' || doc.status === 'REJECTED' ? (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleOpenUploadDialog(doc.documentType)}
                                startIcon={<CloudUpload />}
                              >
                                Upload
                              </Button>
                            ) : doc.status === 'PENDING' ? (
                              <Chip label="Pending Review" size="small" color="warning" />
                            ) : (
                              <Chip
                                icon={<CheckCircle />}
                                label="Verified"
                                size="small"
                                color="success"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Upload Guidelines */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Upload Guidelines
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <ImageIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Clear Images
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Upload clear, high-quality images
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Description sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Valid Documents
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ensure documents are valid and not expired
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <CheckCircle sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Correct Details
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Match details with your profile
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <MonetizationOn sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        File Size
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Max 5MB per file, JPG/PNG/PDF
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Upload {selectedDocType ? getDocumentName(selectedDocType) : 'Document'}
              </Typography>
              <IconButton onClick={handleCloseUploadDialog} disabled={uploading}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {/* Document Number Field (for certain document types) */}
            {selectedDocType && ['PAN_CARD', 'AADHAAR_CARD'].includes(selectedDocType) && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Document Number
                </Typography>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder={`Enter ${getDocumentName(selectedDocType)} Number`}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </Box>
            )}

            {/* Front Image Upload */}
            <Box sx={{ mb: 3 }}>
              <FileUpload
                label="Front Image"
                helperText="Upload clear front image of the document"
                onFilesChange={setFrontImageFiles}
                maxFiles={1}
                multiple={false}
                acceptedFileTypes={{
                  'image/*': ['.png', '.jpg', '.jpeg'],
                  'application/pdf': ['.pdf'],
                }}
                maxSize={5242880}
              />
            </Box>

            {/* Back Image Upload (for certain document types) */}
            {selectedDocType && ['AADHAAR_CARD', 'PAN_CARD'].includes(selectedDocType) && (
              <Box sx={{ mb: 3 }}>
                <FileUpload
                  label="Back Image (Optional)"
                  helperText="Upload back side of the document if applicable"
                  onFilesChange={setBackImageFiles}
                  maxFiles={1}
                  multiple={false}
                  acceptedFileTypes={{
                    'image/*': ['.png', '.jpg', '.jpeg'],
                    'application/pdf': ['.pdf'],
                  }}
                  maxSize={5242880}
                />
              </Box>
            )}

            {/* Upload Guidelines */}
            <Alert severity="info" icon={<Info />}>
              <Typography variant="body2">
                <strong>Important:</strong> Ensure all information is clearly visible and matches your
                profile details. Documents will be verified within 24-48 hours.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUploadDialog} disabled={uploading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUploadDocument}
              disabled={uploading || frontImageFiles.length === 0}
              startIcon={uploading ? <HourglassEmpty /> : <CloudUpload />}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    
  );
};

export default KYCStatus;
