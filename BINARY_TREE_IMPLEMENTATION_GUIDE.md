# Binary Tree with Level Income - Implementation Guide

## Overview

This guide explains the binary tree structure with level income visualization implementation for your multilevel marketing platform.

## ✅ What's Already Implemented

Your codebase already has a **comprehensive binary tree system**:

### 1. Binary Tree Visualization (`BinaryTree.tsx`)
- Interactive D3-based tree visualization using `react-d3-tree`
- Features:
  - LEFT/RIGHT placement support
  - Business Volume (BV) tracking per node
  - Zoom, pan, and fullscreen controls
  - Click-to-navigate functionality
  - Collapsible nodes
  - Status indicators (Active/Inactive/Pending)

### 2. Backend Support
- Binary tree API endpoints in `/tree/binary`
- Recursive tree building up to 5 levels
- LEFT/RIGHT leg separation
- Business volume calculations
- Team statistics

### 3. Data Models
- Complete TreeNode type with:
  - User info (id, userId, name, status)
  - Placement (LEFT/RIGHT/ROOT)
  - Business volume (left, right, total)
  - Team size and investment
  - Children array for hierarchical structure

## 🆕 New Implementation: BinaryTreeWithStats

### File Location
```
react-user-panel/src/pages/team/BinaryTreeWithStats.tsx
```

### Features

#### 1. **Integrated Tree & Level Income Dashboard**
- Combined view of binary tree structure and level income breakdown
- Real-time synchronization between tree data and income stats

#### 2. **Stats Cards**
- **Total Team**: Total members in downline
- **Left Leg**: Members in left branch
- **Right Leg**: Members in right branch
- **Direct Referrals**: Direct sponsored members

#### 3. **Binary Tree Visualization**
- Depth control (2, 3, 4, or 5 levels)
- Interactive node clicking
- Navigate to any user as root
- Fullscreen mode
- Zoom controls

#### 4. **Level Unlock Progress**
- Visual progress bar
- Unlock status based on direct referrals:
  - **1-2 Direct Referrals**: Levels 1-2 unlocked
  - **3+ Direct Referrals**: Levels 1-5 unlocked
  - **5+ Direct Referrals**: All 10 levels unlocked
- Next target display

#### 5. **Business Volume Stats**
- Left Leg BV
- Right Leg BV
- Matching BV (binary pairing)
- Carry Forward amount

#### 6. **Level Income Breakdown**
- **Bar Chart**: Visual representation of income per level
- **Commission Percentages**:
  - Level 1: 30%
  - Level 2: 20%
  - Level 3: 15%
  - Levels 4-10: 5% each

#### 7. **Level Details Grid**
- 10 individual level cards
- Status (Unlocked/Locked) indicators
- Commission percentage
- Total income per level
- Member count per level

#### 8. **Member Detail Dialog**
- Click any node to view details:
  - Name and User ID
  - Status and placement
  - Team size
  - Business volume breakdown
  - Total investment
- Actions:
  - View full member details
  - View member's tree as root

## 🎯 Binary Tree Algorithm

### How It Works

#### 1. **Tree Structure**
```typescript
interface TreeNode {
  id: number;
  userId: string;
  name: string;
  placement: 'LEFT' | 'RIGHT' | 'ROOT';
  children?: TreeNode[]; // Max 2 children (binary)
  bv: {
    left: number;
    right: number;
    total: number;
  };
}
```

#### 2. **Placement Logic**
- Each user can have maximum **2 direct placements**: LEFT and RIGHT
- When a sponsor refers someone, they choose LEFT or RIGHT placement
- If chosen side is occupied, the new member goes to the next available position (spillover)

#### 3. **Business Volume Calculation**
```
Left BV = Sum of all BV from left leg
Right BV = Sum of all BV from right leg
Total BV = Left BV + Right BV + Personal BV
Matching BV = Min(Left BV, Right BV)
```

#### 4. **Carry Forward**
```
Carry Forward = |Left BV - Right BV|
```
The excess BV from the stronger leg carries forward to next period.

## 📊 Level Income Algorithm

### Commission Structure

```typescript
const LEVEL_COMMISSIONS = {
  1: 30,  // 30%
  2: 20,  // 20%
  3: 15,  // 15%
  4: 5,   // 5%
  5: 5,   // 5%
  6: 5,   // 5%
  7: 5,   // 5%
  8: 5,   // 5%
  9: 5,   // 5%
  10: 5   // 5%
};
```

### Unlock Logic

```typescript
function getLevelUnlockStatus(directReferrals: number) {
  if (directReferrals >= 5) {
    return { unlockedLevels: 10, progress: 100 };
  }
  if (directReferrals >= 3) {
    return { unlockedLevels: 5, progress: (directReferrals / 5) * 100 };
  }
  return { unlockedLevels: 2, progress: (directReferrals / 3) * 100 };
}
```

### Income Calculation

For each sale in your downline:
```
Level Income = Sale Amount × Level Commission %
```

Only calculate for **unlocked levels**.

## 🚀 Usage

### 1. **Add Route** (if not already added)

In your router configuration:

```typescript
import { BinaryTreeWithStats } from '@/pages/team';

// Add route
{
  path: '/team/binary-tree-stats',
  element: <BinaryTreeWithStats />,
}
```

### 2. **Navigate to Page**

```typescript
navigate('/team/binary-tree-stats');
```

Or add a menu item:

```typescript
<MenuItem onClick={() => navigate('/team/binary-tree-stats')}>
  Binary Tree & Level Income
</MenuItem>
```

### 3. **API Requirements**

The component uses these API endpoints:

```typescript
// Team APIs
getBinaryTree(userId?, depth?)       // GET /tree/binary
getTeamStats()                       // GET /tree/stats
getLevelBreakdown()                  // GET /team/level-breakdown
getDirectReferralsStats()            // GET /team/direct-referrals/stats
```

Make sure these endpoints are implemented in your backend.

## 🎨 Customization

### Change Commission Percentages

In `BinaryTreeWithStats.tsx`, modify:

```typescript
const percentages = [30, 20, 15, 5, 5, 5, 5, 5, 5, 5]; // Modify these values
```

### Change Unlock Criteria

Modify the `getLevelUnlockStatus()` function:

```typescript
const getLevelUnlockStatus = () => {
  // Change the thresholds here
  if (directReferrals >= 5) return { unlockedLevels: 10, ... };
  if (directReferrals >= 3) return { unlockedLevels: 5, ... };
  return { unlockedLevels: 2, ... };
};
```

### Change Tree Depth

Modify the depth options:

```typescript
{[2, 3, 4, 5].map((depth) => (
  // Change to [3, 5, 7, 10] for deeper trees
  <Button>...</Button>
))}
```

### Color Scheme

The component uses Material-UI theme colors. To customize:

```typescript
<Avatar sx={{ bgcolor: 'primary.main' }}> // Change to any MUI color
<Typography color="success.main">        // Change color variants
```

## 📱 Responsive Design

The component is fully responsive:
- **Mobile (xs)**: Stacked layout, 2 columns for level cards
- **Tablet (sm/md)**: Mixed layout, 4 columns for level cards
- **Desktop (lg+)**: Side-by-side tree and stats, 5 columns for level cards

## 🔧 Troubleshooting

### Tree Not Displaying

1. Check if `treeData` is loaded:
```typescript
console.log('Tree Data:', treeData);
```

2. Verify API response format matches `TreeNode` interface

3. Check browser console for errors

### Level Income Not Showing

1. Verify `levelBreakdown` API returns data in format:
```typescript
{
  level: number;
  count: number;
  totalBV: number;
}
```

2. Check `directReferrals` value is fetched correctly

### Performance Issues

For large trees (>1000 nodes):
- Reduce default depth to 2 or 3
- Implement lazy loading for child nodes
- Use pagination for level breakdown

## 📖 Additional Features You Can Add

### 1. **Export to PDF/Image**
```typescript
import html2canvas from 'html2canvas';

const handleExport = async () => {
  const element = document.getElementById('tree-container');
  const canvas = await html2canvas(element);
  const dataUrl = canvas.toDataURL('image/png');
  // Download or share
};
```

### 2. **Search Member in Tree**
```typescript
const handleSearch = async (query: string) => {
  const response = await searchTreeMembers(query);
  // Highlight found node
};
```

### 3. **Tree Comparison**
Compare LEFT vs RIGHT leg performance side-by-side

### 4. **Animations**
Add entrance animations for nodes using `framer-motion`

### 5. **Real-time Updates**
Use WebSocket to update tree in real-time when new members join

## 🎯 Best Practices

1. **Caching**: Cache tree data for better performance
2. **Depth Limits**: Don't load more than 5 levels at once
3. **Lazy Loading**: Load child nodes on demand
4. **Error Handling**: Always handle API errors gracefully
5. **Loading States**: Show skeletons during data fetch
6. **Responsive**: Test on all device sizes

## 📚 Related Components

- **BinaryTree.tsx**: Core tree visualization component
- **TreeNode.tsx**: Individual tree node display
- **UnilevelTree.tsx**: Alternative unilevel tree view
- **LevelIncome.tsx**: Standalone level income page
- **BarChart.tsx**: Reusable bar chart component

## 🆘 Support

For issues or questions:
1. Check the browser console for errors
2. Verify all API endpoints are working
3. Check TypeScript type definitions match API responses
4. Review Material-UI theme configuration

## 📄 License

This implementation follows your project's license agreement.

---

**Created**: December 2025
**Version**: 1.0.0
**Author**: Claude Sonnet 4.5
