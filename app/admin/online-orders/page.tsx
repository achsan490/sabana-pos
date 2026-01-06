"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Package, User, Phone, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { getOrders, updateOrderStatus } from "@/app/actions/orders";
import { OrderWithItems } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OnlineOrdersPage() {
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [statusFilter, setStatusFilter] = useState<"pending" | "completed" | "cancelled">("pending");

    async function fetchOrders() {
        setLoading(true);
        const data = await getOrders(100);
        // Filter only online orders (those with customer details)
        const onlineOrders = data.filter(order => order.customer_name);
        setOrders(onlineOrders);
        setLoading(false);
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (status: "completed" | "cancelled") => {
        if (!selectedOrder) return;

        setIsUpdating(true);
        try {
            const result = await updateOrderStatus(selectedOrder.id, status);
            if (result.success) {
                setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status } : o));
                setSelectedOrder(prev => prev ? { ...prev, status } : null);
                setIsDetailsOpen(false);
            } else {
                alert("Gagal update status: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan.");
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-800 border-green-200";
            case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "cancelled": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getPaymentMethodLabel = (method: string) => {
        switch (method) {
            case "cash": return "COD";
            case "bank_transfer": return "Transfer";
            default: return method;
        }
    };

    const filteredOrders = orders.filter(order => order.status === statusFilter);

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
                                <h1 className="text-2xl font-extrabold text-gradient">Pesanan Online</h1>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Kelola pesanan dari customer
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-br from-[hsl(var(--sabana-red))]/10 to-[hsl(var(--sabana-yellow))]/10 border border-[hsl(var(--sabana-red))]/20">
                            <Package className="h-5 w-5 text-[hsl(var(--sabana-red))]" />
                            <div className="text-sm">
                                <p className="font-bold text-foreground">{filteredOrders.length}</p>
                                <p className="text-xs text-muted-foreground capitalize">{statusFilter}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <Card className="card-premium border-0 shadow-xl">
                    <CardHeader className="border-b border-gray-100 pb-4">
                        <div className="flex gap-2 overflow-x-auto">
                            {["pending", "completed", "cancelled"].map((status) => (
                                <Button
                                    key={status}
                                    variant={statusFilter === status ? "default" : "outline"}
                                    onClick={() => setStatusFilter(status as any)}
                                    className={`capitalize ${statusFilter === status ? "bg-[hsl(var(--sabana-red))]" : ""}`}
                                >
                                    {status === "pending" && <Clock className="h-4 w-4 mr-2" />}
                                    {status === "completed" && <CheckCircle className="h-4 w-4 mr-2" />}
                                    {status === "cancelled" && <XCircle className="h-4 w-4 mr-2" />}
                                    {status}
                                </Button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Package className="h-20 w-20 text-[hsl(var(--sabana-red))]/20 mb-4" />
                                <h3 className="text-xl font-bold text-foreground">Belum ada pesanan {statusFilter}</h3>
                                <p className="text-muted-foreground mb-6">Pesanan online akan muncul di sini</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Kontak</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Waktu</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => (
                                        <TableRow
                                            key={order.id}
                                            className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setIsDetailsOpen(true);
                                            }}
                                        >
                                            <TableCell className="font-mono font-medium">
                                                #{order.order_number}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{order.customer_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Phone className="h-3 w-3" />
                                                    {order.customer_phone}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-white">
                                                    {order.order_items.length} items
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-[hsl(var(--sabana-red))]">
                                                {formatCurrency(order.total)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {getPaymentMethodLabel(order.payment_method)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(order.created_at).toLocaleString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedOrder(order);
                                                        setIsDetailsOpen(true);
                                                    }}
                                                >
                                                    Detail
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Order Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between text-xl">
                            <span>Order #{selectedOrder?.order_number}</span>
                            {selectedOrder && (
                                <Badge className={getStatusColor(selectedOrder.status)}>
                                    {selectedOrder.status}
                                </Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedOrder && formatDate(selectedOrder.created_at)}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="py-4 space-y-4">
                            {/* Customer Details */}
                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <User className="h-4 w-4" /> Informasi Customer
                                </h4>
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex items-start gap-2">
                                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Nama</p>
                                            <p className="font-medium">{selectedOrder.customer_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">WhatsApp</p>
                                            <p className="font-medium">{selectedOrder.customer_phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Alamat Pengiriman</p>
                                            <p className="font-medium">{selectedOrder.customer_address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h4 className="font-semibold mb-2">Pesanan</h4>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {selectedOrder.order_items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-start pb-2 border-b border-gray-100 last:border-0">
                                            <div>
                                                <p className="font-medium text-sm">{item.product_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatCurrency(item.product_price)} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-bold text-sm text-[hsl(var(--sabana-red))]">
                                                {formatCurrency(item.subtotal)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="pt-2 border-t-2 border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">Total Pembayaran</span>
                                    <span className="font-bold text-xl text-[hsl(var(--sabana-red))]">
                                        {formatCurrency(selectedOrder.total)}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Metode: {getPaymentMethodLabel(selectedOrder.payment_method)}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 flex-col sm:flex-row">
                        {selectedOrder?.status === "pending" && (
                            <div className="flex gap-2 w-full">
                                <Button
                                    variant="destructive"
                                    onClick={() => handleUpdateStatus("cancelled")}
                                    className="flex-1"
                                    disabled={isUpdating}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Tolak
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                    onClick={() => handleUpdateStatus("completed")}
                                    disabled={isUpdating}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Terima
                                </Button>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setIsDetailsOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
