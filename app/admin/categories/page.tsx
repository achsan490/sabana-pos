"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/app/actions/categories";
import { Category } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function CategoryManagementPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ slug: "", label: "", icon: "", color: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        const { data } = await getCategories();
        setCategories(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({ slug: category.slug, label: category.label, icon: category.icon, color: category.color });
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setFormData({ slug: "", label: "", icon: "", color: "" });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string, label: string) => {
        if (!confirm(`Are you sure you want to delete category "${label}"?`)) return;
        setLoading(true);
        await deleteCategory(id);
        fetchCategories();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Auto-generate slug from label
        const slug = formData.label.toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '-');    // Replace spaces with hyphens

        // Default icon and color if not provided (since we removed the inputs)
        const icon = "📦";
        const color = "bg-gray-800 text-white";

        const data = {
            slug,
            label: formData.label,
            icon,
            color,
        };

        try {
            if (editingCategory) {
                // Keep existing slug/icon/color if editing, unless we want to allow updating name to update slug?
                // For simplicity, let's just update label.
                const result = await updateCategory({
                    ...data,
                    id: editingCategory.id,
                    // If editing, preserve existing icon/color/slug if we aren't showing inputs?
                    // But the user said "simplified". Let's just update label.
                    // Wait, if I hide them, I can't edit them.
                    // Let's assume for new categories we default them.
                    // For editing, we might want to keep existing values.
                    slug: editingCategory.slug, // Don't change slug on edit to avoid breaking stuff
                    icon: editingCategory.icon || icon,
                    color: editingCategory.color || color
                });

                if (!result.success) {
                    alert(`Failed to update category: ${result.error}`);
                    setIsSubmitting(false);
                    return;
                }
            } else {
                const result = await createCategory(data);
                if (!result.success) {
                    alert(`Failed to create category: ${result.error}`);
                    setIsSubmitting(false);
                    return;
                }
            }

            setIsSubmitting(false);
            setIsFormOpen(false);
            fetchCategories();
            setFormData({ slug: "", label: "", icon: "", color: "" });
        } catch (error) {
            console.error(error);
            alert("An unexpected error occurred. Please check your connection or database.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-white/20 shadow-lg">
                <div className="container mx-auto px-4 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 animate-slide-up">
                            <Link href="/admin">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 rounded-xl hover:bg-[hsl(var(--sabana-red))]/10 hover:text-[hsl(var(--sabana-red))] transition-all duration-300 hover:scale-105"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-extrabold text-gradient">Category Management</h1>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Manage product categories
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleAddNew}
                            size="lg"
                            className="btn-modern btn-glow gradient-primary text-white font-bold shadow-lg hover:shadow-2xl hover:shadow-[hsl(var(--sabana-red))]/30 animate-slide-up"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            New Category
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <Card className="card-premium border-0 shadow-xl animate-slide-up">
                    <CardHeader className="border-b border-gray-100 pb-6">
                        <CardTitle className="text-2xl font-bold text-gradient">Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="text-center py-16">
                                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto" />
                                <p className="text-muted-foreground font-medium mt-4">Loading categories...</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Label</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-bold text-lg">{category.label}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => handleEdit(category)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => handleDelete(category.id, category.label)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Category Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? "Update category name." : "Enter the name for the new category."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category Name</label>
                            <Input
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                placeholder="e.g. Special Promo"
                                required
                                autoFocus
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {editingCategory ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
