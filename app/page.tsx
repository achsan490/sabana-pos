"use client";

import { useState, useEffect, useMemo } from "react";
import { History, ShoppingBag, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/menu/ProductCard";
import { CategoryFilter } from "@/components/menu/CategoryFilter";
import { SearchBar } from "@/components/menu/SearchBar";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { getProducts } from "@/app/actions/products";
import { Product } from "@/lib/supabase";

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

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

        // Filter by category
        if (selectedCategory !== "all") {
            filtered = filtered.filter((p) => p.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [products, selectedCategory, searchQuery]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-white/20 shadow-lg transition-all duration-300">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 animate-slide-up">
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-[#ff1a1a] via-[#d90429] to-[#c1121f] flex items-center justify-center text-white shadow-lg shadow-red-600/40 group-hover:shadow-xl group-hover:shadow-red-600/50 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 border-2 border-white/20">
                                    <span className="font-[family-name:var(--font-lilita)] text-2xl tracking-wider drop-shadow-md pt-1">SFC</span>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-extrabold text-gradient group-hover:opacity-80 transition-opacity">
                                        Sabana Fried Chicken
                                    </h1>
                                    <p className="text-xs text-muted-foreground font-medium tracking-wide">Premium POS System</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <Link href="/admin">
                                <Button variant="outline" size="lg" className="rounded-xl border-gray-200/50 hover:border-[hsl(var(--sabana-red))]/30 hover:bg-[hsl(var(--sabana-red))]/5 text-muted-foreground hover:text-[hsl(var(--sabana-red))] transition-all duration-300">
                                    <Settings className="mr-2 h-5 w-5" />
                                    Admin
                                </Button>
                            </Link>
                            <Link href="/orders">
                                <Button variant="outline" size="lg" className="rounded-xl border-gray-200/50 hover:border-[hsl(var(--sabana-yellow))]/50 hover:bg-[hsl(var(--sabana-yellow))]/10 text-muted-foreground hover:text-[hsl(var(--sabana-yellow-dark))] transition-all duration-300">
                                    <History className="mr-2 h-5 w-5" />
                                    History
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_400px] gap-8">
                    {/* Menu Section */}
                    <div className="space-y-8">
                        {/* Hero / Search Section */}
                        <div className="relative rounded-3xl p-8 overflow-hidden animate-slide-up bg-gradient-to-br from-[hsl(var(--sabana-red))]/5 via-white to-[hsl(var(--sabana-yellow))]/5 border border-[hsl(var(--sabana-red))]/10 shadow-xl shadow-[hsl(var(--sabana-red))]/5 group">
                            {/* Organic Background Shapes */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[hsl(var(--sabana-red))]/10 rounded-full blur-3xl group-hover:bg-[hsl(var(--sabana-red))]/15 transition-colors duration-700" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[hsl(var(--sabana-yellow))]/10 rounded-full blur-3xl group-hover:bg-[hsl(var(--sabana-yellow))]/15 transition-colors duration-700" />

                            <div className="relative z-10 space-y-6">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">
                                        <span className="text-gradient">Delicious Menu</span>
                                        <span className="ml-2">🍗</span>
                                    </h2>
                                    <p className="text-muted-foreground text-lg">Select items to add to the customer's order.</p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-end">
                                    <div className="md:col-span-2">
                                        <SearchBar value={searchQuery} onChange={setSearchQuery} />
                                    </div>
                                    <div className="bg-white/50 p-2 rounded-xl border border-gray-100 backdrop-blur-sm self-stretch flex items-center justify-center">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {filteredProducts.length} Items Found
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="animate-slide-up sticky top-[88px] z-30 pt-2 pb-4 bg-background/80 backdrop-blur-xl -mx-4 px-4 lg:mx-0 lg:px-0 lg:bg-transparent lg:backdrop-blur-none lg:static" style={{ animationDelay: '0.2s' }}>
                            <CategoryFilter
                                selectedCategory={selectedCategory}
                                onCategoryChange={setSelectedCategory}
                            />
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="space-y-4 animate-pulse">
                                        <Skeleton className="aspect-square w-full rounded-3xl bg-gray-200/50" />
                                        <div className="space-y-2 px-2">
                                            <Skeleton className="h-6 w-3/4 rounded-lg bg-gray-200/50" />
                                            <Skeleton className="h-4 w-1/2 rounded-lg bg-gray-200/50" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center animate-scale-in bg-white/40 rounded-3xl border border-dashed border-gray-200">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-[hsl(var(--sabana-red))]/20 blur-2xl rounded-full animate-pulse" />
                                    <ShoppingBag className="relative h-24 w-24 text-[hsl(var(--sabana-red))]/40" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-foreground">No menu items found</h3>
                                <p className="text-muted-foreground max-w-sm text-lg">
                                    We couldn't find anything matching "{searchQuery}". Try a different search term.
                                </p>
                                <Button
                                    variant="link"
                                    onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                                    className="mt-4 text-[hsl(var(--sabana-red))]"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20 md:pb-0">
                                {filteredProducts.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="animate-slide-up"
                                        style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                                    >
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart Sidebar container */}
                    <div className="md:sticky md:top-28 h-fit animate-slide-up z-40" style={{ animationDelay: '0.4s' }}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--sabana-red))]/5 to-[hsl(var(--sabana-yellow))]/5 blur-xl -z-10 rounded-3xl transform translate-y-4 scale-95 opacity-50" />
                            <CartSidebar />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
