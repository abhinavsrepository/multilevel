# Modal Components

Production-ready modal dialogs for common user interactions in the MLM Real Estate platform.

## Components

### 1. InvestmentModal
Multi-step modal for creating new investments with calculator and payment integration.

**Features:**
- 4-step wizard (Amount, Nominee, Payment, Review)
- Investment calculator with returns projection
- Quick amount selection
- Nominee details form
- Payment method selection (Wallet/Razorpay)
- Razorpay integration placeholder
- Progress stepper
- Back/Next navigation
- Form validation at each step
- Responsive design

**Steps:**
1. **Investment Amount** - Enter amount with calculator showing returns
2. **Nominee Details** - Add nominee information
3. **Payment Method** - Choose wallet or Razorpay payment
4. **Review & Confirm** - Review all details and confirm

**Usage:**
```tsx
import { InvestmentModal } from './components/modals';

const [open, setOpen] = useState(false);

const handleInvestment = async (data: InvestmentFormData) => {
  // Process investment
  await api.createInvestment(data);
};

<InvestmentModal
  open={open}
  onClose={() => setOpen(false)}
  onSubmit={handleInvestment}
  walletBalance={50000}
  minInvestment={1000}
  maxInvestment={10000000}
  interestRate={12}
  lockPeriod={365}
/>
```

### 2. WithdrawalModal
Withdrawal request modal with bank details and PIN verification.

**Features:**
- Wallet balance display
- Withdrawal amount with quick select
- Fee calculation
- Bank account details form
- IFSC code validation
- Two-step verification (details + PIN)
- Net amount calculation
- Processing time information
- Balance validation

**Usage:**
```tsx
import { WithdrawalModal } from './components/modals';

const [open, setOpen] = useState(false);

const handleWithdrawal = async (data: WithdrawalFormData) => {
  // Process withdrawal
  await api.createWithdrawal(data);
};

<WithdrawalModal
  open={open}
  onClose={() => setOpen(false)}
  onSubmit={handleWithdrawal}
  walletBalance={50000}
  minWithdrawal={500}
  maxWithdrawal={1000000}
  withdrawalFee={2}
  processingTime="2-3 business days"
/>
```

### 3. ProfileEditModal
Complete profile editing modal with image upload.

**Features:**
- Profile picture upload with preview
- Personal information (name, DOB, gender)
- Contact information (email, phone)
- Address details with Indian states
- Form validation
- Dirty state detection
- Image preview with badge
- Responsive grid layout
- Field-level validation

**Usage:**
```tsx
import { ProfileEditModal } from './components/modals';

const [open, setOpen] = useState(false);
const [currentProfile, setCurrentProfile] = useState<ProfileFormData>();

const handleProfileUpdate = async (data: ProfileFormData) => {
  // Update profile
  await api.updateProfile(data);
};

<ProfileEditModal
  open={open}
  onClose={() => setOpen(false)}
  onSubmit={handleProfileUpdate}
  currentData={currentProfile}
/>
```

### 4. ConfirmModal
Generic confirmation dialog with multiple variants and presets.

**Features:**
- Multiple variants (info, warning, error, success, question)
- Customizable icons
- Async action support
- Loading state
- Preset confirmations (delete, logout, cancel, submit)
- Custom children support
- Auto-focus on confirm button
- Keyboard navigation

**Variants:**
- `info` - Informational confirmation
- `warning` - Warning confirmation
- `error` - Error/destructive confirmation
- `success` - Success confirmation
- `question` - Question/default confirmation

**Usage:**
```tsx
import { ConfirmModal, useConfirmDialog, confirmDelete } from './components/modals';

// Basic usage
<ConfirmModal
  open={open}
  onClose={() => setOpen(false)}
  onConfirm={handleConfirm}
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  variant="error"
  confirmColor="error"
  confirmText="Delete"
/>

// Using hook
const { showConfirm, confirmProps } = useConfirmDialog();

<Button onClick={() => showConfirm(
  'Logout',
  'Are you sure you want to logout?',
  handleLogout,
  { variant: 'warning', confirmColor: 'warning' }
)}>
  Logout
</Button>

<ConfirmModal {...confirmProps} />

// Using preset
const deleteProps = confirmDelete('Investment #123', handleDelete);
<ConfirmModal {...deleteProps} open={open} onClose={handleClose} />
```

## Common Features

All modals include:
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Close on backdrop click (configurable)
- ✅ Escape key to close
- ✅ Focus trapping
- ✅ Smooth animations

## Installation

These components require:

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install react-hook-form @hookform/resolvers yup
npm install react-dropzone date-fns
```

## Best Practices

### 1. State Management
```tsx
const [modalOpen, setModalOpen] = useState(false);

const handleOpen = () => setModalOpen(true);
const handleClose = () => setModalOpen(false);
```

### 2. Error Handling
```tsx
const handleSubmit = async (data) => {
  try {
    await api.submit(data);
    toast.success('Success!');
    handleClose();
  } catch (error) {
    toast.error(error.message);
  }
};
```

### 3. Form Reset
Modals automatically reset forms on close to prevent stale data.

### 4. Loading States
All modals handle async operations with loading indicators.

## Razorpay Integration

The InvestmentModal includes a placeholder for Razorpay integration:

```tsx
// Add to your index.html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

// In InvestmentModal, uncomment Razorpay code:
const options = {
  key: process.env.REACT_APP_RAZORPAY_KEY,
  amount: amount * 100, // amount in paise
  currency: 'INR',
  name: 'MLM Real Estate',
  description: 'Investment Transaction',
  handler: function (response) {
    // Handle success
  },
};
const razorpay = new window.Razorpay(options);
razorpay.open();
```

## Accessibility

All modals follow WCAG 2.1 Level AA standards:
- Screen reader announcements
- Keyboard navigation (Tab, Escape, Enter)
- Focus management
- ARIA attributes
- High contrast mode support
- Reduced motion support

## Examples

See individual component files for detailed implementation examples and TypeScript interfaces.
