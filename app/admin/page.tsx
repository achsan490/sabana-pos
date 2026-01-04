"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductTable } from "@/components/admin/ProductTable";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAllProductsForAdmin } from "@/app/actions/admin-products";
import { getCategories } from "@/app/actions/categories";
import { Product, Category } from "@/lib/supabase";

export default function AdminPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const fetchProducts = async () => {
        setLoading(true);
        const data = await getAllProductsForAdmin();
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
    };

    const fetchCategories = async () => {
        const { data } = await getCategories();
        setCategories(data);
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
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

        setFilteredProducts(filtered);
    }, [products, selectedCategory, searchQuery]);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        fetchProducts();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-white/20 shadow-lg">
                <div className="container mx-auto px-4 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 animate-slide-up">
                            <Link href="/">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 rounded-xl hover:bg-[hsl(var(--sabana-red))]/10 hover:text-[hsl(var(--sabana-red))] transition-all duration-300 hover:scale-105"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-extrabold text-gradient">Admin Panel</h1>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Kelola menu produk Sabana Fried Chicken
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/admin/categories">
                                <Button
                                    variant="outline"
                                    className="border-[hsl(var(--sabana-red))]/20 text-[hsl(var(--sabana-red))] hover:bg-[hsl(var(--sabana-red))]/5"
                                >
                                    Manage Categories
                                </Button>
                            </Link>
                            <Button
                                onClick={handleAddNew}
                                size="lg"
                                className="btn-modern btn-glow gradient-primary text-white font-bold shadow-lg hover:shadow-2xl hover:shadow-[hsl(var(--sabana-red))]/30 animate-slide-up"
                                style={{ animationDelay: '0.1s' }}
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Tambah Produk
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <Card className="card-premium border-0 shadow-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <CardHeader className="border-b border-gray-100 pb-6">
                        <CardTitle className="text-2xl font-bold text-gradient mb-6">Daftar Produk</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-[hsl(var(--sabana-red))] transition-colors" />
                                <Input
                                    type="text"
                                    placeholder="Cari produk..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 h-12 text-base bg-white/80 backdrop-blur-sm border-gray-200/60 rounded-xl shadow-sm hover:shadow-md focus:shadow-lg focus:border-[hsl(var(--sabana-red))]/50 transition-all duration-300"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                <Button
                                    key="all"
                                    variant={selectedCategory === "all" ? "default" : "outline"}
                                    onClick={() => setSelectedCategory("all")}
                                    className={`flex-shrink-0 transition-all duration-300 rounded-xl px-5 py-2.5 font-semibold ${selectedCategory === "all"
                                        ? "gradient-primary text-white shadow-lg hover:shadow-xl border-0"
                                        : "bg-white/80 backdrop-blur-sm border-gray-200/60 hover:border-[hsl(var(--sabana-red))]/30 hover:bg-[hsl(var(--sabana-red))]/5 hover:scale-105 shadow-sm"
                                        }`}
                                >
                                    Semua
                                </Button>
                                {categories.map((category) => (
                                    <Button
                                        key={category.id}
                                        variant={
                                            selectedCategory === category.slug ? "default" : "outline"
                                        }
                                        onClick={() => setSelectedCategory(category.slug)}
                                        className={`flex-shrink-0 transition-all duration-300 rounded-xl px-5 py-2.5 font-semibold ${selectedCategory === category.slug
                                            ? "gradient-primary text-white shadow-lg hover:shadow-xl border-0"
                                            : "bg-white/80 backdrop-blur-sm border-gray-200/60 hover:border-[hsl(var(--sabana-red))]/30 hover:bg-[hsl(var(--sabana-red))]/5 hover:scale-105 shadow-sm"
                                            }`}
                                    >
                                        {category.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="text-center py-16">
                                <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-[hsl(var(--sabana-red))]/10 to-[hsl(var(--sabana-yellow))]/10 mb-4">
                                    <div className="h-12 w-12 border-4 border-[hsl(var(--sabana-red))]/30 border-t-[hsl(var(--sabana-red))] rounded-full animate-spin"></div>
                                </div>
                                <p className="text-muted-foreground font-medium">Memuat produk...</p>
                            </div>
                        ) : (
                            <ProductTable
                                products={filteredProducts}
                                onEdit={handleEdit}
                                onRefresh={fetchProducts}
                            />
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Product Form Modal */}
            <ProductForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                product={editingProduct}
                onSuccess={handleFormSuccess}
            />
        </div>
    );
}
