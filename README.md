# The Connerseur

A production-quality cocktail menu and ordering system with real-time bartender dashboard. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Guest Menu**: Mobile-friendly cocktail menu with 15+ drinks
- **Shopping Cart**: Add multiple drinks with custom notes and preferences
- **Real-time Orders**: Orders appear instantly on the bartender dashboard
- **Order Tracking**: Guests can view their order status in real-time
- **Bartender Dashboard**: Three-column kanban board (New → In Progress → Completed)
- **Sound Notifications**: Audio alert + toast + vibration when new orders arrive
- **Name Autocomplete**: Remembers past guest names for faster checkout
- **Community History**: Public page showing popular drinks and recent orders
- **Custom Orders**: Guests can request drinks not on the menu
- **PWA Support**: Add to home screen for app-like experience

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Hosting**: Vercel (free tier)
- **Real-time**: Supabase Realtime subscriptions
- **State**: React Context + localStorage

## Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Vercel account (free tier, for deployment)

## Local Development Setup

### 1. Install Dependencies

```bash
cd the-connerseur
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to **Project Settings > API** and copy:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key (keep this secure!)

3. Run the database migrations:
   - Go to **SQL Editor** in your Supabase dashboard
   - Open `supabase/migrations/20240001_initial_schema.sql`
   - Copy and paste the SQL into the editor
   - Click **Run**
   - Repeat for `supabase/migrations/20240002_seed_menu.sql`

4. Enable Realtime for tables:
   - Go to **Database > Replication**
   - Enable replication for `orders` and `order_items` tables
   - Click **0 tables** → select both tables → click **Save**

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Bartender Dashboard Security
BARTENDER_DASH_KEY=your-secret-key-here
```

**Important**:
- Replace `your-secret-key-here` with a strong, random string
- Never commit `.env.local` to Git

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 to view the guest menu.

### 5. Access Bartender Dashboard

The bartender dashboard requires a secret key. Access it at:

```
http://localhost:3000/bartender?key=your-secret-key-here
```

Replace `your-secret-key-here` with the value you set in `.env.local`.

## Project Structure

```
the-connerseur/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── menu/                 # GET menu items
│   │   ├── orders/               # POST create, GET list orders
│   │   │   └── [id]/            # GET/PATCH specific order
│   │   └── guests/search/       # GET name autocomplete
│   ├── cart/                     # Cart and checkout page
│   ├── order/[id]/              # Order status page
│   ├── bartender/               # Bartender dashboard
│   ├── history/                 # Community order history
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Guest menu (home)
├── components/                   # React components
│   ├── Logo.tsx                 # Marquee sign branding
│   ├── DrinkCard.tsx            # Menu item card
│   ├── CartItem.tsx             # Cart line item
│   ├── CustomDrinkModal.tsx     # Custom order form
│   ├── NameAutocomplete.tsx     # Name input with suggestions
│   └── OrderCard.tsx            # Bartender order display
├── lib/                         # Utilities and hooks
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   └── server.ts            # Server client
│   ├── hooks/
│   │   ├── useCart.ts           # Cart state management
│   │   ├── useRealtimeOrders.ts # Real-time subscriptions
│   │   └── useNameAutocomplete.ts # Name suggestions
│   └── utils/
│       ├── auth.ts              # Bartender key validation
│       └── formatters.ts        # Date/time formatting
├── types/
│   └── index.ts                 # TypeScript interfaces
├── supabase/migrations/         # Database migrations
│   ├── 20240001_initial_schema.sql
│   └── 20240002_seed_menu.sql
└── public/                      # Static assets
    ├── sounds/                  # Notification sound
    └── manifest.json            # PWA manifest
```

## Database Schema

### Tables

**menu_items**
- `id` (UUID, PK)
- `name`, `description`, `ingredients` (TEXT)
- `category` (TEXT) - e.g., "Cocktails", "Wine", "Spirits"
- `is_active` (BOOLEAN)
- `sort_order` (INTEGER)
- `created_at` (TIMESTAMPTZ)

**orders**
- `id` (UUID, PK)
- `guest_name` (TEXT)
- `group_name` (TEXT, nullable)
- `status` (TEXT) - 'new', 'in_progress', 'completed', 'cancelled'
- `created_at`, `updated_at` (TIMESTAMPTZ)

**order_items**
- `id` (UUID, PK)
- `order_id` (FK → orders.id)
- `menu_item_id` (FK → menu_items.id, nullable)
- `item_name` (TEXT) - snapshot of name
- `quantity` (INTEGER)
- `notes` (TEXT, nullable)
- `is_custom` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/the-connerseur.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com and sign in
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure environment variables:
   - Add all variables from `.env.local`
   - Make sure to use the **same** Supabase project credentials
5. Click **Deploy**

### 3. Add Environment Variables

In Vercel dashboard:
- Go to **Settings > Environment Variables**
- Add each variable from `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `BARTENDER_DASH_KEY`

### 4. Get Your Production URL

After deployment, you'll get a URL like:
```
https://the-connerseur.vercel.app
```

## Creating a QR Code

### Option 1: Online QR Code Generator
1. Visit https://www.qr-code-generator.com/
2. Paste your production URL: `https://the-connerseur.vercel.app`
3. Customize color scheme (burgundy/gold to match branding)
4. Download as PNG or PDF
5. Print and display at your bar/event

### Option 2: Dynamic QR Code (Recommended)
1. Use https://www.qrcode-monkey.com/
2. Enter your URL
3. Add a logo/icon (optional)
4. Choose colors: burgundy background (#8B1538), gold foreground (#FFD700)
5. Download high-resolution PNG

### Tips:
- Test the QR code before printing
- Make it large enough to scan from a distance (~3x3 inches minimum)
- Place in good lighting
- Consider printing multiple copies for different locations

## Sharing the Link

### Via Text/Email
Simply share your production URL:
```
Order drinks at: https://the-connerseur.vercel.app
```

### Social Media
Create a short message:
```
🍹 Welcome to The Connerseur!
Browse our menu and order drinks: [your-url]
```

### Shortened URL (Optional)
Use https://bit.ly or https://tinyurl.com to create a memorable short link:
- Original: `https://the-connerseur.vercel.app`
- Shortened: `https://bit.ly/connerseur`

## Accessing the Bartender Dashboard

The bartender dashboard is protected by a secret key. To access:

```
https://your-url.vercel.app/bartender?key=YOUR_SECRET_KEY
```

**Security Notes**:
- Never share this link publicly
- Bookmark it on the bartender's device (iPad, etc.)
- Change the `BARTENDER_DASH_KEY` if compromised
- The key is validated server-side for security

## Adding Notification Sound

The bartender dashboard needs a notification sound file:

1. Get a short (100-500ms) notification sound:
   - Download from https://mixkit.co/free-sound-effects/notification/
   - Or create one at https://www.beepbox.co/

2. Save as `notification.mp3`

3. Place in `public/sounds/notification.mp3`

See `public/sounds/SOUND_NOTE.md` for more details.

## Adding PWA Icons

For "Add to Home Screen" functionality:

1. Create two icon files:
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)

2. Place in `public/` directory

3. Use the burgundy/gold color scheme to match branding

See `public/ICONS_NOTE.md` for more details.

## Customization

### Adding/Editing Menu Items

1. Go to Supabase **Table Editor**
2. Open the `menu_items` table
3. Add, edit, or deactivate items
4. Changes appear immediately on the site

### Changing Branding Colors

Edit `tailwind.config.ts`:
```typescript
colors: {
  burgundy: {
    DEFAULT: '#8B1538',  // Change this
    dark: '#6B0F2A',
    light: '#A8234D',
  },
  // ...
}
```

## Troubleshooting

### Orders not appearing on dashboard
- Check Supabase Realtime is enabled for `orders` and `order_items`
- Verify environment variables are correct
- Check browser console for errors

### Name autocomplete not working
- Ensure there are some completed orders in the database
- Check network tab for API errors

### Sound not playing
- Ensure `notification.mp3` exists in `public/sounds/`
- Check browser allows audio autoplay
- Try clicking the page first (some browsers require user interaction)

### "Not Authorized" on bartender dashboard
- Verify the `?key=` parameter matches `BARTENDER_DASH_KEY`
- Check environment variables are set correctly
- Re-deploy if you changed the key

## Free Tier Limits

### Supabase (Free Tier)
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth/month
- 50,000 monthly active users

This should be plenty for personal/small event use.

### Vercel (Free Tier)
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic SSL

## Contributing

This is a personal project, but feel free to fork and customize for your own use!

## License

MIT - Feel free to use and modify for your own events and gatherings.

## Support

For issues or questions, check the code comments or create an issue on GitHub.

---

**Enjoy The Connerseur! 🍸**
