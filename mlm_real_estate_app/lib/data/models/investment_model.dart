import 'property_model.dart';

/// Investment model representing a user's property investment
class InvestmentModel {
  /// Unique identifier for the investment
  final String id;

  /// ID of the user who made the investment
  final String userId;

  /// ID of the property being invested in
  final String propertyId;

  /// Property details
  final PropertyModel? property;

  /// Investment amount per unit
  final double amount;

  /// Number of units invested
  final int units;

  /// Total investment amount
  final double totalAmount;

  /// Amount already paid
  final double paidAmount;

  /// Remaining amount to be paid
  final double remainingAmount;

  /// Installment plan details
  final InstallmentPlan? installmentPlan;

  /// List of installments
  final List<Installment> installments;

  /// Investment status (active, completed, cancelled, pending)
  final String status;

  /// Returns information
  final Returns? returns;

  /// Expected returns amount
  final double expectedReturns;

  /// Actual returns received
  final double actualReturns;

  /// Date when the investment was made
  final DateTime investmentDate;

  /// Expected maturity date
  final DateTime? maturityDate;

  /// Timestamp when the investment was created
  final DateTime createdAt;

  const InvestmentModel({
    required this.id,
    required this.userId,
    required this.propertyId,
    required this.amount, required this.units, required this.totalAmount, required this.paidAmount, required this.remainingAmount, required this.installments, required this.status, required this.expectedReturns, required this.actualReturns, required this.investmentDate, required this.createdAt, this.property,
    this.installmentPlan,
    this.returns,
    this.maturityDate,
  });

  /// Creates an InvestmentModel instance from a JSON map
  factory InvestmentModel.fromJson(Map<String, dynamic> json) {
    return InvestmentModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      propertyId: json['propertyId'] as String,
      property: json['property'] != null
          ? PropertyModel.fromJson(json['property'] as Map<String, dynamic>)
          : null,
      amount: (json['amount'] as num).toDouble(),
      units: json['units'] as int,
      totalAmount: (json['totalAmount'] as num).toDouble(),
      paidAmount: (json['paidAmount'] as num).toDouble(),
      remainingAmount: (json['remainingAmount'] as num).toDouble(),
      installmentPlan: json['installmentPlan'] != null
          ? InstallmentPlan.fromJson(json['installmentPlan'] as Map<String, dynamic>)
          : null,
      installments: (json['installments'] as List<dynamic>)
          .map((e) => Installment.fromJson(e as Map<String, dynamic>))
          .toList(),
      status: json['status'] as String,
      returns: json['returns'] != null
          ? Returns.fromJson(json['returns'] as Map<String, dynamic>)
          : null,
      expectedReturns: (json['expectedReturns'] as num).toDouble(),
      actualReturns: (json['actualReturns'] as num).toDouble(),
      investmentDate: DateTime.parse(json['investmentDate'] as String),
      maturityDate: json['maturityDate'] != null
          ? DateTime.parse(json['maturityDate'] as String)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  /// Converts the InvestmentModel instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'propertyId': propertyId,
      'property': property?.toJson(),
      'amount': amount,
      'units': units,
      'totalAmount': totalAmount,
      'paidAmount': paidAmount,
      'remainingAmount': remainingAmount,
      'installmentPlan': installmentPlan?.toJson(),
      'installments': installments.map((e) => e.toJson()).toList(),
      'status': status,
      'returns': returns?.toJson(),
      'expectedReturns': expectedReturns,
      'actualReturns': actualReturns,
      'investmentDate': investmentDate.toIso8601String(),
      'maturityDate': maturityDate?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  /// Creates a copy of this InvestmentModel with the given fields replaced with new values
  InvestmentModel copyWith({
    String? id,
    String? userId,
    String? propertyId,
    PropertyModel? property,
    double? amount,
    int? units,
    double? totalAmount,
    double? paidAmount,
    double? remainingAmount,
    InstallmentPlan? installmentPlan,
    List<Installment>? installments,
    String? status,
    Returns? returns,
    double? expectedReturns,
    double? actualReturns,
    DateTime? investmentDate,
    DateTime? maturityDate,
    DateTime? createdAt,
  }) {
    return InvestmentModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      propertyId: propertyId ?? this.propertyId,
      property: property ?? this.property,
      amount: amount ?? this.amount,
      units: units ?? this.units,
      totalAmount: totalAmount ?? this.totalAmount,
      paidAmount: paidAmount ?? this.paidAmount,
      remainingAmount: remainingAmount ?? this.remainingAmount,
      installmentPlan: installmentPlan ?? this.installmentPlan,
      installments: installments ?? this.installments,
      status: status ?? this.status,
      returns: returns ?? this.returns,
      expectedReturns: expectedReturns ?? this.expectedReturns,
      actualReturns: actualReturns ?? this.actualReturns,
      investmentDate: investmentDate ?? this.investmentDate,
      maturityDate: maturityDate ?? this.maturityDate,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

/// Installment plan details
class InstallmentPlan {
  /// Type of plan (monthly, quarterly, one-time)
  final String type;

  /// Number of installments
  final int numberOfInstallments;

  /// Amount per installment
  final double amountPerInstallment;

  const InstallmentPlan({
    required this.type,
    required this.numberOfInstallments,
    required this.amountPerInstallment,
  });

  /// Creates an InstallmentPlan instance from a JSON map
  factory InstallmentPlan.fromJson(Map<String, dynamic> json) {
    return InstallmentPlan(
      type: json['type'] as String,
      numberOfInstallments: json['numberOfInstallments'] as int,
      amountPerInstallment: (json['amountPerInstallment'] as num).toDouble(),
    );
  }

  /// Converts the InstallmentPlan instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'numberOfInstallments': numberOfInstallments,
      'amountPerInstallment': amountPerInstallment,
    };
  }
}

/// Individual installment details
class Installment {
  /// Installment number
  final int installmentNumber;

  /// Amount for this installment
  final double amount;

  /// Due date
  final DateTime dueDate;

  /// Payment status (paid, pending, overdue)
  final String status;

  /// Date when payment was made
  final DateTime? paidDate;

  const Installment({
    required this.installmentNumber,
    required this.amount,
    required this.dueDate,
    required this.status,
    this.paidDate,
  });

  /// Creates an Installment instance from a JSON map
  factory Installment.fromJson(Map<String, dynamic> json) {
    return Installment(
      installmentNumber: json['installmentNumber'] as int,
      amount: (json['amount'] as num).toDouble(),
      dueDate: DateTime.parse(json['dueDate'] as String),
      status: json['status'] as String,
      paidDate: json['paidDate'] != null
          ? DateTime.parse(json['paidDate'] as String)
          : null,
    );
  }

  /// Converts the Installment instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'installmentNumber': installmentNumber,
      'amount': amount,
      'dueDate': dueDate.toIso8601String(),
      'status': status,
      'paidDate': paidDate?.toIso8601String(),
    };
  }
}

/// Returns information for an investment
class Returns {
  /// Total returns amount
  final double totalReturns;

  /// Returns percentage
  final double returnPercentage;

  /// Monthly returns
  final double monthlyReturns;

  /// Next payout date
  final DateTime? nextPayoutDate;

  const Returns({
    required this.totalReturns,
    required this.returnPercentage,
    required this.monthlyReturns,
    this.nextPayoutDate,
  });

  /// Creates a Returns instance from a JSON map
  factory Returns.fromJson(Map<String, dynamic> json) {
    return Returns(
      totalReturns: (json['totalReturns'] as num).toDouble(),
      returnPercentage: (json['returnPercentage'] as num).toDouble(),
      monthlyReturns: (json['monthlyReturns'] as num).toDouble(),
      nextPayoutDate: json['nextPayoutDate'] != null
          ? DateTime.parse(json['nextPayoutDate'] as String)
          : null,
    );
  }

  /// Converts the Returns instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'totalReturns': totalReturns,
      'returnPercentage': returnPercentage,
      'monthlyReturns': monthlyReturns,
      'nextPayoutDate': nextPayoutDate?.toIso8601String(),
    };
  }
}
