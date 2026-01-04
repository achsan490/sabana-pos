"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCategories } from "@/app/actions/categories";
import { Category } from "@/lib/supabase";

interface CategoryFilterProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}

export function CategoryFilter({
    selectedCategory,
    onCategoryChange,
}: CategoryFilterProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            const { data } = await getCategories();
            setCategories(data);
            setLoading(false);
        }
        fetchCategories();
    }, []);

    const allCategories = [
        { id: "all", label: "All Items", icon: "🍽️" },
        ...categories.map(c => ({
            id: c.slug,
            label: c.label,
            icon: c.icon
        }))
    ];

    return (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {allCategories.map((category) => (
                <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => onCategoryChange(category.id)}
                    className={cn(
                        "flex-shrink-0 transition-all duration-300 rounded-full px-6 py-6 text-base font-semibold",
                        selectedCategory === category.id
                            ? "gradient-primary text-white shadow-lg hover:shadow-xl scale-105 border-0"
                            : "bg-white/80 backdrop-blur-sm border-gray-200/60 hover:border-[hsl(var(--sabana-red))]/30 hover:bg-[hsl(var(--sabana-red))]/5 hover:scale-105 shadow-sm hover:shadow-md"
                    )}
                >
                    <span className="mr-2 text-xl">{category.icon}</span>
                    {category.label}
                </Button>
            ))}
        </div>
    );
}
