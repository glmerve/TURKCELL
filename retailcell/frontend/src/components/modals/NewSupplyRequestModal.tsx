"use client";

import { useState } from "react";
import { X, CheckCircle2, FileText } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewSupplyRequestModal({ isOpen, onClose }: ModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    dealer: "Kadıköy Ana Mağaza",
    priority: "P2",
    product: "iPhone 15 Pro 128GB",
    quantity: 10,
    description: "",
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
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rc-border bg-rc-bg-secondary">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText size={18} className="text-rc-gold" />
            Yeni Tedarik Talebi Oluştur
          </h2>
          <button onClick={onClose} className="text-rc-text-muted hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 size={48} className="text-rc-success mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Talep Başarıyla Oluşturuldu!</h3>
            <p className="text-xs text-rc-text-muted">
              Talep numarası <span className="text-rc-gold font-mono">SR-001235</span> olarak sisteme işlendi. Otomatik SLA süresi başlatıldı.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-rc-text-secondary block mb-1">Talep Başlığı</label>
              <input
                type="text"
                required
                placeholder="Örn: Kadıköy Mağazası Acil Stok İkmali"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rc-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">Bayi / Mağaza</label>
                <select
                  value={formData.dealer}
                  onChange={(e) => setFormData({ ...formData, dealer: e.target.value })}
                  className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rc-gold"
                >
                  <option value="Kadıköy Ana Mağaza">Kadıköy Ana Mağaza</option>
                  <option value="Kızılay Operasyon">Kızılay Operasyon</option>
                  <option value="Alsancak Premium">Alsancak Premium</option>
                  <option value="Nilüfer Dijital">Nilüfer Dijital</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">Öncelik Seviyesi</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rc-gold"
                >
                  <option value="P0">P0 - Acil Kriz (4 Saat SLA)</option>
                  <option value="P1">P1 - Yüksek (12 Saat SLA)</option>
                  <option value="P2">P2 - Normal (48 Saat SLA)</option>
                  <option value="P3">P3 - Düşük (120 Saat SLA)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">Talep Edilen Ürün</label>
                <select
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rc-gold"
                >
                  <option value="iPhone 15 Pro 128GB">iPhone 15 Pro 128GB</option>
                  <option value="Samsung Galaxy S24 Ultra">Samsung Galaxy S24 Ultra</option>
                  <option value="Turkcell Superbox 5G">Turkcell Superbox 5G</option>
                  <option value="iPad Air M2 11 inch">iPad Air M2 11 inch</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">Adet</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rc-gold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-rc-text-secondary block mb-1">Açıklama / Notlar</label>
              <textarea
                rows={2}
                placeholder="Talep detayları..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rc-gold"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-rc-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-rc-text-secondary hover:text-white border border-rc-border"
              >
                İptal
              </button>
              <button type="submit" className="rc-btn-primary !text-xs !py-2 !px-5">
                Talebi Gönder
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
