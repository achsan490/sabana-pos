import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Category {
    id: string;
    slug: string;
    label: string;
    icon: string;
    color: string;
    created_at: string;
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: string;
    image_url: string | null;
    available: boolean;
    created_at: string;
    updated_at: string;
}

export interface Order {
    id: string;
    order_number: string;
    subtotal: number;
    tax: number;
    total: number;
    payment_method: "cash" | "qris" | "bank_transfer";
    status: "completed" | "cancelled";
    amount_paid?: number;
    change_amount?: number;
    created_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    subtotal: number;
    created_at: string;
}

export interface OrderWithItems extends Order {
    order_items: OrderItem[];
}
