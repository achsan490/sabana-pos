# Sabana Fried Chicken POS - Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project

## Step 1: Install Dependencies

```bash
cd d:\project\E-Kasir\sabana-pos
npm install
```

## Step 2: Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once your project is ready, go to **Settings** → **API**
3. Copy your **Project URL** and **anon/public key**

## Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase credentials.

## Step 4: Set Up Database

1. In your Supabase project, go to the **SQL Editor**
2. Copy the contents of `scripts/schema.sql`
3. Paste and run the SQL script to create tables and seed sample data

The script will create:
- `products` table with sample menu items
- `orders` table for transaction records
- `order_items` table for order line items

## Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Test the Application

1. **Browse Menu**: View products by category (All, Chicken, Rice, Drinks, Sides)
2. **Search**: Use the search bar to find specific items
3. **Add to Cart**: Click "Add to Cart" on any product
4. **Manage Cart**: Adjust quantities or remove items in the cart sidebar
5. **Checkout**: Click "Checkout" and select a payment method
6. **View Orders**: Click "Order History" to see completed transactions

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## Customization

### Adding New Products

Add products directly in Supabase:
1. Go to **Table Editor** → **products**
2. Click **Insert row**
3. Fill in: name, description, price, category, image_url

### Changing Colors

Edit `tailwind.config.ts` to customize the Sabana branding colors:
- `sabana-red`: Primary brand color
- `sabana-yellow`: Accent color
- `sabana-charcoal`: Dark text color

### Tax Rate

The tax rate is set to 10% in `store/cart-store.ts`. Change the `TAX_RATE` constant to adjust.

## Troubleshooting

### Build Errors

If you encounter build errors, ensure:
1. All environment variables are set correctly
2. Supabase database is accessible
3. Run `npm install` to ensure all dependencies are installed

### Database Connection Issues

- Check that your Supabase project is active
- Verify the URL and anon key are correct
- Ensure your IP is not blocked in Supabase settings

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
