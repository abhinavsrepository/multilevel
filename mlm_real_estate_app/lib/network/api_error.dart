import 'package:dio/dio.dart';

/// Custom API error class for handling all types of network errors
class ApiError implements Exception {
  /// Error message
  final String message;

  /// HTTP status code (if applicable)
  final int? statusCode;

  /// Error type
  final ApiErrorType type;

  /// Original error object
  final dynamic originalError;

  /// Additional error data from server
  final Map<String, dynamic>? data;

  ApiError({
    required this.message,
    required this.type, this.statusCode,
    this.originalError,
    this.data,
  });

  /// Factory constructor to create ApiError from DioException
  factory ApiError.fromDioException(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        return ApiError(
          message: 'Connection timeout. Please check your internet connection.',
          type: ApiErrorType.timeout,
          originalError: error,
        );

      case DioExceptionType.sendTimeout:
        return ApiError(
          message: 'Request timeout. Please try again.',
          type: ApiErrorType.timeout,
          originalError: error,
        );

      case DioExceptionType.receiveTimeout:
        return ApiError(
          message: 'Response timeout. The server took too long to respond.',
          type: ApiErrorType.timeout,
          originalError: error,
        );

      case DioExceptionType.badResponse:
        return _handleBadResponse(error);

      case DioExceptionType.cancel:
        return ApiError(
          message: 'Request was cancelled.',
          type: ApiErrorType.cancelled,
          originalError: error,
        );

      case DioExceptionType.connectionError:
        return ApiError(
          message: 'No internet connection. Please check your network.',
          type: ApiErrorType.network,
          originalError: error,
        );

      case DioExceptionType.badCertificate:
        return ApiError(
          message: 'Security certificate error. Please contact support.',
          type: ApiErrorType.security,
          originalError: error,
        );

      case DioExceptionType.unknown:
        return ApiError(
          message: _extractErrorMessage(error) ??
                   'An unexpected error occurred. Please try again.',
          type: ApiErrorType.unknown,
          originalError: error,
        );

      default:
        return ApiError(
          message: 'An unknown error occurred.',
          type: ApiErrorType.unknown,
          originalError: error,
        );
    }
  }

  /// Handle bad response errors (4xx and 5xx status codes)
  static ApiError _handleBadResponse(DioException error) {
    final response = error.response;
    final statusCode = response?.statusCode;
    final responseData = response?.data;

    // Extract error message from response
    String message = 'An error occurred. Please try again.';
    Map<String, dynamic>? errorData;

    if (responseData != null) {
      if (responseData is Map<String, dynamic>) {
        errorData = responseData;
        message = responseData['message'] as String? ??
            responseData['error'] as String? ??
            responseData['msg'] as String? ??
            message;
      } else if (responseData is String) {
        message = responseData;
      }
    }

    switch (statusCode) {
      case 400:
        return ApiError(
          message: message.isNotEmpty ? message : 'Invalid request. Please check your input.',
          statusCode: statusCode,
          type: ApiErrorType.badRequest,
          originalError: error,
          data: errorData,
        );

      case 401:
        return ApiError(
          message: message.isNotEmpty ? message : 'Session expired. Please login again.',
          statusCode: statusCode,
          type: ApiErrorType.unauthorized,
          originalError: error,
          data: errorData,
        );

      case 403:
        return ApiError(
          message: message.isNotEmpty ? message : 'Access denied. You do not have permission.',
          statusCode: statusCode,
          type: ApiErrorType.forbidden,
          originalError: error,
          data: errorData,
        );

      case 404:
        return ApiError(
          message: message.isNotEmpty ? message : 'Resource not found.',
          statusCode: statusCode,
          type: ApiErrorType.notFound,
          originalError: error,
          data: errorData,
        );

      case 409:
        return ApiError(
          message: message.isNotEmpty ? message : 'Conflict. Resource already exists.',
          statusCode: statusCode,
          type: ApiErrorType.conflict,
          originalError: error,
          data: errorData,
        );

      case 422:
        return ApiError(
          message: message.isNotEmpty ? message : 'Validation failed. Please check your input.',
          statusCode: statusCode,
          type: ApiErrorType.validationError,
          originalError: error,
          data: errorData,
        );

      case 429:
        return ApiError(
          message: message.isNotEmpty ? message : 'Too many requests. Please try again later.',
          statusCode: statusCode,
          type: ApiErrorType.tooManyRequests,
          originalError: error,
          data: errorData,
        );

      case 500:
        return ApiError(
          message: message.isNotEmpty ? message : 'Internal server error. Please try again later.',
          statusCode: statusCode,
          type: ApiErrorType.serverError,
          originalError: error,
          data: errorData,
        );

      case 502:
        return ApiError(
          message: message.isNotEmpty ? message : 'Bad gateway. Please try again later.',
          statusCode: statusCode,
          type: ApiErrorType.serverError,
          originalError: error,
          data: errorData,
        );

      case 503:
        return ApiError(
          message: message.isNotEmpty ? message : 'Service unavailable. Please try again later.',
          statusCode: statusCode,
          type: ApiErrorType.serverError,
          originalError: error,
          data: errorData,
        );

      case 504:
        return ApiError(
          message: message.isNotEmpty ? message : 'Gateway timeout. Please try again later.',
          statusCode: statusCode,
          type: ApiErrorType.timeout,
          originalError: error,
          data: errorData,
        );

      default:
        if (statusCode != null && statusCode >= 500) {
          return ApiError(
            message: message,
            statusCode: statusCode,
            type: ApiErrorType.serverError,
            originalError: error,
            data: errorData,
          );
        } else if (statusCode != null && statusCode >= 400) {
          return ApiError(
            message: message,
            statusCode: statusCode,
            type: ApiErrorType.badRequest,
            originalError: error,
            data: errorData,
          );
        } else {
          return ApiError(
            message: message,
            statusCode: statusCode,
            type: ApiErrorType.unknown,
            originalError: error,
            data: errorData,
          );
        }
    }
  }

  /// Extract error message from DioException
  static String? _extractErrorMessage(DioException error) {
    if (error.error is String) {
      return error.error as String;
    }
    if (error.message != null && error.message!.isNotEmpty) {
      return error.message;
    }
    return null;
  }

  /// Check if error is network-related
  bool get isNetworkError => type == ApiErrorType.network;

  /// Check if error is timeout-related
  bool get isTimeoutError => type == ApiErrorType.timeout;

  /// Check if error is server-related (5xx)
  bool get isServerError => type == ApiErrorType.serverError;

  /// Check if error is client-related (4xx)
  bool get isClientError =>
      type == ApiErrorType.badRequest ||
      type == ApiErrorType.unauthorized ||
      type == ApiErrorType.forbidden ||
      type == ApiErrorType.notFound ||
      type == ApiErrorType.conflict ||
      type == ApiErrorType.validationError ||
      type == ApiErrorType.tooManyRequests;

  /// Check if error is unauthorized (401)
  bool get isUnauthorized => type == ApiErrorType.unauthorized;

  /// Check if error is validation error (422)
  bool get isValidationError => type == ApiErrorType.validationError;

  /// Get validation errors from response data
  Map<String, dynamic>? get errors {
    if (data != null && data!.containsKey('errors')) {
      final errorsData = data!['errors'];
      if (errorsData is Map<String, dynamic>) {
        return errorsData;
      }
    }
    return null;
  }

  @override
  String toString() {
    return 'ApiError{message: $message, statusCode: $statusCode, type: $type}';
  }
}

/// API error types
enum ApiErrorType {
  /// Network connectivity error
  network,

  /// Request/response timeout
  timeout,

  /// Bad request (400)
  badRequest,

  /// Unauthorized (401)
  unauthorized,

  /// Forbidden (403)
  forbidden,

  /// Not found (404)
  notFound,

  /// Conflict (409)
  conflict,

  /// Validation error (422)
  validationError,

  /// Too many requests (429)
  tooManyRequests,

  /// Server error (5xx)
  serverError,

  /// Request cancelled
  cancelled,

  /// Security/certificate error
  security,

  /// Unknown error
  unknown,
}
