import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../models/auth_response_model.dart';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../../core/services/secure_storage_service.dart';
import '../../core/constants/api_constants.dart';

/// Authentication provider for managing user authentication state
///
/// Handles login, registration, OTP verification, password management,
/// and session persistence. All authentication operations are performed
/// through this provider.
class AuthProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient.instance;
  final SecureStorageService _secureStorage = SecureStorageService.instance;

  /// Current authenticated user
  UserModel? _user;

  /// Authentication status
  bool _isAuthenticated = false;

  /// Loading state
  bool _isLoading = false;

  /// Error message
  String? _errorMessage;

  /// Get current user
  UserModel? get user => _user;

  /// Check if user is authenticated
  bool get isAuthenticated => _isAuthenticated;

  /// Check if operation is in progress
  bool get isLoading => _isLoading;

  /// Get error message
  String? get errorMessage => _errorMessage;

  /// Get user ID
  String? get userId => _user?.id;

  /// Get user email
  String? get userEmail => _user?.email;

  /// Get user full name
  String? get userName => _user?.fullName;

  /// Initialize auth provider and check for existing session
  Future<void> initialize() async {
    _setLoading(true);
    _clearError();

    try {
      final hasSession = await _secureStorage.hasValidSession();

      if (hasSession) {
        final userData = await _secureStorage.getUserData();

        if (userData != null) {
          _user = UserModel.fromJson(userData);
          _isAuthenticated = true;

          final token = await _secureStorage.getToken();
          if (token != null) {
            _apiClient.interceptor.setToken(token);
          }
        }
      }
    } catch (e) {
      debugPrint('Error initializing auth: $e');
      await _clearSession();
    } finally {
      _setLoading(false);
    }
  }

  /// Login with email or mobile and password
  ///
  /// [emailOrMobile] - User's email address or mobile number
  /// [password] - User's password
  ///
  /// Returns true if login successful
  Future<bool> login(String emailOrMobile, String password) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.login,
        data: {
          'emailOrMobile': emailOrMobile,
          'password': password,
        },
      );

      // Extract data from response
      final data = response['data'] as Map<String, dynamic>;
      final authResponse = AuthResponseModel.fromJson(data);

      await _saveSession(authResponse);

      _user = authResponse.user;
      _isAuthenticated = true;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Login failed. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Register new user
  ///
  /// [data] - Registration data including name, email, password, etc.
  ///
  /// Returns true if registration successful
  Future<bool> register(Map<String, dynamic> data) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.register,
        data: data,
      );

      // Extract data from response
      final responseData = response['data'] as Map<String, dynamic>;
      final authResponse = AuthResponseModel.fromJson(responseData);

      await _saveSession(authResponse);

      _user = authResponse.user;
      _isAuthenticated = true;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Registration failed. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Verify OTP sent to email or mobile
  ///
  /// [emailOrMobile] - User's email or mobile number
  /// [otp] - One-time password received
  ///
  /// Returns true if verification successful
  Future<bool> verifyOtp(String emailOrMobile, String otp) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.verifyOtp,
        data: {
          'emailOrMobile': emailOrMobile,
          'otp': otp,
        },
      );

      // Extract data from response
      final responseData = response['data'] as Map<String, dynamic>;
      final authResponse = AuthResponseModel.fromJson(responseData);

      await _saveSession(authResponse);

      _user = authResponse.user;
      _isAuthenticated = true;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('OTP verification failed. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Resend OTP to email or mobile
  ///
  /// [emailOrMobile] - User's email or mobile number
  ///
  /// Returns true if OTP sent successfully
  Future<bool> resendOtp(String emailOrMobile) async {
    _setLoading(true);
    _clearError();

    try {
      await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.resendOtp,
        data: {
          'emailOrMobile': emailOrMobile,
        },
      );

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to resend OTP. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Request password reset
  ///
  /// [email] - User's email address
  ///
  /// Returns true if reset link sent successfully
  Future<bool> forgotPassword(String email) async {
    _setLoading(true);
    _clearError();

    try {
      await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.forgotPassword,
        data: {
          'email': email,
        },
      );

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to send reset link. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Reset password with token
  ///
  /// [token] - Reset token from email
  /// [password] - New password
  ///
  /// Returns true if password reset successful
  Future<bool> resetPassword(String token, String password) async {
    _setLoading(true);
    _clearError();

    try {
      await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.resetPassword,
        data: {
          'token': token,
          'password': password,
        },
      );

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Password reset failed. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Validate sponsor ID
  ///
  /// [sponsorId] - Sponsor's ID to validate
  ///
  /// Returns sponsor user data if valid, null otherwise
  Future<Map<String, dynamic>?> validateSponsor(String sponsorId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.replacePathParam(
          ApiConstants.validateSponsor,
          'id',
          sponsorId,
        ),
      );

      if (response['success'] == true && response['data'] != null) {
        final data = response['data'] as Map<String, dynamic>;
        if (data['sponsor'] != null) {
          return data['sponsor'] as Map<String, dynamic>;
        }
      }

      notifyListeners();
      return null;
    } on ApiError catch (e) {
      _setError(e.message);
      return null;
    } catch (e) {
      _setError('Failed to validate sponsor. Please try again.');
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Logout current user
  Future<void> logout() async {
    _setLoading(true);
    _clearError();

    try {
      await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.logout,
      );
    } catch (e) {
      debugPrint('Logout API error: $e');
    } finally {
      await _clearSession();
      _setLoading(false);
    }
  }

  /// Update user data
  ///
  /// [updatedUser] - Updated user model
  void updateUser(UserModel updatedUser) {
    _user = updatedUser;
    _secureStorage.saveUserData(updatedUser.toJson());
    notifyListeners();
  }

  /// Save authentication session
  Future<void> _saveSession(AuthResponseModel authResponse) async {
    await _secureStorage.saveSession(
      token: authResponse.token,
      refreshToken: authResponse.refreshToken,
      userData: authResponse.user.toJson(),
    );

    _apiClient.interceptor.setToken(authResponse.token);
  }

  /// Clear authentication session
  Future<void> _clearSession() async {
    await _secureStorage.clearAuthData();

    _user = null;
    _isAuthenticated = false;

    _apiClient.interceptor.clearToken();

    notifyListeners();
  }

  /// Set loading state
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  /// Set error message
  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  /// Clear error message
  void _clearError() {
    _errorMessage = null;
  }

  /// Clear error manually
  void clearError() {
    _clearError();
    notifyListeners();
  }
}
