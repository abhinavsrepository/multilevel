package com.realestate.mlm.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Utility class for handling file uploads, deletions, and validations.
 */
@Slf4j
@Component
public class FileUploadUtil {

    @Value("${file.upload.dir:uploads}")
    private String uploadDir;

    @Value("${file.upload.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final Set<String> VALID_IMAGE_TYPES = new HashSet<>(
            Arrays.asList("image/jpeg", "image/png", "image/gif", "image/webp"));
    private static final Set<String> VALID_DOCUMENT_TYPES = new HashSet<>(
            Arrays.asList("application/pdf", "image/jpeg", "image/png"));
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> VALID_IMAGE_EXTENSIONS = new HashSet<>(
            Arrays.asList(".jpg", ".jpeg", ".png", ".gif", ".webp"));
    private static final Set<String> VALID_DOCUMENT_EXTENSIONS = new HashSet<>(
            Arrays.asList(".pdf", ".jpg", ".jpeg", ".png"));

    /**
     * Upload file to specified folder and return the URL.
     *
     * @param file   The file to upload
     * @param folder The folder where file should be stored
     * @return URL of the uploaded file
     */
    public String uploadFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            log.warn("Attempted to upload empty file");
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            log.warn("File size {} exceeds maximum allowed size {}", file.getSize(), MAX_FILE_SIZE);
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }

        try {
            // Create folder if it doesn't exist
            String folderPath = uploadDir + File.separator + folder;
            Files.createDirectories(Paths.get(folderPath));

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String uniqueFilename = generateUniqueFilename(originalFilename);
            String filepath = folderPath + File.separator + uniqueFilename;

            // Save file
            file.transferTo(new File(filepath));

            // Generate and return URL
            String fileUrl = baseUrl + "/uploads/" + folder + "/" + uniqueFilename;
            log.info("File uploaded successfully: {}", fileUrl);
            return fileUrl;
        } catch (IOException e) {
            log.error("Error uploading file: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    /**
     * Delete file by URL.
     *
     * @param fileUrl The URL of the file to delete
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            log.warn("Attempted to delete file with empty URL");
            return;
        }

        try {
            // Extract file path from URL
            String filePath = extractFilePathFromUrl(fileUrl);
            File file = new File(filePath);

            if (file.exists() && file.delete()) {
                log.info("File deleted successfully: {}", fileUrl);
            } else {
                log.warn("File not found or could not be deleted: {}", fileUrl);
            }
        } catch (Exception e) {
            log.error("Error deleting file: {}", fileUrl, e);
        }
    }

    /**
     * Validate if file is a valid image.
     *
     * @param file The file to validate
     * @return True if file is a valid image, false otherwise
     */
    public boolean isValidImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        // Check MIME type
        String contentType = file.getContentType();
        if (!VALID_IMAGE_TYPES.contains(contentType)) {
            log.warn("Invalid image MIME type: {}", contentType);
            return false;
        }

        // Check file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return false;
        }

        String fileExtension = getFileExtension(originalFilename).toLowerCase();
        if (!VALID_IMAGE_EXTENSIONS.contains(fileExtension)) {
            log.warn("Invalid image file extension: {}", fileExtension);
            return false;
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            log.warn("Image file size exceeds maximum: {}", file.getSize());
            return false;
        }

        return true;
    }

    /**
     * Validate if file is a valid document (PDF or image).
     *
     * @param file The file to validate
     * @return True if file is a valid document, false otherwise
     */
    public boolean isValidDocument(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        // Check MIME type
        String contentType = file.getContentType();
        if (!VALID_DOCUMENT_TYPES.contains(contentType)) {
            log.warn("Invalid document MIME type: {}", contentType);
            return false;
        }

        // Check file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return false;
        }

        String fileExtension = getFileExtension(originalFilename).toLowerCase();
        if (!VALID_DOCUMENT_EXTENSIONS.contains(fileExtension)) {
            log.warn("Invalid document file extension: {}", fileExtension);
            return false;
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            log.warn("Document file size exceeds maximum: {}", file.getSize());
            return false;
        }

        return true;
    }

    /**
     * Mask account number - Show only last 4 digits.
     *
     * @param accountNumber The account number to mask
     * @return Masked account number
     */
    public String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 4) {
            log.warn("Invalid account number for masking");
            return "****";
        }

        int length = accountNumber.length();
        String lastFour = accountNumber.substring(length - 4);
        String masked = "*".repeat(length - 4) + lastFour;

        log.debug("Account number masked");
        return masked;
    }

    /**
     * Generate unique filename by appending timestamp.
     *
     * @param originalFilename Original filename
     * @return Unique filename
     */
    private String generateUniqueFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isEmpty()) {
            return System.currentTimeMillis() + "";
        }

        String nameWithoutExtension = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
        String extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        return nameWithoutExtension + "_" + System.currentTimeMillis() + extension;
    }

    /**
     * Extract file extension from filename.
     *
     * @param filename The filename
     * @return File extension including dot
     */
    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0) {
            return filename.substring(lastDot);
        }
        return "";
    }

    /**
     * Extract file path from URL.
     *
     * @param fileUrl The file URL
     * @return File path
     */
    private String extractFilePathFromUrl(String fileUrl) {
        // Remove base URL and construct file path
        String relativePath = fileUrl.replace(baseUrl + "/uploads/", "");
        return uploadDir + File.separator + relativePath;
    }
}
