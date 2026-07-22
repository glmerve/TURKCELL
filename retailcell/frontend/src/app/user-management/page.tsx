"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Users, UserPlus, Search, Filter, Edit, Trash2, MoreVertical } from "lucide-react";
import { identityApi } from "@/services/api";
import NewUserModal from "@/components/modals/NewUserModal";

const initialUsers = [
  { id: "USR-001", name: "Alex Rivera", email: "admin@retailcell.com", role: "ADMIN", status: "ACTIVE", lastLogin: "22 Tem 2025 19:30" },
  { id: "USR-002", name: "Ahmet Yılmaz", email: "kadikoy@retailcell.com", role: "DEALER", status: "ACTIVE", lastLogin: "22 Tem 2025 18:45" },
  { id: "USR-003", name: "Elif Demir", email: "kizilay@retailcell.com", role: "MANAGER", status: "ACTIVE", lastLogin: "22 Tem 2025 17:22" },
  { id: "USR-004", name: "Caner Kaya", email: "alsancak@retailcell.com", role: "DEALER", status: "INACTIVE", lastLogin: "15 Tem 2025 10:11" },
];

const roleStyles: Record<string, string> = {
  ADMIN: "rc-badge-danger",
  MANAGER: "rc-badge-info",
  DEALER: "rc-badge-gold",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  const fetchUsers = async () => {
    let localItems = [];
    try {
      const stored = localStorage.getItem("retailcell_users");
      if (stored) {
        localItems = JSON.parse(stored);
      }
    } catch (e) {}

    try {
      const data: any = await identityApi.getUsers();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        const formatted = data.items.map((u: any) => ({
          id: u.id,
          name: u.full_name || u.username,
          email: u.email,
          role: u.role || "DEALER",
          status: u.status || "ACTIVE",
          lastLogin: "22 Tem 2025 (API)",
        }));
        setUsers([...localItems, ...formatted, ...initialUsers]);
        return;
      }
    } catch (error) {}
    
    setUsers([...localItems, ...initialUsers]);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserAdded = (newUser: any) => {
    fetchUsers();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="text-rc-gold" size={24} />
              Kullanıcı Yönetimi
            </h1>
            <p className="text-sm text-rc-text-secondary mt-0.5">Sistem kullanıcıları, yetki rolleri ve hesap durumları.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rc-btn-primary flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus size={16} /> Kullanıcı Ekle
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-rc-bg-card p-4 rounded-xl border border-rc-border">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="İsim veya e-posta ile ara..."
              className="w-full bg-rc-bg-primary border border-rc-border rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-rc-gold"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={16} className="text-rc-text-muted hidden md:block" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-auto bg-rc-bg-primary border border-rc-border text-rc-text-secondary text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-rc-gold cursor-pointer"
            >
              <option value="">Tüm Roller</option>
              <option value="ADMIN">Sistem Yöneticisi (ADMIN)</option>
              <option value="MANAGER">Operasyon (MANAGER)</option>
              <option value="DEALER">Bayi (DEALER)</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="rc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="rc-table">
              <thead>
                <tr>
                  <th>Kullanıcı Adı</th>
                  <th>E-Posta Adresi</th>
                  <th>Sistem Rolü</th>
                  <th>Hesap Durumu</th>
                  <th>Son Giriş</th>
                  <th className="text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u, i) => (
                    <tr key={`${u.id}-${i}`}>
                      <td className="text-white font-medium flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rc-bg-hover border border-rc-border flex items-center justify-center text-xs font-bold text-rc-gold">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="text-xs text-rc-text-secondary">{u.email}</td>
                      <td>
                        <span className={`rc-badge ${roleStyles[u.role] || "rc-badge-info"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`rc-badge ${u.status === "ACTIVE" ? "rc-badge-success" : "rc-badge-danger"}`}>
                          {u.status === "ACTIVE" ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="text-xs text-rc-text-muted">{u.lastLogin}</td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-rc-text-muted hover:text-white transition-colors" title="Düzenle">
                            <Edit size={16} />
                          </button>
                          <button className="p-1.5 text-rc-text-muted hover:text-rc-danger transition-colors" title="Sil">
                            <Trash2 size={16} />
                          </button>
                          <button className="p-1.5 text-rc-text-muted hover:text-white transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-rc-text-muted text-xs">
                      Seçilen kritere uygun kullanıcı bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <NewUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleUserAdded}
      />
    </MainLayout>
  );
}
