"use client";

import MainLayout from "@/components/layout/MainLayout";
import { MessageSquare, Send } from "lucide-react";

export default function MessagesPage() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-rc-gold" size={24} />
            Operasyonel Mesajlar
          </h1>
          <p className="text-sm text-rc-text-secondary mt-0.5">Bayiler ve merkezin canlı iletişim kanalı.</p>
        </div>
        <div className="rc-card p-4 flex flex-col h-96 justify-between">
          <div className="space-y-3">
            <div className="bg-rc-bg-hover p-3 rounded-lg w-3/4">
              <p className="text-xs font-bold text-rc-gold">Kadıköy Bayi</p>
              <p className="text-sm text-white mt-1">iPhone 15 Pro sevkiyatı gecikebilir mi?</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Mesajınızı yazın..." className="w-full bg-rc-bg-primary border border-rc-border rounded-lg px-4 text-sm text-white" />
            <button className="rc-btn-primary p-2.5"><Send size={16} /></button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
