"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Settings, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="text-rc-gold" size={24} />
            Sistem Ayarları
          </h1>
          <p className="text-sm text-rc-text-secondary mt-0.5">Konfigürasyon ve parametreler.</p>
        </div>
        <div className="rc-card space-y-4 max-w-xl">
          <div>
            <label className="text-xs font-semibold text-rc-text-secondary block mb-1">Varsayılan SLA Süresi (Saat)</label>
            <input type="number" defaultValue={24} className="w-full bg-rc-bg-primary border border-rc-border rounded-lg p-2 text-white text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-rc-text-secondary block mb-1">YZ Risk Eşik Değeri (%)</label>
            <input type="number" defaultValue={85} className="w-full bg-rc-bg-primary border border-rc-border rounded-lg p-2 text-white text-sm" />
          </div>
          <button className="rc-btn-primary flex items-center gap-2"><Save size={16} /> Kaydet</button>
        </div>
      </div>
    </MainLayout>
  );
}
