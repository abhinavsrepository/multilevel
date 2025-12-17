import 'package:flutter/material.dart';
import '../models/dashboard_model.dart';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../../core/constants/api_constants.dart';

class DashboardProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient.instance;

  DashboardModel? _dashboardData;
  bool _isLoading = false;
  String? _errorMessage;

  DashboardModel? get dashboardData => _dashboardData;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> getDashboardData() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.dashboard,
      );

      if (response['success'] == true && response['data'] != null) {
        _dashboardData = DashboardModel.fromJson(response['data']);
      } else {
        _setError('Failed to load dashboard data');
      }
    } on ApiError catch (e) {
      _setError(e.message);
    } catch (e) {
      _setError('Unexpected error occurred');
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
  }
}
