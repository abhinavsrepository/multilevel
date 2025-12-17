import 'package:flutter/material.dart';
import '../models/property_model.dart';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../../core/constants/api_constants.dart';

/// Property provider for managing property listings and operations
///
/// Handles property retrieval, search, filtering, favorites, and pagination.
/// Supports pull-to-refresh and infinite scrolling.
class PropertyProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient.instance;

  /// List of properties
  List<PropertyModel> _properties = [];

  /// Selected property for detail view
  PropertyModel? _selectedProperty;

  /// Favorite property IDs
  final Set<String> _favoriteIds = {};

  /// Loading state
  bool _isLoading = false;

  /// Has more properties to load
  bool _hasMore = true;

  /// Current page number
  int _currentPage = 1;

  /// Error message
  String? _errorMessage;

  /// Items per page
  static const int _itemsPerPage = 20;

  /// Get properties list
  List<PropertyModel> get properties => _properties;

  /// Get selected property
  PropertyModel? get selectedProperty => _selectedProperty;

  /// Get favorite property IDs
  Set<String> get favoriteIds => _favoriteIds;

  /// Check if operation is in progress
  bool get isLoading => _isLoading;

  /// Check if more properties available
  bool get hasMore => _hasMore;

  /// Get current page
  int get currentPage => _currentPage;

  /// Get error message
  String? get errorMessage => _errorMessage;

  /// Check if property is favorite
  bool isFavorite(String propertyId) => _favoriteIds.contains(propertyId);

  /// Get properties with pagination
  ///
  /// [refresh] - If true, resets pagination and fetches from beginning
  ///
  /// Returns true if properties fetched successfully
  Future<bool> getProperties({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _properties.clear();
    }

    if (!_hasMore && !refresh) return true;

    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.propertyList,
        queryParameters: {
          'page': _currentPage,
          'limit': _itemsPerPage,
        },
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      final List<PropertyModel> fetchedProperties = data
          .map((json) => PropertyModel.fromJson(json as Map<String, dynamic>))
          .toList();

      if (refresh) {
        _properties = fetchedProperties;
      } else {
        _properties.addAll(fetchedProperties);
      }

      _hasMore = fetchedProperties.length >= _itemsPerPage;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch properties. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Load more properties (pagination)
  ///
  /// Returns true if more properties loaded successfully
  Future<bool> loadMore() async {
    if (!_hasMore || _isLoading) return false;

    _currentPage++;
    return await getProperties();
  }

  /// Get property detail by ID
  ///
  /// [id] - Property ID
  ///
  /// Returns true if property fetched successfully
  Future<bool> getPropertyDetail(String id) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.replacePathParam(
          ApiConstants.propertyDetail,
          'id',
          id,
        ),
      );

      _selectedProperty = PropertyModel.fromJson(response);

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch property details. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Search properties by query
  ///
  /// [query] - Search query string
  ///
  /// Returns true if search completed successfully
  Future<bool> searchProperties(String query) async {
    _setLoading(true);
    _clearError();

    _currentPage = 1;
    _hasMore = true;

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.searchProperty,
        queryParameters: {
          'q': query,
          'page': _currentPage,
          'limit': _itemsPerPage,
        },
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      _properties = data
          .map((json) => PropertyModel.fromJson(json as Map<String, dynamic>))
          .toList();

      _hasMore = _properties.length >= _itemsPerPage;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Search failed. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Get featured properties
  ///
  /// Returns true if featured properties fetched successfully
  Future<bool> getFeaturedProperties() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.featuredProperties,
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      _properties = data
          .map((json) => PropertyModel.fromJson(json as Map<String, dynamic>))
          .toList();

      _hasMore = false;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch featured properties. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Toggle favorite status of a property
  ///
  /// [propertyId] - Property ID to toggle
  ///
  /// Returns true if toggle successful
  Future<bool> toggleFavorite(String propertyId) async {
    final wasFavorite = _favoriteIds.contains(propertyId);

    if (wasFavorite) {
      _favoriteIds.remove(propertyId);
    } else {
      _favoriteIds.add(propertyId);
    }
    notifyListeners();

    try {
      await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.replacePathParam(
          ApiConstants.addToFavorites,
          'id',
          propertyId,
        ),
      );

      return true;
    } on ApiError catch (e) {
      if (wasFavorite) {
        _favoriteIds.add(propertyId);
      } else {
        _favoriteIds.remove(propertyId);
      }
      notifyListeners();

      _setError(e.message);
      return false;
    } catch (e) {
      if (wasFavorite) {
        _favoriteIds.add(propertyId);
      } else {
        _favoriteIds.remove(propertyId);
      }
      notifyListeners();

      _setError('Failed to update favorite. Please try again.');
      return false;
    }
  }

  /// Clear selected property
  void clearSelectedProperty() {
    _selectedProperty = null;
    notifyListeners();
  }

  /// Set loading state
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  /// Set error message
  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  /// Clear error message
  void _clearError() {
    _errorMessage = null;
  }

  /// Clear error manually
  void clearError() {
    _clearError();
    notifyListeners();
  }

  /// Reset provider state
  void reset() {
    _properties.clear();
    _selectedProperty = null;
    _favoriteIds.clear();
    _isLoading = false;
    _hasMore = true;
    _currentPage = 1;
    _errorMessage = null;
    notifyListeners();
  }
}
