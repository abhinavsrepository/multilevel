import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../data/providers/wallet_provider.dart';
import '../../../data/providers/payout_provider.dart';
import '../../../data/providers/bank_provider.dart';
import '../../../core/utils/currency_utils.dart';
import '../../../core/utils/snackbar_utils.dart';

/// Withdrawal screen - Withdraw funds from wallet
///
/// Allows users to request withdrawal to their bank account
class WithdrawalScreen extends StatefulWidget {
  const WithdrawalScreen({super.key});

  @override
  State<WithdrawalScreen> createState() => _WithdrawalScreenState();
}

class _WithdrawalScreenState extends State<WithdrawalScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  String? _selectedBankAccountId;
  String _selectedMethod = 'bank_transfer';
  final double _processingFee = 0.0; // 0% processing fee

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    final walletProvider = context.read<WalletProvider>();
    final bankProvider = context.read<BankProvider>();

    await Future.wait([
      walletProvider.getWalletBalance(),
      bankProvider.getBankAccounts(),
    ]);

    // Auto-select primary account
    if (bankProvider.primaryAccount != null) {
      setState(() {
        _selectedBankAccountId = bankProvider.primaryAccount!.id;
      });
    }
  }

  double get _enteredAmount {
    final text = _amountController.text.trim();
    return double.tryParse(text) ?? 0.0;
  }

  double get _processingFeeAmount {
    return _enteredAmount * (_processingFee / 100);
  }

  double get _netAmount {
    return _enteredAmount - _processingFeeAmount;
  }

  Future<void> _handleWithdrawal() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedBankAccountId == null) {
      SnackbarUtils.showError(
        context: context,
        message: 'Please select a bank account',
      );
      return;
    }

    final payoutProvider = context.read<PayoutProvider>();

    final success = await payoutProvider.requestPayout(
      _enteredAmount,
      _selectedMethod,
      _selectedBankAccountId!,
    );

    if (!mounted) return;

    if (success) {
      SnackbarUtils.showSuccess(
        context: context,
        message: 'Withdrawal request submitted successfully',
      );
      Navigator.pop(context);
    } else {
      SnackbarUtils.showError(
        context: context,
        message: payoutProvider.errorMessage ?? 'Failed to request withdrawal',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Withdraw Funds'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildAvailableBalance(),
                  const SizedBox(height: 24.0),
                  _buildAmountInput(theme),
                  const SizedBox(height: 24.0),
                  _buildWithdrawalMethod(theme),
                  const SizedBox(height: 24.0),
                  _buildBankAccountSelection(theme),
                  const SizedBox(height: 24.0),
                  _buildSummary(theme),
                  const SizedBox(height: 32.0),
                  _buildSubmitButton(),
                  const SizedBox(height: 24.0),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvailableBalance() {
    return Consumer<WalletProvider>(
      builder: (context, walletProvider, child) {
        final availableBalance = walletProvider.availableBalance;

        return Container(
          margin: const EdgeInsets.all(16.0),
          padding: const EdgeInsets.all(20.0),
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            borderRadius: BorderRadius.circular(16.0),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.3),
                blurRadius: 12.0,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Available Balance',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.white.withOpacity(0.9),
                    ),
              ),
              const SizedBox(height: 8.0),
              Text(
                CurrencyUtils.formatINR(availableBalance),
                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAmountInput(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Withdrawal Amount',
            style: theme.textTheme.titleMedium?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12.0),
          CustomTextField(
            controller: _amountController,
            labelText: 'Enter Amount',
            hintText: '0.00',
            prefixIcon: Icons.currency_rupee,
            keyboardType: TextInputType.number,
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,2}')),
            ],
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter amount';
              }

              final amount = double.tryParse(value);
              if (amount == null || amount <= 0) {
                return 'Please enter a valid amount';
              }

              final availableBalance =
                  context.read<WalletProvider>().availableBalance;
              if (amount > availableBalance) {
                return 'Insufficient balance';
              }

              return null;
            },
            onChanged: (_) {
              setState(() {});
            },
          ),
        ],
      ),
    );
  }

  Widget _buildWithdrawalMethod(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Withdrawal Method',
            style: theme.textTheme.titleMedium?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
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
                  title: const Text('Bank Transfer'),
                  subtitle: const Text('Transfer to bank account'),
                  value: 'bank_transfer',
                  groupValue: _selectedMethod,
                  onChanged: (value) {
                    setState(() {
                      _selectedMethod = value!;
                    });
                  },
                ),
                const Divider(height: 1.0),
                RadioListTile<String>(
                  title: const Text('UPI'),
                  subtitle: const Text('Coming soon'),
                  value: 'upi',
                  groupValue: _selectedMethod,
                  onChanged: null,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBankAccountSelection(ThemeData theme) {
    return Consumer<BankProvider>(
      builder: (context, bankProvider, child) {
        final accounts = bankProvider.activeAccounts;

        if (accounts.isEmpty) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Bank Account',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12.0),
                Container(
                  padding: const EdgeInsets.all(16.0),
                  decoration: BoxDecoration(
                    color: AppColors.warningBackground,
                    borderRadius: BorderRadius.circular(8.0),
                    border: Border.all(color: AppColors.warning),
                  ),
                  child: Column(
                    children: [
                      const Text('No bank account found'),
                      const SizedBox(height: 8.0),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.pushNamed(context, '/wallet/add-bank-account');
                        },
                        child: const Text('Add Bank Account'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Select Bank Account',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/wallet/bank-accounts');
                    },
                    child: const Text('Manage'),
                  ),
                ],
              ),
              const SizedBox(height: 12.0),
              ...accounts.map((account) {
                final isSelected = _selectedBankAccountId == account.id;
                return Container(
                  margin: const EdgeInsets.only(bottom: 8.0),
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.border,
                      width: isSelected ? 2.0 : 1.0,
                    ),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: RadioListTile<String>(
                    title: Text(account.bankName),
                    subtitle: Text(
                      '${account.accountType.toUpperCase()} - ****${account.accountNumber.substring(account.accountNumber.length - 4)}',
                    ),
                    value: account.id,
                    groupValue: _selectedBankAccountId,
                    onChanged: (value) {
                      setState(() {
                        _selectedBankAccountId = value;
                      });
                    },
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSummary(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Container(
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(8.0),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Summary',
              style: theme.textTheme.titleMedium?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16.0),
            _buildSummaryRow('Withdrawal Amount', CurrencyUtils.formatINR(_enteredAmount)),
            const SizedBox(height: 8.0),
            _buildSummaryRow(
              'Processing Fee ($_processingFee%)',
              CurrencyUtils.formatINR(_processingFeeAmount),
            ),
            const Divider(height: 24.0),
            _buildSummaryRow(
              'Net Amount',
              CurrencyUtils.formatINR(_netAmount),
              isTotal: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.textSecondary,
                fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              ),
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: isTotal ? 18.0 : null,
              ),
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Consumer<PayoutProvider>(
        builder: (context, payoutProvider, child) {
          return CustomButton(
            text: 'Withdraw Funds',
            onPressed: _handleWithdrawal,
            isLoading: payoutProvider.isLoading,
            isFullWidth: true,
            leftIcon: Icons.arrow_upward,
          );
        },
      ),
    );
  }
}
