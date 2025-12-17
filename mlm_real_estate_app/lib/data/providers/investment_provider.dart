import 'package:flutter/material.dart';
import '../models/investment_model.dart';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../../core/constants/api_constants.dart';

/// Investment provider for managing user investments
///
/// Handles investment creation, retrieval, installment payments,
/// and portfolio management with pagination support.
class InvestmentProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient.instance;

  /// List of investments
  List<InvestmentModel> _investments = [];

  /// Selected investment for detail view
  InvestmentModel? _selectedInvestment;

  /// Portfolio summary data
  Map<String, dynamic>? _portfolio;

  /// Loading state
  bool _isLoading = false;

  /// Has more investments to load
  bool _hasMore = true;

  /// Current page number
  int _currentPage = 1;

  /// Error message
  String? _errorMessage;

  /// Items per page
  static const int _itemsPerPage = 20;

  /// Get investments list
  List<InvestmentModel> get investments => _investments;

  /// Get selected investment
  InvestmentModel? get selectedInvestment => _selectedInvestment;

  /// Get portfolio data
  Map<String, dynamic>? get portfolio => _portfolio;

  /// Check if operation is in progress
  bool get isLoading => _isLoading;

  /// Check if more investments available
  bool get hasMore => _hasMore;

  /// Get current page
  int get currentPage => _currentPage;

  /// Get error message
  String? get errorMessage => _errorMessage;

  /// Get total investment amount
  double get totalInvestment {
    return _investments.fold<double>(
      0,
      (sum, investment) => sum + investment.totalAmount,
    );
  }

  /// Get investments with pagination
  ///
  /// [refresh] - If true, resets pagination and fetches from beginning
  ///
  /// Returns true if investments fetched successfully
  Future<bool> getInvestments({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _investments.clear();
    }

    if (!_hasMore && !refresh) return true;

    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.investmentList,
        queryParameters: {
          'page': _currentPage,
          'limit': _itemsPerPage,
        },
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      final List<InvestmentModel> fetchedInvestments = data
          .map((json) => InvestmentModel.fromJson(json as Map<String, dynamic>))
          .toList();

      if (refresh) {
        _investments = fetchedInvestments;
      } else {
        _investments.addAll(fetchedInvestments);
      }

      _hasMore = fetchedInvestments.length >= _itemsPerPage;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch investments. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Load more investments (pagination)
  ///
  /// Returns true if more investments loaded successfully
  Future<bool> loadMore() async {
    if (!_hasMore || _isLoading) return false;

    _currentPage++;
    return await getInvestments();
  }

  /// Create new investment
  ///
  /// [propertyId] - ID of property to invest in
  /// [amount] - Investment amount
  /// [units] - Number of units to purchase
  ///
  /// Returns true if investment created successfully
  Future<bool> createInvestment(
    String propertyId,
    double amount,
    int units,
  ) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.createInvestment,
        data: {
          'propertyId': propertyId,
          'amount': amount,
          'units': units,
        },
      );

      final newInvestment = InvestmentModel.fromJson(response);
      _investments.insert(0, newInvestment);

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to create investment. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Get investment detail by ID
  ///
  /// [id] - Investment ID
  ///
  /// Returns true if investment fetched successfully
  Future<bool> getInvestmentDetail(String id) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.replacePathParam(
          ApiConstants.investmentDetail,
          'id',
          id,
        ),
      );

      _selectedInvestment = InvestmentModel.fromJson(response);

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch investment details. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Pay investment installment
  ///
  /// [installmentId] - Installment ID to pay
  /// [amount] - Payment amount
  ///
  /// Returns true if payment successful
  Future<bool> payInstallment(String installmentId, double amount) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.replacePathParam(
          ApiConstants.payInstallment,
          'id',
          installmentId,
        ),
        data: {
          'amount': amount,
        },
      );

      final updatedInvestment = InvestmentModel.fromJson(response);

      final index = _investments.indexWhere((inv) => inv.id == updatedInvestment.id);
      if (index != -1) {
        _investments[index] = updatedInvestment;
      }

      if (_selectedInvestment?.id == updatedInvestment.id) {
        _selectedInvestment = updatedInvestment;
      }

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to pay installment. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Get investment portfolio summary
  ///
  /// Returns true if portfolio fetched successfully
  Future<bool> getPortfolio() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.investmentSummary,
      );

      _portfolio = response;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch portfolio. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Clear selected investment
  void clearSelectedInvestment() {
    _selectedInvestment = null;
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
    _investments.clear();
    _selectedInvestment = null;
    _portfolio = null;
    _isLoading = false;
    _hasMore = true;
    _currentPage = 1;
    _errorMessage = null;
    notifyListeners();
  }
}
