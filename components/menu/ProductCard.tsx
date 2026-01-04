"use client";

import Image from "next/image";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Product } from "@/lib/supabase";

interface ProductCardProps {
    product: Product;
}

const categoryColors: Record<string, string> = {
    chicken: "bg-gradient-to-r from-sabana-red to-red-600 text-white shadow-lg",
    rice: "bg-gradient-to-r from-sabana-yellow to-yellow-500 text-sabana-charcoal shadow-lg",
    drinks: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg",
    sides: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg",
};

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url || undefined,
        });
    };

    return (
        <Card className="group card-premium overflow-hidden border-0 hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl">
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {product.image_url ? (
                    <>
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-all duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* Enhanced Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center gradient-mesh">
                        <span className="text-7xl animate-float drop-shadow-lg">🍗</span>
                    </div>
                )}
                <Badge
                    className={`absolute top-4 right-4 ${categoryColors[product.category] || "bg-gray-800 text-white"
                        } border-0 px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-xl backdrop-blur-sm`}
                >
                    {product.category}
                </Badge>
            </div>
            <CardContent className="p-6 space-y-3">
                <h3 className="font-bold text-xl mb-2 line-clamp-1 text-gray-900 group-hover:text-[hsl(var(--sabana-red))] transition-colors duration-300">
                    {product.name}
                </h3>
                {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                )}
                <div className="flex items-center gap-2 pt-2">
                    <p className="text-3xl font-black text-gradient drop-shadow-sm">
                        {formatCurrency(product.price)}
                    </p>
                    <Sparkles className="h-5 w-5 text-[hsl(var(--sabana-yellow))] animate-pulse drop-shadow-lg" />
                </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
                <Button
                    onClick={handleAddToCart}
                    className="w-full btn-modern btn-glow gradient-primary text-white font-bold text-base py-6 shadow-lg hover:shadow-2xl hover:shadow-[hsl(var(--sabana-red))]/30"
                    size="lg"
                >
                    <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90 duration-500" />
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    );
}
