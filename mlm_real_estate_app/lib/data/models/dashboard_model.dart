/// Dashboard model containing user's summary statistics and activities
class DashboardModel {
  /// Total earnings accumulated by the user
  final double totalEarnings;

  /// Total amount invested by the user
  final double totalInvestment;

  /// Number of currently active investments
  final int activeInvestments;

  /// Total commission earned
  final double totalCommission;

  /// Number of direct referrals
  final int directReferrals;

  /// Total team size including all levels
  final int teamSize;

  /// Current rank of the user
  final String currentRank;

  /// Total amount of pending payouts
  final double pendingPayouts;

  /// List of recent activities
  final List<RecentActivity> recentActivities;

  /// List of announcements
  final List<Announcement> announcements;

  const DashboardModel({
    required this.totalEarnings,
    required this.totalInvestment,
    required this.activeInvestments,
    required this.totalCommission,
    required this.directReferrals,
    required this.teamSize,
    required this.currentRank,
    required this.pendingPayouts,
    required this.recentActivities,
    required this.announcements,
  });

  /// Creates a DashboardModel instance from a JSON map
  factory DashboardModel.fromJson(Map<String, dynamic> json) {
    return DashboardModel(
      totalEarnings: (json['totalEarnings'] as num).toDouble(),
      totalInvestment: (json['totalInvestment'] as num).toDouble(),
      activeInvestments: json['activeInvestments'] as int,
      totalCommission: (json['totalCommission'] as num).toDouble(),
      directReferrals: json['directReferrals'] as int,
      teamSize: json['teamSize'] as int,
      currentRank: json['currentRank'] as String,
      pendingPayouts: (json['pendingPayouts'] as num).toDouble(),
      recentActivities: (json['recentActivities'] as List<dynamic>)
          .map((e) => RecentActivity.fromJson(e as Map<String, dynamic>))
          .toList(),
      announcements: (json['announcements'] as List<dynamic>)
          .map((e) => Announcement.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  /// Converts the DashboardModel instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'totalEarnings': totalEarnings,
      'totalInvestment': totalInvestment,
      'activeInvestments': activeInvestments,
      'totalCommission': totalCommission,
      'directReferrals': directReferrals,
      'teamSize': teamSize,
      'currentRank': currentRank,
      'pendingPayouts': pendingPayouts,
      'recentActivities': recentActivities.map((e) => e.toJson()).toList(),
      'announcements': announcements.map((e) => e.toJson()).toList(),
    };
  }
}

/// Model representing a recent activity item
class RecentActivity {
  /// Unique identifier for the activity
  final String id;

  /// Type of activity
  final String type;

  /// Description of the activity
  final String description;

  /// Amount associated with the activity (if applicable)
  final double? amount;

  /// Timestamp when the activity occurred
  final DateTime timestamp;

  const RecentActivity({
    required this.id,
    required this.type,
    required this.description,
    required this.timestamp, this.amount,
  });

  /// Creates a RecentActivity instance from a JSON map
  factory RecentActivity.fromJson(Map<String, dynamic> json) {
    return RecentActivity(
      id: json['id'] as String,
      type: json['type'] as String,
      description: json['description'] as String,
      amount: json['amount'] != null ? (json['amount'] as num).toDouble() : null,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  /// Converts the RecentActivity instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'description': description,
      'amount': amount,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

/// Model representing an announcement
class Announcement {
  /// Unique identifier for the announcement
  final String id;

  /// Title of the announcement
  final String title;

  /// Content of the announcement
  final String content;

  /// Type/category of the announcement
  final String type;

  /// Priority level (high, medium, low)
  final String priority;

  /// Timestamp when the announcement was created
  final DateTime createdAt;

  const Announcement({
    required this.id,
    required this.title,
    required this.content,
    required this.type,
    required this.priority,
    required this.createdAt,
  });

  /// Creates an Announcement instance from a JSON map
  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      type: json['type'] as String,
      priority: json['priority'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  /// Converts the Announcement instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'type': type,
      'priority': priority,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
