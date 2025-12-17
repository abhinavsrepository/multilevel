import 'package:flutter/material.dart';
import '../models/payout_model.dart';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../../core/constants/api_constants.dart';

/// Payout provider for managing payout requests
///
/// Handles payout listing, creation, and cancellation
/// with pagination support.
class PayoutProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient.instance;

  /// List of payouts
  List<PayoutModel> _payouts = [];

  /// Loading state
  bool _isLoading = false;

  /// Has more payouts to load
  bool _hasMore = true;

  /// Current page number
  int _currentPage = 1;

  /// Error message
  String? _errorMessage;

  /// Items per page
  static const int _itemsPerPage = 20;

  /// Get payouts list
  List<PayoutModel> get payouts => _payouts;

  /// Check if operation is in progress
  bool get isLoading => _isLoading;

  /// Check if more payouts available
  bool get hasMore => _hasMore;

  /// Get current page
  int get currentPage => _currentPage;

  /// Get error message
  String? get errorMessage => _errorMessage;

  /// Get pending payouts
  List<PayoutModel> get pendingPayouts {
    return _payouts.where((p) => p.status == 'pending').toList();
  }

  /// Get completed payouts
  List<PayoutModel> get completedPayouts {
    return _payouts.where((p) => p.status == 'completed').toList();
  }

  /// Get payouts with pagination
  ///
  /// [refresh] - If true, resets pagination and fetches from beginning
  ///
  /// Returns true if payouts fetched successfully
  Future<bool> getPayouts({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _payouts.clear();
    }

    if (!_hasMore && !refresh) return true;

    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.payoutList,
        queryParameters: {
          'page': _currentPage,
          'limit': _itemsPerPage,
        },
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      final List<PayoutModel> fetchedPayouts = data
          .map((json) => PayoutModel.fromJson(json as Map<String, dynamic>))
          .toList();

      if (refresh) {
        _payouts = fetchedPayouts;
      } else {
        _payouts.addAll(fetchedPayouts);
      }

      _hasMore = fetchedPayouts.length >= _itemsPerPage;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch payouts. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Load more payouts (pagination)
  ///
  /// Returns true if more payouts loaded successfully
  Future<bool> loadMore() async {
    if (!_hasMore || _isLoading) return false;

    _currentPage++;
    return await getPayouts();
  }

  /// Request a new payout
  ///
  /// [amount] - Amount to request
  /// [method] - Payout method (bank_transfer, upi, etc.)
  /// [bankAccountId] - Bank account ID for payout
  ///
  /// Returns true if payout requested successfully
  Future<bool> requestPayout(
    double amount,
    String method,
    String bankAccountId,
  ) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.requestPayout,
        data: {
          'amount': amount,
          'method': method,
          'bankAccountId': bankAccountId,
        },
      );

      final newPayout = PayoutModel.fromJson(response);
      _payouts.insert(0, newPayout);

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to request payout. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Cancel a payout request
  ///
  /// [id] - Payout ID to cancel
  ///
  /// Returns true if payout cancelled successfully
  Future<bool> cancelPayout(String id) async {
    _setLoading(true);
    _clearError();

    try {
      await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.replacePathParam(
          ApiConstants.cancelPayout,
          'id',
          id,
        ),
      );

      final index = _payouts.indexWhere((p) => p.id == id);
      if (index != -1) {
        // COMMENTED OUT: PayoutModel.copyWith not implementedn        // TODO: Implement PayoutModel.copyWith or update status directly
      }

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to cancel payout. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
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
    _payouts.clear();
    _isLoading = false;
    _hasMore = true;
    _currentPage = 1;
    _errorMessage = null;
    notifyListeners();
  }
}
