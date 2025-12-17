import 'user_model.dart';

/// Authentication response model containing user credentials and tokens
class AuthResponseModel {
  /// JWT access token for API authentication
  final String token;

  /// Refresh token for obtaining new access tokens
  final String refreshToken;

  /// User information
  final UserModel user;

  /// Token expiration time in seconds
  final int expiresIn;

  const AuthResponseModel({
    required this.token,
    required this.refreshToken,
    required this.user,
    required this.expiresIn,
  });

  /// Creates an AuthResponseModel instance from a JSON map
  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthResponseModel(
      token: json['token'] as String,
      refreshToken: json['refreshToken'] as String,
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
      expiresIn: json['expiresIn'] as int,
    );
  }

  /// Converts the AuthResponseModel instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'refreshToken': refreshToken,
      'user': user.toJson(),
      'expiresIn': expiresIn,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is AuthResponseModel &&
        other.token == token &&
        other.refreshToken == refreshToken &&
        other.user == user &&
        other.expiresIn == expiresIn;
  }

  @override
  int get hashCode {
    return Object.hash(
      token,
      refreshToken,
      user,
      expiresIn,
    );
  }
}
