import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../data/providers/auth_provider.dart';
import '../../../core/services/secure_storage_service.dart';
import '../../../core/services/biometric_service.dart';
import '../../../core/constants/color_constants.dart';
import '../../../network/api_client.dart';
import '../dashboard/dashboard_screen.dart';
import 'register_screen.dart';
import 'forgot_password_screen.dart';

/// Login screen with email/mobile and password authentication
///
/// This screen:
/// - Accepts email or mobile number input
/// - Password field with visibility toggle
/// - Remember me functionality
/// - Login button with loading state
/// - Forgot password navigation
/// - Register navigation
/// - Biometric login option
/// - Form validation
/// - Error handling with snackbars
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  static const String routeName = '/login';

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _emailFocusNode = FocusNode();
  final _passwordFocusNode = FocusNode();

  bool _obscurePassword = true;
  bool _rememberMe = false;
  bool _isLoading = false;
  bool _biometricAvailable = false;

  @override
  void initState() {
    super.initState();
    _checkBiometricAvailability();
    _loadSavedCredentials();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _emailFocusNode.dispose();
    _passwordFocusNode.dispose();
    super.dispose();
  }

  /// Check if biometric authentication is available
  Future<void> _checkBiometricAvailability() async {
    final biometricService = BiometricService.instance;
    final isAvailable = await biometricService.isBiometricAvailable();
    final isEnabled =
        await SecureStorageService.instance.getBiometricEnabled();

    if (mounted) {
      setState(() {
        _biometricAvailable = isAvailable && isEnabled;
      });
    }
  }

  /// Load saved credentials if remember me was enabled
  Future<void> _loadSavedCredentials() async {
    final storage = SecureStorageService.instance;
    final email = await storage.getEmail();
    final password = await storage.getPassword();

    if (email != null && password != null) {
      setState(() {
        _emailController.text = email;
        _passwordController.text = password;
        _rememberMe = true;
      });
    }
  }

  /// Handle login
  Future<void> _handleLogin() async {
    // Dismiss keyboard
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    final success = await authProvider.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (!mounted) return;

    if (success) {
      // Save credentials if remember me is checked
      if (_rememberMe) {
        await SecureStorageService.instance.saveEmail(_emailController.text.trim());
        await SecureStorageService.instance.savePassword(_passwordController.text);
      } else {
        await SecureStorageService.instance.deleteCredentials();
      }

      if (!mounted) return;

      // Show success message
      _showSnackBar('Login successful!', isError: false);

      // Navigate to dashboard
      await Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => const DashboardScreen(),
        ),
      );
    } else {
      setState(() {
        _isLoading = false;
      });

      // Show error message
      _showSnackBar(
        authProvider.errorMessage ?? 'Login failed. Please try again.',
        isError: true,
      );
    }
  }

  /// Handle biometric login
  Future<void> _handleBiometricLogin() async {
    final biometricService = BiometricService.instance;

    try {
      final authenticated = await biometricService.authenticateQuick(
        reason: 'Authenticate to login to your account',
      );

      if (!authenticated) {
        _showSnackBar('Biometric authentication failed', isError: true);
        return;
      }

      // Get saved credentials
      final storage = SecureStorageService.instance;
      final email = await storage.getEmail();
      final password = await storage.getPassword();

      if (email == null || password == null) {
        _showSnackBar(
          'No saved credentials found. Please login with password first.',
          isError: true,
        );
        return;
      }

      setState(() {
        _isLoading = true;
      });

      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      final success = await authProvider.login(email, password);

      if (!mounted) return;

      if (success) {
        _showSnackBar('Login successful!', isError: false);

        await Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (context) => const DashboardScreen(),
          ),
        );
      } else {
        setState(() {
          _isLoading = false;
        });

        _showSnackBar(
          authProvider.errorMessage ?? 'Login failed. Please try again.',
          isError: true,
        );
      }
    } on PlatformException catch (e) {
      debugPrint('Biometric error: $e');
      _showSnackBar('Biometric authentication error', isError: true);
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

  /// Navigate to register screen
  void _navigateToRegister() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const RegisterScreen(),
      ),
    );
  }

  /// Navigate to forgot password screen
  void _navigateToForgotPassword() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const ForgotPasswordScreen(),
      ),
    );
  }

  /// Dev bypass login - directly navigate to dashboard without authentication
  /// Note: This saves a mock token for development purposes
  Future<void> _handleDevBypass() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Save mock authentication token for dev purposes
    await SecureStorageService.instance.saveSession(
      token: 'dev_mock_token_for_testing_only',
      refreshToken: 'dev_mock_refresh_token',
      userData: {
        'id': 'dev_user_123',
        'email': 'dev@test.com',
        'fullName': 'Dev User',
        'mobile': '1234567890',
      },
    );

    // Set the mock token in the API client
    final apiClient = ApiClient.instance;
    await apiClient.interceptor.setToken('dev_mock_token_for_testing_only');

    if (!mounted) return;

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (context) => const DashboardScreen(),
      ),
    );
  }

  /// Dev auto-fill login - fills in test credentials and logs in
  Future<void> _handleDevAutoLogin() async {
    setState(() {
      _emailController.text = 'user_lvl1_1764498371024@test.com';
      _passwordController.text = 'password123';
    });

    // Wait a bit for UI to update
    await Future.delayed(const Duration(milliseconds: 300));

    // Trigger login
    await _handleLogin();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
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
                  const SizedBox(height: 40),

                  // Logo and title
                  _buildHeader(),

                  const SizedBox(height: 48),

                  // Email/Mobile field
                  _buildEmailField(),

                  const SizedBox(height: 16),

                  // Password field
                  _buildPasswordField(),

                  const SizedBox(height: 12),

                  // Remember me and forgot password
                  _buildRememberMeAndForgotPassword(),

                  const SizedBox(height: 32),

                  // Login button
                  _buildLoginButton(),

                  const SizedBox(height: 16),

                  // Biometric login button
                  if (_biometricAvailable) _buildBiometricButton(),

                  const SizedBox(height: 24),

                  // Divider
                  _buildDivider(),

                  const SizedBox(height: 24),

                  // Register link
                  _buildRegisterLink(),

                  const SizedBox(height: 24),

                  // Dev bypass button (always visible in debug mode)
                  _buildDevBypassButton(),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Build header with logo and title
  Widget _buildHeader() {
    return Column(
      children: [
        // Logo
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Icon(
            Icons.home_work,
            size: 48,
            color: Colors.white,
          ),
        ),

        const SizedBox(height: 24),

        // Title
        Text(
          'Welcome Back',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
        ),

        const SizedBox(height: 8),

        // Subtitle
        Text(
          'Login to continue your journey',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.textSecondary,
              ),
        ),
      ],
    );
  }

  /// Build email/mobile input field
  Widget _buildEmailField() {
    return TextFormField(
      controller: _emailController,
      focusNode: _emailFocusNode,
      keyboardType: TextInputType.emailAddress,
      textInputAction: TextInputAction.next,
      enabled: !_isLoading,
      decoration: const InputDecoration(
        labelText: 'Email or Mobile',
        hintText: 'Enter your email or mobile number',
        prefixIcon: Icon(Icons.person_outline),
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) {
          return 'Please enter your email or mobile number';
        }
        return null;
      },
      onFieldSubmitted: (_) {
        _passwordFocusNode.requestFocus();
      },
    );
  }

  /// Build password input field
  Widget _buildPasswordField() {
    return TextFormField(
      controller: _passwordController,
      focusNode: _passwordFocusNode,
      obscureText: _obscurePassword,
      textInputAction: TextInputAction.done,
      enabled: !_isLoading,
      decoration: InputDecoration(
        labelText: 'Password',
        hintText: 'Enter your password',
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
          return 'Please enter your password';
        }
        if (value.length < 6) {
          return 'Password must be at least 6 characters';
        }
        return null;
      },
      onFieldSubmitted: (_) {
        _handleLogin();
      },
    );
  }

  /// Build remember me checkbox and forgot password link
  Widget _buildRememberMeAndForgotPassword() {
    return Row(
      children: [
        // Remember me checkbox
        Checkbox(
          value: _rememberMe,
          onChanged: _isLoading
              ? null
              : (value) {
                  setState(() {
                    _rememberMe = value ?? false;
                  });
                },
        ),
        GestureDetector(
          onTap: _isLoading
              ? null
              : () {
                  setState(() {
                    _rememberMe = !_rememberMe;
                  });
                },
          child: Text(
            'Remember me',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),

        const Spacer(),

        // Forgot password link
        TextButton(
          onPressed: _isLoading ? null : _navigateToForgotPassword,
          child: const Text('Forgot Password?'),
        ),
      ],
    );
  }

  /// Build login button
  Widget _buildLoginButton() {
    return SizedBox(
      height: 56,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _handleLogin,
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
                'Login',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
      ),
    );
  }

  /// Build biometric login button
  Widget _buildBiometricButton() {
    return OutlinedButton.icon(
      onPressed: _isLoading ? null : _handleBiometricLogin,
      icon: const Icon(Icons.fingerprint),
      label: const Text('Login with Biometric'),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 16),
      ),
    );
  }

  /// Build divider
  Widget _buildDivider() {
    return Row(
      children: [
        const Expanded(child: Divider()),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'OR',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
        const Expanded(child: Divider()),
      ],
    );
  }

  /// Build register link
  Widget _buildRegisterLink() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          "Don't have an account? ",
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        TextButton(
          onPressed: _isLoading ? null : _navigateToRegister,
          child: const Text(
            'Register',
            style: TextStyle(
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  /// Build dev bypass button (visible in debug mode only)
  Widget _buildDevBypassButton() {
    // Only show in debug mode
    bool isDebugMode = false;
    assert(() {
      isDebugMode = true;
      return true;
    }());

    if (!isDebugMode) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.orange.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.orange,
          width: 2,
        ),
      ),
      child: Column(
        children: [
          const Row(
            children: [
              Icon(
                Icons.developer_mode,
                color: Colors.orange,
              ),
              SizedBox(width: 8),
              Text(
                'Developer Mode',
                style: TextStyle(
                  color: Colors.orange,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: _isLoading ? null : _handleDevAutoLogin,
              icon: const Icon(Icons.login),
              label: const Text(
                'Dev Login (Level 1 User)',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: _handleDevBypass,
              icon: const Icon(Icons.skip_next),
              label: const Text(
                'Skip Login (No Auth)',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.deepOrange,
                foregroundColor: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Auto-fill test credentials or bypass authentication',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }
}
