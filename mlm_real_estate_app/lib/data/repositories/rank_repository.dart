import '../models/rank_model.dart';
import '../models/achievement_model.dart';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../../core/constants/api_constants.dart';

/// Repository for rank-related API operations
class RankRepository {
  final ApiClient _apiClient = ApiClient.instance;

  /// Get current user rank information
  Future<RankModel> getCurrentRank() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '${ApiConstants.baseUrl}/ranks/current',
      );

      return RankModel.fromJson(response);
    } on ApiError {
      rethrow;
    } catch (e) {
      throw ApiError(
        message: 'Failed to fetch current rank',
        type: ApiErrorType.unknown,
      );
    }
  }

  /// Get all available ranks
  Future<List<RankModel>> getAllRanks() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '${ApiConstants.baseUrl}/ranks',
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      return data
          .map((json) => RankModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on ApiError {
      rethrow;
    } catch (e) {
      throw ApiError(
        message: 'Failed to fetch ranks',
        type: ApiErrorType.unknown,
      );
    }
  }

  /// Get rank progress information
  Future<Map<String, dynamic>> getRankProgress() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '${ApiConstants.baseUrl}/ranks/progress',
      );

      return response;
    } on ApiError {
      rethrow;
    } catch (e) {
      throw ApiError(
        message: 'Failed to fetch rank progress',
        type: ApiErrorType.unknown,
      );
    }
  }

  /// Get user achievements
  Future<List<AchievementModel>> getAchievements() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '${ApiConstants.baseUrl}/achievements',
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      return data
          .map((json) => AchievementModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on ApiError {
      rethrow;
    } catch (e) {
      throw ApiError(
        message: 'Failed to fetch achievements',
        type: ApiErrorType.unknown,
      );
    }
  }

  /// Get rank history
  Future<List<Map<String, dynamic>>> getRankHistory() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '${ApiConstants.baseUrl}/ranks/history',
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      return data.map((e) => e as Map<String, dynamic>).toList();
    } on ApiError {
      rethrow;
    } catch (e) {
      throw ApiError(
        message: 'Failed to fetch rank history',
        type: ApiErrorType.unknown,
      );
    }
  }
}
