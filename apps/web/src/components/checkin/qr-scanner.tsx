"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { checkInTicket } from "@/lib/actions/checkin";
import { Button } from "@eventtix/ui";
import { CheckCircle2, XCircle } from "lucide-react";

type ScanResult = {
  success: boolean;
  message: string;
  attendeeName?: string;
  ticketType?: string;
};

export function QRScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startScanner();
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  const startScanner = async () => {
    setScanning(true);
    setResult(null);
    setError(null);

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);

          try {
            const res = await checkInTicket(decodedText);
            setResult(res);
          } catch {
            setResult({
              success: false,
              message: "Failed to verify ticket",
            });
          }
        },
        () => {}
      );
    } catch (err: any) {
      setError(err.message || "Camera access denied");
      setScanning(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    startScanner();
  };

  return (
    <div className="space-y-4">
      <div
        id="qr-reader"
        className="mx-auto overflow-hidden rounded-xl"
        style={{ maxWidth: 400 }}
      />

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-center text-sm text-destructive">
          {error}
          <Button size="sm" variant="outline" onClick={startScanner} className="ml-2">
            Retry
          </Button>
        </div>
      )}

      {result && (
        <div
          className={`rounded-lg p-6 text-center ${
            result.success
              ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="mx-auto mb-2 h-12 w-12" />
          ) : (
            <XCircle className="mx-auto mb-2 h-12 w-12" />
          )}
          <p className="text-lg font-bold">{result.message}</p>
          {result.attendeeName && (
            <p className="mt-1 text-sm">{result.attendeeName}</p>
          )}
          {result.ticketType && (
            <p className="text-xs opacity-75">{result.ticketType}</p>
          )}
          <Button onClick={reset} className="mt-4">
            Scan Next
          </Button>
        </div>
      )}

      {scanning && !result && !error && (
        <p className="text-center text-sm text-muted-foreground">
          Point camera at QR code
        </p>
      )}
    </div>
  );
}
