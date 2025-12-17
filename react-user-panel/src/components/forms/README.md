# Form Components

Production-ready, reusable form components built with Material-UI, React Hook Form, and TypeScript.

## Components

### 1. InputField
Reusable text input field with built-in validation, icons, and error handling.

**Features:**
- Password visibility toggle
- Start/end icons support
- Error state display
- Multiline support
- Full accessibility (ARIA labels)
- Dark mode compatible

**Usage:**
```tsx
import { InputField } from './components/forms';
import { useForm } from 'react-hook-form';

const { control } = useForm();

<InputField
  name="email"
  control={control}
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  required
  startIcon={<EmailIcon />}
/>
```

### 2. SelectField
Dropdown/select field with single or multiple selection support.

**Features:**
- Single and multiple selection
- Custom option icons
- Chip display for multiple values
- Custom render values
- Searchable options
- Accessible dropdown menu

**Usage:**
```tsx
<SelectField
  name="state"
  control={control}
  label="State"
  options={stateOptions}
  placeholder="Select your state"
  required
/>
```

### 3. DatePicker
Material-UI date picker with validation and constraints.

**Features:**
- Min/max date validation
- Disable past/future dates
- Multiple view modes (year, month, day)
- Custom date format
- Calendar icon
- Action bar (clear, accept, cancel)

**Usage:**
```tsx
<DatePicker
  name="dateOfBirth"
  control={control}
  label="Date of Birth"
  disableFuture
  required
/>
```

### 4. FileUpload
Advanced file upload with drag-and-drop using react-dropzone.

**Features:**
- Drag and drop interface
- File type validation
- File size validation
- Image preview
- Multiple file support
- Progress indication
- File list with delete option
- Accessible upload area

**Usage:**
```tsx
<FileUpload
  onFilesChange={(files) => console.log(files)}
  maxFiles={5}
  maxSize={5242880} // 5MB
  acceptedFileTypes={{
    'image/*': ['.png', '.jpg', '.jpeg'],
    'application/pdf': ['.pdf']
  }}
  multiple
  showPreview
/>
```

### 5. PasswordStrength
Password strength indicator with criteria validation.

**Features:**
- Real-time strength calculation
- Visual progress bar
- Criteria checklist
- Color-coded strength levels
- Security tips
- Customizable minimum length

**Usage:**
```tsx
const password = watch('password');

<InputField
  name="password"
  control={control}
  label="Password"
  type="password"
  required
/>

<PasswordStrength
  password={password}
  showCriteria
  minLength={8}
/>
```

## Installation

These components require the following dependencies:

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/x-date-pickers date-fns
npm install react-hook-form @hookform/resolvers yup
npm install react-dropzone
```

## Common Props

All form components accept:
- `name` - Field name (required)
- `control` - React Hook Form control (required)
- `label` - Field label (required)
- `required` - Mark field as required
- `disabled` - Disable field
- `helperText` - Additional help text
- `placeholder` - Placeholder text

## Validation

Use Yup for schema validation:

```tsx
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
  age: yup.number().min(18).required(),
});

const { control } = useForm({
  resolver: yupResolver(schema)
});
```

## Accessibility

All components include:
- ARIA labels and descriptions
- Keyboard navigation
- Screen reader support
- Focus management
- Error announcements

## Theming

Components automatically adapt to:
- Light/dark mode
- Custom MUI theme
- Responsive breakpoints
- RTL layouts
