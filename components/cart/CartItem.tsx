"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { CartItem as CartItemType } from "@/store/cart-store";

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
    return (
        <div className="flex gap-3 py-3 border-b last:border-0 animate-fade-in">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                {item.image_url ? (
                    <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-sabana-red/20 to-sabana-yellow/20">
                        <span className="text-2xl">🍗</span>
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                <p className="text-sm text-primary font-semibold">
                    {formatCurrency(item.price)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                        onClick={() => onRemove(item.id)}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>
            <div className="text-right">
                <p className="font-semibold text-sm">
                    {formatCurrency(item.price * item.quantity)}
                </p>
            </div>
        </div>
    );
}
