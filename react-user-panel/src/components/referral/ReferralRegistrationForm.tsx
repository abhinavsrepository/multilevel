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
    FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getUserProfile } from '@/api/user.api';
import { useAuth } from '@/hooks/useAuth';
import { register } from '@/api/auth.api';

interface ReferralRegistrationFormProps {
    onSuccess?: () => void;
}

const ReferralRegistrationForm: React.FC<ReferralRegistrationFormProps> = ({ onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            // Handle different user object structures (Redux AuthUser vs StoredUser)
            const userName = (user as any).fullName || (user as any).name || '';
            const userReferralCode = (user as any).referralCode || (user as any).userId || '';

            setFormData(prev => ({
                ...prev,
                sponsorId: userReferralCode,
                sponsorName: userName
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
                setSuccess(response.message || "Member registered successfully!");
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
                                InputProps={{ readOnly: !!formData.sponsorId }}
                                onChange={handleChange}
                                variant="filled"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="sponsorName"
                                value={formData.sponsorName}
                                InputProps={{ readOnly: !!formData.sponsorName }}
                                onChange={handleChange}
                                variant="filled"
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
        </Box>
    );
};

export default ReferralRegistrationForm;
