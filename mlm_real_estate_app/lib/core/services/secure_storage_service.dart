import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/foundation.dart';
import 'dart:convert';

/// Secure storage service for sensitive data like tokens and credentials
/// Uses platform-specific secure storage (Keychain on iOS, KeyStore on Android)
/// Implements singleton pattern for global access
class SecureStorageService {
  SecureStorageService._();
  static final SecureStorageService _instance = SecureStorageService._();
  static SecureStorageService get instance => _instance;

  late final FlutterSecureStorage _storage;

  /// Initialize secure storage with platform-specific options
  void initialize() {
    const androidOptions = AndroidOptions(
      encryptedSharedPreferences: true,
      resetOnError: true,
    );

    const iosOptions = IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    );

    const linuxOptions = LinuxOptions();
    const webOptions = WebOptions();
    const macOsOptions = MacOsOptions();
    const windowsOptions = WindowsOptions();

    _storage = const FlutterSecureStorage(
      aOptions: androidOptions,
      iOptions: iosOptions,
      lOptions: linuxOptions,
      wOptions: windowsOptions,
      mOptions: macOsOptions,
      webOptions: webOptions,
    );

    debugPrint('SecureStorageService initialized');
  }

  // ==================== TOKEN MANAGEMENT ====================

  /// Save access token
  Future<void> saveToken(String token) async {
    try {
      await _storage.write(
        key: SecureStorageKeys.accessToken,
        value: token,
      );
    } catch (e) {
      debugPrint('Error saving token: $e');
      rethrow;
    }
  }

  /// Get access token
  Future<String?> getToken() async {
    try {
      return await _storage.read(key: SecureStorageKeys.accessToken);
    } catch (e) {
      debugPrint('Error getting token: $e');
      return null;
    }
  }

  /// Delete access token
  Future<void> deleteToken() async {
    try {
      await _storage.delete(key: SecureStorageKeys.accessToken);
    } catch (e) {
      debugPrint('Error deleting token: $e');
      rethrow;
    }
  }

  /// Check if token exists
  Future<bool> hasToken() async {
    try {
      final token = await getToken();
      return token != null && token.isNotEmpty;
    } catch (e) {
      debugPrint('Error checking token: $e');
      return false;
    }
  }

  // ==================== REFRESH TOKEN MANAGEMENT ====================

  /// Save refresh token
  Future<void> saveRefreshToken(String refreshToken) async {
    try {
      await _storage.write(
        key: SecureStorageKeys.refreshToken,
        value: refreshToken,
      );
    } catch (e) {
      debugPrint('Error saving refresh token: $e');
      rethrow;
    }
  }

  /// Get refresh token
  Future<String?> getRefreshToken() async {
    try {
      return await _storage.read(key: SecureStorageKeys.refreshToken);
    } catch (e) {
      debugPrint('Error getting refresh token: $e');
      return null;
    }
  }

  /// Delete refresh token
  Future<void> deleteRefreshToken() async {
    try {
      await _storage.delete(key: SecureStorageKeys.refreshToken);
    } catch (e) {
      debugPrint('Error deleting refresh token: $e');
      rethrow;
    }
  }

  /// Check if refresh token exists
  Future<bool> hasRefreshToken() async {
    try {
      final token = await getRefreshToken();
      return token != null && token.isNotEmpty;
    } catch (e) {
      debugPrint('Error checking refresh token: $e');
      return false;
    }
  }

  // ==================== USER DATA MANAGEMENT ====================

  /// Save user data as JSON
  Future<void> saveUserData(Map<String, dynamic> userData) async {
    try {
      final jsonString = jsonEncode(userData);
      await _storage.write(
        key: SecureStorageKeys.userData,
        value: jsonString,
      );
    } catch (e) {
      debugPrint('Error saving user data: $e');
      rethrow;
    }
  }

  /// Get user data
  Future<Map<String, dynamic>?> getUserData() async {
    try {
      final jsonString = await _storage.read(key: SecureStorageKeys.userData);
      if (jsonString == null) return null;
      return jsonDecode(jsonString) as Map<String, dynamic>;
    } catch (e) {
      debugPrint('Error getting user data: $e');
      return null;
    }
  }

  /// Delete user data
  Future<void> deleteUserData() async {
    try {
      await _storage.delete(key: SecureStorageKeys.userData);
    } catch (e) {
      debugPrint('Error deleting user data: $e');
      rethrow;
    }
  }

  // ==================== CREDENTIALS MANAGEMENT ====================

  /// Save user email
  Future<void> saveEmail(String email) async {
    try {
      await _storage.write(
        key: SecureStorageKeys.userEmail,
        value: email,
      );
    } catch (e) {
      debugPrint('Error saving email: $e');
      rethrow;
    }
  }

  /// Get user email
  Future<String?> getEmail() async {
    try {
      return await _storage.read(key: SecureStorageKeys.userEmail);
    } catch (e) {
      debugPrint('Error getting email: $e');
      return null;
    }
  }

  /// Save user password (for remember me functionality)
  Future<void> savePassword(String password) async {
    try {
      await _storage.write(
        key: SecureStorageKeys.userPassword,
        value: password,
      );
    } catch (e) {
      debugPrint('Error saving password: $e');
      rethrow;
    }
  }

  /// Get user password
  Future<String?> getPassword() async {
    try {
      return await _storage.read(key: SecureStorageKeys.userPassword);
    } catch (e) {
      debugPrint('Error getting password: $e');
      return null;
    }
  }

  /// Delete credentials
  Future<void> deleteCredentials() async {
    try {
      await Future.wait([
        _storage.delete(key: SecureStorageKeys.userEmail),
        _storage.delete(key: SecureStorageKeys.userPassword),
      ]);
    } catch (e) {
      debugPrint('Error deleting credentials: $e');
      rethrow;
    }
  }

  // ==================== BIOMETRIC PREFERENCES ====================

  /// Save biometric authentication preference
  Future<void> saveBiometricEnabled(bool enabled) async {
    try {
      await _storage.write(
        key: SecureStorageKeys.biometricEnabled,
        value: enabled.toString(),
      );
    } catch (e) {
      debugPrint('Error saving biometric preference: $e');
      rethrow;
    }
  }

  /// Get biometric authentication preference
  Future<bool> getBiometricEnabled() async {
    try {
      final value = await _storage.read(key: SecureStorageKeys.biometricEnabled);
      return value == 'true';
    } catch (e) {
      debugPrint('Error getting biometric preference: $e');
      return false;
    }
  }

  // ==================== FCM TOKEN MANAGEMENT ====================

  /// Save FCM token
  Future<void> saveFCMToken(String token) async {
    try {
      await _storage.write(
        key: SecureStorageKeys.fcmToken,
        value: token,
      );
    } catch (e) {
      debugPrint('Error saving FCM token: $e');
      rethrow;
    }
  }

  /// Get FCM token
  Future<String?> getFCMToken() async {
    try {
      return await _storage.read(key: SecureStorageKeys.fcmToken);
    } catch (e) {
      debugPrint('Error getting FCM token: $e');
      return null;
    }
  }

  // ==================== GENERIC METHODS ====================

  /// Save any string value
  Future<void> write(String key, String value) async {
    try {
      await _storage.write(key: key, value: value);
    } catch (e) {
      debugPrint('Error writing to secure storage ($key): $e');
      rethrow;
    }
  }

  /// Read any string value
  Future<String?> read(String key) async {
    try {
      return await _storage.read(key: key);
    } catch (e) {
      debugPrint('Error reading from secure storage ($key): $e');
      return null;
    }
  }

  /// Delete specific key
  Future<void> delete(String key) async {
    try {
      await _storage.delete(key: key);
    } catch (e) {
      debugPrint('Error deleting from secure storage ($key): $e');
      rethrow;
    }
  }

  /// Check if key exists
  Future<bool> containsKey(String key) async {
    try {
      final value = await _storage.read(key: key);
      return value != null;
    } catch (e) {
      debugPrint('Error checking key in secure storage ($key): $e');
      return false;
    }
  }

  /// Get all keys
  Future<Map<String, String>> readAll() async {
    try {
      return await _storage.readAll();
    } catch (e) {
      debugPrint('Error reading all from secure storage: $e');
      return {};
    }
  }

  // ==================== CLEAR METHODS ====================

  /// Clear all authentication data
  Future<void> clearAuthData() async {
    try {
      await Future.wait([
        deleteToken(),
        deleteRefreshToken(),
        deleteUserData(),
      ]);
      debugPrint('Auth data cleared');
    } catch (e) {
      debugPrint('Error clearing auth data: $e');
      rethrow;
    }
  }

  /// Clear all stored data
  Future<void> clearAll() async {
    try {
      await _storage.deleteAll();
      debugPrint('All secure storage cleared');
    } catch (e) {
      debugPrint('Error clearing all secure storage: $e');
      rethrow;
    }
  }

  // ==================== SESSION MANAGEMENT ====================

  /// Save complete session data
  Future<void> saveSession({
    required String token,
    required String refreshToken,
    required Map<String, dynamic> userData,
  }) async {
    try {
      await Future.wait([
        saveToken(token),
        saveRefreshToken(refreshToken),
        saveUserData(userData),
      ]);
      debugPrint('Session saved successfully');
    } catch (e) {
      debugPrint('Error saving session: $e');
      rethrow;
    }
  }

  /// Check if valid session exists
  Future<bool> hasValidSession() async {
    try {
      final hasTokenResult = await hasToken();
      final hasRefreshTokenResult = await hasRefreshToken();
      return hasTokenResult && hasRefreshTokenResult;
    } catch (e) {
      debugPrint('Error checking session: $e');
      return false;
    }
  }

  /// Clear session
  Future<void> clearSession() async {
    await clearAuthData();
  }
}

/// Secure storage keys constants
class SecureStorageKeys {
  // Authentication
  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';
  static const String userData = 'user_data';

  // Credentials
  static const String userEmail = 'user_email';
  static const String userPassword = 'user_password';

  // Preferences
  static const String biometricEnabled = 'biometric_enabled';

  // FCM
  static const String fcmToken = 'fcm_token';

  // API
  static const String apiKey = 'api_key';
  static const String apiSecret = 'api_secret';
}
