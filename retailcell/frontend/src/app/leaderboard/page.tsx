"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Trophy, Award, Medal, Star, Flame, Zap } from "lucide-react";

const leaderboardData = [
  { rank: 1, dealer: "Kadıköy Ana Mağaza", manager: "Ahmet Yılmaz", region: "İstanbul", points: 1450, badges: 12, slaRate: "%99.4" },
  { rank: 2, dealer: "Kızılay Operasyon", manager: "Elif Demir", region: "Ankara", points: 1320, badges: 10, slaRate: "%98.8" },
  { rank: 3, dealer: "Alsancak Premium Bayi", manager: "Caner Kaya", region: "İzmir", points: 1280, badges: 9, slaRate: "%98.1" },
  { rank: 4, dealer: "Nilüfer Dijital Mağaza", manager: "Selin Şahin", region: "Bursa", points: 1150, badges: 8, slaRate: "%97.5" },
  { rank: 5, dealer: "Lara Merkez Şube", manager: "Murat Çelik", region: "Antalya", points: 1040, badges: 7, slaRate: "%96.9" },
];

const badgesCatalog = [
  { name: "SLA Şampiyonu", desc: "5 talep zamanında teslim edildi", category: "SLA", points: "+100 Puan", icon: Trophy, color: "text-yellow-400" },
  { name: "Hızlı Yanıtçı", desc: "İlk yanıt süresi < 1 saat", category: "Performans", points: "+75 Puan", icon: Zap, color: "text-blue-400" },
  { name: "Mükemmel Stok", desc: "30 gün stok tükenme yaşanmadı", category: "Stok", points: "+150 Puan", icon: Star, color: "text-purple-400" },
  { name: "Teslimat Yıldızı", desc: "10 teslimat sıfır hatayla yapıldı", category: "Lojistik", points: "+120 Puan", icon: Medal, color: "text-green-400" },
];

export default function LeaderboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-rc-gold" size={24} />
            Bayi Liderlik Tablosu & Oyunlaştırma
          </h1>
          <p className="text-sm text-rc-text-secondary mt-0.5">
            SLA başarısı, stok optimizasyonu ve rozet puanlarına göre bayi sıralaması.
          </p>
        </div>

        {/* Top 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaderboardData.slice(0, 3).map((item) => (
            <div key={item.rank} className={`rc-card flex items-center gap-4 relative overflow-hidden ${item.rank === 1 ? "border-rc-gold bg-gradient-to-br from-rc-bg-card to-amber-950/20" : ""}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${item.rank === 1 ? "bg-rc-gold text-black" : item.rank === 2 ? "bg-slate-300 text-black" : "bg-amber-700 text-white"}`}>
                #{item.rank}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{item.dealer}</h3>
                <p className="text-xs text-rc-text-muted">{item.manager} • {item.region}</p>
                <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                  <span className="text-rc-gold">{item.points} Puan</span>
                  <span className="text-rc-text-secondary">{item.badges} Rozet</span>
                  <span className="text-rc-success">{item.slaRate} SLA</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Leaderboard Table */}
        <div className="rc-card">
          <h3 className="text-sm font-semibold text-white mb-4">Genel Bayi Sıralaması</h3>
          <div className="overflow-x-auto">
            <table className="rc-table">
              <thead>
                <tr>
                  <th>Sıra</th>
                  <th>Bayi Adı</th>
                  <th>Sorumlu</th>
                  <th>Bölge</th>
                  <th>SLA Başarısı</th>
                  <th>Rozet Sayısı</th>
                  <th>Toplam Puan</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((row) => (
                  <tr key={row.rank}>
                    <td className="font-bold text-rc-gold">#{row.rank}</td>
                    <td className="font-medium text-white">{row.dealer}</td>
                    <td>{row.manager}</td>
                    <td>{row.region}</td>
                    <td className="text-rc-success font-semibold">{row.slaRate}</td>
                    <td><span className="rc-badge rc-badge-gold">{row.badges} Rozet</span></td>
                    <td className="font-bold text-white">{row.points} Puan</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Badges Catalog */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Award className="text-rc-gold" size={18} /> Kazanılabilir Rozetler Kataloğu
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {badgesCatalog.map((b, i) => {
              const IconComp = b.icon;
              return (
                <div key={i} className="rc-card flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg bg-rc-bg-hover ${b.color}`}>
                    <IconComp size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{b.name}</h4>
                    <p className="text-xs text-rc-text-muted mt-0.5">{b.desc}</p>
                    <span className="inline-block text-[11px] font-bold text-rc-gold mt-2">{b.points}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
