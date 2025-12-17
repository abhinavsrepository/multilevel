/// Commission model representing earnings from referrals and team activity
class CommissionModel {
  /// Unique identifier for the commission
  final String id;

  /// ID of the user receiving the commission
  final String userId;

  /// Type of commission (direct, level, matching, roi, etc.)
  final String type;

  /// Commission amount
  final double amount;

  /// Level in the MLM hierarchy (1, 2, 3, etc.)
  final int level;

  /// ID of the user who generated this commission
  final String fromUserId;

  /// User details who generated this commission
  final CommissionUser? fromUser;

  /// Related property ID (if applicable)
  final String? propertyId;

  /// Related investment ID (if applicable)
  final String? investmentId;

  /// Description of the commission
  final String description;

  /// Commission status (pending, approved, paid, rejected)
  final String status;

  /// Date when the commission was paid
  final DateTime? paidDate;

  /// Timestamp when the commission was created
  final DateTime createdAt;

  const CommissionModel({
    required this.id,
    required this.userId,
    required this.type,
    required this.amount,
    required this.level,
    required this.fromUserId,
    required this.description, required this.status, required this.createdAt, this.fromUser,
    this.propertyId,
    this.investmentId,
    this.paidDate,
  });

  /// Creates a CommissionModel instance from a JSON map
  factory CommissionModel.fromJson(Map<String, dynamic> json) {
    return CommissionModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      type: json['type'] as String,
      amount: (json['amount'] as num).toDouble(),
      level: json['level'] as int,
      fromUserId: json['fromUserId'] as String,
      fromUser: json['fromUser'] != null
          ? CommissionUser.fromJson(json['fromUser'] as Map<String, dynamic>)
          : null,
      propertyId: json['propertyId'] as String?,
      investmentId: json['investmentId'] as String?,
      description: json['description'] as String,
      status: json['status'] as String,
      paidDate: json['paidDate'] != null
          ? DateTime.parse(json['paidDate'] as String)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  /// Converts the CommissionModel instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'type': type,
      'amount': amount,
      'level': level,
      'fromUserId': fromUserId,
      'fromUser': fromUser?.toJson(),
      'propertyId': propertyId,
      'investmentId': investmentId,
      'description': description,
      'status': status,
      'paidDate': paidDate?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is CommissionModel &&
        other.id == id &&
        other.userId == userId &&
        other.type == type &&
        other.amount == amount &&
        other.level == level &&
        other.fromUserId == fromUserId &&
        other.fromUser == fromUser &&
        other.propertyId == propertyId &&
        other.investmentId == investmentId &&
        other.description == description &&
        other.status == status &&
        other.paidDate == paidDate &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      userId,
      type,
      amount,
      level,
      fromUserId,
      fromUser,
      propertyId,
      investmentId,
      description,
      status,
      paidDate,
      createdAt,
    );
  }
}

/// Simplified user model for commission reference
class CommissionUser {
  /// User ID
  final String id;

  /// User's full name
  final String fullName;

  /// User's email
  final String email;

  /// User's profile picture URL
  final String? profilePicture;

  const CommissionUser({
    required this.id,
    required this.fullName,
    required this.email,
    this.profilePicture,
  });

  /// Creates a CommissionUser instance from a JSON map
  factory CommissionUser.fromJson(Map<String, dynamic> json) {
    return CommissionUser(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      email: json['email'] as String,
      profilePicture: json['profilePicture'] as String?,
    );
  }

  /// Converts the CommissionUser instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'email': email,
      'profilePicture': profilePicture,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is CommissionUser &&
        other.id == id &&
        other.fullName == fullName &&
        other.email == email &&
        other.profilePicture == profilePicture;
  }

  @override
  int get hashCode {
    return Object.hash(id, fullName, email, profilePicture);
  }
}
