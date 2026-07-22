"use client";

import MainLayout from "@/components/layout/MainLayout";
import { User, Mail, Shield, MapPin } from "lucide-react";

export default function ProfilePage() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="text-rc-gold" size={24} />
            Kullanıcı Profili
          </h1>
          <p className="text-sm text-rc-text-secondary mt-0.5">Hesap detayları ve yetkiler.</p>
        </div>
        <div className="rc-card max-w-lg space-y-4">
          <div className="flex items-center gap-4 border-b border-rc-border pb-4">
            <div className="w-16 h-16 rounded-full bg-rc-gold flex items-center justify-center font-bold text-black text-2xl">AR</div>
            <div>
              <h2 className="text-lg font-bold text-white">Alex Rivera</h2>
              <span className="rc-badge rc-badge-gold">Sistem Yöneticisi (ADMIN)</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-rc-text-secondary">
            <p className="flex items-center gap-2"><Mail size={16} className="text-rc-gold" /> admin@retailcell.com</p>
            <p className="flex items-center gap-2"><MapPin size={16} className="text-rc-gold" /> Bölge: EMEA / Türkiye</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
