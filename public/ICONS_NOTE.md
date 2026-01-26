# PWA Icons

## Required Icons
The manifest.json references two icon files that should be placed in the `public` directory:

- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

## Creating Icons

### Option 1: Use Favicon Generator
1. Create a simple logo/icon (can use the burgundy sign concept)
2. Visit https://favicon.io/favicon-generator/ or https://realfavicongenerator.net/
3. Upload your icon and generate all sizes
4. Download and place in the `public` directory

### Option 2: Simple Placeholder
For now, you can use a simple colored square:
- Create a 512x512 burgundy (#8B1538) square with "TC" text in gold (#FFD700)
- Use an image editor or online tool
- Save as PNG

### Option 3: Text-based Icon
Use an online tool like:
- https://www.favicon-generator.org/
- Create a simple text-based icon with "TC" or a cocktail glass emoji

## Current Status
The app will work without these icons, but users won't see a proper icon when adding to home screen.

The manifest is already linked in the root layout, so once you add the icon files, PWA functionality will be complete.
