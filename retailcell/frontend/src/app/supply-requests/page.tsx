"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { FileText, Plus, Search, Filter } from "lucide-react";
import NewSupplyRequestModal from "@/components/modals/NewSupplyRequestModal";

const requestsData = [
  { id: "SR-001234", title: "iPhone 15 Pro Max Stok Talebi", dealer: "Kadıköy Ana Mağaza", priority: "P0", status: "İşleniyor", sla: "2.4 Saat Kalan", date: "22 Tem 2025" },
  { id: "SR-001233", title: "Galaxy S24 Ultra Acil Sipariş", dealer: "Kızılay Operasyon", priority: "P1", status: "Onay Bekliyor", sla: "8.1 Saat Kalan", date: "22 Tem 2025" },
  { id: "SR-001232", title: "Airpods Pro 2 Yeniden Sipariş", dealer: "Alsancak Premium", priority: "P2", status: "Kargoda", sla: "24.5 Saat Kalan", date: "21 Tem 2025" },
  { id: "SR-001231", title: "SIM Kart Toplu Sipariş", dealer: "Nilüfer Dijital", priority: "P3", status: "Teslim Edildi", sla: "-", date: "21 Tem 2025" },
];

const priorityColors: Record<string, string> = {
  P0: "text-rc-danger font-bold",
  P1: "text-rc-warning font-semibold",
  P2: "text-rc-info",
  P3: "text-rc-success",
};

const statusColors: Record<string, string> = {
  "İşleniyor": "rc-badge-info",
  "Onay Bekliyor": "rc-badge-warning",
  "Kargoda": "rc-badge-gold",
  "Teslim Edildi": "rc-badge-success",
};

export default function SupplyRequestsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const filtered = requestsData.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !priorityFilter || r.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-rc-gold" size={24} />
              Tedarik Talepleri & SLA Takibi
            </h1>
            <p className="text-sm text-rc-text-secondary mt-0.5">
              Bayilerden gelen envanter ikmal talepleri ve durum makinesi geçişleri.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rc-btn-primary flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Yeni Talep Oluştur
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-rc-bg-card p-4 rounded-xl border border-rc-border">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Talep No veya Başlık ara..."
              className="w-full bg-rc-bg-primary border border-rc-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-rc-gold"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-rc-bg-primary border border-rc-border text-rc-text-secondary text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-rc-gold"
            >
              <option value="">Tüm Öncelikler</option>
              <option value="P0">P0 - Acil</option>
              <option value="P1">P1 - Yüksek</option>
              <option value="P2">P2 - Normal</option>
              <option value="P3">P3 - Düşük</option>
            </select>
          </div>
        </div>

        <div className="rc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="rc-table">
              <thead>
                <tr>
                  <th>Talep No</th>
                  <th>Başlık</th>
                  <th>Bayi</th>
                  <th>Öncelik</th>
                  <th>Durum</th>
                  <th>SLA Süresi</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-rc-gold text-xs">{r.id}</td>
                    <td className="text-white font-medium">{r.title}</td>
                    <td>{r.dealer}</td>
                    <td><span className={priorityColors[r.priority]}>{r.priority}</span></td>
                    <td><span className={`rc-badge ${statusColors[r.status]}`}>{r.status}</span></td>
                    <td className="text-xs text-rc-text-secondary">{r.sla}</td>
                    <td>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <NewSupplyRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </MainLayout>
  );
}
