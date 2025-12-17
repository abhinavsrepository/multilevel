/// Team member model representing a member in the MLM network
class TeamMemberModel {
  /// Unique identifier for the team member
  final String id;

  /// User ID for display purposes
  final String userId;

  /// Full name of the team member
  final String fullName;

  /// Email address
  final String email;

  /// Mobile number
  final String mobile;

  /// URL to profile picture
  final String? profilePicture;

  /// Current rank
  final String rank;

  /// Account status
  final String status;

  /// Level/depth in the team hierarchy
  final int level;

  /// Joining date
  final DateTime joinedAt;

  /// Total business volume
  final double businessVolume;

  /// Total direct referrals
  final int directReferrals;

  /// Team size under this member
  final int teamSize;

  /// Total earnings
  final double totalEarnings;

  /// Sponsor ID
  final String? sponsorId;

  const TeamMemberModel({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.email,
    required this.mobile,
    required this.rank, required this.status, required this.level, required this.joinedAt, required this.businessVolume, required this.directReferrals, required this.teamSize, required this.totalEarnings, this.profilePicture,
    this.sponsorId,
  });

  /// Creates a TeamMemberModel instance from a JSON map
  factory TeamMemberModel.fromJson(Map<String, dynamic> json) {
    return TeamMemberModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      fullName: json['fullName'] as String,
      email: json['email'] as String,
      mobile: json['mobile'] as String,
      profilePicture: json['profilePicture'] as String?,
      rank: json['rank'] as String,
      status: json['status'] as String,
      level: json['level'] as int,
      joinedAt: DateTime.parse(json['joinedAt'] as String),
      businessVolume: (json['businessVolume'] as num).toDouble(),
      directReferrals: json['directReferrals'] as int,
      teamSize: json['teamSize'] as int,
      totalEarnings: (json['totalEarnings'] as num).toDouble(),
      sponsorId: json['sponsorId'] as String?,
    );
  }

  /// Converts the TeamMemberModel instance to a JSON map
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
      'level': level,
      'joinedAt': joinedAt.toIso8601String(),
      'businessVolume': businessVolume,
      'directReferrals': directReferrals,
      'teamSize': teamSize,
      'totalEarnings': totalEarnings,
      'sponsorId': sponsorId,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is TeamMemberModel &&
        other.id == id &&
        other.userId == userId &&
        other.fullName == fullName &&
        other.email == email &&
        other.mobile == mobile &&
        other.profilePicture == profilePicture &&
        other.rank == rank &&
        other.status == status &&
        other.level == level &&
        other.joinedAt == joinedAt &&
        other.businessVolume == businessVolume &&
        other.directReferrals == directReferrals &&
        other.teamSize == teamSize &&
        other.totalEarnings == totalEarnings &&
        other.sponsorId == sponsorId;
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
      level,
      joinedAt,
      businessVolume,
      directReferrals,
      teamSize,
      totalEarnings,
      sponsorId,
    );
  }
}
