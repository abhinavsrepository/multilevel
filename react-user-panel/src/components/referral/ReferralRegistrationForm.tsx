import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Radio,
    RadioGroup,
    Checkbox,
    Divider,
    Alert,
    CircularProgress,
    FormHelperText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Stack,
    Paper
} from '@mui/material';
import {
    CheckCircle
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getUserProfile } from '@/api/user.api';
import { useAuthContext } from '@/context/AuthContext';
import { register, validateSponsor } from '@/api/auth.api';

interface ReferralRegistrationFormProps {
    onSuccess?: () => void;
}

const ReferralRegistrationForm: React.FC<ReferralRegistrationFormProps> = ({ onSuccess }) => {
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [validatingSponsor, setValidatingSponsor] = useState(false);
    const [sponsorError, setSponsorError] = useState<string | null>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [registeredCredentials, setRegisteredCredentials] = useState<{ email: string, password: string } | null>(null);

    const [formData, setFormData] = useState({
        sponsorId: '',
        sponsorName: '',
        placement: 'LEFT', // Default placement
        firstName: '',
        lastName: '', // Assuming Name field splits into First/Last or handles full name
        dob: null as Date | null,
        mobile: '',
        email: '',
        fatherHusbandName: '',
        panNumber: '',
        state: '',
        address: '',
        proofType: '',
        proofNumber: '',
        pinCode: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    });

    useEffect(() => {
        if (user) {
            // Pre-fill sponsor details with logged-in user's information
            setFormData(prev => ({
                ...prev,
                sponsorId: user.referralCode,
                sponsorName: user.fullName
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date: Date | null) => {
        setFormData(prev => ({ ...prev, dob: date }));
    };

    const handleSponsorIdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const sponsorId = e.target.value.trim();
        setFormData(prev => ({ ...prev, sponsorId, sponsorName: '' }));
        setSponsorError(null);

        if (!sponsorId) {
            return;
        }

        // Validate sponsor after 500ms delay (debounce)
        setValidatingSponsor(true);
        setTimeout(async () => {
            try {
                const response = await validateSponsor(sponsorId);
                if (response.success && response.data?.isValid) {
                    setFormData(prev => ({
                        ...prev,
                        sponsorName: response.data.name || ''
                    }));
                    setSponsorError(null);
                } else {
                    setSponsorError('Invalid sponsor ID');
                    setFormData(prev => ({ ...prev, sponsorName: '' }));
                }
            } catch (err: any) {
                setSponsorError(err.response?.data?.message || 'Failed to validate sponsor');
                setFormData(prev => ({ ...prev, sponsorName: '' }));
            } finally {
                setValidatingSponsor(false);
            }
        }, 500);
    };

    const handleSelectChange = (e: any) => { // SelectChangeEvent is generic, using any for simplicity if types not handy
        const name = e.target.name as string;
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.firstName.trim()) {
            setError("First Name is required");
            return;
        }
        if (!formData.email.trim()) {
            setError("Email is required");
            return;
        }
        if (!formData.mobile.trim()) {
            setError("Mobile number is required");
            return;
        }
        if (!formData.password) {
            setError("Password is required");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!formData.sponsorId) {
            setError("Sponsor ID is required");
            return;
        }
        if (!formData.acceptTerms) {
            setError("You must accept the Terms & Conditions");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Call the actual registration API
            const registrationData = {
                fullName: formData.firstName + (formData.lastName ? ' ' + formData.lastName : ''),
                email: formData.email,
                mobile: formData.mobile,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                sponsorId: formData.sponsorId, // This will be mapped to sponsorCode in backend
                placement: formData.placement as 'LEFT' | 'RIGHT' | 'AUTO',
                termsAccepted: formData.acceptTerms,
                privacyAccepted: formData.acceptTerms
            };

            const response = await register(registrationData);

            if (response.success) {
                // Save credentials for dialog before resetting
                setRegisteredCredentials({
                    email: formData.email,
                    password: formData.password
                });

                setSuccess(response.message || "Member registered successfully!");
                setShowSuccessDialog(true);

                // Reset form except sponsor details
                setFormData(prev => ({
                    ...prev,
                    firstName: '',
                    lastName: '',
                    dob: null,
                    mobile: '',
                    email: '',
                    fatherHusbandName: '',
                    panNumber: '',
                    state: '',
                    address: '',
                    proofType: '',
                    proofNumber: '',
                    pinCode: '',
                    password: '',
                    confirmPassword: '',
                    acceptTerms: false
                }));
                if (onSuccess) onSuccess();
            } else {
                setError(response.message || "Registration failed");
            }

        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            {/* Sponsor Detail */}
            <Card sx={{ mb: 3, borderTop: '4px solid #9c27b0' }}> {/* Purple accent to match screenshot */}
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>Sponsor Detail</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Sponsor Id"
                                name="sponsorId"
                                value={formData.sponsorId}
                                required
                                onChange={handleSponsorIdChange}
                                variant="filled"
                                error={!!sponsorError}
                                helperText={sponsorError || "Enter sponsor's referral code or user ID"}
                                InputProps={{
                                    endAdornment: validatingSponsor ? <CircularProgress size={20} /> : null
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Sponsor Name"
                                name="sponsorName"
                                value={formData.sponsorName}
                                onChange={handleChange}
                                variant="filled"
                                InputProps={{ readOnly: true }}
                                helperText="Sponsor name will be fetched automatically"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl component="fieldset">
                                <Typography variant="body2" sx={{ mb: 1 }}>Join Leg</Typography>
                                <RadioGroup
                                    row
                                    name="placement"
                                    value={formData.placement}
                                    onChange={handleChange}
                                >
                                    <FormControlLabel value="LEFT" control={<Radio sx={{ color: 'white' }} />} label="Left" />
                                    <FormControlLabel value="RIGHT" control={<Radio sx={{ color: 'white' }} />} label="Right" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* User Profile */}
            <Card sx={{ mb: 3, borderTop: '4px solid #9c27b0' }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>User Profile</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="First Name" // Mapping Name to First Name
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Date of Birth"
                                    value={formData.dob}
                                    onChange={handleDateChange}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Mobile No"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Email Id"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Father/Husband Name"
                                name="fatherHusbandName"
                                value={formData.fatherHusbandName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="PAN Number"
                                name="panNumber"
                                value={formData.panNumber}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>City and State</InputLabel>
                                <Select
                                    label="City and State"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleSelectChange} // casting event
                                >
                                    <MenuItem value="">Select State...</MenuItem>
                                    <MenuItem value="Delhi">Delhi</MenuItem>
                                    <MenuItem value="Maharashtra">Maharashtra</MenuItem>
                                    {/* Add more states as needed */}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Address Proof</InputLabel>
                                <Select
                                    label="Address Proof"
                                    name="proofType"
                                    value={formData.proofType}
                                    onChange={handleSelectChange}
                                >
                                    <MenuItem value="">Select</MenuItem>
                                    <MenuItem value="Aadhar">Aadhar Card</MenuItem>
                                    <MenuItem value="DrivingLicense">Driving License</MenuItem>
                                    <MenuItem value="VoterID">Voter ID</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Address Proof No"
                                name="proofNumber"
                                value={formData.proofNumber}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Pin Code"
                                name="pinCode"
                                value={formData.pinCode}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.acceptTerms}
                                    onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                                    name="acceptTerms"
                                    color="primary"
                                />
                            }
                            label="I Accept Terms & Condition"
                        />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                bgcolor: '#4caf50', // Green button likely from theme or standard success
                                '&:hover': { bgcolor: '#388e3c' },
                                mt: 1,
                                px: 5
                            }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Submit'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Success Dialog */}
            <Dialog
                open={showSuccessDialog}
                onClose={() => setShowSuccessDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: 'center', bgcolor: 'success.main', color: 'white', py: 2 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                        <CheckCircle sx={{ fontSize: 48 }} />
                        <Typography variant="h6" component="span">Registration Successful!</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 3 }}>
                    <DialogContentText textAlign="center" paragraph>
                        The new member has been registered successfully.
                    </DialogContentText>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Please take a screenshot of these credentials. This is important for the new member to login.
                    </Alert>

                    {registeredCredentials && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                bgcolor: 'grey.100',
                                border: '1px dashed',
                                borderColor: 'grey.400',
                                borderRadius: 2,
                            }}
                        >
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Email Address
                                    </Typography>
                                    <Typography variant="h6" fontWeight={600} fontFamily="monospace">
                                        {registeredCredentials.email}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Password
                                    </Typography>
                                    <Typography variant="h6" fontWeight={600} fontFamily="monospace">
                                        {registeredCredentials.password}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
                    <Button
                        onClick={() => {
                            setShowSuccessDialog(false);
                            if (onSuccess) onSuccess();
                        }}
                        variant="contained"
                        size="large"
                        fullWidth
                    >
                        I have taken a screenshot, Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReferralRegistrationForm;
