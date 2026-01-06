"use server";

import { supabase } from "@/lib/supabase";

export async function getOrderByNumber(orderNumber: string) {
    try {
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("order_number", orderNumber)
            .single();

        if (orderError || !order) {
            return { success: false, error: "Pesanan tidak ditemukan" };
        }

        const { data: items, error: itemsError } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", order.id);

        if (itemsError) {
            return { success: false, error: "Gagal mengambil detail pesanan" };
        }

        return {
            success: true,
            order: { ...order, order_items: items || [] }
        };
    } catch (error) {
        console.error("Error in getOrderByNumber:", error);
        return { success: false, error: "Terjadi kesalahan sistem" };
    }
}
