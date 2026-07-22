"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Map, AlertTriangle } from "lucide-react";

export default function RegionalCasesPage() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Map className="text-rc-gold" size={24} />
            Bölgesel Vakalar & Isı Haritası
          </h1>
          <p className="text-sm text-rc-text-secondary mt-0.5">
            Türkiye genelindeki bayilerin canlı stok riski ve bölgesel operasyonel durumları.
          </p>
        </div>

        <div className="rc-card h-96 flex items-center justify-center bg-rc-bg-secondary border border-rc-border rounded-xl relative overflow-hidden">
          <div className="text-center">
            <Map size={48} className="text-rc-gold mx-auto mb-2 animate-bounce" />
            <h3 className="text-lg font-bold text-white">Türkiye Bölgesel Operasyonel Isı Haritası</h3>
            <p className="text-xs text-rc-text-muted mt-1">Marmara (%92 Sağlık), İç Anadolu (%88 Sağlık), Ege (%95 Sağlık)</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
