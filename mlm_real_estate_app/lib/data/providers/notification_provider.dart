import 'package:flutter/material.dart';
import '../models/notification_model.dart';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../../core/constants/api_constants.dart';

/// Notification provider for managing user notifications
///
/// Handles notification retrieval, marking as read/unread,
/// deletion with pagination support.
class NotificationProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient.instance;

  /// List of notifications
  List<NotificationModel> _notifications = [];

  /// Unread notification count
  int _unreadCount = 0;

  /// Loading state
  bool _isLoading = false;

  /// Has more notifications to load
  bool _hasMore = true;

  /// Current page number
  int _currentPage = 1;

  /// Error message
  String? _errorMessage;

  /// Items per page
  static const int _itemsPerPage = 20;

  /// Get notifications list
  List<NotificationModel> get notifications => _notifications;

  /// Get unread count
  int get unreadCount => _unreadCount;

  /// Check if operation is in progress
  bool get isLoading => _isLoading;

  /// Check if more notifications available
  bool get hasMore => _hasMore;

  /// Get current page
  int get currentPage => _currentPage;

  /// Get error message
  String? get errorMessage => _errorMessage;

  /// Get unread notifications
  List<NotificationModel> get unreadNotifications {
    return _notifications.where((n) => !n.isRead).toList();
  }

  /// Get read notifications
  List<NotificationModel> get readNotifications {
    return _notifications.where((n) => n.isRead).toList();
  }

  /// Get notifications with pagination
  ///
  /// [refresh] - If true, resets pagination and fetches from beginning
  ///
  /// Returns true if notifications fetched successfully
  Future<bool> getNotifications({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _notifications.clear();
    }

    if (!_hasMore && !refresh) return true;

    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.notificationList,
        queryParameters: {
          'page': _currentPage,
          'limit': _itemsPerPage,
        },
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      final List<NotificationModel> fetchedNotifications = data
          .map((json) => NotificationModel.fromJson(json as Map<String, dynamic>))
          .toList();

      if (refresh) {
        _notifications = fetchedNotifications;
      } else {
        _notifications.addAll(fetchedNotifications);
      }

      _hasMore = fetchedNotifications.length >= _itemsPerPage;

      if (response['unreadCount'] != null) {
        _unreadCount = response['unreadCount'] as int;
      }

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch notifications. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Load more notifications (pagination)
  ///
  /// Returns true if more notifications loaded successfully
  Future<bool> loadMore() async {
    if (!_hasMore || _isLoading) return false;

    _currentPage++;
    return await getNotifications();
  }

  /// Mark notification as read
  ///
  /// [id] - Notification ID to mark as read
  ///
  /// Returns true if notification marked successfully
  Future<bool> markAsRead(String id) async {
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index == -1) return false;

    final wasUnread = !_notifications[index].isRead;

    _notifications[index] = _notifications[index].copyWith(isRead: true);
    if (wasUnread) _unreadCount = (_unreadCount - 1).clamp(0, double.infinity).toInt();
    notifyListeners();

    try {
      await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.replacePathParam(
          ApiConstants.markRead,
          'id',
          id,
        ),
      );

      return true;
    } on ApiError catch (e) {
      _notifications[index] = _notifications[index].copyWith(isRead: false);
      if (wasUnread) _unreadCount++;
      notifyListeners();

      _setError(e.message);
      return false;
    } catch (e) {
      _notifications[index] = _notifications[index].copyWith(isRead: false);
      if (wasUnread) _unreadCount++;
      notifyListeners();

      _setError('Failed to mark notification as read. Please try again.');
      return false;
    }
  }

  /// Mark all notifications as read
  ///
  /// Returns true if all notifications marked successfully
  Future<bool> markAllAsRead() async {
    final previousNotifications = List<NotificationModel>.from(_notifications);
    final previousUnreadCount = _unreadCount;

    _notifications = _notifications
        .map((n) => n.copyWith(isRead: true))
        .toList();
    _unreadCount = 0;
    notifyListeners();

    _setLoading(true);
    _clearError();

    try {
      await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.markAllRead,
      );

      return true;
    } on ApiError catch (e) {
      _notifications = previousNotifications;
      _unreadCount = previousUnreadCount;
      notifyListeners();

      _setError(e.message);
      return false;
    } catch (e) {
      _notifications = previousNotifications;
      _unreadCount = previousUnreadCount;
      notifyListeners();

      _setError('Failed to mark all as read. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Delete a notification
  ///
  /// [id] - Notification ID to delete
  ///
  /// Returns true if notification deleted successfully
  Future<bool> deleteNotification(String id) async {
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index == -1) return false;

    final deletedNotification = _notifications[index];
    final wasUnread = !deletedNotification.isRead;

    _notifications.removeAt(index);
    if (wasUnread) _unreadCount = (_unreadCount - 1).clamp(0, double.infinity).toInt();
    notifyListeners();

    _setLoading(true);
    _clearError();

    try {
      await _apiClient.delete<Map<String, dynamic>>(
        ApiConstants.replacePathParam(
          ApiConstants.deleteNotification,
          'id',
          id,
        ),
      );

      return true;
    } on ApiError catch (e) {
      _notifications.insert(index, deletedNotification);
      if (wasUnread) _unreadCount++;
      notifyListeners();

      _setError(e.message);
      return false;
    } catch (e) {
      _notifications.insert(index, deletedNotification);
      if (wasUnread) _unreadCount++;
      notifyListeners();

      _setError('Failed to delete notification. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Update unread count
  void updateUnreadCount(int count) {
    _unreadCount = count;
    notifyListeners();
  }

  /// Increment unread count (when new notification arrives)
  void incrementUnreadCount() {
    _unreadCount++;
    notifyListeners();
  }

  /// Add new notification (for real-time updates)
  void addNotification(NotificationModel notification) {
    _notifications.insert(0, notification);
    if (!notification.isRead) {
      _unreadCount++;
    }
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

  /// Reset provider state
  void reset() {
    _notifications.clear();
    _unreadCount = 0;
    _isLoading = false;
    _hasMore = true;
    _currentPage = 1;
    _errorMessage = null;
    notifyListeners();
  }
}
