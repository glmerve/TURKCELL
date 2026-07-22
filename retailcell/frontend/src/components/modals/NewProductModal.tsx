"use client";

import { useState } from "react";
import { X, CheckCircle2, Package } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewProductModal({ isOpen, onClose }: ModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "TELEFON",
    price: "",
    stock: 50,
    reorder: 10,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-rc-bg-card border border-rc-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-rc-border bg-rc-bg-secondary">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Package size={18} className="text-rc-gold" />
            Yeni Ürün Ekle
          </h2>
          <button onClick={onClose} className="text-rc-text-muted hover:text-white">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 size={48} className="text-rc-success mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Ürün Başarıyla eklendi!</h3>
            <p className="text-xs text-rc-text-muted">Envanter kataloğuna yeni ürün dahil edildi.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-rc-text-secondary block mb-1">Ürün Adı</label>
              <input
                type="text"
                required
                placeholder="Örn: iPhone 16 Pro 256GB"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rc-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">SKU Kodu</label>
                <input
                  type="text"
                  required
                  placeholder="APL-IP16P-256"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rc-gold font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rc-gold"
                >
                  <option value="TELEFON">Telefon</option>
                  <option value="TABLET">Tablet</option>
                  <option value="MODEM">Modem</option>
                  <option value="AKILLI SAAT">Akıllı Saat</option>
                  <option value="SIM KART">SIM Kart</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">Fiyat (TL)</label>
                <input
                  type="text"
                  placeholder="59,999"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rc-gold"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">Stok Miktarı</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rc-gold"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">Sipariş Eşiği</label>
                <input
                  type="number"
                  value={formData.reorder}
                  onChange={(e) => setFormData({ ...formData, reorder: parseInt(e.target.value) })}
                  className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rc-gold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-rc-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-rc-text-secondary hover:text-white border border-rc-border"
              >
                İptal
              </button>
              <button type="submit" className="rc-btn-primary !text-xs !py-2 !px-5">
                Kaydet
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
