import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/snackbar_utils.dart';

/// Share button widget
///
/// Provides social media sharing buttons (WhatsApp, Facebook, Twitter, etc.)
/// and general share functionality
class ShareButtonWidget extends StatelessWidget {
  final String referralCode;
  final String referralLink;

  const ShareButtonWidget({
    required this.referralCode, required this.referralLink, super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildSocialButton(
                context,
                icon: Icons.message,
                label: 'WhatsApp',
                color: const Color(0xFF25D366),
                onTap: () => _shareViaWhatsApp(context),
              ),
              _buildSocialButton(
                context,
                icon: Icons.facebook,
                label: 'Facebook',
                color: const Color(0xFF1877F2),
                onTap: () => _shareViaFacebook(context),
              ),
              _buildSocialButton(
                context,
                icon: Icons.email,
                label: 'Email',
                color: const Color(0xFFEA4335),
                onTap: () => _shareViaEmail(context),
              ),
              _buildSocialButton(
                context,
                icon: Icons.more_horiz,
                label: 'More',
                color: AppColors.textSecondary,
                onTap: () => _shareGeneric(context),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSocialButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: color,
              size: 28,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  String _getShareMessage() {
    return '''
Join me on this amazing MLM Real Estate platform!

Use my referral code: $referralCode

Or register using this link:
$referralLink

Start investing in real estate and earn great returns!
''';
  }

  void _shareViaWhatsApp(BuildContext context) async {
    final message = Uri.encodeComponent(_getShareMessage());
    final url = 'https://wa.me/?text=$message';

    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        SnackbarUtils.showError(context: context, message: 'Could not open Facebook');
      }
    } catch (e) {
      SnackbarUtils.showError(context:context,message:  'Error sharing via Facebook');
    }
  }

  void _shareViaFacebook(BuildContext context) async {
    final url = 'https://www.facebook.com/sharer/sharer.php?u=${Uri.encodeComponent(referralLink)}';

    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        SnackbarUtils.showError(context: context, message: 'Could not open Facebook');
      }
    } catch (e) {
      SnackbarUtils.showError(context:context,message:  'Error sharing via Facebook');
    }
  }

  void _shareViaEmail(BuildContext context) async {
    final subject = Uri.encodeComponent('Join me on MLM Real Estate');
    final body = Uri.encodeComponent(_getShareMessage());
    final url = 'mailto:?subject=$subject&body=$body';

    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        SnackbarUtils.showError(context: context, message: 'Could not open Facebook');
      }
    } catch (e) {
      SnackbarUtils.showError(context:context,message:  'Error sharing via Facebook');
    }
  }

  void _shareGeneric(BuildContext context) {
    Share.share(
      _getShareMessage(),
      subject: 'Join me on MLM Real Estate',
    );
  }
}
