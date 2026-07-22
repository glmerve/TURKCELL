"use client";

import MainLayout from "@/components/layout/MainLayout";
import MetricCard from "@/components/ui/MetricCard";
import { Brain, RefreshCw, TrendingUp, AlertOctagon, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const forecastChartData = [
  { day: "Pzt", gercek: 42, tahmin: 45, altGuven: 40, ustGuven: 50 },
  { day: "Sal", gercek: 38, tahmin: 40, altGuven: 35, ustGuven: 45 },
  { day: "Çar", gercek: 55, tahmin: 52, altGuven: 48, ustGuven: 58 },
  { day: "Per", gercek: 60, tahmin: 63, altGuven: 57, ustGuven: 68 },
  { day: "Cum", gercek: 72, tahmin: 70, altGuven: 65, ustGuven: 76 },
  { day: "Cmt", gercek: 90, tahmin: 88, altGuven: 82, ustGuven: 94 },
  { day: "Paz", gercek: 65, tahmin: 67, altGuven: 60, ustGuven: 72 },
];

const riskPredictions = [
  { product: "iPhone 15 Pro 128GB", region: "İstanbul - Kadıköy", risk: "CRITICAL", prob: "%94.2", action: "Otomatik Otomatik İkmal Önerildi" },
  { product: "Samsung S24 Ultra 256GB", region: "Ankara - Kızılay", risk: "HIGH", prob: "%88.5", action: "Stok Transferi Önerildi" },
  { product: "Turkcell Superbox 5G", region: "İzmir - Alsancak", risk: "MEDIUM", prob: "%62.1", action: "İzleniyor" },
  { product: "iPad Air M2 11\"", region: "Bursa - Nilüfer", risk: "LOW", prob: "%12.4", action: "Normal Seviye" },
];

export default function AIInsightsPage() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Brain className="text-rc-gold" size={24} />
              YZ Öngörüleri & Makine Öğrenimi Motoru
            </h1>
            <p className="text-sm text-rc-text-secondary mt-0.5">
              Scikit-Learn RandomForest ve GradientBoosting tahmin modelleri analizi.
            </p>
          </div>
          <button className="rc-btn-primary flex items-center justify-center gap-2">
            <RefreshCw size={16} />
            <span>Modeli Yeniden Eğit</span>
          </button>
        </div>

        {/* Model Accuracy Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Talep Tahmin R²" value="0.924" subtitle="Yüksek açıklayıcılık" icon={<TrendingUp size={18} />} accentColor="text-rc-gold" />
          <MetricCard title="Ortalama Hata (MAE)" value="3.42 adet" subtitle="Stok tahmini sapması" icon={<CheckCircle2 size={18} />} />
          <MetricCard title="Risk Sınıflandırma F1" value="0.951" subtitle="High/Medium/Low kesinlik" icon={<AlertOctagon size={18} />} />
          <MetricCard title="Eğitim Veri Hacmi" value="150+ Satır" subtitle="Sentetik & Gerçek veri seti" icon={<Brain size={18} />} />
        </div>

        {/* Forecast Chart */}
        <div className="rc-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">7 Günlük Gerçekleşen vs Tahmini Talep</h3>
              <p className="text-xs text-rc-text-muted">%90 Güven Aralığı ile RandomForest Regresyonu</p>
            </div>
            <span className="rc-badge rc-badge-gold">Canlı Model v1.0.4</span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={forecastChartData}>
              <defs>
                <linearGradient id="colorTahmin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F5A623" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2D35" />
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1E2128', border: '1px solid #2A2D35', borderRadius: 8, color: '#fff' }} />
              <Legend />
              <Area type="monotone" dataKey="tahmin" name="Tahmini Talep" stroke="#F5A623" fill="url(#colorTahmin)" strokeWidth={2} />
              <Area type="monotone" dataKey="gercek" name="Gerçekleşen Talep" stroke="#3B82F6" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Risk Predictions Table */}
        <div className="rc-card">
          <h3 className="text-sm font-semibold text-white mb-4">YZ Stok Tükenme Riski Tahminleri</h3>
          <div className="overflow-x-auto">
            <table className="rc-table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Bayi / Bölge</th>
                  <th>Risk Seviyesi</th>
                  <th>Olasılık Skoru</th>
                  <th>YZ Önerilen Eylem</th>
                </tr>
              </thead>
              <tbody>
                {riskPredictions.map((r, i) => (
                  <tr key={i}>
                    <td className="font-medium text-white">{r.product}</td>
                    <td>{r.region}</td>
                    <td>
                      <span className={`rc-badge ${r.risk === "CRITICAL" || r.risk === "HIGH" ? "rc-badge-danger" : r.risk === "MEDIUM" ? "rc-badge-warning" : "rc-badge-success"}`}>
                        {r.risk}
                      </span>
                    </td>
                    <td className="font-bold text-rc-gold">{r.prob}</td>
                    <td className="text-xs text-rc-text-secondary font-medium">{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
