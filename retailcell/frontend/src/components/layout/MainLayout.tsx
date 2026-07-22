"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-[240px] flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-rc-bg-primary">
          {children}
        </main>
      </div>
    </div>
  );
}
