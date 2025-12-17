import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../models/api_response_model.dart';
import '../models/auth_response_model.dart';

/// Repository for handling authentication operations
class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient.instance;

  /// Login with email/mobile and password
  ///
  /// [emailOrMobile] - User's email address or mobile number
  /// [password] - User's password
  ///
  /// Returns [ApiResponse] containing [AuthResponseModel] with user data and tokens
  Future<ApiResponse<AuthResponseModel>> login({
    required String emailOrMobile,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/auth/login',
        data: {
          'emailOrMobile': emailOrMobile,
          'password': password,
        },
      );

      return ApiResponse.fromJson(
        response,
        (data) => AuthResponseModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Login failed: ${e.toString()}',
      );
    }
  }

  /// Register a new user
  ///
  /// [fullName] - User's full name
  /// [email] - User's email address
  /// [mobile] - User's mobile number
  /// [password] - User's password
  /// [sponsorId] - Sponsor/referral ID
  /// [placement] - Placement preference (left/right for binary tree)
  ///
  /// Returns [ApiResponse] containing [AuthResponseModel] with user data and tokens
  Future<ApiResponse<AuthResponseModel>> register({
    required String fullName,
    required String email,
    required String mobile,
    required String password,
    required String sponsorId,
    String? placement,
  }) async {
    // Split full name into first and last name
    final nameParts = fullName.trim().split(' ');
    final firstName = nameParts.first;
    final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';
    
    // Generate username from email (part before @)
    final username = email.split('@').first;

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/auth/register',
        data: {
          'username': username,
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'phoneNumber': mobile,
          'password': password,
          'sponsorCode': sponsorId,
          if (placement != null) 'placement': placement,
        },
      );

      return ApiResponse.fromJson(
        response,
        (data) => AuthResponseModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Registration failed: ${e.toString()}',
      );
    }
  }

  /// Verify OTP for email/mobile verification
  ///
  /// [emailOrMobile] - User's email address or mobile number
  /// [otp] - One-time password received
  ///
  /// Returns [ApiResponse] containing verification result
  Future<ApiResponse<Map<String, dynamic>>> verifyOtp({
    required String emailOrMobile,
    required String otp,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/auth/verify-otp',
        data: {
          'emailOrMobile': emailOrMobile,
          'otp': otp,
        },
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'OTP verification failed: ${e.toString()}',
      );
    }
  }

  /// Resend OTP to email/mobile
  ///
  /// [emailOrMobile] - User's email address or mobile number
  ///
  /// Returns [ApiResponse] containing resend result
  Future<ApiResponse<Map<String, dynamic>>> resendOtp({
    required String emailOrMobile,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/auth/resend-otp',
        data: {
          'emailOrMobile': emailOrMobile,
        },
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Resend OTP failed: ${e.toString()}',
      );
    }
  }

  /// Request password reset link
  ///
  /// [email] - User's email address
  ///
  /// Returns [ApiResponse] containing reset request result
  Future<ApiResponse<Map<String, dynamic>>> forgotPassword({
    required String email,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/auth/forgot-password',
        data: {
          'email': email,
        },
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Forgot password request failed: ${e.toString()}',
      );
    }
  }

  /// Reset password using token
  ///
  /// [token] - Password reset token received via email
  /// [password] - New password
  ///
  /// Returns [ApiResponse] containing reset result
  Future<ApiResponse<Map<String, dynamic>>> resetPassword({
    required String token,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/auth/reset-password',
        data: {
          'token': token,
          'password': password,
        },
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Password reset failed: ${e.toString()}',
      );
    }
  }

  /// Logout current user
  ///
  /// Returns [ApiResponse] containing logout result
  Future<ApiResponse<Map<String, dynamic>>> logout() async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/auth/logout',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Logout failed: ${e.toString()}',
      );
    }
  }

  /// Refresh authentication token
  ///
  /// Returns [ApiResponse] containing new [AuthResponseModel] with refreshed tokens
  Future<ApiResponse<AuthResponseModel>> refreshToken() async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/auth/refresh-token',
      );

      return ApiResponse.fromJson(
        response,
        (data) => AuthResponseModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Token refresh failed: ${e.toString()}',
      );
    }
  }

  /// Validate sponsor ID during registration
  ///
  /// [sponsorId] - Sponsor/referral ID to validate
  ///
  /// Returns [ApiResponse] containing sponsor validation details
  Future<ApiResponse<Map<String, dynamic>>> validateSponsor({
    required String sponsorId,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/auth/validate-sponsor/$sponsorId',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Sponsor validation failed: ${e.toString()}',
      );
    }
  }
}
