"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Settings, Save, Bell, Shield, Sliders, Cpu, CheckCircle2, Factory } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Settings Form State
  const [settings, setSettings] = useState({
    siteName: "RetailCell Operasyon Merkezi",
    maintenanceMode: false,
    aiRiskThreshold: 85,
    autoReorder: true,
    slaP0: 4,
    slaP1: 12,
    slaP2: 48,
    emailAlerts: true,
    smsAlerts: false,
    twoFactorAuth: true,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }, 1200);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="text-rc-gold" size={24} />
              Sistem Ayarları
            </h1>
            <p className="text-sm text-rc-text-secondary mt-0.5">
              Platform konfigürasyonları, YZ eşik değerleri ve operasyonel SLA parametreleri.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rc-btn-primary flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">Kaydediliyor...</span>
            ) : (
              <span className="flex items-center gap-2"><Save size={16} /> Değişiklikleri Kaydet</span>
            )}
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 bg-rc-success/15 border border-rc-success/30 rounded-xl text-rc-success text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={18} />
            Ayarlar başarıyla güncellendi ve sisteme uygulandı.
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Settings Sidebar Tabs */}
          <div className="w-full md:w-64 flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "general" ? "bg-rc-gold/15 text-rc-gold border border-rc-gold/30" : "text-rc-text-secondary hover:bg-rc-bg-card hover:text-white border border-transparent"
              }`}
            >
              <Sliders size={18} /> Genel Ayarlar
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "ai" ? "bg-rc-gold/15 text-rc-gold border border-rc-gold/30" : "text-rc-text-secondary hover:bg-rc-bg-card hover:text-white border border-transparent"
              }`}
            >
              <Cpu size={18} /> YZ Model Yapılandırması
            </button>
            <button
              onClick={() => setActiveTab("sla")}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "sla" ? "bg-rc-gold/15 text-rc-gold border border-rc-gold/30" : "text-rc-text-secondary hover:bg-rc-bg-card hover:text-white border border-transparent"
              }`}
            >
              <Factory size={18} /> SLA & Operasyon
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "notifications" ? "bg-rc-gold/15 text-rc-gold border border-rc-gold/30" : "text-rc-text-secondary hover:bg-rc-bg-card hover:text-white border border-transparent"
              }`}
            >
              <Bell size={18} /> Bildirim Tercihleri
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "security" ? "bg-rc-gold/15 text-rc-gold border border-rc-gold/30" : "text-rc-text-secondary hover:bg-rc-bg-card hover:text-white border border-transparent"
              }`}
            >
              <Shield size={18} /> Güvenlik
            </button>
          </div>

          {/* Settings Content Area */}
          <div className="flex-1">
            <div className="rc-card h-full min-h-[400px]">
              
              {/* GENERAL SETTINGS */}
              {activeTab === "general" && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-bold text-white border-b border-rc-border pb-3 mb-4">Genel Platform Ayarları</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-semibold text-rc-text-secondary block mb-1.5">Platform Adı</label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="w-full max-w-md bg-rc-bg-primary border border-rc-border rounded-lg p-2.5 text-white text-sm focus:border-rc-gold focus:outline-none"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-rc-bg-primary/50 border border-rc-border rounded-xl max-w-md">
                      <div>
                        <h4 className="text-sm font-bold text-white">Bakım Modu</h4>
                        <p className="text-xs text-rc-text-muted mt-0.5">Sistemi bayiler için geçici olarak dondurur.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.maintenanceMode}
                          onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-rc-bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rc-danger"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* AI SETTINGS */}
              {activeTab === "ai" && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-bold text-white border-b border-rc-border pb-3 mb-4 flex items-center gap-2">
                    <Cpu size={20} className="text-rc-gold" /> Yapay Zeka Eşik Değerleri
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-semibold text-rc-text-secondary block mb-1.5">Stok Tükenme Riski Eşik Değeri (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.aiRiskThreshold}
                        onChange={(e) => setSettings({ ...settings, aiRiskThreshold: parseInt(e.target.value) || 85 })}
                        className="w-full max-w-[150px] bg-rc-bg-primary border border-rc-border rounded-lg p-2.5 text-white text-sm focus:border-rc-gold focus:outline-none"
                      />
                      <p className="text-xs text-rc-text-muted mt-2">
                        YZ modeli %{settings.aiRiskThreshold} ve üzeri risk öngördüğünde P0 öncelikli uyarı üretir.
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-rc-bg-primary/50 border border-rc-border rounded-xl max-w-md mt-6">
                      <div>
                        <h4 className="text-sm font-bold text-white">Otonom Sipariş Tetikleme</h4>
                        <p className="text-xs text-rc-text-muted mt-0.5">Kritik stok uyarısı alındığında ana depoya otomatik talep açar.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.autoReorder}
                          onChange={(e) => setSettings({ ...settings, autoReorder: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-rc-bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rc-gold"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SLA SETTINGS */}
              {activeTab === "sla" && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-bold text-white border-b border-rc-border pb-3 mb-4">SLA (Hizmet Seviyesi) Süreleri</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="text-xs font-semibold text-rc-text-secondary block mb-1.5 flex justify-between">
                        <span>P0 - Kritik (Kırmızı Kod)</span>
                        <span className="text-white">{settings.slaP0} Saat</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="24"
                        value={settings.slaP0}
                        onChange={(e) => setSettings({ ...settings, slaP0: parseInt(e.target.value) })}
                        className="w-full accent-rc-danger cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-rc-text-secondary block mb-1.5 flex justify-between">
                        <span>P1 - Yüksek Öncelikli</span>
                        <span className="text-white">{settings.slaP1} Saat</span>
                      </label>
                      <input
                        type="range"
                        min="6"
                        max="48"
                        value={settings.slaP1}
                        onChange={(e) => setSettings({ ...settings, slaP1: parseInt(e.target.value) })}
                        className="w-full accent-rc-warning cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-rc-text-secondary block mb-1.5 flex justify-between">
                        <span>P2 - Normal Standart Sevkiyat</span>
                        <span className="text-white">{settings.slaP2} Saat</span>
                      </label>
                      <input
                        type="range"
                        min="24"
                        max="120"
                        value={settings.slaP2}
                        onChange={(e) => setSettings({ ...settings, slaP2: parseInt(e.target.value) })}
                        className="w-full accent-rc-info cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATION SETTINGS */}
              {activeTab === "notifications" && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-bold text-white border-b border-rc-border pb-3 mb-4">Bildirim Tercihleri</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-rc-bg-primary/50 border border-rc-border rounded-xl max-w-md">
                      <div>
                        <h4 className="text-sm font-bold text-white">E-Posta Bildirimleri</h4>
                        <p className="text-xs text-rc-text-muted mt-0.5">SLA ihlallerinde e-posta gönderir.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.emailAlerts}
                          onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-rc-bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rc-success"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-rc-bg-primary/50 border border-rc-border rounded-xl max-w-md">
                      <div>
                        <h4 className="text-sm font-bold text-white">SMS Uyarıları</h4>
                        <p className="text-xs text-rc-text-muted mt-0.5">Sadece P0 kriz durumlarında anlık SMS iletir.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.smsAlerts}
                          onChange={(e) => setSettings({ ...settings, smsAlerts: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-rc-bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rc-success"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY SETTINGS */}
              {activeTab === "security" && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-bold text-white border-b border-rc-border pb-3 mb-4">Güvenlik ve Yetkilendirme</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-rc-bg-primary/50 border border-rc-border rounded-xl max-w-md mb-6">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">İki Faktörlü Doğrulama (2FA)</h4>
                      <p className="text-xs text-rc-text-muted mt-0.5">Sistem yöneticileri için zorunlu OTP doğrulaması.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-rc-bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rc-gold"></div>
                    </label>
                  </div>

                  <div>
                    <button className="px-4 py-2 bg-rc-bg-hover border border-rc-border rounded-lg text-sm font-bold text-white hover:bg-rc-bg-primary transition-colors">
                      Şifreyi Değiştir
                    </button>
                    <p className="text-xs text-rc-text-muted mt-3">En son şifre değişikliği: 45 gün önce (Önerilen: 90 gün)</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
