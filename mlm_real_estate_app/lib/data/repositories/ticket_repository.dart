import 'dart:io';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../models/api_response_model.dart';
import '../models/ticket_model.dart';

/// Repository for handling support ticket operations
class TicketModelRepository {
  final ApiClient _apiClient;

  TicketModelRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient.instance;

  /// Get paginated list of support tickets
  ///
  /// [page] - Page number (default: 1)
  /// [limit] - Items per page (default: 10)
  ///
  /// Returns [ApiResponse] containing list of [TicketModel] objects
  Future<ApiResponse<List<TicketModel>>> getTicketModels({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/tickets',
        queryParameters: {
          'page': page.toString(),
          'limit': limit.toString(),
        },
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => TicketModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch tickets: ${e.toString()}',
      );
    }
  }

  /// Create a new support ticket
  ///
  /// [subject] - TicketModel subject
  /// [category] - TicketModel category
  /// [priority] - TicketModel priority (low, medium, high)
  /// [description] - Detailed description of the issue
  /// [attachments] - Optional file attachments
  ///
  /// Returns [ApiResponse] containing created [TicketModel]
  Future<ApiResponse<TicketModel>> createTicketModel({
    required String subject,
    required String category,
    required String priority,
    required String description,
    List<File>? attachments,
  }) async {
    try {
      final Map<String, dynamic> response;

      if (attachments != null && attachments.isNotEmpty) {
        // Upload with attachments
        response = await _apiClient.uploadMultipleFiles<Map<String, dynamic>>(
          '/tickets',
          files: attachments,
          fieldName: 'attachments',
          data: {
            'subject': subject,
            'category': category,
            'priority': priority,
            'description': description,
          },
        );
      } else {
        // Create without attachments
        response = await _apiClient.post<Map<String, dynamic>>(
          '/tickets',
          data: {
            'subject': subject,
            'category': category,
            'priority': priority,
            'description': description,
          },
        );
      }

      return ApiResponse.fromJson(
        response,
        (data) => TicketModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to create ticket: ${e.toString()}',
      );
    }
  }

  /// Get detailed information about a specific ticket
  ///
  /// [id] - TicketModel ID
  ///
  /// Returns [ApiResponse] containing [TicketModel] details with messages
  Future<ApiResponse<TicketModel>> getTicketModelDetail({
    required String id,
  }) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/tickets/$id',
      );

      return ApiResponse.fromJson(
        response,
        (data) => TicketModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch ticket details: ${e.toString()}',
      );
    }
  }

  /// Reply to a ticket
  ///
  /// [id] - TicketModel ID to reply to
  /// [message] - Reply message
  /// [attachments] - Optional file attachments
  ///
  /// Returns [ApiResponse] containing updated [TicketModel]
  Future<ApiResponse<TicketModel>> replyToTicketModel({
    required String id,
    required String message,
    List<File>? attachments,
  }) async {
    try {
      final Map<String, dynamic> response;

      if (attachments != null && attachments.isNotEmpty) {
        // Reply with attachments
        response = await _apiClient.uploadMultipleFiles<Map<String, dynamic>>(
          '/tickets/$id/reply',
          files: attachments,
          fieldName: 'attachments',
          data: {
            'message': message,
          },
        );
      } else {
        // Reply without attachments
        response = await _apiClient.post<Map<String, dynamic>>(
          '/tickets/$id/reply',
          data: {
            'message': message,
          },
        );
      }

      return ApiResponse.fromJson(
        response,
        (data) => TicketModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to reply to ticket: ${e.toString()}',
      );
    }
  }

  /// Close a ticket
  ///
  /// [id] - TicketModel ID to close
  ///
  /// Returns [ApiResponse] containing closure result
  Future<ApiResponse<Map<String, dynamic>>> closeTicketModel({
    required String id,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/tickets/$id/close',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to close ticket: ${e.toString()}',
      );
    }
  }

  /// Get available ticket categories
  ///
  /// Returns [ApiResponse] containing list of ticket categories
  Future<ApiResponse<List<Map<String, dynamic>>>> getTicketModelCategories() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/tickets/categories',
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => item as Map<String, dynamic>)
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
        
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch ticket categories: ${e.toString()}',
      );
    }
  }
}
