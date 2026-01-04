"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { CartItem } from "./CartItem";
import { useState } from "react";
import { CheckoutModal } from "../checkout/CheckoutModal";

export function CartSidebar() {
    const { items, updateQuantity, removeItem, clearCart, getSubtotal, getTax, getTotal } =
        useCartStore();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const subtotal = getSubtotal();
    const tax = getTax();
    const total = getTotal();

    if (items.length === 0) {
        return (
            <Card className="h-full flex flex-col card-premium shadow-xl">
                <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-[hsl(var(--sabana-red))]/10 to-[hsl(var(--sabana-yellow))]/10">
                            <ShoppingCart className="h-5 w-5 text-[hsl(var(--sabana-red))]" />
                        </div>
                        Shopping Cart
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center animate-scale-in">
                        <div className="relative mb-6">
                            <ShoppingCart className="h-20 w-20 mx-auto text-muted-foreground/20" />
                            <div className="absolute inset-0 blur-2xl bg-[hsl(var(--sabana-red))]/10 animate-pulse" />
                        </div>
                        <p className="text-base font-semibold text-foreground mb-1">Your cart is empty</p>
                        <p className="text-sm text-muted-foreground">Add delicious items to get started</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="h-full flex flex-col card-premium shadow-xl">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-[hsl(var(--sabana-red))]/10 to-[hsl(var(--sabana-yellow))]/10">
                            <ShoppingCart className="h-5 w-5 text-[hsl(var(--sabana-red))]" />
                        </div>
                        Cart ({items.length})
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCart}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clear
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="space-y-0">
                        {items.map((item) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeItem}
                            />
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-4 pt-4 border-t border-gray-100">
                    <div className="w-full space-y-3">
                        <div className="flex justify-between text-xl font-bold">
                            <span>Total</span>
                            <span className="text-gradient">{formatCurrency(total)}</span>
                        </div>
                    </div>
                    <Button
                        className="w-full btn-modern btn-glow gradient-primary text-white font-bold text-base py-6 shadow-lg hover:shadow-2xl hover:shadow-[hsl(var(--sabana-red))]/30"
                        size="lg"
                        onClick={() => setIsCheckoutOpen(true)}
                    >
                        Proceed to Checkout
                    </Button>
                </CardFooter>
            </Card>

            <CheckoutModal
                open={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
                subtotal={subtotal}
                tax={tax}
                total={total}
                items={items}
            />
        </>
    );
}
