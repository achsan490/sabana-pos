import { OrderWithItems } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";

import { PAYMENT_CONFIG } from "@/lib/payment-config";

interface ReceiptProps {
    order: OrderWithItems | null;
}

export function Receipt({ order }: ReceiptProps) {
    if (!order) return null;

    return (
        <div id="printable-receipt" className="hidden bg-white p-4 max-w-[80mm] mx-auto text-black">
            <div className="text-center mb-4">
                <h1 className="text-xl font-bold uppercase tracking-wider">{PAYMENT_CONFIG.store.name}</h1>
                <p className="text-xs">{PAYMENT_CONFIG.store.address}</p>
                <p className="text-xs">Telp: {PAYMENT_CONFIG.store.phone}</p>
            </div>

            <div className="border-t border-b border-black border-dashed py-2 my-2 text-xs font-mono">
                <div className="flex justify-between">
                    <span>Order #:</span>
                    <span>{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Pay:</span>
                    <span className="uppercase">{order.payment_method.replace('_', ' ')}</span>
                </div>
            </div>

            <div className="space-y-2 text-sm font-mono mb-4">
                {order.order_items.map((item) => (
                    <div key={item.id} className="flex flex-col">
                        <span className="font-bold">{item.product_name}</span>
                        <div className="flex justify-between pl-2">
                            <span>{item.quantity} x {formatCurrency(item.product_price)}</span>
                            <span>{formatCurrency(item.subtotal)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-black border-dashed pt-2 text-sm font-bold font-mono">
                <div className="flex justify-between mb-1">
                    <span>TOTAL</span>
                    <span>{formatCurrency(order.total)}</span>
                </div>
                {order.amount_paid && (
                    <div className="flex justify-between text-xs font-normal">
                        <span>Cash Payment</span>
                        <span>{formatCurrency(order.amount_paid)}</span>
                    </div>
                )}
                {order.change_amount && (
                    <div className="flex justify-between text-xs font-normal">
                        <span>Change</span>
                        <span>{formatCurrency(order.change_amount)}</span>
                    </div>
                )}
            </div>

            <div className="text-center mt-6 text-xs font-mono">
                <p>*** THANK YOU ***</p>
                <p>Please come again!</p>
            </div>
        </div>
    );
}
