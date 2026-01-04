-- Run this in Supabase SQL Editor

-- 1. Create the categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(50) NOT NULL,
  icon VARCHAR(10),
  color VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Remove the old strict categories restriction
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check; 

-- 3. Add some default categories
INSERT INTO categories (slug, label, icon, color) VALUES
('chicken', 'Chicken', '🍗', 'bg-gradient-to-r from-sabana-red to-red-600 text-white shadow-lg'),
('rice', 'Rice', '🍚', 'bg-gradient-to-r from-sabana-yellow to-yellow-500 text-sabana-charcoal shadow-lg'),
('drinks', 'Drinks', '🥤', 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'),
('sides', 'Sides', '🍟', 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg')
ON CONFLICT (slug) DO NOTHING;
