import 'package:local_auth/local_auth.dart';
import 'package:local_auth_android/local_auth_android.dart';
import 'package:local_auth_darwin/local_auth_darwin.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// Biometric authentication service
/// Handles fingerprint, face recognition, and other biometric authentication
/// Implements singleton pattern for global access
class BiometricService {
  BiometricService._();
  static final BiometricService _instance = BiometricService._();
  static BiometricService get instance => _instance;

  final LocalAuthentication _localAuth = LocalAuthentication();

  bool _isInitialized = false;
  bool _isAvailable = false;
  List<BiometricType> _availableBiometrics = [];

  /// Check if service is initialized
  bool get isInitialized => _isInitialized;

  /// Check if biometric is available on device
  bool get isAvailable => _isAvailable;

  /// Get available biometric types
  List<BiometricType> get availableBiometrics => _availableBiometrics;

  /// Alias for isAvailable - checks if biometric is available
  Future<bool> isBiometricAvailable() async {
    if (!_isInitialized) {
      await initialize();
    }
    return _isAvailable;
  }

  /// Initialize biometric service
  Future<void> initialize() async {
    if (_isInitialized) {
      debugPrint('BiometricService already initialized');
      return;
    }

    try {
      // Check device support
      _isAvailable = await checkBiometricAvailability();

      // Get available biometrics
      if (_isAvailable) {
        _availableBiometrics = await getAvailableBiometrics();
      }

      _isInitialized = true;
      debugPrint('BiometricService initialized - Available: $_isAvailable');
      debugPrint('Available biometrics: $_availableBiometrics');
    } catch (e) {
      debugPrint('Error initializing BiometricService: $e');
      _isInitialized = true; // Initialize anyway to prevent repeated attempts
    }
  }

  /// Check if device supports biometric authentication
  Future<bool> checkBiometricAvailability() async {
    try {
      final isDeviceSupported = await _localAuth.isDeviceSupported();
      if (!isDeviceSupported) {
        debugPrint('Device does not support biometric authentication');
        return false;
      }

      final canCheckBiometrics = await _localAuth.canCheckBiometrics;
      debugPrint('Can check biometrics: $canCheckBiometrics');

      return canCheckBiometrics;
    } on PlatformException catch (e) {
      debugPrint('Platform exception checking biometric availability: ${e.message}');
      return false;
    } catch (e) {
      debugPrint('Error checking biometric availability: $e');
      return false;
    }
  }

  /// Check if biometrics are enrolled (user has set up biometrics)
  Future<bool> checkEnrolledBiometrics() async {
    try {
      if (!_isAvailable) {
        await initialize();
      }

      if (!_isAvailable) return false;

      final biometrics = await _localAuth.getAvailableBiometrics();
      final hasEnrolled = biometrics.isNotEmpty;

      debugPrint('Has enrolled biometrics: $hasEnrolled');
      return hasEnrolled;
    } on PlatformException catch (e) {
      debugPrint('Platform exception checking enrolled biometrics: ${e.message}');
      return false;
    } catch (e) {
      debugPrint('Error checking enrolled biometrics: $e');
      return false;
    }
  }

  /// Get list of available biometric types
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      final biometrics = await _localAuth.getAvailableBiometrics();
      debugPrint('Available biometric types: $biometrics');
      return biometrics;
    } on PlatformException catch (e) {
      debugPrint('Platform exception getting available biometrics: ${e.message}');
      return [];
    } catch (e) {
      debugPrint('Error getting available biometrics: $e');
      return [];
    }
  }

  /// Get human-readable biometric type name
  String getBiometricTypeName(BiometricType type) {
    switch (type) {
      case BiometricType.face:
        return 'Face Recognition';
      case BiometricType.fingerprint:
        return 'Fingerprint';
      case BiometricType.iris:
        return 'Iris Scan';
      case BiometricType.strong:
        return 'Strong Biometric';
      case BiometricType.weak:
        return 'Weak Biometric';
    }
  }

  /// Get list of available biometric names
  List<String> getAvailableBiometricNames() {
    return _availableBiometrics
        .map((type) => getBiometricTypeName(type))
        .toList();
  }

  /// Authenticate using biometrics
  Future<BiometricAuthResult> authenticate({
    String localizedReason = 'Please authenticate to continue',
    bool useErrorDialogs = true,
    bool stickyAuth = true,
    bool sensitiveTransaction = true,
    bool biometricOnly = false,
  }) async {
    try {
      // Check if initialized
      if (!_isInitialized) {
        await initialize();
      }

      // Check if biometric is available
      if (!_isAvailable) {
        return BiometricAuthResult(
          success: false,
          error: BiometricAuthError.notAvailable,
          message: 'Biometric authentication is not available on this device',
        );
      }

      // Check if biometrics are enrolled
      final hasEnrolled = await checkEnrolledBiometrics();
      if (!hasEnrolled) {
        return BiometricAuthResult(
          success: false,
          error: BiometricAuthError.notEnrolled,
          message: 'No biometrics enrolled. Please set up biometric authentication in device settings',
        );
      }

      // Platform-specific authentication options
      final authMessages = <AuthMessages>[
        const AndroidAuthMessages(
          signInTitle: 'Biometric Authentication',
          cancelButton: 'Cancel',
          biometricHint: '',
          biometricNotRecognized: 'Not recognized. Try again',
          biometricRequiredTitle: 'Biometric Required',
          biometricSuccess: 'Success',
          deviceCredentialsRequiredTitle: 'Device Credentials Required',
          deviceCredentialsSetupDescription: 'Please set up device credentials',
          goToSettingsButton: 'Go to Settings',
          goToSettingsDescription: 'Biometric authentication is not set up',
        ),
        const IOSAuthMessages(
          cancelButton: 'Cancel',
          goToSettingsButton: 'Go to Settings',
          goToSettingsDescription: 'Biometric authentication is not set up',
          lockOut: 'Biometric authentication is disabled. Please lock and unlock your device to enable it.',
        ),
      ];

      // Perform authentication
      final authenticated = await _localAuth.authenticate(
        localizedReason: localizedReason,
        authMessages: authMessages,
        options: AuthenticationOptions(
          useErrorDialogs: useErrorDialogs,
          stickyAuth: stickyAuth,
          sensitiveTransaction: sensitiveTransaction,
          biometricOnly: biometricOnly,
        ),
      );

      if (authenticated) {
        debugPrint('Biometric authentication successful');
        return BiometricAuthResult(
          success: true,
          error: null,
          message: 'Authentication successful',
        );
      } else {
        debugPrint('Biometric authentication failed');
        return BiometricAuthResult(
          success: false,
          error: BiometricAuthError.authenticationFailed,
          message: 'Authentication failed. Please try again',
        );
      }
    } on PlatformException catch (e) {
      debugPrint('Platform exception during authentication: ${e.code} - ${e.message}');

      // Handle specific error codes
      BiometricAuthError error;
      String message;

      switch (e.code) {
        case 'NotAvailable':
          error = BiometricAuthError.notAvailable;
          message = 'Biometric authentication is not available';
          break;
        case 'NotEnrolled':
          error = BiometricAuthError.notEnrolled;
          message = 'No biometrics enrolled';
          break;
        case 'LockedOut':
        case 'PermanentlyLockedOut':
          error = BiometricAuthError.lockedOut;
          message = 'Too many failed attempts. Biometric authentication is temporarily locked';
          break;
        case 'PasscodeNotSet':
          error = BiometricAuthError.passcodeNotSet;
          message = 'Device passcode is not set';
          break;
        case 'OtherOperatingSystem':
          error = BiometricAuthError.notSupported;
          message = 'Biometric authentication is not supported on this platform';
          break;
        default:
          error = BiometricAuthError.unknown;
          message = e.message ?? 'An unknown error occurred';
      }

      return BiometricAuthResult(
        success: false,
        error: error,
        message: message,
      );
    } catch (e) {
      debugPrint('Error during biometric authentication: $e');
      return BiometricAuthResult(
        success: false,
        error: BiometricAuthError.unknown,
        message: 'An unexpected error occurred: $e',
      );
    }
  }

  /// Quick authentication with default settings
  Future<bool> authenticateQuick({
    String reason = 'Please authenticate to continue',
  }) async {
    final result = await authenticate(
      localizedReason: reason,
      useErrorDialogs: true,
      stickyAuth: true,
    );

    return result.success;
  }

  /// Authenticate for sensitive operations (e.g., payments)
  Future<BiometricAuthResult> authenticateSensitive({
    String reason = 'Please authenticate to authorize this transaction',
  }) async {
    return await authenticate(
      localizedReason: reason,
      useErrorDialogs: true,
      stickyAuth: true,
      sensitiveTransaction: true,
      biometricOnly: true,
    );
  }

  /// Stop authentication (cancel ongoing authentication)
  Future<void> stopAuthentication() async {
    try {
      await _localAuth.stopAuthentication();
      debugPrint('Biometric authentication stopped');
    } catch (e) {
      debugPrint('Error stopping authentication: $e');
    }
  }

  /// Check if specific biometric type is available
  bool isBiometricTypeAvailable(BiometricType type) {
    return _availableBiometrics.contains(type);
  }

  /// Check if fingerprint is available
  bool get isFingerprintAvailable =>
      isBiometricTypeAvailable(BiometricType.fingerprint);

  /// Check if face recognition is available
  bool get isFaceRecognitionAvailable =>
      isBiometricTypeAvailable(BiometricType.face);

  /// Get primary biometric type
  BiometricType? get primaryBiometricType {
    if (_availableBiometrics.isEmpty) return null;

    // Prefer face recognition, then fingerprint
    if (_availableBiometrics.contains(BiometricType.face)) {
      return BiometricType.face;
    } else if (_availableBiometrics.contains(BiometricType.fingerprint)) {
      return BiometricType.fingerprint;
    }

    return _availableBiometrics.first;
  }

  /// Get user-friendly biometric authentication method name
  String getBiometricAuthMethodName() {
    final primary = primaryBiometricType;
    if (primary == null) return 'Biometric';

    switch (primary) {
      case BiometricType.face:
        return 'Face ID';
      case BiometricType.fingerprint:
        return 'Fingerprint';
      case BiometricType.iris:
        return 'Iris Scan';
      default:
        return 'Biometric';
    }
  }

  /// Dispose and cleanup
  void dispose() {
    _isInitialized = false;
    _isAvailable = false;
    _availableBiometrics.clear();
  }
}

/// Biometric authentication result
class BiometricAuthResult {
  final bool success;
  final BiometricAuthError? error;
  final String message;

  BiometricAuthResult({
    required this.success,
    required this.error,
    required this.message,
  });

  @override
  String toString() {
    return 'BiometricAuthResult(success: $success, error: $error, message: $message)';
  }
}

/// Biometric authentication errors
enum BiometricAuthError {
  notAvailable,
  notEnrolled,
  notSupported,
  lockedOut,
  passcodeNotSet,
  authenticationFailed,
  unknown,
}
