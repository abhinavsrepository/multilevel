
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:package_info_plus/package_info_plus.dart';

/// API Interceptor for handling authentication, token refresh, and device info
class ApiInterceptor extends Interceptor {
  final Dio _dio;
  final FlutterSecureStorage _secureStorage;
  final String _refreshTokenEndpoint;

  // Token storage keys
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';

  // Device info cache
  String? _deviceInfo;
  String? _appVersion;

  // Retry configuration
  static const int _maxRetries = 3;
  static const Duration _retryDelay = Duration(seconds: 1);

  // Flag to prevent multiple simultaneous token refresh requests
  bool _isRefreshing = false;
  final List<RequestOptions> _requestsQueue = [];

  ApiInterceptor({
    required Dio dio,
    FlutterSecureStorage? secureStorage,
    String refreshTokenEndpoint = '/auth/refresh-token',
  })  : _dio = dio,
        _secureStorage = secureStorage ?? const FlutterSecureStorage(),
        _refreshTokenEndpoint = refreshTokenEndpoint {
    _initializeDeviceInfo();
  }

  /// Initialize device information
  Future<void> _initializeDeviceInfo() async {
    try {
      final deviceInfo = DeviceInfoPlugin();
      final packageInfo = await PackageInfo.fromPlatform();

      _appVersion = '${packageInfo.version}+${packageInfo.buildNumber}';

      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
        final androidInfo = await deviceInfo.androidInfo;
        _deviceInfo = '${androidInfo.manufacturer} ${androidInfo.model} '
            '(Android ${androidInfo.version.release})';
      } else if (!kIsWeb && defaultTargetPlatform == TargetPlatform.iOS) {
        final iosInfo = await deviceInfo.iosInfo;
        _deviceInfo = '${iosInfo.name} ${iosInfo.model} '
            '(iOS ${iosInfo.systemVersion})';
      } else {
        _deviceInfo = kIsWeb ? 'Web' : defaultTargetPlatform.toString();
      }
    } catch (e) {
      debugPrint('Failed to get device info: $e');
      _deviceInfo = 'Unknown Device';
      _appVersion = '1.0.0';
    }
  }

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    try {
      // Add authorization token
      final accessToken = await _secureStorage.read(key: _accessTokenKey);
      if (accessToken != null && accessToken.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $accessToken';
      }

      // Add device information headers
      if (_deviceInfo != null) {
        options.headers['X-Device-Info'] = _deviceInfo;
      }
      if (_appVersion != null) {
        options.headers['X-App-Version'] = _appVersion;
      }

      // Add platform header
      options.headers['X-Platform'] = kIsWeb ? 'Web' : defaultTargetPlatform.toString();

      // Add common headers
      options.headers['Accept'] = 'application/json';
      options.headers['Content-Type'] = 'application/json';

      debugPrint('REQUEST[${options.method}] => PATH: ${options.path}');
      debugPrint('REQUEST HEADERS: ${options.headers}');

      handler.next(options);
    } catch (e) {
      debugPrint('Error in request interceptor: $e');
      handler.next(options);
    }
  }

  @override
  Future<void> onResponse(
    Response response,
    ResponseInterceptorHandler handler,
  ) async {
    debugPrint(
      'RESPONSE[${response.statusCode}] => PATH: ${response.requestOptions.path}',
    );

    handler.next(response);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    debugPrint(
      'ERROR[${err.response?.statusCode}] => PATH: ${err.requestOptions.path}',
    );

    // Handle 401 Unauthorized - Token refresh
    if (err.response?.statusCode == 401) {
      final isRefreshed = await _handleTokenRefresh(err.requestOptions);

      if (isRefreshed) {
        // Retry the original request with new token
        try {
          final response = await _retryRequest(err.requestOptions);
          handler.resolve(response);
          return;
        } catch (e) {
          debugPrint('Error retrying request after token refresh: $e');
          handler.reject(err);
          return;
        }
      } else {
        // Token refresh failed - clear tokens and reject
        await _clearTokens();
        handler.reject(err);
        return;
      }
    }

    // Handle network errors with retry mechanism
    if (_shouldRetry(err)) {
      final retryCount = err.requestOptions.extra['retry_count'] as int? ?? 0;

      if (retryCount < _maxRetries) {
        debugPrint(
          'Retrying request (${retryCount + 1}/$_maxRetries) after error: ${err.message}',
        );

        await Future.delayed(_retryDelay * (retryCount + 1));

        try {
          final options = err.requestOptions;
          options.extra['retry_count'] = retryCount + 1;

          final response = await _retryRequest(options);
          handler.resolve(response);
          return;
        } catch (e) {
          debugPrint('Retry failed: $e');
        }
      }
    }

    handler.next(err);
  }

  /// Handle token refresh logic
  Future<bool> _handleTokenRefresh(RequestOptions failedRequest) async {
    try {
      // If already refreshing, queue the request
      if (_isRefreshing) {
        _requestsQueue.add(failedRequest);
        return false;
      }

      _isRefreshing = true;

      final refreshToken = await _secureStorage.read(key: _refreshTokenKey);

      if (refreshToken == null || refreshToken.isEmpty) {
        debugPrint('No refresh token available');
        _isRefreshing = false;
        return false;
      }

      debugPrint('Attempting to refresh access token...');

      // Create a new Dio instance to avoid interceptor loops
      final tokenDio = Dio(_dio.options);

      final response = await tokenDio.post(
        _refreshTokenEndpoint,
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final newAccessToken = response.data['accessToken'] as String?;
        final newRefreshToken = response.data['refreshToken'] as String?;

        if (newAccessToken != null) {
          // Save new tokens
          await _secureStorage.write(
            key: _accessTokenKey,
            value: newAccessToken,
          );

          if (newRefreshToken != null) {
            await _secureStorage.write(
              key: _refreshTokenKey,
              value: newRefreshToken,
            );
          }

          debugPrint('Token refreshed successfully');

          _isRefreshing = false;

          // Process queued requests
          await _processQueuedRequests();

          return true;
        }
      }

      debugPrint('Token refresh failed: Invalid response');
      _isRefreshing = false;
      return false;
    } catch (e) {
      debugPrint('Token refresh error: $e');
      _isRefreshing = false;
      _requestsQueue.clear();
      return false;
    }
  }

  /// Process queued requests after successful token refresh
  Future<void> _processQueuedRequests() async {
    if (_requestsQueue.isEmpty) return;

    debugPrint('Processing ${_requestsQueue.length} queued requests');

    final queueCopy = List<RequestOptions>.from(_requestsQueue);
    _requestsQueue.clear();

    for (final options in queueCopy) {
      try {
        await _retryRequest(options);
      } catch (e) {
        debugPrint('Error processing queued request: $e');
      }
    }
  }

  /// Retry a request with updated token
  Future<Response> _retryRequest(RequestOptions requestOptions) async {
    // Get fresh token
    final accessToken = await _secureStorage.read(key: _accessTokenKey);

    if (accessToken != null) {
      requestOptions.headers['Authorization'] = 'Bearer $accessToken';
    }

    final options = Options(
      method: requestOptions.method,
      headers: requestOptions.headers,
    );

    return _dio.request(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
    );
  }

  /// Determine if request should be retried
  bool _shouldRetry(DioException err) {
    // Retry on network errors
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.connectionError) {
      return true;
    }

    // Retry on specific server errors (502, 503, 504)
    if (err.response?.statusCode != null) {
      final statusCode = err.response!.statusCode!;
      return statusCode == 502 || statusCode == 503 || statusCode == 504;
    }

    return false;
  }

  /// Clear stored tokens
  Future<void> _clearTokens() async {
    try {
      await _secureStorage.delete(key: _accessTokenKey);
      await _secureStorage.delete(key: _refreshTokenKey);
      debugPrint('Tokens cleared');
    } catch (e) {
      debugPrint('Error clearing tokens: $e');
    }
  }

  /// Save authentication tokens
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    try {
      await _secureStorage.write(key: _accessTokenKey, value: accessToken);
      await _secureStorage.write(key: _refreshTokenKey, value: refreshToken);
      debugPrint('Tokens saved successfully');
    } catch (e) {
      debugPrint('Error saving tokens: $e');
      rethrow;
    }
  }

  /// Get access token
  Future<String?> getAccessToken() async {
    return await _secureStorage.read(key: _accessTokenKey);
  }

  /// Get refresh token
  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: _refreshTokenKey);
  }

  /// Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final accessToken = await getAccessToken();
    return accessToken != null && accessToken.isNotEmpty;
  }

  /// Logout - clear all tokens
  Future<void> logout() async {
    await _clearTokens();
    _requestsQueue.clear();
    _isRefreshing = false;
  }

  /// Set authentication token (alias for saveTokens with single token)
  Future<void> setToken(String accessToken, [String? refreshToken]) async {
    try {
      await _secureStorage.write(key: _accessTokenKey, value: accessToken);
      if (refreshToken != null) {
        await _secureStorage.write(key: _refreshTokenKey, value: refreshToken);
      }
      debugPrint('Token set successfully');
    } catch (e) {
      debugPrint('Error setting token: $e');
      rethrow;
    }
  }

  /// Clear authentication token (alias for _clearTokens)
  Future<void> clearToken() async {
    await _clearTokens();
  }
}
