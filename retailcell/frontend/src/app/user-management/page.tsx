"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Users, UserPlus } from "lucide-react";

export default function UserManagementPage() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="text-rc-gold" size={24} />
              Kullanıcı Yönetimi
            </h1>
            <p className="text-sm text-rc-text-secondary mt-0.5">Kullanıcılar, roller ve yetkiler.</p>
          </div>
          <button className="rc-btn-primary flex items-center gap-2"><UserPlus size={16} /> Kullanıcı Ekle</button>
        </div>
        <div className="rc-card">
          <table className="rc-table">
            <thead>
              <tr><th>Kullanıcı Adı</th><th>E-Posta</th><th>Rol</th><th>Durum</th></tr>
            </thead>
            <tbody>
              <tr><td className="text-white font-medium">Alex Rivera</td><td>admin@retailcell.com</td><td><span className="rc-badge rc-badge-gold">ADMIN</span></td><td><span className="rc-badge rc-badge-success">Aktif</span></td></tr>
              <tr><td className="text-white font-medium">Ahmet Yılmaz</td><td>kadikoy@retailcell.com</td><td><span className="rc-badge rc-badge-info">DEALER</span></td><td><span className="rc-badge rc-badge-success">Aktif</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
