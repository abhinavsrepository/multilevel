import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../models/api_response_model.dart';
import '../models/tree_node_model.dart';
import '../models/user_model.dart';

/// Repository for handling MLM tree and network operations
class TreeRepository {
  final ApiClient _apiClient;

  TreeRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient.instance;

  /// Get binary tree structure for a user
  ///
  /// [userId] - User ID to fetch tree for (optional, defaults to current user)
  ///
  /// Returns [ApiResponse] containing binary [TreeNode] structure
  Future<ApiResponse<TreeNodeModel>> getBinaryTree({
    String? userId,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/tree/binary',
        queryParameters: {
          if (userId != null) 'userId': userId,
        },
      );

      return ApiResponse.fromJson(
        response,
        (data) => TreeNodeModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch binary tree: ${e.toString()}',
      );
    }
  }

  /// Get unilevel tree structure for a user
  ///
  /// [userId] - User ID to fetch tree for (optional, defaults to current user)
  /// [level] - Tree depth level to fetch (optional)
  ///
  /// Returns [ApiResponse] containing unilevel [TreeNode] structure
  Future<ApiResponse<TreeNodeModel>> getUnilevelTree({
    String? userId,
    int? level,
  }) async {
    try {
      final queryParams = <String, String>{
        if (userId != null) 'userId': userId,
        if (level != null) 'level': level.toString(),
      };

      final response = await _apiClient.get<Map<String, dynamic>>(
        '/tree/unilevel',
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );

      return ApiResponse.fromJson(
        response,
        (data) => TreeNodeModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch unilevel tree: ${e.toString()}',
      );
    }
  }

  /// Get direct referrals list
  ///
  /// [page] - Page number (default: 1)
  /// [limit] - Items per page (default: 10)
  ///
  /// Returns [ApiResponse] containing list of direct referral [User] objects
  Future<ApiResponse<List<UserModel>>> getDirectReferrals({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/tree/direct-referrals',
        queryParameters: {
          'page': page.toString(),
          'limit': limit.toString(),
        },
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => UserModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch direct referrals: ${e.toString()}',
      );
    }
  }

  /// Get team statistics
  ///
  /// Returns [ApiResponse] containing team stats (total members, active members, etc.)
  Future<ApiResponse<Map<String, dynamic>>> getTeamStats() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/tree/team-stats',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch team stats: ${e.toString()}',
      );
    }
  }

  /// Get all team members
  ///
  /// [page] - Page number (default: 1)
  /// [limit] - Items per page (default: 10)
  ///
  /// Returns [ApiResponse] containing list of team member [User] objects
  Future<ApiResponse<List<UserModel>>> getTeamMembers({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/tree/team-members',
        queryParameters: {
          'page': page.toString(),
          'limit': limit.toString(),
        },
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => UserModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch team members: ${e.toString()}',
      );
    }
  }
}
