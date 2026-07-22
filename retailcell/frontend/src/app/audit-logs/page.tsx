"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { ClipboardList, Search, Filter, ShieldCheck, AlertOctagon, RefreshCw } from "lucide-react";
import { identityApi } from "@/services/api";

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resourceDetails: string;
  ipAddress: string;
  result: "BAŞARILI" | "BAŞARISIZ" | "UYARI";
  date: string;
}

const initialLogs: AuditLog[] = [
  { id: "LOG-1001", user: "admin@retailcell.com", action: "SYSTEM_LOGIN", resourceDetails: "Auth Service", ipAddress: "192.168.1.42", result: "BAŞARILI", date: "22 Tem 2025 19:30:12" },
  { id: "LOG-1002", user: "kadikoy@retailcell.com", action: "CREATE_SUPPLY_REQUEST", resourceDetails: "SR-001234", ipAddress: "10.0.5.112", result: "BAŞARILI", date: "22 Tem 2025 18:45:00" },
  { id: "LOG-1003", user: "unknown_user", action: "FAILED_LOGIN", resourceDetails: "Auth Service", ipAddress: "45.22.19.8", result: "BAŞARISIZ", date: "22 Tem 2025 18:10:44" },
  { id: "LOG-1004", user: "kizilay@retailcell.com", action: "VIEW_INVENTORY", resourceDetails: "Product-Catalog", ipAddress: "10.0.4.88", result: "BAŞARILI", date: "22 Tem 2025 17:22:10" },
  { id: "LOG-1005", user: "alsancak@retailcell.com", action: "UPDATE_STATUS", resourceDetails: "CASE-1082", ipAddress: "10.0.7.41", result: "BAŞARILI", date: "21 Tem 2025 14:15:33" },
  { id: "LOG-1006", user: "system_cron", action: "AI_RETRAIN", resourceDetails: "Model_v2.4", ipAddress: "127.0.0.1", result: "UYARI", date: "21 Tem 2025 03:00:00" },
];

const resultStyles: Record<string, string> = {
  "BAŞARILI": "rc-badge-success",
  "BAŞARISIZ": "rc-badge-danger",
  "UYARI": "rc-badge-warning",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data: any = await identityApi.getAuditLogs();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        const formatted = data.items.map((item: any, index: number) => ({
          id: item.id || `LOG-API-${index}`,
          user: item.user_id || item.username || "Bilinmeyen",
          action: item.action || "BİLİNMEYEN İŞLEM",
          resourceDetails: item.resource || item.details || "-",
          ipAddress: item.ip_address || "127.0.0.1",
          result: item.status === "FAILED" ? "BAŞARISIZ" : item.status === "WARNING" ? "UYARI" : "BAŞARILI",
          date: new Date(item.created_at || Date.now()).toLocaleString("tr-TR"),
        }));
        setLogs([...formatted, ...initialLogs]);
      }
    } catch (error) {
      console.log("Could not fetch audit logs from API, using defaults.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);
    const matchesResult = !resultFilter || log.result === resultFilter;
    return matchesSearch && matchesResult;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="text-rc-gold" size={24} />
              Sistem Denetim Günlükleri (Audit Logs)
            </h1>
            <p className="text-sm text-rc-text-secondary mt-0.5">
              Tüm kullanıcı işlemleri, sistem erişimleri ve güvenlik kayıtlarının detaylı izlenmesi.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-lg border border-rc-border text-rc-text-secondary hover:text-white transition-colors cursor-pointer flex items-center gap-2 bg-rc-bg-card"
            title="Günlükleri Yenile"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-rc-gold" : ""} />
            <span className="text-xs font-medium">Yenile</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rc-card flex items-center gap-4">
            <div className="p-3 bg-rc-success/10 text-rc-success rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs text-rc-text-muted">Başarılı İşlemler</p>
              <p className="text-lg font-bold text-white mt-0.5">14,248</p>
            </div>
          </div>
          <div className="rc-card flex items-center gap-4">
            <div className="p-3 bg-rc-danger/10 text-rc-danger rounded-xl">
              <AlertOctagon size={24} />
            </div>
            <div>
              <p className="text-xs text-rc-text-muted">Güvenlik İhlali / Başarısız</p>
              <p className="text-lg font-bold text-white mt-0.5">23</p>
            </div>
          </div>
          <div className="rc-card flex items-center gap-4">
            <div className="p-3 bg-rc-info/10 text-rc-info rounded-xl">
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="text-xs text-rc-text-muted">Toplam Kayıt (Son 24s)</p>
              <p className="text-lg font-bold text-white mt-0.5">14,271</p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-rc-bg-card p-4 rounded-xl border border-rc-border">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Kullanıcı, işlem, IP veya kaynak ara..."
              className="w-full bg-rc-bg-primary border border-rc-border rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-rc-gold"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={16} className="text-rc-text-muted hidden md:block" />
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="w-full md:w-auto bg-rc-bg-primary border border-rc-border text-rc-text-secondary text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-rc-gold cursor-pointer"
            >
              <option value="">Tüm Sonuçlar</option>
              <option value="BAŞARILI">Başarılı İşlemler</option>
              <option value="BAŞARISIZ">Başarısız / İhlal</option>
              <option value="UYARI">Uyarılar</option>
            </select>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="rc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="rc-table">
              <thead>
                <tr>
                  <th>Kullanıcı</th>
                  <th>İşlem</th>
                  <th>Kaynak Detay (ID)</th>
                  <th>IP Adresi</th>
                  <th>Sonuç</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-white font-medium">{log.user}</td>
                      <td className="font-mono text-[11px] text-rc-text-secondary">{log.action}</td>
                      <td className="text-xs text-rc-text-muted">{log.resourceDetails}</td>
                      <td className="font-mono text-xs">{log.ipAddress}</td>
                      <td>
                        <span className={`rc-badge ${resultStyles[log.result] || "rc-badge-info"}`}>
                          {log.result}
                        </span>
                      </td>
                      <td className="text-xs text-rc-text-muted">{log.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-rc-text-muted text-xs">
                      Seçilen kritere uygun denetim günlüğü bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
