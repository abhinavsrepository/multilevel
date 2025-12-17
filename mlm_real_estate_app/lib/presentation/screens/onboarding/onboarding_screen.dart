import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../../core/services/local_storage_service.dart';
import '../../../core/constants/color_constants.dart';
import '../auth/login_screen.dart';

/// Onboarding screen with multiple slides introducing app features
///
/// This screen:
/// - Shows 3-4 onboarding slides with PageView
/// - Displays smooth page indicator
/// - Allows skipping onboarding
/// - Shows Next/Get Started buttons
/// - Saves onboarding completion status
/// - Includes beautiful illustrations and animations
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  static const String routeName = '/onboarding';

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingSlide> _slides = [
    OnboardingSlide(
      title: 'Invest in Premium Properties',
      description:
          'Discover exclusive real estate investment opportunities with guaranteed returns and secure transactions.',
      icon: Icons.home_work,
      color: AppColors.primary,
    ),
    OnboardingSlide(
      title: 'Build Your Network',
      description:
          'Grow your team and earn attractive commissions through our multi-level marketing structure.',
      icon: Icons.people_alt,
      color: AppColors.secondary,
    ),
    OnboardingSlide(
      title: 'Track Your Earnings',
      description:
          'Monitor your investments, commissions, and team performance in real-time with detailed analytics.',
      icon: Icons.trending_up,
      color: AppColors.tertiary,
    ),
    OnboardingSlide(
      title: 'Secure & Transparent',
      description:
          'Experience complete transparency with blockchain-verified transactions and secure digital wallets.',
      icon: Icons.verified_user,
      color: AppColors.info,
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  /// Handle page change
  void _onPageChanged(int page) {
    setState(() {
      _currentPage = page;
    });
  }

  /// Skip onboarding and navigate to login
  Future<void> _skipOnboarding() async {
    await _completeOnboarding();
  }

  /// Go to next page or complete onboarding
  Future<void> _nextPage() async {
    if (_currentPage < _slides.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      await _completeOnboarding();
    }
  }

  /// Mark onboarding as completed and navigate to login
  Future<void> _completeOnboarding() async {
    final localStorage = LocalStorageService.instance;
    await localStorage.savePreference(
      StorageKeys.onboardingCompleted,
      true,
    );

    if (!mounted) return;

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const LoginScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(
            opacity: animation,
            child: SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(1, 0),
                end: Offset.zero,
              ).animate(animation),
              child: child,
            ),
          );
        },
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Skip button
            _buildSkipButton(),

            // PageView with slides
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: _onPageChanged,
                itemCount: _slides.length,
                itemBuilder: (context, index) {
                  return _buildSlide(_slides[index], index);
                },
              ),
            ),

            // Page indicator
            _buildPageIndicator(),

            const SizedBox(height: 24),

            // Next/Get Started button
            _buildActionButton(),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  /// Build skip button
  Widget _buildSkipButton() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          if (_currentPage < _slides.length - 1)
            TextButton(
              onPressed: _skipOnboarding,
              child: const Text(
                'Skip',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
    );
  }

  /// Build individual slide
  Widget _buildSlide(OnboardingSlide slide, int index) {
    return AnimatedBuilder(
      animation: _pageController,
      builder: (context, child) {
        double value = 1.0;
        if (_pageController.position.haveDimensions) {
          value = (_pageController.page ?? 0) - index;
          value = (1 - (value.abs() * 0.3)).clamp(0.0, 1.0);
        }

        return Opacity(
          opacity: value,
          child: Transform.scale(
            scale: value,
            child: child,
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Illustration icon
            Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                color: slide.color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                slide.icon,
                size: 100,
                color: slide.color,
              ),
            ),

            const SizedBox(height: 48),

            // Title
            Text(
              slide.title,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
            ),

            const SizedBox(height: 16),

            // Description
            Text(
              slide.description,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppColors.textSecondary,
                    height: 1.5,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build page indicator
  Widget _buildPageIndicator() {
    return SmoothPageIndicator(
      controller: _pageController,
      count: _slides.length,
      effect: const WormEffect(
        dotHeight: 10,
        dotWidth: 10,
        activeDotColor: AppColors.primary,
        dotColor: AppColors.border,
        spacing: 16,
      ),
      onDotClicked: (index) {
        _pageController.animateToPage(
          index,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      },
    );
  }

  /// Build action button (Next or Get Started)
  Widget _buildActionButton() {
    final isLastPage = _currentPage == _slides.length - 1;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32.0),
      child: SizedBox(
        width: double.infinity,
        height: 56,
        child: ElevatedButton(
          onPressed: _nextPage,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 2,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                isLastPage ? 'Get Started' : 'Next',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (!isLastPage) ...[
                const SizedBox(width: 8),
                const Icon(
                  Icons.arrow_forward,
                  size: 20,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// Model class for onboarding slide data
class OnboardingSlide {
  final String title;
  final String description;
  final IconData icon;
  final Color color;

  OnboardingSlide({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
  });
}
