"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, FileText, Brain, Map, Trophy,
  MessageSquare, BarChart3, ClipboardList, Users, Settings,
  Plus, User, ChevronLeft, ChevronRight
} from "lucide-react";
import NewSupplyRequestModal from "@/components/modals/NewSupplyRequestModal";

const menuItems = [
  { href: "/", label: "Panel", icon: LayoutDashboard },
  { href: "/inventory", label: "Envanter", icon: Package },
  { href: "/supply-requests", label: "Tedarik Talepleri", icon: FileText },
  { href: "/ai-insights", label: "YZ Öngörüleri", icon: Brain },
  { href: "/regional-cases", label: "Bölgesel Vakalar", icon: Map },
  { href: "/leaderboard", label: "Liderlik Tablosu", icon: Trophy },
  { href: "/messages", label: "Mesajlar", icon: MessageSquare },
  { href: "/reports", label: "Raporlar", icon: BarChart3 },
  { href: "/audit-logs", label: "Denetim Günlükleri", icon: ClipboardList },
  { href: "/user-management", label: "Kullanıcı Yönetimi", icon: Users },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen bg-rc-bg-sidebar border-r border-rc-border flex flex-col z-40 transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-[240px]"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-rc-border">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rc-gold to-rc-gold-dark flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-sm">RC</span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-bold text-white leading-tight">RetailCell</h1>
              <p className="text-[10px] text-rc-text-muted">Operasyon Merkezi</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rc-sidebar-item ${isActive ? "active" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* New Request Button */}
        <div className="px-3 py-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className={`rc-btn-primary w-full flex items-center justify-center gap-2 ${collapsed ? "!px-2" : ""}`}
          >
            <Plus size={16} />
            {!collapsed && <span>Yeni Talep</span>}
          </button>
        </div>

        {/* Profile & Collapse */}
        <div className="border-t border-rc-border px-3 py-3">
          <div className="flex items-center justify-between">
            <Link href="/profile" className="flex items-center gap-2 text-rc-text-secondary hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-full bg-rc-bg-hover flex items-center justify-center">
                <User size={14} />
              </div>
              {!collapsed && <span className="text-sm">Profil</span>}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-rc-text-muted hover:text-white p-1 transition-colors"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </div>
      </aside>

      <NewSupplyRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
