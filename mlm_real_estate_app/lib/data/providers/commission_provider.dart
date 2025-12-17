import 'package:flutter/material.dart';
import '../models/commission_model.dart';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../../core/constants/api_constants.dart';

/// Commission provider for managing MLM commissions and earnings
///
/// Handles commission earnings, history retrieval, and withdrawals
/// with pagination support.
class CommissionProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient.instance;

  /// Commission earnings summary
  Map<String, dynamic>? _earnings;

  /// Commission history list
  List<CommissionModel> _commissionHistory = [];

  /// Loading state
  bool _isLoading = false;

  /// Has more commission records to load
  bool _hasMore = true;

  /// Current page number
  int _currentPage = 1;

  /// Error message
  String? _errorMessage;

  /// Items per page
  static const int _itemsPerPage = 20;

  /// Get earnings data
  Map<String, dynamic>? get earnings => _earnings;

  /// Get commission history
  List<CommissionModel> get commissionHistory => _commissionHistory;

  /// Check if operation is in progress
  bool get isLoading => _isLoading;

  /// Check if more records available
  bool get hasMore => _hasMore;

  /// Get current page
  int get currentPage => _currentPage;

  /// Get error message
  String? get errorMessage => _errorMessage;

  /// Get total earnings
  double get totalEarnings => (_earnings?['totalEarnings'] as num?)?.toDouble() ?? 0.0;

  /// Get available for withdrawal
  double get availableEarnings => (_earnings?['availableEarnings'] as num?)?.toDouble() ?? 0.0;

  /// Get commission earnings summary
  ///
  /// Returns true if earnings fetched successfully
  Future<bool> getEarnings() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.commissionEarnings,
      );

      _earnings = response;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch earnings. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Get commission history with pagination
  ///
  /// [refresh] - If true, resets pagination and fetches from beginning
  /// [type] - Filter by commission type (optional)
  ///
  /// Returns true if history fetched successfully
  Future<bool> getCommissionHistory({
    bool refresh = false,
    String? type,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _commissionHistory.clear();
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
        ApiConstants.commissionHistory,
        queryParameters: queryParams,
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      final List<CommissionModel> fetchedCommissions = data
          .map((json) => CommissionModel.fromJson(json as Map<String, dynamic>))
          .toList();

      if (refresh) {
        _commissionHistory = fetchedCommissions;
      } else {
        _commissionHistory.addAll(fetchedCommissions);
      }

      _hasMore = fetchedCommissions.length >= _itemsPerPage;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch commission history. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Load more commission records (pagination)
  ///
  /// Returns true if more records loaded successfully
  Future<bool> loadMore() async {
    if (!_hasMore || _isLoading) return false;

    _currentPage++;
    return await getCommissionHistory();
  }

  /// Withdraw commission earnings
  ///
  /// [amount] - Amount to withdraw
  /// [bankAccountId] - Bank account ID for withdrawal
  ///
  /// Returns true if withdrawal request successful
  Future<bool> withdrawCommission(double amount, String bankAccountId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.withdrawCommission,
        data: {
          'amount': amount,
          'bankAccountId': bankAccountId,
        },
      );

      _earnings = response['earnings'];

      final commission = CommissionModel.fromJson(response['commission']);
      _commissionHistory.insert(0, commission);

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Commission withdrawal failed. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Refresh commission data (earnings and history)
  ///
  /// Returns true if refresh successful
  Future<bool> refresh() async {
    final results = await Future.wait([
      getEarnings(),
      getCommissionHistory(refresh: true),
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
    _earnings = null;
    _commissionHistory.clear();
    _isLoading = false;
    _hasMore = true;
    _currentPage = 1;
    _errorMessage = null;
    notifyListeners();
  }
}
