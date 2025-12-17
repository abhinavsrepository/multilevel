/// Network utilities for handling network operations and connectivity
library;

import 'dart:async';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as path;

class NetworkUtils {
  NetworkUtils._();

  static final Connectivity _connectivity = Connectivity();

  /// Checks if device has internet connection
  static Future<bool> hasInternetConnection() async {
    try {
      final result = await _connectivity.checkConnectivity();

      if (result.contains(ConnectivityResult.none)) {
        return false;
      }

      // Additional check by pinging a reliable server
      final result2 = await InternetAddress.lookup('google.com');
      return result2.isNotEmpty && result2[0].rawAddress.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  /// Gets network connectivity type
  static Future<String> getNetworkType() async {
    try {
      final result = await _connectivity.checkConnectivity();

      if (result.contains(ConnectivityResult.mobile)) {
        return 'Mobile';
      } else if (result.contains(ConnectivityResult.wifi)) {
        return 'WiFi';
      } else if (result.contains(ConnectivityResult.ethernet)) {
        return 'Ethernet';
      } else if (result.contains(ConnectivityResult.vpn)) {
        return 'VPN';
      } else if (result.contains(ConnectivityResult.bluetooth)) {
        return 'Bluetooth';
      } else if (result.contains(ConnectivityResult.none)) {
        return 'No Connection';
      } else {
        return 'Unknown';
      }
    } catch (e) {
      return 'Error';
    }
  }

  /// Checks if connected to WiFi
  static Future<bool> isWiFiConnected() async {
    try {
      final result = await _connectivity.checkConnectivity();
      return result.contains(ConnectivityResult.wifi);
    } catch (e) {
      return false;
    }
  }

  /// Checks if connected to mobile data
  static Future<bool> isMobileDataConnected() async {
    try {
      final result = await _connectivity.checkConnectivity();
      return result.contains(ConnectivityResult.mobile);
    } catch (e) {
      return false;
    }
  }

  /// Listens to connectivity changes
  static Stream<List<ConnectivityResult>> onConnectivityChanged() {
    return _connectivity.onConnectivityChanged;
  }

  /// Gets IP address
  static Future<String?> getIPAddress() async {
    try {
      final interfaces = await NetworkInterface.list();

      for (final interface in interfaces) {
        for (final address in interface.addresses) {
          if (address.type == InternetAddressType.IPv4) {
            return address.address;
          }
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Downloads file with progress tracking
  static Future<String?> downloadFile({
    required String url,
    String? savePath,
    String? fileName,
    void Function(int, int)? onProgress,
    CancelToken? cancelToken,
  }) async {
    try {
      final dio = Dio();

      // Determine save path
      String filePath;
      if (savePath != null && fileName != null) {
        filePath = path.join(savePath, fileName);
      } else {
        final directory = await getApplicationDocumentsDirectory();
        fileName ??= path.basename(url);
        filePath = path.join(directory.path, fileName);
      }

      // Download file
      await dio.download(
        url,
        filePath,
        onReceiveProgress: (received, total) {
          if (total != -1) {
            onProgress?.call(received, total);
          }
        },
        cancelToken: cancelToken,
      );

      return filePath;
    } catch (e) {
      return null;
    }
  }

  /// Downloads file with percentage callback
  static Future<String?> downloadFileWithPercentage({
    required String url,
    String? savePath,
    String? fileName,
    void Function(double)? onProgressPercentage,
    CancelToken? cancelToken,
  }) async {
    return downloadFile(
      url: url,
      savePath: savePath,
      fileName: fileName,
      onProgress: (received, total) {
        if (total != -1) {
          final percentage = (received / total) * 100;
          onProgressPercentage?.call(percentage);
        }
      },
      cancelToken: cancelToken,
    );
  }

  /// Uploads file with progress tracking
  static Future<Response?> uploadFile({
    required String url,
    required String filePath,
    String fieldName = 'file',
    Map<String, dynamic>? additionalData,
    void Function(int, int)? onProgress,
    CancelToken? cancelToken,
    Map<String, String>? headers,
  }) async {
    try {
      final dio = Dio();

      final file = File(filePath);
      if (!await file.exists()) {
        return null;
      }

      final fileName = path.basename(filePath);
      final formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(
          filePath,
          filename: fileName,
        ),
        if (additionalData != null) ...additionalData,
      });

      final response = await dio.post(
        url,
        data: formData,
        onSendProgress: (sent, total) {
          if (total != -1) {
            onProgress?.call(sent, total);
          }
        },
        options: Options(
          headers: headers,
        ),
        cancelToken: cancelToken,
      );

      return response;
    } catch (e) {
      return null;
    }
  }

  /// Uploads file with percentage callback
  static Future<Response?> uploadFileWithPercentage({
    required String url,
    required String filePath,
    String fieldName = 'file',
    Map<String, dynamic>? additionalData,
    void Function(double)? onProgressPercentage,
    CancelToken? cancelToken,
    Map<String, String>? headers,
  }) async {
    return uploadFile(
      url: url,
      filePath: filePath,
      fieldName: fieldName,
      additionalData: additionalData,
      onProgress: (sent, total) {
        if (total != -1) {
          final percentage = (sent / total) * 100;
          onProgressPercentage?.call(percentage);
        }
      },
      cancelToken: cancelToken,
      headers: headers,
    );
  }

  /// Retries failed request with exponential backoff
  static Future<T?> retryRequest<T>({
    required Future<T> Function() request,
    int maxRetries = 3,
    Duration initialDelay = const Duration(seconds: 1),
    double backoffMultiplier = 2.0,
  }) async {
    int retryCount = 0;
    Duration currentDelay = initialDelay;

    while (retryCount < maxRetries) {
      try {
        return await request();
      } catch (e) {
        retryCount++;

        if (retryCount >= maxRetries) {
          rethrow;
        }

        await Future.delayed(currentDelay);
        currentDelay *= backoffMultiplier.toInt();
      }
    }

    return null;
  }

  /// Pings a server to check connectivity
  static Future<bool> pingServer(String host, {int timeout = 5}) async {
    try {
      final result = await InternetAddress.lookup(host).timeout(
        Duration(seconds: timeout),
      );
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  /// Gets download speed (approximate, in MB/s)
  static Future<double> getDownloadSpeed({
    String testUrl = 'https://www.google.com',
    int timeout = 10,
  }) async {
    try {
      final stopwatch = Stopwatch()..start();

      final dio = Dio();
      final response = await dio.get(
        testUrl,
        options: Options(
          responseType: ResponseType.bytes,
          receiveTimeout: Duration(seconds: timeout),
        ),
      );

      stopwatch.stop();

      final bytes = response.data.length;
      final seconds = stopwatch.elapsedMilliseconds / 1000;
      final mbps = (bytes / 1024 / 1024) / seconds;

      return mbps;
    } catch (e) {
      return 0.0;
    }
  }

  /// Checks if URL is reachable
  static Future<bool> isUrlReachable(String url, {int timeout = 5}) async {
    try {
      final dio = Dio();
      final response = await dio.head(
        url,
        options: Options(
          receiveTimeout: Duration(seconds: timeout),
          sendTimeout: Duration(seconds: timeout),
        ),
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Gets network latency (ping time in milliseconds)
  static Future<int> getNetworkLatency({
    String host = 'google.com',
    int timeout = 5,
  }) async {
    try {
      final stopwatch = Stopwatch()..start();

      await InternetAddress.lookup(host).timeout(
        Duration(seconds: timeout),
      );

      stopwatch.stop();
      return stopwatch.elapsedMilliseconds;
    } catch (e) {
      return -1;
    }
  }

  /// Creates a cancel token for canceling requests
  static CancelToken createCancelToken() {
    return CancelToken();
  }

  /// Cancels request using cancel token
  static void cancelRequest(CancelToken cancelToken, [String? reason]) {
    cancelToken.cancel(reason);
  }

  /// Checks if request was canceled
  static bool isRequestCanceled(dynamic error) {
    return error is DioException && error.type == DioExceptionType.cancel;
  }

  /// Gets file size from URL without downloading
  static Future<int?> getRemoteFileSize(String url) async {
    try {
      final dio = Dio();
      final response = await dio.head(url);

      final contentLength = response.headers.value('content-length');
      if (contentLength != null) {
        return int.tryParse(contentLength);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Checks if connection is metered (mobile data)
  static Future<bool> isMeteredConnection() async {
    try {
      final result = await _connectivity.checkConnectivity();
      return result.contains(ConnectivityResult.mobile);
    } catch (e) {
      return false;
    }
  }

  /// Waits for internet connection
  static Future<void> waitForConnection({
    Duration checkInterval = const Duration(seconds: 2),
    Duration? timeout,
  }) async {
    final startTime = DateTime.now();

    while (true) {
      if (await hasInternetConnection()) {
        return;
      }

      if (timeout != null &&
          DateTime.now().difference(startTime) > timeout) {
        throw TimeoutException('Connection timeout');
      }

      await Future.delayed(checkInterval);
    }
  }

  /// Gets connectivity result
  static Future<List<ConnectivityResult>> getConnectivityResult() async {
    return await _connectivity.checkConnectivity();
  }

  /// Formats download/upload speed
  static String formatSpeed(double bytesPerSecond) {
    if (bytesPerSecond < 1024) {
      return '${bytesPerSecond.toStringAsFixed(2)} B/s';
    } else if (bytesPerSecond < 1024 * 1024) {
      return '${(bytesPerSecond / 1024).toStringAsFixed(2)} KB/s';
    } else {
      return '${(bytesPerSecond / 1024 / 1024).toStringAsFixed(2)} MB/s';
    }
  }
}
