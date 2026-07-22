"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Phone, Mail, ChevronRight, User, AlertCircle, ShieldAlert } from "lucide-react";
import { identityApi } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  
  // Tab State: "CUSTOMER" or "STAFF"
  const [activeTab, setActiveTab] = useState<"CUSTOMER" | "STAFF">("CUSTOMER");
  const [staffRole, setStaffRole] = useState("ADMIN");
  
  // Forms State
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isStaffRegisterMode, setIsStaffRegisterMode] = useState(false);
  const [regFullName, setRegFullName] = useState("");
  const [regGsm, setRegGsm] = useState("");
  const [regEmail, setRegEmail] = useState("");
  
  const [gsmNumber, setGsmNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Validation / Error / Loading State
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lockedTime, setLockedTime] = useState<number | null>(null);

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (otp !== "1234") {
        setError("Hatalı OTP kodu girdiniz. (Simülasyon için: 1234)");
        setLoading(false);
        return;
      }

      const response: any = await identityApi.loginCustomer(gsmNumber, otp);
      if (response && response.access_token) {
        localStorage.setItem("rc_token", response.access_token);
        localStorage.setItem("rc_user", JSON.stringify(response.user));
        router.push("/");
      } else {
        setError("Hatalı OTP kodu veya GSM numarası.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Giriş işlemi sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        full_name: regFullName,
        gsm_number: regGsm,
        email: regEmail
      };
      await identityApi.registerCustomer(payload);
      
      setIsRegisterMode(false);
      setGsmNumber(regGsm);
      alert("Kayıt başarılı! Lütfen GSM numaranız ve cihazınıza gelen OTP kodunuzla giriş yapın.");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response: any = await identityApi.loginStaff(email, password);
      
      if (response && response.access_token) {
        localStorage.setItem("rc_failed_attempts", "0");
        localStorage.removeItem("rc_lock_time");
        localStorage.setItem("rc_token", response.access_token);
        localStorage.setItem("rc_user", JSON.stringify(response.user));
        router.push("/");
      } else {
        setError("E-posta veya şifre hatalı.");
      }
    } catch (err: any) {
      // Backend handles lockout and return 423 Locked or 401 Unauthorized
      const errorMsg = err?.message || err?.response?.data?.detail || "E-posta veya şifre hatalı.";
      setError(errorMsg);
      
      // If the backend returns a specific locked message, we update our UI state
      if (errorMsg.includes("kilitlenmiştir") || err?.status === 423) {
        setLockedTime(15);
      }
    } finally {
      setLoading(false);
    }
  };

  // Check lockout state on mount
  useEffect(() => {
    const lockTimeStr = localStorage.getItem("rc_lock_time");
    if (lockTimeStr) {
      const lockTime = parseInt(lockTimeStr);
      if (lockTime > Date.now()) {
        const remainingMins = Math.ceil((lockTime - Date.now()) / 60000);
        setLockedTime(remainingMins);
        setError(`Hesabınız kilitli. Kalan süre: ${remainingMins} dakika.`);
      } else {
        localStorage.removeItem("rc_lock_time");
        localStorage.setItem("rc_failed_attempts", "0");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-rc-bg-primary flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rc-gold/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rc-bg-sidebar/40 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-rc-bg-card border border-rc-border rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-rc-gold/10 border border-rc-gold/20 mb-3">
            <Lock size={24} className="text-rc-gold" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">RetailCell Merkezi</h1>
          <p className="text-sm text-rc-text-muted mt-1">Lütfen giriş yöntemi seçiniz</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-rc-border">
          <button
            onClick={() => { setActiveTab("CUSTOMER"); setError(null); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "CUSTOMER" ? "border-rc-gold text-rc-gold bg-rc-gold/5" : "border-transparent text-rc-text-secondary hover:text-white"
            }`}
          >
            Müşteri / Kullanıcı
          </button>
          <button
            onClick={() => { setActiveTab("STAFF"); setError(null); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "STAFF" ? "border-rc-gold text-rc-gold bg-rc-gold/5" : "border-transparent text-rc-text-secondary hover:text-white"
            }`}
          >
            Personel (Merkez)
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rc-danger/15 border border-rc-danger/30 rounded-xl text-rc-danger text-xs font-semibold flex items-center gap-2">
              {lockedTime ? <ShieldAlert size={16} /> : <AlertCircle size={16} />}
              {error}
            </div>
          )}

          {/* CUSTOMER TAB */}
          {activeTab === "CUSTOMER" && (
            isRegisterMode ? (
              <form onSubmit={handleCustomerRegister} className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-medium text-rc-text-secondary block mb-1">Ad Soyad</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
                    <input
                      type="text"
                      required
                      placeholder="Ahmet Yılmaz"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full bg-rc-bg-primary border border-rc-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rc-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-rc-text-secondary block mb-1">GSM Numarası</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
                    <input
                      type="tel"
                      required
                      placeholder="532 123 45 67"
                      value={regGsm}
                      onChange={(e) => setRegGsm(e.target.value)}
                      className="w-full bg-rc-bg-primary border border-rc-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rc-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-rc-text-secondary block mb-1">E-Posta (Opsiyonel)</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
                    <input
                      type="email"
                      placeholder="ahmet@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-rc-bg-primary border border-rc-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rc-gold"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="rc-btn-primary w-full !py-3 !rounded-xl font-bold flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? "Kaydediliyor..." : "Kayıt Ol"}
                </button>
                <div className="text-center mt-3">
                  <p className="text-xs text-rc-text-muted">
                    Zaten hesabınız var mı?{" "}
                    <button type="button" onClick={() => { setIsRegisterMode(false); setError(null); }} className="text-rc-gold hover:underline">
                      Giriş Yapın
                    </button>
                  </p>
                </div>
              </form>
            ) : (
            <form onSubmit={handleCustomerLogin} className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">GSM Numarası</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
                  <input
                    type="tel"
                    required
                    placeholder="532 123 45 67"
                    value={gsmNumber}
                    onChange={(e) => setGsmNumber(e.target.value)}
                    className="w-full bg-rc-bg-primary border border-rc-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rc-gold"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">Tek Kullanımlık Şifre (OTP)</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="1234"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-rc-bg-primary border border-rc-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white tracking-widest focus:outline-none focus:border-rc-gold"
                  />
                </div>
                <p className="text-[10px] text-rc-text-muted mt-1.5 text-right cursor-pointer hover:text-rc-gold">OTP Kodunu Tekrar Gönder</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rc-btn-primary w-full !py-3 !rounded-xl font-bold flex items-center justify-center gap-2 mt-2"
              >
                {loading ? "Doğrulanıyor..." : "Giriş Yap"}
                {!loading && <ChevronRight size={16} />}
              </button>

              <div className="text-center mt-4 pt-4 border-t border-rc-border">
                <p className="text-xs text-rc-text-muted">
                  Hesabınız yok mu?{" "}
                  <button type="button" onClick={() => { setIsRegisterMode(true); setError(null); }} className="text-rc-gold hover:underline">
                    Hemen Kayıt Olun
                  </button>
                </p>
              </div>
            </form>
            )
          )}

          {/* STAFF TAB */}
          {activeTab === "STAFF" && (
            isStaffRegisterMode ? (
              <form onSubmit={handleStaffRegister} className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-medium text-rc-text-secondary block mb-1">Kayıt Olunacak Rol</label>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {[
                      { id: "ADMIN", label: "Yönetici" },
                      { id: "MANAGER", label: "Sorumlu" },
                      { id: "EXPERT", label: "Uzman" },
                      { id: "ANALYST", label: "Analist" },
                      { id: "OPERATOR", label: "Operatör" }
                    ].map((r) => (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setStaffRole(r.id)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition-all border ${
                          staffRole === r.id
                            ? "bg-rc-gold text-black border-rc-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]"
                            : "bg-rc-bg-primary text-rc-text-secondary border-rc-border hover:text-white"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-rc-text-secondary block mb-1">Ad Soyad</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
                    <input
                      type="text"
                      required
                      placeholder="Ahmet Yılmaz"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full bg-rc-bg-primary border border-rc-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rc-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-rc-text-secondary block mb-1">Kurumsal E-Posta</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
                    <input
                      type="email"
                      required
                      placeholder="ahmet@retailcell.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-rc-bg-primary border border-rc-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rc-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-rc-text-secondary block mb-1">Şifre Belirleyin</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-rc-bg-primary border border-rc-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rc-gold"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="rc-btn-primary w-full !py-3 !rounded-xl font-bold flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? "Kaydediliyor..." : "Personel Hesabı Oluştur"}
                </button>
                <div className="text-center mt-3">
                  <p className="text-xs text-rc-text-muted">
                    Zaten personel misiniz?{" "}
                    <button type="button" onClick={() => { setIsStaffRegisterMode(false); setError(null); }} className="text-rc-gold hover:underline">
                      Giriş Yapın
                    </button>
                  </p>
                </div>
              </form>
            ) : (
            <div className="animate-fade-in space-y-4">
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {[
                  { id: "ADMIN", label: "Yönetici" },
                  { id: "MANAGER", label: "Sorumlu" },
                  { id: "EXPERT", label: "Uzman" },
                  { id: "ANALYST", label: "Analist" },
                  { id: "OPERATOR", label: "Operatör" }
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setStaffRole(r.id)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition-all border ${
                      staffRole === r.id
                        ? "bg-rc-gold text-black border-rc-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]"
                        : "bg-rc-bg-primary text-rc-text-secondary border-rc-border hover:text-white"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">Kurumsal E-Posta</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
                  <input
                    type="email"
                    required
                    disabled={lockedTime !== null}
                    placeholder="admin@retailcell.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-rc-bg-primary border border-rc-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rc-gold disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-rc-text-secondary block mb-1">Sistem Şifresi</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
                  <input
                    type="password"
                    required
                    disabled={lockedTime !== null}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-rc-bg-primary border border-rc-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rc-gold disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || lockedTime !== null}
                className="rc-btn-primary w-full !py-3 !rounded-xl font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? "Giriş Yapılıyor..." : lockedTime ? "Hesap Kilitli" : "Yetkili Girişi"}
                {!loading && !lockedTime && <ShieldAlert size={16} />}
              </button>
            </form>

            <div className="text-center mt-4 pt-4 border-t border-rc-border">
              <p className="text-xs text-rc-text-muted">
                Kurumsal hesabınız yok mu?{" "}
                <button type="button" onClick={() => { setIsStaffRegisterMode(true); setError(null); }} className="text-rc-gold hover:underline">
                  Personel Kaydı Oluşturun
                </button>
              </p>
            </div>
          </div>
            )
          )}
        </div>
      </div>
      
      <p className="text-[10px] text-rc-text-muted mt-8 text-center">
        © 2025 RetailCell Operasyon Merkezi. Tüm Hakları Saklıdır.<br />
        Giriş yaparak kullanım koşulları ve gizlilik politikasını kabul etmiş olursunuz.
      </p>
    </div>
  );
}
