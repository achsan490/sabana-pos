"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product, Category } from "@/lib/supabase";
import { createProduct, updateProduct } from "@/app/actions/admin-products";
import { getCategories } from "@/app/actions/categories";

interface ProductFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product | null;
    onSuccess: () => void;
}

export function ProductForm({
    open,
    onOpenChange,
    product,
    onSuccess,
}: ProductFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image_url: "",
        available: true,
    });

    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await getCategories();
            setCategories(data);
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description || "",
                price: product.price.toString(),
                category: product.category,
                image_url: product.image_url || "",
                available: product.available,
            });
        } else {
            setFormData({
                name: "",
                description: "",
                price: "",
                category: "",
                image_url: "",
                available: true,
            });
        }
    }, [product, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            alert("Nama dan harga harus diisi!");
            return;
        }

        const price = parseFloat(formData.price);
        if (isNaN(price) || price <= 0) {
            alert("Harga harus berupa angka positif!");
            return;
        }

        setIsSubmitting(true);

        const data = {
            name: formData.name,
            description: formData.description || undefined,
            price,
            category: formData.category,
            image_url: formData.image_url || undefined,
            available: formData.available,
        };

        let result;
        if (product) {
            result = await updateProduct({ ...data, id: product.id });
        } else {
            result = await createProduct(data);
        }

        setIsSubmitting(false);

        if (result.success) {
            onSuccess();
            onOpenChange(false);
        } else {
            alert(`Gagal menyimpan produk: ${result.error}`);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {product ? "Edit Produk" : "Tambah Produk Baru"}
                        </DialogTitle>
                        <DialogDescription>
                            {product
                                ? "Ubah informasi produk di bawah ini"
                                : "Isi form di bawah untuk menambah produk baru"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Nama Produk <span className="text-destructive">*</span>
                            </label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Contoh: Ayam Goreng Original"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">
                                Deskripsi
                            </label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Deskripsi singkat produk"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="price" className="text-sm font-medium">
                                    Harga (Rp) <span className="text-destructive">*</span>
                                </label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, price: e.target.value })
                                    }
                                    placeholder="25000"
                                    min="0"
                                    step="1000"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-medium">
                                    Kategori <span className="text-destructive">*</span>
                                </label>
                                <select
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            category: e.target.value,
                                        })
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="" disabled>Pilih Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.slug}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="image_url" className="text-sm font-medium">
                                URL Gambar
                            </label>
                            <Input
                                id="image_url"
                                value={formData.image_url}
                                onChange={(e) =>
                                    setFormData({ ...formData, image_url: e.target.value })
                                }
                                placeholder="https://example.com/image.jpg"
                                type="url"
                            />
                            <p className="text-xs text-muted-foreground">
                                Opsional. Gunakan URL gambar dari Unsplash atau sumber lain.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : product ? (
                                "Simpan Perubahan"
                            ) : (
                                "Tambah Produk"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
