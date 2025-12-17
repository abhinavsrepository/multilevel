# Quick Start Guide

Get your MLM Real Estate Platform app up and running in minutes!

## Prerequisites Checklist

Before you start, make sure you have:

- [ ] Flutter SDK (3.2.0+) installed
- [ ] Android Studio or Xcode installed
- [ ] Git installed
- [ ] Firebase account (free tier is fine)
- [ ] Google Cloud account (for Maps API)

## 5-Minute Setup

### Step 1: Verify Installation (1 minute)

```bash
# Check Flutter installation
flutter --version

# Check Flutter doctor
flutter doctor
```

Fix any issues reported by `flutter doctor` before proceeding.

### Step 2: Install Dependencies (2 minutes)

```bash
# Get Flutter packages
flutter pub get

# For iOS (macOS only)
cd ios
pod install
cd ..
```

### Step 3: Configure Environment (1 minute)

```bash
# Copy environment template
cp .env.example .env.development

# Edit .env.development and add your API URLs
# You can start with placeholder values for now
```

### Step 4: Configure Firebase (See FIREBASE_SETUP.md for details)

Quick version:
1. Create Firebase project at https://console.firebase.google.com/
2. Add Android app, download `google-services.json` to `android/app/`
3. Add iOS app, download `GoogleService-Info.plist` to `ios/Runner/`

### Step 5: Run the App (1 minute)

```bash
# For Android
flutter run -d android

# For iOS
flutter run -d ios
```

## What If I Don't Have API Keys Yet?

You can still run the app! Here's what will work without API keys:

✅ **Works without API keys:**
- UI and navigation
- State management
- Local storage
- Most app features (offline)

❌ **Requires API keys:**
- Firebase features (analytics, notifications, crashlytics)
- Google Maps
- Payment processing
- Backend API calls

## Configuration Priority

Do these in order of importance:

### Priority 1: Essential (Required to run)
1. ✅ Flutter dependencies (`flutter pub get`)
2. ✅ iOS pods (`pod install`)
3. ✅ Basic environment file

### Priority 2: Core Features (Needed for full functionality)
1. 🔥 Firebase setup
2. 🗺️ Google Maps API key
3. 🔐 Backend API configuration

### Priority 3: Optional (Can add later)
1. 💳 Payment gateway (Razorpay)
2. 📱 Social login
3. 📊 Analytics
4. 🔔 Push notifications

## Common First-Time Issues

### "google-services.json not found"
**Solution**: Follow Step 4 above or temporarily comment out Google Services plugin in `android/app/build.gradle`

### "GoogleService-Info.plist not found"
**Solution**: Follow Step 4 above or temporarily skip Firebase initialization in code

### "Pod install fails"
**Solution**:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

### "Gradle sync failed"
**Solution**:
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
```

## Development Workflow

### Daily Development

```bash
# Start development
flutter run --flavor development

# Hot reload: Press 'r' in terminal
# Hot restart: Press 'R' in terminal
# Quit: Press 'q' in terminal
```

### Before Committing

```bash
# Format code
flutter format .

# Analyze code
flutter analyze

# Run tests
flutter test

# Check everything
flutter format . && flutter analyze && flutter test
```

### Building for Testing

```bash
# Android APK
flutter build apk --debug --flavor development

# iOS (on macOS)
flutter build ios --debug --flavor development
```

## Folder Structure Overview

```
mlm_real_estate_app/
├── android/              # Android native code
│   ├── app/
│   │   ├── build.gradle  # App-level configuration
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── kotlin/   # Kotlin code
│   └── build.gradle      # Project-level configuration
│
├── ios/                  # iOS native code
│   ├── Podfile           # CocoaPods dependencies
│   └── Runner/
│       ├── Info.plist    # iOS configuration
│       └── AppDelegate.swift
│
├── lib/                  # Flutter/Dart code
│   ├── main.dart         # App entry point
│   ├── config/           # Configuration files
│   ├── core/             # Core utilities
│   ├── data/             # Data layer
│   ├── domain/           # Business logic
│   └── presentation/     # UI layer
│
├── assets/               # Static assets
│   ├── images/
│   ├── icons/
│   └── lottie/
│
└── test/                 # Tests
```

## Next Steps

Once you have the app running:

1. **Read the README.md** - Comprehensive guide to all features
2. **Set up Firebase** - Follow FIREBASE_SETUP.md step by step
3. **Configure API keys** - Add Google Maps and other keys
4. **Customize branding** - Update app name, icon, colors
5. **Connect to backend** - Configure API endpoints

## Need Help?

- 📖 **Full Documentation**: See README.md
- 🔥 **Firebase Setup**: See FIREBASE_SETUP.md
- 🤝 **Contributing**: See CONTRIBUTING.md
- 📝 **Changelog**: See CHANGELOG.md
- 📧 **Email**: support@mlmrealestate.com

## Useful Commands Reference

```bash
# Get dependencies
flutter pub get

# Run app
flutter run

# Build APK (debug)
flutter build apk --debug

# Build APK (release)
flutter build apk --release

# Build iOS (debug)
flutter build ios --debug

# Clean build
flutter clean

# Format code
flutter format .

# Analyze code
flutter analyze

# Run tests
flutter test

# Generate code
flutter pub run build_runner build --delete-conflicting-outputs

# Check Flutter
flutter doctor -v

# List devices
flutter devices
```

## Development Tips

### Hot Reload vs Hot Restart

- **Hot Reload (r)**: Faster, preserves app state
- **Hot Restart (R)**: Slower, resets app state
- **Full Restart**: When changing native code or dependencies

### When to Full Restart

- After changing `pubspec.yaml`
- After changing native code (Android/iOS)
- After changing assets
- When hot reload doesn't work

### Debugging

```bash
# Run with debug logging
flutter run --verbose

# Check device logs
# Android:
adb logcat | grep flutter

# iOS:
# Check Xcode console
```

## Ready to Ship?

Before releasing to production:

1. [ ] Update version in `pubspec.yaml`
2. [ ] Create release keystore (Android)
3. [ ] Configure signing (iOS)
4. [ ] Test on real devices
5. [ ] Run `flutter analyze` and fix all issues
6. [ ] Run `flutter test` and ensure all tests pass
7. [ ] Update CHANGELOG.md
8. [ ] Build release versions
9. [ ] Test release builds thoroughly
10. [ ] Submit to stores

---

**Happy Coding!** 🚀

For detailed information, see the comprehensive README.md
