import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../data/providers/auth_provider.dart';
import '../../../core/constants/color_constants.dart';
import 'otp_verification_screen.dart';

/// Registration screen for new user signup
///
/// This screen:
/// - Collects full name, email, mobile number
/// - Password and confirm password fields
/// - Sponsor ID field with validation
/// - Placement selection (left/right)
/// - Terms & conditions checkbox
/// - Register button with loading state
/// - Navigates to OTP screen on success
/// - Complete form validation
/// - Error handling with snackbars
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  static const String routeName = '/register';

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _mobileController = TextEditingController();
  final _sponsorIdController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  final _fullNameFocusNode = FocusNode();
  final _emailFocusNode = FocusNode();
  final _mobileFocusNode = FocusNode();
  final _sponsorIdFocusNode = FocusNode();
  final _passwordFocusNode = FocusNode();
  final _confirmPasswordFocusNode = FocusNode();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _acceptTerms = false;
  bool _isLoading = false;
  bool _isSponsorValidating = false;
  String? _sponsorName;
  String _placement = 'left';

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _mobileController.dispose();
    _sponsorIdController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();

    _fullNameFocusNode.dispose();
    _emailFocusNode.dispose();
    _mobileFocusNode.dispose();
    _sponsorIdFocusNode.dispose();
    _passwordFocusNode.dispose();
    _confirmPasswordFocusNode.dispose();
    super.dispose();
  }

  /// Validate sponsor ID
  Future<void> _validateSponsorId() async {
    final sponsorId = _sponsorIdController.text.trim();

    if (sponsorId.isEmpty) {
      setState(() {
        _sponsorName = null;
      });
      return;
    }

    setState(() {
      _isSponsorValidating = true;
      _sponsorName = null;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final sponsorData = await authProvider.validateSponsor(sponsorId);

    if (!mounted) return;

    setState(() {
      _isSponsorValidating = false;
      if (sponsorData != null) {
        _sponsorName = sponsorData['fullName'] ?? sponsorData['name'];
      }
    });
  }

  /// Handle registration
  Future<void> _handleRegister() async {
    // Dismiss keyboard
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!_acceptTerms) {
      _showSnackBar('Please accept terms and conditions', isError: true);
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Split full name into first and last name
    final fullName = _fullNameController.text.trim();
    final nameParts = fullName.split(' ');
    final firstName = nameParts.first;
    final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';

    // Generate username from email (part before @)
    final username = _emailController.text.trim().split('@').first;

    final registrationData = {
      'username': username,
      'firstName': firstName,
      'lastName': lastName,
      'email': _emailController.text.trim(),
      'phoneNumber': _mobileController.text.trim(),
      'password': _passwordController.text,
      'sponsorCode': _sponsorIdController.text.trim(),
      'placement': _placement,
    };

    final success = await authProvider.register(registrationData);

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    if (success) {
      _showSnackBar('Registration successful! Please verify OTP.', isError: false);

      // Navigate to OTP verification screen
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => OtpVerificationScreen(
            emailOrMobile: _emailController.text.trim(),
            isRegistration: true,
          ),
        ),
      );
    } else {
      _showSnackBar(
        authProvider.errorMessage ?? 'Registration failed. Please try again.',
        isError: true,
      );
    }
  }

  /// Show snackbar message
  void _showSnackBar(String message, {required bool isError}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? AppColors.error : AppColors.success,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Create Account'),
        elevation: 0,
      ),
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header
                  _buildHeader(),

                  const SizedBox(height: 32),

                  // Full name field
                  _buildFullNameField(),

                  const SizedBox(height: 16),

                  // Email field
                  _buildEmailField(),

                  const SizedBox(height: 16),

                  // Mobile field
                  _buildMobileField(),

                  const SizedBox(height: 16),

                  // Sponsor ID field
                  _buildSponsorIdField(),

                  const SizedBox(height: 16),

                  // Placement selection
                  _buildPlacementSelection(),

                  const SizedBox(height: 16),

                  // Password field
                  _buildPasswordField(),

                  const SizedBox(height: 16),

                  // Confirm password field
                  _buildConfirmPasswordField(),

                  const SizedBox(height: 16),

                  // Terms and conditions
                  _buildTermsCheckbox(),

                  const SizedBox(height: 32),

                  // Register button
                  _buildRegisterButton(),

                  const SizedBox(height: 24),

                  // Login link
                  _buildLoginLink(),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Build header
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Join Our Network',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
        ),
        const SizedBox(height: 8),
        Text(
          'Create an account to start investing and building your team',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.textSecondary,
              ),
        ),
      ],
    );
  }

  /// Build full name field
  Widget _buildFullNameField() {
    return TextFormField(
      controller: _fullNameController,
      focusNode: _fullNameFocusNode,
      keyboardType: TextInputType.name,
      textInputAction: TextInputAction.next,
      textCapitalization: TextCapitalization.words,
      enabled: !_isLoading,
      decoration: const InputDecoration(
        labelText: 'Full Name',
        hintText: 'Enter your full name',
        prefixIcon: Icon(Icons.person_outline),
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) {
          return 'Please enter your full name';
        }
        if (value.trim().length < 3) {
          return 'Name must be at least 3 characters';
        }
        return null;
      },
      onFieldSubmitted: (_) => _emailFocusNode.requestFocus(),
    );
  }

  /// Build email field
  Widget _buildEmailField() {
    return TextFormField(
      controller: _emailController,
      focusNode: _emailFocusNode,
      keyboardType: TextInputType.emailAddress,
      textInputAction: TextInputAction.next,
      enabled: !_isLoading,
      decoration: const InputDecoration(
        labelText: 'Email',
        hintText: 'Enter your email address',
        prefixIcon: Icon(Icons.email_outlined),
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) {
          return 'Please enter your email';
        }
        final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
        if (!emailRegex.hasMatch(value.trim())) {
          return 'Please enter a valid email';
        }
        return null;
      },
      onFieldSubmitted: (_) => _mobileFocusNode.requestFocus(),
    );
  }

  /// Build mobile field
  Widget _buildMobileField() {
    return TextFormField(
      controller: _mobileController,
      focusNode: _mobileFocusNode,
      keyboardType: TextInputType.phone,
      textInputAction: TextInputAction.next,
      enabled: !_isLoading,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
        LengthLimitingTextInputFormatter(10),
      ],
      decoration: const InputDecoration(
        labelText: 'Mobile Number',
        hintText: 'Enter your mobile number',
        prefixIcon: Icon(Icons.phone_outlined),
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) {
          return 'Please enter your mobile number';
        }
        if (value.trim().length != 10) {
          return 'Please enter a valid 10-digit mobile number';
        }
        return null;
      },
      onFieldSubmitted: (_) => _sponsorIdFocusNode.requestFocus(),
    );
  }

  /// Build sponsor ID field
  Widget _buildSponsorIdField() {
    return TextFormField(
      controller: _sponsorIdController,
      focusNode: _sponsorIdFocusNode,
      keyboardType: TextInputType.text,
      textInputAction: TextInputAction.next,
      enabled: !_isLoading,
      decoration: InputDecoration(
        labelText: 'Sponsor ID',
        hintText: 'Enter your sponsor ID',
        prefixIcon: const Icon(Icons.supervisor_account_outlined),
        suffixIcon: _isSponsorValidating
            ? const Padding(
                padding: EdgeInsets.all(12.0),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              )
            : _sponsorName != null
                ? const Icon(Icons.check_circle, color: AppColors.success)
                : null,
        helperText: _sponsorName != null ? 'Sponsor: $_sponsorName' : null,
        helperStyle: const TextStyle(color: AppColors.success),
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) {
          return 'Please enter sponsor ID';
        }
        if (_sponsorName == null && !_isSponsorValidating) {
          return 'Invalid sponsor ID';
        }
        return null;
      },
      onChanged: (value) {
        if (value.trim().length >= 3) {
          _validateSponsorId();
        } else {
          setState(() {
            _sponsorName = null;
          });
        }
      },
      onFieldSubmitted: (_) => _passwordFocusNode.requestFocus(),
    );
  }

  /// Build placement selection
  Widget _buildPlacementSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Placement Position',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w500,
              ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: RadioListTile<String>(
                title: const Text('Left'),
                value: 'left',
                groupValue: _placement,
                onChanged: _isLoading
                    ? null
                    : (value) {
                        setState(() {
                          _placement = value!;
                        });
                      },
                contentPadding: EdgeInsets.zero,
              ),
            ),
            Expanded(
              child: RadioListTile<String>(
                title: const Text('Right'),
                value: 'right',
                groupValue: _placement,
                onChanged: _isLoading
                    ? null
                    : (value) {
                        setState(() {
                          _placement = value!;
                        });
                      },
                contentPadding: EdgeInsets.zero,
              ),
            ),
          ],
        ),
      ],
    );
  }

  /// Build password field
  Widget _buildPasswordField() {
    return TextFormField(
      controller: _passwordController,
      focusNode: _passwordFocusNode,
      obscureText: _obscurePassword,
      textInputAction: TextInputAction.next,
      enabled: !_isLoading,
      decoration: InputDecoration(
        labelText: 'Password',
        hintText: 'Create a strong password',
        prefixIcon: const Icon(Icons.lock_outline),
        suffixIcon: IconButton(
          icon: Icon(
            _obscurePassword ? Icons.visibility_off : Icons.visibility,
          ),
          onPressed: () {
            setState(() {
              _obscurePassword = !_obscurePassword;
            });
          },
        ),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter a password';
        }
        if (value.length < 8) {
          return 'Password must be at least 8 characters';
        }
        if (!RegExp(r'[A-Z]').hasMatch(value)) {
          return 'Password must contain at least one uppercase letter';
        }
        if (!RegExp(r'[a-z]').hasMatch(value)) {
          return 'Password must contain at least one lowercase letter';
        }
        if (!RegExp(r'[0-9]').hasMatch(value)) {
          return 'Password must contain at least one number';
        }
        return null;
      },
      onFieldSubmitted: (_) => _confirmPasswordFocusNode.requestFocus(),
    );
  }

  /// Build confirm password field
  Widget _buildConfirmPasswordField() {
    return TextFormField(
      controller: _confirmPasswordController,
      focusNode: _confirmPasswordFocusNode,
      obscureText: _obscureConfirmPassword,
      textInputAction: TextInputAction.done,
      enabled: !_isLoading,
      decoration: InputDecoration(
        labelText: 'Confirm Password',
        hintText: 'Re-enter your password',
        prefixIcon: const Icon(Icons.lock_outline),
        suffixIcon: IconButton(
          icon: Icon(
            _obscureConfirmPassword ? Icons.visibility_off : Icons.visibility,
          ),
          onPressed: () {
            setState(() {
              _obscureConfirmPassword = !_obscureConfirmPassword;
            });
          },
        ),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please confirm your password';
        }
        if (value != _passwordController.text) {
          return 'Passwords do not match';
        }
        return null;
      },
      onFieldSubmitted: (_) => _handleRegister(),
    );
  }

  /// Build terms checkbox
  Widget _buildTermsCheckbox() {
    return Row(
      children: [
        Checkbox(
          value: _acceptTerms,
          onChanged: _isLoading
              ? null
              : (value) {
                  setState(() {
                    _acceptTerms = value ?? false;
                  });
                },
        ),
        Expanded(
          child: GestureDetector(
            onTap: _isLoading
                ? null
                : () {
                    setState(() {
                      _acceptTerms = !_acceptTerms;
                    });
                  },
            child: RichText(
              text: TextSpan(
                style: Theme.of(context).textTheme.bodyMedium,
                children: const [
                  TextSpan(text: 'I agree to the '),
                  TextSpan(
                    text: 'Terms & Conditions',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  TextSpan(text: ' and '),
                  TextSpan(
                    text: 'Privacy Policy',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  /// Build register button
  Widget _buildRegisterButton() {
    return SizedBox(
      height: 56,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _handleRegister,
        child: _isLoading
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : const Text(
                'Register',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
      ),
    );
  }

  /// Build login link
  Widget _buildLoginLink() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          'Already have an account? ',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        TextButton(
          onPressed: _isLoading
              ? null
              : () {
                  Navigator.of(context).pop();
                },
          child: const Text(
            'Login',
            style: TextStyle(
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
