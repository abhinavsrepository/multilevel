# Property Management System - Complete Guide

## Overview

The Multi-Level Marketing (MLM) platform now has a **fully functional property management system** with separate interfaces for:

- **Admin Panel**: Full CRUD operations, property management, and investor tracking
- **User Panel**: Property browsing, filtering, favorites, investment tracking, and detailed property information

---

## System Architecture

### Backend Structure

#### Controllers
1. **property.controller.js** (`/api/v1/properties`)
   - User-facing property endpoints
   - Property listing, filtering, search
   - Favorites/wishlist management
   - Property details and statistics

2. **admin-property.controller.js** (`/api/v1/admin/properties`)
   - Admin-only property management
   - CRUD operations
   - Image and document uploads
   - Status management (featured, trending)
   - Investor management

#### Database Model
- **Property Model** (property.model.js)
  - 50+ fields including pricing, location, specifications
  - JSONB fields for images, videos, documents, amenities
  - Built-in view tracking and favorites counting

#### Routes
- User routes: `/api/v1/properties/*`
- Admin routes: `/api/v1/admin/properties/*`

---

## Features

### Admin Panel Features

#### 1. Property Listing (PropertiesList.tsx)
- **View all properties** with pagination
- **Advanced filtering**:
  - Search by location (city/state)
  - Filter by status (Active, Inactive, Sold Out, etc.)
  - Filter by property type
  - Price range slider
- **Statistics dashboard**:
  - Total properties count
  - Total investment value
  - Investment slots (booked/available)
  - Average ROI
- **Quick actions**:
  - View details
  - Edit property
  - View investors
  - Toggle featured status
  - Mark as new launch
  - Change status
  - Delete property

#### 2. Add/Edit Property (AddEditProperty.tsx)
**Multi-step wizard with 5 steps**:

**Step 1: Basic Info**
- Property title, ID, type, category
- Description
- Status flags (Active, Featured, New Launch)

**Step 2: Location**
- Full address
- City, state, pincode
- Latitude/longitude for maps
- Google Maps link

**Step 3: Specifications**
- Total area, built-up area
- Bedrooms, bathrooms, floors
- Facing direction
- Amenities (multi-select)

**Step 4: Financials**
- Base price
- Investment price
- Total investment slots
- Minimum investment
- Expected ROI (%)
- ROI tenure (months)
- Annual appreciation rate

**Step 5: Media**
- Property images (up to 8)
- Virtual tour URL
- Video links

#### 3. Property Management
- **Image Upload**: Upload multiple images to Cloudinary
- **Document Upload**: Attach property documents
- **Investor Tracking**: View all investors for a property
- **Status Management**: Change property status
- **Send Updates**: Notify investors about property updates

---

### User Panel Features

#### 1. Property Browsing (PropertiesList.tsx)
- **Grid/List view toggle**
- **Advanced filtering**:
  - Property type (Residential, Commercial, Plot, etc.)
  - Multiple city selection
  - Price range
  - Investment range
  - Availability status
  - Minimum ROI threshold
  - Amenities
- **Sorting options**:
  - Latest
  - Price (Low to High)
  - Price (High to Low)
  - Most Popular
  - Highest ROI
- **URL state persistence**: Filters remain on page refresh

#### 2. Property Detail View (PropertyDetail.tsx)
**Tabbed interface with**:
- **Overview**: Key property information
- **Investment Details**: ROI, returns, booking progress
- **Location**: Map integration, nearby facilities
- **Developer Info**: Developer details, RERA number
- **Documents**: Downloadable property documents
- **Gallery**: Image carousel with lightbox
- **Investment History**: Recent investor activity

**Features**:
- Add to favorites/wishlist
- Investment calculator
- Social sharing
- Similar properties recommendations

#### 3. Advanced Calculators

**ROI Calculator (ROICalculator.tsx)**
- Input investment amount and tenure
- Calculate expected returns
- Shows appreciation gains
- Rental yield calculation
- Tax calculations (TDS)
- Break-even period analysis

**EMI Calculator (EMICalculator.tsx)**
- Loan amount and interest rate
- Calculate monthly EMI
- Total payment and interest breakdown
- Amortization schedule

#### 4. Interactive Features

**Virtual Tour Viewer (VirtualTourViewer.tsx)**
- 360° property tours
- Interactive hotspots
- Multiple scenes/rooms navigation
- Zoom and rotation controls
- Auto-rotate mode

**Property Comparison (PropertyComparison.tsx)**
- Compare 2-3 properties side-by-side
- Organized comparison categories
- Visual indicators for features

**Property Map (PropertyMap.tsx)**
- Google Maps integration
- Nearby facilities display
- Distance calculations
- Facility type filtering

---

## API Endpoints

### User Endpoints (`/api/v1/properties`)

#### Property Listing
```
GET /                           - Get all properties
GET /featured                   - Featured properties
GET /new-launches              - New launch properties
GET /trending                  - Trending properties
GET /recommended               - Recommended for user (protected)
```

#### Property Details
```
GET /:id                       - Get property by ID
GET /code/:propertyId          - Get property by property code
GET /:id/similar              - Similar properties
GET /:id/stats                - Property statistics
GET /:id/recent-investments   - Recent investor activity
```

#### Search & Filters
```
GET /search                    - Search properties
POST /search                   - Search with body params
GET /type/:type               - By property type
GET /status/:status           - By availability status
GET /city/:city               - By city
GET /state/:state             - By state
GET /price-range              - By price range
GET /investment-range         - By investment amount
```

#### Filter Facets
```
GET /filters/types            - Available property types
GET /filters/cities           - Available cities with counts
GET /filters/states           - Available states
GET /filters/amenities        - Available amenities
GET /filters/price-range      - Price range statistics
GET /filters/investment-range - Investment range statistics
```

#### Media & Documents
```
GET /:id/documents            - Property documents
GET /:id/images               - Property images
GET /:id/videos               - Property videos
```

#### Favorites (Protected)
```
GET /favorites                - User's favorite properties
GET /:id/favorite/add        - Add to favorites
GET /:id/favorite/remove     - Remove from favorites
GET /:id/favorite/check      - Check favorite status
```

#### Other
```
GET /compare                  - Compare properties
GET /developer/:id            - Properties by developer
GET /developers/:id           - Developer details
```

---

### Admin Endpoints (`/api/v1/admin/properties`)

#### CRUD Operations
```
GET /                         - Get all properties (paginated)
GET /:id                      - Get property by ID
POST /                        - Create property
PUT /:id                      - Update property
DELETE /:id                   - Delete property
```

#### Status Management
```
PUT /:id/status              - Update property status
PUT /:id/toggle-featured     - Toggle featured status
PUT /:id/toggle-trending     - Toggle trending status
```

#### Media Management
```
POST /:id/images             - Upload property images (multipart)
DELETE /:id/images/:imageId  - Delete property image
POST /:id/documents          - Upload property document (multipart)
DELETE /:id/documents/:docId - Delete property document
```

#### Investor Management
```
GET /:id/investors           - Get property investors
POST /:id/send-update        - Send update to investors
```

#### Import/Export
```
GET /export                  - Export properties as CSV
POST /import                 - Import properties from CSV
```

---

## Database Schema

### Property Table Fields

#### Identification
- `id` (BIGINT, Primary Key)
- `propertyId` (STRING, Unique) - Custom property code

#### Basic Info
- `title` (STRING)
- `description` (TEXT)
- `propertyType` (ENUM: RESIDENTIAL, COMMERCIAL, PLOT, VILLA, APARTMENT, LAND)
- `propertyCategory` (STRING)

#### Location (10 fields)
- `address`, `city`, `state`, `pincode`
- `latitude`, `longitude`, `googleMapsLink`

#### Specifications (9 fields)
- `totalArea`, `builtUpArea`
- `bedrooms`, `bathrooms`, `floors`
- `facing`, `furnishingStatus`

#### Pricing (6 fields)
- `basePrice`, `investmentPrice`, `minimumInvestment`
- `totalInvestmentSlots`, `slotsBooked`

#### ROI & Commissions (4 fields)
- `expectedRoiPercent`, `roiTenureMonths`
- `appreciationRateAnnual`
- `directReferralCommissionPercent`, `bvValue`

#### Developer Info (4 fields)
- `developerName`, `developerContact`
- `developerEmail`, `reraNumber`

#### Media (JSONB)
- `images` - Array of image objects
- `videos` - Array of video URLs
- `virtualTourUrl` - 360° tour link
- `documents` - Array of document objects
- `amenities` - Array of amenity strings

#### Status & Flags
- `status` (ENUM: ACTIVE, INACTIVE, SOLD_OUT, UNDER_MAINTENANCE)
- `isFeatured` (BOOLEAN)
- `isNewLaunch` (BOOLEAN)
- `isVerified` (BOOLEAN)

#### Statistics
- `views` (INTEGER)
- `favoritesCount` (INTEGER)

#### Audit
- `createdBy`, `updatedBy`
- `verifiedBy`, `verifiedAt`
- `createdAt`, `updatedAt`

---

## Image & Document Upload

### Cloudinary Integration

All property images and documents are uploaded to **Cloudinary** for reliable cloud storage and CDN delivery.

#### Image Upload
- **Folder**: `mlm-properties`
- **Transformations**:
  - Resize to max 1200x800px
  - Auto quality optimization
- **Max size**: 10MB per image
- **Max images**: 10 per upload

#### Document Upload
- **Folder**: `mlm-property-documents`
- **Allowed formats**: PDF, DOC, DOCX
- **Max size**: 10MB per document

### Upload Process

**Admin Panel**:
1. Navigate to Add/Edit Property → Media tab
2. Click "Upload Images"
3. Select up to 8 images
4. Images are uploaded to Cloudinary
5. URLs are stored in database

**API**:
```javascript
// Upload images
POST /api/v1/admin/properties/:id/images
Content-Type: multipart/form-data
Body: { images: [file1, file2, ...] }

// Upload document
POST /api/v1/admin/properties/:id/documents
Content-Type: multipart/form-data
Body: {
  document: file,
  documentType: 'RERA_CERTIFICATE',
  documentName: 'RERA Certificate'
}
```

---

## Usage Guide

### For Admins

#### Creating a New Property

1. **Login to Admin Panel**
   ```
   URL: https://mlm-backend-ljan.onrender.com
   OR localhost:3000 (if running locally)
   ```

2. **Navigate to Properties**
   - Click "Properties" in sidebar
   - Click "+ Add Property" button

3. **Fill Property Details** (Multi-step form)

   **Step 1: Basic Info**
   - Property Title: "Luxury Villa in Goa"
   - Property ID: "PROP-001" (must be unique)
   - Type: VILLA
   - Category: PREMIUM
   - Description: Detailed description
   - Status: ACTIVE
   - Check "Featured" for homepage display

   **Step 2: Location**
   - Full address
   - City: "Panaji"
   - State: "Goa"
   - Pincode: "403001"
   - Add Google Maps link if available

   **Step 3: Specifications**
   - Total Area: 2500 sq ft
   - Bedrooms: 3
   - Bathrooms: 3
   - Amenities: Select from dropdown

   **Step 4: Financials**
   - Base Price: ₹50,00,000
   - Investment Price: ₹5,00,000
   - Total Slots: 100
   - Minimum Investment: ₹50,000
   - Expected ROI: 12%
   - ROI Tenure: 24 months
   - Appreciation: 8% annually

   **Step 5: Media**
   - Upload property images
   - Add virtual tour URL
   - Add video links

4. **Save Property**
   - Review all details
   - Click "Create Property"

#### Managing Properties

**Edit Property**:
- Click edit icon on property row
- Modify fields
- Click "Update Property"

**Delete Property**:
- Click delete icon
- Confirm deletion

**Change Status**:
- Use status dropdown in property list
- Options: Active, Inactive, Sold Out, Under Maintenance

**Mark as Featured**:
- Toggle featured switch
- Featured properties appear on homepage

**View Investors**:
- Click "View Investors" action
- See all users who invested in property

---

### For Users

#### Browsing Properties

1. **Access User Panel**
   ```
   URL: https://your-user-panel-domain.com
   ```

2. **Browse Properties**
   - View all available properties
   - Switch between Grid/List view

3. **Apply Filters**
   - Select property type
   - Choose cities
   - Set price range
   - Filter by amenities
   - Sort by price, ROI, etc.

4. **View Property Details**
   - Click on any property
   - Explore tabbed interface
   - View images in gallery
   - Check location on map
   - Download documents

#### Adding to Favorites

1. Click heart icon on property card
2. OR click "Add to Wishlist" in detail view
3. Access favorites from user menu

#### Using Calculators

**ROI Calculator**:
1. Open property detail page
2. Navigate to "Investment Details" tab
3. Enter investment amount
4. Adjust tenure
5. View calculated returns

**EMI Calculator**:
1. Enter loan amount
2. Set interest rate
3. Choose tenure
4. View EMI breakdown

#### Comparing Properties

1. Select 2-3 properties
2. Click "Compare" button
3. View side-by-side comparison

---

## Testing the System

### 1. Backend Testing

**Start the backend server**:
```bash
cd backend-node
npm install
npm start
```

**Test API endpoints**:
```bash
# Get all properties
curl http://localhost:3000/api/v1/properties

# Get featured properties
curl http://localhost:3000/api/v1/properties/featured

# Admin login (get token first)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'

# Create property (admin only)
curl -X POST http://localhost:3000/api/v1/admin/properties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @property-data.json
```

### 2. Admin Panel Testing

**Start admin panel**:
```bash
cd react-admin-panel
npm install
npm run dev
```

**Test flows**:
1. Login as admin
2. Navigate to Properties
3. Create a new property
4. Upload images
5. Edit property
6. Toggle featured status
7. View property list with filters

### 3. User Panel Testing

**Start user panel**:
```bash
cd react-user-panel
npm install
npm run dev
```

**Test flows**:
1. Browse properties (no login required)
2. Apply filters
3. View property details
4. Add to favorites (login required)
5. Use ROI calculator
6. Compare properties
7. View virtual tour

---

## Deployment

### Backend Deployment (Render.com)

Backend is already deployed at:
```
https://mlm-backend-ljan.onrender.com
```

**Environment Variables Required**:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Admin Panel Deployment

**Build**:
```bash
cd react-admin-panel
npm run build
```

The admin panel is served by the backend at:
```
https://mlm-backend-ljan.onrender.com/
```

### User Panel Deployment (Render.com)

Follow the guide in `USER_PORTAL_DEPLOYMENT.md`

**Environment Variables**:
```
VITE_API_BASE_URL=https://mlm-backend-ljan.onrender.com/api/v1
```

---

## Troubleshooting

### Common Issues

**1. Images not uploading**
- Check Cloudinary credentials
- Verify file size < 10MB
- Check network connection
- Review browser console for errors

**2. Properties not appearing**
- Verify database connection
- Check property status is ACTIVE
- Clear browser cache
- Check API response in Network tab

**3. Filters not working**
- Clear URL parameters
- Refresh page
- Check browser console for errors

**4. Admin panel 401 errors**
- Token expired - login again
- Check token storage in localStorage
- Verify admin role in user profile

**5. CORS errors (local development)**
- Backend CORS is configured to allow all origins
- Check proxy configuration in vite.config.ts
- Verify backend is running

---

## Next Steps

### Recommended Enhancements

1. **Property Analytics**
   - Implement admin analytics dashboard
   - Track property views over time
   - Investment trends analysis

2. **Advanced Search**
   - Elasticsearch integration
   - Fuzzy search
   - Search suggestions

3. **Property Import**
   - CSV bulk upload
   - Excel import with validation

4. **Email Notifications**
   - New property alerts
   - Price drop notifications
   - Investment confirmations

5. **Mobile App**
   - React Native app
   - Property browsing on mobile
   - Push notifications

---

## Support & Documentation

### Resources
- Backend API docs: `/api/v1/docs` (if Swagger configured)
- Database schema: `backend-node/src/models/property.model.js`
- Frontend types: `react-admin-panel/src/types/property.types.ts`

### Getting Help
- Check this guide first
- Review console errors
- Check network tab in DevTools
- Verify API responses

---

## Summary

The property management system is **fully functional** and ready to use:

✅ **Backend**: Complete API with user and admin endpoints
✅ **Admin Panel**: Full CRUD operations, image uploads, investor management
✅ **User Panel**: Property browsing, filtering, favorites, calculators
✅ **Database**: Comprehensive schema with all necessary fields
✅ **Cloud Storage**: Cloudinary integration for images and documents
✅ **Deployment**: Backend deployed, admin panel integrated

**You can now**:
- Create and manage properties as admin
- Browse and filter properties as user
- Upload images and documents
- Track investments and investors
- Calculate ROI and EMI
- Compare properties
- Add properties to favorites

The system is production-ready and can handle real-world usage!
