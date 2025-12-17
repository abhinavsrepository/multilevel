import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../models/api_response_model.dart';
import '../models/bank_account_model.dart';

/// Repository for handling bank account operations
class BankRepository {
  final ApiClient _apiClient;

  BankRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient.instance;

  /// Get all user's bank accounts
  ///
  /// Returns [ApiResponse] containing list of [BankAccountModel] objects
  Future<ApiResponse<List<BankAccountModel>>> getBankAccountModels() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/bank-accounts',
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => BankAccountModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch bank accounts: ${e.toString()}',
      );
    }
  }

  /// Add a new bank account
  ///
  /// [data] - Bank account details (accountNumber, ifscCode, accountHolderName, etc.)
  ///
  /// Returns [ApiResponse] containing created [BankAccountModel]
  Future<ApiResponse<BankAccountModel>> addBankAccountModel({
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/bank-accounts',
        data: data,
      );

      return ApiResponse.fromJson(
        response,
        (data) => BankAccountModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to add bank account: ${e.toString()}',
      );
    }
  }

  /// Update existing bank account
  ///
  /// [id] - Bank account ID to update
  /// [data] - Updated bank account details
  ///
  /// Returns [ApiResponse] containing updated [BankAccountModel]
  Future<ApiResponse<BankAccountModel>> updateBankAccountModel({
    required String id,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await _apiClient.put<Map<String, dynamic>>(
        '/bank-accounts/$id',
        data: data,
      );

      return ApiResponse.fromJson(
        response,
        (data) => BankAccountModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to update bank account: ${e.toString()}',
      );
    }
  }

  /// Delete a bank account
  ///
  /// [id] - Bank account ID to delete
  ///
  /// Returns [ApiResponse] containing deletion result
  Future<ApiResponse<Map<String, dynamic>>> deleteBankAccountModel({
    required String id,
  }) async {
    try {
      final response = await _apiClient.delete<Map<String, dynamic>>(
        '/bank-accounts/$id',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to delete bank account: ${e.toString()}',
      );
    }
  }

  /// Set primary bank account
  ///
  /// [id] - Bank account ID to set as primary
  ///
  /// Returns [ApiResponse] containing updated [BankAccountModel]
  Future<ApiResponse<BankAccountModel>> setPrimaryAccount({
    required String id,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/bank-accounts/$id/set-primary',
      );

      return ApiResponse.fromJson(
        response,
        (data) => BankAccountModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to set primary account: ${e.toString()}',
      );
    }
  }

  /// Get list of supported banks
  ///
  /// Returns [ApiResponse] containing list of supported banks
  Future<ApiResponse<List<Map<String, dynamic>>>> getSupportedBanks() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/bank-accounts/supported-banks',
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
        message: 'Failed to fetch supported banks: ${e.toString()}',
      );
    }
  }
}
