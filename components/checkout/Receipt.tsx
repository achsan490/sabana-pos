"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYMENT_CONFIG } from "@/lib/payment-config";
import { CartItem } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer } from "lucide-react";

interface ReceiptProps {
    orderNumber: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: "cash" | "qris" | "bank_transfer";
    cashPaid?: number;
    change?: number;
    onClose: () => void;
}

export function Receipt({
    orderNumber,
    items,
    subtotal,
    tax,
    total,
    paymentMethod,
    cashPaid,
    change,
    onClose,
    autoPrint = false,
}: ReceiptProps & { autoPrint?: boolean }) {

    // Auto Print Effect
    import("react").then(({ useEffect }) => {
        useEffect(() => {
            if (autoPrint) {
                const timer = setTimeout(() => {
                    window.print();
                }, 500); // Small delay to ensure render
                return () => clearTimeout(timer);
            }
        }, [autoPrint]);
    });

    const handlePrint = () => {
        window.print();
    };

    const getPaymentMethodLabel = () => {
        switch (paymentMethod) {
            case "cash":
                return "Tunai";
            case "qris":
                return "QRIS";
            case "bank_transfer":
                return "Transfer Bank";
            default:
                return paymentMethod;
        }
    };

    return (
        <div className="max-w-md mx-auto">
            {/* Receipt Content */}
            <div id="receipt-content" className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-sabana-red to-sabana-yellow flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">S</span>
                    </div>
                    <h2 className="text-xl font-bold text-sabana-red">
                        {PAYMENT_CONFIG.store.name}
                    </h2>
                    <p className="text-xs text-gray-600">{PAYMENT_CONFIG.store.address}</p>
                    <p className="text-xs text-gray-600">Telp: {PAYMENT_CONFIG.store.phone}</p>
                </div>

                <Separator className="my-3" />

                {/* Order Info */}
                <div className="text-sm mb-3">
                    <div className="flex justify-between mb-1">
                        <span className="text-gray-600">No. Order:</span>
                        <span className="font-semibold">{orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal:</span>
                        <span>{formatDate(new Date())}</span>
                    </div>
                </div>

                <Separator className="my-3" />

                {/* Items */}
                <div className="mb-3">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-1">Item</th>
                                <th className="text-center py-1">Qty</th>
                                <th className="text-right py-1">Harga</th>
                                <th className="text-right py-1">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b">
                                    <td className="py-1">{item.name}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-right">{formatCurrency(item.price)}</td>
                                    <td className="text-right font-semibold">
                                        {formatCurrency(item.price * item.quantity)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Separator className="my-3" />

                {/* Totals */}
                <div className="text-sm space-y-1 mb-3">
                    <div className="flex justify-between text-lg font-bold">
                        <span>TOTAL:</span>
                        <span className="text-sabana-red">{formatCurrency(total)}</span>
                    </div>
                </div>

                <Separator className="my-3" />

                {/* Payment Details */}
                <div className="text-sm space-y-1 mb-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Metode Pembayaran:</span>
                        <span className="font-semibold">{getPaymentMethodLabel()}</span>
                    </div>
                    {paymentMethod === "cash" && cashPaid !== undefined && (
                        <>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Uang Diterima:</span>
                                <span>{formatCurrency(cashPaid)}</span>
                            </div>
                            {change !== undefined && change > 0 && (
                                <div className="flex justify-between text-base font-bold text-green-600">
                                    <span>Kembalian:</span>
                                    <span>{formatCurrency(change)}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <Separator className="my-3" />

                {/* Footer */}
                <div className="text-center text-xs text-gray-600">
                    <p className="mb-1">Terima kasih atas kunjungan Anda!</p>
                    <p>Selamat menikmati hidangan kami 🍗</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 print:hidden">
                <Button onClick={handlePrint} className="flex-1" size="lg">
                    <Printer className="mr-2 h-5 w-5" />
                    Cetak Nota
                </Button>
                <Button onClick={onClose} variant="outline" className="flex-1" size="lg">
                    Tutup
                </Button>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content,
          #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
