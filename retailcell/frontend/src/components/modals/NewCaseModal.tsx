"use client";

import { useState } from "react";
import { X, CheckCircle2, Map, AlertTriangle } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newCase: any) => void;
}

export default function NewCaseModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    region: "Marmara",
    dealer: "İstanbul - Kadıköy",
    priority: "P1",
    description: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const newCase = {
      id: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formData.title,
      region: formData.region,
      dealer: formData.dealer,
      priority: formData.priority,
      status: "OPEN",
      assignedTo: "Ahmet Yılmaz",
      date: new Date().toLocaleDateString("tr-TR"),
    };

    if (onSuccess) {
      onSuccess(newCase);
    }

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-rc-bg-card border border-rc-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-[10000]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-rc-border bg-rc-bg-secondary">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-rc-gold" />
            Yeni Bölgesel Vaka Bildir
          </h2>
          <button onClick={onClose} className="text-rc-text-muted hover:text-white">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 size={52} className="text-rc-success mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Bölgesel Vaka Kaydedildi!</h3>
            <p className="text-xs text-rc-text-muted">Bölge sorumlusuna ve operasyon merkezine bildirim gönderildi.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-rc-text-secondary block mb-1">Vaka Başlığı</label>
              <input
                type="text"
                required
                placeholder="Örn: Marmara Bölgesi Superbox Sevkiyat Gecikmesi"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rc-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">Bölge</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full bg-rc-bg-primary border border-rc-border text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-rc-gold cursor-pointer"
                >
                  <option value="Marmara">Marmara</option>
                  <option value="İç Anadolu">İç Anadolu</option>
                  <option value="Ege">Ege</option>
                  <option value="Akdeniz">Akdeniz</option>
                  <option value="Karadeniz">Karadeniz</option>
                  <option value="Doğu Anadolu">Doğu Anadolu</option>
                  <option value="Güneydoğu Anadolu">Güneydoğu Anadolu</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">Öncelik</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-rc-bg-primary border border-rc-border text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-rc-gold cursor-pointer"
                >
                  <option value="P0">P0 - Kriz (Kritik)</option>
                  <option value="P1">P1 - Yüksek</option>
                  <option value="P2">P2 - Normal</option>
                  <option value="P3">P3 - Düşük</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-rc-text-secondary block mb-1">İlgili Bayi / Lokasyon</label>
              <input
                type="text"
                placeholder="Örn: İstanbul - Kadıköy Şubesi"
                value={formData.dealer}
                onChange={(e) => setFormData({ ...formData, dealer: e.target.value })}
                className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rc-gold"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-rc-text-secondary block mb-1">Vaka Detayı</label>
              <textarea
                rows={3}
                placeholder="Vaka açıklamasını giriniz..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rc-gold"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-rc-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-rc-text-secondary hover:text-white border border-rc-border"
              >
                İptal
              </button>
              <button type="submit" className="rc-btn-primary !text-xs !py-2 !px-5 font-bold cursor-pointer">
                Vakayı Oluştur
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
