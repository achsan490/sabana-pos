"use server";

import { supabase, type Product } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

interface CreateProductData {
    name: string;
    description?: string;
    price: number;
    category: string;
    image_url?: string;
    available?: boolean;
}

interface UpdateProductData extends CreateProductData {
    id: string;
}

export async function createProduct(
    data: CreateProductData
): Promise<{ success: boolean; error?: string; product?: Product }> {
    try {
        const { data: product, error } = await supabase
            .from("products")
            .insert({
                name: data.name,
                description: data.description || null,
                price: data.price,
                category: data.category,
                image_url: data.image_url || null,
                available: data.available ?? true,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating product:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/");
        revalidatePath("/admin");

        return { success: true, product: product as Product };
    } catch (error) {
        console.error("Error in createProduct:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function updateProduct(
    data: UpdateProductData
): Promise<{ success: boolean; error?: string; product?: Product }> {
    try {
        const { data: product, error } = await supabase
            .from("products")
            .update({
                name: data.name,
                description: data.description || null,
                price: data.price,
                category: data.category,
                image_url: data.image_url || null,
                available: data.available ?? true,
                updated_at: new Date().toISOString(),
            })
            .eq("id", data.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating product:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/");
        revalidatePath("/admin");

        return { success: true, product: product as Product };
    } catch (error) {
        console.error("Error in updateProduct:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function deleteProduct(
    id: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.from("products").delete().eq("id", id);

        if (error) {
            console.error("Error deleting product:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/");
        revalidatePath("/admin");

        return { success: true };
    } catch (error) {
        console.error("Error in deleteProduct:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function toggleProductAvailability(
    id: string,
    available: boolean
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from("products")
            .update({ available, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (error) {
            console.error("Error toggling product availability:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/");
        revalidatePath("/admin");

        return { success: true };
    } catch (error) {
        console.error("Error in toggleProductAvailability:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function getAllProductsForAdmin(): Promise<Product[]> {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching products:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Error in getAllProductsForAdmin:", error);
        return [];
    }
}
