"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Map, AlertTriangle, Plus, Search, Filter, ShieldCheck, Activity, ChevronRight, Layers } from "lucide-react";
import NewCaseModal from "@/components/modals/NewCaseModal";

// 7 Türkiye Bölgesi Verileri
const regionsData = [
  { id: "Marmara", name: "Marmara Bölgesi", health: "%94.2", cases: 4, status: "Healthy", color: "#22C55E", dealers: 420 },
  { id: "İç Anadolu", name: "İç Anadolu Bölgesi", health: "%84.1", cases: 8, status: "Critical", color: "#EF4444", dealers: 310 },
  { id: "Ege", name: "Ege Bölgesi", health: "%96.5", cases: 2, status: "Healthy", color: "#22C55E", dealers: 240 },
  { id: "Akdeniz", name: "Akdeniz Bölgesi", health: "%91.0", cases: 5, status: "Warning", color: "#F59E0B", dealers: 195 },
  { id: "Karadeniz", name: "Karadeniz Bölgesi", health: "%93.4", cases: 3, status: "Healthy", color: "#22C55E", dealers: 160 },
  { id: "Doğu Anadolu", name: "Doğu Anadolu Bölgesi", health: "%86.5", cases: 7, status: "Warning", color: "#F59E0B", dealers: 110 },
  { id: "Güneydoğu Anadolu", name: "Güneydoğu Anadolu", health: "%89.2", cases: 6, status: "Warning", color: "#F59E0B", dealers: 147 },
];

const initialCases = [
  { id: "CASE-1084", title: "Kadıköy Mağazası Superbox Stok Krizı", region: "Marmara", dealer: "İstanbul - Kadıköy", priority: "P0", status: "ESCALATED", assignedTo: "Ahmet Yılmaz", date: "22 Tem 2025" },
  { id: "CASE-1083", title: "Kızılay Şubesi Sevkiyat Gecikmesi", region: "İç Anadolu", dealer: "Ankara - Kızılay", priority: "P1", status: "IN_PROGRESS", assignedTo: "Elif Demir", date: "22 Tem 2025" },
  { id: "CASE-1082", title: "Alsancak Premium SIM Kart Stok Yetersizliği", region: "Ege", dealer: "İzmir - Alsancak", priority: "P2", status: "RESOLVED", assignedTo: "Caner Kaya", date: "21 Tem 2025" },
  { id: "CASE-1081", title: "Lara Şube iPhone 15 Pro Yanlış İkmal", region: "Akdeniz", dealer: "Antalya - Lara", priority: "P1", status: "OPEN", assignedTo: "Murat Çelik", date: "21 Tem 2025" },
  { id: "CASE-1080", title: "Nilüfer Mağaza Lojistik Ulaşım Engeli", region: "Marmara", dealer: "Bursa - Nilüfer", priority: "P3", status: "CLOSED", assignedTo: "Selin Şahin", date: "20 Tem 2025" },
];

const statusBadges: Record<string, { label: string; style: string }> = {
  OPEN: { label: "Açık Vaka", style: "rc-badge-danger" },
  IN_PROGRESS: { label: "İşlemde", style: "rc-badge-warning" },
  ESCALATED: { label: "Üst Seviyeye Aktarıldı", style: "rc-badge-gold" },
  RESOLVED: { label: "Çözüldü", style: "rc-badge-success" },
  CLOSED: { label: "Kapatıldı", style: "rc-badge-info" },
};

const priorityStyles: Record<string, string> = {
  P0: "text-rc-danger font-bold",
  P1: "text-rc-warning font-semibold",
  P2: "text-rc-info",
  P3: "text-rc-success",
};

export default function RegionalCasesPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [cases, setCases] = useState(initialCases);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCaseCreated = (newCase: any) => {
    setCases((prev) => [newCase, ...prev]);
  };

  const filteredCases = cases.filter((c) => {
    const matchesRegion = !selectedRegion || c.region === selectedRegion;
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Map className="text-rc-gold" size={24} />
              Bölgesel Vakalar & Canlı Isı Haritası
            </h1>
            <p className="text-sm text-rc-text-secondary mt-0.5">
              Türkiye genelindeki 7 coğrafi bölgedeki envanter sağlık durumları ve aktif vakalar.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rc-btn-primary flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Yeni Vaka Bildir</span>
          </button>
        </div>

        {/* Türkiye Regional Heatmap Grid & Map Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Representation & Region Selector */}
          <div className="lg:col-span-2 rc-card relative overflow-hidden bg-gradient-to-br from-rc-bg-card to-rc-bg-secondary border border-rc-border p-6 flex flex-col justify-between min-h-[340px]">
            <div className="flex items-center justify-between mb-4 border-b border-rc-border pb-3">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-rc-gold" />
                <h3 className="text-sm font-bold text-white">Türkiye Bölgesel Stok Sağlık Isı Haritası</h3>
              </div>
              {selectedRegion && (
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="text-xs text-rc-gold hover:underline flex items-center gap-1"
                >
                  Tüm Bölgeleri Göster ✕
                </button>
              )}
            </div>

            {/* Visual Interactive Map Nodes */}
            <div className="relative w-full h-52 bg-rc-bg-primary/60 border border-rc-border/60 rounded-xl p-4 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#2A2D35_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              {/* Regions Buttons Positioned on Interactive Map Canvas */}
              <div className="relative z-10 grid grid-cols-3 md:grid-cols-4 gap-3 w-full max-w-xl">
                {regionsData.map((reg) => {
                  const isSelected = selectedRegion === reg.id;
                  return (
                    <button
                      key={reg.id}
                      onClick={() => setSelectedRegion(isSelected ? null : reg.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-rc-gold bg-rc-gold/15 shadow-lg shadow-rc-gold/10 scale-105"
                          : "border-rc-border bg-rc-bg-card/80 hover:border-rc-border-light hover:bg-rc-bg-hover"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: reg.color }} />
                        <span className="text-[10px] font-bold text-rc-text-muted">{reg.cases} Vaka</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{reg.id}</p>
                      <p className="text-[11px] font-semibold mt-0.5" style={{ color: reg.color }}>
                        {reg.health} Sağlık
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-rc-text-muted mt-4">
              <span>* Bölge kutularına tıklayarak altındaki vakaları süzebilirsiniz.</span>
              <span className="text-rc-gold font-medium">Toplam 1,482 Bayi Bağlı</span>
            </div>
          </div>

          {/* Regional Health Stats Sidebar */}
          <div className="rc-card flex flex-col justify-between space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-rc-border pb-3">
              <Activity size={16} className="text-rc-gold" />
              Bölgesel Özet Performans
            </h3>

            <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
              {regionsData.map((reg) => (
                <div
                  key={reg.id}
                  onClick={() => setSelectedRegion(selectedRegion === reg.id ? null : reg.id)}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    selectedRegion === reg.id ? "bg-rc-gold/10 border-rc-gold" : "bg-rc-bg-primary/50 border-rc-border hover:bg-rc-bg-hover"
                  }`}
                >
                  <div>
                    <p className="font-bold text-white">{reg.name}</p>
                    <p className="text-[10px] text-rc-text-muted">{reg.dealers} Bayi • {reg.cases} Aktif Vaka</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm" style={{ color: reg.color }}>{reg.health}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regional Cases Data Table Section */}
        <div className="rc-card space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-rc-border pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle size={16} className="text-rc-gold" />
                {selectedRegion ? `${selectedRegion} Bölgesi Vakaları` : "Tüm Bölgesel Vakalar"} ({filteredCases.length})
              </h3>
              <p className="text-xs text-rc-text-muted mt-0.5">Operasyon merkezi tarafından takip edilen aktif ve çözülmüş vakalar.</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Vaka no veya başlık ara..."
                  className="w-full bg-rc-bg-primary border border-rc-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-rc-gold"
                />
              </div>

              <select
                value={selectedRegion || ""}
                onChange={(e) => setSelectedRegion(e.target.value || null)}
                className="bg-rc-bg-primary border border-rc-border text-rc-text-secondary text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-rc-gold cursor-pointer"
              >
                <option value="">Tüm Bölgeler</option>
                {regionsData.map((r) => (
                  <option key={r.id} value={r.id}>{r.id}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="rc-table">
              <thead>
                <tr>
                  <th>Vaka No</th>
                  <th>Vaka Başlığı</th>
                  <th>Bölge</th>
                  <th>İlgili Bayi</th>
                  <th>Öncelik</th>
                  <th>Durum</th>
                  <th>Atanan Yönetici</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.length > 0 ? (
                  filteredCases.map((c) => {
                    const badge = statusBadges[c.status] || { label: c.status, style: "rc-badge-info" };
                    return (
                      <tr key={c.id}>
                        <td className="font-mono text-rc-gold text-xs font-bold">{c.id}</td>
                        <td className="text-white font-medium">{c.title}</td>
                        <td><span className="rc-badge rc-badge-gold">{c.region}</span></td>
                        <td>{c.dealer}</td>
                        <td><span className={priorityStyles[c.priority] || priorityStyles["P2"]}>{c.priority}</span></td>
                        <td><span className={`rc-badge ${badge.style}`}>{badge.label}</span></td>
                        <td>{c.assignedTo}</td>
                        <td className="text-xs text-rc-text-secondary">{c.date}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-rc-text-muted text-xs">
                      Seçilen kritere uygun bölgesel vaka bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <NewCaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCaseCreated}
      />
    </MainLayout>
  );
}
