"use client";

import MainLayout from "@/components/layout/MainLayout";
import { ClipboardList } from "lucide-react";

export default function AuditLogsPage() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="text-rc-gold" size={24} />
            Denetim Günlükleri (Audit Logs)
          </h1>
          <p className="text-sm text-rc-text-secondary mt-0.5">Güvenlik ve işlem kayıtları.</p>
        </div>
        <div className="rc-card">
          <table className="rc-table">
            <thead>
              <tr><th>Kullanıcı</th><th>Eylem</th><th>Kaynak</th><th>Tarih</th></tr>
            </thead>
            <tbody>
              <tr><td className="text-white font-medium">admin@retailcell.com</td><td>LOGIN</td><td>auth</td><td>22 Tem 2025 19:30</td></tr>
              <tr><td className="text-white font-medium">kadikoy@retailcell.com</td><td>CREATE_SUPPLY_REQUEST</td><td>supply_requests</td><td>22 Tem 2025 18:45</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
