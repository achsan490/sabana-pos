"use server";

import { supabase, type Category } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface CreateCategoryData {
    slug: string;
    label: string;
    icon?: string;
    color?: string;
}

export interface UpdateCategoryData extends CreateCategoryData {
    id: string;
}

export async function getCategories(): Promise<{ data: Category[]; error?: string }> {
    try {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("label");

        if (error) {
            console.error("Error fetching categories:", error);
            return { data: [], error: error.message };
        }

        return { data: data || [] };
    } catch (error: any) {
        console.error("Error in getCategories:", error);
        return { data: [], error: error.message || "An unexpected error occurred" };
    }
}

export async function createCategory(
    data: CreateCategoryData
): Promise<{ success: boolean; error?: string; category?: Category }> {
    try {
        const { data: category, error } = await supabase
            .from("categories")
            .insert({
                slug: data.slug.toLowerCase().replace(/\s+/g, '-'),
                label: data.label,
                icon: data.icon || "📦",
                color: data.color || "bg-gray-500 text-white",
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating category:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/");
        revalidatePath("/admin");

        return { success: true, category: category as Category };
    } catch (error) {
        console.error("Error in createCategory:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function updateCategory(
    data: UpdateCategoryData
): Promise<{ success: boolean; error?: string; category?: Category }> {
    try {
        const { data: category, error } = await supabase
            .from("categories")
            .update({
                slug: data.slug.toLowerCase().replace(/\s+/g, '-'),
                label: data.label,
                icon: data.icon,
                color: data.color,
            })
            .eq("id", data.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating category:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/");
        revalidatePath("/admin");

        return { success: true, category: category as Category };
    } catch (error) {
        console.error("Error in updateCategory:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function deleteCategory(
    id: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.from("categories").delete().eq("id", id);

        if (error) {
            console.error("Error deleting category:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/");
        revalidatePath("/admin");

        return { success: true };
    } catch (error) {
        console.error("Error in deleteCategory:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
