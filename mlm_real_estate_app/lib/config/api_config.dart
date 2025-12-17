import 'package:flutter/foundation.dart';

class ApiConfig {
  // Base URL - Update this with your actual API URL
  static const String baseUrl = 'http://your-api.com/api';

  // API Version
  static const String apiVersion = 'v1';

  // Endpoints
  static const String apiPrefix = '/api/$apiVersion';

  // Environment
  static const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: 'development',
  );

  static bool get isProduction => environment == 'production';
  static bool get isDevelopment => environment == 'development';
  static bool get isStaging => environment == 'staging';

  // Get base URL based on environment
  static String getBaseUrl() {
    switch (environment) {
      case 'production':
        return 'https://api.mlmrealestate.com/api';
      case 'staging':
        return 'https://staging-api.mlmrealestate.com/api';
      case 'development':
      default:
        // Use 10.0.2.2 for Android Emulator, localhost for iOS/Web
        if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
          return 'http://10.0.2.2:5000/api/v1';
        }
        return 'http://localhost:5000/api/v1';
    }
  }
}
