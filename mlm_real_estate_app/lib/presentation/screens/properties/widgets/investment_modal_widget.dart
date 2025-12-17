import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../../data/models/property_model.dart';
import '../../../../data/providers/investment_provider.dart';
import '../../../../core/constants/color_constants.dart';

/// Investment modal for property investment
class InvestmentModalWidget extends StatefulWidget {
  final PropertyModel property;

  const InvestmentModalWidget({
    required this.property, super.key,
  });

  @override
  State<InvestmentModalWidget> createState() => _InvestmentModalWidgetState();
}

class _InvestmentModalWidgetState extends State<InvestmentModalWidget> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  int _units = 1;
  String _selectedPlan = 'one-time';

  final List<Map<String, dynamic>> _installmentPlans = [
    {'id': 'one-time', 'name': 'One Time Payment', 'duration': '1 month'},
    {'id': 'quarterly', 'name': 'Quarterly', 'duration': '3 months'},
    {'id': 'half-yearly', 'name': 'Half Yearly', 'duration': '6 months'},
    {'id': 'yearly', 'name': 'Yearly', 'duration': '12 months'},
  ];

  @override
  void initState() {
    super.initState();
    _amountController.text = widget.property.price.toStringAsFixed(0);
    _updateAmount();
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  void _updateAmount() {
    final totalAmount = widget.property.price * _units;
    _amountController.text = totalAmount.toStringAsFixed(0);
  }

  void _incrementUnits() {
    if (_units < widget.property.availableUnits) {
      setState(() {
        _units++;
        _updateAmount();
      });
    }
  }

  void _decrementUnits() {
    if (_units > 1) {
      setState(() {
        _units--;
        _updateAmount();
      });
    }
  }

  double get _totalAmount {
    return double.tryParse(_amountController.text) ?? 0;
  }

  double get _expectedReturns {
    return _totalAmount * (widget.property.roi / 100);
  }

  Future<void> _proceedToPayment() async {
    if (!_formKey.currentState!.validate()) return;

    if (_totalAmount < widget.property.minInvestment) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Minimum investment is ${_formatCurrency(widget.property.minInvestment)}',
          ),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final provider = context.read<InvestmentProvider>();
    final success = await provider.createInvestment(
      widget.property.id,
      _totalAmount,
      _units,
    );

    if (success && mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Investment created successfully!'),
          backgroundColor: AppColors.success,
        ),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            provider.errorMessage ?? 'Failed to create investment',
          ),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      symbol: '₹',
      decimalDigits: 0,
      locale: 'en_IN',
    );
    return formatter.format(amount);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildHeader(),
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildPropertyInfo(),
                    const SizedBox(height: 24),
                    _buildUnitsSelector(),
                    const SizedBox(height: 24),
                    _buildAmountInput(),
                    const SizedBox(height: 24),
                    _buildInstallmentPlanSelector(),
                    const SizedBox(height: 24),
                    _buildSummary(),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),
          _buildBottomButton(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppColors.divider),
        ),
      ),
      child: Row(
        children: [
          const Text(
            'Invest in Property',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const Spacer(),
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.pop(context),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
      ),
    );
  }

  Widget _buildPropertyInfo() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.property.title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(
                Icons.location_on,
                size: 14,
                color: AppColors.textSecondary,
              ),
              const SizedBox(width: 4),
              Text(
                widget.property.location,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildInfoItem(
                'Price/Unit',
                _formatCurrency(widget.property.price),
              ),
              const SizedBox(width: 16),
              _buildInfoItem(
                'Expected ROI',
                '${widget.property.roi}%',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.primary,
          ),
        ),
      ],
    );
  }

  Widget _buildUnitsSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Number of Units',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.remove),
                onPressed: _units > 1 ? _decrementUnits : null,
                color: AppColors.primary,
              ),
              Expanded(
                child: Text(
                  '$_units',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.add),
                onPressed: _units < widget.property.availableUnits
                    ? _incrementUnits
                    : null,
                color: AppColors.primary,
              ),
            ],
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Available units: ${widget.property.availableUnits}',
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildAmountInput() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Investment Amount',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: _amountController,
          keyboardType: TextInputType.number,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
          ],
          decoration: const InputDecoration(
            prefixText: '₹ ',
            hintText: 'Enter amount',
            filled: true,
            fillColor: AppColors.surfaceVariant,
          ),
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter amount';
            }
            final amount = double.tryParse(value);
            if (amount == null || amount <= 0) {
              return 'Please enter valid amount';
            }
            if (amount < widget.property.minInvestment) {
              return 'Minimum ${_formatCurrency(widget.property.minInvestment)}';
            }
            return null;
          },
        ),
        const SizedBox(height: 6),
        Text(
          'Minimum: ${_formatCurrency(widget.property.minInvestment)}',
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildInstallmentPlanSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Payment Plan',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        ...(_installmentPlans.map((plan) {
          final isSelected = _selectedPlan == plan['id'];
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedPlan = plan['id'] as String;
              });
            },
            child: Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary.withOpacity(0.1)
                    : AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.border,
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    isSelected
                        ? Icons.radio_button_checked
                        : Icons.radio_button_unchecked,
                    color: isSelected ? AppColors.primary : AppColors.textSecondary,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          plan['name'] as String,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          plan['duration'] as String,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList()),
      ],
    );
  }

  Widget _buildSummary() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withOpacity(0.1),
            AppColors.success.withOpacity(0.1),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Investment Summary',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          _buildSummaryRow('Units', '$_units'),
          const SizedBox(height: 8),
          _buildSummaryRow('Total Amount', _formatCurrency(_totalAmount)),
          const SizedBox(height: 8),
          _buildSummaryRow(
            'Expected Returns',
            _formatCurrency(_expectedReturns),
            isHighlighted: true,
          ),
          const SizedBox(height: 8),
          _buildSummaryRow(
            'Total Value',
            _formatCurrency(_totalAmount + _expectedReturns),
            isHighlighted: true,
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value,
      {bool isHighlighted = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isHighlighted ? 14 : 13,
            fontWeight: isHighlighted ? FontWeight.w600 : FontWeight.normal,
            color: AppColors.textSecondary,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isHighlighted ? 16 : 14,
            fontWeight: FontWeight.w600,
            color: isHighlighted ? AppColors.success : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildBottomButton() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: AppColors.divider),
        ),
      ),
      child: SafeArea(
        child: Consumer<InvestmentProvider>(
          builder: (context, provider, child) {
            return ElevatedButton(
              onPressed: provider.isLoading ? null : _proceedToPayment,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: provider.isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Proceed to Payment'),
            );
          },
        ),
      ),
    );
  }
}
