import 'package:flutter/material.dart';
import '../models/tree_node_model.dart';
import '../models/user_model.dart';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../../core/constants/api_constants.dart';

/// Tree provider for managing MLM network trees
///
/// Handles binary tree, unilevel tree, direct referrals,
/// and team statistics.
class TreeProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient.instance;

  /// Binary tree data
  TreeNodeModel? _binaryTree;

  /// Unilevel tree data
  TreeNodeModel? _unilevelTree;

  /// Direct referrals list
  List<UserModel> _directReferrals = [];

  /// Team statistics
  Map<String, dynamic>? _teamStats;

  /// Loading state
  bool _isLoading = false;

  /// Error message
  String? _errorMessage;

  /// Get binary tree
  TreeNodeModel? get binaryTree => _binaryTree;

  /// Get unilevel tree
  TreeNodeModel? get unilevelTree => _unilevelTree;

  /// Get direct referrals
  List<UserModel> get directReferrals => _directReferrals;

  /// Get team statistics
  Map<String, dynamic>? get teamStats => _teamStats;

  /// Check if operation is in progress
  bool get isLoading => _isLoading;

  /// Get error message
  String? get errorMessage => _errorMessage;

  /// Get total team members
  int get totalTeamMembers => (_teamStats?['totalMembers'] as int?) ?? 0;

  /// Get total team investment
  double get totalTeamInvestment {
    return (_teamStats?['totalInvestment'] as num?)?.toDouble() ?? 0.0;
  }

  /// Get binary tree for a user
  ///
  /// [userId] - User ID to fetch tree for (optional, defaults to current user)
  ///
  /// Returns true if tree fetched successfully
  Future<bool> getBinaryTree({String? userId}) async {
    _setLoading(true);
    _clearError();

    try {
      final queryParams = userId != null ? {'userId': userId} : null;

      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.binaryTree,
        queryParameters: queryParams,
      );

      _binaryTree = TreeNodeModel.fromJson(response);

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch binary tree. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Get unilevel tree for a user
  ///
  /// [userId] - User ID to fetch tree for (optional, defaults to current user)
  /// [level] - Maximum level depth to fetch (optional)
  ///
  /// Returns true if tree fetched successfully
  Future<bool> getUnilevelTree({String? userId, int? level}) async {
    _setLoading(true);
    _clearError();

    try {
      final queryParams = <String, dynamic>{};
      if (userId != null) queryParams['userId'] = userId;
      if (level != null) queryParams['level'] = level;

      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.unilevelTree,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );

      _unilevelTree = TreeNodeModel.fromJson(response);

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch unilevel tree. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Get direct referrals list
  ///
  /// [refresh] - If true, refreshes the list
  ///
  /// Returns true if referrals fetched successfully
  Future<bool> getDirectReferrals({bool refresh = false}) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.directReferrals,
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      _directReferrals = data
          .map((json) => UserModel.fromJson(json as Map<String, dynamic>))
          .toList();

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch direct referrals. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Get team statistics
  ///
  /// Returns true if statistics fetched successfully
  Future<bool> getTeamStats() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.teamStats,
      );

      _teamStats = response;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch team statistics. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Refresh all tree data
  ///
  /// Returns true if all data refreshed successfully
  Future<bool> refreshAll() async {
    final results = await Future.wait([
      getBinaryTree(),
      getUnilevelTree(),
      getDirectReferrals(refresh: true),
      getTeamStats(),
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
    _binaryTree = null;
    _unilevelTree = null;
    _directReferrals.clear();
    _teamStats = null;
    _isLoading = false;
    _errorMessage = null;
    notifyListeners();
  }
}
