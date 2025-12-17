#!/bin/bash

echo "========================================="
echo "Configuration Files Verification Script"
echo "========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counter
total=0
found=0

# Function to check file
check_file() {
    total=$((total + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        found=$((found + 1))
    else
        echo -e "${RED}✗${NC} $1"
    fi
}

echo "ANDROID CONFIGURATION FILES"
echo "----------------------------"
check_file "android/build.gradle"
check_file "android/settings.gradle"
check_file "android/gradle.properties"
check_file "android/app/build.gradle"
check_file "android/app/proguard-rules.pro"
check_file "android/app/src/main/AndroidManifest.xml"
check_file "android/app/src/main/kotlin/com/mlm/realestate/app/MainActivity.kt"
check_file "android/app/src/main/res/xml/backup_rules.xml"
check_file "android/app/src/main/res/xml/data_extraction_rules.xml"
check_file "android/app/src/main/res/xml/network_security_config.xml"
check_file "android/app/src/main/res/xml/file_paths.xml"
check_file "android/app/src/main/res/values/colors.xml"
check_file "android/app/src/main/res/drawable/ic_notification.xml"
check_file "android/local.properties.example"
check_file "android/keystore.properties.example"

echo ""
echo "IOS CONFIGURATION FILES"
echo "-----------------------"
check_file "ios/Podfile"
check_file "ios/Runner/Info.plist"
check_file "ios/Runner/AppDelegate.swift"

echo ""
echo "PROJECT-WIDE FILES"
echo "------------------"
check_file ".gitignore"
check_file "README.md"
check_file "CONTRIBUTING.md"
check_file "CHANGELOG.md"
check_file "LICENSE"
check_file "FIREBASE_SETUP.md"
check_file ".env.example"
check_file "CONFIGURATION_FILES_SUMMARY.md"

echo ""
echo "========================================="
echo "Summary: $found/$total files found"
echo "========================================="

if [ $found -eq $total ]; then
    echo -e "${GREEN}✓ All configuration files are present!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some configuration files are missing!${NC}"
    exit 1
fi
