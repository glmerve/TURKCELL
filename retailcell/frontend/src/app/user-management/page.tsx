"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Users, UserPlus } from "lucide-react";
import { identityApi } from "@/services/api";

const initialUsers = [
  { id: "1", name: "Alex Rivera", email: "admin@retailcell.com", role: "ADMIN", status: "ACTIVE" },
  { id: "2", name: "Ahmet Yılmaz", email: "kadikoy@retailcell.com", role: "DEALER", status: "ACTIVE" },
  { id: "3", name: "Elif Demir", email: "kizilay@retailcell.com", role: "MANAGER", status: "ACTIVE" },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState(initialUsers);

  useEffect(() => {
    async function fetchUsers() {
      const data: any = await identityApi.getUsers();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        const formatted = data.items.map((u: any) => ({
          id: u.id,
          name: u.full_name || u.username,
          email: u.email,
          role: u.role || "DEALER",
          status: u.status || "ACTIVE",
        }));
        setUsers(formatted);
      }
    }
    fetchUsers();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="text-rc-gold" size={24} />
              Kullanıcı Yönetimi (`GET /api/v1/users/`)
            </h1>
            <p className="text-sm text-rc-text-secondary mt-0.5">Kullanıcılar, roller ve yetkiler.</p>
          </div>
          <button className="rc-btn-primary flex items-center gap-2 cursor-pointer"><UserPlus size={16} /> Kullanıcı Ekle</button>
        </div>
        <div className="rc-card">
          <table className="rc-table">
            <thead>
              <tr><th>Kullanıcı Adı</th><th>E-Posta</th><th>Rol</th><th>Durum</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="text-white font-medium">{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="rc-badge rc-badge-gold">{u.role}</span></td>
                  <td><span className="rc-badge rc-badge-success">{u.status === "ACTIVE" ? "Aktif" : "Pasif"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
