/// Achievement model representing user achievements and milestones
class AchievementModel {
  /// Unique identifier for the achievement
  final String id;

  /// Name of the achievement
  final String name;

  /// Description of the achievement
  final String description;

  /// Icon/badge identifier for the achievement
  final String icon;

  /// Category of achievement (rank, sales, team, investment)
  final String category;

  /// Whether the achievement is unlocked
  final bool isUnlocked;

  /// Date when achievement was unlocked (null if not unlocked)
  final DateTime? unlockedAt;

  /// Points awarded for this achievement
  final int points;

  /// Requirements to unlock this achievement
  final List<String> requirements;

  const AchievementModel({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.category,
    required this.isUnlocked,
    required this.points, required this.requirements, this.unlockedAt,
  });

  /// Creates an AchievementModel instance from a JSON map
  factory AchievementModel.fromJson(Map<String, dynamic> json) {
    return AchievementModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      icon: json['icon'] as String,
      category: json['category'] as String,
      isUnlocked: json['isUnlocked'] as bool,
      unlockedAt: json['unlockedAt'] != null
          ? DateTime.parse(json['unlockedAt'] as String)
          : null,
      points: json['points'] as int,
      requirements: (json['requirements'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
    );
  }

  /// Converts the AchievementModel instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'icon': icon,
      'category': category,
      'isUnlocked': isUnlocked,
      'unlockedAt': unlockedAt?.toIso8601String(),
      'points': points,
      'requirements': requirements,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is AchievementModel &&
        other.id == id &&
        other.name == name &&
        other.description == description &&
        other.icon == icon &&
        other.category == category &&
        other.isUnlocked == isUnlocked &&
        other.unlockedAt == unlockedAt &&
        other.points == points;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      name,
      description,
      icon,
      category,
      isUnlocked,
      unlockedAt,
      points,
    );
  }
}
