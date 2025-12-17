class AppConfig {
  // App Information
  static const String appName = 'MLM Real Estate';
  static const String appVersion = '1.0.0';
  static const String appBuildNumber = '1';

  // Support
  static const String supportEmail = 'support@mlmrealestate.com';
  static const String supportPhone = '+1-800-MLM-ESTATE';
  static const String supportWhatsApp = '+91 9511195090';

  // Social Media
  static const String facebookUrl = 'https://facebook.com/mlmrealestate';
  static const String twitterUrl = 'https://twitter.com/mlmrealestate';
  static const String instagramUrl = 'https://instagram.com/mlmrealestate';
  static const String linkedinUrl = 'https://linkedin.com/company/mlmrealestate';
  static const String youtubeUrl = 'https://youtube.com/mlmrealestate';

  // Legal
  static const String privacyPolicyUrl = 'https://mlmrealestate.com/privacy';
  static const String termsOfServiceUrl = 'https://mlmrealestate.com/terms';
  static const String refundPolicyUrl = 'https://mlmrealestate.com/refund';

  // Features
  static const bool enableBiometric = true;
  static const bool enableDarkMode = true;
  static const bool enableNotifications = true;
  static const bool enableOfflineMode = true;

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // File Upload
  static const int maxImageSizeInMB = 5;
  static const int maxDocumentSizeInMB = 10;
  static const List<String> allowedImageFormats = ['jpg', 'jpeg', 'png'];
  static const List<String> allowedDocumentFormats = ['pdf', 'doc', 'docx'];

  // Cache
  static const int cacheExpiryInHours = 24;
  static const int maxCacheSizeInMB = 100;

  // Timeouts
  static const int apiTimeoutInSeconds = 30;
  static const int uploadTimeoutInSeconds = 60;
  static const int downloadTimeoutInSeconds = 60;

  // OTP
  static const int otpLength = 6;
  static const int otpResendTimeInSeconds = 60;
  static const int otpExpiryTimeInMinutes = 10;

  // Password
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 32;

  // Referral
  static const int referralCodeLength = 8;

  // Currency
  static const String defaultCurrency = 'USD';
  static const String currencySymbol = '\$';
  static const int decimalPlaces = 2;

  // Date Format
  static const String dateFormat = 'MMM dd, yyyy';
  static const String dateTimeFormat = 'MMM dd, yyyy hh:mm a';
  static const String timeFormat = 'hh:mm a';

  // Razorpay
  static const String razorpayKeyId = 'YOUR_RAZORPAY_KEY_ID';
  static const String razorpayKeySecret = 'YOUR_RAZORPAY_KEY_SECRET';

  // Google Maps
  static const String googleMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY';

  // Firebase
  static const String firebaseVapidKey = 'YOUR_FIREBASE_VAPID_KEY';

  // Deep Linking
  static const String appScheme = 'mlmrealestate';
  static const String appHost = 'app.mlmrealestate.com';

  // Share
  static const String shareMessage =
      'Join MLM Real Estate and start earning! Use my referral code:';
  static const String appStoreUrl =
      'https://apps.apple.com/app/mlm-real-estate/id123456789';
  static const String playStoreUrl =
      'https://play.google.com/store/apps/details?id=com.mlmrealestate.app';
}
