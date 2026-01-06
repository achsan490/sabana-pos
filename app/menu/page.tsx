"use client";

import { useState, useEffect, useMemo } from "react";
import { ShoppingBag, Search, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/menu/ProductCard";
import { CategoryFilter } from "@/components/menu/CategoryFilter";
import { SearchBar } from "@/components/menu/SearchBar";
import { getProducts } from "@/app/actions/products";
import { Product } from "@/lib/supabase";
import { useCartStore } from "@/store/cart-store";
import { CustomerCheckoutModal } from "@/components/customer/CustomerCheckoutModal";
import { Badge } from "@/components/ui/badge";
import Link from "next/link"; // Import Link
import { formatCurrency } from "@/lib/utils"; // Import formatCurrency

export default function CustomerMenuPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Cart State
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const { items, getTotal } = useCartStore();
    const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = getTotal();

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const data = await getProducts();
            setProducts(data);
            setLoading(false);
        }
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (selectedCategory !== "all") {
            filtered = filtered.filter((p) => p.category === selectedCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [products, selectedCategory, searchQuery]);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Mobile Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ff1a1a] via-[#d90429] to-[#c1121f] flex items-center justify-center text-white shadow-md">
                            <span className="font-[family-name:var(--font-lilita)] text-lg pt-1">SFC</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">Sabana Delivery</h1>
                            <p className="text-xs text-muted-foreground">Order delicious food online</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 max-w-3xl">
                {/* Hero / Promo Banner */}
                <div className="bg-gradient-to-r from-[#ff1a1a] to-[#d90429] rounded-2xl p-6 text-white mb-8 shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2">Lapar? Pesan Sekarang! 🍗</h2>
                        <p className="text-white/90 text-sm max-w-[80%]">Nikmati ayam goreng Sabana favoritmu, diantar langsung ke depan pintu rumah.</p>
                    </div>
                    <div className="absolute right-[-20px] bottom-[-40px] opacity-20 transform rotate-12">
                        <UtensilsCrossed className="w-40 h-40" />
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="sticky top-[65px] z-40 bg-gray-50/95 backdrop-blur-sm -mx-4 px-4 py-2 space-y-4 shadow-sm transition-all">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                    <CategoryFilter
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                    />
                </div>

                {/* Product Grid */}
                <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-4">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm animate-pulse">
                                <Skeleton className="h-24 w-24 rounded-lg bg-gray-200" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-3/4 rounded bg-gray-200" />
                                    <Skeleton className="h-4 w-1/2 rounded bg-gray-200" />
                                    <Skeleton className="h-8 w-1/3 rounded bg-gray-200 mt-2" />
                                </div>
                            </div>
                        ))
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full py-12 text-center">
                            <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-900">Belum ada menu</p>
                            <p className="text-gray-500">Coba cari kata kunci lain</p>
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </div>
            </main>

            {/* Floating Cart Button */}
            {items.length > 0 && (
                <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 px-3 sm:px-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="container mx-auto max-w-3xl">
                        <Button
                            onClick={() => setIsCheckoutOpen(true)}
                            size="lg"
                            className="w-full justify-between bg-gray-900 hover:bg-gray-800 text-white rounded-xl sm:rounded-2xl shadow-xl py-3 sm:py-6 h-auto border-t-2 border-white/10"
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="bg-[hsl(var(--sabana-red))] text-white font-bold h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs sm:text-sm shadow-lg">
                                    {cartItemCount}
                                </div>
                                <div className="flex flex-col items-start gap-0.5">
                                    <span className="text-xs sm:text-sm text-gray-300 font-medium">Total Pembayaran</span>
                                    <span className="font-bold text-sm sm:text-lg leading-none">{formatCurrency(cartTotal)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 font-semibold text-sm sm:text-base">
                                Checkout
                                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                        </Button>
                    </div>
                </div>
            )}

            <CustomerCheckoutModal
                open={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
            />
        </div>
    );
}
