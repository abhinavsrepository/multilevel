import 'package:flutter/material.dart';
import '../../../core/constants/color_constants.dart';
import 'widgets/faq_tile_widget.dart';
import 'widgets/category_chip_widget.dart';
import 'create_ticket_screen.dart';

/// FAQ Screen - Frequently Asked Questions
///
/// Displays searchable FAQ list with category filtering.
class FaqScreen extends StatefulWidget {
  const FaqScreen({super.key});

  @override
  State<FaqScreen> createState() => _FaqScreenState();
}

class _FaqScreenState extends State<FaqScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedCategory = 'all';

  final List<Map<String, String>> _categories = [
    {'id': 'all', 'label': 'All'},
    {'id': 'general', 'label': 'General'},
    {'id': 'investment', 'label': 'Investment'},
    {'id': 'kyc', 'label': 'KYC'},
    {'id': 'commission', 'label': 'Commission'},
    {'id': 'withdrawal', 'label': 'Withdrawal'},
  ];

  final List<Map<String, String>> _faqs = [
    {
      'category': 'general',
      'question': 'What is MLM Real Estate Platform?',
      'answer': 'MLM Real Estate Platform is a multi-level marketing platform that allows you to invest in real estate properties and earn commissions through referrals and team building.',
    },
    {
      'category': 'general',
      'question': 'How do I get started?',
      'answer': 'To get started, complete your registration, verify your KYC documents, and browse available properties to make your first investment. You can also start referring friends to earn commissions.',
    },
    {
      'category': 'investment',
      'question': 'What is the minimum investment amount?',
      'answer': 'The minimum investment amount varies by property. Most properties have a minimum investment of ₹50,000. Check individual property details for specific requirements.',
    },
    {
      'category': 'investment',
      'question': 'How do I invest in a property?',
      'answer': 'Browse the available properties, select a property you want to invest in, choose your investment amount, and complete the payment process. Your investment will be confirmed once the payment is processed.',
    },
    {
      'category': 'investment',
      'question': 'Can I cancel my investment?',
      'answer': 'Investment cancellation policies vary by property and timing. Generally, investments can be cancelled within 7 days of booking with a small processing fee. Contact support for specific cases.',
    },
    {
      'category': 'kyc',
      'question': 'What documents are required for KYC?',
      'answer': 'You need to submit one government-issued ID proof (Aadhaar, PAN, Passport, Driving License, or Voter ID). Upload clear photos of both front and back sides where applicable.',
    },
    {
      'category': 'kyc',
      'question': 'How long does KYC verification take?',
      'answer': 'KYC verification typically takes 24-48 hours. You will receive a notification once your documents are verified. If rejected, you can re-upload corrected documents.',
    },
    {
      'category': 'kyc',
      'question': 'Why was my KYC rejected?',
      'answer': 'Common reasons for KYC rejection include blurry images, expired documents, mismatched information, or invalid documents. Check the rejection remarks and re-upload valid documents.',
    },
    {
      'category': 'commission',
      'question': 'How do I earn commissions?',
      'answer': 'You earn commissions through direct referrals and team performance. When your referrals invest or when your team members make investments, you earn commission based on your rank and the compensation plan.',
    },
    {
      'category': 'commission',
      'question': 'When are commissions credited?',
      'answer': 'Commissions are typically credited within 7 days after the investment is confirmed. You can track your pending and credited commissions in the Commissions section.',
    },
    {
      'category': 'commission',
      'question': 'What are the different commission types?',
      'answer': 'Commission types include Direct Referral Commission, Level Commission, Performance Bonus, and Rank Achievement Bonus. The percentage varies based on your rank and the investment amount.',
    },
    {
      'category': 'withdrawal',
      'question': 'How do I withdraw my earnings?',
      'answer': 'Go to the Wallet section, select Withdraw, enter the amount you want to withdraw, choose your bank account, and submit the request. Withdrawals are processed within 2-3 business days.',
    },
    {
      'category': 'withdrawal',
      'question': 'What is the minimum withdrawal amount?',
      'answer': 'The minimum withdrawal amount is ₹500. There may be processing fees for withdrawals below ₹5,000. Check the withdrawal page for current fees and limits.',
    },
    {
      'category': 'withdrawal',
      'question': 'Why is my withdrawal pending?',
      'answer': 'Withdrawals may be pending due to verification processes, bank holidays, or high volume. Most withdrawals are processed within 2-3 business days. Contact support if it takes longer than 5 days.',
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Map<String, String>> _getFilteredFaqs() {
    return _faqs.where((faq) {
      final matchesCategory = _selectedCategory == 'all' || faq['category'] == _selectedCategory;
      final matchesSearch = _searchQuery.isEmpty ||
          faq['question']!.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          faq['answer']!.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();
  }

  void _navigateToCreateTicket() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const CreateTicketScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredFaqs = _getFilteredFaqs();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('FAQ'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          _buildCategoryFilter(),
          Expanded(
            child: filteredFaqs.isEmpty
                ? _buildEmptyState()
                : ListView.separated(
                    padding: const EdgeInsets.all(16.0),
                    itemCount: filteredFaqs.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12.0),
                    itemBuilder: (context, index) {
                      final faq = filteredFaqs[index];
                      return FaqTileWidget(
                        question: faq['question']!,
                        answer: faq['answer']!,
                        category: faq['category']!,
                      );
                    },
                  ),
          ),
          _buildContactSupportButton(),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(16.0),
      color: AppColors.surface,
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Search FAQs...',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    setState(() {
                      _searchController.clear();
                      _searchQuery = '';
                    });
                  },
                )
              : null,
          filled: true,
          fillColor: AppColors.inputFill,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12.0),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        ),
        onChanged: (value) {
          setState(() => _searchQuery = value);
        },
      ),
    );
  }

  Widget _buildCategoryFilter() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      color: AppColors.surface,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: _categories.map((category) {
            return Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: CategoryChipWidget(
                label: category['label']!,
                isSelected: _selectedCategory == category['id'],
                onTap: () {
                  setState(() => _selectedCategory = category['id']!);
                },
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.search_off,
              size: 80.0,
              color: AppColors.textSecondary.withOpacity(0.5),
            ),
            const SizedBox(height: 16.0),
            Text(
              'No FAQs Found',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 8.0),
            Text(
              'Try different keywords or contact support',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                  ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactSupportButton() {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 8.0,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: _navigateToCreateTicket,
          icon: const Icon(Icons.support_agent),
          label: const Text('Contact Support'),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12.0),
            ),
          ),
        ),
      ),
    );
  }
}
