# MLM Real Estate Platform - Mobile Application

A comprehensive Multi-Level Marketing (MLM) platform for real estate built with Flutter, featuring property management, referral systems, commission tracking, and network visualization.

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Building the App](#building-the-app)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [API Integration](#api-integration)
- [Firebase Setup](#firebase-setup)
- [Google Maps Setup](#google-maps-setup)
- [Payment Gateway Setup](#payment-gateway-setup)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Features
- **User Authentication & Authorization**
  - Email/Password authentication
  - Social login (Google, Facebook)
  - Phone number verification
  - Biometric authentication (Face ID/Touch ID)
  - Secure session management

- **Property Management**
  - Browse properties with advanced filters
  - Property details with image gallery
  - Property search by location, price, type
  - Favorite/Wishlist properties
  - Property comparison
  - Virtual tours and video support

- **MLM Network Features**
  - Referral system with unique codes
  - Network tree visualization
  - Downline management
  - Team performance tracking
  - Genealogy tree view

- **Commission & Earnings**
  - Real-time commission tracking
  - Earnings dashboard with charts
  - Withdrawal requests
  - Transaction history
  - Commission calculator
  - Multiple commission levels

- **Dashboard & Analytics**
  - Performance metrics
  - Sales analytics
  - Network growth charts
  - Commission breakdown
  - Goal tracking

- **Communication**
  - In-app messaging
  - Push notifications
  - Team announcements
  - Email notifications

- **Document Management**
  - Upload property documents
  - KYC verification
  - Document viewer (PDF)
  - Document sharing

- **Location Services**
  - Property location on maps
  - Nearby properties
  - Location-based search
  - Directions to properties

- **Payment Integration**
  - Razorpay payment gateway
  - Multiple payment methods
  - Payment history
  - Secure transactions

### Additional Features
- Multi-language support
- Dark/Light theme
- Offline mode support
- QR code generation and scanning
- Share properties via social media
- Property calculator (EMI, ROI)
- Training materials and videos
- Support ticket system
- Profile management

## Screenshots

> Add your app screenshots here

```
screenshots/
├── splash_screen.png
├── login_screen.png
├── dashboard.png
├── properties_list.png
├── property_details.png
├── network_tree.png
├── earnings_dashboard.png
└── profile.png
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Flutter SDK** (3.2.0 or higher)
  ```bash
  flutter --version
  ```

- **Dart SDK** (3.2.0 or higher)

- **Android Studio** or **Xcode** (for iOS development)

- **Git**

- **Android SDK** (API 21 - 34)

- **Xcode** 14+ (for iOS development on macOS)

- **CocoaPods** (for iOS dependencies)
  ```bash
  sudo gem install cocoapods
  ```

- **Java JDK** 11 or higher

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mlm_real_estate_app.git
cd mlm_real_estate_app
```

### 2. Install Flutter Dependencies

```bash
flutter pub get
```

### 3. Install iOS Dependencies (macOS only)

```bash
cd ios
pod install
cd ..
```

### 4. Run Code Generation

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### 5. Run the App

#### For Android
```bash
flutter run -d android
```

#### For iOS (macOS only)
```bash
flutter run -d ios
```

#### For a specific flavor
```bash
# Development
flutter run --flavor development -t lib/main_development.dart

# Staging
flutter run --flavor staging -t lib/main_staging.dart

# Production
flutter run --flavor production -t lib/main_production.dart
```

## Configuration

### Environment Variables

Create the following files in the project root:

#### .env.development
```env
API_BASE_URL=https://dev-api.mlmrealestate.com
API_KEY=your_dev_api_key
ENVIRONMENT=development
```

#### .env.staging
```env
API_BASE_URL=https://staging-api.mlmrealestate.com
API_KEY=your_staging_api_key
ENVIRONMENT=staging
```

#### .env.production
```env
API_BASE_URL=https://api.mlmrealestate.com
API_KEY=your_production_api_key
ENVIRONMENT=production
```

### API Keys Configuration

Create `lib/config/api_keys.dart`:

```dart
class ApiKeys {
  static const String googleMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
  static const String razorpayKey = 'YOUR_RAZORPAY_KEY';
  static const String razorpaySecret = 'YOUR_RAZORPAY_SECRET';
}
```

**Note:** Never commit API keys to version control. Add `api_keys.dart` to `.gitignore`.

## Building the App

### Android

#### Debug Build
```bash
flutter build apk --debug
```

#### Release Build
```bash
flutter build apk --release
```

#### App Bundle (for Play Store)
```bash
flutter build appbundle --release
```

#### Build with Flavors
```bash
# Development
flutter build apk --flavor development -t lib/main_development.dart

# Production
flutter build apk --release --flavor production -t lib/main_production.dart
```

### iOS

#### Debug Build
```bash
flutter build ios --debug
```

#### Release Build
```bash
flutter build ios --release
```

#### Build IPA (for App Store)
```bash
flutter build ipa --release
```

## Project Structure

```
lib/
├── config/
│   ├── api_config.dart
│   ├── app_config.dart
│   ├── theme_config.dart
│   └── routes_config.dart
├── core/
│   ├── constants/
│   ├── errors/
│   ├── network/
│   ├── utils/
│   └── validators/
├── data/
│   ├── models/
│   ├── repositories/
│   ├── services/
│   └── sources/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── usecases/
├── presentation/
│   ├── screens/
│   ├── widgets/
│   ├── providers/
│   └── themes/
├── l10n/
│   └── translations/
├── main.dart
├── main_development.dart
├── main_staging.dart
└── main_production.dart
```

## Dependencies

### Core Dependencies
- **flutter**: SDK
- **cupertino_icons**: iOS style icons
- **provider**: State management
- **get**: Navigation and state management

### Networking
- **dio**: HTTP client
- **connectivity_plus**: Network connectivity

### Local Storage
- **shared_preferences**: Simple key-value storage
- **hive**: NoSQL database
- **flutter_secure_storage**: Secure storage
- **path_provider**: File system paths

### Authentication & Security
- **local_auth**: Biometric authentication
- **crypto**: Encryption

### UI Components
- **cached_network_image**: Image caching
- **shimmer**: Loading effects
- **lottie**: Animations
- **fl_chart**: Charts and graphs
- **syncfusion_flutter_charts**: Advanced charts

### Firebase
- **firebase_core**: Firebase core
- **firebase_messaging**: Push notifications
- **firebase_analytics**: Analytics
- **firebase_crashlytics**: Crash reporting

### Maps & Location
- **google_maps_flutter**: Google Maps
- **geolocator**: Location services
- **geocoding**: Address geocoding

### Media
- **image_picker**: Select images
- **image_cropper**: Crop images
- **video_player**: Play videos
- **qr_flutter**: Generate QR codes
- **mobile_scanner**: Scan QR codes

### Payments
- **razorpay_flutter**: Payment gateway

### Others
- **url_launcher**: Open URLs
- **share_plus**: Share content
- **pdf**: PDF generation
- **printing**: Print documents
- **intl**: Internationalization

## API Integration

### Base URL Configuration

The app uses different base URLs for different environments:

- **Development**: `https://dev-api.mlmrealestate.com`
- **Staging**: `https://staging-api.mlmrealestate.com`
- **Production**: `https://api.mlmrealestate.com`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

#### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/{id}` - Get property details
- `GET /api/properties/search` - Search properties
- `GET /api/properties/favorites` - Get favorite properties
- `POST /api/properties/{id}/favorite` - Add to favorites

#### MLM Network
- `GET /api/network/tree` - Get network tree
- `GET /api/network/downline` - Get downline members
- `GET /api/network/referral-code` - Get referral code
- `POST /api/network/refer` - Refer new member

#### Commissions
- `GET /api/commissions` - Get all commissions
- `GET /api/commissions/summary` - Get commission summary
- `POST /api/commissions/withdraw` - Request withdrawal

#### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/upload-document` - Upload document
- `GET /api/user/transactions` - Get transaction history

### API Authentication

All authenticated requests require a Bearer token in the header:

```dart
headers: {
  'Authorization': 'Bearer $token',
  'Content-Type': 'application/json',
}
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following services:
   - Authentication
   - Cloud Messaging
   - Analytics
   - Crashlytics

### 2. Add Firebase to Android

1. Download `google-services.json`
2. Place it in `android/app/`
3. Add Firebase SDK to `android/app/build.gradle`

### 3. Add Firebase to iOS

1. Download `GoogleService-Info.plist`
2. Place it in `ios/Runner/`
3. Add to Xcode project

### 4. Initialize Firebase

Firebase is initialized in `main.dart`:

```dart
await Firebase.initializeApp(
  options: DefaultFirebaseOptions.currentPlatform,
);
```

## Google Maps Setup

### 1. Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps SDK for Android and iOS
3. Create API credentials

### 2. Add to Android

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```

Or use environment variable in `android/app/build.gradle`:

```gradle
manifestPlaceholders = [MAPS_API_KEY: System.getenv("MAPS_API_KEY") ?: ""]
```

### 3. Add to iOS

Edit `ios/Runner/Info.plist`:

```xml
<key>GMSApiKey</key>
<string>YOUR_GOOGLE_MAPS_API_KEY</string>
```

## Payment Gateway Setup

### Razorpay Integration

1. Create account at [Razorpay](https://razorpay.com/)
2. Get API keys from Dashboard
3. Add keys to `lib/config/api_keys.dart`

#### Test Mode Keys
```dart
static const String razorpayKey = 'rzp_test_xxxxxxxxxxxxx';
```

#### Live Mode Keys
```dart
static const String razorpayKey = 'rzp_live_xxxxxxxxxxxxx';
```

## Testing

### Run Unit Tests
```bash
flutter test
```

### Run Widget Tests
```bash
flutter test test/widget_test.dart
```

### Run Integration Tests
```bash
flutter test integration_test/
```

### Generate Coverage Report
```bash
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

## Deployment

### Android Deployment (Google Play Store)

1. **Create a keystore**
   ```bash
   keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```

2. **Create `android/keystore.properties`**
   ```properties
   storePassword=yourStorePassword
   keyPassword=yourKeyPassword
   keyAlias=upload
   storeFile=/path/to/upload-keystore.jks
   ```

3. **Build release**
   ```bash
   flutter build appbundle --release
   ```

4. **Upload to Play Console**
   - Go to [Google Play Console](https://play.google.com/console/)
   - Create new app
   - Upload the AAB file from `build/app/outputs/bundle/release/app-release.aab`

### iOS Deployment (App Store)

1. **Configure Xcode**
   - Open `ios/Runner.xcworkspace` in Xcode
   - Set Team and Bundle Identifier
   - Configure signing certificates

2. **Create Archive**
   ```bash
   flutter build ipa --release
   ```

3. **Upload to App Store Connect**
   - Open Xcode
   - Window → Organizer
   - Upload archive to App Store Connect

4. **Submit for Review**
   - Go to [App Store Connect](https://appstoreconnect.apple.com/)
   - Fill app information
   - Submit for review

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow [Effective Dart](https://dart.dev/guides/language/effective-dart) guidelines
- Write meaningful commit messages
- Add tests for new features
- Update documentation

### Code Review Process

1. All PRs require at least one approval
2. All tests must pass
3. Code coverage should not decrease
4. Follow the project's coding standards

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and queries:
- **Email**: support@mlmrealestate.com
- **Documentation**: https://docs.mlmrealestate.com
- **Issue Tracker**: https://github.com/yourusername/mlm_real_estate_app/issues

## Acknowledgments

- Flutter team for the amazing framework
- Firebase for backend services
- All contributors who have helped this project

---

**Made with ❤️ by the MLM Real Estate Team**

**Version**: 1.0.0
**Last Updated**: November 2025
