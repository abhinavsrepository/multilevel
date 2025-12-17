import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  useTheme,
  TextField,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { FileUpload } from '@/components/forms';
import { uploadKYCDocument } from '@/api/user.api';
import { DocumentType } from '@/types';
import DashboardLayout from '@/layouts/DashboardLayout';

const DocumentUpload: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panFrontFiles, setPanFrontFiles] = useState<File[]>([]);
  const [panBackFiles, setPanBackFiles] = useState<File[]>([]);
  const [aadhaarFrontFiles, setAadhaarFrontFiles] = useState<File[]>([]);
  const [aadhaarBackFiles, setAadhaarBackFiles] = useState<File[]>([]);
  const [addressProofFiles, setAddressProofFiles] = useState<File[]>([]);
  const [bankProofFiles, setBankProofFiles] = useState<File[]>([]);
  const [selfieFiles, setSelfieFiles] = useState<File[]>([]);

  const steps = [
    'PAN Card',
    'Aadhaar Card',
    'Address Proof',
    'Bank Proof',
    'Selfie with PAN',
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      setError(null);

      // Upload all documents
      const uploads = [];

      if (panFrontFiles.length > 0) {
        uploads.push(
          uploadKYCDocument('PAN_CARD', {
            documentNumber: panNumber,
            frontImage: panFrontFiles[0],
            backImage: panBackFiles.length > 0 ? panBackFiles[0] : undefined,
          })
        );
      }

      if (aadhaarFrontFiles.length > 0) {
        uploads.push(
          uploadKYCDocument('AADHAAR_CARD', {
            documentNumber: aadhaarNumber,
            frontImage: aadhaarFrontFiles[0],
            backImage: aadhaarBackFiles.length > 0 ? aadhaarBackFiles[0] : undefined,
          })
        );
      }

      if (addressProofFiles.length > 0) {
        uploads.push(
          uploadKYCDocument('ADDRESS_PROOF', {
            frontImage: addressProofFiles[0],
          })
        );
      }

      if (bankProofFiles.length > 0) {
        uploads.push(
          uploadKYCDocument('BANK_PROOF', {
            frontImage: bankProofFiles[0],
          })
        );
      }

      if (selfieFiles.length > 0) {
        uploads.push(
          uploadKYCDocument('SELFIE_WITH_PAN', {
            frontImage: selfieFiles[0],
          })
        );
      }

      await Promise.all(uploads);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Upload PAN Card
            </Typography>
            <TextField
              fullWidth
              label="PAN Number"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              sx={{ mb: 3 }}
            />
            <FileUpload
              label="PAN Card Front Image"
              helperText="Upload clear front image of your PAN card"
              onFilesChange={setPanFrontFiles}
              maxFiles={1}
              multiple={false}
              acceptedFileTypes={{
                'image/*': ['.png', '.jpg', '.jpeg'],
                'application/pdf': ['.pdf'],
              }}
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Upload Aadhaar Card
            </Typography>
            <TextField
              fullWidth
              label="Aadhaar Number"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value)}
              placeholder="1234 5678 9012"
              sx={{ mb: 3 }}
            />
            <Box sx={{ mb: 3 }}>
              <FileUpload
                label="Aadhaar Card Front Image"
                helperText="Upload front side of your Aadhaar card"
                onFilesChange={setAadhaarFrontFiles}
                maxFiles={1}
                multiple={false}
                acceptedFileTypes={{
                  'image/*': ['.png', '.jpg', '.jpeg'],
                  'application/pdf': ['.pdf'],
                }}
              />
            </Box>
            <FileUpload
              label="Aadhaar Card Back Image"
              helperText="Upload back side of your Aadhaar card"
              onFilesChange={setAadhaarBackFiles}
              maxFiles={1}
              multiple={false}
              acceptedFileTypes={{
                'image/*': ['.png', '.jpg', '.jpeg'],
                'application/pdf': ['.pdf'],
              }}
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Upload Address Proof
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Acceptable documents: Utility bill, Rent agreement, Passport, etc.
            </Alert>
            <FileUpload
              label="Address Proof Document"
              helperText="Upload clear image of your address proof"
              onFilesChange={setAddressProofFiles}
              maxFiles={1}
              multiple={false}
              acceptedFileTypes={{
                'image/*': ['.png', '.jpg', '.jpeg'],
                'application/pdf': ['.pdf'],
              }}
            />
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Upload Bank Proof
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Acceptable documents: Cancelled cheque, Bank statement, Passbook
            </Alert>
            <FileUpload
              label="Bank Proof Document"
              helperText="Upload your bank proof document"
              onFilesChange={setBankProofFiles}
              maxFiles={1}
              multiple={false}
              acceptedFileTypes={{
                'image/*': ['.png', '.jpg', '.jpeg'],
                'application/pdf': ['.pdf'],
              }}
            />
          </Box>
        );
      case 4:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Upload Selfie with PAN Card
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Take a clear selfie while holding your PAN card. Ensure your face and PAN card
              details are clearly visible.
            </Alert>
            <FileUpload
              label="Selfie with PAN"
              helperText="Upload selfie holding your PAN card"
              onFilesChange={setSelfieFiles}
              maxFiles={1}
              multiple={false}
              acceptedFileTypes={{
                'image/*': ['.png', '.jpg', '.jpeg'],
              }}
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  if (success) {
    return (
      <DashboardLayout title="Document Upload">
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Documents Uploaded Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your documents have been submitted for verification. We will notify you once the
              verification is complete.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/kyc')}
            >
              View KYC Status
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Document Upload">
      <Box>
        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Content */}
        <Card>
          <CardContent>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {getStepContent(activeStep)}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={uploading}
                  startIcon={<CloudUpload />}
                >
                  {uploading ? 'Uploading...' : 'Submit All Documents'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                >
                  Next
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Alert severity="info" icon={<Info />} sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Upload Guidelines:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>All documents must be clear and readable</li>
              <li>File size should not exceed 5MB</li>
              <li>Accepted formats: JPG, PNG, PDF</li>
              <li>Ensure all details match your profile information</li>
              <li>Documents will be verified within 24-48 hours</li>
            </ul>
          </Typography>
        </Alert>
      </Box>
    </DashboardLayout>
  );
};

export default DocumentUpload;
