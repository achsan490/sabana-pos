"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, Check, QrCode as QrCodeIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MenuQRCode() {
    const [copied, setCopied] = useState(false);

    // Get the full URL for the menu page
    const menuUrl = 'https://sabana-pos.vercel.app/menu';

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(menuUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDownloadQR = () => {
        const svg = document.getElementById('menu-qr-code');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');

            const downloadLink = document.createElement('a');
            downloadLink.download = 'sabana-menu-qr.png';
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <Card className="card-premium border-0 shadow-xl">
            <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(var(--sabana-red))] to-[hsl(var(--sabana-yellow))] flex items-center justify-center">
                        <QrCodeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">QR Code Menu</CardTitle>
                        <CardDescription>Scan untuk akses menu online</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                {/* QR Code Display */}
                <div className="flex justify-center p-6 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <QRCodeSVG
                        id="menu-qr-code"
                        value={menuUrl}
                        size={200}
                        level="H"
                        includeMargin={true}
                        fgColor="#1a1a1a"
                    />
                </div>

                {/* URL Display */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Link Menu</label>
                    <div className="flex gap-2">
                        <Input
                            value={menuUrl}
                            readOnly
                            className="font-mono text-sm bg-gray-50"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopyLink}
                            className="flex-shrink-0"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        onClick={handleDownloadQR}
                        className="flex-1 bg-[hsl(var(--sabana-red))] hover:bg-[hsl(var(--sabana-red))]/90"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download QR
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.open(menuUrl, '_blank')}
                        className="flex-1"
                    >
                        Preview Menu
                    </Button>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                    <p className="font-semibold text-blue-900 mb-2">💡 Cara Pakai:</p>
                    <ul className="text-blue-800 space-y-1 list-disc list-inside">
                        <li>Download QR Code dan cetak</li>
                        <li>Tempel di meja atau kasir</li>
                        <li>Customer scan untuk pesan online</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
