# PWA Icons

## Required Icons
The manifest.json references two icon files that should be placed in the `public` directory:

- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

## Creating Icons

### ✅ RECOMMENDED: Use the Built-in Icon Generator
1. Open `public/generate-icons.html` in your web browser
2. Click "Download Both" to download both icon sizes
3. Save the downloaded files to the `/public` directory
   - Make sure they're named exactly: `icon-192.png` and `icon-512.png`
4. Refresh your app - the 404 errors will disappear!

The generator creates beautiful wine glass icons with your app's burgundy and gold color scheme.

### Option 2: Use Online Favicon Generator
1. Create a simple logo/icon (can use the burgundy sign concept)
2. Visit https://favicon.io/favicon-generator/ or https://realfavicongenerator.net/
3. Upload your icon and generate all sizes
4. Download and place in the `public` directory

### Option 3: Use the SVG Template
An `icon.svg` file is provided in the `/public` directory that you can:
- Edit with any vector graphics software
- Convert to PNG at the required sizes
- Save as `icon-192.png` and `icon-512.png`

## Current Status
The manifest is already linked in the root layout. Once you add the icon files using any of the methods above, PWA functionality will be complete and users can "Add to Home Screen" on mobile devices.
