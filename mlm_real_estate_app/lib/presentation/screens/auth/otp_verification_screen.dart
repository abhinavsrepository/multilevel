import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import '../../../data/providers/auth_provider.dart';
import '../../../core/constants/color_constants.dart';
import 'login_screen.dart';

/// OTP verification screen for email/mobile verification
///
/// This screen:
/// - Displays PIN code input (6 digits)
/// - Shows resend OTP button with countdown timer
/// - Verify button with loading state
/// - Auto-submits on OTP completion
/// - Handles verification errors
/// - Navigates to login screen on success
class OtpVerificationScreen extends StatefulWidget {
  const OtpVerificationScreen({
    required this.emailOrMobile, super.key,
    this.isRegistration = false,
  });

  static const String routeName = '/otp-verification';

  final String emailOrMobile;
  final bool isRegistration;

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final _otpController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  bool _isLoading = false;
  bool _canResend = false;
  int _resendTimer = 60;
  Timer? _timer;
  String _currentOtp = '';

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  @override
  void dispose() {
    _otpController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  /// Start countdown timer for resend OTP
  void _startResendTimer() {
    setState(() {
      _canResend = false;
      _resendTimer = 60;
    });

    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendTimer > 0) {
        setState(() {
          _resendTimer--;
        });
      } else {
        setState(() {
          _canResend = true;
        });
        timer.cancel();
      }
    });
  }

  /// Handle OTP verification
  Future<void> _handleVerifyOtp() async {
    if (_currentOtp.length != 6) {
      _showSnackBar('Please enter complete OTP', isError: true);
      return;
    }

    // Dismiss keyboard
    FocusScope.of(context).unfocus();

    setState(() {
      _isLoading = true;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    final success = await authProvider.verifyOtp(
      widget.emailOrMobile,
      _currentOtp,
    );

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    if (success) {
      _showSnackBar('Verification successful!', isError: false);

      // Navigate to login screen
      await Future.delayed(const Duration(milliseconds: 500));

      if (!mounted) return;

      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (context) => const LoginScreen(),
        ),
        (route) => false,
      );
    } else {
      _showSnackBar(
        authProvider.errorMessage ?? 'Invalid OTP. Please try again.',
        isError: true,
      );

      // Clear OTP on error
      _otpController.clear();
      setState(() {
        _currentOtp = '';
      });
    }
  }

  /// Handle resend OTP
  Future<void> _handleResendOtp() async {
    if (!_canResend) return;

    setState(() {
      _isLoading = true;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    final success = await authProvider.resendOtp(widget.emailOrMobile);

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    if (success) {
      _showSnackBar('OTP sent successfully!', isError: false);
      _startResendTimer();
    } else {
      _showSnackBar(
        authProvider.errorMessage ?? 'Failed to resend OTP. Please try again.',
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
        title: const Text('OTP Verification'),
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
                  const SizedBox(height: 24),

                  // Header
                  _buildHeader(),

                  const SizedBox(height: 48),

                  // OTP input
                  _buildOtpInput(),

                  const SizedBox(height: 32),

                  // Resend OTP section
                  _buildResendSection(),

                  const SizedBox(height: 48),

                  // Verify button
                  _buildVerifyButton(),

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
      children: [
        // Icon
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.email_outlined,
            size: 40,
            color: AppColors.primary,
          ),
        ),

        const SizedBox(height: 24),

        // Title
        Text(
          'Verify Your ${widget.isRegistration ? 'Account' : 'Identity'}',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
        ),

        const SizedBox(height: 16),

        // Description
        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
            children: [
              const TextSpan(
                text: 'We have sent a verification code to\n',
              ),
              TextSpan(
                text: widget.emailOrMobile,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// Build OTP input
  Widget _buildOtpInput() {
    return PinCodeTextField(
      appContext: context,
      length: 6,
      controller: _otpController,
      enabled: !_isLoading,
      obscureText: false,
      animationType: AnimationType.fade,
      keyboardType: TextInputType.number,
      autoFocus: true,
      enableActiveFill: true,
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      pinTheme: PinTheme(
        shape: PinCodeFieldShape.box,
        borderRadius: BorderRadius.circular(12),
        fieldHeight: 56,
        fieldWidth: 48,
        activeFillColor: AppColors.inputFill,
        inactiveFillColor: AppColors.inputFill,
        selectedFillColor: AppColors.inputFill,
        activeColor: AppColors.primary,
        inactiveColor: AppColors.border,
        selectedColor: AppColors.primary,
        errorBorderColor: AppColors.error,
      ),
      animationDuration: const Duration(milliseconds: 300),
      backgroundColor: Colors.transparent,
      textStyle: const TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
      ),
      onChanged: (value) {
        setState(() {
          _currentOtp = value;
        });
      },
      onCompleted: (value) {
        // Auto-submit on completion
        _handleVerifyOtp();
      },
      beforeTextPaste: (text) {
        // Allow only numbers
        return text != null && RegExp(r'^[0-9]+$').hasMatch(text);
      },
    );
  }

  /// Build resend section
  Widget _buildResendSection() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          "Didn't receive the code? ",
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.textSecondary,
              ),
        ),
        if (_canResend)
          TextButton(
            onPressed: _isLoading ? null : _handleResendOtp,
            child: const Text(
              'Resend',
              style: TextStyle(
                fontWeight: FontWeight.w600,
              ),
            ),
          )
        else
          Text(
            'Resend in ${_resendTimer}s',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
      ],
    );
  }

  /// Build verify button
  Widget _buildVerifyButton() {
    return SizedBox(
      height: 56,
      child: ElevatedButton(
        onPressed: _isLoading || _currentOtp.length != 6
            ? null
            : _handleVerifyOtp,
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
                'Verify OTP',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
      ),
    );
  }
}
