import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'dart:async';
import 'dart:io';

/// Connectivity service for monitoring network status
/// Provides real-time network connectivity information and stream updates
/// Implements singleton pattern for global access
class ConnectivityService {
  ConnectivityService._();
  static final ConnectivityService _instance = ConnectivityService._();
  static ConnectivityService get instance => _instance;

  final Connectivity _connectivity = Connectivity();

  bool _isInitialized = false;
  List<ConnectivityResult> _currentStatus = [ConnectivityResult.none];
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;

  /// Stream controller for connectivity changes
  final StreamController<ConnectivityStatus> _statusController =
      StreamController<ConnectivityStatus>.broadcast();

  /// Callback for connectivity changes
  Function(ConnectivityStatus)? onConnectivityChanged;

  /// Check if service is initialized
  bool get isInitialized => _isInitialized;

  /// Get current connectivity status
  List<ConnectivityResult> get currentStatus => _currentStatus;

  /// Stream of connectivity status changes
  Stream<ConnectivityStatus> get statusStream => _statusController.stream;

  /// Initialize connectivity service
  Future<void> initialize() async {
    if (_isInitialized) {
      debugPrint('ConnectivityService already initialized');
      return;
    }

    try {
      // Get initial connectivity status
      _currentStatus = await _connectivity.checkConnectivity();
      debugPrint('Initial connectivity status: $_currentStatus');

      // Setup connectivity stream listener
      _setupConnectivityListener();

      _isInitialized = true;
      debugPrint('ConnectivityService initialized successfully');
    } catch (e) {
      debugPrint('Error initializing ConnectivityService: $e');
      _isInitialized = true; // Initialize anyway to prevent repeated attempts
    }
  }

  /// Setup connectivity change listener
  void _setupConnectivityListener() {
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen(
      (List<ConnectivityResult> results) {
        _currentStatus = results;
        debugPrint('Connectivity changed: $results');

        final status = _mapConnectivityResults(results);
        _statusController.add(status);
        onConnectivityChanged?.call(status);
      },
      onError: (error) {
        debugPrint('Error in connectivity stream: $error');
      },
    );
  }

  /// Map connectivity results to status
  ConnectivityStatus _mapConnectivityResults(List<ConnectivityResult> results) {
    if (results.isEmpty || results.contains(ConnectivityResult.none)) {
      return ConnectivityStatus(
        isConnected: false,
        connectionType: NetworkType.none,
        results: results,
      );
    }

    // Determine primary connection type
    NetworkType type = NetworkType.none;
    if (results.contains(ConnectivityResult.wifi)) {
      type = NetworkType.wifi;
    } else if (results.contains(ConnectivityResult.mobile)) {
      type = NetworkType.mobile;
    } else if (results.contains(ConnectivityResult.ethernet)) {
      type = NetworkType.ethernet;
    } else if (results.contains(ConnectivityResult.vpn)) {
      type = NetworkType.vpn;
    } else if (results.contains(ConnectivityResult.bluetooth)) {
      type = NetworkType.bluetooth;
    } else if (results.contains(ConnectivityResult.other)) {
      type = NetworkType.other;
    }

    return ConnectivityStatus(
      isConnected: type != NetworkType.none,
      connectionType: type,
      results: results,
    );
  }

  // ==================== CONNECTIVITY CHECKS ====================

  /// Check current connectivity status
  Future<ConnectivityStatus> checkConnectivity() async {
    try {
      if (!_isInitialized) {
        await initialize();
      }

      final results = await _connectivity.checkConnectivity();
      _currentStatus = results;

      final status = _mapConnectivityResults(results);
      debugPrint('Current connectivity: ${status.connectionType}');

      return status;
    } catch (e) {
      debugPrint('Error checking connectivity: $e');
      return ConnectivityStatus(
        isConnected: false,
        connectionType: NetworkType.none,
        results: [ConnectivityResult.none],
      );
    }
  }

  /// Check if device has internet connection
  Future<bool> hasConnection() async {
    try {
      final status = await checkConnectivity();
      return status.isConnected;
    } catch (e) {
      debugPrint('Error checking connection: $e');
      return false;
    }
  }

  /// Check if connected to WiFi
  Future<bool> isWifiConnected() async {
    try {
      final status = await checkConnectivity();
      return status.connectionType == NetworkType.wifi;
    } catch (e) {
      debugPrint('Error checking WiFi: $e');
      return false;
    }
  }

  /// Check if connected to mobile network
  Future<bool> isMobileConnected() async {
    try {
      final status = await checkConnectivity();
      return status.connectionType == NetworkType.mobile;
    } catch (e) {
      debugPrint('Error checking mobile: $e');
      return false;
    }
  }

  /// Check if connected to ethernet
  Future<bool> isEthernetConnected() async {
    try {
      final status = await checkConnectivity();
      return status.connectionType == NetworkType.ethernet;
    } catch (e) {
      debugPrint('Error checking ethernet: $e');
      return false;
    }
  }

  // ==================== INTERNET CONNECTIVITY ====================

  /// Check actual internet connectivity (not just network connection)
  /// This performs a real network request to verify internet access
  Future<InternetStatus> checkInternetConnection({
    String testUrl = 'https://www.google.com',
    Duration timeout = const Duration(seconds: 10),
  }) async {
    try {
      // First check network connectivity
      final networkStatus = await checkConnectivity();
      if (!networkStatus.isConnected) {
        return InternetStatus(
          isConnected: false,
          hasInternet: false,
          latency: null,
          error: 'No network connection',
        );
      }

      // Perform actual internet check
      final stopwatch = Stopwatch()..start();

      final result = await InternetAddress.lookup(
        testUrl.replaceAll(RegExp(r'https?://'), '').split('/').first,
      ).timeout(timeout);

      stopwatch.stop();

      if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
        debugPrint('Internet connection verified - Latency: ${stopwatch.elapsedMilliseconds}ms');
        return InternetStatus(
          isConnected: true,
          hasInternet: true,
          latency: stopwatch.elapsedMilliseconds,
          error: null,
        );
      } else {
        return InternetStatus(
          isConnected: true,
          hasInternet: false,
          latency: null,
          error: 'Unable to verify internet connection',
        );
      }
    } on SocketException catch (e) {
      debugPrint('Socket exception checking internet: $e');
      return InternetStatus(
        isConnected: true,
        hasInternet: false,
        latency: null,
        error: 'No internet access: ${e.message}',
      );
    } on TimeoutException catch (e) {
      debugPrint('Timeout checking internet: $e');
      return InternetStatus(
        isConnected: true,
        hasInternet: false,
        latency: null,
        error: 'Connection timeout',
      );
    } catch (e) {
      debugPrint('Error checking internet connection: $e');
      return InternetStatus(
        isConnected: false,
        hasInternet: false,
        latency: null,
        error: 'Error checking internet: $e',
      );
    }
  }

  /// Measure connection speed (approximate)
  /// Downloads a test file and measures the speed
  Future<ConnectionSpeed> measureConnectionSpeed({
    String testUrl = 'https://www.google.com',
    Duration timeout = const Duration(seconds: 30),
  }) async {
    try {
      final stopwatch = Stopwatch()..start();

      final request = await HttpClient().getUrl(Uri.parse(testUrl));
      final response = await request.close().timeout(timeout);

      int downloadedBytes = 0;
      await for (var data in response) {
        downloadedBytes += data.length;
      }

      stopwatch.stop();

      final seconds = stopwatch.elapsedMilliseconds / 1000;
      final mbps = (downloadedBytes * 8) / (seconds * 1000000);

      debugPrint('Connection speed: ${mbps.toStringAsFixed(2)} Mbps');

      // Determine speed category
      SpeedCategory category;
      if (mbps < 1) {
        category = SpeedCategory.slow;
      } else if (mbps < 5) {
        category = SpeedCategory.moderate;
      } else if (mbps < 20) {
        category = SpeedCategory.fast;
      } else {
        category = SpeedCategory.veryFast;
      }

      return ConnectionSpeed(
        speedMbps: mbps,
        downloadedBytes: downloadedBytes,
        timeMs: stopwatch.elapsedMilliseconds,
        category: category,
      );
    } catch (e) {
      debugPrint('Error measuring connection speed: $e');
      return ConnectionSpeed(
        speedMbps: 0,
        downloadedBytes: 0,
        timeMs: 0,
        category: SpeedCategory.unknown,
      );
    }
  }

  // ==================== UTILITY METHODS ====================

  /// Get network type name
  String getNetworkTypeName(NetworkType type) {
    switch (type) {
      case NetworkType.wifi:
        return 'WiFi';
      case NetworkType.mobile:
        return 'Mobile Data';
      case NetworkType.ethernet:
        return 'Ethernet';
      case NetworkType.vpn:
        return 'VPN';
      case NetworkType.bluetooth:
        return 'Bluetooth';
      case NetworkType.other:
        return 'Other';
      case NetworkType.none:
        return 'No Connection';
    }
  }

  /// Get current network type name
  Future<String> getCurrentNetworkTypeName() async {
    final status = await checkConnectivity();
    return getNetworkTypeName(status.connectionType);
  }

  /// Format connection speed
  String formatSpeed(double mbps) {
    if (mbps < 1) {
      return '${(mbps * 1000).toStringAsFixed(0)} Kbps';
    } else {
      return '${mbps.toStringAsFixed(2)} Mbps';
    }
  }

  /// Get speed category name
  String getSpeedCategoryName(SpeedCategory category) {
    switch (category) {
      case SpeedCategory.veryFast:
        return 'Very Fast';
      case SpeedCategory.fast:
        return 'Fast';
      case SpeedCategory.moderate:
        return 'Moderate';
      case SpeedCategory.slow:
        return 'Slow';
      case SpeedCategory.unknown:
        return 'Unknown';
    }
  }

  /// Wait for internet connection
  /// Returns true when internet is available or false if timeout
  Future<bool> waitForConnection({
    Duration timeout = const Duration(seconds: 30),
    Duration checkInterval = const Duration(seconds: 2),
  }) async {
    try {
      final endTime = DateTime.now().add(timeout);

      while (DateTime.now().isBefore(endTime)) {
        final status = await checkInternetConnection();
        if (status.hasInternet) {
          debugPrint('Internet connection established');
          return true;
        }

        await Future.delayed(checkInterval);
      }

      debugPrint('Timeout waiting for internet connection');
      return false;
    } catch (e) {
      debugPrint('Error waiting for connection: $e');
      return false;
    }
  }

  /// Execute action when connected to internet
  Future<T?> executeWhenConnected<T>({
    required Future<T> Function() action,
    Duration timeout = const Duration(seconds: 30),
    Function(String)? onError,
  }) async {
    try {
      // Check internet connection
      final status = await checkInternetConnection();

      if (!status.hasInternet) {
        // Wait for connection
        final connected = await waitForConnection(timeout: timeout);

        if (!connected) {
          const error = 'No internet connection available';
          onError?.call(error);
          debugPrint(error);
          return null;
        }
      }

      // Execute action
      return await action();
    } catch (e) {
      final error = 'Error executing action: $e';
      onError?.call(error);
      debugPrint(error);
      return null;
    }
  }

  // ==================== DISPOSE ====================

  /// Dispose and cleanup
  Future<void> dispose() async {
    await _connectivitySubscription?.cancel();
    await _statusController.close();
    _isInitialized = false;
    debugPrint('ConnectivityService disposed');
  }
}

/// Connectivity status wrapper
class ConnectivityStatus {
  final bool isConnected;
  final NetworkType connectionType;
  final List<ConnectivityResult> results;

  ConnectivityStatus({
    required this.isConnected,
    required this.connectionType,
    required this.results,
  });

  @override
  String toString() {
    return 'ConnectivityStatus(isConnected: $isConnected, type: $connectionType)';
  }
}

/// Internet connection status
class InternetStatus {
  final bool isConnected;
  final bool hasInternet;
  final int? latency;
  final String? error;

  InternetStatus({
    required this.isConnected,
    required this.hasInternet,
    required this.latency,
    required this.error,
  });

  @override
  String toString() {
    return 'InternetStatus(connected: $isConnected, internet: $hasInternet, latency: ${latency}ms)';
  }
}

/// Connection speed measurement
class ConnectionSpeed {
  final double speedMbps;
  final int downloadedBytes;
  final int timeMs;
  final SpeedCategory category;

  ConnectionSpeed({
    required this.speedMbps,
    required this.downloadedBytes,
    required this.timeMs,
    required this.category,
  });

  @override
  String toString() {
    return 'ConnectionSpeed(speed: ${speedMbps.toStringAsFixed(2)} Mbps, category: $category)';
  }
}

/// Network type enum
enum NetworkType {
  wifi,
  mobile,
  ethernet,
  vpn,
  bluetooth,
  other,
  none,
}

/// Speed category enum
enum SpeedCategory {
  veryFast, // > 20 Mbps
  fast, // 5-20 Mbps
  moderate, // 1-5 Mbps
  slow, // < 1 Mbps
  unknown,
}
