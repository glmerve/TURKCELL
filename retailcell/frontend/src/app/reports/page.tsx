"use client";

import MainLayout from "@/components/layout/MainLayout";
import { BarChart3, Download } from "lucide-react";

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-rc-gold" size={24} />
              Raporlar & Analitik
            </h1>
            <p className="text-sm text-rc-text-secondary mt-0.5">Sistem ve performans raporları.</p>
          </div>
          <button className="rc-btn-primary flex items-center gap-2"><Download size={16} /> PDF İndir</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rc-card"><h3 className="text-white font-bold text-sm">Aylık SLA Raporu</h3><p className="text-xs text-rc-text-muted mt-1">%98.4 Başarı oranı</p></div>
          <div className="rc-card"><h3 className="text-white font-bold text-sm">Stok Devir Hızı Raporu</h3><p className="text-xs text-rc-text-muted mt-1">Ort. 14.2 gün</p></div>
        </div>
      </div>
    </MainLayout>
  );
}
