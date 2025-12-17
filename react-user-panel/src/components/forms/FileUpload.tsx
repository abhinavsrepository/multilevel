import React, { useCallback, useState } from 'react';
import { useDropzone, DropzoneOptions, FileRejection } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  LinearProgress,
  Chip,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  alpha,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  InsertDriveFile,
  Image as ImageIcon,
  PictureAsPdf,
  Description,
  Close,
} from '@mui/icons-material';

export interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: { [key: string]: string[] };
  multiple?: boolean;
  disabled?: boolean;
  showPreview?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (file: File): React.ReactNode => {
  if (file.type.startsWith('image/')) {
    return <ImageIcon color="primary" />;
  } else if (file.type === 'application/pdf') {
    return <PictureAsPdf color="error" />;
  } else if (
    file.type.includes('document') ||
    file.type.includes('word') ||
    file.type.includes('text')
  ) {
    return <Description color="info" />;
  }
  return <InsertDriveFile color="action" />;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  maxFiles = 5,
  maxSize = 5242880, // 5MB default
  acceptedFileTypes = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc', '.docx'],
  },
  multiple = true,
  disabled = false,
  showPreview = true,
  label = 'Upload Files',
  helperText = 'Drag and drop files here or click to browse',
  error,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [rejectionErrors, setRejectionErrors] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setRejectionErrors([]);

      // Handle rejected files
      if (fileRejections.length > 0) {
        const errors = fileRejections.map((rejection) => {
          const errorMessages = rejection.errors.map((e) => {
            if (e.code === 'file-too-large') {
              return `${rejection.file.name}: File is too large. Max size is ${formatFileSize(
                maxSize
              )}`;
            }
            if (e.code === 'file-invalid-type') {
              return `${rejection.file.name}: Invalid file type`;
            }
            if (e.code === 'too-many-files') {
              return `Too many files. Maximum ${maxFiles} files allowed`;
            }
            return `${rejection.file.name}: ${e.message}`;
          });
          return errorMessages.join(', ');
        });
        setRejectionErrors(errors);
      }

      // Handle accepted files
      if (acceptedFiles.length > 0) {
        const newFiles = acceptedFiles.map((file) => {
          const fileWithPreview = Object.assign(file, {
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          });
          return fileWithPreview;
        });

        const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;

        // Respect maxFiles limit
        const limitedFiles = updatedFiles.slice(0, maxFiles);

        setFiles(limitedFiles);
        onFilesChange(limitedFiles);

        // Simulate upload progress (replace with actual upload logic)
        setUploadProgress(0);
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 10;
          });
        }, 100);
      }
    },
    [files, multiple, maxFiles, maxSize, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
    disabled,
  } as DropzoneOptions);

  const removeFile = (fileToRemove: FileWithPreview) => {
    const newFiles = files.filter((file) => file !== fileToRemove);
    setFiles(newFiles);
    onFilesChange(newFiles);

    // Revoke preview URL to avoid memory leaks
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const clearAllFiles = () => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    onFilesChange([]);
    setRejectionErrors([]);
    setUploadProgress(0);
  };

  // Cleanup previews on unmount
  React.useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography variant="subtitle2" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
          {label}
        </Typography>
      )}

      <Paper
        {...getRootProps()}
        elevation={0}
        sx={{
          p: 3,
          border: 2,
          borderStyle: 'dashed',
          borderColor: error
            ? 'error.main'
            : isDragActive
            ? 'primary.main'
            : isDragReject
            ? 'error.main'
            : 'divider',
          backgroundColor: isDragActive
            ? (theme) => alpha(theme.palette.primary.main, 0.05)
            : isDragReject
            ? (theme) => alpha(theme.palette.error.main, 0.05)
            : 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          opacity: disabled ? 0.6 : 1,
          '&:hover': {
            borderColor: disabled ? 'divider' : 'primary.main',
            backgroundColor: disabled
              ? 'background.paper'
              : (theme) => alpha(theme.palette.primary.main, 0.03),
          },
        }}
        role="button"
        aria-label="File upload area"
        tabIndex={disabled ? -1 : 0}
      >
        <input {...getInputProps()} aria-label="File input" />
        <Stack spacing={2} alignItems="center">
          <CloudUpload
            sx={{
              fontSize: 48,
              color: isDragActive ? 'primary.main' : 'text.secondary',
              transition: 'color 0.3s ease',
            }}
          />
          <Box textAlign="center">
            <Typography variant="body1" gutterBottom>
              {isDragActive ? 'Drop files here' : helperText}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Max file size: {formatFileSize(maxSize)} | Max files: {maxFiles}
            </Typography>
          </Box>
          {isDragReject && (
            <Chip
              label="Some files will be rejected"
              color="error"
              size="small"
              icon={<Close />}
            />
          )}
        </Stack>
      </Paper>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', ml: 1.75 }}>
          {error}
        </Typography>
      )}

      {rejectionErrors.length > 0 && (
        <Alert
          severity="error"
          onClose={() => setRejectionErrors([])}
          sx={{ mt: 2 }}
          role="alert"
        >
          <Typography variant="subtitle2" gutterBottom>
            Upload Errors:
          </Typography>
          {rejectionErrors.map((error, index) => (
            <Typography key={index} variant="caption" display="block">
              • {error}
            </Typography>
          ))}
        </Alert>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Uploading... {uploadProgress}%
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Uploaded Files ({files.length}/{maxFiles})
            </Typography>
            <IconButton
              size="small"
              onClick={clearAllFiles}
              aria-label="Clear all files"
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>

          {showPreview && files.some((file) => file.preview) && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: 1,
                mb: 2,
              }}
            >
              {files
                .filter((file) => file.preview)
                .map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      paddingTop: '100%',
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <img
                      src={file.preview}
                      alt={file.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        },
                      }}
                      aria-label={`Remove ${file.name}`}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
            </Box>
          )}

          <List dense>
            {files.map((file, index) => (
              <ListItem
                key={index}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: 'background.paper',
                }}
              >
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                  {getFileIcon(file)}
                </Box>
                <ListItemText
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                  primaryTypographyProps={{
                    variant: 'body2',
                    noWrap: true,
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label={`Delete ${file.name}`}
                    onClick={() => removeFile(file)}
                    size="small"
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};
