/// Permission utilities for handling app permissions
library;

import 'package:permission_handler/permission_handler.dart';

class PermissionUtils {
  PermissionUtils._();

  /// Checks if camera permission is granted
  static Future<bool> hasCameraPermission() async {
    final status = await Permission.camera.status;
    return status.isGranted;
  }

  /// Requests camera permission
  static Future<bool> requestCameraPermission() async {
    final status = await Permission.camera.request();
    return status.isGranted;
  }

  /// Checks and requests camera permission if needed
  static Future<bool> checkAndRequestCameraPermission() async {
    if (await hasCameraPermission()) {
      return true;
    }
    return await requestCameraPermission();
  }

  /// Checks if gallery/photos permission is granted
  static Future<bool> hasGalleryPermission() async {
    final status = await Permission.photos.status;
    return status.isGranted;
  }

  /// Requests gallery/photos permission
  static Future<bool> requestGalleryPermission() async {
    final status = await Permission.photos.request();
    return status.isGranted;
  }

  /// Checks and requests gallery permission if needed
  static Future<bool> checkAndRequestGalleryPermission() async {
    if (await hasGalleryPermission()) {
      return true;
    }
    return await requestGalleryPermission();
  }

  /// Checks if storage permission is granted
  static Future<bool> hasStoragePermission() async {
    final status = await Permission.storage.status;
    return status.isGranted;
  }

  /// Requests storage permission
  static Future<bool> requestStoragePermission() async {
    final status = await Permission.storage.request();
    return status.isGranted;
  }

  /// Checks and requests storage permission if needed
  static Future<bool> checkAndRequestStoragePermission() async {
    if (await hasStoragePermission()) {
      return true;
    }
    return await requestStoragePermission();
  }

  /// Checks if location permission is granted
  static Future<bool> hasLocationPermission() async {
    final status = await Permission.location.status;
    return status.isGranted;
  }

  /// Requests location permission
  static Future<bool> requestLocationPermission() async {
    final status = await Permission.location.request();
    return status.isGranted;
  }

  /// Checks and requests location permission if needed
  static Future<bool> checkAndRequestLocationPermission() async {
    if (await hasLocationPermission()) {
      return true;
    }
    return await requestLocationPermission();
  }

  /// Checks if location when in use permission is granted
  static Future<bool> hasLocationWhenInUsePermission() async {
    final status = await Permission.locationWhenInUse.status;
    return status.isGranted;
  }

  /// Requests location when in use permission
  static Future<bool> requestLocationWhenInUsePermission() async {
    final status = await Permission.locationWhenInUse.request();
    return status.isGranted;
  }

  /// Checks if location always permission is granted
  static Future<bool> hasLocationAlwaysPermission() async {
    final status = await Permission.locationAlways.status;
    return status.isGranted;
  }

  /// Requests location always permission
  static Future<bool> requestLocationAlwaysPermission() async {
    final status = await Permission.locationAlways.request();
    return status.isGranted;
  }

  /// Checks if notification permission is granted
  static Future<bool> hasNotificationPermission() async {
    final status = await Permission.notification.status;
    return status.isGranted;
  }

  /// Requests notification permission
  static Future<bool> requestNotificationPermission() async {
    final status = await Permission.notification.request();
    return status.isGranted;
  }

  /// Checks and requests notification permission if needed
  static Future<bool> checkAndRequestNotificationPermission() async {
    if (await hasNotificationPermission()) {
      return true;
    }
    return await requestNotificationPermission();
  }

  /// Checks if microphone permission is granted
  static Future<bool> hasMicrophonePermission() async {
    final status = await Permission.microphone.status;
    return status.isGranted;
  }

  /// Requests microphone permission
  static Future<bool> requestMicrophonePermission() async {
    final status = await Permission.microphone.request();
    return status.isGranted;
  }

  /// Checks and requests microphone permission if needed
  static Future<bool> checkAndRequestMicrophonePermission() async {
    if (await hasMicrophonePermission()) {
      return true;
    }
    return await requestMicrophonePermission();
  }

  /// Checks if contacts permission is granted
  static Future<bool> hasContactsPermission() async {
    final status = await Permission.contacts.status;
    return status.isGranted;
  }

  /// Requests contacts permission
  static Future<bool> requestContactsPermission() async {
    final status = await Permission.contacts.request();
    return status.isGranted;
  }

  /// Checks and requests contacts permission if needed
  static Future<bool> checkAndRequestContactsPermission() async {
    if (await hasContactsPermission()) {
      return true;
    }
    return await requestContactsPermission();
  }

  /// Checks if calendar permission is granted
  static Future<bool> hasCalendarPermission() async {
    final status = await Permission.calendar.status;
    return status.isGranted;
  }

  /// Requests calendar permission
  static Future<bool> requestCalendarPermission() async {
    final status = await Permission.calendar.request();
    return status.isGranted;
  }

  /// Checks if media library permission is granted
  static Future<bool> hasMediaLibraryPermission() async {
    final status = await Permission.mediaLibrary.status;
    return status.isGranted;
  }

  /// Requests media library permission
  static Future<bool> requestMediaLibraryPermission() async {
    final status = await Permission.mediaLibrary.request();
    return status.isGranted;
  }

  /// Opens app settings page
  static Future<bool> openAppSettings() async {
    return await openAppSettings();
  }

  /// Checks permission status
  static Future<PermissionStatus> getPermissionStatus(
    Permission permission,
  ) async {
    return await permission.status;
  }

  /// Requests multiple permissions at once
  static Future<Map<Permission, PermissionStatus>> requestMultiplePermissions(
    List<Permission> permissions,
  ) async {
    return await permissions.request();
  }

  /// Checks if permission is permanently denied
  static Future<bool> isPermissionPermanentlyDenied(
    Permission permission,
  ) async {
    final status = await permission.status;
    return status.isPermanentlyDenied;
  }

  /// Checks if permission is denied
  static Future<bool> isPermissionDenied(Permission permission) async {
    final status = await permission.status;
    return status.isDenied;
  }

  /// Checks if permission is restricted
  static Future<bool> isPermissionRestricted(Permission permission) async {
    final status = await permission.status;
    return status.isRestricted;
  }

  /// Checks if permission is limited (iOS 14+)
  static Future<bool> isPermissionLimited(Permission permission) async {
    final status = await permission.status;
    return status.isLimited;
  }

  /// Shows permission dialog with explanation
  static Future<bool> showPermissionDialog({
    required Permission permission,
    required String title,
    required String message,
  }) async {
    final status = await permission.status;

    if (status.isGranted) {
      return true;
    }

    if (status.isPermanentlyDenied) {
      // Show dialog to open settings
      return false;
    }

    // Request permission
    final result = await permission.request();
    return result.isGranted;
  }

  /// Handles permission result with retry option
  static Future<bool> handlePermissionResult({
    required Permission permission,
    required Function() onGranted,
    required Function() onDenied,
    required Function() onPermanentlyDenied,
  }) async {
    final status = await permission.status;

    if (status.isGranted) {
      onGranted();
      return true;
    } else if (status.isPermanentlyDenied) {
      onPermanentlyDenied();
      return false;
    } else {
      final result = await permission.request();
      if (result.isGranted) {
        onGranted();
        return true;
      } else {
        onDenied();
        return false;
      }
    }
  }

  /// Requests camera and microphone permissions for video recording
  static Future<bool> requestVideoRecordingPermissions() async {
    final permissions = await [
      Permission.camera,
      Permission.microphone,
    ].request();

    return permissions[Permission.camera]!.isGranted &&
        permissions[Permission.microphone]!.isGranted;
  }

  /// Requests photo library permissions
  static Future<bool> requestPhotoLibraryPermissions() async {
    final status = await Permission.photos.request();
    return status.isGranted;
  }

  /// Requests file access permissions
  static Future<bool> requestFileAccessPermissions() async {
    final permissions = await [
      Permission.storage,
      Permission.manageExternalStorage,
    ].request();

    return permissions[Permission.storage]!.isGranted ||
        permissions[Permission.manageExternalStorage]!.isGranted;
  }

  /// Checks all required permissions for the app
  static Future<Map<String, bool>> checkAllPermissions() async {
    return {
      'camera': await hasCameraPermission(),
      'gallery': await hasGalleryPermission(),
      'storage': await hasStoragePermission(),
      'location': await hasLocationPermission(),
      'notification': await hasNotificationPermission(),
      'microphone': await hasMicrophonePermission(),
    };
  }

  /// Requests all required permissions for the app
  static Future<Map<String, bool>> requestAllPermissions() async {
    final permissions = await [
      Permission.camera,
      Permission.photos,
      Permission.storage,
      Permission.location,
      Permission.notification,
      Permission.microphone,
    ].request();

    return {
      'camera': permissions[Permission.camera]?.isGranted ?? false,
      'gallery': permissions[Permission.photos]?.isGranted ?? false,
      'storage': permissions[Permission.storage]?.isGranted ?? false,
      'location': permissions[Permission.location]?.isGranted ?? false,
      'notification': permissions[Permission.notification]?.isGranted ?? false,
      'microphone': permissions[Permission.microphone]?.isGranted ?? false,
    };
  }

  /// Checks if app can request permissions
  static Future<bool> canRequestPermission(Permission permission) async {
    final status = await permission.status;
    return !status.isPermanentlyDenied && !status.isRestricted;
  }

  /// Gets permission status as string
  static Future<String> getPermissionStatusString(
    Permission permission,
  ) async {
    final status = await permission.status;

    if (status.isGranted) return 'Granted';
    if (status.isDenied) return 'Denied';
    if (status.isPermanentlyDenied) return 'Permanently Denied';
    if (status.isRestricted) return 'Restricted';
    if (status.isLimited) return 'Limited';

    return 'Unknown';
  }
}
