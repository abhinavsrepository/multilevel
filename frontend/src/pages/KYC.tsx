import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Paper,
  LinearProgress,
  Chip,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Warning,
  Error,
  Delete,
  Visibility,
  Description,
  CreditCard,
  AccountBalance,
  Home,
  Close,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useAppDispatch, useAppSelector } from '../store';

interface Document {
  id: string;
  type: 'PAN' | 'AADHAAR' | 'BANK_PROOF' | 'ADDRESS_PROOF';
  fileName: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  remarks?: string;
}

interface DocumentUploadCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  documentType: 'PAN' | 'AADHAAR' | 'BANK_PROOF' | 'ADDRESS_PROOF';
  document: Document | null;
  onUpload: (file: File, type: string) => void;
  onDelete: (documentId: string) => void;
  onPreview: (document: Document) => void;
  uploadProgress: number;
  isUploading: boolean;
}

const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  title,
  description,
  icon,
  documentType,
  document,
  onUpload,
  onDelete,
  onPreview,
  uploadProgress,
  isUploading,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0], documentType);
      }
    },
    [documentType, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: isUploading,
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle />;
      case 'PENDING':
        return <Warning />;
      case 'REJECTED':
        return <Error />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        borderLeft: 4,
        borderColor: document
          ? document.status === 'VERIFIED'
            ? 'success.main'
            : document.status === 'REJECTED'
            ? 'error.main'
            : 'warning.main'
          : 'grey.300',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                p: 1,
                borderRadius: 1,
                display: 'flex',
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </Box>
          {document && (
            <Chip
              icon={getStatusIcon(document.status)}
              label={document.status}
              color={getStatusColor(document.status) as any}
              size="small"
            />
          )}
        </Box>

        {document ? (
          <Box>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                bgcolor: 'grey.50',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Description color="primary" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight="600">
                    {document.fileName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(document.fileSize)} • Uploaded on{' '}
                    {new Date(document.uploadedAt).toLocaleDateString('en-IN')}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {document.remarks && (
              <Alert severity={document.status === 'REJECTED' ? 'error' : 'info'} sx={{ mb: 2 }}>
                <Typography variant="caption">
                  <strong>Admin Remarks:</strong> {document.remarks}
                </Typography>
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => onPreview(document)}
                fullWidth
              >
                Preview
              </Button>
              {document.status !== 'VERIFIED' && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => onDelete(document.id)}
                  fullWidth
                >
                  Delete
                </Button>
              )}
            </Box>
          </Box>
        ) : (
          <Box>
            {isUploading ? (
              <Box sx={{ py: 3 }}>
                <Typography variant="body2" align="center" gutterBottom>
                  Uploading...
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" align="center" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {uploadProgress}%
                </Typography>
              </Box>
            ) : (
              <Paper
                {...getRootProps()}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: 2,
                  borderStyle: 'dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  bgcolor: isDragActive ? 'primary.lighter' : 'grey.50',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.lighter',
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" gutterBottom>
                  {isDragActive ? 'Drop file here' : 'Drag & drop file here'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  or click to browse
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Max size: 5MB (PNG, JPG, PDF)
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const KYC: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [documents, setDocuments] = useState<Record<string, Document | null>>({
    PAN: null,
    AADHAAR: null,
    BANK_PROOF: null,
    ADDRESS_PROOF: null,
  });

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({
    PAN: 0,
    AADHAAR: 0,
    BANK_PROOF: 0,
    ADDRESS_PROOF: 0,
  });

  const [uploading, setUploading] = useState<Record<string, boolean>>({
    PAN: false,
    AADHAAR: false,
    BANK_PROOF: false,
    ADDRESS_PROOF: false,
  });

  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Handle file upload
  const handleUpload = async (file: File, type: string) => {
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should not exceed 5MB');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PNG, JPG, and PDF files are allowed');
      return;
    }

    // Set uploading state
    setUploading((prev) => ({ ...prev, [type]: true }));
    setUploadProgress((prev) => ({ ...prev, [type]: 0 }));

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev[type] + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
        }
        return { ...prev, [type]: Math.min(newProgress, 100) };
      });
    }, 200);

    // Simulate API call
    setTimeout(() => {
      const newDocument: Document = {
        id: `DOC_${Date.now()}`,
        type: type as any,
        fileName: file.name,
        fileSize: file.size,
        fileUrl: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        status: 'PENDING',
      };

      setDocuments((prev) => ({ ...prev, [type]: newDocument }));
      setUploading((prev) => ({ ...prev, [type]: false }));
      setUploadProgress((prev) => ({ ...prev, [type]: 0 }));
    }, 2000);
  };

  // Handle delete
  const handleDelete = (documentId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this document?');
    if (confirmDelete) {
      // Find and remove document
      const documentType = Object.keys(documents).find(
        (key) => documents[key]?.id === documentId
      );
      if (documentType) {
        setDocuments((prev) => ({ ...prev, [documentType]: null }));
      }
    }
  };

  // Handle preview
  const handlePreview = (document: Document) => {
    setPreviewDocument(document);
    setPreviewOpen(true);
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    const total = Object.keys(documents).length;
    const uploaded = Object.values(documents).filter((doc) => doc !== null).length;
    return Math.round((uploaded / total) * 100);
  };

  const completionPercentage = calculateCompletion();
  const kycStatus = user?.kycStatus || 'NOT_SUBMITTED';

  // Get overall KYC status
  const getOverallStatus = () => {
    if (kycStatus === 'APPROVED') {
      return { color: 'success', text: 'KYC Verified', icon: <CheckCircle /> };
    }
    if (kycStatus === 'REJECTED') {
      return { color: 'error', text: 'KYC Rejected', icon: <Error /> };
    }
    if (Object.values(documents).some((doc) => doc !== null)) {
      return { color: 'warning', text: 'Under Review', icon: <Warning /> };
    }
    return { color: 'default', text: 'Not Submitted', icon: <Warning /> };
  };

  const overallStatus = getOverallStatus();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        KYC Verification
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Complete your KYC verification by uploading the required documents
      </Typography>

      {/* Status Card */}
      <Card
        elevation={2}
        sx={{
          mb: 4,
          background: `linear-gradient(135deg, ${
            overallStatus.color === 'success'
              ? '#06d6a0'
              : overallStatus.color === 'error'
              ? '#ef476f'
              : overallStatus.color === 'warning'
              ? '#ffd166'
              : '#667eea'
          } 0%, ${
            overallStatus.color === 'success'
              ? '#118ab2'
              : overallStatus.color === 'error'
              ? '#d62828'
              : overallStatus.color === 'warning'
              ? '#f77f00'
              : '#764ba2'
          } 100%)`,
          color: 'white',
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    p: 2,
                    borderRadius: 2,
                    display: 'flex',
                  }}
                >
                  {overallStatus.icon}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {overallStatus.text}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {completionPercentage}% Documents Uploaded
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption">Completion Progress</Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {completionPercentage}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completionPercentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white',
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2" fontWeight="600" gutterBottom>
          Document Upload Guidelines:
        </Typography>
        <List dense>
          <ListItem sx={{ py: 0 }}>
            <ListItemText
              primary="• Upload clear, readable copies of your documents"
              primaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0 }}>
            <ListItemText
              primary="• Accepted formats: PNG, JPG, PDF (Max size: 5MB)"
              primaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0 }}>
            <ListItemText
              primary="• All four documents are required for verification"
              primaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0 }}>
            <ListItemText
              primary="• Verification typically takes 24-48 hours"
              primaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        </List>
      </Alert>

      {/* Document Upload Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DocumentUploadCard
            title="PAN Card"
            description="Upload your PAN card"
            icon={<CreditCard />}
            documentType="PAN"
            document={documents.PAN}
            onUpload={handleUpload}
            onDelete={handleDelete}
            onPreview={handlePreview}
            uploadProgress={uploadProgress.PAN}
            isUploading={uploading.PAN}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DocumentUploadCard
            title="Aadhaar Card"
            description="Upload your Aadhaar card"
            icon={<CreditCard />}
            documentType="AADHAAR"
            document={documents.AADHAAR}
            onUpload={handleUpload}
            onDelete={handleDelete}
            onPreview={handlePreview}
            uploadProgress={uploadProgress.AADHAAR}
            isUploading={uploading.AADHAAR}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DocumentUploadCard
            title="Bank Proof"
            description="Upload bank statement or passbook"
            icon={<AccountBalance />}
            documentType="BANK_PROOF"
            document={documents.BANK_PROOF}
            onUpload={handleUpload}
            onDelete={handleDelete}
            onPreview={handlePreview}
            uploadProgress={uploadProgress.BANK_PROOF}
            isUploading={uploading.BANK_PROOF}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DocumentUploadCard
            title="Address Proof"
            description="Upload electricity bill or rental agreement"
            icon={<Home />}
            documentType="ADDRESS_PROOF"
            document={documents.ADDRESS_PROOF}
            onUpload={handleUpload}
            onDelete={handleDelete}
            onPreview={handlePreview}
            uploadProgress={uploadProgress.ADDRESS_PROOF}
            isUploading={uploading.ADDRESS_PROOF}
          />
        </Grid>
      </Grid>

      {/* Submit Button */}
      {completionPercentage === 100 && kycStatus === 'NOT_SUBMITTED' && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="contained" size="large" sx={{ px: 6 }}>
            Submit for Verification
          </Button>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Document Preview</Typography>
            <IconButton onClick={() => setPreviewOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewDocument && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  File Name: {previewDocument.fileName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status:{' '}
                  <Chip
                    label={previewDocument.status}
                    size="small"
                    color={
                      previewDocument.status === 'VERIFIED'
                        ? 'success'
                        : previewDocument.status === 'REJECTED'
                        ? 'error'
                        : 'warning'
                    }
                  />
                </Typography>
              </Box>
              {previewDocument.fileName.endsWith('.pdf') ? (
                <Box
                  sx={{
                    width: '100%',
                    height: 500,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <iframe
                    src={previewDocument.fileUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    title="Document Preview"
                  />
                </Box>
              ) : (
                <Box
                  component="img"
                  src={previewDocument.fileUrl}
                  alt={previewDocument.fileName}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 500,
                    objectFit: 'contain',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default KYC;
