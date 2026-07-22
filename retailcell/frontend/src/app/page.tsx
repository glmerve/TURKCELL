"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import MetricCard from "@/components/ui/MetricCard";
import NewSupplyRequestModal from "@/components/modals/NewSupplyRequestModal";
import {
  Building2, FileBox, AlertTriangle, CheckSquare,
  Brain, Clock, Warehouse, Truck, Download
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { inventoryApi } from "@/services/api";

const riskData = [
  { name: "Normal Stok", value: 62, color: "#22C55E" },
  { name: "Fazla Stok Riski", value: 24, color: "#F59E0B" },
  { name: "Stok Yok Uyarısı", value: 14, color: "#EF4444" },
];

const priorityData = [
  { name: "P0", value: 8, fill: "#EF4444" },
  { name: "P1", value: 24, fill: "#F59E0B" },
  { name: "P2", value: 56, fill: "#3B82F6" },
  { name: "P3", value: 32, fill: "#22C55E" },
];

const defaultRequests = [
  { id: "SR-001234", title: "iPhone 15 Pro Max Stok Talebi", dealer: "İstanbul - Kadıköy", priority: "P0", status: "İşleniyor", sla: "2.4 saat", date: "22 Tem 2025" },
  { id: "SR-001233", title: "Galaxy S24 Ultra Acil Sipariş", dealer: "Ankara - Kızılay", priority: "P1", status: "Onay Bekliyor", sla: "8.1 saat", date: "22 Tem 2025" },
  { id: "SR-001232", title: "Airpods Pro 2 Yeniden Sipariş", dealer: "İzmir - Alsancak", priority: "P2", status: "Kargoda", sla: "24.5 saat", date: "21 Tem 2025" },
  { id: "SR-001231", title: "SIM Kart Toplu Sipariş", dealer: "Bursa - Nilüfer", priority: "P3", status: "Teslim Edildi", sla: "-", date: "21 Tem 2025" },
  { id: "SR-001230", title: "Huawei Watch GT4 Stok", dealer: "Antalya - Lara", priority: "P2", status: "Onaylandı", sla: "36.2 saat", date: "20 Tem 2025" },
];

const trendData = [
  { month: "Oca", talep: 320, sevkiyat: 290 },
  { month: "Şub", talep: 280, sevkiyat: 270 },
  { month: "Mar", talep: 350, sevkiyat: 340 },
  { month: "Nis", talep: 400, sevkiyat: 380 },
  { month: "May", talep: 380, sevkiyat: 370 },
  { month: "Haz", talep: 420, sevkiyat: 410 },
  { month: "Tem", talep: 450, sevkiyat: 430 },
];

const statusColors: Record<string, string> = {
  "İşleniyor": "rc-badge-info",
  "Onay Bekliyor": "rc-badge-warning",
  "Kargoda": "rc-badge-gold",
  "Teslim Edildi": "rc-badge-success",
  "Onaylandı": "rc-badge-success",
};

const priorityColors: Record<string, string> = {
  P0: "text-rc-danger font-bold",
  P1: "text-rc-warning font-semibold",
  P2: "text-rc-info",
  P3: "text-rc-success",
};

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exported, setExported] = useState(false);
  const [requests, setRequests] = useState(defaultRequests);

  const loadRequests = async () => {
    let localItems = [];
    try {
      const stored = localStorage.getItem("retailcell_supply_requests");
      if (stored) {
        localItems = JSON.parse(stored);
      }
    } catch (e) {}

    try {
      const apiData: any = await inventoryApi.getSupplyRequests();
      if (apiData && Array.isArray(apiData.items) && apiData.items.length > 0) {
        const apiItems = apiData.items.map((i: any) => ({
          id: i.request_number || i.id,
          title: i.title,
          dealer: i.dealer_name || i.region || "Kadıköy Ana Mağaza",
          priority: i.priority || "P2",
          status: i.status || "İşleniyor",
          sla: "48.0 saat",
          date: new Date(i.created_at || Date.now()).toLocaleDateString("tr-TR"),
        }));
        setRequests([...localItems, ...apiItems, ...defaultRequests]);
        return;
      }
    } catch (err) {}

    setRequests([...localItems, ...defaultRequests]);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSuccess = (newReq: any) => {
    loadRequests();
  };

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">RetailCell Operasyon Merkezi</h1>
            <p className="text-sm text-rc-text-secondary mt-0.5">
              Gerçek zamanlı tedarik zinciri optimizasyonu için YZ destekli Bayi Envanter Yönetim Platformu.
            </p>
          </div>
        </div>

        {/* Metric Cards Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Toplam Bayi"
            value="1,482"
            icon={<Building2 size={18} />}
            trend="↗ bu ay +12"
            trendType="up"
          />
          <MetricCard
            title="Aktif Tedarik Vakaları"
            value={requests.length > 5 ? requests.length + 337 : 342}
            icon={<FileBox size={18} />}
            subtitle="%84'ü işleniyor"
          />
          <MetricCard
            title="Kritik Vakalar"
            value="18"
            icon={<AlertTriangle size={18} />}
            subtitle="Acil eylem gerektiriyor"
            accentColor="text-rc-danger"
          />
          <MetricCard
            title="Bekleyen Onaylar"
            value="57"
            icon={<CheckSquare size={18} />}
            subtitle="Ort. bekleme: 4.2 sa"
          />
        </div>

        {/* Metric Cards Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="YZ Doğruluk %"
            value="%94.8"
            icon={<Brain size={18} />}
            trend="↖ +0.4% iyileşme"
            trendType="up"
            accentColor="text-rc-gold"
          />
          <MetricCard
            title="Ort. SLA"
            value="2.4 gün"
            icon={<Clock size={18} />}
            subtitle="Yıllık -15%"
            trendType="up"
          />
          <MetricCard
            title="Toplam Envanter"
            value="2.1M"
            icon={<Warehouse size={18} />}
            subtitle="Ağ genelindeki toplam ürün"
          />
          <MetricCard
            title="Günlük Sevkiyat"
            value="842"
            icon={<Truck size={18} />}
            subtitle="Yüksek trafik yoğunluğu"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trend Chart */}
          <div className="rc-card lg:col-span-1">
            <h3 className="text-sm font-semibold text-white mb-4">Talep vs Sevkiyat Trendi</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTalep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSevk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2D35" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1E2128', border: '1px solid #2A2D35', borderRadius: 8, color: '#fff', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="talep" stroke="#F5A623" fill="url(#colorTalep)" strokeWidth={2} />
                <Area type="monotone" dataKey="sevkiyat" stroke="#3B82F6" fill="url(#colorSevk)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Distribution */}
          <div className="rc-card">
            <h3 className="text-sm font-semibold text-white mb-4">Envanter Risk Dağılımı</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={riskData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={0}>
                    {riskData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <text x="50%" y="46%" textAnchor="middle" fill="#F5A623" fontSize={20} fontWeight="bold">%62</text>
                  <text x="50%" y="60%" textAnchor="middle" fill="#6B7280" fontSize={10}>Sağlıklı</text>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {riskData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-rc-text-secondary">{item.name}</span>
                    <span className="text-xs font-semibold ml-auto" style={{ color: item.color }}>%{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="rc-card">
            <h3 className="text-sm font-semibold text-white mb-4">Öncelik Dağılımı</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2D35" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1E2128', border: '1px solid #2A2D35', borderRadius: 8, color: '#fff', fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supply Requests Table */}
        <div className="rc-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Tedarik Talepleri ({requests.length})</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="text-xs text-rc-text-secondary hover:text-white px-3 py-1.5 rounded-lg border border-rc-border transition-colors flex items-center gap-1.5"
              >
                <Download size={14} />
                {exported ? "İndirildi ✓" : "CSV Dışa Aktar"}
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="rc-btn-primary !text-xs !py-1.5 !px-3"
              >
                Yeni Talep
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="rc-table">
              <thead>
                <tr>
                  <th>Talep No</th>
                  <th>Başlık</th>
                  <th>Bayi</th>
                  <th>Öncelik</th>
                  <th>Durum</th>
                  <th>SLA Kalan</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((sr, idx) => (
                  <tr key={`${sr.id}-${idx}`}>
                    <td className="font-mono text-rc-gold text-xs">{sr.id}</td>
                    <td className="text-white font-medium">{sr.title}</td>
                    <td>{sr.dealer}</td>
                    <td><span className={priorityColors[sr.priority] || priorityColors["P2"]}>{sr.priority}</span></td>
                    <td><span className={`rc-badge ${statusColors[sr.status] || "rc-badge-info"}`}>{sr.status}</span></td>
                    <td>{sr.sla}</td>
                    <td>{sr.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <NewSupplyRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </MainLayout>
  );
}
