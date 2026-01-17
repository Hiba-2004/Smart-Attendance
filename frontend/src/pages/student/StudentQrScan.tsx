import React, { useEffect, useState } from "react";
import { StudentLayout } from "@/layouts/StudentLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Html5QrcodeScanner } from "html5-qrcode";

const StudentQrScan: React.FC = () => {
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        if (scanned) return;
        setScanned(true);

        try {
          await api.post("/api/student/attendances/mark-qr", { token: decodedText });

          toast({
            title: "Présence enregistrée ✅",
            description: "Tu es marqué présent pour cette séance.",
          });
        } catch (e: any) {
          setScanned(false);
          toast({
            title: "Erreur",
            description: e?.response?.data?.message || "Scan invalide ou QR expiré.",
            variant: "destructive" as any,
          });
        }
      },
      (error) => {
        // ignore scan errors (it fires often)
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanned]);

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl text-foreground mb-2">
            Scanner le QR
          </h1>
          <p className="text-muted-foreground">
            Autorise la caméra et scanne le QR affiché par l’enseignant.
          </p>
        </div>

        <div className="card-institutional p-6">
          <div id="qr-reader" />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setScanned(false)}>
              Scanner à nouveau
            </Button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentQrScan;
