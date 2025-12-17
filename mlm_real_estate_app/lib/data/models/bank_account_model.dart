/// Bank account model representing user's bank account details
class BankAccountModel {
  /// Unique identifier for the bank account
  final String id;

  /// ID of the user who owns this account
  final String userId;

  /// Account holder's name
  final String accountHolderName;

  /// Bank account number
  final String accountNumber;

  /// IFSC code of the bank branch
  final String ifscCode;

  /// Name of the bank
  final String bankName;

  /// Branch name/location
  final String branch;

  /// Account type (savings, current)
  final String accountType;

  /// Whether this is the primary account
  final bool isPrimary;

  /// Account status (active, inactive, pending_verification)
  final String status;

  /// Timestamp when the account was added
  final DateTime createdAt;

  const BankAccountModel({
    required this.id,
    required this.userId,
    required this.accountHolderName,
    required this.accountNumber,
    required this.ifscCode,
    required this.bankName,
    required this.branch,
    required this.accountType,
    required this.isPrimary,
    required this.status,
    required this.createdAt,
  });

  /// Creates a BankAccountModel instance from a JSON map
  factory BankAccountModel.fromJson(Map<String, dynamic> json) {
    return BankAccountModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      accountHolderName: json['accountHolderName'] as String,
      accountNumber: json['accountNumber'] as String,
      ifscCode: json['ifscCode'] as String,
      bankName: json['bankName'] as String,
      branch: json['branch'] as String,
      accountType: json['accountType'] as String,
      isPrimary: json['isPrimary'] as bool,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  /// Converts the BankAccountModel instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'accountHolderName': accountHolderName,
      'accountNumber': accountNumber,
      'ifscCode': ifscCode,
      'bankName': bankName,
      'branch': branch,
      'accountType': accountType,
      'isPrimary': isPrimary,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is BankAccountModel &&
        other.id == id &&
        other.userId == userId &&
        other.accountHolderName == accountHolderName &&
        other.accountNumber == accountNumber &&
        other.ifscCode == ifscCode &&
        other.bankName == bankName &&
        other.branch == branch &&
        other.accountType == accountType &&
        other.isPrimary == isPrimary &&
        other.status == status &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      userId,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      branch,
      accountType,
      isPrimary,
      status,
      createdAt,
    );
  }
}
