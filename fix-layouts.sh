#!/bin/bash

# Script to remove DashboardLayout wrappers from page components
# Since the routing system already applies the layout

# List of files to fix
files=(
  "react-user-panel/src/pages/rank/RankProgress.tsx"
  "react-user-panel/src/pages/rank/AllRanks.tsx"
  "react-user-panel/src/pages/rank/Achievements.tsx"
  "react-user-panel/src/pages/rank/MyRewards.tsx"
  "react-user-panel/src/pages/rank/RankAchievementTimeline.tsx"
  "react-user-panel/src/pages/wallet/WalletOverview.tsx"
  "react-user-panel/src/pages/wallet/Withdrawal.tsx"
  "react-user-panel/src/pages/wallet/WithdrawalHistory.tsx"
  "react-user-panel/src/pages/wallet/Transactions.tsx"
  "react-user-panel/src/pages/wallet/BankAccounts.tsx"
  "react-user-panel/src/pages/investments/MyInvestments.tsx"
  "react-user-panel/src/pages/investments/Portfolio.tsx"
  "react-user-panel/src/pages/investments/InvestmentDetail.tsx"
  "react-user-panel/src/pages/properties/PropertiesList.tsx"
  "react-user-panel/src/pages/properties/PropertyDetail.tsx"
  "react-user-panel/src/pages/profile/Profile.tsx"
  "react-user-panel/src/pages/profile/EditProfile.tsx"
  "react-user-panel/src/pages/profile/DigitalIDCard.tsx"
  "react-user-panel/src/pages/commissions/CommissionOverview.tsx"
  "react-user-panel/src/pages/kyc/KYCStatus.tsx"
  "react-user-panel/src/pages/kyc/DocumentUpload.tsx"
  "react-user-panel/src/pages/support/Tickets.tsx"
  "react-user-panel/src/pages/support/CreateTicket.tsx"
  "react-user-panel/src/pages/referral/ReferralTools.tsx"
  "react-user-panel/src/pages/affiliate/ClubsAndRanks.tsx"
  "react-user-panel/src/pages/affiliate/LevelIncome.tsx"
  "react-user-panel/src/pages/affiliate/ReferralBonus.tsx"
)

echo "Files to process: ${#files[@]}"
echo ""

for file in "${files[@]}"; do
  filepath="C:/Users/surya/OneDrive/Desktop/multilevel/$file"

  if [ -f "$filepath" ]; then
    echo "Processing: $file"

    # Remove the DashboardLayout import line
    sed -i "/^import DashboardLayout from '@\/layouts\/DashboardLayout';$/d" "$filepath"

    echo "  ✓ Removed DashboardLayout import"
  else
    echo "  ✗ File not found: $filepath"
  fi
done

echo ""
echo "Phase 1 complete: Removed DashboardLayout imports"
echo "Note: You still need to remove the <DashboardLayout> wrapper tags manually or with additional sed commands"
