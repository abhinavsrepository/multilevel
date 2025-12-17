import 'dart:io';
import 'package:flutter/material.dart';
import '../models/ticket_model.dart';
import '../../network/api_client.dart';
import '../../network/api_error.dart';
import '../../core/constants/api_constants.dart';

/// Ticket provider for managing support tickets
///
/// Handles ticket listing, creation, replies, and closing
/// with pagination support.
class TicketProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient.instance;

  /// List of tickets
  List<TicketModel> _tickets = [];

  /// Selected ticket for detail view
  TicketModel? _selectedTicket;

  /// Loading state
  bool _isLoading = false;

  /// Has more tickets to load
  bool _hasMore = true;

  /// Current page number
  int _currentPage = 1;

  /// Error message
  String? _errorMessage;

  /// Items per page
  static const int _itemsPerPage = 20;

  /// Get tickets list
  List<TicketModel> get tickets => _tickets;

  /// Get selected ticket
  TicketModel? get selectedTicket => _selectedTicket;

  /// Check if operation is in progress
  bool get isLoading => _isLoading;

  /// Check if more tickets available
  bool get hasMore => _hasMore;

  /// Get current page
  int get currentPage => _currentPage;

  /// Get error message
  String? get errorMessage => _errorMessage;

  /// Get open tickets
  List<TicketModel> get openTickets {
    return _tickets.where((t) => t.status == 'open').toList();
  }

  /// Get closed tickets
  List<TicketModel> get closedTickets {
    return _tickets.where((t) => t.status == 'closed').toList();
  }

  /// Get tickets with pagination
  ///
  /// [refresh] - If true, resets pagination and fetches from beginning
  ///
  /// Returns true if tickets fetched successfully
  Future<bool> getTickets({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _tickets.clear();
    }

    if (!_hasMore && !refresh) return true;

    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.ticketList,
        queryParameters: {
          'page': _currentPage,
          'limit': _itemsPerPage,
        },
      );

      final List<dynamic> data = response['data'] as List<dynamic>;
      final List<TicketModel> fetchedTickets = data
          .map((json) => TicketModel.fromJson(json as Map<String, dynamic>))
          .toList();

      if (refresh) {
        _tickets = fetchedTickets;
      } else {
        _tickets.addAll(fetchedTickets);
      }

      _hasMore = fetchedTickets.length >= _itemsPerPage;

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch tickets. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Load more tickets (pagination)
  ///
  /// Returns true if more tickets loaded successfully
  Future<bool> loadMore() async {
    if (!_hasMore || _isLoading) return false;

    _currentPage++;
    return await getTickets();
  }

  /// Create a new support ticket
  ///
  /// [data] - Ticket data including subject, category, priority, message
  ///
  /// Returns true if ticket created successfully
  Future<bool> createTicket(Map<String, dynamic> data) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.createTicket,
        data: data,
      );

      final newTicket = TicketModel.fromJson(response);
      _tickets.insert(0, newTicket);

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to create ticket. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Get ticket detail by ID
  ///
  /// [id] - Ticket ID
  ///
  /// Returns true if ticket fetched successfully
  Future<bool> getTicketDetail(String id) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        ApiConstants.replacePathParam(
          ApiConstants.ticketDetail,
          'id',
          id,
        ),
      );

      _selectedTicket = TicketModel.fromJson(response);

      final index = _tickets.indexWhere((t) => t.id == id);
      if (index != -1) {
        _tickets[index] = _selectedTicket!;
      }

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to fetch ticket details. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Reply to a ticket
  ///
  /// [id] - Ticket ID
  /// [message] - Reply message
  /// [attachments] - Optional file attachments
  ///
  /// Returns true if reply sent successfully
  Future<bool> replyToTicket(
    String id,
    String message, {
    List<File>? attachments,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      Map<String, dynamic> response;

      if (attachments != null && attachments.isNotEmpty) {
        response = await _apiClient.uploadMultipleFiles<Map<String, dynamic>>(
          ApiConstants.replacePathParam(
            ApiConstants.replyTicket,
            'id',
            id,
          ),
          files: attachments,
          fieldName: 'attachments',
          data: {'message': message},
        );
      } else {
        response = await _apiClient.post<Map<String, dynamic>>(
          ApiConstants.replacePathParam(
            ApiConstants.replyTicket,
            'id',
            id,
          ),
          data: {'message': message},
        );
      }

      _selectedTicket = TicketModel.fromJson(response);

      final index = _tickets.indexWhere((t) => t.id == id);
      if (index != -1) {
        _tickets[index] = _selectedTicket!;
      }

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to send reply. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Close a ticket
  ///
  /// [id] - Ticket ID to close
  ///
  /// Returns true if ticket closed successfully
  Future<bool> closeTicket(String id) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.replacePathParam(
          ApiConstants.closeTicket,
          'id',
          id,
        ),
      );

      final updatedTicket = TicketModel.fromJson(response);

      final index = _tickets.indexWhere((t) => t.id == id);
      if (index != -1) {
        _tickets[index] = updatedTicket;
      }

      if (_selectedTicket?.id == id) {
        _selectedTicket = updatedTicket;
      }

      notifyListeners();
      return true;
    } on ApiError catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Failed to close ticket. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Clear selected ticket
  void clearSelectedTicket() {
    _selectedTicket = null;
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
    _tickets.clear();
    _selectedTicket = null;
    _isLoading = false;
    _hasMore = true;
    _currentPage = 1;
    _errorMessage = null;
    notifyListeners();
  }
}
