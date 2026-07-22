"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Phone, Mail, ChevronRight, User, AlertCircle, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  // Tab State: "CUSTOMER" or "STAFF"
  const [activeTab, setActiveTab] = useState<"CUSTOMER" | "STAFF">("CUSTOMER");
  
  // Forms State
  const [gsmNumber, setGsmNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Validation / Error / Loading State
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lockedTime, setLockedTime] = useState<number | null>(null);

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (otp !== "1234") {
        setError("Hatalı OTP kodu girdiniz. (Simülasyon için: 1234)");
        setLoading(false);
        return;
      }
      
      // Simulate successful customer login
      localStorage.setItem("rc_token", "customer_mock_token");
      localStorage.setItem("rc_user", JSON.stringify({ name: "Müşteri", role: "VIEWER", type: "CUSTOMER" }));
      router.push("/");
    }, 1000);
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      // 1. Password Check (Mock Security)
      if (password !== "Admin123!") {
        const attemptsStr = localStorage.getItem("rc_failed_attempts") || "0";
        let attempts = parseInt(attemptsStr) + 1;
        
        if (attempts >= 5) {
          const lockTime = Date.now() + 15 * 60 * 1000; // 15 mins
          localStorage.setItem("rc_lock_time", lockTime.toString());
          setLockedTime(15);
          setError("Hesabınız güvenlik nedeniyle 15 dakika kilitlenmiştir.");
        } else {
          localStorage.setItem("rc_failed_attempts", attempts.toString());
          setError(`E-posta veya şifre hatalı. Kalan deneme hakkı: ${5 - attempts}`);
        }
        
        setLoading(false);
        return;
      }

      // 2. Case-based Email to Role Assignment
      let assignedRole = "DEALER";
      let assignedName = "Yetkili Personel";

      const mail = email.toLowerCase();
      switch (true) {
        case mail.includes("admin"):
          assignedRole = "ADMIN";
          assignedName = "Sistem Yöneticisi";
          break;
        case mail.includes("uzman"):
          assignedRole = "EXPERT";
          assignedName = "Lojistik Uzmanı";
          break;
        case mail.includes("analist"):
          assignedRole = "ANALYST";
          assignedName = "Stok Analisti";
          break;
        case mail.includes("operator"):
          assignedRole = "OPERATOR";
          assignedName = "Depo Operatörü";
          break;
        case mail.includes("sorumlu"):
        case mail.includes("manager"):
          assignedRole = "MANAGER";
          assignedName = "Bölge Sorumlusu";
          break;
        case mail.includes("supervizor"):
          assignedRole = "SUPERVISOR";
          assignedName = "Ağ Süpervizörü";
          break;
        default:
          setError("Bu e-posta adresi sistemde bulunamadı. Lütfen atanmış personellerden birini girin (admin, uzman, analist vb.)");
          setLoading(false);
          return;
      }

      // Simulate successful staff login with dynamic role
      localStorage.setItem("rc_failed_attempts", "0");
      localStorage.removeItem("rc_lock_time");
      localStorage.setItem("rc_token", `staff_mock_token_${assignedRole}`);
      localStorage.setItem("rc_user", JSON.stringify({ name: assignedName, role: assignedRole, type: "STAFF" }));
      router.push("/");
    }, 1000);
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
            </form>
          )}

          {/* STAFF TAB */}
          {activeTab === "STAFF" && (
            <form onSubmit={handleStaffLogin} className="space-y-4 animate-fade-in">
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
