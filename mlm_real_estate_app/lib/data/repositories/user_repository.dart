import 'dart:io';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../models/api_response_model.dart';
import '../models/user_model.dart';

/// Repository for handling user profile operations
class UserRepository {
  final ApiClient _apiClient;

  UserRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient.instance;

  /// Get current user profile
  ///
  /// Returns [ApiResponse] containing [User] profile data
  Future<ApiResponse<UserModel>> getProfile() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/user/profile',
      );

      return ApiResponse.fromJson(
        response,
        (data) => UserModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch profile: ${e.toString()}',
      );
    }
  }

  /// Update user profile
  ///
  /// [data] - Map containing profile fields to update
  ///
  /// Returns [ApiResponse] containing updated [User] data
  Future<ApiResponse<UserModel>> updateProfile({
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await _apiClient.put<Map<String, dynamic>>(
        '/user/profile',
        data: data,
      );

      return ApiResponse.fromJson(
        response,
        (data) => UserModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
       
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Profile update failed: ${e.toString()}',
      );
    }
  }

  /// Change user password
  ///
  /// [oldPassword] - Current password
  /// [newPassword] - New password
  ///
  /// Returns [ApiResponse] containing password change result
  Future<ApiResponse<Map<String, dynamic>>> changePassword({
    required String oldPassword,
    required String newPassword,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/user/change-password',
        data: {
          'oldPassword': oldPassword,
          'newPassword': newPassword,
        },
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Password change failed: ${e.toString()}',
      );
    }
  }

  /// Upload profile picture
  ///
  /// [file] - Image file to upload
  ///
  /// Returns [ApiResponse] containing upload result with image URL
  Future<ApiResponse<Map<String, dynamic>>> uploadProfilePicture({
    required File file,
  }) async {
    try {
      final response = await _apiClient.uploadFile<Map<String, dynamic>>(
        '/user/profile-picture',
        file: file,
        fieldName: 'profilePicture',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Profile picture upload failed: ${e.toString()}',
      );
    }
  }

  /// Update user settings
  ///
  /// [settings] - Map containing settings to update
  ///
  /// Returns [ApiResponse] containing updated settings
  Future<ApiResponse<Map<String, dynamic>>> updateSettings({
    required Map<String, dynamic> settings,
  }) async {
    try {
      final response = await _apiClient.put<Map<String, dynamic>>(
        '/user/settings',
        data: settings,
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
       
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Settings update failed: ${e.toString()}',
      );
    }
  }

  /// Delete user account
  ///
  /// Returns [ApiResponse] containing account deletion result
  Future<ApiResponse<Map<String, dynamic>>> deleteAccount() async {
    try {
      final response = await _apiClient.delete<Map<String, dynamic>>(
        '/user/account',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
       
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Account deletion failed: ${e.toString()}',
      );
    }
  }
}
