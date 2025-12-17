/// Generic API response model for standardized API responses
class ApiResponse<T> {
  /// Indicates whether the request was successful
  final bool success;

  /// Response message
  final String message;

  /// Response data of generic type T
  final T? data;

  /// List of error messages (if any)
  final List<String>? errors;

  /// Additional metadata about the response
  final ResponseMeta? meta;

  const ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.errors,
    this.meta,
  });

  /// Creates an ApiResponse instance from a JSON map
  ///
  /// The [fromJsonT] parameter is a function that converts JSON to type T
  /// Example usage:
  /// ```dart
  /// ApiResponse<User>.fromJson(
  ///   json,
  ///   (data) => User.fromJson(data as Map<String, dynamic>)
  /// );
  /// ```
  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] as bool,
      message: json['message'] as String,
      data: json['data'] != null && fromJsonT != null
          ? fromJsonT(json['data'])
          : json['data'] as T?,
      errors: json['errors'] != null
          ? (json['errors'] as List<dynamic>).map((e) => e as String).toList()
          : null,
      meta: json['meta'] != null
          ? ResponseMeta.fromJson(json['meta'] as Map<String, dynamic>)
          : null,
    );
  }

  /// Converts the ApiResponse instance to a JSON map
  Map<String, dynamic> toJson({
    Map<String, dynamic> Function(T)? toJsonT,
  }) {
    return {
      'success': success,
      'message': message,
      'data': data != null && toJsonT != null ? toJsonT(data as T) : data,
      'errors': errors,
      'meta': meta?.toJson(),
    };
  }

  /// Creates a successful response
  factory ApiResponse.success({
    required String message,
    T? data,
    ResponseMeta? meta,
  }) {
    return ApiResponse<T>(
      success: true,
      message: message,
      data: data,
      meta: meta,
    );
  }

  /// Creates an error response
  factory ApiResponse.error({
    required String message,
    List<String>? errors,
    ResponseMeta? meta,
  }) {
    return ApiResponse<T>(
      success: false,
      message: message,
      errors: errors,
      meta: meta,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is ApiResponse<T> &&
        other.success == success &&
        other.message == message &&
        other.data == data &&
        other.meta == meta;
  }

  @override
  int get hashCode {
    return Object.hash(
      success,
      message,
      data,
      meta,
    );
  }
}

/// Metadata for API responses containing pagination and other info
class ResponseMeta {
  /// Current page number (for paginated responses)
  final int? currentPage;

  /// Total number of pages (for paginated responses)
  final int? totalPages;

  /// Total number of items (for paginated responses)
  final int? totalItems;

  /// Number of items per page (for paginated responses)
  final int? itemsPerPage;

  /// Whether there is a next page
  final bool? hasNextPage;

  /// Whether there is a previous page
  final bool? hasPreviousPage;

  /// Additional custom metadata
  final Map<String, dynamic>? customData;

  const ResponseMeta({
    this.currentPage,
    this.totalPages,
    this.totalItems,
    this.itemsPerPage,
    this.hasNextPage,
    this.hasPreviousPage,
    this.customData,
  });

  /// Creates a ResponseMeta instance from a JSON map
  factory ResponseMeta.fromJson(Map<String, dynamic> json) {
    return ResponseMeta(
      currentPage: json['currentPage'] as int?,
      totalPages: json['totalPages'] as int?,
      totalItems: json['totalItems'] as int?,
      itemsPerPage: json['itemsPerPage'] as int?,
      hasNextPage: json['hasNextPage'] as bool?,
      hasPreviousPage: json['hasPreviousPage'] as bool?,
      customData: json['customData'] as Map<String, dynamic>?,
    );
  }

  /// Converts the ResponseMeta instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'currentPage': currentPage,
      'totalPages': totalPages,
      'totalItems': totalItems,
      'itemsPerPage': itemsPerPage,
      'hasNextPage': hasNextPage,
      'hasPreviousPage': hasPreviousPage,
      'customData': customData,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is ResponseMeta &&
        other.currentPage == currentPage &&
        other.totalPages == totalPages &&
        other.totalItems == totalItems &&
        other.itemsPerPage == itemsPerPage &&
        other.hasNextPage == hasNextPage &&
        other.hasPreviousPage == hasPreviousPage;
  }

  @override
  int get hashCode {
    return Object.hash(
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage,
      hasPreviousPage,
    );
  }
}
