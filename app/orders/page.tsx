"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Package, Calendar, CreditCard, Eye, Receipt as ReceiptIcon, Trash2, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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

import { getOrders, deleteOrder, deleteOrders, updateOrderStatus } from "@/app/actions/orders";
import { OrderWithItems } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Receipt } from "@/components/order/Receipt";

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Delete State
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Bulk Delete State
    const [ordersToDelete, setOrdersToDelete] = useState<string[]>([]);

    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "cancelled">("all");
    const [isUpdating, setIsUpdating] = useState(false);

    async function fetchOrders() {
        setLoading(true);
        const data = await getOrders(50);
        setOrders(data);
        setLoading(false);
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleDeleteClick = (orderId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOrderToDelete(orderId);
        setIsDeleteOpen(true);
    };

    const handleBulkDeleteClick = (orderIds: string[]) => {
        setOrdersToDelete(orderIds);
        setIsBulkDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!orderToDelete) return;

        setIsDeleting(true);
        try {
            const result = await deleteOrder(orderToDelete);
            if (result.success) {
                // Refresh list or remove locally
                setOrders(prev => prev.filter(o => o.id !== orderToDelete));
                setIsDeleteOpen(false);
            } else {
                alert("Failed to delete order: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setIsDeleting(false);
            setOrderToDelete(null);
        }
    };

    const confirmBulkDelete = async () => {
        if (ordersToDelete.length === 0) return;

        setIsDeleting(true);
        try {
            const result = await deleteOrders(ordersToDelete);
            if (result.success) {
                setOrders(prev => prev.filter(o => !ordersToDelete.includes(o.id)));
                setIsBulkDeleteOpen(false);
            } else {
                alert("Failed to delete orders: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setIsDeleting(false);
            setOrdersToDelete([]);
        }
    };

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
                alert("Failed to update status: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setIsUpdating(false);
        }
    };

    const getPaymentMethodLabel = (method: string) => {
        switch (method) {
            case "cash": return "Cash";
            case "qris": return "QRIS";
            case "bank_transfer": return "Transfer";
            default: return method;
        }
    };

    const getPaymentMethodColor = (method: string) => {
        switch (method) {
            case "cash": return "bg-green-100 text-green-800 border-green-200";
            case "qris": return "bg-blue-100 text-blue-800 border-blue-200";
            case "bank_transfer": return "bg-purple-100 text-purple-800 border-purple-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
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

    const handleViewDetails = (order: OrderWithItems) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };

    // Grouping Logic
    const groupOrdersByDate = (orders: OrderWithItems[]) => {
        const groups: Record<string, OrderWithItems[]> = {};

        orders.forEach(order => {
            const date = new Date(order.created_at);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let key = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

            if (date.toDateString() === today.toDateString()) {
                key = "Hari Ini";
            } else if (date.toDateString() === yesterday.toDateString()) {
                key = "Kemarin";
            }

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(order);
        });

        return groups;
    };

    const filteredOrders = orders.filter(order => {
        if (statusFilter === "all") return true;
        return order.status === statusFilter;
    });

    const groupedOrders = groupOrdersByDate(filteredOrders);
    const groups = Object.keys(groupedOrders);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Hidden Receipt for Printing */}
            <Receipt order={selectedOrder} />

            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-white/20 shadow-lg print:hidden">
                <div className="container mx-auto px-4 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 animate-slide-up">
                            <Link href="/">
                                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#ff1a1a] via-[#d90429] to-[#c1121f] flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform cursor-pointer border border-white/20">
                                    <span className="font-[family-name:var(--font-lilita)] text-lg pt-1">SFC</span>
                                </div>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-extrabold text-gradient">Order History</h1>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Recent transactions
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-br from-[hsl(var(--sabana-red))]/10 to-[hsl(var(--sabana-yellow))]/10 border border-[hsl(var(--sabana-red))]/20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <Package className="h-5 w-5 text-[hsl(var(--sabana-red))]" />
                            <div className="text-sm">
                                <p className="font-bold text-foreground">{orders.length}</p>
                                <p className="text-xs text-muted-foreground">Orders</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-5xl print:hidden">
                <Card className="card-premium border-0 shadow-xl animate-slide-up">
                    <CardHeader className="border-b border-gray-100 pb-0 mb-4 px-6 pt-6">
                        <div className="flex gap-2 pb-4 overflow-x-auto">
                            {["all", "pending", "completed", "cancelled"].map((status) => (
                                <Button
                                    key={status}
                                    variant={statusFilter === status ? "default" : "outline"}
                                    onClick={() => setStatusFilter(status as any)}
                                    className={`capitalize ${statusFilter === status ? "bg-[hsl(var(--sabana-red))]" : ""}`}
                                >
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
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Package className="h-20 w-20 text-[hsl(var(--sabana-red))]/20 mb-4" />
                                <h3 className="text-xl font-bold text-foreground">No orders yet</h3>
                                <p className="text-muted-foreground mb-6">Start selling to see history.</p>
                                <Link href="/">
                                    <Button>Go to POS</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-md">
                                {groups.map((dateGroup) => (
                                    <div key={dateGroup} className="mb-6 last:mb-0">
                                        <div className="bg-gray-50/80 px-4 py-2 border-y border-gray-100 first:border-t-0 font-semibold text-sm text-muted-foreground sticky top-0 backdrop-blur-sm z-10 flex justify-between items-center">
                                            <span>{dateGroup}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleBulkDeleteClick(groupedOrders[dateGroup].map(o => o.id))}
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" />
                                                Hapus Semua ({groupedOrders[dateGroup].length})
                                            </Button>
                                        </div>
                                        <Table>
                                            <TableHeader className="hidden">
                                                <TableRow>
                                                    <TableHead className="w-[100px]">Order #</TableHead>
                                                    <TableHead>Time</TableHead>
                                                    <TableHead>Items</TableHead>
                                                    <TableHead>Total</TableHead>
                                                    <TableHead>Payment</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {groupedOrders[dateGroup].map((order) => (
                                                    <TableRow
                                                        key={order.id}
                                                        className="hover:bg-gray-50/50 cursor-pointer transition-colors group"
                                                        onClick={() => handleViewDetails(order)}
                                                    >
                                                        <TableCell className="font-mono font-medium w-[120px]">
                                                            #{order.order_number}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground text-sm w-[100px]">
                                                            {new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="bg-white">
                                                                    {order.order_items.length} items
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground truncate max-w-[150px] hidden sm:inline-block">
                                                                    {order.order_items.slice(0, 2).map(i => i.product_name).join(", ")}
                                                                    {order.order_items.length > 2 && "..."}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-bold text-[hsl(var(--sabana-red))]">
                                                            {formatCurrency(order.total)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1">
                                                                <Badge className={`${getPaymentMethodColor(order.payment_method)} border shadow-none w-fit`}>
                                                                    {getPaymentMethodLabel(order.payment_method)}
                                                                </Badge>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={`${getStatusColor(order.status)} border shadow-none capitalize`}>
                                                                {order.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-black opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewDetails(order);
                                                                }}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive" onClick={(e) => handleDeleteClick(order.id, e)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Order Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-md print:hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between text-xl">
                            <span>Order #{selectedOrder?.order_number}</span>
                            {selectedOrder && (
                                <div className="flex gap-2">
                                    <Badge className={getStatusColor(selectedOrder.status)}>
                                        {selectedOrder.status}
                                    </Badge>
                                    <Badge className={getPaymentMethodColor(selectedOrder.payment_method)}>
                                        {getPaymentMethodLabel(selectedOrder.payment_method)}
                                    </Badge>
                                </div>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedOrder && formatDate(selectedOrder.created_at)}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="py-4">
                            {/* Customer Details */}
                            {selectedOrder.customer_name && (
                                <div className="mb-4 p-4 bg-muted/50 rounded-lg text-sm space-y-1">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <User className="h-4 w-4" /> Customer Details
                                    </h4>
                                    <p><span className="font-medium">Name:</span> {selectedOrder.customer_name}</p>
                                    <p><span className="font-medium">Phone:</span> {selectedOrder.customer_phone}</p>
                                    <p><span className="font-medium">Address:</span> {selectedOrder.customer_address}</p>
                                </div>
                            )}
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                {selectedOrder.order_items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-semibold text-gray-900">{item.product_name}</p>
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

                            <Separator className="my-4" />

                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total Amount</span>
                                <span className="text-[hsl(var(--sabana-red))] text-2xl">
                                    {formatCurrency(selectedOrder.total)}
                                </span>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
                        <div className="flex gap-2 w-full sm:w-auto">
                            {selectedOrder?.status === "pending" && (
                                <>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleUpdateStatus("cancelled")}
                                        className="flex-1 sm:flex-none"
                                        disabled={isUpdating}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                                        onClick={() => handleUpdateStatus("completed")}
                                        disabled={isUpdating}
                                    >
                                        Confirm
                                    </Button>
                                </>
                            )}
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                onClick={handlePrint}
                                className="gap-2 flex-1 sm:flex-none"
                            >
                                <ReceiptIcon className="h-4 w-4" />
                                Print
                            </Button>
                            <Button
                                className="bg-[hsl(var(--sabana-red))] hover:bg-[hsl(var(--sabana-red))]/90 text-white flex-1 sm:flex-none"
                                onClick={() => setIsDetailsOpen(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Single Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the transaction record.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            variant="destructive"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation Dialog */}
            <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete All Orders?</DialogTitle>
                        <DialogDescription>
                            You are about to delete <b>{ordersToDelete.length} transactions</b> from this group. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsBulkDeleteOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmBulkDelete}
                            variant="destructive"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete All"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
