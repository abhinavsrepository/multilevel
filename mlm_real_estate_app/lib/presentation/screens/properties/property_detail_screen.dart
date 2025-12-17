import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../data/providers/property_provider.dart';
import '../../../data/models/property_model.dart';
import '../../../core/constants/color_constants.dart';
import 'widgets/image_gallery_widget.dart';
import 'widgets/investment_modal_widget.dart';

/// Property detail screen with full information and investment option
class PropertyDetailScreen extends StatefulWidget {
  final String propertyId;

  const PropertyDetailScreen({
    required this.propertyId, super.key,
  });

  @override
  State<PropertyDetailScreen> createState() => _PropertyDetailScreenState();
}

class _PropertyDetailScreenState extends State<PropertyDetailScreen> {
  GoogleMapController? _mapController;

  @override
  void initState() {
    super.initState();
    _loadPropertyDetail();
  }

  Future<void> _loadPropertyDetail() async {
    await context.read<PropertyProvider>().getPropertyDetail(widget.propertyId);
  }

  void _toggleFavorite(PropertyModel property) {
    context.read<PropertyProvider>().toggleFavorite(property.id);
  }

  void _shareProperty(PropertyModel property) {
    Share.share(
      'Check out this amazing property: ${property.title}\n'
      'Location: ${property.location}\n'
      'Price: ${_formatCurrency(property.price)}\n'
      'ROI: ${property.roi}%',
    );
  }

  void _showInvestmentModal(PropertyModel property) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => InvestmentModalWidget(property: property),
    );
  }

  void _showImageGallery(PropertyModel property, int initialIndex) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ImageGalleryWidget(
          images: property.images,
          initialIndex: initialIndex,
        ),
      ),
    );
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      symbol: '₹',
      decimalDigits: 0,
      locale: 'en_IN',
    );
    return formatter.format(amount);
  }

  String _formatDate(DateTime? date) {
    if (date == null) return 'N/A';
    return DateFormat('MMM dd, yyyy').format(date);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<PropertyProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.selectedProperty == null) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.errorMessage != null &&
              provider.selectedProperty == null) {
            return _buildErrorState(provider.errorMessage!);
          }

          final property = provider.selectedProperty;
          if (property == null) {
            return _buildErrorState('Property not found');
          }

          return _buildContent(property, provider);
        },
      ),
    );
  }

  Widget _buildContent(PropertyModel property, PropertyProvider provider) {
    return CustomScrollView(
      slivers: [
        _buildAppBar(property, provider),
        SliverToBoxAdapter(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildBasicInfo(property),
              const Divider(height: 32),
              _buildPriceAndROI(property),
              const Divider(height: 32),
              _buildDescription(property),
              const Divider(height: 32),
              _buildAmenities(property),
              const Divider(height: 32),
              _buildDeveloperInfo(property),
              const Divider(height: 32),
              _buildLocationMap(property),
              const SizedBox(height: 100),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAppBar(PropertyModel property, PropertyProvider provider) {
    return SliverAppBar(
      expandedHeight: 300,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        background: GestureDetector(
          onTap: () => _showImageGallery(property, 0),
          child: Stack(
            fit: StackFit.expand,
            children: [
              Image.network(
                property.featuredImage,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: AppColors.surfaceVariant,
                    child: const Icon(
                      Icons.home_work,
                      size: 80,
                      color: AppColors.textSecondary,
                    ),
                  );
                },
              ),
              Positioned(
                bottom: 16,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.6),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.photo_library,
                        size: 16,
                        color: Colors.white,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${property.images.length} Photos',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        IconButton(
          icon: Icon(
            provider.isFavorite(property.id)
                ? Icons.favorite
                : Icons.favorite_border,
            color: provider.isFavorite(property.id)
                ? AppColors.error
                : Colors.white,
          ),
          onPressed: () => _toggleFavorite(property),
        ),
        IconButton(
          icon: const Icon(Icons.share),
          onPressed: () => _shareProperty(property),
        ),
      ],
    );
  }

  Widget _buildBasicInfo(PropertyModel property) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: _getStatusColor(property.status).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  property.status.toUpperCase(),
                  style: TextStyle(
                    color: _getStatusColor(property.status),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primaryExtraLight,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  property.propertyType,
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            property.title,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(
                Icons.location_on,
                size: 16,
                color: AppColors.textSecondary,
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  '${property.location}, ${property.city}',
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildInfoChip(Icons.square_foot, property.size),
              const SizedBox(width: 12),
              _buildInfoChip(
                Icons.inventory_2_outlined,
                '${property.availableUnits}/${property.totalUnits} Units',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppColors.textSecondary),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceAndROI(PropertyModel property) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Investment Details',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildDetailCard(
                  'Price per Unit',
                  _formatCurrency(property.price),
                  AppColors.primary,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildDetailCard(
                  'Expected ROI',
                  '${property.roi}%',
                  AppColors.success,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildDetailCard(
            'Minimum Investment',
            _formatCurrency(property.minInvestment),
            AppColors.secondary,
          ),
          const SizedBox(height: 12),
          _buildDetailCard(
            'Expected Completion',
            _formatDate(property.completionDate),
            AppColors.info,
          ),
        ],
      ),
    );
  }

  Widget _buildDetailCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: color.withOpacity(0.8),
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDescription(PropertyModel property) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Description',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            property.description,
            style: const TextStyle(
              fontSize: 14,
              height: 1.6,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAmenities(PropertyModel property) {
    if (property.amenities.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Amenities',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: property.amenities.map((amenity) {
              return _buildAmenityChip(amenity);
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildAmenityChip(String amenity) {
    final icon = _getAmenityIcon(amenity);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(
            amenity,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  IconData _getAmenityIcon(String amenity) {
    final lower = amenity.toLowerCase();
    if (lower.contains('parking')) return Icons.local_parking;
    if (lower.contains('gym')) return Icons.fitness_center;
    if (lower.contains('pool') || lower.contains('swimming')) {
      return Icons.pool;
    }
    if (lower.contains('security')) return Icons.security;
    if (lower.contains('garden')) return Icons.local_florist;
    if (lower.contains('club')) return Icons.sports_tennis;
    if (lower.contains('play')) return Icons.toys;
    if (lower.contains('wifi')) return Icons.wifi;
    if (lower.contains('power')) return Icons.bolt;
    if (lower.contains('water')) return Icons.water_drop;
    return Icons.check_circle;
  }

  Widget _buildDeveloperInfo(PropertyModel property) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Developer Information',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.business,
                  size: 40,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Developer',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        property.developer,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLocationMap(PropertyModel property) {
    if (property.latitude == null || property.longitude == null) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Location',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            height: 200,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            clipBehavior: Clip.antiAlias,
            child: GoogleMap(
              initialCameraPosition: CameraPosition(
                target: LatLng(property.latitude!, property.longitude!),
                zoom: 15,
              ),
              markers: {
                Marker(
                  markerId: MarkerId(property.id),
                  position: LatLng(property.latitude!, property.longitude!),
                  infoWindow: InfoWindow(title: property.title),
                ),
              },
              onMapCreated: (controller) {
                _mapController = controller;
              },
              zoomControlsEnabled: false,
              mapToolbarEnabled: false,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            property.address,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 80,
            color: AppColors.error.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          const Text(
            'Oops! Something went wrong',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.arrow_back),
            label: const Text('Go Back'),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'available':
        return AppColors.success;
      case 'sold_out':
        return AppColors.error;
      case 'upcoming':
        return AppColors.warning;
      case 'completed':
        return AppColors.info;
      default:
        return AppColors.textSecondary;
    }
  }

  // COMMENTED OUT: Duplicate build method - already exists at line 87
  // @override
  // Widget build(BuildContext context) {
  //   return Scaffold(
  //     body: Consumer<PropertyProvider>(
  //       builder: (context, provider, child) {
  //         if (provider.isLoading && provider.selectedProperty == null) {
  //           return const Center(child: CircularProgressIndicator());
  //         }

  //         if (provider.errorMessage != null &&
  //             provider.selectedProperty == null) {
  //           return _buildErrorState(provider.errorMessage!);
  //         }

  //         final property = provider.selectedProperty;
  //         if (property == null) {
  //           return _buildErrorState('Property not found');
  //         }

  //         return _buildContent(property, provider);
  //       },
  //     ),
  //     bottomNavigationBar: Consumer<PropertyProvider>(
  //       builder: (context, provider, child) {
  //         final property = provider.selectedProperty;
  //         if (property == null ||
  //             property.status.toLowerCase() == 'sold_out') {
  //           return const SizedBox.shrink();
  //         }

  //         return Container(
  //           padding: const EdgeInsets.all(16),
  //           decoration: BoxDecoration(
  //             color: Colors.white,
  //             boxShadow: [
  //               BoxShadow(
  //                 color: AppColors.shadowMedium,
  //                 blurRadius: 8,
  //                 offset: const Offset(0, -2),
  //               ),
  //             ],
  //           ),
  //           child: SafeArea(
  //             child: ElevatedButton(
  //               onPressed: () => _showInvestmentModal(property),
  //               style: ElevatedButton.styleFrom(
  //                 padding: const EdgeInsets.symmetric(vertical: 16),
  //               ),
  //               child: const Text('Invest Now'),
  //             ),
  //           ),
  //         );
  //       },
  //     ),
  //   );
  // }
}
