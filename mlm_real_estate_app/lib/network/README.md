# Network Layer Documentation

This directory contains the complete network layer implementation for the MLM Real Estate App.

## Files

### 1. api_error.dart
Handles all API errors with comprehensive error types and messages.

### 2. api_interceptor.dart
Manages request/response interception, token injection, and automatic token refresh.

### 3. api_client.dart
Singleton API client with all HTTP methods and file operations.

## Usage Examples

### Basic Setup

```dart
import 'package:mlm_real_estate_app/network/api_client.dart';
import 'package:mlm_real_estate_app/network/api_error.dart';

// Get API client instance
final apiClient = ApiClient.instance;
```

### Authentication

```dart
// Login and save tokens
try {
  final response = await apiClient.post(
    '/auth/login',
    data: {
      'email': 'user@example.com',
      'password': 'password123',
    },
  );

  // Save tokens
  await apiClient.interceptor.saveTokens(
    accessToken: response['accessToken'],
    refreshToken: response['refreshToken'],
  );
} on ApiError catch (e) {
  print('Login failed: ${e.message}');
}

// Check authentication status
final isAuthenticated = await apiClient.interceptor.isAuthenticated();

// Logout
await apiClient.interceptor.logout();
```

### GET Request

```dart
try {
  final users = await apiClient.get(
    '/users',
    queryParameters: {
      'page': 1,
      'limit': 10,
      'status': 'active',
    },
  );
  print('Users: $users');
} on ApiError catch (e) {
  if (e.isNetworkError) {
    print('No internet connection');
  } else if (e.isUnauthorized) {
    print('Please login again');
  } else {
    print('Error: ${e.message}');
  }
}
```

### POST Request

```dart
try {
  final newUser = await apiClient.post(
    '/users',
    data: {
      'name': 'John Doe',
      'email': 'john@example.com',
      'phone': '+1234567890',
    },
  );
  print('User created: $newUser');
} on ApiError catch (e) {
  if (e.isValidationError) {
    print('Validation errors: ${e.data}');
  } else {
    print('Error: ${e.message}');
  }
}
```

### PUT Request

```dart
try {
  final updatedUser = await apiClient.put(
    '/users/123',
    data: {
      'name': 'John Smith',
      'phone': '+9876543210',
    },
  );
  print('User updated: $updatedUser');
} on ApiError catch (e) {
  print('Update failed: ${e.message}');
}
```

### DELETE Request

```dart
try {
  await apiClient.delete('/users/123');
  print('User deleted successfully');
} on ApiError catch (e) {
  print('Delete failed: ${e.message}');
}
```

### File Upload (Single)

```dart
import 'dart:io';

try {
  final file = File('/path/to/image.jpg');
  final response = await apiClient.uploadFile(
    '/upload/profile-picture',
    file: file,
    fieldName: 'avatar',
    data: {
      'userId': '123',
    },
    onSendProgress: (sent, total) {
      final progress = (sent / total * 100).toStringAsFixed(0);
      print('Upload progress: $progress%');
    },
  );
  print('Upload successful: $response');
} on ApiError catch (e) {
  print('Upload failed: ${e.message}');
}
```

### File Upload (Multiple)

```dart
try {
  final files = [
    File('/path/to/image1.jpg'),
    File('/path/to/image2.jpg'),
    File('/path/to/image3.jpg'),
  ];

  final response = await apiClient.uploadMultipleFiles(
    '/upload/property-images',
    files: files,
    fieldName: 'images',
    data: {
      'propertyId': '456',
    },
    onSendProgress: (sent, total) {
      final progress = (sent / total * 100).toStringAsFixed(0);
      print('Upload progress: $progress%');
    },
  );
  print('Multiple files uploaded: $response');
} on ApiError catch (e) {
  print('Upload failed: ${e.message}');
}
```

### File Download

```dart
import 'package:path_provider/path_provider.dart';

try {
  final directory = await getApplicationDocumentsDirectory();
  final savePath = '${directory.path}/downloaded_file.pdf';

  final filePath = await apiClient.downloadFile(
    '/files/download/report.pdf',
    savePath: savePath,
    onReceiveProgress: (received, total) {
      if (total != -1) {
        final progress = (received / total * 100).toStringAsFixed(0);
        print('Download progress: $progress%');
      }
    },
  );
  print('File saved to: $filePath');
} on ApiError catch (e) {
  print('Download failed: ${e.message}');
}
```

### Request Cancellation

```dart
final cancelToken = apiClient.createCancelToken();

try {
  final response = await apiClient.get(
    '/large-data',
    cancelToken: cancelToken,
  );
  print('Response: $response');
} on ApiError catch (e) {
  if (apiClient.isCancelled(e.originalError)) {
    print('Request was cancelled');
  } else {
    print('Error: ${e.message}');
  }
}

// Cancel the request
cancelToken.cancel('User cancelled');
```

### Error Handling

```dart
try {
  final response = await apiClient.get('/some-endpoint');
  print('Success: $response');
} on ApiError catch (e) {
  // Check error type
  if (e.isNetworkError) {
    // Handle network errors
    print('No internet connection');
  } else if (e.isTimeoutError) {
    // Handle timeout errors
    print('Request timed out');
  } else if (e.isServerError) {
    // Handle server errors (5xx)
    print('Server error: ${e.message}');
  } else if (e.isUnauthorized) {
    // Handle unauthorized (401)
    print('Please login again');
  } else if (e.isValidationError) {
    // Handle validation errors (422)
    print('Validation failed: ${e.data}');
  } else {
    // Handle other errors
    print('Error: ${e.message}');
  }

  // Access error details
  print('Status code: ${e.statusCode}');
  print('Error type: ${e.type}');
  print('Error data: ${e.data}');
}
```

### Advanced Configuration

```dart
// Update base URL
apiClient.updateBaseUrl('https://new-api.example.com');

// Update timeouts
apiClient.updateTimeouts(
  connectTimeout: Duration(seconds: 60),
  receiveTimeout: Duration(seconds: 60),
  sendTimeout: Duration(seconds: 60),
);

// Add custom header
apiClient.addHeader('X-Custom-Header', 'custom-value');

// Remove header
apiClient.removeHeader('X-Custom-Header');

// Reset client (useful for testing)
ApiClient.reset();
```

## Features

- **Automatic Token Management**: Access tokens are automatically injected into requests
- **Token Refresh**: Automatically refreshes tokens on 401 responses
- **Retry Mechanism**: Automatically retries failed requests (network errors, 502, 503, 504)
- **Type Safety**: Fully type-safe with generics support
- **Progress Tracking**: Upload and download progress callbacks
- **Error Handling**: Comprehensive error handling with custom error types
- **Device Info**: Automatically includes device and app version information
- **Debug Logging**: Pretty logging in debug mode (disabled in production)
- **Request Cancellation**: Support for cancelling ongoing requests
- **Secure Storage**: Tokens stored securely using flutter_secure_storage

## Error Types

- `network` - No internet connection
- `timeout` - Request/response timeout
- `badRequest` - Bad request (400)
- `unauthorized` - Unauthorized (401)
- `forbidden` - Forbidden (403)
- `notFound` - Not found (404)
- `conflict` - Conflict (409)
- `validationError` - Validation error (422)
- `tooManyRequests` - Too many requests (429)
- `serverError` - Server error (5xx)
- `cancelled` - Request cancelled
- `security` - Security/certificate error
- `unknown` - Unknown error

## Best Practices

1. Always use try-catch with ApiError for error handling
2. Use CancelToken for long-running requests that can be cancelled
3. Implement progress callbacks for file uploads/downloads
4. Handle different error types appropriately in the UI
5. Use the interceptor's token management methods for authentication
6. Test error scenarios thoroughly (network errors, timeouts, etc.)

## Notes

- The API client uses a singleton pattern - always use `ApiClient.instance`
- Tokens are stored securely and automatically injected into requests
- Token refresh happens automatically on 401 responses
- Failed requests are automatically retried up to 3 times (for network errors)
- Pretty logging is only enabled in debug mode for performance
