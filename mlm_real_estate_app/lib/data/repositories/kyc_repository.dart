import 'dart:io';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../models/api_response_model.dart';
import '../models/kyc_document_model.dart';

/// Repository for handling KYC (Know Your Customer) operations
class KycRepository {
  final ApiClient _apiClient;

  KycRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient.instance;

  /// Get current KYC status
  ///
  /// Returns [ApiResponse] containing KYC status information
  Future<ApiResponse<Map<String, dynamic>>> getKycStatus() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/kyc/status',
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch KYC status: ${e.toString()}',
      );
    }
  }

  /// Upload KYC document
  ///
  /// [type] - Document type (aadhaar, pan, passport, etc.)
  /// [frontFile] - Front side of document
  /// [backFile] - Back side of document (optional, for documents like Aadhaar)
  ///
  /// Returns [ApiResponse] containing [KycDocumentModel] with upload details
  Future<ApiResponse<KycDocumentModel>> uploadDocument({
    required String type,
    required File frontFile,
    File? backFile,
  }) async {
    try {
      final files = [frontFile];
      if (backFile != null) {
        files.add(backFile);
      }

      final response = await _apiClient.uploadMultipleFiles<Map<String, dynamic>>(
        '/kyc/upload-document',
        files: files,
        fieldName: 'documents',
        data: {
          'type': type,
        },
      );

      return ApiResponse.fromJson(
        response,
        (data) => KycDocumentModel.fromJson(data as Map<String, dynamic>),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Document upload failed: ${e.toString()}',
      );
    }
  }

  /// Submit KYC application
  ///
  /// [data] - KYC form data (name, address, document numbers, etc.)
  ///
  /// Returns [ApiResponse] containing submission result
  Future<ApiResponse<Map<String, dynamic>>> submitKyc({
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/kyc/submit',
        data: data,
      );

      return ApiResponse.fromJson(response, (data) => data as Map<String, dynamic>);
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'KYC submission failed: ${e.toString()}',
      );
    }
  }

  /// Get KYC requirements
  ///
  /// Returns [ApiResponse] containing list of required documents and fields
  Future<ApiResponse<List<Map<String, dynamic>>>> getKycRequirements() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/kyc/requirements',
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
        message: 'Failed to fetch KYC requirements: ${e.toString()}',
      );
    }
  }

  /// Get KYC history
  ///
  /// Returns [ApiResponse] containing list of KYC submissions and their statuses
  Future<ApiResponse<List<KycDocumentModel>>> getKycHistory() async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/kyc/history',
      );

      return ApiResponse.fromJson(
        response,
        (data) => (data as List<dynamic>)
            .map((item) => KycDocumentModel.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on ApiError catch (e) {
      return ApiResponse.error(
        message: e.message,
      );
    } catch (e) {
      return ApiResponse.error(
        message: 'Failed to fetch KYC history: ${e.toString()}',
      );
    }
  }
}
