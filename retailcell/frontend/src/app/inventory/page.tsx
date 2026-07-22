"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useState } from "react";
import { Package, Search, Filter, Plus } from "lucide-react";
import NewProductModal from "@/components/modals/NewProductModal";

const initialProducts = [
  { id: "PROD-0001", name: "iPhone 15 Pro 128GB", sku: "APL-IP15P-128", category: "TELEFON", price: "49,999 TL", stock: 45, reorder: 15, status: "IN_STOCK", risk: "LOW", region: "Marmara" },
  { id: "PROD-0002", name: "Samsung Galaxy S24 Ultra", sku: "SMG-S24U-256", category: "TELEFON", price: "54,999 TL", stock: 8, reorder: 10, status: "LOW_STOCK", risk: "HIGH", region: "İç Anadolu" },
  { id: "PROD-0003", name: "iPad Air M2 11 inch", sku: "APL-IPDA-11", category: "TABLET", price: "24,999 TL", stock: 0, reorder: 5, status: "OUT_OF_STOCK", risk: "CRITICAL", region: "Ege" },
  { id: "PROD-0004", name: "Turkcell Superbox 5G Modem", sku: "TRK-SBX-5G", category: "MODEM", price: "1,499 TL", stock: 120, reorder: 30, status: "IN_STOCK", risk: "LOW", region: "Marmara" },
  { id: "PROD-0005", name: "Apple Watch Series 9 GPS", sku: "APL-AWS9-45", category: "AKILLI SAAT", price: "14,999 TL", stock: 12, reorder: 15, status: "LOW_STOCK", risk: "MEDIUM", region: "Akdeniz" },
  { id: "PROD-0006", name: "5G Yedek SIM Kart Paket (100'lü)", sku: "TRK-SIM-5G100", category: "SIM KART", price: "500 TL", stock: 450, reorder: 100, status: "IN_STOCK", risk: "LOW", region: "Tüm Bölgeler" },
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = initialProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesStatus = !selectedStatus || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="text-rc-gold" size={24} />
              Envanter Yönetimi
            </h1>
            <p className="text-sm text-rc-text-secondary mt-0.5">
              Bayi stok seviyeleri, kritik stok uyarıları ve ürün kataloğu.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rc-btn-primary flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Yeni Ürün Ekle</span>
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
              placeholder="Ürün adı veya SKU ile ara..."
              className="w-full bg-rc-bg-primary border border-rc-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-rc-gold transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-rc-bg-primary border border-rc-border text-rc-text-secondary text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-rc-gold cursor-pointer"
            >
              <option value="">Tüm Kategoriler</option>
              <option value="TELEFON">Telefon</option>
              <option value="TABLET">Tablet</option>
              <option value="MODEM">Modem</option>
              <option value="AKILLI SAAT">Akıllı Saat</option>
              <option value="SIM KART">SIM Kart</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-rc-bg-primary border border-rc-border text-rc-text-secondary text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-rc-gold cursor-pointer"
            >
              <option value="">Tüm Durumlar</option>
              <option value="IN_STOCK">Stokta Var</option>
              <option value="LOW_STOCK">Kritik Stok</option>
              <option value="OUT_OF_STOCK">Stok Yok</option>
            </select>
            <button className="flex items-center gap-1.5 text-xs text-rc-text-secondary hover:text-white px-3 py-2 rounded-lg border border-rc-border">
              <Filter size={14} /> Filtrele
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="rc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="rc-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Ürün Adı</th>
                  <th>Kategori</th>
                  <th>Fiyat</th>
                  <th>Stok Adedi</th>
                  <th>Sipariş Eşiği</th>
                  <th>Risk Seviyesi</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs text-rc-gold">{p.sku}</td>
                    <td className="font-medium text-white">{p.name}</td>
                    <td>{p.category}</td>
                    <td className="font-semibold text-white">{p.price}</td>
                    <td>
                      <span className={`font-bold ${p.stock === 0 ? "text-rc-danger" : p.stock <= p.reorder ? "text-rc-warning" : "text-white"}`}>
                        {p.stock} adet
                      </span>
                    </td>
                    <td>{p.reorder} adet</td>
                    <td>
                      <span className={`rc-badge ${p.risk === "HIGH" || p.risk === "CRITICAL" ? "rc-badge-danger" : p.risk === "MEDIUM" ? "rc-badge-warning" : "rc-badge-success"}`}>
                        {p.risk}
                      </span>
                    </td>
                    <td>
                      <span className={`rc-badge ${p.status === "IN_STOCK" ? "rc-badge-success" : p.status === "LOW_STOCK" ? "rc-badge-warning" : "rc-badge-danger"}`}>
                        {p.status === "IN_STOCK" ? "Stokta" : p.status === "LOW_STOCK" ? "Az Stok" : "Stok Tükendi"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <NewProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </MainLayout>
  );
}
