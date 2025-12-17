# 🏘️ Real Estate Components - User Panel

Comprehensive real estate components for the MLM Real Estate Platform user interface.

## 📦 Components Overview

### 1. **ROI Calculator** (`ROICalculator.tsx`)

Advanced return on investment calculator with multiple revenue streams and tax calculations.

#### Features:
- 📊 **Multi-factor ROI calculation**
  - Direct ROI returns
  - Property appreciation (compound interest)
  - Rental income projections
  - Tax deductions (TDS)
- 📈 **Real-time calculations** with interactive sliders
- 💰 **Detailed breakdown** of all income sources
- ⏱️ **Break-even period** calculation
- 📱 **Responsive design** with dark mode support

#### Usage:
```tsx
import { ROICalculator } from '@/components/property';

<ROICalculator
  propertyPrice={5000000}
  minimumInvestment={50000}
  expectedROI={15}
  tenure={36}
  appreciationRate={8}
  rentalYield={5}
/>
```

#### Props:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `propertyPrice` | `number` | `0` | Total property price |
| `minimumInvestment` | `number` | `50000` | Minimum investment amount |
| `expectedROI` | `number` | `15` | Expected ROI percentage |
| `tenure` | `number` | `36` | Investment tenure in months |
| `appreciationRate` | `number` | `8` | Annual appreciation rate % |
| `rentalYield` | `number` | `0` | Annual rental yield % |
| `className` | `string` | `''` | Additional CSS classes |

---

### 2. **EMI Calculator** (`EMICalculator.tsx`)

Comprehensive EMI (Equated Monthly Installment) calculator for property loans.

#### Features:
- 🏦 **Accurate EMI calculation** using standard formula
- 📉 **Amortization schedule** (first 60 months)
- 💳 **Adjustable down payment** with live LTV calculation
- 📊 **Visual breakdown** of principal vs interest
- 🔢 **Interactive sliders** for all parameters
- 📱 **Mobile-optimized** interface

#### Usage:
```tsx
import { EMICalculator } from '@/components/property';

<EMICalculator
  propertyPrice={5000000}
/>
```

#### Calculations:
- **EMI Formula**: `[P × r × (1 + r)^n] / [(1 + r)^n - 1]`
- **LTV (Loan-to-Value)**: `(Loan Amount / Property Price) × 100`
- **Total Interest**: `(EMI × Months) - Principal`

---

### 3. **Virtual Tour Viewer** (`VirtualTourViewer.tsx`)

Interactive 360° virtual tour viewer with hotspots and scene navigation.

#### Features:
- 🎬 **360° Pan & Zoom** controls
- 🔄 **Auto-rotate** mode
- 📍 **Interactive hotspots** for room navigation
- 🖼️ **Multiple scenes** support
- 📏 **Fullscreen mode**
- ⌨️ **Keyboard shortcuts**
- 🌙 **Dark mode compatible**

#### Usage:
```tsx
import { VirtualTourViewer } from '@/components/property';

const scenes = [
  {
    id: 'living-room',
    name: 'Living Room',
    imageUrl: '/360/living-room.jpg',
    hotspots: [
      {
        id: 'hs1',
        x: 30,
        y: 50,
        title: 'Kitchen',
        targetScene: 'kitchen'
      }
    ]
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    imageUrl: '/360/kitchen.jpg',
    hotspots: []
  }
];

<VirtualTourViewer
  scenes={scenes}
  initialScene="living-room"
  onClose={() => setShowTour(false)}
/>
```

#### Controls:
- **Mouse drag**: Pan around
- **Scroll**: Zoom in/out
- **Click hotspots**: Navigate between scenes
- **Auto-rotate button**: Enable/disable rotation
- **Fullscreen button**: Toggle fullscreen mode

---

### 4. **Property Comparison** (`PropertyComparison.tsx`)

Side-by-side comparison tool for up to multiple properties.

#### Features:
- 📊 **Comprehensive comparison** across all property attributes
- 🏠 **Categorized sections**:
  - Basic Information
  - Location
  - Pricing
  - Returns (ROI, Appreciation, Rental Yield)
  - Property Details
  - Booking Status
  - Investment Statistics
- ❌ **Remove properties** individually
- 📱 **Horizontal scroll** for mobile
- 🎨 **Color-coded values** for quick insights

#### Usage:
```tsx
import { PropertyComparison } from '@/components/property';

<PropertyComparison
  properties={[property1, property2, property3]}
  onRemoveProperty={(id) => handleRemove(id)}
  onClose={() => setShowComparison(false)}
/>
```

#### Comparison Categories:
1. **Basic Info**: ID, Title, Type, Status
2. **Location**: City, State, Address
3. **Pricing**: Price, Min Investment, BV Value
4. **Returns**: ROI, Tenure, Appreciation, Rental Yield
5. **Details**: Area, Bedrooms, Bathrooms, Furnishing
6. **Booking**: Total Slots, Available Slots, Progress
7. **Stats**: Investors Count, Average Investment

---

### 5. **Property Map** (`PropertyMap.tsx`)

Interactive map with nearby facilities and navigation.

#### Features:
- 🗺️ **Google Maps integration**
- 📍 **Property location** pinpointing
- 🏢 **Nearby facilities** display
- 🎯 **Facility filtering** by type
- 🛰️ **Satellite view** toggle
- 🧭 **Get directions** link
- 📱 **Mobile responsive**

#### Usage:
```tsx
import { PropertyMap } from '@/components/property';

const location = {
  address: 'Bandra West, Mumbai',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400050',
  latitude: 19.0596,
  longitude: 72.8295,
  nearbyFacilities: [
    {
      type: 'school',
      name: 'St. Mary\'s School',
      distance: '500m'
    },
    {
      type: 'hospital',
      name: 'Lilavati Hospital',
      distance: '1.2km'
    },
    {
      type: 'metro',
      name: 'Bandra Station',
      distance: '800m'
    }
  ]
};

<PropertyMap location={location} />
```

#### Facility Types:
- 🏫 Schools
- 🏥 Hospitals
- 🏬 Shopping Malls
- 🚇 Metro Stations
- 🌳 Parks
- 🍴 Restaurants
- 💪 Gyms
- 🏧 ATMs
- 🛒 Markets

---

## 🎨 Styling

All components use:
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Icons** for iconography
- **Dark mode** support out of the box
- **Responsive design** for all screen sizes

## 🚀 Integration Example

Here's how to integrate these components into a property detail page:

```tsx
import React, { useState } from 'react';
import {
  ROICalculator,
  EMICalculator,
  VirtualTourViewer,
  PropertyComparison,
  PropertyMap,
} from '@/components/property';
import { useGetPropertyByIdQuery } from '@/redux/services/propertyService';

const PropertyDetailPage = () => {
  const { data: propertyData } = useGetPropertyByIdQuery(propertyId);
  const property = propertyData?.data;

  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Property Header */}
      <PropertyHeader property={property} />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton
            active={activeTab === 'calculators'}
            onClick={() => setActiveTab('calculators')}
          >
            Calculators
          </TabButton>
          <TabButton
            active={activeTab === 'location'}
            onClick={() => setActiveTab('location')}
          >
            Location
          </TabButton>
          <TabButton
            active={activeTab === 'virtual-tour'}
            onClick={() => setActiveTab('virtual-tour')}
          >
            Virtual Tour
          </TabButton>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <PropertyOverview property={property} />
      )}

      {activeTab === 'calculators' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ROICalculator
            propertyPrice={property.price}
            minimumInvestment={property.minInvestment}
            expectedROI={property.expectedROI}
            tenure={property.roiTenure}
            appreciationRate={property.annualAppreciation}
            rentalYield={property.rentalYield}
          />
          <EMICalculator propertyPrice={property.price} />
        </div>
      )}

      {activeTab === 'location' && (
        <PropertyMap location={property.location} />
      )}

      {activeTab === 'virtual-tour' && property.virtualTourUrl && (
        <VirtualTourViewer
          scenes={property.virtualTourScenes}
          initialScene={property.virtualTourScenes[0]?.id}
        />
      )}
    </div>
  );
};
```

## 🔧 Configuration

### Google Maps API
To enable the map functionality, add your Google Maps API key:

1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps Embed API
3. Replace `YOUR_GOOGLE_MAPS_API_KEY` in `PropertyMap.tsx`

### Virtual Tours
For 360° virtual tours:
- Use equirectangular 360° images (2:1 aspect ratio)
- Recommended resolution: 4096×2048 or higher
- Supported formats: JPG, PNG

## 📱 Responsive Breakpoints

```css
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
```

All components are fully responsive and tested on:
- Mobile (iOS/Android)
- Tablets
- Desktop browsers
- Dark/Light modes

## 🎯 Best Practices

1. **ROI Calculator**
   - Always display disclaimer about estimated returns
   - Use realistic default values
   - Show detailed breakdown for transparency

2. **EMI Calculator**
   - Clearly mention that values are indicative
   - Include processing fees and other charges info
   - Link to bank/financial institution for exact details

3. **Virtual Tour**
   - Optimize 360° images for web (compress to ~2MB each)
   - Provide keyboard shortcuts guide
   - Add accessibility features (ARIA labels)

4. **Property Comparison**
   - Limit to 3-4 properties for better UX
   - Highlight differences with color coding
   - Make table scrollable on mobile

5. **Property Map**
   - Verify nearby facilities data accuracy
   - Update distances regularly
   - Provide alternative text for screen readers

## 🐛 Known Issues & Solutions

### Issue: Google Maps not loading
**Solution**: Ensure API key is valid and Maps Embed API is enabled

### Issue: Virtual tour images not loading
**Solution**: Check CORS settings on image hosting server

### Issue: Calculations seem off
**Solution**: Verify input parameters and review formula implementations

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "framer-motion": "^10.16.0",
  "react-icons": "^4.11.0",
  "tailwindcss": "^3.3.0"
}
```

## 📄 License

These components are part of the MLM Real Estate Platform and are proprietary.

---

**Built with ❤️ for Real Estate Investment Excellence**
