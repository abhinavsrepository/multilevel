# Firebase Setup Guide

This guide will help you set up Firebase for the MLM Real Estate Platform mobile application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Create Firebase Project](#create-firebase-project)
- [Add Android App](#add-android-app)
- [Add iOS App](#add-ios-app)
- [Enable Firebase Services](#enable-firebase-services)
- [Configure Firebase Cloud Messaging](#configure-firebase-cloud-messaging)
- [Configure Firebase Analytics](#configure-firebase-analytics)
- [Configure Firebase Crashlytics](#configure-firebase-crashlytics)
- [Testing Firebase Integration](#testing-firebase-integration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Google account
- Android Studio (for Android configuration)
- Xcode (for iOS configuration, macOS only)
- Flutter project set up locally

## Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Add project"
   - Enter project name: `MLM Real Estate` (or your preferred name)
   - Click "Continue"

3. **Enable Google Analytics** (Optional but recommended)
   - Toggle "Enable Google Analytics for this project"
   - Click "Continue"
   - Select or create a Google Analytics account
   - Click "Create project"

4. **Wait for Project Creation**
   - Wait for Firebase to finish setting up your project
   - Click "Continue" when done

## Add Android App

### Step 1: Register Android App

1. In Firebase Console, click the **Android icon** to add an Android app
2. Fill in the app details:
   - **Android package name**: `com.mlm.realestate.app`
   - **App nickname** (optional): `MLM Real Estate Android`
   - **Debug signing certificate SHA-1** (optional but recommended):
     ```bash
     # Get debug SHA-1
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

     # Get release SHA-1 (after creating keystore)
     keytool -list -v -keystore /path/to/upload-keystore.jks -alias upload
     ```
3. Click "Register app"

### Step 2: Download google-services.json

1. Download the `google-services.json` file
2. Place it in your Android app module root:
   ```
   android/app/google-services.json
   ```

### Step 3: Add Firebase SDK (Already configured in build.gradle files)

The Firebase SDK is already configured in the project, but verify these files:

**android/build.gradle**:
```gradle
classpath 'com.google.gms:google-services:4.4.0'
classpath 'com.google.firebase:firebase-crashlytics-gradle:2.9.9'
```

**android/app/build.gradle**:
```gradle
apply plugin: 'com.google.gms.google-services'
apply plugin: 'com.google.firebase.crashlytics'

dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-analytics-ktx'
    implementation 'com.google.firebase:firebase-messaging-ktx'
    implementation 'com.google.firebase:firebase-crashlytics-ktx'
}
```

## Add iOS App

### Step 1: Register iOS App

1. In Firebase Console, click the **iOS icon** to add an iOS app
2. Fill in the app details:
   - **iOS bundle ID**: `com.mlm.realestate.app`
   - **App nickname** (optional): `MLM Real Estate iOS`
   - **App Store ID** (optional, can add later)
3. Click "Register app"

### Step 2: Download GoogleService-Info.plist

1. Download the `GoogleService-Info.plist` file
2. Open your iOS project in Xcode:
   ```bash
   open ios/Runner.xcworkspace
   ```
3. Drag `GoogleService-Info.plist` into the `Runner` folder in Xcode
4. **Important**: In the dialog, ensure:
   - ✅ "Copy items if needed" is checked
   - ✅ "Runner" target is selected
   - Click "Finish"

### Step 3: Verify Podfile (Already configured)

The Podfile is already configured with Firebase pods:

**ios/Podfile**:
```ruby
pod 'Firebase/Core'
pod 'Firebase/Analytics'
pod 'Firebase/Messaging'
pod 'Firebase/Crashlytics'
```

### Step 4: Install Pods

```bash
cd ios
pod install
cd ..
```

## Enable Firebase Services

### 1. Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable sign-in methods:
   - **Email/Password**: Toggle to enable
   - **Google**:
     - Toggle to enable
     - Enter support email
     - Download configuration files if needed
   - **Phone**:
     - Toggle to enable
     - Add test phone numbers for development

### 2. Cloud Firestore (Optional)

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose mode:
   - **Production mode** for production
   - **Test mode** for development
4. Select location (choose closest to your users)
5. Click **Enable**

### 3. Cloud Storage (Optional)

1. Go to **Storage**
2. Click **Get Started**
3. Set security rules:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
4. Choose location
5. Click **Done**

## Configure Firebase Cloud Messaging

### Android FCM Configuration

1. In Firebase Console, go to **Project Settings** → **Cloud Messaging**
2. Copy the **Server key** (for backend use)
3. Android configuration is automatic with `google-services.json`

### iOS FCM Configuration

1. **Create APNs Authentication Key**:
   - Go to [Apple Developer Portal](https://developer.apple.com/account/)
   - Navigate to **Certificates, Identifiers & Profiles**
   - Click **Keys** → **+** (Create new key)
   - Enter key name: `MLM Real Estate APNs Key`
   - Check **Apple Push Notifications service (APNs)**
   - Click **Continue** → **Register**
   - Download the `.p8` file (save it securely!)
   - Note the **Key ID**

2. **Upload APNs Key to Firebase**:
   - In Firebase Console, go to **Project Settings** → **Cloud Messaging**
   - Under **iOS app configuration**:
     - Click **Upload** in APNs Authentication Key section
     - Upload the `.p8` file
     - Enter **Key ID**
     - Enter **Team ID** (find in Apple Developer Account)
   - Click **Upload**

3. **Enable Push Notifications in Xcode**:
   - Open `ios/Runner.xcworkspace` in Xcode
   - Select **Runner** target
   - Go to **Signing & Capabilities**
   - Click **+ Capability**
   - Add **Push Notifications**
   - Add **Background Modes**:
     - ✅ Remote notifications

## Configure Firebase Analytics

Analytics is automatically enabled when you add Firebase to your app.

### Verify Analytics

1. Run your app
2. In Firebase Console, go to **Analytics** → **Events**
3. You should see events appearing within 24 hours

### Custom Events (in Flutter code)

```dart
import 'package:firebase_analytics/firebase_analytics.dart';

final analytics = FirebaseAnalytics.instance;

// Log custom event
await analytics.logEvent(
  name: 'property_viewed',
  parameters: {
    'property_id': '12345',
    'property_type': 'apartment',
  },
);
```

## Configure Firebase Crashlytics

### Verify Crashlytics Setup

Crashlytics is already configured in the build files.

### Test Crashlytics

Add this code temporarily to test:

```dart
import 'package:firebase_crashlytics/firebase_crashlytics.dart';

// Force a crash for testing
FirebaseCrashlytics.instance.crash();
```

### Enable Crashlytics Collection

```dart
// In main.dart
await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);

// Catch Flutter errors
FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;

// Catch async errors
PlatformDispatcher.instance.onError = (error, stack) {
  FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
  return true;
};
```

## Testing Firebase Integration

### Test on Android

1. Build and run the app:
   ```bash
   flutter run -d android
   ```

2. Check logs for Firebase initialization:
   ```bash
   adb logcat | grep -i firebase
   ```

### Test on iOS

1. Build and run the app:
   ```bash
   flutter run -d ios
   ```

2. Check Xcode console for Firebase logs

### Verify Integration

Create a simple test in your `main.dart`:

```dart
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    print('✅ Firebase initialized successfully');

    // Test Analytics
    await FirebaseAnalytics.instance.logEvent(name: 'app_open');
    print('✅ Analytics event logged');

    // Test Messaging
    final token = await FirebaseMessaging.instance.getToken();
    print('✅ FCM Token: $token');

  } catch (e) {
    print('❌ Firebase initialization error: $e');
  }

  runApp(MyApp());
}
```

## Troubleshooting

### Common Android Issues

**1. google-services.json not found**
```
Error: File google-services.json is missing
```
**Solution**: Ensure `google-services.json` is in `android/app/` directory

**2. Duplicate class error**
```
Duplicate class com.google.android.gms...
```
**Solution**: Clean and rebuild:
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter run
```

**3. Multidex error**
```
Cannot fit requested classes in a single dex file
```
**Solution**: Already enabled in `build.gradle`:
```gradle
multiDexEnabled true
```

### Common iOS Issues

**1. GoogleService-Info.plist not found**
```
Error: GoogleService-Info.plist not found
```
**Solution**:
- Ensure file is in `ios/Runner/` directory
- Verify it's added to Xcode project (should appear in Runner folder)

**2. Pod install fails**
```
Error installing Firebase pods
```
**Solution**:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

**3. Push notifications not working**
```
FCM token is null
```
**Solution**:
- Verify APNs key is uploaded to Firebase
- Check Push Notifications capability is enabled in Xcode
- Test on real device (notifications don't work on simulator)

**4. Code signing error**
```
No signing certificate found
```
**Solution**:
- In Xcode, select your Team in Signing & Capabilities
- Let Xcode automatically manage signing

### General Issues

**1. Firebase not initializing**
```
[FIREBASE] Firebase has not been initialized
```
**Solution**: Ensure Firebase is initialized before app starts:
```dart
await Firebase.initializeApp(
  options: DefaultFirebaseOptions.currentPlatform,
);
```

**2. Platform-specific options not found**
```
DefaultFirebaseOptions not found
```
**Solution**: Run Firebase configuration:
```bash
flutterfire configure
```

## Environment-Specific Configuration

For multiple environments (dev, staging, prod), create separate Firebase projects:

1. **Create three Firebase projects**:
   - `mlm-realestate-dev`
   - `mlm-realestate-staging`
   - `mlm-realestate-prod`

2. **Download separate config files**:
   - `google-services-dev.json`
   - `google-services-staging.json`
   - `google-services-prod.json`

3. **Configure build flavors** to use appropriate config files

## Security Rules

### Firestore Security Rules (Example)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Properties are readable by authenticated users
    match /properties/{propertyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                    request.auth.token.admin == true;
    }
  }
}
```

### Storage Security Rules (Example)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null &&
                          request.auth.uid == userId;
    }
  }
}
```

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [FlutterFire Documentation](https://firebase.flutter.dev/)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Support](https://firebase.google.com/support)

## Need Help?

If you encounter issues not covered here:

1. Check [Firebase Status](https://status.firebase.google.com/)
2. Search [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase) with `firebase` tag
3. Visit [FlutterFire GitHub Issues](https://github.com/firebase/flutterfire/issues)
4. Contact support: support@mlmrealestate.com

---

**Last Updated**: November 2025
**Version**: 1.0.0
