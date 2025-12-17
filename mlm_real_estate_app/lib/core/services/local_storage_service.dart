import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter/foundation.dart';

/// Local storage service using Hive for efficient data persistence
/// Implements singleton pattern for global access
class LocalStorageService {
  LocalStorageService._();
  static final LocalStorageService _instance = LocalStorageService._();
  static LocalStorageService get instance => _instance;

  static const String _preferencesBox = 'preferences';
  static const String _cacheBox = 'cache';
  static const String _userBox = 'user';

  Box<dynamic>? _preferences;
  Box<dynamic>? _cache;
  Box<dynamic>? _user;

  /// Initialize Hive and open all boxes
  Future<void> initialize() async {
    try {
      await Hive.initFlutter();

      _preferences = await Hive.openBox<dynamic>(_preferencesBox);
      _cache = await Hive.openBox<dynamic>(_cacheBox);
      _user = await Hive.openBox<dynamic>(_userBox);

      debugPrint('LocalStorageService initialized successfully');
    } catch (e) {
      debugPrint('Error initializing LocalStorageService: $e');
      rethrow;
    }
  }

  /// Check if storage is initialized
  bool get isInitialized =>
      _preferences?.isOpen == true &&
      _cache?.isOpen == true &&
      _user?.isOpen == true;

  // ==================== PREFERENCES ====================

  /// Save a value to preferences
  Future<void> savePreference(String key, dynamic value) async {
    try {
      await _preferences?.put(key, value);
    } catch (e) {
      debugPrint('Error saving preference $key: $e');
      rethrow;
    }
  }

  /// Get a value from preferences
  T? getPreference<T>(String key, {T? defaultValue}) {
    try {
      final value = _preferences?.get(key, defaultValue: defaultValue);
      return value as T?;
    } catch (e) {
      debugPrint('Error getting preference $key: $e');
      return defaultValue;
    }
  }

  /// Delete a preference
  Future<void> deletePreference(String key) async {
    try {
      await _preferences?.delete(key);
    } catch (e) {
      debugPrint('Error deleting preference $key: $e');
      rethrow;
    }
  }

  /// Clear all preferences
  Future<void> clearPreferences() async {
    try {
      await _preferences?.clear();
    } catch (e) {
      debugPrint('Error clearing preferences: $e');
      rethrow;
    }
  }

  /// Check if preference exists
  bool hasPreference(String key) {
    return _preferences?.containsKey(key) ?? false;
  }

  // ==================== CACHE ====================

  /// Save data to cache
  Future<void> saveToCache(String key, dynamic value) async {
    try {
      await _cache?.put(key, value);
    } catch (e) {
      debugPrint('Error saving to cache $key: $e');
      rethrow;
    }
  }

  /// Get data from cache
  T? getFromCache<T>(String key, {T? defaultValue}) {
    try {
      final value = _cache?.get(key, defaultValue: defaultValue);
      return value as T?;
    } catch (e) {
      debugPrint('Error getting from cache $key: $e');
      return defaultValue;
    }
  }

  /// Delete from cache
  Future<void> deleteFromCache(String key) async {
    try {
      await _cache?.delete(key);
    } catch (e) {
      debugPrint('Error deleting from cache $key: $e');
      rethrow;
    }
  }

  /// Clear all cache
  Future<void> clearCache() async {
    try {
      await _cache?.clear();
    } catch (e) {
      debugPrint('Error clearing cache: $e');
      rethrow;
    }
  }

  /// Check if cache contains key
  bool hasInCache(String key) {
    return _cache?.containsKey(key) ?? false;
  }

  // ==================== USER DATA ====================

  /// Save user data
  Future<void> saveUserData(String key, dynamic value) async {
    try {
      await _user?.put(key, value);
    } catch (e) {
      debugPrint('Error saving user data $key: $e');
      rethrow;
    }
  }

  /// Get user data
  T? getUserData<T>(String key, {T? defaultValue}) {
    try {
      final value = _user?.get(key, defaultValue: defaultValue);
      return value as T?;
    } catch (e) {
      debugPrint('Error getting user data $key: $e');
      return defaultValue;
    }
  }

  /// Delete user data
  Future<void> deleteUserData(String key) async {
    try {
      await _user?.delete(key);
    } catch (e) {
      debugPrint('Error deleting user data $key: $e');
      rethrow;
    }
  }

  /// Clear all user data
  Future<void> clearUserData() async {
    try {
      await _user?.clear();
    } catch (e) {
      debugPrint('Error clearing user data: $e');
      rethrow;
    }
  }

  /// Check if user data exists
  bool hasUserData(String key) {
    return _user?.containsKey(key) ?? false;
  }

  // ==================== GENERIC METHODS ====================

  /// Save any data type
  Future<void> save(String key, dynamic value, {StorageType type = StorageType.cache}) async {
    switch (type) {
      case StorageType.preference:
        await savePreference(key, value);
        break;
      case StorageType.cache:
        await saveToCache(key, value);
        break;
      case StorageType.user:
        await saveUserData(key, value);
        break;
    }
  }

  /// Get any data type
  T? get<T>(String key, {T? defaultValue, StorageType type = StorageType.cache}) {
    switch (type) {
      case StorageType.preference:
        return getPreference<T>(key, defaultValue: defaultValue);
      case StorageType.cache:
        return getFromCache<T>(key, defaultValue: defaultValue);
      case StorageType.user:
        return getUserData<T>(key, defaultValue: defaultValue);
    }
  }

  /// Delete any data
  Future<void> delete(String key, {StorageType type = StorageType.cache}) async {
    switch (type) {
      case StorageType.preference:
        await deletePreference(key);
        break;
      case StorageType.cache:
        await deleteFromCache(key);
        break;
      case StorageType.user:
        await deleteUserData(key);
        break;
    }
  }

  /// Clear all data from all boxes
  Future<void> clearAll() async {
    try {
      await Future.wait([
        clearPreferences(),
        clearCache(),
        clearUserData(),
      ]);
    } catch (e) {
      debugPrint('Error clearing all storage: $e');
      rethrow;
    }
  }

  /// Get all keys from a box
  Iterable<String> getKeys({StorageType type = StorageType.cache}) {
    switch (type) {
      case StorageType.preference:
        return _preferences?.keys.cast<String>() ?? [];
      case StorageType.cache:
        return _cache?.keys.cast<String>() ?? [];
      case StorageType.user:
        return _user?.keys.cast<String>() ?? [];
    }
  }

  /// Get box size
  int getSize({StorageType type = StorageType.cache}) {
    switch (type) {
      case StorageType.preference:
        return _preferences?.length ?? 0;
      case StorageType.cache:
        return _cache?.length ?? 0;
      case StorageType.user:
        return _user?.length ?? 0;
    }
  }

  /// Compact all boxes to optimize storage
  Future<void> compact() async {
    try {
      await Future.wait([
        _preferences?.compact() ?? Future.value(),
        _cache?.compact() ?? Future.value(),
        _user?.compact() ?? Future.value(),
      ]);
      debugPrint('Storage compacted successfully');
    } catch (e) {
      debugPrint('Error compacting storage: $e');
      rethrow;
    }
  }

  /// Close all boxes
  Future<void> close() async {
    try {
      await Future.wait([
        _preferences?.close() ?? Future.value(),
        _cache?.close() ?? Future.value(),
        _user?.close() ?? Future.value(),
      ]);
      debugPrint('LocalStorageService closed');
    } catch (e) {
      debugPrint('Error closing LocalStorageService: $e');
      rethrow;
    }
  }

  /// Dispose and cleanup
  Future<void> dispose() async {
    await close();
  }
}

/// Storage type enum for organizing data
enum StorageType {
  preference,
  cache,
  user,
}

/// Common storage keys
class StorageKeys {
  // User preferences
  static const String themeMode = 'theme_mode';
  static const String language = 'language';
  static const String isFirstLaunch = 'is_first_launch';
  static const String onboardingCompleted = 'onboarding_completed';
  static const String notificationsEnabled = 'notifications_enabled';
  static const String biometricEnabled = 'biometric_enabled';

  // User data
  static const String userId = 'user_id';
  static const String userEmail = 'user_email';
  static const String userName = 'user_name';
  static const String userPhone = 'user_phone';
  static const String userAvatar = 'user_avatar';
  static const String userRole = 'user_role';

  // App state
  static const String lastSyncTime = 'last_sync_time';
  static const String appVersion = 'app_version';

  // Cache
  static const String propertiesCache = 'properties_cache';
  static const String teamMembersCache = 'team_members_cache';
  static const String commissionsCache = 'commissions_cache';
  static const String dashboardCache = 'dashboard_cache';
}
