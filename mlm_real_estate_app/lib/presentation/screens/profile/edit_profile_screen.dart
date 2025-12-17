import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/custom_app_bar.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/utils/validation_utils.dart';
import '../../../data/providers/auth_provider.dart';
import '../../../data/providers/user_provider.dart';

/// Edit profile screen for updating user information
///
/// Allows editing name, email, mobile, and profile picture with validation
class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _mobileController = TextEditingController();
  final _addressLine1Controller = TextEditingController();
  final _addressLine2Controller = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _pincodeController = TextEditingController();

  File? _selectedImage;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  void _loadUserData() {
    final user = context.read<AuthProvider>().user;
    if (user != null) {
      _nameController.text = user.fullName;
      _emailController.text = user.email;
      _mobileController.text = user.mobile;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _mobileController.dispose();
    _addressLine1Controller.dispose();
    _addressLine2Controller.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (pickedFile != null) {
        setState(() {
          _selectedImage = File(pickedFile.path);
        });

        await _uploadProfilePicture();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to pick image: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _uploadProfilePicture() async {
    if (_selectedImage == null) return;

    setState(() {
      _isLoading = true;
    });

    final userProvider = context.read<UserProvider>();
    final success = await userProvider.uploadProfilePicture(_selectedImage!);

    setState(() {
      _isLoading = false;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            success
                ? 'Profile picture updated successfully'
                : userProvider.errorMessage ?? 'Failed to update profile picture',
          ),
          backgroundColor: success ? AppColors.success : AppColors.error,
        ),
      );
    }
  }

  void _showImageSourceDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16.0),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt, color: AppColors.primary),
              title: const Text('Take Photo'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library, color: AppColors.primary),
              title: const Text('Choose from Gallery'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 8.0),
          ],
        ),
      ),
    );
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final userProvider = context.read<UserProvider>();
    final success = await userProvider.updateProfile({
      'fullName': _nameController.text.trim(),
      'email': _emailController.text.trim(),
      'mobile': _mobileController.text.trim(),
      'addressLine1': _addressLine1Controller.text.trim(),
      'addressLine2': _addressLine2Controller.text.trim(),
      'city': _cityController.text.trim(),
      'state': _stateController.text.trim(),
      'pincode': _pincodeController.text.trim(),
    });

    setState(() {
      _isLoading = false;
    });

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated successfully'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              userProvider.errorMessage ?? 'Failed to update profile',
            ),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const CustomAppBar(
        title: 'Edit Profile',
      ),
      body: _isLoading && user == null
          ? const Center(child: LoadingWidget())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 16.0),
                    _buildAvatarSection(user),
                    const SizedBox(height: 32.0),
                    CustomTextField(
                      controller: _nameController,
                      labelText: 'Full Name',
                      prefixIcon: Icons.person,
                      validator: ValidationUtils.validateName,
                      enabled: !_isLoading,
                    ),
                    const SizedBox(height: 16.0),
                    CustomTextField(
                      controller: _emailController,
                      labelText: 'Email',
                      prefixIcon: Icons.email,
                      keyboardType: TextInputType.emailAddress,
                      validator: ValidationUtils.validateEmail,
                      enabled: !_isLoading,
                    ),
                    const SizedBox(height: 16.0),
                    CustomTextField(
                      controller: _mobileController,
                      labelText: 'Mobile',
                      prefixIcon: Icons.phone,
                      keyboardType: TextInputType.phone,
                      validator: ValidationUtils.validateMobile,
                      enabled: !_isLoading,
                    ),
                    const SizedBox(height: 24.0),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Address (Optional)',
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16.0),
                    CustomTextField(
                      controller: _addressLine1Controller,
                      labelText: 'Address Line 1',
                      prefixIcon: Icons.home,
                      enabled: !_isLoading,
                    ),
                    const SizedBox(height: 16.0),
                    CustomTextField(
                      controller: _addressLine2Controller,
                      labelText: 'Address Line 2',
                      prefixIcon: Icons.home_outlined,
                      enabled: !_isLoading,
                    ),
                    const SizedBox(height: 16.0),
                    Row(
                      children: [
                        Expanded(
                          child: CustomTextField(
                            controller: _cityController,
                            labelText: 'City',
                            prefixIcon: Icons.location_city,
                            enabled: !_isLoading,
                          ),
                        ),
                        const SizedBox(width: 12.0),
                        Expanded(
                          child: CustomTextField(
                            controller: _stateController,
                            labelText: 'State',
                            prefixIcon: Icons.map,
                            enabled: !_isLoading,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16.0),
                    CustomTextField(
                      controller: _pincodeController,
                      labelText: 'Pincode',
                      prefixIcon: Icons.pin_drop,
                      keyboardType: TextInputType.number,
                      enabled: !_isLoading,
                    ),
                    const SizedBox(height: 32.0),
                    CustomButton(
                      onPressed: _isLoading ? null : _saveProfile,
                      text: 'Save Changes',
                      isLoading: _isLoading,
                    ),
                    const SizedBox(height: 16.0),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildAvatarSection(user) {
    return Stack(
      children: [
        Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: AppColors.primary,
              width: 3.0,
            ),
          ),
          child: CircleAvatar(
            radius: 60.0,
            backgroundColor: AppColors.primaryExtraLight,
            backgroundImage: _selectedImage != null
                ? FileImage(_selectedImage!)
                : (user?.profilePicture != null
                    ? NetworkImage(user!.profilePicture!)
                    : null) as ImageProvider?,
            child: _selectedImage == null && user?.profilePicture == null
                ? Text(
                    user?.fullName.substring(0, 1).toUpperCase() ?? 'U',
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                  )
                : null,
          ),
        ),
        Positioned(
          bottom: 0,
          right: 0,
          child: Material(
            color: AppColors.primary,
            shape: const CircleBorder(),
            elevation: 4.0,
            child: InkWell(
              onTap: _isLoading ? null : _showImageSourceDialog,
              customBorder: const CircleBorder(),
              child: Container(
                padding: const EdgeInsets.all(12.0),
                child: const Icon(
                  Icons.camera_alt,
                  color: AppColors.white,
                  size: 20.0,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
