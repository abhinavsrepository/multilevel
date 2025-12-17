package com.realestate.mlm.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * File Storage Service - Simulates S3 uploads
 * In production, replace with AWS S3 SDK
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private static final String UPLOAD_DIR = "uploads/";
    private static final String BASE_URL = "https://cdn.realestate-mlm.com/";

    /**
     * Upload single file
     */
    public String uploadFile(MultipartFile file, String folder) {
        log.info("Uploading file: {}, size: {}, folder: {}", file.getOriginalFilename(), file.getSize(), folder);

        try {
            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;

            // Create directory if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR + folder);
            Files.createDirectories(uploadPath);

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return URL (simulated S3 URL)
            String fileUrl = BASE_URL + folder + "/" + filename;
            log.info("File uploaded successfully: {}", fileUrl);

            return fileUrl;

        } catch (IOException e) {
            log.error("Failed to upload file: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Upload multiple files
     */
    public List<String> uploadFiles(List<MultipartFile> files, String folder) {
        log.info("Uploading {} files to folder: {}", files.size(), folder);

        List<String> uploadedUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            String url = uploadFile(file, folder);
            uploadedUrls.add(url);
        }

        log.info("Successfully uploaded {} files", uploadedUrls.size());

        return uploadedUrls;
    }

    /**
     * Delete file
     */
    public void deleteFile(String fileUrl) {
        log.info("Deleting file: {}", fileUrl);

        try {
            // Extract filename from URL
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            String folder = fileUrl.substring(BASE_URL.length(), fileUrl.lastIndexOf("/"));

            Path filePath = Paths.get(UPLOAD_DIR + folder + "/" + filename);

            Files.deleteIfExists(filePath);

            log.info("File deleted successfully: {}", fileUrl);

        } catch (IOException e) {
            log.error("Failed to delete file: {}", fileUrl, e);
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }

    /**
     * Validate file type
     */
    public boolean isValidFileType(MultipartFile file, String[] allowedTypes) {
        String contentType = file.getContentType();
        if (contentType == null) {
            return false;
        }

        for (String type : allowedTypes) {
            if (contentType.contains(type)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Validate file size (in MB)
     */
    public boolean isValidFileSize(MultipartFile file, long maxSizeMB) {
        long maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.getSize() <= maxSizeBytes;
    }
}
