import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../models/api_response_model.dart';
import '../models/payout_model.dart';

/// Repository for handling payout operations
class PayoutModelRepository {
  final ApiClient _apiClient;

  PayoutModelRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient.instance;

  /// Get paginated list of payouts
  ///
  /// [page] - Page number (default: 1)
  /// [limit] - Items per page (default: 10)
  ///
  /// Returns [ApiResponse] containing list of [PayoutModel] objects
  Future<ApiResponse<List<PayoutModel>>> getPayoutModels({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/payouts',
        queryParameters: {
          'page': page.toString(),
          'limit': limit.toString(),
        },
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => PayoutModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch payouts: ${e.toString()}',
      );
    }
  }

  /// Request a new payout
  ///
  /// [amount] - PayoutModel amount
  /// [method] - PayoutModel method (bank_transfer, upi, etc.)
  /// [bankAccountId] - Bank account ID for payout
  ///
  /// Returns [ApiResponse] containing created [PayoutModel]
  Future<ApiResponse<PayoutModel>> requestPayoutModel({
    required double amount,
    required String method,
    required String bankAccountId,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/payouts/request',
        data: {
          'amount': amount,
          'method': method,
          'bankAccountId': bankAccountId,
        },
      );

      return ApiResponse.fromJson(
        response,
        (data) => PayoutModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'PayoutModel request failed: ${e.toString()}',
      );
    }
  }

  /// Get detailed information about a specific payout
  ///
  /// [id] - PayoutModel ID
  ///
  /// Returns [ApiResponse] containing [PayoutModel] details
  Future<ApiResponse<PayoutModel>> getPayoutModelDetail({
    required String id,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/payouts/$id',
      );

      return ApiResponse.fromJson(
        response,
        (data) => PayoutModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch payout details: ${e.toString()}',
      );
    }
  }

  /// Cancel a pending payout
  ///
  /// [id] - PayoutModel ID to cancel
  ///
  /// Returns [ApiResponse] containing cancellation result
  Future<ApiResponse<Map<String, dynamic>>> cancelPayoutModel({
    required String id,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/payouts/$id/cancel',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'PayoutModel cancellation failed: ${e.toString()}',
      );
    }
  }

  /// Get payout history
  ///
  /// [page] - Page number (default: 1)
  /// [limit] - Items per page (default: 10)
  ///
  /// Returns [ApiResponse] containing list of historical [PayoutModel] objects
  Future<ApiResponse<List<PayoutModel>>> getPayoutModelHistory({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/payouts/history',
        queryParameters: {
          'page': page.toString(),
          'limit': limit.toString(),
        },
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => PayoutModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch payout history: ${e.toString()}',
      );
    }
  }
}
