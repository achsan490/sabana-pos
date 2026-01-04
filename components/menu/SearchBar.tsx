"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-[hsl(var(--sabana-red))] transition-colors" />
            <Input
                type="text"
                placeholder="Search for delicious items..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-12 pr-12 h-14 text-base bg-white/80 backdrop-blur-sm border-gray-200/60 rounded-2xl shadow-sm hover:shadow-md focus:shadow-lg focus:border-[hsl(var(--sabana-red))]/50 transition-all duration-300"
            />
            {value && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => onChange("")}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
