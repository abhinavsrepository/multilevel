import 'dart:io';
import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../../core/constants/api_constants.dart';
import 'auth_provider.dart';

/// User profile provider for managing user profile operations
///
/// Handles profile retrieval, updates, password changes, and
/// profile picture uploads. Works in conjunction with AuthProvider
/// to keep user data synchronized.
class UserProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient.instance;

  /// Current user data
  UserModel? _user;

  /// Loading state
  bool _isLoading = false;

  /// Error message
  String? _errorMessage;

  /// Reference to auth provider for synchronization
  AuthProvider? _authProvider;

  /// Get current user
  UserModel? get user => _user;

  /// Check if operation is in progress
  bool get isLoading => _isLoading;

  /// Get error message
  String? get errorMessage => _errorMessage;

  /// Update auth provider reference
  ///
  /// This allows user provider to update auth state when profile changes
  void update(AuthProvider authProvider) {
    _authProvider = authProvider;
    _user = authProvider.user;
  }

  /// Get user profile from server
  ///
  /// Returns true if profile fetched successfully
  Future<bool> getProfile() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.profile,
      );

      _user = UserModel.fromJson(response);

      if (_authProvider != null) {
        _authProvider!.updateUser(_user!);
      }

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch profile. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Update user profile
  ///
  /// [data] - Profile data to update (name, email, phone, etc.)
  ///
  /// Returns true if profile updated successfully
  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.put<Map<String, dynamic>>(
        ApiConstants.updateProfile,
        data: data,
      );

      _user = UserModel.fromJson(response);

      if (_authProvider != null) {
        _authProvider!.updateUser(_user!);
      }

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to update profile. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Change user password
  ///
  /// [oldPassword] - Current password
  /// [newPassword] - New password
  ///
  /// Returns true if password changed successfully
  Future<bool> changePassword(String oldPassword, String newPassword) async {
    _setLoading(true);
    _clearError();

    try {
      await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.changePassword,
        data: {
          'oldPassword': oldPassword,
          'newPassword': newPassword,
        },
      );

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to change password. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Upload profile picture
  ///
  /// [file] - Image file to upload
  ///
  /// Returns true if picture uploaded successfully
  Future<bool> uploadProfilePicture(File file) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.uploadFile<Map<String, dynamic>>(
        ApiConstants.uploadAvatar,
        file: file,
        fieldName: 'avatar',
      );

      _user = UserModel.fromJson(response);

      if (_authProvider != null) {
        _authProvider!.updateUser(_user!);
      }

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to upload profile picture. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
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

  /// Reset provider state
  void reset() {
    _user = null;
    _isLoading = false;
    _errorMessage = null;
    notifyListeners();
  }
}
