/// User model representing a user in the MLM Real Estate system
class UserModel {
  /// Unique identifier for the user
  final String id;

  /// User ID for display purposes
  final String userId;

  /// Full name of the user
  final String fullName;

  /// Email address of the user
  final String email;

  /// Mobile number of the user
  final String mobile;

  /// URL to the user's profile picture
  final String? profilePicture;

  /// Current rank of the user in the MLM hierarchy
  final String rank;

  /// Account status (active, inactive, suspended, etc.)
  final String status;

  /// KYC verification status (pending, verified, rejected)
  final String kycStatus;

  /// Total amount invested by the user
  final double totalInvestment;

  /// Total earnings accumulated by the user
  final double totalEarnings;

  /// ID of the sponsor who referred this user
  final String? sponsorId;

  /// Placement position in the binary tree (left, right)
  final String? placement;

  /// Timestamp when the user account was created
  final DateTime createdAt;

  /// Timestamp when the user account was last updated
  final DateTime updatedAt;

  const UserModel({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.email,
    required this.mobile,
    required this.rank, required this.status, required this.kycStatus, required this.totalInvestment, required this.totalEarnings, required this.createdAt, required this.updatedAt, this.profilePicture,
    this.sponsorId,
    this.placement,
  });

  /// Creates a UserModel instance from a JSON map
  factory UserModel.fromJson(Map<String, dynamic> json) {
    // Handle both backend formats
    final String firstName = json['firstName'] as String? ?? '';
    final String lastName = json['lastName'] as String? ?? '';
    final String fullName = json['fullName'] as String? ??
        (firstName.isNotEmpty || lastName.isNotEmpty
            ? '$firstName ${lastName}'.trim()
            : '');

    return UserModel(
      id: json['id']?.toString() ?? '',
      userId: json['userId'] as String? ?? json['username'] as String? ?? json['id']?.toString() ?? '',
      fullName: fullName,
      email: json['email'] as String? ?? '',
      mobile: json['mobile'] as String? ?? json['phoneNumber'] as String? ?? '',
      profilePicture: json['profilePicture'] as String?,
      rank: json['rank'] as String? ?? 'MEMBER',
      status: json['status'] as String? ?? 'ACTIVE',
      kycStatus: json['kycStatus'] as String? ?? 'PENDING',
      totalInvestment: (json['totalInvestment'] as num?)?.toDouble() ?? 0.0,
      totalEarnings: (json['totalEarnings'] as num?)?.toDouble() ?? 0.0,
      sponsorId: json['sponsorId']?.toString(),
      placement: json['placement'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : DateTime.now(),
    );
  }

  /// Converts the UserModel instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'fullName': fullName,
      'email': email,
      'mobile': mobile,
      'profilePicture': profilePicture,
      'rank': rank,
      'status': status,
      'kycStatus': kycStatus,
      'totalInvestment': totalInvestment,
      'totalEarnings': totalEarnings,
      'sponsorId': sponsorId,
      'placement': placement,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Creates a copy of this UserModel with the given fields replaced with new values
  UserModel copyWith({
    String? id,
    String? userId,
    String? fullName,
    String? email,
    String? mobile,
    String? profilePicture,
    String? rank,
    String? status,
    String? kycStatus,
    double? totalInvestment,
    double? totalEarnings,
    String? sponsorId,
    String? placement,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      mobile: mobile ?? this.mobile,
      profilePicture: profilePicture ?? this.profilePicture,
      rank: rank ?? this.rank,
      status: status ?? this.status,
      kycStatus: kycStatus ?? this.kycStatus,
      totalInvestment: totalInvestment ?? this.totalInvestment,
      totalEarnings: totalEarnings ?? this.totalEarnings,
      sponsorId: sponsorId ?? this.sponsorId,
      placement: placement ?? this.placement,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is UserModel &&
        other.id == id &&
        other.userId == userId &&
        other.fullName == fullName &&
        other.email == email &&
        other.mobile == mobile &&
        other.profilePicture == profilePicture &&
        other.rank == rank &&
        other.status == status &&
        other.kycStatus == kycStatus &&
        other.totalInvestment == totalInvestment &&
        other.totalEarnings == totalEarnings &&
        other.sponsorId == sponsorId &&
        other.placement == placement &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      userId,
      fullName,
      email,
      mobile,
      profilePicture,
      rank,
      status,
      kycStatus,
      totalInvestment,
      totalEarnings,
      sponsorId,
      placement,
      createdAt,
      updatedAt,
    );
  }
}
