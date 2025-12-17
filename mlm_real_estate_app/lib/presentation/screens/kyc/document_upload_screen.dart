import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path_provider/path_provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../data/providers/kyc_provider.dart';
import 'widgets/upload_widget.dart';

/// Document Upload Screen - Upload KYC documents
///
/// Allows users to select document type, upload front and back images,
/// enter document number, and submit for verification.
class DocumentUploadScreen extends StatefulWidget {
  const DocumentUploadScreen({super.key});

  @override
  State<DocumentUploadScreen> createState() => _DocumentUploadScreenState();
}

class _DocumentUploadScreenState extends State<DocumentUploadScreen> {
  final _formKey = GlobalKey<FormState>();
  final _documentNumberController = TextEditingController();
  final ImagePicker _picker = ImagePicker();

  String _selectedDocumentType = 'aadhaar';
  File? _frontImage;
  File? _backImage;
  bool _isUploading = false;

  final List<Map<String, String>> _documentTypes = [
    {'id': 'aadhaar', 'label': 'Aadhaar Card', 'requiresBack': 'true'},
    {'id': 'pan', 'label': 'PAN Card', 'requiresBack': 'false'},
    {'id': 'passport', 'label': 'Passport', 'requiresBack': 'true'},
    {'id': 'driving_license', 'label': 'Driving License', 'requiresBack': 'true'},
    {'id': 'voter_id', 'label': 'Voter ID', 'requiresBack': 'true'},
  ];

  bool get _requiresBackImage {
    final docType = _documentTypes.firstWhere((d) => d['id'] == _selectedDocumentType);
    return docType['requiresBack'] == 'true';
  }

  @override
  void dispose() {
    _documentNumberController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(bool isFront) async {
    final source = await _showImageSourceDialog();
    if (source == null) return;

    try {
      final XFile? pickedFile = await _picker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );

      if (pickedFile == null) return;

      final compressedFile = await _compressImage(File(pickedFile.path));

      setState(() {
        if (isFront) {
          _frontImage = compressedFile;
        } else {
          _backImage = compressedFile;
        }
      });
    } catch (e) {
      _showMessage('Failed to pick image: $e');
    }
  }

  Future<ImageSource?> _showImageSourceDialog() async {
    return showDialog<ImageSource>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Image Source'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Camera'),
              onTap: () => Navigator.pop(context, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Gallery'),
              onTap: () => Navigator.pop(context, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
  }

  Future<File> _compressImage(File file) async {
    final dir = await getTemporaryDirectory();
    final targetPath = '${dir.path}/${DateTime.now().millisecondsSinceEpoch}.jpg';

    final result = await FlutterImageCompress.compressAndGetFile(
      file.absolute.path,
      targetPath,
      quality: 85,
      minWidth: 1024,
      minHeight: 1024,
    );

    return result != null ? File(result.path) : file;
  }

  void _removeImage(bool isFront) {
    setState(() {
      if (isFront) {
        _frontImage = null;
      } else {
        _backImage = null;
      }
    });
  }

  Future<void> _uploadDocument() async {
    if (!_formKey.currentState!.validate()) return;

    if (_frontImage == null) {
      _showMessage('Please upload front image of the document');
      return;
    }

    if (_requiresBackImage && _backImage == null) {
      _showMessage('Please upload back image of the document');
      return;
    }

    setState(() => _isUploading = true);

    try {
      final provider = context.read<KycProvider>();
      final success = await provider.uploadDocument(
        _selectedDocumentType,
        _frontImage!,
        backFile: _backImage,
      );

      if (success) {
        _showMessage('Document uploaded successfully');
        Navigator.pop(context, true);
      } else if (provider.errorMessage != null) {
        _showMessage(provider.errorMessage!);
      }
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Upload Document'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildDocumentTypeSection(),
              const SizedBox(height: 24.0),
              _buildDocumentNumberSection(),
              const SizedBox(height: 24.0),
              _buildImageUploadSection(),
              const SizedBox(height: 32.0),
              _buildUploadButton(),
              const SizedBox(height: 24.0),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDocumentTypeSection() {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Document Type',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 12.0),
          DropdownButtonFormField<String>(
            initialValue: _selectedDocumentType,
            decoration: InputDecoration(
              filled: true,
              fillColor: AppColors.inputFill,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
                borderSide: const BorderSide(color: AppColors.inputBorder),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
                borderSide: const BorderSide(color: AppColors.inputBorder),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
                borderSide: const BorderSide(color: AppColors.inputFocusBorder, width: 2.0),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            ),
            items: _documentTypes.map((doc) {
              return DropdownMenuItem<String>(
                value: doc['id'],
                child: Text(doc['label']!),
              );
            }).toList(),
            onChanged: (value) {
              if (value != null) {
                setState(() {
                  _selectedDocumentType = value;
                  _backImage = null;
                });
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentNumberSection() {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Document Number',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 12.0),
          TextFormField(
            controller: _documentNumberController,
            decoration: InputDecoration(
              hintText: 'Enter document number',
              filled: true,
              fillColor: AppColors.inputFill,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
                borderSide: const BorderSide(color: AppColors.inputBorder),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
                borderSide: const BorderSide(color: AppColors.inputBorder),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
                borderSide: const BorderSide(color: AppColors.inputFocusBorder, width: 2.0),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
                borderSide: const BorderSide(color: AppColors.inputErrorBorder),
              ),
              focusedErrorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
                borderSide: const BorderSide(color: AppColors.inputErrorBorder, width: 2.0),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            ),
            textCapitalization: TextCapitalization.characters,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Please enter document number';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildImageUploadSection() {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Document Images',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 16.0),
          UploadWidget(
            label: 'Front Side',
            imageFile: _frontImage,
            onPickImage: () => _pickImage(true),
            onRemove: () => _removeImage(true),
          ),
          if (_requiresBackImage) ...[
            const SizedBox(height: 16.0),
            UploadWidget(
              label: 'Back Side',
              imageFile: _backImage,
              onPickImage: () => _pickImage(false),
              onRemove: () => _removeImage(false),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildUploadButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _isUploading ? null : _uploadDocument,
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16.0),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.0),
          ),
        ),
        child: _isUploading
            ? const SizedBox(
                height: 20.0,
                width: 20.0,
                child: CircularProgressIndicator(
                  strokeWidth: 2.0,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : const Text('Upload Document'),
      ),
    );
  }
}
