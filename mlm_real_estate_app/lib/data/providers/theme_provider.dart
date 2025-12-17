import 'package:flutter/material.dart';
import '../../core/services/local_storage_service.dart';

/// Theme provider for managing app theme state
///
/// Handles theme mode switching between light, dark, and system themes.
/// Persists user theme preference to local storage.
class ThemeProvider extends ChangeNotifier {
  final LocalStorageService _storage = LocalStorageService.instance;

  /// Current theme mode
  ThemeMode _themeMode = ThemeMode.system;

  /// Storage key for theme preference
  static const String _themeModeKey = 'theme_mode';

  /// Get current theme mode
  ThemeMode get themeMode => _themeMode;

  /// Check if dark mode is enabled
  bool get isDarkMode => _themeMode == ThemeMode.dark;

  /// Check if light mode is enabled
  bool get isLightMode => _themeMode == ThemeMode.light;

  /// Check if system mode is enabled
  bool get isSystemMode => _themeMode == ThemeMode.system;

  /// Initialize theme provider and load saved theme preference
  Future<void> initialize() async {
    await _loadThemePreference();
  }

  /// Load theme preference from local storage
  Future<void> _loadThemePreference() async {
    try {
      final savedThemeIndex = _storage.getPreference<int>(
        _themeModeKey,
        defaultValue: ThemeMode.system.index,
      );

      if (savedThemeIndex != null) {
        _themeMode = ThemeMode.values[savedThemeIndex];
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading theme preference: $e');
    }
  }

  /// Save theme preference to local storage
  Future<void> _saveThemePreference() async {
    try {
      await _storage.savePreference(_themeModeKey, _themeMode.index);
    } catch (e) {
      debugPrint('Error saving theme preference: $e');
    }
  }

  /// Toggle between light and dark theme
  /// System mode will switch to light first
  Future<void> toggleTheme() async {
    switch (_themeMode) {
      case ThemeMode.light:
        await setThemeMode(ThemeMode.dark);
        break;
      case ThemeMode.dark:
        await setThemeMode(ThemeMode.light);
        break;
      case ThemeMode.system:
        await setThemeMode(ThemeMode.light);
        break;
    }
  }

  /// Set specific theme mode
  Future<void> setThemeMode(ThemeMode mode) async {
    if (_themeMode == mode) return;

    _themeMode = mode;
    notifyListeners();

    await _saveThemePreference();
  }

  /// Set light theme
  Future<void> setLightTheme() async {
    await setThemeMode(ThemeMode.light);
  }

  /// Set dark theme
  Future<void> setDarkTheme() async {
    await setThemeMode(ThemeMode.dark);
  }

  /// Set system theme
  Future<void> setSystemTheme() async {
    await setThemeMode(ThemeMode.system);
  }

  /// Reset theme to system default
  Future<void> resetTheme() async {
    await setThemeMode(ThemeMode.system);
  }
}
