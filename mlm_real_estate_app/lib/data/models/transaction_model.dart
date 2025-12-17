/// Transaction model representing a financial transaction
class TransactionModel {
  /// Unique identifier for the transaction
  final String id;

  /// Type of transaction (credit, debit, commission, withdrawal, investment, etc.)
  final String type;

  /// Transaction amount
  final double amount;

  /// Description of the transaction
  final String description;

  /// Transaction status (pending, completed, failed, cancelled)
  final String status;

  /// Reference ID for tracking
  final String? referenceId;

  /// Date when the transaction occurred
  final DateTime transactionDate;

  /// Timestamp when the transaction was created
  final DateTime createdAt;

  const TransactionModel({
    required this.id,
    required this.type,
    required this.amount,
    required this.description,
    required this.status,
    required this.transactionDate, required this.createdAt, this.referenceId,
  });

  /// Creates a TransactionModel instance from a JSON map
  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['id'] as String,
      type: json['type'] as String,
      amount: (json['amount'] as num).toDouble(),
      description: json['description'] as String,
      status: json['status'] as String,
      referenceId: json['referenceId'] as String?,
      transactionDate: DateTime.parse(json['transactionDate'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  /// Converts the TransactionModel instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'amount': amount,
      'description': description,
      'status': status,
      'referenceId': referenceId,
      'transactionDate': transactionDate.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is TransactionModel &&
        other.id == id &&
        other.type == type &&
        other.amount == amount &&
        other.description == description &&
        other.status == status &&
        other.referenceId == referenceId &&
        other.transactionDate == transactionDate &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      type,
      amount,
      description,
      status,
      referenceId,
      transactionDate,
      createdAt,
    );
  }
}
