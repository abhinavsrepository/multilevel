import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../models/api_response_model.dart';
import '../models/commission_model.dart';

/// Repository for handling commission operations
class CommissionModelRepository {
  final ApiClient _apiClient;

  CommissionModelRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient.instance;

  /// Get total earnings summary
  ///
  /// Returns [ApiResponse] containing earnings summary with total and breakdowns
  Future<ApiResponse<Map<String, dynamic>>> getEarnings() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/commissions/earnings',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch earnings: ${e.toString()}',
      );
    }
  }

  /// Get paginated commission history
  ///
  /// [page] - Page number (default: 1)
  /// [limit] - Items per page (default: 10)
  /// [type] - CommissionModel type filter (optional)
  ///
  /// Returns [ApiResponse] containing list of [CommissionModel] objects
  Future<ApiResponse<List<CommissionModel>>> getCommissionModelHistory({
    int page = 1,
    int limit = 10,
    String? type,
  }) async {
    try {
      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (type != null) 'type': type,
      };

      final response = await _apiClient.get<Map<String, dynamic>>(
        '/commissions/history',
        queryParameters: queryParams,
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => CommissionModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch commission history: ${e.toString()}',
      );
    }
  }

  /// Get available commission types
  ///
  /// Returns [ApiResponse] containing list of commission types
  Future<ApiResponse<List<Map<String, dynamic>>>> getCommissionModelTypes() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/commissions/types',
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
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch commission types: ${e.toString()}',
      );
    }
  }

  /// Get detailed commission breakdown
  ///
  /// Returns [ApiResponse] containing commission breakdown by type
  Future<ApiResponse<Map<String, dynamic>>> getCommissionModelBreakdown() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/commissions/breakdown',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch commission breakdown: ${e.toString()}',
      );
    }
  }

  /// Withdraw commission earnings
  ///
  /// [amount] - Amount to withdraw
  /// [bankAccountId] - Bank account ID for withdrawal
  ///
  /// Returns [ApiResponse] containing withdrawal result
  Future<ApiResponse<Map<String, dynamic>>> withdrawCommissionModel({
    required double amount,
    required String bankAccountId,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/commissions/withdraw',
        data: {
          'amount': amount,
          'bankAccountId': bankAccountId,
        },
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'CommissionModel withdrawal failed: ${e.toString()}',
      );
    }
  }
}
