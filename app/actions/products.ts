"use server";

import { supabase, type Product } from "@/lib/supabase";

export async function getProducts(): Promise<Product[]> {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("available", true)
            .order("name");

        if (error) {
            console.error("Error fetching products:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Error in getProducts:", error);
        return [];
    }
}

export async function getProductsByCategory(
    category: string
): Promise<Product[]> {
    try {
        if (category === "all") {
            return getProducts();
        }

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("category", category)
            .eq("available", true)
            .order("name");

        if (error) {
            console.error("Error fetching products by category:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Error in getProductsByCategory:", error);
        return [];
    }
}

export async function searchProducts(query: string): Promise<Product[]> {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("available", true)
            .ilike("name", `%${query}%`)
            .order("name");

        if (error) {
            console.error("Error searching products:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Error in searchProducts:", error);
        return [];
    }
}
