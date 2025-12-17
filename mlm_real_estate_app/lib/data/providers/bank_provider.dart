import 'package:flutter/material.dart';
import '../models/bank_account_model.dart';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../../core/constants/api_constants.dart';

/// Bank account provider for managing user bank accounts
///
/// Handles bank account listing, creation, updating, and deletion
class BankProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient.instance;

  /// List of bank accounts
  List<BankAccountModel> _bankAccounts = [];

  /// Loading state
  bool _isLoading = false;

  /// Error message
  String? _errorMessage;

  /// Get bank accounts list
  List<BankAccountModel> get bankAccounts => _bankAccounts;

  /// Check if operation is in progress
  bool get isLoading => _isLoading;

  /// Get error message
  String? get errorMessage => _errorMessage;

  /// Get primary bank account
  BankAccountModel? get primaryAccount {
    try {
      return _bankAccounts.firstWhere((account) => account.isPrimary);
    } catch (e) {
      return null;
    }
  }

  /// Get active bank accounts
  List<BankAccountModel> get activeAccounts {
    return _bankAccounts.where((account) => account.status == 'active').toList();
  }

  /// Get all bank accounts
  ///
  /// Returns true if accounts fetched successfully
  Future<bool> getBankAccounts() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.bankAccounts,
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      _bankAccounts = data
          .map((json) => BankAccountModel.fromJson(json as Map<String, dynamic>))
          .toList();

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch bank accounts. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Add a new bank account
  ///
  /// [accountHolderName] - Name of the account holder
  /// [accountNumber] - Bank account number
  /// [ifscCode] - IFSC code of the bank branch
  /// [bankName] - Name of the bank
  /// [branch] - Branch name/location
  /// [accountType] - Type of account (savings/current)
  ///
  /// Returns true if account added successfully
  Future<bool> addBankAccount({
    required String accountHolderName,
    required String accountNumber,
    required String ifscCode,
    required String bankName,
    required String branch,
    required String accountType,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.addBankAccount,
        data: {
          'accountHolderName': accountHolderName,
          'accountNumber': accountNumber,
          'ifscCode': ifscCode,
          'bankName': bankName,
          'branch': branch,
          'accountType': accountType,
        },
      );

      final newAccount = BankAccountModel.fromJson(response);
      _bankAccounts.add(newAccount);

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to add bank account. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Update a bank account
  ///
  /// [id] - Bank account ID to update
  /// [accountHolderName] - Updated account holder name
  /// [ifscCode] - Updated IFSC code
  /// [bankName] - Updated bank name
  /// [branch] - Updated branch name
  /// [accountType] - Updated account type
  ///
  /// Returns true if account updated successfully
  Future<bool> updateBankAccount({
    required String id,
    required String accountHolderName,
    required String ifscCode,
    required String bankName,
    required String branch,
    required String accountType,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.put<Map<String, dynamic>>(
        ApiConstants.replacePathParam(
          ApiConstants.updateBankAccount,
          'id',
          id,
        ),
        data: {
          'accountHolderName': accountHolderName,
          'ifscCode': ifscCode,
          'bankName': bankName,
          'branch': branch,
          'accountType': accountType,
        },
      );

      final updatedAccount = BankAccountModel.fromJson(response);
      final index = _bankAccounts.indexWhere((account) => account.id == id);

      if (index != -1) {
        _bankAccounts[index] = updatedAccount;
      }

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to update bank account. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Delete a bank account
  ///
  /// [id] - Bank account ID to delete
  ///
  /// Returns true if account deleted successfully
  Future<bool> deleteBankAccount(String id) async {
    _setLoading(true);
    _clearError();

    try {
      await _apiClient.delete<Map<String, dynamic>>(
        ApiConstants.replacePathParam(
          ApiConstants.deleteBankAccount,
          'id',
          id,
        ),
      );

      _bankAccounts.removeWhere((account) => account.id == id);

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to delete bank account. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Set a bank account as primary
  ///
  /// [id] - Bank account ID to set as primary
  ///
  /// Returns true if account set as primary successfully
  Future<bool> setPrimaryAccount(String id) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.replacePathParam(
          ApiConstants.setPrimaryBankAccount,
          'id',
          id,
        ),
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      _bankAccounts = data
          .map((json) => BankAccountModel.fromJson(json as Map<String, dynamic>))
          .toList();

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to set primary account. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Refresh bank accounts
  ///
  /// Returns true if refresh successful
  Future<bool> refresh() async {
    return await getBankAccounts();
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
    _bankAccounts.clear();
    _isLoading = false;
    _errorMessage = null;
    notifyListeners();
  }
}
