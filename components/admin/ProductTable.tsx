"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/lib/supabase";
import { deleteProduct, toggleProductAvailability } from "@/app/actions/admin-products";

interface ProductTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onRefresh: () => void;
}

const categoryColors: Record<string, string> = {
    chicken: "bg-sabana-red text-white",
    rice: "bg-sabana-yellow text-sabana-charcoal",
    drinks: "bg-blue-500 text-white",
    sides: "bg-green-500 text-white",
};

export function ProductTable({ products, onEdit, onRefresh }: ProductTableProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus "${name}"?`)) {
            return;
        }

        setDeletingId(id);
        const result = await deleteProduct(id);
        setDeletingId(null);

        if (result.success) {
            onRefresh();
        } else {
            alert(`Gagal menghapus produk: ${result.error}`);
        }
    };

    const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
        setTogglingId(id);
        const result = await toggleProductAvailability(id, !currentStatus);
        setTogglingId(null);

        if (result.success) {
            onRefresh();
        } else {
            alert(`Gagal mengubah status: ${result.error}`);
        }
    };

    if (products.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>Belum ada produk. Klik "Tambah Produk" untuk menambahkan.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Gambar</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-right">Harga</TableHead>
                        <TableHead className="text-center">Tersedia</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>
                                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                                    {product.image_url ? (
                                        <Image
                                            src={product.image_url}
                                            alt={product.name}
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
                            </TableCell>
                            <TableCell>
                                <div>
                                    <p className="font-medium">{product.name}</p>
                                    {product.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {product.description}
                                        </p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge className={categoryColors[product.category] || "bg-gray-800 text-white"}>
                                    {product.category}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                                {formatCurrency(product.price)}
                            </TableCell>
                            <TableCell className="text-center">
                                <Switch
                                    checked={product.available}
                                    onCheckedChange={() =>
                                        handleToggleAvailability(product.id, product.available)
                                    }
                                    disabled={togglingId === product.id}
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => onEdit(product)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleDelete(product.id, product.name)}
                                        disabled={deletingId === product.id}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
