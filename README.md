# Sabana Fried Chicken POS

A professional, high-performance Point of Sale (POS) web application built with Next.js, Tailwind CSS, and Supabase.

## Features

- 🍗 **Menu Grid**: Categorized food items (Chicken, Rice, Drinks, Sides)
- 🛒 **Cart System**: Real-time cart with quantity management
- 💳 **Checkout**: Multiple payment methods (Cash, QRIS, Bank Transfer)
- 📊 **Order History**: Dashboard view of previous transactions
- 🔍 **Search & Filter**: Fast search and category filtering
- 📱 **Responsive**: Optimized for iPad/Tablet use

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & Shadcn/UI
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

Run the SQL scripts in the `scripts` folder to set up your Supabase database tables.

## License

MIT
