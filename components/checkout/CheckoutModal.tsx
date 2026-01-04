"use client";

import { useState } from "react";
import { Check, CreditCard, Banknote, Smartphone, Loader2, Copy, CheckCircle2 } from "lucide-react";
import Image from "next/image";
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
import { Separator } from "@/components/ui/separator";
import { formatCurrency, generateOrderNumber } from "@/lib/utils";
import { PAYMENT_CONFIG } from "@/lib/payment-config";
import { CartItem } from "@/store/cart-store";
import { useCartStore } from "@/store/cart-store";
import { createOrder } from "@/app/actions/orders";
import { Receipt } from "./Receipt";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface CheckoutModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subtotal: number;
    tax: number;
    total: number;
    items: CartItem[];
}

type PaymentMethod = "cash" | "qris" | "bank_transfer";

const paymentMethods = [
    { id: "cash" as PaymentMethod, label: "Tunai", icon: Banknote },
    { id: "qris" as PaymentMethod, label: "QRIS", icon: Smartphone },
    { id: "bank_transfer" as PaymentMethod, label: "Transfer Bank", icon: CreditCard },
];

export function CheckoutModal({
    open,
    onOpenChange,
    subtotal,
    tax,
    total,
    items,
}: CheckoutModalProps) {
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("cash");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState("");
    const [cashPaid, setCashPaid] = useState("");
    const [copied, setCopied] = useState(false);
    const [autoPrint, setAutoPrint] = useState(false);
    const clearCart = useCartStore((state) => state.clearCart);

    const cashPaidAmount = parseFloat(cashPaid) || 0;
    const change = cashPaidAmount - total;
    const isCashValid = selectedPayment !== "cash" || cashPaidAmount >= total;

    const handleCopyAccount = () => {
        navigator.clipboard.writeText(PAYMENT_CONFIG.bankTransfer.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleProcessOrder = async () => {
        if (!isCashValid) {
            alert("Uang yang diterima kurang dari total pembayaran!");
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
                paymentMethod: selectedPayment,
                items,
            });

            if (result.success) {
                setOrderNumber(newOrderNumber);
                setIsSuccess(true);
                clearCart();
            } else {
                alert(`Gagal memproses pesanan: ${result.error}`);
            }
        } catch (error) {
            console.error("Error processing order:", error);
            alert("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => {
            setIsSuccess(false);
            setOrderNumber("");
            setSelectedPayment("cash");
            setCashPaid("");
            setCopied(false);
        }, 300);
    };

    if (isSuccess) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-2xl">Pembayaran Berhasil!</DialogTitle>
                    </DialogHeader>
                    <Receipt
                        orderNumber={orderNumber}
                        items={items}
                        subtotal={subtotal}
                        tax={tax}
                        total={total}
                        paymentMethod={selectedPayment}
                        cashPaid={selectedPayment === "cash" ? cashPaidAmount : undefined}
                        change={selectedPayment === "cash" ? change : undefined}
                        onClose={handleClose}
                        autoPrint={autoPrint}
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Checkout</DialogTitle>
                    <DialogDescription>
                        Pilih metode pembayaran dan selesaikan transaksi
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Order Summary */}
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Ringkasan Pesanan</h4>
                        <div className="rounded-lg border p-3 space-y-2 text-sm">
                            <div className="flex justify-between font-semibold text-base">
                                <span>Total</span>
                                <span className="text-primary">{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Metode Pembayaran</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {paymentMethods.map((method) => {
                                const Icon = method.icon;
                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => {
                                            setSelectedPayment(method.id);
                                            setCashPaid("");
                                        }}
                                        className={cn(
                                            "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:bg-accent",
                                            selectedPayment === method.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border"
                                        )}
                                    >
                                        <Icon className="h-6 w-6" />
                                        <span className="text-xs font-medium">{method.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Payment-Specific Interface */}
                    <div className="rounded-lg border p-4 bg-muted/30">
                        {selectedPayment === "cash" && (
                            <div className="space-y-3">
                                <h4 className="font-medium">Pembayaran Tunai</h4>
                                <div className="space-y-2">
                                    <label htmlFor="cash-paid" className="text-sm font-medium">
                                        Uang Diterima
                                    </label>
                                    <Input
                                        id="cash-paid"
                                        type="number"
                                        value={cashPaid}
                                        onChange={(e) => setCashPaid(e.target.value)}
                                        placeholder="Masukkan jumlah uang"
                                        className="text-lg"
                                        min={total}
                                        step="1000"
                                    />
                                </div>
                                {cashPaid && (
                                    <div className="space-y-1 pt-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Total:</span>
                                            <span className="font-semibold">{formatCurrency(total)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Uang Diterima:</span>
                                            <span className="font-semibold">{formatCurrency(cashPaidAmount)}</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Kembalian:</span>
                                            <span className={change >= 0 ? "text-green-600" : "text-destructive"}>
                                                {formatCurrency(Math.max(0, change))}
                                            </span>
                                        </div>
                                        {change < 0 && (
                                            <p className="text-xs text-destructive mt-1">
                                                Uang kurang {formatCurrency(Math.abs(change))}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedPayment === "qris" && (
                            <div className="space-y-3">
                                <h4 className="font-medium text-center">Scan QR Code</h4>
                                <div className="flex justify-center">
                                    <div className="bg-white p-4 rounded-lg border-2">
                                        <Image
                                            src={PAYMENT_CONFIG.qris.imageUrl}
                                            alt="QRIS Code"
                                            width={200}
                                            height={200}
                                            className="rounded"
                                        />
                                    </div>
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-sm font-medium">{PAYMENT_CONFIG.qris.merchantName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {PAYMENT_CONFIG.qris.instructions}
                                    </p>
                                    <p className="text-lg font-bold text-primary mt-2">
                                        {formatCurrency(total)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {selectedPayment === "bank_transfer" && (
                            <div className="space-y-3">
                                <h4 className="font-medium">Transfer ke Rekening</h4>
                                <div className="space-y-2 bg-white p-3 rounded border">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Bank:</span>
                                        <span className="font-semibold">{PAYMENT_CONFIG.bankTransfer.bankName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">No. Rekening:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-semibold">
                                                {PAYMENT_CONFIG.bankTransfer.accountNumber}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={handleCopyAccount}
                                            >
                                                {copied ? (
                                                    <Check className="h-3 w-3 text-green-600" />
                                                ) : (
                                                    <Copy className="h-3 w-3" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Atas Nama:</span>
                                        <span className="font-semibold">{PAYMENT_CONFIG.bankTransfer.accountHolder}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Total Transfer:</span>
                                        <span className="text-lg font-bold text-primary">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    {PAYMENT_CONFIG.bankTransfer.instructions}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Auto Print Toggle */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <label className="text-sm font-medium">Cetak Struk Otomatis</label>
                            <p className="text-xs text-muted-foreground">
                                Langsung cetak struk setelah pembayaran berhasil
                            </p>
                        </div>
                        <Switch
                            checked={autoPrint}
                            onCheckedChange={setAutoPrint}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleProcessOrder}
                        disabled={isProcessing || !isCashValid}
                        className="min-w-32"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses...
                            </>
                        ) : selectedPayment === "cash" ? (
                            "Proses Pembayaran"
                        ) : selectedPayment === "qris" ? (
                            "Sudah Bayar"
                        ) : (
                            "Sudah Transfer"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
