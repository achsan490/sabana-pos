-- Sabana Fried Chicken POS Database Schema

-- Products Table
-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(50) NOT NULL,
  icon VARCHAR(10),
  color VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL, -- Constraint removed to allow dynamic categories
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'qris', 'bank_transfer')),
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for order items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Insert Default Categories
INSERT INTO categories (slug, label, icon, color) VALUES
('chicken', 'Chicken', '🍗', 'bg-gradient-to-r from-sabana-red to-red-600 text-white shadow-lg'),
('rice', 'Rice', '🍚', 'bg-gradient-to-r from-sabana-yellow to-yellow-500 text-sabana-charcoal shadow-lg'),
('drinks', 'Drinks', '🥤', 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'),
('sides', 'Sides', '🍟', 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg')
ON CONFLICT (slug) DO NOTHING;

-- Sample Products Data
INSERT INTO products (name, description, price, category, image_url, available) VALUES
-- Chicken Items
('Original Fried Chicken', 'Crispy golden fried chicken with our secret recipe', 25000, 'chicken', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', true),
('Spicy Wings', 'Hot and spicy chicken wings with chili sauce', 30000, 'chicken', 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400', true),
('Chicken Nuggets', 'Tender chicken nuggets perfect for kids', 20000, 'chicken', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400', true),
('Crispy Chicken Burger', 'Juicy chicken patty in a soft bun', 35000, 'chicken', 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400', true),

-- Rice Dishes
('Nasi Goreng Special', 'Indonesian fried rice with chicken and egg', 28000, 'rice', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', true),
('Nasi Putih', 'Steamed white rice', 8000, 'rice', 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400', true),
('Nasi Ayam Geprek', 'Rice with smashed fried chicken and sambal', 32000, 'rice', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', true),

-- Drinks
('Iced Tea', 'Refreshing sweet iced tea', 8000, 'drinks', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', true),
('Coca Cola', 'Classic Coca Cola', 10000, 'drinks', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', true),
('Orange Juice', 'Fresh squeezed orange juice', 15000, 'drinks', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', true),
('Mineral Water', 'Bottled mineral water', 5000, 'drinks', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', true),

-- Sides
('French Fries', 'Crispy golden french fries', 15000, 'sides', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', true),
('Coleslaw', 'Fresh cabbage salad with creamy dressing', 12000, 'sides', 'https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?w=400', true),
('Corn on the Cob', 'Grilled sweet corn', 10000, 'sides', 'https://images.unsplash.com/photo-1551462147-37d3f9c6c4a5?w=400', true),
('Mashed Potato', 'Creamy mashed potatoes', 13000, 'sides', 'https://images.unsplash.com/photo-1585307812696-6d6c3a9c5f90?w=400', true)
ON CONFLICT DO NOTHING;
