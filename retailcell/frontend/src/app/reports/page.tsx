"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { BarChart3, Download, FileText, Calendar, Filter, CheckCircle2, FileSpreadsheet, TrendingUp, ShieldAlert, Sparkles } from "lucide-react";

interface ReportItem {
  id: string;
  title: string;
  category: "SLA" | "INVENTORY" | "AI" | "PERFORMANCE";
  period: string;
  format: "PDF" | "CSV" | "EXCEL";
  size: string;
  generatedBy: string;
  date: string;
  downloadUrl: string;
}

const reportsCatalog: ReportItem[] = [
  { id: "REP-2025-01", title: "Aylık Bayi SLA Başarı & Performans Raporu", category: "SLA", period: "Temmuz 2025", format: "PDF", size: "2.4 MB", generatedBy: "Sistem (Otomatik)", date: "22 Tem 2025", downloadUrl: "#" },
  { id: "REP-2025-02", title: "Envanter Stok Devir Hızı & Kritik Stok Uyarısı", category: "INVENTORY", period: "Q3 2025", format: "PDF", size: "4.1 MB", generatedBy: "Alex Rivera", date: "21 Tem 2025", downloadUrl: "#" },
  { id: "REP-2025-03", title: "Scikit-Learn YZ Talep Tahmin Doğruluk Analizi", category: "AI", period: "Temmuz 2025", format: "PDF", size: "1.8 MB", generatedBy: "AI Engine v1.0", date: "20 Tem 2025", downloadUrl: "#" },
  { id: "REP-2025-04", title: "Türkiye 7 Bölge Operasyonel Isı Haritası Özeti", category: "PERFORMANCE", period: "Haziran 2025", format: "PDF", size: "3.2 MB", generatedBy: "Merkez Operasyon", date: "18 Tem 2025", downloadUrl: "#" },
  { id: "REP-2025-05", title: "Bayi Rozet ve Oyunlaştırma Puan Sıralaması", category: "PERFORMANCE", period: "Temmuz 2025", format: "EXCEL", size: "850 KB", generatedBy: "Gamification Engine", date: "15 Tem 2025", downloadUrl: "#" },
  { id: "REP-2025-06", title: "Denetim Günlükleri & Güvenlik Erişim Kayıtları", category: "SLA", period: "Son 30 Gün", format: "CSV", size: "1.2 MB", generatedBy: "Security Audit", date: "10 Tem 2025", downloadUrl: "#" },
];

export default function ReportsPage() {
  const [reports, setReports] = useState(reportsCatalog);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Function to generate and download dynamic PDF report file
  const handleDownloadPDF = (report: ReportItem) => {
    setDownloadingId(report.id);

    setTimeout(() => {
      // Create PDF text content
      const content = `====================================================
               RETAILCELL OPERASYON MERKEZİ
                 RESMİ SİSTEM RAPORU
====================================================

Rapor Numarası : ${report.id}
Rapor Başlığı  : ${report.title}
Rapor Kategorisi: ${report.category}
Rapor Dönemi   : ${report.period}
Oluşturan      : ${report.generatedBy}
Tarih          : ${report.date}
Dosya Formatı  : ${report.format} (${report.size})

----------------------------------------------------
ÖZET ANALİZ VERİLERİ:
- Genel Bayi SLA Başarı Oranı : %98.4 (Hedef: %95)
- YZ Talep Tahmin Doğruluğu   : %94.8 (R² Score: 0.948)
- Aktif Bayi Sayısı           : 1,482 Bayi
- Tamamlanan Sevkiyat         : 842 Adet / Gün
- Kritik Stok İkazı           : 18 Ürün (Aksiyon Alındı)

----------------------------------------------------
Sorumlu Redaksiyon: RetailCell Operasyon Yönetimi
Bu döküman dijital olarak imzalanmıştır.
====================================================`;

      const blob = new Blob([content], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RetailCell_${report.id}_${report.category}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadingId(null);
      setSuccessMessage(`${report.title} PDF olarak başarıyla indirildi!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }, 1000);
  };

  const filteredReports = reports.filter((r) => {
    const matchesCategory = !selectedCategory || r.category === selectedCategory;
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Title & Main Export Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-rc-gold" size={24} />
              Raporlar & Analitik Merkezi
            </h1>
            <p className="text-sm text-rc-text-secondary mt-0.5">
              Sistem performansı, YZ doğruluk metrikleri ve bayi SLA raporlarını indirin.
            </p>
          </div>

          <button
            onClick={() => handleDownloadPDF(reports[0])}
            className="rc-btn-primary flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Download size={16} />
            <span>Genel Özet PDF İndir</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 bg-rc-success/15 border border-rc-success/30 rounded-xl text-rc-success text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={16} />
            {successMessage}
          </div>
        )}

        {/* Metric Cards Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rc-card flex items-center justify-between">
            <div>
              <p className="text-xs text-rc-text-muted">Aylık SLA Başarısı</p>
              <p className="text-xl font-bold text-rc-success mt-1">%98.4</p>
              <span className="text-[10px] text-rc-text-secondary">Hedef %95 Aşıldı</span>
            </div>
            <div className="p-3 bg-rc-success/10 rounded-xl text-rc-success">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="rc-card flex items-center justify-between">
            <div>
              <p className="text-xs text-rc-text-muted">Stok Devir Hızı</p>
              <p className="text-xl font-bold text-white mt-1">14.2 Gün</p>
              <span className="text-[10px] text-rc-text-secondary">Önceki aya göre -2.1 gün</span>
            </div>
            <div className="p-3 bg-rc-gold/10 rounded-xl text-rc-gold">
              <FileSpreadsheet size={20} />
            </div>
          </div>

          <div className="rc-card flex items-center justify-between">
            <div>
              <p className="text-xs text-rc-text-muted">YZ Tahmin Sapması</p>
              <p className="text-xl font-bold text-rc-gold mt-1">3.42 Adet</p>
              <span className="text-[10px] text-rc-text-secondary">MAE Düşük Tolerans</span>
            </div>
            <div className="p-3 bg-rc-gold/10 rounded-xl text-rc-gold">
              <Sparkles size={20} />
            </div>
          </div>

          <div className="rc-card flex items-center justify-between">
            <div>
              <p className="text-xs text-rc-text-muted">Kritik Stok Uyarısı</p>
              <p className="text-xl font-bold text-rc-danger mt-1">18 Ürün</p>
              <span className="text-[10px] text-rc-danger">Aksiyon Alındı</span>
            </div>
            <div className="p-3 bg-rc-danger/10 rounded-xl text-rc-danger">
              <ShieldAlert size={20} />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-rc-bg-card p-4 rounded-xl border border-rc-border">
          <div className="relative w-full md:w-80">
            <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rapor başlığı veya No ile ara..."
              className="w-full bg-rc-bg-primary border border-rc-border rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rc-gold"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-rc-bg-primary border border-rc-border text-rc-text-secondary text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-rc-gold cursor-pointer"
            >
              <option value="">Tüm Kategori Raporları</option>
              <option value="SLA">SLA & Performans</option>
              <option value="INVENTORY">Envanter & Stok</option>
              <option value="AI">YZ & Tahmin</option>
              <option value="PERFORMANCE">Bayi & Oyunlaştırma</option>
            </select>
          </div>
        </div>

        {/* Reports Table Section */}
        <div className="rc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="rc-table">
              <thead>
                <tr>
                  <th>Rapor No</th>
                  <th>Rapor Başlığı</th>
                  <th>Kategori</th>
                  <th>Dönem</th>
                  <th>Format</th>
                  <th>Boyut</th>
                  <th>Tarih</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td className="font-mono text-rc-gold text-xs font-bold">{report.id}</td>
                    <td className="text-white font-medium flex items-center gap-2">
                      <FileText size={16} className="text-rc-gold flex-shrink-0" />
                      <span>{report.title}</span>
                    </td>
                    <td><span className="rc-badge rc-badge-gold">{report.category}</span></td>
                    <td className="text-xs text-rc-text-secondary">{report.period}</td>
                    <td><span className="rc-badge rc-badge-info">{report.format}</span></td>
                    <td className="text-xs text-rc-text-muted">{report.size}</td>
                    <td className="text-xs text-rc-text-secondary">{report.date}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(report)}
                        disabled={downloadingId === report.id}
                        className="rc-btn-primary !text-xs !py-1.5 !px-3 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Download size={13} />
                        <span>{downloadingId === report.id ? "İndiriliyor..." : "PDF İndir"}</span>
                      </button>
                    </td>
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
