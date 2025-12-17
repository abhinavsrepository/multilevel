import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../models/api_response_model.dart';
import '../models/notification_model.dart';

/// Repository for handling notification operations
class NotificationRepository {
  final ApiClient _apiClient;

  NotificationRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient.instance;

  /// Get paginated list of notifications
  ///
  /// [page] - Page number (default: 1)
  /// [limit] - Items per page (default: 10)
  ///
  /// Returns [ApiResponse] containing list of [NotificationModel] objects
  Future<ApiResponse<List<NotificationModel>>> getNotifications({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/notifications',
        queryParameters: {
          'page': page.toString(),
          'limit': limit.toString(),
        },
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => NotificationModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch notifications: ${e.toString()}',
      );
    }
  }

  /// Mark a notification as read
  ///
  /// [id] - Notification ID to mark as read
  ///
  /// Returns [ApiResponse] containing updated [NotificationModel]
  Future<ApiResponse<NotificationModel>> markAsRead({
    required String id,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/notifications/$id/read',
      );

      return ApiResponse.fromJson(
        response,
        (data) => NotificationModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to mark notification as read: ${e.toString()}',
      );
    }
  }

  /// Mark all notifications as read
  ///
  /// Returns [ApiResponse] containing result
  Future<ApiResponse<Map<String, dynamic>>> markAllAsRead() async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/notifications/read-all',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to mark all notifications as read: ${e.toString()}',
      );
    }
  }

  /// Delete a notification
  ///
  /// [id] - Notification ID to delete
  ///
  /// Returns [ApiResponse] containing deletion result
  Future<ApiResponse<Map<String, dynamic>>> deleteNotification({
    required String id,
  }) async {
    try {
      final response = await _apiClient.delete<Map<String, dynamic>>(
        '/notifications/$id',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to delete notification: ${e.toString()}',
      );
    }
  }

  /// Update notification settings
  ///
  /// [settings] - Notification settings (email, push, in-app preferences)
  ///
  /// Returns [ApiResponse] containing updated settings
  Future<ApiResponse<Map<String, dynamic>>> updateSettings({
    required Map<String, dynamic> settings,
  }) async {
    try {
      final response = await _apiClient.put<Map<String, dynamic>>(
        '/notifications/settings',
        data: settings,
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to update notification settings: ${e.toString()}',
      );
    }
  }

  /// Register device for push notifications
  ///
  /// [fcmToken] - Firebase Cloud Messaging token
  ///
  /// Returns [ApiResponse] containing registration result
  Future<ApiResponse<Map<String, dynamic>>> registerDevice({
    required String fcmToken,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/notifications/register-device',
        data: {
          'fcmToken': fcmToken,
        },
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to register device: ${e.toString()}',
      );
    }
  }
}
