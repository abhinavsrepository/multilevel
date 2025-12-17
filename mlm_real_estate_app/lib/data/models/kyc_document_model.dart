/// KYC document model representing user's KYC verification documents
class KycDocumentModel {
  /// Unique identifier for the KYC document
  final String id;

  /// ID of the user who submitted this document
  final String userId;

  /// Type of document (aadhaar, pan, passport, driving_license, voter_id)
  final String documentType;

  /// Document number (e.g., Aadhaar number, PAN number)
  final String documentNumber;

  /// URL to the front side of the document
  final String documentFront;

  /// URL to the back side of the document (if applicable)
  final String? documentBack;

  /// Verification status (pending, verified, rejected)
  final String status;

  /// Admin remarks or reason for rejection
  final String? remarks;

  /// Date when the document was submitted
  final DateTime submittedDate;

  /// Date when the document was verified
  final DateTime? verifiedDate;

  /// Timestamp when the document was created
  final DateTime createdAt;

  const KycDocumentModel({
    required this.id,
    required this.userId,
    required this.documentType,
    required this.documentNumber,
    required this.documentFront,
    required this.status,
    required this.submittedDate,
    required this.createdAt,
    this.documentBack,
    this.remarks,
    this.verifiedDate,
  });

  /// Creates a KycDocumentModel instance from a JSON map
  factory KycDocumentModel.fromJson(Map<String, dynamic> json) {
    return KycDocumentModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      documentType: json['documentType'] as String,
      documentNumber: json['documentNumber'] as String,
      documentFront: json['documentFront'] as String,
      documentBack: json['documentBack'] as String?,
      status: json['status'] as String,
      remarks: json['remarks'] as String?,
      submittedDate: DateTime.parse(json['submittedDate'] as String),
      verifiedDate: json['verifiedDate'] != null
          ? DateTime.parse(json['verifiedDate'] as String)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  /// Converts the KycDocumentModel instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'documentType': documentType,
      'documentNumber': documentNumber,
      'documentFront': documentFront,
      'documentBack': documentBack,
      'status': status,
      'remarks': remarks,
      'submittedDate': submittedDate.toIso8601String(),
      'verifiedDate': verifiedDate?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is KycDocumentModel &&
        other.id == id &&
        other.userId == userId &&
        other.documentType == documentType &&
        other.documentNumber == documentNumber &&
        other.documentFront == documentFront &&
        other.documentBack == documentBack &&
        other.status == status &&
        other.remarks == remarks &&
        other.submittedDate == submittedDate &&
        other.verifiedDate == verifiedDate &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      userId,
      documentType,
      documentNumber,
      documentFront,
      documentBack,
      status,
      remarks,
      submittedDate,
      verifiedDate,
      createdAt,
    );
  }
}
