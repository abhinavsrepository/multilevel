import 'package:flutter/material.dart';
import '../models/rank_model.dart';
import '../models/achievement_model.dart';
import '../repositories/rank_repository.dart';
import '../../network/api_error.dart';

/// Provider for managing rank and achievement data
class RankProvider extends ChangeNotifier {
  final RankRepository _rankRepository = RankRepository();

  /// Current user rank
  RankModel? _currentRank;

  /// List of all available ranks
  List<RankModel> _allRanks = [];

  /// Rank progress data
  Map<String, dynamic>? _rankProgress;

  /// List of achievements
  List<AchievementModel> _achievements = [];

  /// Rank history
  List<Map<String, dynamic>> _rankHistory = [];

  /// Loading state
  bool _isLoading = false;

  /// Error message
  String? _errorMessage;

  /// Get current rank
  RankModel? get currentRank => _currentRank;

  /// Get all ranks
  List<RankModel> get allRanks => _allRanks;

  /// Get rank progress
  Map<String, dynamic>? get rankProgress => _rankProgress;

  /// Get achievements
  List<AchievementModel> get achievements => _achievements;

  /// Get unlocked achievements
  List<AchievementModel> get unlockedAchievements =>
      _achievements.where((a) => a.isUnlocked).toList();

  /// Get locked achievements
  List<AchievementModel> get lockedAchievements =>
      _achievements.where((a) => !a.isUnlocked).toList();

  /// Get rank history
  List<Map<String, dynamic>> get rankHistory => _rankHistory;

  /// Check if operation is in progress
  bool get isLoading => _isLoading;

  /// Get error message
  String? get errorMessage => _errorMessage;

  /// Get next rank
  RankModel? get nextRank {
    if (_currentRank == null || _allRanks.isEmpty) return null;

    final currentIndex = _allRanks.indexWhere((r) => r.id == _currentRank!.id);
    if (currentIndex == -1 || currentIndex >= _allRanks.length - 1) {
      return null;
    }

    return _allRanks[currentIndex + 1];
  }

  /// Get progress percentage to next rank
  double get progressToNextRank {
    if (_rankProgress == null) return 0.0;
    return (_rankProgress!['progressPercentage'] as num?)?.toDouble() ?? 0.0;
  }

  /// Fetch current rank
  Future<bool> fetchCurrentRank() async {
    _setLoading(true);
    _clearError();

    try {
      _currentRank = await _rankRepository.getCurrentRank();
      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch current rank. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Fetch all ranks
  Future<bool> fetchAllRanks() async {
    _setLoading(true);
    _clearError();

    try {
      _allRanks = await _rankRepository.getAllRanks();
      // Sort by order
      _allRanks.sort((a, b) => a.order.compareTo(b.order));
      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch ranks. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Fetch rank progress
  Future<bool> fetchRankProgress() async {
    _setLoading(true);
    _clearError();

    try {
      _rankProgress = await _rankRepository.getRankProgress();
      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch rank progress. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Fetch achievements
  Future<bool> fetchAchievements() async {
    _setLoading(true);
    _clearError();

    try {
      _achievements = await _rankRepository.getAchievements();
      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch achievements. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Fetch rank history
  Future<bool> fetchRankHistory() async {
    _setLoading(true);
    _clearError();

    try {
      _rankHistory = await _rankRepository.getRankHistory();
      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch rank history. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Refresh all rank data
  Future<bool> refreshAll() async {
    final results = await Future.wait([
      fetchCurrentRank(),
      fetchAllRanks(),
      fetchRankProgress(),
      fetchAchievements(),
      fetchRankHistory(),
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
    _currentRank = null;
    _allRanks.clear();
    _rankProgress = null;
    _achievements.clear();
    _rankHistory.clear();
    _isLoading = false;
    _errorMessage = null;
    notifyListeners();
  }
}
