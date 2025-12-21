# Setup Guide for Development

## Fixes Applied

I've made the following changes to resolve the `ERR_INTERNET_DISCONNECTED` errors:

### 1. Created `.env` file
- Added local development configuration
- Set `VITE_ENABLE_PWA=false` to disable PWA in development
- Configured API to use `http://localhost:5000/api`

### 2. Disabled PWA for Development
- Modified `vite.config.ts` to only enable PWA when `VITE_ENABLE_PWA=true`
- This prevents errors about missing PWA icons during development

### 3. Added Favicon
- Created a simple SVG favicon in `public/favicon.svg`
- Updated `index.html` to use the SVG favicon

## How to Run the App Locally

### Option 1: With Local Backend (Recommended for Development)

1. **Start your backend server** on `http://localhost:5000`
   - The Vite dev server will proxy `/api` requests to `http://localhost:5000`

2. **Start the frontend dev server:**
   ```bash
   npm run dev
   ```

3. **Access the app** at `http://localhost:3000` (or the port shown in terminal)

### Option 2: With Internet Connection (Using Production Backend)

If you have internet and want to use the production backend:

1. **Update `.env` file:**
   ```env
   VITE_API_BASE_URL=https://mlm-backend-ljan.onrender.com/api/v1
   ```

2. **Start the dev server:**
   ```bash
   npm run dev
   ```

### Option 3: Mock Backend for Offline Development

If you don't have a backend running, you can:

1. Create a mock server using tools like `json-server` or `MSW` (Mock Service Worker)
2. Or modify the axios interceptors to return mock data during development

## Understanding the Errors

The errors you saw occurred because:

1. **Google Fonts Error**: The app loads fonts from Google CDN, which requires internet. The PWA cache would help after first load, but wasn't working without PWA enabled.

2. **Favicon/PWA Icons Error**: These files didn't exist in the `public` folder, causing 404 errors.

3. **API Error**: The app was trying to reach the production backend (`mlm-backend-ljan.onrender.com`) without an internet connection.

## Next Steps

### For Development:
1. Make sure you're running the app on `localhost` (not opening `dist/index.html` directly)
2. Have your backend running on port 5000, OR
3. Update the `.env` file to point to a different backend URL

### For Production:
1. Set `VITE_ENABLE_PWA=true` in your production environment variables
2. Create proper PWA icons:
   - `public/pwa-192x192.png` (192x192px)
   - `public/pwa-512x512.png` (512x512px)
   - `public/apple-touch-icon.png` (180x180px)
   - `public/favicon.ico` (32x32px or multi-size)

## Optional: Self-Host Google Fonts

To avoid dependency on Google Fonts CDN, you can:

1. Download the fonts from Google Fonts
2. Place them in `public/fonts/`
3. Update `index.html` to use local font files instead of the CDN link
4. Add `@font-face` rules in your CSS

This will make the app work completely offline (after first load with PWA caching).

## Troubleshooting

**Issue**: Still seeing API errors
- **Solution**: Check that `axiosConfig.ts` is detecting localhost correctly (line 7-8)
- Verify you're accessing via `http://localhost:3000` not `http://127.0.0.1:3000`

**Issue**: PWA errors still appearing
- **Solution**: Clear browser cache and service worker
- Check that `.env` file has `VITE_ENABLE_PWA=false`
- Restart the dev server after changing `.env`

**Issue**: Fonts not loading
- **Solution**: Requires internet on first load, or self-host the fonts as described above
