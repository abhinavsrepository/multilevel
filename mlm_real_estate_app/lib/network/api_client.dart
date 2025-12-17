import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import '../config/api_config.dart';
import 'api_error.dart';
import 'api_interceptor.dart';

/// Singleton API client for handling all HTTP requests
class ApiClient {
  // Singleton instance
  static ApiClient? _instance;
  static ApiClient get instance {
    _instance ??= ApiClient._internal();
    return _instance!;
  }

  // Dio instance
  late final Dio _dio;

  // API Interceptor
  late final ApiInterceptor _apiInterceptor;

  // Private constructor
  ApiClient._internal() {
    _dio = Dio(_baseOptions);
    _apiInterceptor = ApiInterceptor(dio: _dio);
    _setupInterceptors();
  }

  /// Base options for Dio
  BaseOptions get _baseOptions => BaseOptions(
        baseUrl: ApiConfig.getBaseUrl(),
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        sendTimeout: const Duration(seconds: 30),
        validateStatus: (status) {
          // Accept all status codes to handle errors in interceptor
          return status != null && status < 500;
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      );

  /// Setup interceptors
  void _setupInterceptors() {
    _dio.interceptors.clear();

    // Add API interceptor (must be first)
    _dio.interceptors.add(_apiInterceptor);

    // Add pretty logger only in debug mode
    if (kDebugMode) {
      _dio.interceptors.add(
        PrettyDioLogger(
          requestHeader: true,
          requestBody: true,
          responseBody: true,
          responseHeader: false,
          error: true,
          compact: true,
          maxWidth: 90,
        ),
      );
    }
  }

  /// Get API Interceptor instance for token management
  ApiInterceptor get interceptor => _apiInterceptor;

  // ==================== GET Request ====================

  /// Perform GET request
  ///
  /// [endpoint] - API endpoint (e.g., '/users')
  /// [queryParameters] - Query parameters as Map
  /// [options] - Additional request options
  ///
  /// Returns parsed response data
  /// Throws [ApiError] on failure
  Future<T> get<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onReceiveProgress,
  }) async {
    try {
      final response = await _dio.get<T>(
        endpoint,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onReceiveProgress: onReceiveProgress,
      );

      return _handleResponse<T>(response);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    } catch (e) {
      throw ApiError(
        message: 'Unexpected error: ${e.toString()}',
        type: ApiErrorType.unknown,
        originalError: e,
      );
    }
  }

  // ==================== POST Request ====================

  /// Perform POST request
  ///
  /// [endpoint] - API endpoint (e.g., '/users')
  /// [data] - Request body data
  /// [queryParameters] - Query parameters as Map
  /// [options] - Additional request options
  ///
  /// Returns parsed response data
  /// Throws [ApiError] on failure
  Future<T> post<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    try {
      final response = await _dio.post<T>(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
        onReceiveProgress: onReceiveProgress,
      );

      return _handleResponse<T>(response);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    } catch (e) {
      throw ApiError(
        message: 'Unexpected error: ${e.toString()}',
        type: ApiErrorType.unknown,
        originalError: e,
      );
    }
  }

  // ==================== PUT Request ====================

  /// Perform PUT request
  ///
  /// [endpoint] - API endpoint (e.g., '/users/123')
  /// [data] - Request body data
  /// [queryParameters] - Query parameters as Map
  /// [options] - Additional request options
  ///
  /// Returns parsed response data
  /// Throws [ApiError] on failure
  Future<T> put<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    try {
      final response = await _dio.put<T>(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
        onReceiveProgress: onReceiveProgress,
      );

      return _handleResponse<T>(response);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    } catch (e) {
      throw ApiError(
        message: 'Unexpected error: ${e.toString()}',
        type: ApiErrorType.unknown,
        originalError: e,
      );
    }
  }

  // ==================== PATCH Request ====================

  /// Perform PATCH request
  ///
  /// [endpoint] - API endpoint (e.g., '/users/123')
  /// [data] - Request body data
  /// [queryParameters] - Query parameters as Map
  /// [options] - Additional request options
  ///
  /// Returns parsed response data
  /// Throws [ApiError] on failure
  Future<T> patch<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    try {
      final response = await _dio.patch<T>(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
        onReceiveProgress: onReceiveProgress,
      );

      return _handleResponse<T>(response);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    } catch (e) {
      throw ApiError(
        message: 'Unexpected error: ${e.toString()}',
        type: ApiErrorType.unknown,
        originalError: e,
      );
    }
  }

  // ==================== DELETE Request ====================

  /// Perform DELETE request
  ///
  /// [endpoint] - API endpoint (e.g., '/users/123')
  /// [data] - Optional request body data
  /// [queryParameters] - Query parameters as Map
  /// [options] - Additional request options
  ///
  /// Returns parsed response data
  /// Throws [ApiError] on failure
  Future<T> delete<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _dio.delete<T>(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );

      return _handleResponse<T>(response);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    } catch (e) {
      throw ApiError(
        message: 'Unexpected error: ${e.toString()}',
        type: ApiErrorType.unknown,
        originalError: e,
      );
    }
  }

  // ==================== File Upload ====================

  /// Upload single file
  ///
  /// [endpoint] - API endpoint (e.g., '/upload')
  /// [file] - File to upload
  /// [fieldName] - Form field name for the file (default: 'file')
  /// [data] - Additional form data
  /// [onSendProgress] - Upload progress callback
  ///
  /// Returns parsed response data
  /// Throws [ApiError] on failure
  Future<T> uploadFile<T>(
    String endpoint, {
    required File file,
    String fieldName = 'file',
    Map<String, dynamic>? data,
    ProgressCallback? onSendProgress,
    CancelToken? cancelToken,
  }) async {
    try {
      final fileName = file.path.split('/').last;
      final formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(
          file.path,
          filename: fileName,
        ),
        if (data != null) ...data,
      });

      final response = await _dio.post<T>(
        endpoint,
        data: formData,
        onSendProgress: onSendProgress,
        cancelToken: cancelToken,
        options: Options(
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        ),
      );

      return _handleResponse<T>(response);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    } catch (e) {
      throw ApiError(
        message: 'File upload failed: ${e.toString()}',
        type: ApiErrorType.unknown,
        originalError: e,
      );
    }
  }

  /// Upload multiple files
  ///
  /// [endpoint] - API endpoint (e.g., '/upload-multiple')
  /// [files] - List of files to upload
  /// [fieldName] - Form field name for files (default: 'files')
  /// [data] - Additional form data
  /// [onSendProgress] - Upload progress callback
  ///
  /// Returns parsed response data
  /// Throws [ApiError] on failure
  Future<T> uploadMultipleFiles<T>(
    String endpoint, {
    required List<File> files,
    String fieldName = 'files',
    Map<String, dynamic>? data,
    ProgressCallback? onSendProgress,
    CancelToken? cancelToken,
  }) async {
    try {
      final multipartFiles = <MultipartFile>[];

      for (final file in files) {
        final fileName = file.path.split('/').last;
        multipartFiles.add(
          await MultipartFile.fromFile(
            file.path,
            filename: fileName,
          ),
        );
      }

      final formData = FormData.fromMap({
        fieldName: multipartFiles,
        if (data != null) ...data,
      });

      final response = await _dio.post<T>(
        endpoint,
        data: formData,
        onSendProgress: onSendProgress,
        cancelToken: cancelToken,
        options: Options(
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        ),
      );

      return _handleResponse<T>(response);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    } catch (e) {
      throw ApiError(
        message: 'Multiple files upload failed: ${e.toString()}',
        type: ApiErrorType.unknown,
        originalError: e,
      );
    }
  }

  // ==================== File Download ====================

  /// Download file
  ///
  /// [url] - Download URL
  /// [savePath] - Local path to save the file
  /// [onReceiveProgress] - Download progress callback
  /// [queryParameters] - Query parameters
  ///
  /// Returns the saved file path
  /// Throws [ApiError] on failure
  Future<String> downloadFile(
    String url, {
    required String savePath,
    ProgressCallback? onReceiveProgress,
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
    Options? options,
  }) async {
    try {
      await _dio.download(
        url,
        savePath,
        queryParameters: queryParameters,
        onReceiveProgress: onReceiveProgress,
        cancelToken: cancelToken,
        options: options,
      );

      return savePath;
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    } catch (e) {
      throw ApiError(
        message: 'File download failed: ${e.toString()}',
        type: ApiErrorType.unknown,
        originalError: e,
      );
    }
  }

  // ==================== Helper Methods ====================

  /// Handle response and extract data
  T _handleResponse<T>(Response response) {
    if (response.statusCode != null &&
        response.statusCode! >= 200 &&
        response.statusCode! < 300) {
      return response.data as T;
    } else {
      throw ApiError(
        message: 'Request failed with status: ${response.statusCode}',
        statusCode: response.statusCode,
        type: ApiErrorType.unknown,
      );
    }
  }

  /// Update base URL (useful for switching environments)
  void updateBaseUrl(String newBaseUrl) {
    _dio.options.baseUrl = newBaseUrl;
    debugPrint('Base URL updated to: $newBaseUrl');
  }

  /// Update timeout configurations
  void updateTimeouts({
    Duration? connectTimeout,
    Duration? receiveTimeout,
    Duration? sendTimeout,
  }) {
    if (connectTimeout != null) {
      _dio.options.connectTimeout = connectTimeout;
    }
    if (receiveTimeout != null) {
      _dio.options.receiveTimeout = receiveTimeout;
    }
    if (sendTimeout != null) {
      _dio.options.sendTimeout = sendTimeout;
    }
    debugPrint('Timeouts updated');
  }

  /// Add custom header
  void addHeader(String key, String value) {
    _dio.options.headers[key] = value;
  }

  /// Remove custom header
  void removeHeader(String key) {
    _dio.options.headers.remove(key);
  }

  /// Clear all custom headers
  void clearHeaders() {
    _dio.options.headers.clear();
  }

  /// Create a cancel token
  CancelToken createCancelToken() {
    return CancelToken();
  }

  /// Check if request was cancelled
  bool isCancelled(dynamic error) {
    return error is DioException && error.type == DioExceptionType.cancel;
  }

  /// Reset client (clear instance and create new)
  static void reset() {
    _instance = null;
  }
}
