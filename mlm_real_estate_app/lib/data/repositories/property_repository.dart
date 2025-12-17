import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../models/api_response_model.dart';
import '../models/property_model.dart';

/// Repository for handling property operations
class PropertyRepository {
  final ApiClient _apiClient;

  PropertyRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient.instance;

  /// Get paginated list of properties with filters
  ///
  /// [page] - Page number (default: 1)
  /// [limit] - Items per page (default: 10)
  /// [filters] - Optional filters (category, price range, location, etc.)
  ///
  /// Returns [ApiResponse] containing list of [Property] objects
  Future<ApiResponse<List<PropertyModel>>> getProperties({
    int page = 1,
    int limit = 10,
    Map<String, dynamic>? filters,
  }) async {
    try {
      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (filters != null) ...filters.map((key, value) => MapEntry(key, value.toString())),
      };

      final response = await _apiClient.get<Map<String, dynamic>>(
        '/properties',
        queryParameters: queryParams,
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => PropertyModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        errors: e.errors != null ? List<String>.from(e.errors!.values.map((v) => v.toString())) : null,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch properties: ${e.toString()}',
      );
    }
  }

  /// Get detailed information about a specific property
  ///
  /// [id] - Property ID
  ///
  /// Returns [ApiResponse] containing [Property] details
  Future<ApiResponse<PropertyModel>> getPropertyDetail({
    required String id,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/properties/$id',
      );

      return ApiResponse.fromJson(
        response,
        (data) => PropertyModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        errors: e.errors != null ? List<String>.from(e.errors!.values.map((v) => v.toString())) : null,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch property details: ${e.toString()}',
      );
    }
  }

  /// Search properties by query
  ///
  /// [query] - Search query string
  ///
  /// Returns [ApiResponse] containing list of matching [Property] objects
  Future<ApiResponse<List<PropertyModel>>> searchProperties({
    required String query,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/properties/search',
        queryParameters: {
          'q': query,
        },
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => PropertyModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        errors: e.errors != null ? List<String>.from(e.errors!.values.map((v) => v.toString())) : null,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Property search failed: ${e.toString()}',
      );
    }
  }

  /// Get featured/highlighted properties
  ///
  /// Returns [ApiResponse] containing list of featured [Property] objects
  Future<ApiResponse<List<PropertyModel>>> getFeaturedProperties() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/properties/featured',
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => PropertyModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        errors: e.errors != null ? List<String>.from(e.errors!.values.map((v) => v.toString())) : null,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch featured properties: ${e.toString()}',
      );
    }
  }

  /// Get available property categories
  ///
  /// Returns [ApiResponse] containing list of property categories
  Future<ApiResponse<List<Map<String, dynamic>>>> getPropertyCategories() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/properties/categories',
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => item as Map<String, dynamic>)
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        errors: e.errors != null ? List<String>.from(e.errors!.values.map((v) => v.toString())) : null,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch property categories: ${e.toString()}',
      );
    }
  }

  /// Add property to favorites
  ///
  /// [propertyId] - Property ID to add to favorites
  ///
  /// Returns [ApiResponse] containing result
  Future<ApiResponse<Map<String, dynamic>>> addToFavorites({
    required String propertyId,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/properties/favorites',
        data: {
          'propertyId': propertyId,
        },
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        errors: e.errors != null ? List<String>.from(e.errors!.values.map((v) => v.toString())) : null,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to add to favorites: ${e.toString()}',
      );
    }
  }

  /// Remove property from favorites
  ///
  /// [propertyId] - Property ID to remove from favorites
  ///
  /// Returns [ApiResponse] containing result
  Future<ApiResponse<Map<String, dynamic>>> removeFromFavorites({
    required String propertyId,
  }) async {
    try {
      final response = await _apiClient.delete<Map<String, dynamic>>(
        '/properties/favorites/$propertyId',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        errors: e.errors != null ? List<String>.from(e.errors!.values.map((v) => v.toString())) : null,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to remove from favorites: ${e.toString()}',
      );
    }
  }

  /// Get user's favorite properties
  ///
  /// Returns [ApiResponse] containing list of favorite [Property] objects
  Future<ApiResponse<List<PropertyModel>>> getFavorites() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/properties/favorites',
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => PropertyModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        errors: e.errors != null ? List<String>.from(e.errors!.values) : null,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch favorites: ${e.toString()}',
      );
    }
  }
}
