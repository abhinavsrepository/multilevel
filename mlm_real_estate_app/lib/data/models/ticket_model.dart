/// Support ticket model representing user support requests
class TicketModel {
  /// Unique identifier for the ticket
  final String id;

  /// ID of the user who created the ticket
  final String userId;

  /// User details
  final TicketUser? user;

  /// Subject of the ticket
  final String subject;

  /// Category of the ticket (technical, billing, general, kyc, investment, etc.)
  final String category;

  /// Priority level (low, medium, high, urgent)
  final String priority;

  /// Status of the ticket (open, in_progress, resolved, closed)
  final String status;

  /// Detailed description of the issue
  final String description;

  /// List of attachment URLs
  final List<String> attachments;

  /// List of replies/messages in the ticket
  final List<TicketReply> replies;

  /// Timestamp when the ticket was created
  final DateTime createdAt;

  /// Timestamp when the ticket was last updated
  final DateTime updatedAt;

  const TicketModel({
    required this.id,
    required this.userId,
    required this.subject, required this.category, required this.priority, required this.status, required this.description, required this.attachments, required this.replies, required this.createdAt, required this.updatedAt, this.user,
  });

  /// Creates a TicketModel instance from a JSON map
  factory TicketModel.fromJson(Map<String, dynamic> json) {
    return TicketModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      user: json['user'] != null
          ? TicketUser.fromJson(json['user'] as Map<String, dynamic>)
          : null,
      subject: json['subject'] as String,
      category: json['category'] as String,
      priority: json['priority'] as String,
      status: json['status'] as String,
      description: json['description'] as String,
      attachments: (json['attachments'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      replies: (json['replies'] as List<dynamic>)
          .map((e) => TicketReply.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  /// Converts the TicketModel instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'user': user?.toJson(),
      'subject': subject,
      'category': category,
      'priority': priority,
      'status': status,
      'description': description,
      'attachments': attachments,
      'replies': replies.map((e) => e.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is TicketModel &&
        other.id == id &&
        other.userId == userId &&
        other.user == user &&
        other.subject == subject &&
        other.category == category &&
        other.priority == priority &&
        other.status == status &&
        other.description == description &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      userId,
      user,
      subject,
      category,
      priority,
      status,
      description,
      createdAt,
      updatedAt,
    );
  }
}

/// Simplified user model for ticket reference
class TicketUser {
  /// User ID
  final String id;

  /// User's full name
  final String fullName;

  /// User's email
  final String email;

  /// User's profile picture URL
  final String? profilePicture;

  const TicketUser({
    required this.id,
    required this.fullName,
    required this.email,
    this.profilePicture,
  });

  /// Creates a TicketUser instance from a JSON map
  factory TicketUser.fromJson(Map<String, dynamic> json) {
    return TicketUser(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      email: json['email'] as String,
      profilePicture: json['profilePicture'] as String?,
    );
  }

  /// Converts the TicketUser instance to a JSON map
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

    return other is TicketUser &&
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

/// Model representing a reply/message in a support ticket
class TicketReply {
  /// Unique identifier for the reply
  final String id;

  /// ID of the user who sent the reply
  final String userId;

  /// Name of the user who sent the reply
  final String userName;

  /// Whether this reply is from support staff
  final bool isStaffReply;

  /// Reply message content
  final String message;

  /// List of attachment URLs in this reply
  final List<String> attachments;

  /// Timestamp when the reply was created
  final DateTime createdAt;

  const TicketReply({
    required this.id,
    required this.userId,
    required this.userName,
    required this.isStaffReply,
    required this.message,
    required this.attachments,
    required this.createdAt,
  });

  /// Creates a TicketReply instance from a JSON map
  factory TicketReply.fromJson(Map<String, dynamic> json) {
    return TicketReply(
      id: json['id'] as String,
      userId: json['userId'] as String,
      userName: json['userName'] as String,
      isStaffReply: json['isStaffReply'] as bool,
      message: json['message'] as String,
      attachments: (json['attachments'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  /// Converts the TicketReply instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'userName': userName,
      'isStaffReply': isStaffReply,
      'message': message,
      'attachments': attachments,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is TicketReply &&
        other.id == id &&
        other.userId == userId &&
        other.userName == userName &&
        other.isStaffReply == isStaffReply &&
        other.message == message &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      userId,
      userName,
      isStaffReply,
      message,
      createdAt,
    );
  }
}
