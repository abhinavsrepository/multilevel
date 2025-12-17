import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;


/// Background message handler - must be top-level function
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('Handling background message: ${message.messageId}');
  debugPrint('Background notification - Title: ${message.notification?.title}');
  debugPrint('Background notification - Body: ${message.notification?.body}');
  debugPrint('Background notification - Data: ${message.data}');
}

/// Firebase Cloud Messaging notification service
/// Handles push notifications, local notifications, and notification actions
/// Implements singleton pattern for global access
class NotificationService {
  NotificationService._();
  static final NotificationService _instance = NotificationService._();
  static NotificationService get instance => _instance;

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  String? _fcmToken;
  bool _isInitialized = false;

  /// Callback for notification tap
  Function(Map<String, dynamic>)? onNotificationTap;

  /// Callback for foreground notification received
  Function(RemoteMessage)? onForegroundMessage;

  /// Callback for token refresh
  Function(String)? onTokenRefresh;

  /// Get FCM token
  String? get fcmToken => _fcmToken;

  /// Check if service is initialized
  bool get isInitialized => _isInitialized;

  /// Initialize Firebase Messaging and local notifications
  Future<void> initialize() async {
    if (_isInitialized) {
      debugPrint('NotificationService already initialized');
      return;
    }

    try {
      // Initialize timezone database
      tz.initializeTimeZones();

      // Initialize local notifications
      await _initializeLocalNotifications();

      // Request permissions
      await requestPermissions();

      // Get FCM token
      await _getFCMToken();

      // Setup message handlers
      _setupMessageHandlers();

      // Setup token refresh listener
      _setupTokenRefreshListener();

      _isInitialized = true;
      debugPrint('NotificationService initialized successfully');
    } catch (e) {
      debugPrint('Error initializing NotificationService: $e');
      rethrow;
    }
  }

  /// Initialize local notifications with platform-specific settings
  Future<void> _initializeLocalNotifications() async {
    try {
      // Android initialization settings
      const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');

      // iOS initialization settings
      const iosSettings = DarwinInitializationSettings(
        requestAlertPermission: false,
        requestBadgePermission: false,
        requestSoundPermission: false,
      );

      // Linux initialization settings
      const linuxSettings = LinuxInitializationSettings(
        defaultActionName: 'Open notification',
      );

      // Combined initialization settings
      const initSettings = InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
        linux: linuxSettings,
      );

      // Initialize with settings and callback
      await _localNotifications.initialize(
        initSettings,
        onDidReceiveNotificationResponse: _onNotificationResponse,
        onDidReceiveBackgroundNotificationResponse: _onBackgroundNotificationResponse,
      );

      // Create Android notification channel
      // Create Android notification channel
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
        await _createNotificationChannel();
      }

      debugPrint('Local notifications initialized');
    } catch (e) {
      debugPrint('Error initializing local notifications: $e');
      rethrow;
    }
  }

  /// Create Android notification channel
  Future<void> _createNotificationChannel() async {
    try {
      const channel = AndroidNotificationChannel(
        'mlm_real_estate_high_importance',
        'MLM Real Estate Notifications',
        description: 'This channel is used for important notifications',
        importance: Importance.high,
        enableVibration: true,
        playSound: true,
        showBadge: true,
      );

      await _localNotifications
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(channel);

      debugPrint('Android notification channel created');
    } catch (e) {
      debugPrint('Error creating notification channel: $e');
    }
  }

  /// Request notification permissions
  Future<bool> requestPermissions() async {
    try {
      if (!kIsWeb) {
        if (defaultTargetPlatform == TargetPlatform.iOS) {
          // iOS-specific permission request
          final settings = await _messaging.requestPermission(
            alert: true,
            announcement: false,
            badge: true,
            carPlay: false,
            criticalAlert: false,
            provisional: false,
            sound: true,
          );

          debugPrint('iOS notification permission status: ${settings.authorizationStatus}');

          return settings.authorizationStatus == AuthorizationStatus.authorized ||
              settings.authorizationStatus == AuthorizationStatus.provisional;
        } else if (defaultTargetPlatform == TargetPlatform.android) {
          // Android 13+ runtime permission
          final androidImplementation = _localNotifications
              .resolvePlatformSpecificImplementation<
                  AndroidFlutterLocalNotificationsPlugin>();

          final granted = await androidImplementation?.requestNotificationsPermission();
          debugPrint('Android notification permission granted: $granted');
          return granted ?? true;
        }
      }

      return true;
    } catch (e) {
      debugPrint('Error requesting notification permissions: $e');
      return false;
    }
  }

  /// Check notification permission status
  Future<bool> checkPermissions() async {
    try {
      final settings = await _messaging.getNotificationSettings();
      return settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional;
    } catch (e) {
      debugPrint('Error checking notification permissions: $e');
      return false;
    }
  }

  /// Get FCM token
  Future<String?> _getFCMToken() async {
    try {
      _fcmToken = await _messaging.getToken();
      debugPrint('FCM Token: $_fcmToken');
      return _fcmToken;
    } catch (e) {
      debugPrint('Error getting FCM token: $e');
      return null;
    }
  }

  /// Get current FCM token
  Future<String?> getToken() async {
    if (_fcmToken != null) return _fcmToken;
    return await _getFCMToken();
  }

  /// Setup token refresh listener
  void _setupTokenRefreshListener() {
    _messaging.onTokenRefresh.listen((newToken) {
      debugPrint('FCM Token refreshed: $newToken');
      _fcmToken = newToken;
      onTokenRefresh?.call(newToken);
    });
  }

  /// Setup message handlers for different states
  void _setupMessageHandlers() {
    // Foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Background message handler (set globally)
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    // Message opened app from terminated state
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);

    // Check for initial message (app opened from terminated state)
    _checkInitialMessage();
  }

  /// Handle foreground messages
  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    debugPrint('Foreground message received: ${message.messageId}');
    debugPrint('Notification: ${message.notification?.toMap()}');
    debugPrint('Data: ${message.data}');

    // Notify callback
    onForegroundMessage?.call(message);

    // Show local notification
    if (message.notification != null) {
      await showLocalNotification(
        title: message.notification!.title ?? 'New Notification',
        body: message.notification!.body ?? '',
        payload: message.data,
      );
    }
  }

  /// Handle message that opened app from background
  void _handleMessageOpenedApp(RemoteMessage message) {
    debugPrint('Message opened app: ${message.messageId}');
    debugPrint('Data: ${message.data}');

    // Notify callback
    onNotificationTap?.call(message.data);
  }

  /// Check for initial message when app starts from terminated state
  Future<void> _checkInitialMessage() async {
    try {
      final initialMessage = await _messaging.getInitialMessage();
      if (initialMessage != null) {
        debugPrint('App opened from terminated state: ${initialMessage.messageId}');
        debugPrint('Data: ${initialMessage.data}');

        // Delay to ensure app is ready
        Future.delayed(const Duration(seconds: 1), () {
          onNotificationTap?.call(initialMessage.data);
        });
      }
    } catch (e) {
      debugPrint('Error checking initial message: $e');
    }
  }

  /// Show local notification
  Future<void> showLocalNotification({
    required String title,
    required String body,
    Map<String, dynamic>? payload,
    int id = 0,
  }) async {
    try {
      const androidDetails = AndroidNotificationDetails(
        'mlm_real_estate_high_importance',
        'MLM Real Estate Notifications',
        channelDescription: 'This channel is used for important notifications',
        importance: Importance.high,
        priority: Priority.high,
        showWhen: true,
        enableVibration: true,
        playSound: true,
        icon: '@mipmap/ic_launcher',
      );

      const iosDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      const notificationDetails = NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      );

      await _localNotifications.show(
        id,
        title,
        body,
        notificationDetails,
        payload: payload != null ? _encodePayload(payload) : null,
      );

      debugPrint('Local notification shown: $title');
    } catch (e) {
      debugPrint('Error showing local notification: $e');
    }
  }

  /// Show scheduled notification
  Future<void> scheduleNotification({
    required String title,
    required String body,
    required DateTime scheduledDate,
    Map<String, dynamic>? payload,
    int id = 0,
  }) async {
    try {
      const androidDetails = AndroidNotificationDetails(
        'mlm_real_estate_high_importance',
        'MLM Real Estate Notifications',
        channelDescription: 'This channel is used for important notifications',
        importance: Importance.high,
        priority: Priority.high,
      );

      const iosDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      const notificationDetails = NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      );

      // Convert DateTime to TZDateTime
      final tzScheduledDate = tz.TZDateTime.from(scheduledDate, tz.local);

      await _localNotifications.zonedSchedule(
        id,
        title,
        body,
        tzScheduledDate,
        notificationDetails,
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        payload: payload != null ? _encodePayload(payload) : null,
      );

      debugPrint('Notification scheduled for: $scheduledDate');
    } catch (e) {
      debugPrint('Error scheduling notification: $e');
    }
  }

  /// Handle notification tap
  void _onNotificationResponse(NotificationResponse response) {
    debugPrint('Notification tapped: ${response.payload}');

    if (response.payload != null) {
      final payload = _decodePayload(response.payload!);
      onNotificationTap?.call(payload);
    }
  }

  /// Handle background notification tap
  @pragma('vm:entry-point')
  static void _onBackgroundNotificationResponse(NotificationResponse response) {
    debugPrint('Background notification tapped: ${response.payload}');
  }

  /// Encode payload to string
  String _encodePayload(Map<String, dynamic> payload) {
    try {
      return payload.entries.map((e) => '${e.key}=${e.value}').join('&');
    } catch (e) {
      debugPrint('Error encoding payload: $e');
      return '';
    }
  }

  /// Decode payload from string
  Map<String, dynamic> _decodePayload(String payload) {
    try {
      final map = <String, dynamic>{};
      for (final pair in payload.split('&')) {
        final parts = pair.split('=');
        if (parts.length == 2) {
          map[parts[0]] = parts[1];
        }
      }
      return map;
    } catch (e) {
      debugPrint('Error decoding payload: $e');
      return {};
    }
  }

  /// Cancel specific notification
  Future<void> cancelNotification(int id) async {
    try {
      await _localNotifications.cancel(id);
      debugPrint('Notification cancelled: $id');
    } catch (e) {
      debugPrint('Error cancelling notification: $e');
    }
  }

  /// Cancel all notifications
  Future<void> cancelAllNotifications() async {
    try {
      await _localNotifications.cancelAll();
      debugPrint('All notifications cancelled');
    } catch (e) {
      debugPrint('Error cancelling all notifications: $e');
    }
  }

  /// Get pending notifications
  Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    try {
      return await _localNotifications.pendingNotificationRequests();
    } catch (e) {
      debugPrint('Error getting pending notifications: $e');
      return [];
    }
  }

  /// Get active notifications
  Future<List<ActiveNotification>> getActiveNotifications() async {
    try {
      return await _localNotifications.getActiveNotifications();
    } catch (e) {
      debugPrint('Error getting active notifications: $e');
      return [];
    }
  }

  /// Set badge count (iOS)
  Future<void> setBadgeCount(int count) async {
    try {
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.iOS) {
        await _messaging.setForegroundNotificationPresentationOptions(
          alert: true,
          badge: true,
          sound: true,
        );
      }
      debugPrint('Badge count set to: $count');
    } catch (e) {
      debugPrint('Error setting badge count: $e');
    }
  }

  /// Clear badge count
  Future<void> clearBadge() async {
    await setBadgeCount(0);
  }

  /// Subscribe to topic
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _messaging.subscribeToTopic(topic);
      debugPrint('Subscribed to topic: $topic');
    } catch (e) {
      debugPrint('Error subscribing to topic: $e');
    }
  }

  /// Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _messaging.unsubscribeFromTopic(topic);
      debugPrint('Unsubscribed from topic: $topic');
    } catch (e) {
      debugPrint('Error unsubscribing from topic: $e');
    }
  }

  /// Delete FCM token
  Future<void> deleteToken() async {
    try {
      await _messaging.deleteToken();
      _fcmToken = null;
      debugPrint('FCM token deleted');
    } catch (e) {
      debugPrint('Error deleting FCM token: $e');
    }
  }

  /// Dispose and cleanup
  Future<void> dispose() async {
    await cancelAllNotifications();
    _isInitialized = false;
  }
}

/// Notification topics for subscription
class NotificationTopics {
  static const String allUsers = 'all_users';
  static const String newProperties = 'new_properties';
  static const String teamUpdates = 'team_updates';
  static const String commissions = 'commissions';
  static const String announcements = 'announcements';
  static const String promotions = 'promotions';
}
