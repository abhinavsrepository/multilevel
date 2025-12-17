import 'package:flutter/material.dart';
import '../../../core/constants/color_constants.dart';
import 'widgets/property_filter_widget.dart';

/// Property filter bottom sheet with various filtering options
class PropertyFilterScreen extends StatefulWidget {
  final Function(Map<String, dynamic>) onApply;

  const PropertyFilterScreen({
    required this.onApply, super.key,
  });

  @override
  State<PropertyFilterScreen> createState() => _PropertyFilterScreenState();
}

class _PropertyFilterScreenState extends State<PropertyFilterScreen> {
  Set<String> _selectedPropertyTypes = {};
  RangeValues _priceRange = const RangeValues(0, 10000000);
  String? _selectedLocation;
  RangeValues _roiRange = const RangeValues(0, 50);
  double _minInvestment = 0;

  final List<String> _propertyTypes = [
    'Apartment',
    'Villa',
    'Plot',
    'Commercial',
    'Farmhouse',
    'Studio',
  ];

  final List<String> _locations = [
    'All Locations',
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Pune',
    'Chennai',
    'Kolkata',
  ];

  int get _filterCount {
    int count = 0;
    if (_selectedPropertyTypes.isNotEmpty) count++;
    if (_priceRange.start > 0 || _priceRange.end < 10000000) count++;
    if (_selectedLocation != null && _selectedLocation != 'All Locations') {
      count++;
    }
    if (_roiRange.start > 0 || _roiRange.end < 50) count++;
    if (_minInvestment > 0) count++;
    return count;
  }

  void _applyFilters() {
    final filters = <String, dynamic>{
      'propertyTypes': _selectedPropertyTypes.toList(),
      'priceRange': {
        'min': _priceRange.start,
        'max': _priceRange.end,
      },
      'location': _selectedLocation,
      'roiRange': {
        'min': _roiRange.start,
        'max': _roiRange.end,
      },
      'minInvestment': _minInvestment,
    };

    widget.onApply(filters);
  }

  void _resetFilters() {
    setState(() {
      _selectedPropertyTypes.clear();
      _priceRange = const RangeValues(0, 10000000);
      _selectedLocation = null;
      _roiRange = const RangeValues(0, 50);
      _minInvestment = 0;
    });
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildPropertyTypeSection(),
                  const SizedBox(height: 24),
                  _buildPriceRangeSection(),
                  const SizedBox(height: 24),
                  _buildLocationSection(),
                  const SizedBox(height: 24),
                  _buildROIRangeSection(),
                  const SizedBox(height: 24),
                  _buildMinInvestmentSection(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
          _buildBottomButtons(),
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
            'Filter Properties',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const Spacer(),
          if (_filterCount > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '$_filterCount',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          const SizedBox(width: 12),
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

  Widget _buildPropertyTypeSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Property Type',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        PropertyTypeChips(
          propertyTypes: _propertyTypes,
          selectedTypes: _selectedPropertyTypes,
          onSelectionChanged: (selected) {
            setState(() {
              _selectedPropertyTypes = selected;
            });
          },
        ),
      ],
    );
  }

  Widget _buildPriceRangeSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Price Range',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '₹${(_priceRange.start / 100000).toStringAsFixed(1)}L',
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            Text(
              '₹${(_priceRange.end / 100000).toStringAsFixed(1)}L',
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        RangeSlider(
          values: _priceRange,
          min: 0,
          max: 10000000,
          divisions: 100,
          activeColor: AppColors.primary,
          onChanged: (values) {
            setState(() {
              _priceRange = values;
            });
          },
        ),
      ],
    );
  }

  Widget _buildLocationSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Location',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surfaceVariant,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _selectedLocation,
              hint: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text('Select Location'),
              ),
              isExpanded: true,
              icon: const Padding(
                padding: EdgeInsets.only(right: 16),
                child: Icon(Icons.arrow_drop_down),
              ),
              items: _locations.map((location) {
                return DropdownMenuItem(
                  value: location,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(location),
                  ),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedLocation = value;
                });
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildROIRangeSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Expected ROI (%)',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${_roiRange.start.toStringAsFixed(0)}%',
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            Text(
              '${_roiRange.end.toStringAsFixed(0)}%',
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        RangeSlider(
          values: _roiRange,
          min: 0,
          max: 50,
          divisions: 50,
          activeColor: AppColors.success,
          onChanged: (values) {
            setState(() {
              _roiRange = values;
            });
          },
        ),
      ],
    );
  }

  Widget _buildMinInvestmentSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Minimum Investment',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '₹${(_minInvestment / 100000).toStringAsFixed(1)}L',
          style: const TextStyle(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        Slider(
          value: _minInvestment,
          min: 0,
          max: 5000000,
          divisions: 50,
          activeColor: AppColors.secondary,
          onChanged: (value) {
            setState(() {
              _minInvestment = value;
            });
          },
        ),
      ],
    );
  }

  Widget _buildBottomButtons() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: AppColors.divider),
        ),
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: _resetFilters,
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Reset'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: _applyFilters,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: Text(
                  _filterCount > 0
                      ? 'Apply ($_filterCount)'
                      : 'Apply Filters',
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
