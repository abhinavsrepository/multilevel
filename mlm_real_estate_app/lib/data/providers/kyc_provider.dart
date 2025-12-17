import 'dart:io';
import 'package:flutter/material.dart';
import '../models/kyc_document_model.dart';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../../core/constants/api_constants.dart';

/// KYC provider for managing Know Your Customer verification
///
/// Handles KYC status retrieval, document uploads, and submission.
class KycProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient.instance;

  /// KYC status information
  Map<String, dynamic>? _kycStatus;

  /// List of uploaded KYC documents
  List<KycDocumentModel> _documents = [];

  /// Loading state
  bool _isLoading = false;

  /// Error message
  String? _errorMessage;

  /// Get KYC status
  Map<String, dynamic>? get kycStatus => _kycStatus;

  /// Get documents list
  List<KycDocumentModel> get documents => _documents;

  /// Check if operation is in progress
  bool get isLoading => _isLoading;

  /// Get error message
  String? get errorMessage => _errorMessage;

  /// Get KYC verification status
  String get verificationStatus => _kycStatus?['status'] as String? ?? 'pending';

  /// Check if KYC is verified
  bool get isVerified => verificationStatus == 'verified';

  /// Check if KYC is pending
  bool get isPending => verificationStatus == 'pending';

  /// Check if KYC is rejected
  bool get isRejected => verificationStatus == 'rejected';

  /// Get KYC status from server
  ///
  /// Returns true if status fetched successfully
  Future<bool> getKycStatus() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.kycStatus,
      );

      _kycStatus = response;

      if (response['documents'] != null) {
        final List<dynamic> docs = response['documents'] as List<dynamic>;
        _documents = docs
            .map((json) => KycDocumentModel.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch KYC status. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Upload KYC document
  ///
  /// [type] - Document type (aadhar, pan, passport, etc.)
  /// [frontFile] - Front side of document
  /// [backFile] - Back side of document (optional for some types)
  ///
  /// Returns true if document uploaded successfully
  Future<bool> uploadDocument(
    String type,
    File frontFile, {
    File? backFile,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final files = <File>[frontFile];
      if (backFile != null) files.add(backFile);

      final response = await _apiClient.uploadMultipleFiles<Map<String, dynamic>>(
        ApiConstants.uploadDocument,
        files: files,
        fieldName: 'documents',
        data: {'type': type},
      );

      final document = KycDocumentModel.fromJson(response);

      final existingIndex = _documents.indexWhere((d) => d.documentType == type);
      if (existingIndex != -1) {
        _documents[existingIndex] = document;
      } else {
        _documents.add(document);
      }

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to upload document. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Submit KYC for verification
  ///
  /// [data] - Additional KYC data (address, DOB, etc.)
  ///
  /// Returns true if KYC submitted successfully
  Future<bool> submitKyc(Map<String, dynamic> data) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.submitKyc,
        data: data,
      );

      _kycStatus = response;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to submit KYC. Please try again.');
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
    _kycStatus = null;
    _documents.clear();
    _isLoading = false;
    _errorMessage = null;
    notifyListeners();
  }
}
