"use client";

import { Search, MapPin, Bell, User } from "lucide-react";

export default function Header() {
  return (
    <header className="h-14 bg-rc-bg-secondary border-b border-rc-border flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
        <input
          type="text"
          placeholder="Operasyon, bayi veya vaka ara..."
          className="w-full bg-rc-bg-primary border border-rc-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-rc-text-muted focus:outline-none focus:border-rc-gold transition-colors"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Region */}
        <div className="flex items-center gap-1.5 text-rc-text-secondary text-sm">
          <MapPin size={14} className="text-rc-gold" />
          <span>Bölge: EMEA</span>
        </div>

        {/* System Status */}
        <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-rc-bg-primary rounded-lg border border-rc-border">
          <div className="text-center">
            <p className="text-[10px] text-rc-text-muted">Sistem Sağlığı</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rc-success animate-pulse" />
              <span className="text-xs font-semibold text-rc-success">99.9%</span>
            </div>
          </div>
          <div className="w-px h-6 bg-rc-border" />
          <div className="text-center">
            <p className="text-[10px] text-rc-text-muted">Canlı Durum</p>
            <span className="text-xs font-semibold text-rc-gold">Operasyonel</span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-rc-text-secondary hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rc-danger" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rc-gold to-rc-gold-dark flex items-center justify-center">
            <User size={14} className="text-black" />
          </div>
          <span className="text-sm font-medium hidden lg:block">Alex Rivera</span>
        </div>
      </div>
    </header>
  );
}
