#!/usr/bin/env python3
"""
Script to remove DashboardLayout wrappers from React components.
The routing system already applies the layout, so component-level wrapping causes double headers.
"""

import re
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(r"C:\Users\surya\OneDrive\Desktop\multilevel\react-user-panel\src\pages")

# Files to fix
FILES_TO_FIX = [
    "rank/AllRanks.tsx",
    "rank/Achievements.tsx",
    "rank/MyRewards.tsx",
    "rank/RankAchievementTimeline.tsx",
    "wallet/WalletOverview.tsx",
    "wallet/Withdrawal.tsx",
    "wallet/WithdrawalHistory.tsx",
    "wallet/Transactions.tsx",
    "wallet/BankAccounts.tsx",
    "investments/MyInvestments.tsx",
    "investments/Portfolio.tsx",
    "investments/InvestmentDetail.tsx",
    "properties/PropertiesList.tsx",
    "properties/PropertyDetail.tsx",
    "profile/Profile.tsx",
    "profile/EditProfile.tsx",
    "profile/DigitalIDCard.tsx",
    "commissions/CommissionOverview.tsx",
    "kyc/KYCStatus.tsx",
    "kyc/DocumentUpload.tsx",
    "support/Tickets.tsx",
    "support/CreateTicket.tsx",
    "referral/ReferralTools.tsx",
    "affiliate/ClubsAndRanks.tsx",
    "affiliate/LevelIncome.tsx",
    "affiliate/ReferralBonus.tsx",
]

def fix_file(filepath):
    """Remove DashboardLayout wrapper from a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Step 1: Remove the import statement (handles both @ alias and relative paths)
        content = re.sub(
            r"^import DashboardLayout from ['\"]((@/|\.\./)layouts/DashboardLayout|@/layouts/DashboardLayout)['\"];?\s*\n",
            "",
            content,
            flags=re.MULTILINE
        )

        # Step 2: Remove <DashboardLayout title="..."> opening tags
        # Match both single and multi-line versions
        content = re.sub(
            r'<DashboardLayout\s+title="[^"]*"\s*>',
            '',
            content
        )

        # Step 3: Remove closing </DashboardLayout> tags
        content = re.sub(
            r'</DashboardLayout>',
            '',
            content
        )

        # Only write if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"  [ERROR] Error processing {filepath}: {e}")
        return False

def main():
    """Main execution."""
    print("=" * 60)
    print("Dashboard Layout Wrapper Removal Script")
    print("=" * 60)
    print()

    fixed_count = 0
    error_count = 0
    skipped_count = 0

    for relative_path in FILES_TO_FIX:
        filepath = BASE_DIR / relative_path

        if not filepath.exists():
            print(f"[X] File not found: {relative_path}")
            skipped_count += 1
            continue

        print(f"Processing: {relative_path}")

        if fix_file(filepath):
            print(f"  [OK] Fixed successfully")
            fixed_count += 1
        else:
            print(f"  [-] No changes needed or error occurred")
            error_count += 1

    print()
    print("=" * 60)
    print(f"Summary:")
    print(f"  Fixed: {fixed_count}")
    print(f"  Skipped/Errors: {skipped_count + error_count}")
    print(f"  Total processed: {len(FILES_TO_FIX)}")
    print("=" * 60)

if __name__ == "__main__":
    main()
