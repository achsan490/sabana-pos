"use server";

import { supabase, type Order, type OrderWithItems } from "@/lib/supabase";
import { CartItem } from "@/store/cart-store";

interface CreateOrderData {
    orderNumber: string;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: "cash" | "qris" | "bank_transfer";
    items: CartItem[];
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    status?: "completed" | "pending";
}

export async function createOrder(
    orderData: CreateOrderData
): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
        // Insert order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                order_number: orderData.orderNumber,
                subtotal: orderData.subtotal,
                tax: orderData.tax,
                total: orderData.total,
                customer_name: orderData.customerName,
                customer_phone: orderData.customerPhone,
                customer_address: orderData.customerAddress,
                payment_method: orderData.paymentMethod,
                status: orderData.status || "completed",
            })
            .select()
            .single();

        if (orderError || !order) {
            console.error("Error creating order:", orderError);
            return { success: false, error: orderError?.message || "Failed to create order" };
        }

        // Insert order items
        const orderItems = orderData.items.map((item) => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            product_price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
        }));

        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItems);

        if (itemsError) {
            console.error("Error creating order items:", itemsError);
            return { success: false, error: itemsError.message };
        }

        return { success: true, orderId: order.id };
    } catch (error) {
        console.error("Error in createOrder:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function getOrders(limit: number = 50): Promise<OrderWithItems[]> {
    try {
        const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (ordersError || !orders) {
            console.error("Error fetching orders:", ordersError);
            return [];
        }

        // Fetch order items for each order
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const { data: items, error: itemsError } = await supabase
                    .from("order_items")
                    .select("*")
                    .eq("order_id", order.id);

                if (itemsError) {
                    console.error("Error fetching order items:", itemsError);
                    return { ...order, order_items: [] };
                }

                return { ...order, order_items: items || [] };
            })
        );

        return ordersWithItems;
    } catch (error) {
        console.error("Error in getOrders:", error);
        return [];
    }
}

export async function getOrderById(id: string): Promise<OrderWithItems | null> {
    try {
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", id)
            .single();

        if (orderError || !order) {
            console.error("Error fetching order:", orderError);
            return null;
        }

        const { data: items, error: itemsError } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", id);

        if (itemsError) {
            console.error("Error fetching order items:", itemsError);
            return { ...order, order_items: [] };
        }

        return { ...order, order_items: items || [] };
    } catch (error) {
        console.error("Error in getOrderById:", error);
        return null;
    }
}

export async function deleteOrder(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Delete order items first (if cascade delete is not set up in DB)
        const { error: itemsError } = await supabase
            .from("order_items")
            .delete()
            .eq("order_id", id);

        if (itemsError) {
            console.error("Error deleting order items:", itemsError);
            return { success: false, error: "Failed to delete order items" };
        }

        // Delete the order
        const { error: orderError } = await supabase
            .from("orders")
            .delete()
            .eq("id", id);

        if (orderError) {
            console.error("Error deleting order:", orderError);
            return { success: false, error: "Failed to delete order" };
        }

        return { success: true };
    } catch (error) {
        console.error("Error in deleteOrder:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function deleteOrders(ids: string[]): Promise<{ success: boolean; error?: string }> {
    try {
        // Delete order items first
        const { error: itemsError } = await supabase
            .from("order_items")
            .delete()
            .in("order_id", ids);

        if (itemsError) {
            console.error("Error deleting order items:", itemsError);
            return { success: false, error: "Failed to delete order items" };
        }

        // Delete the orders
        const { error: ordersError } = await supabase
            .from("orders")
            .delete()
            .in("id", ids);

        if (ordersError) {
            console.error("Error deleting orders:", ordersError);
            return { success: false, error: "Failed to delete orders" };
        }

        return { success: true };
    } catch (error) {
        console.error("Error in deleteOrders:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function updateOrderStatus(
    id: string,
    status: "completed" | "cancelled" | "pending"
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from("orders")
            .update({ status })
            .eq("id", id);

        if (error) {
            console.error("Error updating order status:", error);
            return { success: false, error: "Failed to update order status" };
        }

        return { success: true };
    } catch (error) {
        console.error("Error in updateOrderStatus:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
