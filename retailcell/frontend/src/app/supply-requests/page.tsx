"use client";

import MainLayout from "@/components/layout/MainLayout";
import { FileText, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function SupplyRequestsPage() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-rc-gold" size={24} />
              Tedarik Talepleri & SLA Takibi
            </h1>
            <p className="text-sm text-rc-text-secondary mt-0.5">
              Bayilerden gelen envanter ikmal talepleri ve durum makinesi geçişleri.
            </p>
          </div>
          <button className="rc-btn-primary flex items-center gap-2">
            <Plus size={16} /> Yeni Talep Oluştur
          </button>
        </div>

        <div className="rc-card">
          <table className="rc-table">
            <thead>
              <tr>
                <th>Talep No</th>
                <th>Başlık</th>
                <th>Bayi</th>
                <th>Öncelik</th>
                <th>Durum</th>
                <th>SLA Süresi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono text-rc-gold text-xs">SR-001234</td>
                <td className="text-white font-medium">iPhone 15 Pro Max Stok Talebi</td>
                <td>Kadıköy Mağaza</td>
                <td><span className="text-rc-danger font-bold">P0</span></td>
                <td><span className="rc-badge rc-badge-info">İşleniyor</span></td>
                <td>2.4 Saat Kalan</td>
              </tr>
              <tr>
                <td className="font-mono text-rc-gold text-xs">SR-001233</td>
                <td className="text-white font-medium">Galaxy S24 Ultra Acil Sipariş</td>
                <td>Kızılay Şube</td>
                <td><span className="text-rc-warning font-bold">P1</span></td>
                <td><span className="rc-badge rc-badge-warning">Onay Bekliyor</span></td>
                <td>8.1 Saat Kalan</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
