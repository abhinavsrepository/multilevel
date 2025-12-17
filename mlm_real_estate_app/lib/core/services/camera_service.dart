import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:io';

/// Camera and image service for handling image capture and selection
/// Provides camera access, gallery selection, cropping, and compression
/// Implements singleton pattern for global access
class CameraService {
  CameraService._();
  static final CameraService _instance = CameraService._();
  static CameraService get instance => _instance;

  final ImagePicker _picker = ImagePicker();

  bool _isInitialized = false;

  /// Check if service is initialized
  bool get isInitialized => _isInitialized;

  /// Initialize camera service
  Future<void> initialize() async {
    if (_isInitialized) {
      debugPrint('CameraService already initialized');
      return;
    }

    try {
      _isInitialized = true;
      debugPrint('CameraService initialized');
    } catch (e) {
      debugPrint('Error initializing CameraService: $e');
      _isInitialized = true; // Initialize anyway to prevent repeated attempts
    }
  }

  // ==================== PERMISSION MANAGEMENT ====================

  /// Check camera permission status
  Future<PermissionStatus> checkCameraPermission() async {
    try {
      return await Permission.camera.status;
    } catch (e) {
      debugPrint('Error checking camera permission: $e');
      return PermissionStatus.denied;
    }
  }

  /// Request camera permission
  Future<PermissionStatus> requestCameraPermission() async {
    try {
      final status = await Permission.camera.request();
      debugPrint('Camera permission status: $status');
      return status;
    } catch (e) {
      debugPrint('Error requesting camera permission: $e');
      return PermissionStatus.denied;
    }
  }

  /// Check photo library permission status
  Future<PermissionStatus> checkPhotosPermission() async {
    try {
      return await Permission.photos.status;
    } catch (e) {
      debugPrint('Error checking photos permission: $e');
      return PermissionStatus.denied;
    }
  }

  /// Request photo library permission
  Future<PermissionStatus> requestPhotosPermission() async {
    try {
      final status = await Permission.photos.request();
      debugPrint('Photos permission status: $status');
      return status;
    } catch (e) {
      debugPrint('Error requesting photos permission: $e');
      return PermissionStatus.denied;
    }
  }

  /// Check storage permission (Android)
  Future<PermissionStatus> checkStoragePermission() async {
    try {
      if (Platform.isAndroid) {
        return await Permission.storage.status;
      }
      return PermissionStatus.granted;
    } catch (e) {
      debugPrint('Error checking storage permission: $e');
      return PermissionStatus.denied;
    }
  }

  /// Request storage permission (Android)
  Future<PermissionStatus> requestStoragePermission() async {
    try {
      if (Platform.isAndroid) {
        final status = await Permission.storage.request();
        debugPrint('Storage permission status: $status');
        return status;
      }
      return PermissionStatus.granted;
    } catch (e) {
      debugPrint('Error requesting storage permission: $e');
      return PermissionStatus.denied;
    }
  }

  /// Open app settings for permission management
  Future<bool> openSettings() async {
    try {
      return await openAppSettings();
    } catch (e) {
      debugPrint('Error opening app settings: $e');
      return false;
    }
  }

  // ==================== IMAGE PICKING ====================

  /// Pick image from camera
  Future<ImageResult> pickImageFromCamera({
    CameraDevice preferredCameraDevice = CameraDevice.rear,
    double? maxWidth,
    double? maxHeight,
    int imageQuality = 85,
    bool requestFullMetadata = true,
  }) async {
    try {
      // Check if initialized
      if (!_isInitialized) {
        await initialize();
      }

      // Check camera permission
      final permissionStatus = await checkCameraPermission();
      if (permissionStatus.isDenied) {
        final requestStatus = await requestCameraPermission();
        if (requestStatus.isDenied || requestStatus.isPermanentlyDenied) {
          return ImageResult(
            success: false,
            file: null,
            error: 'Camera permission denied. Please grant camera permission in app settings.',
          );
        }
      }

      // Pick image from camera
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: preferredCameraDevice,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        imageQuality: imageQuality,
        requestFullMetadata: requestFullMetadata,
      );

      if (image == null) {
        return ImageResult(
          success: false,
          file: null,
          error: 'No image captured',
        );
      }

      final file = File(image.path);
      debugPrint('Image captured from camera: ${file.path}');

      return ImageResult(
        success: true,
        file: file,
        error: null,
      );
    } catch (e) {
      debugPrint('Error picking image from camera: $e');
      return ImageResult(
        success: false,
        file: null,
        error: 'Failed to capture image: $e',
      );
    }
  }

  /// Pick image from gallery
  Future<ImageResult> pickImageFromGallery({
    double? maxWidth,
    double? maxHeight,
    int imageQuality = 85,
    bool requestFullMetadata = true,
  }) async {
    try {
      // Check if initialized
      if (!_isInitialized) {
        await initialize();
      }

      // Check photos permission
      if (Platform.isIOS) {
        final permissionStatus = await checkPhotosPermission();
        if (permissionStatus.isDenied) {
          final requestStatus = await requestPhotosPermission();
          if (requestStatus.isDenied || requestStatus.isPermanentlyDenied) {
            return ImageResult(
              success: false,
              file: null,
              error: 'Photos permission denied. Please grant photos permission in app settings.',
            );
          }
        }
      }

      // Pick image from gallery
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        imageQuality: imageQuality,
        requestFullMetadata: requestFullMetadata,
      );

      if (image == null) {
        return ImageResult(
          success: false,
          file: null,
          error: 'No image selected',
        );
      }

      final file = File(image.path);
      debugPrint('Image selected from gallery: ${file.path}');

      return ImageResult(
        success: true,
        file: file,
        error: null,
      );
    } catch (e) {
      debugPrint('Error picking image from gallery: $e');
      return ImageResult(
        success: false,
        file: null,
        error: 'Failed to select image: $e',
      );
    }
  }

  /// Pick multiple images from gallery
  Future<MultipleImageResult> pickMultipleImages({
    double? maxWidth,
    double? maxHeight,
    int imageQuality = 85,
    int? limit,
    bool requestFullMetadata = true,
  }) async {
    try {
      // Check if initialized
      if (!_isInitialized) {
        await initialize();
      }

      // Check photos permission
      if (Platform.isIOS) {
        final permissionStatus = await checkPhotosPermission();
        if (permissionStatus.isDenied) {
          final requestStatus = await requestPhotosPermission();
          if (requestStatus.isDenied || requestStatus.isPermanentlyDenied) {
            return MultipleImageResult(
              success: false,
              files: [],
              error: 'Photos permission denied. Please grant photos permission in app settings.',
            );
          }
        }
      }

      // Pick multiple images
      final List<XFile> images = await _picker.pickMultiImage(
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        imageQuality: imageQuality,
        limit: limit,
        requestFullMetadata: requestFullMetadata,
      );

      if (images.isEmpty) {
        return MultipleImageResult(
          success: false,
          files: [],
          error: 'No images selected',
        );
      }

      final files = images.map((image) => File(image.path)).toList();
      debugPrint('${files.length} images selected from gallery');

      return MultipleImageResult(
        success: true,
        files: files,
        error: null,
      );
    } catch (e) {
      debugPrint('Error picking multiple images: $e');
      return MultipleImageResult(
        success: false,
        files: [],
        error: 'Failed to select images: $e',
      );
    }
  }

  /// Pick video from camera
  Future<ImageResult> pickVideoFromCamera({
    CameraDevice preferredCameraDevice = CameraDevice.rear,
    Duration? maxDuration,
  }) async {
    try {
      // Check camera permission
      final permissionStatus = await checkCameraPermission();
      if (permissionStatus.isDenied) {
        final requestStatus = await requestCameraPermission();
        if (requestStatus.isDenied || requestStatus.isPermanentlyDenied) {
          return ImageResult(
            success: false,
            file: null,
            error: 'Camera permission denied',
          );
        }
      }

      // Pick video from camera
      final XFile? video = await _picker.pickVideo(
        source: ImageSource.camera,
        preferredCameraDevice: preferredCameraDevice,
        maxDuration: maxDuration,
      );

      if (video == null) {
        return ImageResult(
          success: false,
          file: null,
          error: 'No video captured',
        );
      }

      return ImageResult(
        success: true,
        file: File(video.path),
        error: null,
      );
    } catch (e) {
      debugPrint('Error picking video from camera: $e');
      return ImageResult(
        success: false,
        file: null,
        error: 'Failed to capture video: $e',
      );
    }
  }

  /// Pick video from gallery
  Future<ImageResult> pickVideoFromGallery({
    Duration? maxDuration,
  }) async {
    try {
      // Pick video from gallery
      final XFile? video = await _picker.pickVideo(
        source: ImageSource.gallery,
        maxDuration: maxDuration,
      );

      if (video == null) {
        return ImageResult(
          success: false,
          file: null,
          error: 'No video selected',
        );
      }

      return ImageResult(
        success: true,
        file: File(video.path),
        error: null,
      );
    } catch (e) {
      debugPrint('Error picking video from gallery: $e');
      return ImageResult(
        success: false,
        file: null,
        error: 'Failed to select video: $e',
      );
    }
  }

  // ==================== IMAGE CROPPING ====================

  /// Crop image
  Future<ImageResult> cropImage({
    required File imageFile,
    CropAspectRatio? aspectRatio,
    List<CropAspectRatioPreset> aspectRatioPresets = const [
      CropAspectRatioPreset.original,
      CropAspectRatioPreset.square,
      CropAspectRatioPreset.ratio3x2,
      CropAspectRatioPreset.ratio4x3,
      CropAspectRatioPreset.ratio16x9,
    ],
    CropStyle cropStyle = CropStyle.rectangle,
    int compressQuality = 90,
    int? maxWidth,
    int? maxHeight,
    String toolbarTitle = 'Crop Image',
    Color? toolbarColor,
    Color? toolbarWidgetColor,
  }) async {
    try {
      final croppedFile = await ImageCropper().cropImage(
        sourcePath: imageFile.path,
        aspectRatio: aspectRatio,
        compressQuality: compressQuality,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        uiSettings: [
          AndroidUiSettings(
            toolbarTitle: toolbarTitle,
            toolbarColor: toolbarColor ?? Colors.blue,
            toolbarWidgetColor: toolbarWidgetColor ?? Colors.white,
            initAspectRatio: CropAspectRatioPreset.original,
            lockAspectRatio: false,
            activeControlsWidgetColor: toolbarColor ?? Colors.blue,
            aspectRatioPresets: aspectRatioPresets,
            cropStyle: cropStyle,
          ),
          IOSUiSettings(
            title: toolbarTitle,
            aspectRatioLockEnabled: false,
            resetAspectRatioEnabled: true,
            rotateButtonsHidden: false,
            rotateClockwiseButtonHidden: false,
            aspectRatioPresets: aspectRatioPresets,
            cropStyle: cropStyle,
          ),
        ],
      );

      if (croppedFile == null) {
        return ImageResult(
          success: false,
          file: null,
          error: 'Image cropping cancelled',
        );
      }

      final file = File(croppedFile.path);
      debugPrint('Image cropped successfully: ${file.path}');

      return ImageResult(
        success: true,
        file: file,
        error: null,
      );
    } catch (e) {
      debugPrint('Error cropping image: $e');
      return ImageResult(
        success: false,
        file: null,
        error: 'Failed to crop image: $e',
      );
    }
  }

  // ==================== IMAGE COMPRESSION ====================

  /// Compress image
  Future<ImageResult> compressImage({
    required File imageFile,
    int quality = 85,
    int? minWidth,
    int? minHeight,
    CompressFormat format = CompressFormat.jpeg,
    bool keepExif = false,
  }) async {
    try {
      final targetPath = imageFile.path.replaceAll(
        RegExp(r'\.(jpg|jpeg|png|webp)$', caseSensitive: false),
        '_compressed.${format.name}',
      );

      final compressedFile = await FlutterImageCompress.compressAndGetFile(
        imageFile.absolute.path,
        targetPath,
        quality: quality,
        minWidth: minWidth ?? 1920,
        minHeight: minHeight ?? 1080,
        format: format,
        keepExif: keepExif,
      );

      if (compressedFile == null) {
        return ImageResult(
          success: false,
          file: null,
          error: 'Image compression failed',
        );
      }

      final file = File(compressedFile.path);
      final originalSize = await imageFile.length();
      final compressedSize = await file.length();
      final compressionRatio = (1 - (compressedSize / originalSize)) * 100;

      debugPrint('Image compressed successfully');
      debugPrint('Original size: ${_formatFileSize(originalSize)}');
      debugPrint('Compressed size: ${_formatFileSize(compressedSize)}');
      debugPrint('Compression ratio: ${compressionRatio.toStringAsFixed(2)}%');

      return ImageResult(
        success: true,
        file: file,
        error: null,
      );
    } catch (e) {
      debugPrint('Error compressing image: $e');
      return ImageResult(
        success: false,
        file: null,
        error: 'Failed to compress image: $e',
      );
    }
  }

  /// Compress image to specific file size (in bytes)
  Future<ImageResult> compressImageToSize({
    required File imageFile,
    int targetSizeInBytes = 1024 * 1024, // 1MB default
    CompressFormat format = CompressFormat.jpeg,
    int minQuality = 10,
    int maxQuality = 100,
  }) async {
    try {
      int quality = maxQuality;
      File? compressedFile;

      while (quality >= minQuality) {
        final result = await compressImage(
          imageFile: imageFile,
          quality: quality,
          format: format,
        );

        if (!result.success || result.file == null) {
          return result;
        }

        final fileSize = await result.file!.length();

        if (fileSize <= targetSizeInBytes) {
          compressedFile = result.file;
          break;
        }

        quality -= 10;
      }

      if (compressedFile == null) {
        return ImageResult(
          success: false,
          file: null,
          error: 'Could not compress image to target size',
        );
      }

      return ImageResult(
        success: true,
        file: compressedFile,
        error: null,
      );
    } catch (e) {
      debugPrint('Error compressing image to size: $e');
      return ImageResult(
        success: false,
        file: null,
        error: 'Failed to compress image: $e',
      );
    }
  }

  // ==================== UTILITY METHODS ====================

  /// Format file size to human-readable format
  String _formatFileSize(int bytes) {
    if (bytes < 1024) {
      return '$bytes B';
    } else if (bytes < 1024 * 1024) {
      return '${(bytes / 1024).toStringAsFixed(2)} KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(2)} MB';
    } else {
      return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(2)} GB';
    }
  }

  /// Get file size
  Future<int> getFileSize(File file) async {
    try {
      return await file.length();
    } catch (e) {
      debugPrint('Error getting file size: $e');
      return 0;
    }
  }

  /// Get formatted file size
  Future<String> getFormattedFileSize(File file) async {
    final size = await getFileSize(file);
    return _formatFileSize(size);
  }

  /// Dispose and cleanup
  void dispose() {
    _isInitialized = false;
  }
}

/// Image result wrapper
class ImageResult {
  final bool success;
  final File? file;
  final String? error;

  ImageResult({
    required this.success,
    required this.file,
    required this.error,
  });

  @override
  String toString() {
    return 'ImageResult(success: $success, file: ${file?.path}, error: $error)';
  }
}

/// Multiple image result wrapper
class MultipleImageResult {
  final bool success;
  final List<File> files;
  final String? error;

  MultipleImageResult({
    required this.success,
    required this.files,
    required this.error,
  });

  @override
  String toString() {
    return 'MultipleImageResult(success: $success, files: ${files.length}, error: $error)';
  }
}
