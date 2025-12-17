/// Rank model representing MLM rank/level information
class RankModel {
  /// Unique identifier for the rank
  final String id;

  /// Name of the rank (e.g., Bronze, Silver, Gold, Platinum, Diamond)
  final String name;

  /// Minimum business volume required to achieve this rank
  final double minBusinessVolume;

  /// Minimum number of direct referrals required
  final int minDirectReferrals;

  /// Minimum team size required
  final int minTeamSize;

  /// List of benefits for this rank
  final List<String> benefits;

  /// Icon/image URL for the rank
  final String icon;

  /// Color code for UI representation
  final String color;

  /// Order/sequence of the rank (1, 2, 3, etc.)
  final int order;

  const RankModel({
    required this.id,
    required this.name,
    required this.minBusinessVolume,
    required this.minDirectReferrals,
    required this.minTeamSize,
    required this.benefits,
    required this.icon,
    required this.color,
    required this.order,
  });

  /// Creates a RankModel instance from a JSON map
  factory RankModel.fromJson(Map<String, dynamic> json) {
    return RankModel(
      id: json['id'] as String,
      name: json['name'] as String,
      minBusinessVolume: (json['minBusinessVolume'] as num).toDouble(),
      minDirectReferrals: json['minDirectReferrals'] as int,
      minTeamSize: json['minTeamSize'] as int,
      benefits: (json['benefits'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      icon: json['icon'] as String,
      color: json['color'] as String,
      order: json['order'] as int,
    );
  }

  /// Converts the RankModel instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'minBusinessVolume': minBusinessVolume,
      'minDirectReferrals': minDirectReferrals,
      'minTeamSize': minTeamSize,
      'benefits': benefits,
      'icon': icon,
      'color': color,
      'order': order,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is RankModel &&
        other.id == id &&
        other.name == name &&
        other.minBusinessVolume == minBusinessVolume &&
        other.minDirectReferrals == minDirectReferrals &&
        other.minTeamSize == minTeamSize &&
        other.icon == icon &&
        other.color == color &&
        other.order == order;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      name,
      minBusinessVolume,
      minDirectReferrals,
      minTeamSize,
      icon,
      color,
      order,
    );
  }
}
