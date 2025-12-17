import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';

/// Reusable property type chips for filtering
class PropertyTypeChips extends StatelessWidget {
  final List<String> propertyTypes;
  final Set<String> selectedTypes;
  final Function(Set<String>) onSelectionChanged;

  const PropertyTypeChips({
    required this.propertyTypes, required this.selectedTypes, required this.onSelectionChanged, super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: propertyTypes.map((type) {
        final isSelected = selectedTypes.contains(type);
        return FilterChip(
          label: Text(type),
          selected: isSelected,
          onSelected: (selected) {
            final newSelection = Set<String>.from(selectedTypes);
            if (selected) {
              newSelection.add(type);
            } else {
              newSelection.remove(type);
            }
            onSelectionChanged(newSelection);
          },
          backgroundColor: AppColors.surfaceVariant,
          selectedColor: AppColors.primary,
          checkmarkColor: Colors.white,
          labelStyle: TextStyle(
            color: isSelected ? Colors.white : AppColors.textPrimary,
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(
              color: isSelected ? AppColors.primary : AppColors.border,
            ),
          ),
        );
      }).toList(),
    );
  }
}

/// Custom range slider with labels
class LabeledRangeSlider extends StatelessWidget {
  final String label;
  final RangeValues values;
  final double min;
  final double max;
  final int? divisions;
  final Function(RangeValues) onChanged;
  final String Function(double)? valueFormatter;
  final Color? activeColor;

  const LabeledRangeSlider({
    required this.label, required this.values, required this.min, required this.max, required this.onChanged, super.key,
    this.divisions,
    this.valueFormatter,
    this.activeColor,
  });

  String _formatValue(double value) {
    if (valueFormatter != null) {
      return valueFormatter!(value);
    }
    return value.toStringAsFixed(0);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
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
              _formatValue(values.start),
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            Text(
              _formatValue(values.end),
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        RangeSlider(
          values: values,
          min: min,
          max: max,
          divisions: divisions,
          activeColor: activeColor ?? AppColors.primary,
          onChanged: onChanged,
        ),
      ],
    );
  }
}

/// Custom single slider with label
class LabeledSlider extends StatelessWidget {
  final String label;
  final double value;
  final double min;
  final double max;
  final int? divisions;
  final Function(double) onChanged;
  final String Function(double)? valueFormatter;
  final Color? activeColor;

  const LabeledSlider({
    required this.label, required this.value, required this.min, required this.max, required this.onChanged, super.key,
    this.divisions,
    this.valueFormatter,
    this.activeColor,
  });

  String _formatValue(double value) {
    if (valueFormatter != null) {
      return valueFormatter!(value);
    }
    return value.toStringAsFixed(0);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          _formatValue(value),
          style: const TextStyle(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        Slider(
          value: value,
          min: min,
          max: max,
          divisions: divisions,
          activeColor: activeColor ?? AppColors.primary,
          onChanged: onChanged,
        ),
      ],
    );
  }
}

/// Custom dropdown for location selection
class LocationDropdown extends StatelessWidget {
  final String? selectedLocation;
  final List<String> locations;
  final Function(String?) onChanged;

  const LocationDropdown({
    required this.selectedLocation, required this.locations, required this.onChanged, super.key,
  });

  @override
  Widget build(BuildContext context) {
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
              value: selectedLocation,
              hint: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text('Select Location'),
              ),
              isExpanded: true,
              icon: const Padding(
                padding: EdgeInsets.only(right: 16),
                child: Icon(Icons.arrow_drop_down),
              ),
              items: locations.map((location) {
                return DropdownMenuItem(
                  value: location,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(location),
                  ),
                );
              }).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }
}

/// Filter section header
class FilterSectionHeader extends StatelessWidget {
  final String title;
  final VoidCallback? onClear;

  const FilterSectionHeader({
    required this.title, super.key,
    this.onClear,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        if (onClear != null)
          TextButton(
            onPressed: onClear,
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              minimumSize: const Size(50, 30),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: const Text(
              'Clear',
              style: TextStyle(
                fontSize: 13,
                color: AppColors.primary,
              ),
            ),
          ),
      ],
    );
  }
}
