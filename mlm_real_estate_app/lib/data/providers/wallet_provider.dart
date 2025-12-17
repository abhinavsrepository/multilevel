import 'package:flutter/material.dart';
import '../models/wallet_model.dart';
import '../models/transaction_model.dart';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../../core/constants/api_constants.dart';

/// Wallet provider for managing wallet and transactions
///
/// Handles wallet balance retrieval, transaction history,
/// withdrawals with pagination support.
class WalletProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient.instance;

  /// Wallet data
  WalletModel? _wallet;

  /// List of transactions
  List<TransactionModel> _transactions = [];

  /// Loading state
  bool _isLoading = false;

  /// Has more transactions to load
  bool _hasMore = true;

  /// Current page number
  int _currentPage = 1;

  /// Error message
  String? _errorMessage;

  /// Items per page
  static const int _itemsPerPage = 20;

  /// Get wallet data
  WalletModel? get wallet => _wallet;

  /// Get transactions list
  List<TransactionModel> get transactions => _transactions;

  /// Check if operation is in progress
  bool get isLoading => _isLoading;

  /// Check if more transactions available
  bool get hasMore => _hasMore;

  /// Get current page
  int get currentPage => _currentPage;

  /// Get error message
  String? get errorMessage => _errorMessage;

  /// Get wallet balance
  double get balance => _wallet?.balance ?? 0.0;

  /// Get available balance
  double get availableBalance => _wallet?.availableBalance ?? 0.0;

  /// Get wallet balance from server
  ///
  /// Returns true if balance fetched successfully
  Future<bool> getWalletBalance() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.walletBalance,
      );

      _wallet = WalletModel.fromJson(response);

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch wallet balance. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Get wallet transactions with pagination
  ///
  /// [refresh] - If true, resets pagination and fetches from beginning
  /// [type] - Filter by transaction type (optional)
  ///
  /// Returns true if transactions fetched successfully
  Future<bool> getTransactions({
    bool refresh = false,
    String? type,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _transactions.clear();
    }

    if (!_hasMore && !refresh) return true;

    _setLoading(true);
    _clearError();

    try {
      final queryParams = {
        'page': _currentPage,
        'limit': _itemsPerPage,
        if (type != null) 'type': type,
      };

      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.walletTransactions,
        queryParameters: queryParams,
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      final List<TransactionModel> fetchedTransactions = data
          .map((json) => TransactionModel.fromJson(json as Map<String, dynamic>))
          .toList();

      if (refresh) {
        _transactions = fetchedTransactions;
      } else {
        _transactions.addAll(fetchedTransactions);
      }

      _hasMore = fetchedTransactions.length >= _itemsPerPage;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch transactions. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Load more transactions (pagination)
  ///
  /// Returns true if more transactions loaded successfully
  Future<bool> loadMoreTransactions() async {
    if (!_hasMore || _isLoading) return false;

    _currentPage++;
    return await getTransactions();
  }

  /// Withdraw funds from wallet
  ///
  /// [amount] - Amount to withdraw
  /// [bankAccountId] - Bank account ID for withdrawal
  ///
  /// Returns true if withdrawal request successful
  Future<bool> withdraw(double amount, String bankAccountId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.withdraw,
        data: {
          'amount': amount,
          'bankAccountId': bankAccountId,
        },
      );

      _wallet = WalletModel.fromJson(response['wallet']);

      final transaction = TransactionModel.fromJson(response['transaction']);
      _transactions.insert(0, transaction);

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Withdrawal failed. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Refresh wallet data (balance and recent transactions)
  ///
  /// Returns true if refresh successful
  Future<bool> refresh() async {
    final results = await Future.wait([
      getWalletBalance(),
      getTransactions(refresh: true),
    ]);

    return results.every((result) => result);
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
    _wallet = null;
    _transactions.clear();
    _isLoading = false;
    _hasMore = true;
    _currentPage = 1;
    _errorMessage = null;
    notifyListeners();
  }
}
