import 'bank_account_model.dart';

/// Payout model representing a withdrawal request
class PayoutModel {
  /// Unique identifier for the payout
  final String id;

  /// ID of the user requesting the payout
  final String userId;

  /// Payout amount
  final double amount;

  /// Payout method (bank_transfer, upi, wallet)
  final String method;

  /// Bank account ID (if method is bank_transfer)
  final String? bankAccountId;

  /// Bank account details
  final BankAccountModel? bankAccount;

  /// UPI ID (if method is upi)
  final String? upiId;

  /// Payout status (pending, processing, completed, failed, rejected)
  final String status;

  /// Date when the payout was requested
  final DateTime requestDate;

  /// Date when the payout was processed
  final DateTime? processedDate;

  /// Transaction ID from payment gateway
  final String? transactionId;

  /// Admin remarks or reason for rejection
  final String? remarks;

  /// Timestamp when the payout was created
  final DateTime createdAt;

  const PayoutModel({
    required this.id,
    required this.userId,
    required this.amount,
    required this.method,
    required this.status, required this.requestDate, required this.createdAt, this.bankAccountId,
    this.bankAccount,
    this.upiId,
    this.processedDate,
    this.transactionId,
    this.remarks,
  });

  /// Creates a PayoutModel instance from a JSON map
  factory PayoutModel.fromJson(Map<String, dynamic> json) {
    return PayoutModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      amount: (json['amount'] as num).toDouble(),
      method: json['method'] as String,
      bankAccountId: json['bankAccountId'] as String?,
      bankAccount: json['bankAccount'] != null
          ? BankAccountModel.fromJson(json['bankAccount'] as Map<String, dynamic>)
          : null,
      upiId: json['upiId'] as String?,
      status: json['status'] as String,
      requestDate: DateTime.parse(json['requestDate'] as String),
      processedDate: json['processedDate'] != null
          ? DateTime.parse(json['processedDate'] as String)
          : null,
      transactionId: json['transactionId'] as String?,
      remarks: json['remarks'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  /// Converts the PayoutModel instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'amount': amount,
      'method': method,
      'bankAccountId': bankAccountId,
      'bankAccount': bankAccount?.toJson(),
      'upiId': upiId,
      'status': status,
      'requestDate': requestDate.toIso8601String(),
      'processedDate': processedDate?.toIso8601String(),
      'transactionId': transactionId,
      'remarks': remarks,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is PayoutModel &&
        other.id == id &&
        other.userId == userId &&
        other.amount == amount &&
        other.method == method &&
        other.bankAccountId == bankAccountId &&
        other.bankAccount == bankAccount &&
        other.upiId == upiId &&
        other.status == status &&
        other.requestDate == requestDate &&
        other.processedDate == processedDate &&
        other.transactionId == transactionId &&
        other.remarks == remarks &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      userId,
      amount,
      method,
      bankAccountId,
      bankAccount,
      upiId,
      status,
      requestDate,
      processedDate,
      transactionId,
      remarks,
      createdAt,
    );
  }
}
