import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../data/providers/bank_provider.dart';
import '../../../core/utils/snackbar_utils.dart';

/// Add bank account screen - Form to add a new bank account
///
/// Allows users to add their bank account details for withdrawals
class AddBankAccountScreen extends StatefulWidget {
  const AddBankAccountScreen({super.key});

  @override
  State<AddBankAccountScreen> createState() => _AddBankAccountScreenState();
}

class _AddBankAccountScreenState extends State<AddBankAccountScreen> {
  final _formKey = GlobalKey<FormState>();
  final _accountHolderNameController = TextEditingController();
  final _accountNumberController = TextEditingController();
  final _confirmAccountNumberController = TextEditingController();
  final _ifscCodeController = TextEditingController();
  final _bankNameController = TextEditingController();
  final _branchController = TextEditingController();
  String _selectedAccountType = 'savings';

  @override
  void dispose() {
    _accountHolderNameController.dispose();
    _accountNumberController.dispose();
    _confirmAccountNumberController.dispose();
    _ifscCodeController.dispose();
    _bankNameController.dispose();
    _branchController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final bankProvider = context.read<BankProvider>();

    final success = await bankProvider.addBankAccount(
      accountHolderName: _accountHolderNameController.text.trim(),
      accountNumber: _accountNumberController.text.trim(),
      ifscCode: _ifscCodeController.text.trim().toUpperCase(),
      bankName: _bankNameController.text.trim(),
      branch: _branchController.text.trim(),
      accountType: _selectedAccountType,
    );

    if (!mounted) return;

    if (success) {
      SnackbarUtils.showSuccess(
        context:context, message:
        'Bank account added successfully',
      );
      Navigator.pop(context);
    } else {
      SnackbarUtils.showError(
        context:context, message:
        bankProvider.errorMessage ?? 'Failed to add bank account',
      );
    }
  }

  Future<void> _fetchBankDetails() async {
    final ifscCode = _ifscCodeController.text.trim().toUpperCase();
    if (ifscCode.isEmpty || ifscCode.length != 11) {
      SnackbarUtils.showError(context:context, message: 'Please enter a valid IFSC code');
      return;
    }

    // TODO: Implement IFSC API integration
    SnackbarUtils.showInfo(
      context :context, message:
      'IFSC validation feature coming soon',
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Add Bank Account'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            _buildInfoCard(theme),
            const SizedBox(height: 24.0),
            CustomTextField(
              controller: _accountHolderNameController,
              labelText: 'Account Holder Name',
              hintText: 'Enter account holder name',
              prefixIcon: Icons.person,
              textCapitalization: TextCapitalization.words,
              validator: TextFieldValidators.required('Account holder name'),
            ),
            const SizedBox(height: 16.0),
            CustomTextField(
              controller: _accountNumberController,
              labelText: 'Account Number',
              hintText: 'Enter account number',
              prefixIcon: Icons.account_balance,
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(18),
              ],
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Account number is required';
                }
                if (value.length < 9 || value.length > 18) {
                  return 'Please enter a valid account number';
                }
                return null;
              },
            ),
            const SizedBox(height: 16.0),
            CustomTextField(
              controller: _confirmAccountNumberController,
              labelText: 'Confirm Account Number',
              hintText: 'Re-enter account number',
              prefixIcon: Icons.account_balance,
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(18),
              ],
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please confirm account number';
                }
                if (value != _accountNumberController.text) {
                  return 'Account numbers do not match';
                }
                return null;
              },
            ),
            const SizedBox(height: 16.0),
            CustomTextField(
              controller: _ifscCodeController,
              labelText: 'IFSC Code',
              hintText: 'Enter IFSC code',
              prefixIcon: Icons.code,
              textCapitalization: TextCapitalization.characters,
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[A-Z0-9]')),
                LengthLimitingTextInputFormatter(11),
              ],
              suffix: TextButton(
                onPressed: _fetchBankDetails,
                child: const Text('Verify'),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'IFSC code is required';
                }
                if (value.length != 11) {
                  return 'IFSC code must be 11 characters';
                }
                final ifscRegex = RegExp(r'^[A-Z]{4}0[A-Z0-9]{6}$');
                if (!ifscRegex.hasMatch(value.toUpperCase())) {
                  return 'Please enter a valid IFSC code';
                }
                return null;
              },
            ),
            const SizedBox(height: 16.0),
            CustomTextField(
              controller: _bankNameController,
              labelText: 'Bank Name',
              hintText: 'Enter bank name',
              prefixIcon: Icons.account_balance_wallet,
              textCapitalization: TextCapitalization.words,
              validator: TextFieldValidators.required('Bank name'),
            ),
            const SizedBox(height: 16.0),
            CustomTextField(
              controller: _branchController,
              labelText: 'Branch Name',
              hintText: 'Enter branch name',
              prefixIcon: Icons.location_on,
              textCapitalization: TextCapitalization.words,
              validator: TextFieldValidators.required('Branch name'),
            ),
            const SizedBox(height: 16.0),
            _buildAccountTypeSelector(theme),
            const SizedBox(height: 32.0),
            Consumer<BankProvider>(
              builder: (context, bankProvider, child) {
                return CustomButton(
                  text: 'Add Bank Account',
                  onPressed: _handleSubmit,
                  isLoading: bankProvider.isLoading,
                  isFullWidth: true,
                  leftIcon: Icons.add,
                );
              },
            ),
            const SizedBox(height: 24.0),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: AppColors.infoBackground,
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(color: AppColors.info.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.info_outline,
            color: AppColors.info,
            size: 24.0,
          ),
          const SizedBox(width: 12.0),
          Expanded(
            child: Text(
              'Please ensure all bank details are correct. Incorrect details may cause withdrawal delays.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: AppColors.info,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccountTypeSelector(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Account Type',
          style: theme.textTheme.titleSmall?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12.0),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: Column(
            children: [
              RadioListTile<String>(
                title: const Text('Savings Account'),
                value: 'savings',
                groupValue: _selectedAccountType,
                onChanged: (value) {
                  setState(() {
                    _selectedAccountType = value!;
                  });
                },
              ),
              const Divider(height: 1.0),
              RadioListTile<String>(
                title: const Text('Current Account'),
                value: 'current',
                groupValue: _selectedAccountType,
                onChanged: (value) {
                  setState(() {
                    _selectedAccountType = value!;
                  });
                },
              ),
            ],
          ),
        ),
      ],
    );
  }
}
