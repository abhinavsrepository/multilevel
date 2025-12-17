/// Property model representing a real estate investment opportunity
class PropertyModel {
  /// Unique identifier for the property
  final String id;

  /// Title/name of the property
  final String title;

  /// Detailed description of the property
  final String description;

  /// Type of property (apartment, villa, plot, commercial, etc.)
  final String propertyType;

  /// Location/area name
  final String location;

  /// Full address of the property
  final String address;

  /// City where the property is located
  final String city;

  /// State where the property is located
  final String state;

  /// Pincode of the property location
  final String pincode;

  /// Latitude coordinate
  final double? latitude;

  /// Longitude coordinate
  final double? longitude;

  /// Price per unit
  final double price;

  /// Total number of units available
  final int totalUnits;

  /// Number of units still available for investment
  final int availableUnits;

  /// Size of the property (e.g., "1200 sq.ft")
  final String size;

  /// List of amenities
  final List<String> amenities;

  /// List of property image URLs
  final List<String> images;

  /// Featured/primary image URL
  final String featuredImage;

  /// Developer/builder name
  final String developer;

  /// Expected completion date
  final DateTime? completionDate;

  /// Return on Investment percentage
  final double roi;

  /// Minimum investment amount
  final double minInvestment;

  /// Property status (available, sold_out, upcoming, completed)
  final String status;

  /// Timestamp when the property was created
  final DateTime createdAt;

  const PropertyModel({
    required this.id,
    required this.title,
    required this.description,
    required this.propertyType,
    required this.location,
    required this.address,
    required this.city,
    required this.state,
    required this.pincode,
    required this.price,
    required this.totalUnits,
    required this.availableUnits,
    required this.size,
    required this.amenities,
    required this.images,
    required this.featuredImage,
    required this.developer,
    required this.roi,
    required this.minInvestment,
    required this.status,
    required this.createdAt,
    this.latitude,
    this.longitude,
    this.completionDate,
  });

  /// Creates a PropertyModel instance from a JSON map
  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    return PropertyModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      propertyType: json['propertyType'] as String,
      location: json['location'] as String,
      address: json['address'] as String,
      city: json['city'] as String,
      state: json['state'] as String,
      pincode: json['pincode'] as String,
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
      price: (json['price'] as num).toDouble(),
      totalUnits: json['totalUnits'] as int,
      availableUnits: json['availableUnits'] as int,
      size: json['size'] as String,
      amenities: (json['amenities'] as List<dynamic>).map((e) => e as String).toList(),
      images: (json['images'] as List<dynamic>).map((e) => e as String).toList(),
      featuredImage: json['featuredImage'] as String,
      developer: json['developer'] as String,
      completionDate: json['completionDate'] != null
          ? DateTime.parse(json['completionDate'] as String)
          : null,
      roi: (json['roi'] as num).toDouble(),
      minInvestment: (json['minInvestment'] as num).toDouble(),
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  /// Converts the PropertyModel instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'propertyType': propertyType,
      'location': location,
      'address': address,
      'city': city,
      'state': state,
      'pincode': pincode,
      'latitude': latitude,
      'longitude': longitude,
      'price': price,
      'totalUnits': totalUnits,
      'availableUnits': availableUnits,
      'size': size,
      'amenities': amenities,
      'images': images,
      'featuredImage': featuredImage,
      'developer': developer,
      'completionDate': completionDate?.toIso8601String(),
      'roi': roi,
      'minInvestment': minInvestment,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  /// Creates a copy of this PropertyModel with the given fields replaced with new values
  PropertyModel copyWith({
    String? id,
    String? title,
    String? description,
    String? propertyType,
    String? location,
    String? address,
    String? city,
    String? state,
    String? pincode,
    double? latitude,
    double? longitude,
    double? price,
    int? totalUnits,
    int? availableUnits,
    String? size,
    List<String>? amenities,
    List<String>? images,
    String? featuredImage,
    String? developer,
    DateTime? completionDate,
    double? roi,
    double? minInvestment,
    String? status,
    DateTime? createdAt,
  }) {
    return PropertyModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      propertyType: propertyType ?? this.propertyType,
      location: location ?? this.location,
      address: address ?? this.address,
      city: city ?? this.city,
      state: state ?? this.state,
      pincode: pincode ?? this.pincode,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      price: price ?? this.price,
      totalUnits: totalUnits ?? this.totalUnits,
      availableUnits: availableUnits ?? this.availableUnits,
      size: size ?? this.size,
      amenities: amenities ?? this.amenities,
      images: images ?? this.images,
      featuredImage: featuredImage ?? this.featuredImage,
      developer: developer ?? this.developer,
      completionDate: completionDate ?? this.completionDate,
      roi: roi ?? this.roi,
      minInvestment: minInvestment ?? this.minInvestment,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is PropertyModel &&
        other.id == id &&
        other.title == title &&
        other.description == description &&
        other.propertyType == propertyType &&
        other.location == location &&
        other.address == address &&
        other.city == city &&
        other.state == state &&
        other.pincode == pincode &&
        other.latitude == latitude &&
        other.longitude == longitude &&
        other.price == price &&
        other.totalUnits == totalUnits &&
        other.availableUnits == availableUnits &&
        other.size == size &&
        other.featuredImage == featuredImage &&
        other.developer == developer &&
        other.completionDate == completionDate &&
        other.roi == roi &&
        other.minInvestment == minInvestment &&
        other.status == status &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return Object.hashAll([
      id,
      title,
      description,
      propertyType,
      location,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      price,
      totalUnits,
      availableUnits,
      size,
      featuredImage,
      developer,
      completionDate,
      roi,
      minInvestment,
      status,
      createdAt,
    ]);
  }
}
