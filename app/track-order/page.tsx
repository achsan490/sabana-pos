"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package, Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrderByNumber } from "@/app/actions/track-order";
import { OrderWithItems } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TrackOrderPage() {
    const [orderNumber, setOrderNumber] = useState("");
    const [order, setOrder] = useState<OrderWithItems | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const searchParams = useSearchParams();

    useEffect(() => {
        const orderParam = searchParams.get("order");
        if (orderParam) {
            setOrderNumber(orderParam);
            // Auto-search when order number is in URL
            getOrderByNumber(orderParam).then((result) => {
                if (result.success && result.order) {
                    setOrder(result.order as OrderWithItems);
                } else {
                    setError(result.error || "Pesanan tidak ditemukan");
                }
            });
        }
    }, [searchParams]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!orderNumber.trim()) {
            setError("Masukkan nomor pesanan");
            return;
        }

        setLoading(true);
        setError("");
        setOrder(null);

        const result = await getOrderByNumber(orderNumber.trim());

        if (result.success && result.order) {
            setOrder(result.order as OrderWithItems);
        } else {
            setError(result.error || "Pesanan tidak ditemukan");
        }

        setLoading(false);
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    label: "Menunggu Konfirmasi",
                    icon: Clock,
                    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                    description: "Pesanan Anda sedang menunggu konfirmasi dari admin. Mohon tunggu sebentar."
                };
            case "completed":
                return {
                    label: "Dikonfirmasi",
                    icon: CheckCircle,
                    color: "bg-green-100 text-green-800 border-green-200",
                    description: "Pesanan Anda telah dikonfirmasi dan sedang diproses. Kami akan segera mengantar pesanan Anda."
                };
            case "cancelled":
                return {
                    label: "Dibatalkan",
                    icon: XCircle,
                    color: "bg-red-100 text-red-800 border-red-200",
                    description: "Pesanan Anda telah dibatalkan. Silakan hubungi kami jika ada pertanyaan."
                };
            default:
                return {
                    label: status,
                    icon: Package,
                    color: "bg-gray-100 text-gray-800 border-gray-200",
                    description: ""
                };
        }
    };

    const statusInfo = order ? getStatusInfo(order.status) : null;
    const StatusIcon = statusInfo?.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/menu">
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ff1a1a] via-[#d90429] to-[#c1121f] flex items-center justify-center text-white shadow-md">
                                <span className="font-[family-name:var(--font-lilita)] text-lg pt-1">SFC</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 leading-tight">Lacak Pesanan</h1>
                                <p className="text-xs text-muted-foreground">Cek status pesanan Anda</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Search Form */}
                <Card className="mb-6 shadow-lg border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-[hsl(var(--sabana-red))]" />
                            Masukkan Nomor Pesanan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <Input
                                    type="text"
                                    placeholder="Contoh: SFC2601060001"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                                    className="text-center font-mono text-lg h-12"
                                />
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    Nomor pesanan dikirim via WhatsApp setelah checkout
                                </p>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-[hsl(var(--sabana-red))] hover:bg-[hsl(var(--sabana-red))]/90 h-12"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Clock className="mr-2 h-5 w-5 animate-spin" />
                                        Mencari...
                                    </>
                                ) : (
                                    <>
                                        <Search className="mr-2 h-5 w-5" />
                                        Lacak Pesanan
                                    </>
                                )}
                            </Button>
                        </form>

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                                <p className="text-red-800 font-medium">{error}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Details */}
                {order && statusInfo && StatusIcon && (
                    <Card className="shadow-lg border-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Nomor Pesanan</p>
                                    <p className="font-mono font-bold text-xl">#{order.order_number}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDate(order.created_at)}
                                    </p>
                                </div>
                                <Badge className={`${statusInfo.color} border px-3 py-1.5`}>
                                    <StatusIcon className="h-4 w-4 mr-1.5" />
                                    {statusInfo.label}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6 space-y-6">
                            {/* Status Description */}
                            <div className={`p-4 rounded-lg ${statusInfo.color.replace('text-', 'bg-').replace('800', '50')} border`}>
                                <p className="text-sm font-medium">{statusInfo.description}</p>
                            </div>

                            {/* Customer Info */}
                            {order.customer_name && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm text-muted-foreground">Informasi Pengiriman</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Nama:</span>
                                            <span className="ml-2 font-medium">{order.customer_name}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">WhatsApp:</span>
                                            <span className="ml-2 font-medium">{order.customer_phone}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Alamat:</span>
                                            <span className="ml-2 font-medium">{order.customer_address}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Order Items */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm text-muted-foreground">Detail Pesanan</h3>
                                <div className="space-y-2">
                                    {order.order_items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium">{item.product_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(item.product_price)} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-bold text-[hsl(var(--sabana-red))]">
                                                {formatCurrency(item.subtotal)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t-2 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm text-muted-foreground">Pajak</span>
                                    <span className="font-medium">{formatCurrency(order.tax)}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-bold">Total Pembayaran</span>
                                    <span className="font-bold text-2xl text-[hsl(var(--sabana-red))]">
                                        {formatCurrency(order.total)}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-right">
                                    Metode: {order.payment_method === "cash" ? "COD (Bayar di Tempat)" : "Transfer Bank"}
                                </p>
                            </div>

                            {/* Help Section */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                                <p className="font-medium text-blue-900 mb-1">Butuh Bantuan?</p>
                                <p className="text-blue-800">
                                    Hubungi kami via WhatsApp jika ada pertanyaan tentang pesanan Anda.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
