import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../models/api_response_model.dart';
import '../models/wallet_model.dart';
import '../models/transaction_model.dart';

/// Repository for handling wallet operations
class WalletRepository {
  final ApiClient _apiClient;

  WalletRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient.instance;

  /// Get current wallet balance
  ///
  /// Returns [ApiResponse] containing [Wallet] with balance information
  Future<ApiResponse<WalletModel>> getWalletBalance() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/wallet/balance',
      );

      return ApiResponse.fromJson(
        response,
        (data) => WalletModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch wallet balance: ${e.toString()}',
      );
    }
  }

  /// Get paginated transaction history
  ///
  /// [page] - Page number (default: 1)
  /// [limit] - Items per page (default: 10)
  /// [type] - Transaction type filter (optional)
  ///
  /// Returns [ApiResponse] containing list of [Transaction] objects
  Future<ApiResponse<List<TransactionModel>>> getTransactions({
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
        '/wallet/transactions',
        queryParameters: queryParams,
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => TransactionModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch transactions: ${e.toString()}',
      );
    }
  }

  /// Withdraw funds from wallet
  ///
  /// [amount] - Amount to withdraw
  /// [bankAccountId] - Bank account ID for withdrawal
  ///
  /// Returns [ApiResponse] containing withdrawal result
  Future<ApiResponse<Map<String, dynamic>>> withdraw({
    required double amount,
    required String bankAccountId,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/wallet/withdraw',
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
        message: 'Withdrawal failed: ${e.toString()}',
      );
    }
  }

  /// Get withdrawal history
  ///
  /// [page] - Page number (default: 1)
  /// [limit] - Items per page (default: 10)
  ///
  /// Returns [ApiResponse] containing list of withdrawal records
  Future<ApiResponse<List<Map<String, dynamic>>>> getWithdrawalHistory({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/wallet/withdrawals',
        queryParameters: {
          'page': page.toString(),
          'limit': limit.toString(),
        },
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
        message: 'Failed to fetch withdrawal history: ${e.toString()}',
      );
    }
  }

  /// Add funds to wallet
  ///
  /// [amount] - Amount to add
  ///
  /// Returns [ApiResponse] containing payment/deposit result
  Future<ApiResponse<Map<String, dynamic>>> addFunds({
    required double amount,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/wallet/add-funds',
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
        message: 'Failed to add funds: ${e.toString()}',
      );
    }
  }

  /// Transfer funds to another user
  ///
  /// [userId] - Recipient user ID
  /// [amount] - Amount to transfer
  ///
  /// Returns [ApiResponse] containing transfer result
  Future<ApiResponse<Map<String, dynamic>>> transfer({
    required String userId,
    required double amount,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/wallet/transfer',
        data: {
          'userId': userId,
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
        message: 'Transfer failed: ${e.toString()}',
      );
    }
  }
}
