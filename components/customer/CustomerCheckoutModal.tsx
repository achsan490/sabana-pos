"use client";

import { useState } from "react";
import { Loader2, MapPin, Phone, User, Banknote, CreditCard, Trash2, Plus, Minus } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency, generateOrderNumber } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { createOrder } from "@/app/actions/orders";
import Link from "next/link";

interface CustomerCheckoutModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CustomerCheckoutModal({ open, onOpenChange }: CustomerCheckoutModalProps) {
    const { items, getSubtotal, getTax, getTotal, clearCart, removeItem, updateQuantity } = useCartStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState("");

    // Form States
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer">("cash");

    const subtotal = getSubtotal();
    const tax = getTax();
    const total = getTotal();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !phone || !address) {
            alert("Mohon lengkapi semua data diri Anda.");
            return;
        }

        setIsProcessing(true);
        const newOrderNumber = generateOrderNumber();

        try {
            const result = await createOrder({
                orderNumber: newOrderNumber,
                subtotal,
                tax,
                total,
                paymentMethod,
                items,
                customerName: name,
                customerPhone: phone,
                customerAddress: address,
                status: "pending" // Online orders start as pending
            });

            if (result.success) {
                setOrderNumber(newOrderNumber);
                setIsSuccess(true);
                clearCart();
            } else {
                alert(`Gagal membuat pesanan: ${result.error}`);
            }
        } catch (error) {
            console.error("Error creating order:", error);
            alert("Terjadi kesalahan sistem. Silakan coba lagi.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        if (isSuccess) {
            // Reset form after successful close
            setTimeout(() => {
                setIsSuccess(false);
                setName("");
                setPhone("");
                setAddress("");
                setPaymentMethod("cash");
            }, 300);
        }
    };

    if (isSuccess) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <Banknote className="h-6 w-6 text-green-600" />
                        </div>
                        <DialogTitle className="text-center text-2xl">Pesanan Diterima!</DialogTitle>
                        <DialogDescription className="text-center">
                            Terima kasih telah memesan, Kak {name}.<br />
                            Nomor Pesanan: <span className="font-mono font-bold text-foreground">{orderNumber}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                        <p className="text-center">Mohon tunggu sebentar, admin kami akan segera mengkonfirmasi pesanan Anda via WhatsApp.</p>
                        {paymentMethod === 'bank_transfer' && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-blue-800">
                                <p className="font-semibold mb-1">Silakan transfer ke:</p>
                                <p>BCA: 1234567890</p>
                                <p>A.n Sabana Fried Chicken</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-center gap-2 flex-col sm:flex-row">
                        <Link href={`/track-order?order=${orderNumber}`} className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full">
                                Lacak Pesanan
                            </Button>
                        </Link>
                        <Button onClick={handleClose} className="w-full sm:w-auto bg-[hsl(var(--sabana-red))] hover:bg-[hsl(var(--sabana-red))]/90">
                            Kembali ke Menu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Checkout Pesanan</DialogTitle>
                    <DialogDescription>
                        Lengkapi data pengiriman untuk menyelesaikan pesanan.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    {/* Customer Details */}
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <User className="h-4 w-4" /> Nama Lengkap
                            </Label>
                            <Input
                                id="name"
                                placeholder="Contoh: Budi Santosa"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="h-4 w-4" /> Nomor WhatsApp
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="081234567890"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Alamat Pengiriman
                            </Label>
                            <Textarea
                                id="address"
                                placeholder="Jl. Mawar No. 12, Kel. Sukamaju..."
                                className="min-h-[80px]"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-2">
                        <Label>Pesanan Anda</Label>
                        <div className="rounded-lg border bg-white max-h-[200px] overflow-y-auto">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 border-b last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal ({items.length} item)</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Pajak (10%)</span>
                            <span>{formatCurrency(tax)}</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-[hsl(var(--sabana-red))]">{formatCurrency(total)}</span>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3">
                        <Label>Metode Pembayaran</Label>
                        <RadioGroup
                            value={paymentMethod}
                            onValueChange={(val) => setPaymentMethod(val as "cash" | "bank_transfer")}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-accent ${paymentMethod === 'cash' ? 'border-[hsl(var(--sabana-red))] bg-[hsl(var(--sabana-red))]/5' : 'border-muted-foreground/20'
                                }`}>
                                <RadioGroupItem value="cash" id="cash" className="sr-only" />
                                <Label htmlFor="cash" className="cursor-pointer w-full text-center">
                                    <Banknote className="h-6 w-6 mx-auto mb-2" />
                                    <span className="block font-semibold">COD / Tunai</span>
                                    <span className="text-xs text-muted-foreground">Bayar saat diantar</span>
                                </Label>
                            </div>

                            <div className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-accent ${paymentMethod === 'bank_transfer' ? 'border-[hsl(var(--sabana-red))] bg-[hsl(var(--sabana-red))]/5' : 'border-muted-foreground/20'
                                }`}>
                                <RadioGroupItem value="bank_transfer" id="transfer" className="sr-only" />
                                <Label htmlFor="transfer" className="cursor-pointer w-full text-center">
                                    <CreditCard className="h-6 w-6 mx-auto mb-2" />
                                    <span className="block font-semibold">Transfer Bank</span>
                                    <span className="text-xs text-muted-foreground">BCA / Mandiri / BRI</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            className="w-full bg-[hsl(var(--sabana-red))] hover:bg-[hsl(var(--sabana-red))]/90 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                "Pesan Sekarang"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
