import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:flutter/foundation.dart';

/// Location service for handling GPS and geocoding operations
/// Provides location tracking, permission handling, and address conversion
/// Implements singleton pattern for global access
class LocationService {
  LocationService._();
  static final LocationService _instance = LocationService._();
  static LocationService get instance => _instance;

  bool _isInitialized = false;
  Position? _lastKnownPosition;

  /// Check if service is initialized
  bool get isInitialized => _isInitialized;

  /// Get last known position
  Position? get lastKnownPosition => _lastKnownPosition;

  /// Initialize location service
  Future<void> initialize() async {
    if (_isInitialized) {
      debugPrint('LocationService already initialized');
      return;
    }

    try {
      // Check if location services are enabled
      final serviceEnabled = await isLocationServiceEnabled();
      if (!serviceEnabled) {
        debugPrint('Location services are disabled');
      }

      // Check permission status
      final permission = await checkPermission();
      debugPrint('Location permission status: $permission');

      _isInitialized = true;
      debugPrint('LocationService initialized');
    } catch (e) {
      debugPrint('Error initializing LocationService: $e');
      _isInitialized = true; // Initialize anyway to prevent repeated attempts
    }
  }

  // ==================== PERMISSION MANAGEMENT ====================

  /// Check if location services are enabled on device
  Future<bool> isLocationServiceEnabled() async {
    try {
      return await Geolocator.isLocationServiceEnabled();
    } catch (e) {
      debugPrint('Error checking location service: $e');
      return false;
    }
  }

  /// Check current location permission status
  Future<LocationPermission> checkPermission() async {
    try {
      return await Geolocator.checkPermission();
    } catch (e) {
      debugPrint('Error checking location permission: $e');
      return LocationPermission.denied;
    }
  }

  /// Request location permission
  Future<LocationPermissionResult> requestPermission() async {
    try {
      // Check if location service is enabled
      final serviceEnabled = await isLocationServiceEnabled();
      if (!serviceEnabled) {
        return LocationPermissionResult(
          permission: LocationPermission.denied,
          message: 'Location services are disabled. Please enable location services in device settings.',
          canRequest: false,
        );
      }

      // Check current permission
      LocationPermission permission = await checkPermission();

      if (permission == LocationPermission.denied) {
        // Request permission
        permission = await Geolocator.requestPermission();

        if (permission == LocationPermission.denied) {
          return LocationPermissionResult(
            permission: permission,
            message: 'Location permission denied. Please grant location permission to continue.',
            canRequest: true,
          );
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return LocationPermissionResult(
          permission: permission,
          message: 'Location permission permanently denied. Please enable location permission in app settings.',
          canRequest: false,
        );
      }

      return LocationPermissionResult(
        permission: permission,
        message: 'Location permission granted',
        canRequest: false,
      );
    } catch (e) {
      debugPrint('Error requesting location permission: $e');
      return LocationPermissionResult(
        permission: LocationPermission.denied,
        message: 'Error requesting location permission: $e',
        canRequest: false,
      );
    }
  }

  /// Check if location permission is granted
  Future<bool> hasPermission() async {
    try {
      final permission = await checkPermission();
      return permission == LocationPermission.always ||
          permission == LocationPermission.whileInUse;
    } catch (e) {
      debugPrint('Error checking permission: $e');
      return false;
    }
  }

  /// Open app settings (for permission management)
  Future<bool> openLocationSettings() async {
    try {
      return await Geolocator.openLocationSettings();
    } catch (e) {
      debugPrint('Error opening location settings: $e');
      return false;
    }
  }

  /// Open app settings
  Future<bool> openAppSettings() async {
    try {
      return await Geolocator.openAppSettings();
    } catch (e) {
      debugPrint('Error opening app settings: $e');
      return false;
    }
  }

  // ==================== LOCATION TRACKING ====================

  /// Get current location
  Future<LocationResult> getCurrentLocation({
    LocationAccuracy accuracy = LocationAccuracy.high,
    Duration timeout = const Duration(seconds: 30),
    bool forceAndroidLocationManager = false,
  }) async {
    try {
      // Check if initialized
      if (!_isInitialized) {
        await initialize();
      }

      // Check permission
      final hasPermissionResult = await hasPermission();
      if (!hasPermissionResult) {
        final permissionResult = await requestPermission();
        if (permissionResult.permission != LocationPermission.always &&
            permissionResult.permission != LocationPermission.whileInUse) {
          return LocationResult(
            success: false,
            position: null,
            error: permissionResult.message,
          );
        }
      }

      // Get current position
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: accuracy,
        forceAndroidLocationManager: forceAndroidLocationManager,
        timeLimit: timeout,
      );

      _lastKnownPosition = position;
      debugPrint('Current location: ${position.latitude}, ${position.longitude}');

      return LocationResult(
        success: true,
        position: position,
        error: null,
      );
    } catch (e) {
      debugPrint('Error getting current location: $e');
      return LocationResult(
        success: false,
        position: null,
        error: 'Failed to get current location: $e',
      );
    }
  }

  /// Get last known location (cached)
  Future<Position?> getLastKnownPosition() async {
    try {
      return await Geolocator.getLastKnownPosition();
    } catch (e) {
      debugPrint('Error getting last known position: $e');
      return null;
    }
  }

  /// Stream position updates
  Stream<Position> getPositionStream({
    LocationAccuracy accuracy = LocationAccuracy.high,
    int distanceFilter = 10,
    Duration interval = const Duration(seconds: 5),
    bool forceAndroidLocationManager = false,
  }) {
    final locationSettings = LocationSettings(
      accuracy: accuracy,
      distanceFilter: distanceFilter,
      timeLimit: interval,
    );

    return Geolocator.getPositionStream(
      locationSettings: locationSettings,
    ).handleError((error) {
      debugPrint('Error in position stream: $error');
    });
  }

  /// Calculate distance between two coordinates (in meters)
  double calculateDistance({
    required double startLatitude,
    required double startLongitude,
    required double endLatitude,
    required double endLongitude,
  }) {
    try {
      return Geolocator.distanceBetween(
        startLatitude,
        startLongitude,
        endLatitude,
        endLongitude,
      );
    } catch (e) {
      debugPrint('Error calculating distance: $e');
      return 0.0;
    }
  }

  /// Calculate bearing between two coordinates (in degrees)
  double calculateBearing({
    required double startLatitude,
    required double startLongitude,
    required double endLatitude,
    required double endLongitude,
  }) {
    try {
      return Geolocator.bearingBetween(
        startLatitude,
        startLongitude,
        endLatitude,
        endLongitude,
      );
    } catch (e) {
      debugPrint('Error calculating bearing: $e');
      return 0.0;
    }
  }

  // ==================== GEOCODING ====================

  /// Get address from coordinates (reverse geocoding)
  Future<AddressResult> getAddressFromCoordinates({
    required double latitude,
    required double longitude,
    String? localeIdentifier,
  }) async {
    try {
      final placemarks = await placemarkFromCoordinates(
        latitude,
        longitude,
        localeIdentifier: localeIdentifier,
      );

      if (placemarks.isEmpty) {
        return AddressResult(
          success: false,
          placemarks: [],
          error: 'No address found for the given coordinates',
        );
      }

      debugPrint('Address found: ${placemarks.first.toString()}');

      return AddressResult(
        success: true,
        placemarks: placemarks,
        error: null,
      );
    } catch (e) {
      debugPrint('Error getting address from coordinates: $e');
      return AddressResult(
        success: false,
        placemarks: [],
        error: 'Failed to get address: $e',
      );
    }
  }

  /// Get coordinates from address (forward geocoding)
  Future<CoordinatesResult> getCoordinatesFromAddress(String address) async {
    try {
      final locations = await locationFromAddress(address);

      if (locations.isEmpty) {
        return CoordinatesResult(
          success: false,
          locations: [],
          error: 'No coordinates found for the given address',
        );
      }

      debugPrint('Coordinates found: ${locations.first.latitude}, ${locations.first.longitude}');

      return CoordinatesResult(
        success: true,
        locations: locations,
        error: null,
      );
    } catch (e) {
      debugPrint('Error getting coordinates from address: $e');
      return CoordinatesResult(
        success: false,
        locations: [],
        error: 'Failed to get coordinates: $e',
      );
    }
  }

  /// Format placemark to readable address string
  String formatPlacemarkAddress(Placemark placemark) {
    final parts = <String>[];

    if (placemark.street?.isNotEmpty == true) parts.add(placemark.street!);
    if (placemark.subLocality?.isNotEmpty == true) {
      parts.add(placemark.subLocality!);
    }
    if (placemark.locality?.isNotEmpty == true) parts.add(placemark.locality!);
    if (placemark.administrativeArea?.isNotEmpty == true) {
      parts.add(placemark.administrativeArea!);
    }
    if (placemark.postalCode?.isNotEmpty == true) {
      parts.add(placemark.postalCode!);
    }
    if (placemark.country?.isNotEmpty == true) parts.add(placemark.country!);

    return parts.join(', ');
  }

  /// Get formatted address from coordinates
  Future<String?> getFormattedAddress({
    required double latitude,
    required double longitude,
  }) async {
    try {
      final result = await getAddressFromCoordinates(
        latitude: latitude,
        longitude: longitude,
      );

      if (result.success && result.placemarks.isNotEmpty) {
        return formatPlacemarkAddress(result.placemarks.first);
      }

      return null;
    } catch (e) {
      debugPrint('Error getting formatted address: $e');
      return null;
    }
  }

  // ==================== UTILITY METHODS ====================

  /// Check if coordinate is valid
  bool isValidCoordinate({
    required double latitude,
    required double longitude,
  }) {
    return latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180;
  }

  /// Format distance in human-readable format
  String formatDistance(double distanceInMeters) {
    if (distanceInMeters < 1000) {
      return '${distanceInMeters.toStringAsFixed(0)} m';
    } else {
      final km = distanceInMeters / 1000;
      return '${km.toStringAsFixed(2)} km';
    }
  }

  /// Dispose and cleanup
  void dispose() {
    _isInitialized = false;
    _lastKnownPosition = null;
  }
}

/// Location result wrapper
class LocationResult {
  final bool success;
  final Position? position;
  final String? error;

  LocationResult({
    required this.success,
    required this.position,
    required this.error,
  });

  @override
  String toString() {
    return 'LocationResult(success: $success, position: $position, error: $error)';
  }
}

/// Address result wrapper
class AddressResult {
  final bool success;
  final List<Placemark> placemarks;
  final String? error;

  AddressResult({
    required this.success,
    required this.placemarks,
    required this.error,
  });

  Placemark? get firstPlacemark => placemarks.isNotEmpty ? placemarks.first : null;

  @override
  String toString() {
    return 'AddressResult(success: $success, placemarks: ${placemarks.length}, error: $error)';
  }
}

/// Coordinates result wrapper
class CoordinatesResult {
  final bool success;
  final List<Location> locations;
  final String? error;

  CoordinatesResult({
    required this.success,
    required this.locations,
    required this.error,
  });

  Location? get firstLocation => locations.isNotEmpty ? locations.first : null;

  @override
  String toString() {
    return 'CoordinatesResult(success: $success, locations: ${locations.length}, error: $error)';
  }
}

/// Location permission result wrapper
class LocationPermissionResult {
  final LocationPermission permission;
  final String message;
  final bool canRequest;

  LocationPermissionResult({
    required this.permission,
    required this.message,
    required this.canRequest,
  });

  bool get isGranted =>
      permission == LocationPermission.always ||
      permission == LocationPermission.whileInUse;

  @override
  String toString() {
    return 'LocationPermissionResult(permission: $permission, message: $message, canRequest: $canRequest)';
  }
}
