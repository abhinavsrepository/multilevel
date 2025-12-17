/// File handling utilities for reading, writing, and managing files
library;

import 'dart:io';
import 'package:path/path.dart' as path;
import 'package:path_provider/path_provider.dart';

class FileUtils {
  FileUtils._();

  // Supported file types
  static const List<String> imageExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'webp',
    'svg'
  ];
  static const List<String> videoExtensions = [
    'mp4',
    'avi',
    'mov',
    'wmv',
    'flv',
    'mkv',
    'webm'
  ];
  static const List<String> documentExtensions = [
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'txt',
    'csv'
  ];

  /// Converts file size from bytes to human-readable format
  static String getFileSize(int bytes, {int decimals = 2}) {
    if (bytes <= 0) return '0 B';

    const suffixes = ['B', 'KB', 'MB', 'GB', 'TB'];
    final i = (bytes.bitLength - 1) ~/ 10;

    if (i >= suffixes.length) {
      return '${(bytes / (1 << ((suffixes.length - 1) * 10))).toStringAsFixed(decimals)} ${suffixes.last}';
    }

    return '${(bytes / (1 << (i * 10))).toStringAsFixed(decimals)} ${suffixes[i]}';
  }

  /// Gets file size in bytes
  static Future<int> getFileSizeInBytes(String filePath) async {
    try {
      final file = File(filePath);
      if (await file.exists()) {
        return await file.length();
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  /// Gets file extension from file path
  static String getFileExtension(String filePath) {
    return path.extension(filePath).toLowerCase().replaceAll('.', '');
  }

  /// Gets file name from path (with extension)
  static String getFileName(String filePath) {
    return path.basename(filePath);
  }

  /// Gets file name without extension
  static String getFileNameWithoutExtension(String filePath) {
    return path.basenameWithoutExtension(filePath);
  }

  /// Gets directory path from file path
  static String getDirectoryPath(String filePath) {
    return path.dirname(filePath);
  }

  /// Checks if file is an image
  static bool isImage(String filePath) {
    final extension = getFileExtension(filePath);
    return imageExtensions.contains(extension);
  }

  /// Checks if file is a video
  static bool isVideo(String filePath) {
    final extension = getFileExtension(filePath);
    return videoExtensions.contains(extension);
  }

  /// Checks if file is a document
  static bool isDocument(String filePath) {
    final extension = getFileExtension(filePath);
    return documentExtensions.contains(extension);
  }

  /// Checks if file is a PDF
  static bool isPDF(String filePath) {
    return getFileExtension(filePath) == 'pdf';
  }

  /// Validates file size (in bytes)
  static bool validateFileSize(
    String filePath,
    int maxSizeInBytes,
  ) {
    try {
      final file = File(filePath);
      final fileSize = file.lengthSync();
      return fileSize <= maxSizeInBytes;
    } catch (e) {
      return false;
    }
  }

  /// Validates file size with async support
  static Future<bool> validateFileSizeAsync(
    String filePath,
    int maxSizeInBytes,
  ) async {
    try {
      final file = File(filePath);
      if (!await file.exists()) return false;
      final fileSize = await file.length();
      return fileSize <= maxSizeInBytes;
    } catch (e) {
      return false;
    }
  }

  /// Validates file type by extension
  static bool validateFileType(
    String filePath,
    List<String> allowedExtensions,
  ) {
    final extension = getFileExtension(filePath);
    return allowedExtensions
        .map((e) => e.toLowerCase())
        .contains(extension.toLowerCase());
  }

  /// Gets MIME type from file extension
  static String getMimeType(String filePath) {
    final extension = getFileExtension(filePath);

    final mimeTypes = {
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      // Videos
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv',
      'flv': 'video/x-flv',
      'mkv': 'video/x-matroska',
      'webm': 'video/webm',
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx':
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'json': 'application/json',
      'xml': 'application/xml',
      // Archives
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
    };

    return mimeTypes[extension] ?? 'application/octet-stream';
  }

  /// Saves file to app's document directory
  static Future<String?> saveFileToStorage(
    String sourceFilePath,
    String fileName,
  ) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final filePath = path.join(directory.path, fileName);
      final sourceFile = File(sourceFilePath);

      if (!await sourceFile.exists()) {
        return null;
      }

      await sourceFile.copy(filePath);
      return filePath;
    } catch (e) {
      return null;
    }
  }

  /// Reads file from storage
  static Future<File?> readFileFromStorage(String fileName) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final filePath = path.join(directory.path, fileName);
      final file = File(filePath);

      if (await file.exists()) {
        return file;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Reads file content as string
  static Future<String?> readFileAsString(String filePath) async {
    try {
      final file = File(filePath);
      if (await file.exists()) {
        return await file.readAsString();
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Writes string content to file
  static Future<bool> writeStringToFile(
    String content,
    String fileName,
  ) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final filePath = path.join(directory.path, fileName);
      final file = File(filePath);
      await file.writeAsString(content);
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Deletes file from storage
  static Future<bool> deleteFile(String fileName) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final filePath = path.join(directory.path, fileName);
      final file = File(filePath);

      if (await file.exists()) {
        await file.delete();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Deletes file by full path
  static Future<bool> deleteFileByPath(String filePath) async {
    try {
      final file = File(filePath);
      if (await file.exists()) {
        await file.delete();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Checks if file exists
  static Future<bool> fileExists(String filePath) async {
    try {
      final file = File(filePath);
      return await file.exists();
    } catch (e) {
      return false;
    }
  }

  /// Creates directory if it doesn't exist
  static Future<Directory?> createDirectory(String directoryPath) async {
    try {
      final directory = Directory(directoryPath);
      if (!await directory.exists()) {
        return await directory.create(recursive: true);
      }
      return directory;
    } catch (e) {
      return null;
    }
  }

  /// Lists all files in a directory
  static Future<List<File>> listFilesInDirectory(String directoryPath) async {
    try {
      final directory = Directory(directoryPath);
      if (!await directory.exists()) {
        return [];
      }

      final entities = await directory.list().toList();
      return entities.whereType<File>().toList();
    } catch (e) {
      return [];
    }
  }

  /// Gets temporary directory
  static Future<Directory> getTempDirectory() async {
    return await getTemporaryDirectory();
  }

  /// Gets application documents directory
  static Future<Directory> getAppDocumentsDirectory() async {
    return await getApplicationDocumentsDirectory();
  }

  /// Gets application support directory
  static Future<Directory> getAppSupportDirectory() async {
    return await getApplicationSupportDirectory();
  }

  /// Copies file to destination
  static Future<File?> copyFile(
    String sourcePath,
    String destinationPath,
  ) async {
    try {
      final sourceFile = File(sourcePath);
      if (!await sourceFile.exists()) {
        return null;
      }
      return await sourceFile.copy(destinationPath);
    } catch (e) {
      return null;
    }
  }

  /// Moves file to destination
  static Future<File?> moveFile(
    String sourcePath,
    String destinationPath,
  ) async {
    try {
      final sourceFile = File(sourcePath);
      if (!await sourceFile.exists()) {
        return null;
      }
      return await sourceFile.rename(destinationPath);
    } catch (e) {
      return null;
    }
  }

  /// Renames file
  static Future<File?> renameFile(String filePath, String newName) async {
    try {
      final file = File(filePath);
      if (!await file.exists()) {
        return null;
      }

      final directory = getDirectoryPath(filePath);
      final newPath = path.join(directory, newName);
      return await file.rename(newPath);
    } catch (e) {
      return null;
    }
  }

  /// Gets file last modified date
  static Future<DateTime?> getFileLastModified(String filePath) async {
    try {
      final file = File(filePath);
      if (await file.exists()) {
        return await file.lastModified();
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Clears all files in directory
  static Future<bool> clearDirectory(String directoryPath) async {
    try {
      final directory = Directory(directoryPath);
      if (await directory.exists()) {
        await directory.delete(recursive: true);
        await directory.create();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Gets total size of directory
  static Future<int> getDirectorySize(String directoryPath) async {
    try {
      final directory = Directory(directoryPath);
      if (!await directory.exists()) {
        return 0;
      }

      int totalSize = 0;
      await for (final entity in directory.list(recursive: true)) {
        if (entity is File) {
          totalSize += await entity.length();
        }
      }
      return totalSize;
    } catch (e) {
      return 0;
    }
  }
}
