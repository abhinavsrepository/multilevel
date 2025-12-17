import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../models/api_response_model.dart';
import '../models/investment_model.dart';

/// Repository for handling investment operations
class InvestmentModelRepository {
  final ApiClient _apiClient;

  InvestmentModelRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient.instance;

  /// Get paginated list of user's investments
  ///
  /// [page] - Page number (default: 1)
  /// [limit] - Items per page (default: 10)
  ///
  /// Returns [ApiResponse] containing list of [InvestmentModel] objects
  Future<ApiResponse<List<InvestmentModel>>> getInvestmentModels({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/investments',
        queryParameters: {
          'page': page.toString(),
          'limit': limit.toString(),
        },
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => InvestmentModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch investments: ${e.toString()}',
      );
    }
  }

  /// Create a new investment
  ///
  /// [propertyId] - Property ID to invest in
  /// [amount] - InvestmentModel amount
  /// [units] - Number of units to purchase
  ///
  /// Returns [ApiResponse] containing created [InvestmentModel]
  Future<ApiResponse<InvestmentModel>> createInvestmentModel({
    required String propertyId,
    required double amount,
    required int units,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/investments',
        data: {
          'propertyId': propertyId,
          'amount': amount,
          'units': units,
        },
      );

      return ApiResponse.fromJson(
        response,
        (data) => InvestmentModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'InvestmentModel creation failed: ${e.toString()}',
      );
    }
  }

  /// Get detailed information about a specific investment
  ///
  /// [id] - InvestmentModel ID
  ///
  /// Returns [ApiResponse] containing [InvestmentModel] details
  Future<ApiResponse<InvestmentModel>> getInvestmentModelDetail({
    required String id,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/investments/$id',
      );

      return ApiResponse.fromJson(
        response,
        (data) => InvestmentModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch investment details: ${e.toString()}',
      );
    }
  }

  /// Get installments for a specific investment
  ///
  /// [investmentId] - InvestmentModel ID
  ///
  /// Returns [ApiResponse] containing list of installments
  Future<ApiResponse<List<Map<String, dynamic>>>> getInstallments({
    required String investmentId,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/investments/$investmentId/installments',
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
        message: 'Failed to fetch installments: ${e.toString()}',
      );
    }
  }

  /// Pay an installment
  ///
  /// [installmentId] - Installment ID to pay
  /// [amount] - Payment amount
  ///
  /// Returns [ApiResponse] containing payment result
  Future<ApiResponse<Map<String, dynamic>>> payInstallment({
    required String installmentId,
    required double amount,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/investments/installments/$installmentId/pay',
        data: {
          'amount': amount,
        },
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Installment payment failed: ${e.toString()}',
      );
    }
  }

  /// Get portfolio summary
  ///
  /// Returns [ApiResponse] containing portfolio statistics and summary
  Future<ApiResponse<Map<String, dynamic>>> getPortfolioSummary() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/investments/portfolio/summary',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch portfolio summary: ${e.toString()}',
      );
    }
  }

  /// Get returns for a specific investment
  ///
  /// [investmentId] - InvestmentModel ID
  ///
  /// Returns [ApiResponse] containing returns data
  Future<ApiResponse<Map<String, dynamic>>> getReturns({
    required String investmentId,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/investments/$investmentId/returns',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch returns: ${e.toString()}',
      );
    }
  }
}
