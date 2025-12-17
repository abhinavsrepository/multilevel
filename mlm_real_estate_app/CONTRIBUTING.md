# Contributing to MLM Real Estate Platform

First off, thank you for considering contributing to MLM Real Estate Platform! It's people like you that make this project better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [support@mlmrealestate.com](mailto:support@mlmrealestate.com).

### Our Standards

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Collaborative**: Work together towards common goals
- **Be Professional**: Maintain professional conduct in all interactions
- **Be Inclusive**: Welcome diverse perspectives and backgrounds

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

#### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Device Information:**
 - Device: [e.g. iPhone 12, Samsung Galaxy S21]
 - OS: [e.g. iOS 15.0, Android 12]
 - App Version: [e.g. 1.0.0]
 - Flutter Version: [e.g. 3.2.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful** to most users
- **List any alternatives** you've considered
- **Include mockups or examples** if applicable

### Pull Requests

Follow these steps to submit a pull request:

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** if you've added code that should be tested
4. **Update documentation** if you've changed APIs or added features
5. **Ensure the test suite passes** (`flutter test`)
6. **Format your code** (`flutter format .`)
7. **Analyze your code** (`flutter analyze`)
8. **Create a pull request** with a clear description

#### Pull Request Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement
- [ ] Test update

## Testing
Describe the tests you ran to verify your changes

## Screenshots (if applicable)
Add screenshots to demonstrate the changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

## Development Setup

### Prerequisites

- Flutter SDK (3.2.0 or higher)
- Dart SDK (3.2.0 or higher)
- Android Studio / Xcode
- Git

### Setup Steps

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/mlm_real_estate_app.git
   cd mlm_real_estate_app
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original-repo/mlm_real_estate_app.git
   ```

3. **Install dependencies**
   ```bash
   flutter pub get
   ```

4. **Run code generation**
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

5. **Create a branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

6. **Make your changes and commit**
   ```bash
   git add .
   git commit -m "Add some feature"
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/my-new-feature
   ```

8. **Create a Pull Request**

## Coding Standards

### Dart/Flutter Style Guide

Follow the [Effective Dart](https://dart.dev/guides/language/effective-dart) guidelines:

#### General Rules

- Use `lowerCamelCase` for variables, functions, and parameters
- Use `UpperCamelCase` for classes, types, and extensions
- Use `SCREAMING_SNAKE_CASE` for constants
- Use `snake_case` for library and file names

#### Code Organization

```dart
// 1. Imports (organized)
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// 2. Class definition
class MyWidget extends StatelessWidget {
  // 3. Static constants
  static const String routeName = '/my-widget';

  // 4. Final fields
  final String title;

  // 5. Constructor
  const MyWidget({
    Key? key,
    required this.title,
  }) : super(key: key);

  // 6. Lifecycle methods
  @override
  Widget build(BuildContext context) {
    return Container();
  }

  // 7. Private methods
  void _privateMethod() {
    // Implementation
  }

  // 8. Public methods
  void publicMethod() {
    // Implementation
  }
}
```

#### Widget Guidelines

- **Prefer composition over inheritance**
- **Extract complex widgets** into separate widgets
- **Use const constructors** where possible
- **Minimize rebuilds** by splitting widgets appropriately

#### State Management

- Use Provider or GetX consistently throughout the project
- Separate business logic from UI
- Keep widgets as dumb as possible

#### Code Quality

```bash
# Format code
flutter format .

# Analyze code
flutter analyze

# Run tests
flutter test

# Check coverage
flutter test --coverage
```

## Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **chore**: Changes to build process or auxiliary tools

### Examples

```
feat(auth): add biometric authentication

Add Face ID and Touch ID support for iOS and Android.
Users can now enable biometric login from settings.

Closes #123
```

```
fix(payment): resolve Razorpay integration issue

Fixed callback handling for payment success and failure.
Added proper error handling for network errors.

Fixes #456
```

## Testing

### Writing Tests

- Write unit tests for business logic
- Write widget tests for UI components
- Write integration tests for critical user flows

### Test Structure

```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('MyClass', () {
    late MyClass myClass;

    setUp(() {
      myClass = MyClass();
    });

    tearDown(() {
      // Clean up
    });

    test('should do something', () {
      // Arrange
      final input = 'test';

      // Act
      final result = myClass.doSomething(input);

      // Assert
      expect(result, 'expected output');
    });
  });
}
```

### Running Tests

```bash
# Run all tests
flutter test

# Run specific test file
flutter test test/widget_test.dart

# Run with coverage
flutter test --coverage

# View coverage report
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

## Documentation

### Code Comments

- Write clear, concise comments
- Explain **why**, not **what**
- Use doc comments for public APIs

```dart
/// Calculates the commission for a given sale amount.
///
/// The commission is calculated based on the user's level and
/// the total sale amount. Returns the commission amount in USD.
///
/// Parameters:
///   [amount] - The sale amount in USD
///   [level] - The user's MLM level (1-10)
///
/// Returns the calculated commission amount.
///
/// Throws [ArgumentError] if amount is negative or level is invalid.
double calculateCommission(double amount, int level) {
  // Implementation
}
```

### README Updates

- Update README.md when adding new features
- Include setup instructions for new dependencies
- Add screenshots for UI changes

### Changelog

Update CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [1.1.0] - 2025-01-15

### Added
- Biometric authentication support
- Property comparison feature

### Changed
- Updated payment gateway integration
- Improved network tree visualization

### Fixed
- Fixed crash on property details page
- Resolved memory leak in image loading

### Deprecated
- Old API endpoints (will be removed in v2.0)
```

## Review Process

1. **Code Review**: All PRs require at least one approval
2. **Tests**: All tests must pass
3. **Coverage**: Code coverage should not decrease
4. **CI/CD**: All CI checks must pass
5. **Documentation**: Documentation must be updated

## Questions?

Feel free to reach out:

- **Email**: dev@mlmrealestate.com
- **Discord**: [Join our server](https://discord.gg/mlmrealestate)
- **GitHub Issues**: [Create an issue](https://github.com/mlm-realestate/issues)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MLM Real Estate Platform! 🎉
