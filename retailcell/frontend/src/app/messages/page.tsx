"use client";

import { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { MessageSquare, Send, User, Search, CheckCheck, Circle, Clock } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "dealer";
  senderName: string;
  text: string;
  timestamp: string;
}

interface ChatContact {
  id: string;
  name: string;
  region: string;
  avatar: string;
  status: "online" | "offline";
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
}

const initialContacts: ChatContact[] = [
  {
    id: "kadikoy",
    name: "Kadıköy Ana Mağaza",
    region: "İstanbul / Marmara",
    avatar: "KM",
    status: "online",
    lastMessage: "iPhone 15 Pro stok durumu hakkında acil bilgilendirme alabilir miyiz?",
    lastMessageTime: "19:42",
    messages: [
      { id: "m1", sender: "dealer", senderName: "Kadıköy Bayi", text: "Merhaba, iPhone 15 Pro Max sevkiyatı ne zaman ulaşır?", timestamp: "19:30" },
      { id: "m2", sender: "user", senderName: "Siz (Merkez)", text: "Merhaba Ahmet Bey, SR-001234 numaralı talebiniz kargoya verildi. Bugün 16:00'da teslim edilecek.", timestamp: "19:35" },
      { id: "m3", sender: "dealer", senderName: "Kadıköy Bayi", text: "iPhone 15 Pro stok durumu hakkında acil bilgilendirme alabilir miyiz?", timestamp: "19:42" },
    ],
  },
  {
    id: "kizilay",
    name: "Kızılay Operasyon Şubesi",
    region: "Ankara / İç Anadolu",
    avatar: "KÖ",
    status: "online",
    lastMessage: "Tedarik talebimiz onaylandı mı acaba?",
    lastMessageTime: "18:15",
    messages: [
      { id: "m10", sender: "dealer", senderName: "Kızılay Bayi", text: "Tedarik talebimiz onaylandı mı acaba?", timestamp: "18:15" },
      { id: "m11", sender: "user", senderName: "Siz (Merkez)", text: "İnceleniyor, kısa süre içerisinde onaylanacaktır.", timestamp: "18:20" },
    ],
  },
  {
    id: "alsancak",
    name: "Alsancak Premium Bayi",
    region: "İzmir / Ege",
    avatar: "AP",
    status: "offline",
    lastMessage: "Kargo takip numarasını sisteme girdik.",
    lastMessageTime: "Dün",
    messages: [
      { id: "m20", sender: "dealer", senderName: "Alsancak Bayi", text: "Kargo takip numarasını sisteme girdik.", timestamp: "Dün 14:10" },
    ],
  },
  {
    id: "nilufer",
    name: "Nilüfer Dijital Mağaza",
    region: "Bursa / Marmara",
    avatar: "ND",
    status: "online",
    lastMessage: "SIM Kart teslimatı tamamlandı, teşekkürler.",
    lastMessageTime: "22 Tem",
    messages: [
      { id: "m30", sender: "dealer", senderName: "Nilüfer Bayi", text: "SIM Kart teslimatı tamamlandı, teşekkürler.", timestamp: "22 Tem 11:00" },
    ],
  },
];

export default function MessagesPage() {
  const [contacts, setContacts] = useState<ChatContact[]>(initialContacts);
  const [activeContactId, setActiveContactId] = useState<string>("kadikoy");
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load persistent messages from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("retailcell_messages_data");
      if (stored) {
        setContacts(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Save messages to localStorage on change
  const saveContacts = (updated: ChatContact[]) => {
    setContacts(updated);
    try {
      localStorage.setItem("retailcell_messages_data", JSON.stringify(updated));
    } catch (e) {}
  };

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeContact?.messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const currentTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      senderName: "Siz (Merkez)",
      text: messageText.trim(),
      timestamp: currentTime,
    };

    const updatedContacts = contacts.map((c) => {
      if (c.id === activeContactId) {
        return {
          ...c,
          lastMessage: userMsg.text,
          lastMessageTime: currentTime,
          messages: [...c.messages, userMsg],
        };
      }
      return c;
    });

    saveContacts(updatedContacts);
    setMessageText("");

    // Automated simulated reply from dealer after 1.5s
    setTimeout(() => {
      const autoReplies = [
        "Mesajınız ve güncellenen detaylar tarafımıza ulaştı, teşekkürler!",
        "Talebiniz operasyon ekibimiz tarafından incelemeye alındı.",
        "Bilgilendirme için teşekkür ederiz, stok sayımını yapıyoruz.",
        "Kargo ve teslimat süreci tamamlandığında bilgi vereceğiz.",
      ];
      const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      const replyTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

      const dealerMsg: Message = {
        id: `msg-reply-${Date.now()}`,
        sender: "dealer",
        senderName: activeContact.name,
        text: randomReply,
        timestamp: replyTime,
      };

      setContacts((prevContacts) => {
        const finalContacts = prevContacts.map((c) => {
          if (c.id === activeContactId) {
            return {
              ...c,
              lastMessage: dealerMsg.text,
              lastMessageTime: replyTime,
              messages: [...c.messages, dealerMsg],
            };
          }
          return c;
        });
        try {
          localStorage.setItem("retailcell_messages_data", JSON.stringify(finalContacts));
        } catch (e) {}
        return finalContacts;
      });
    }, 1400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-4 animate-fade-in h-[calc(100vh-100px)] flex flex-col">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="text-rc-gold" size={24} />
              Operasyonel Mesajlaşma & Canlı Destek
            </h1>
            <p className="text-sm text-rc-text-secondary mt-0.5">
              Bayiler ve merkez operasyon ekibi arasındaki anlık mesajlaşma kanalı.
            </p>
          </div>
        </div>

        {/* Chat Main Interface Container */}
        <div className="rc-card flex-1 flex flex-col md:flex-row p-0 overflow-hidden border border-rc-border rounded-2xl bg-rc-bg-card shadow-2xl">
          {/* Contacts Sidebar (Left) */}
          <div className="w-full md:w-80 border-r border-rc-border bg-rc-bg-sidebar flex flex-col flex-shrink-0">
            {/* Search Contacts */}
            <div className="p-3 border-b border-rc-border">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-text-muted" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Bayi veya bölge ara..."
                  className="w-full bg-rc-bg-primary border border-rc-border rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rc-gold"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto divide-y divide-rc-border/50">
              {filteredContacts.map((contact) => {
                const isActive = contact.id === activeContactId;
                return (
                  <div
                    key={contact.id}
                    onClick={() => setActiveContactId(contact.id)}
                    className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                      isActive ? "bg-rc-gold/15 border-l-4 border-rc-gold" : "hover:bg-rc-bg-hover"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-rc-bg-hover border border-rc-border flex items-center justify-center font-bold text-rc-gold text-xs">
                        {contact.avatar}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-rc-bg-sidebar ${
                          contact.status === "online" ? "bg-rc-success" : "bg-rc-text-muted"
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{contact.name}</h4>
                        <span className="text-[10px] text-rc-text-muted">{contact.lastMessageTime}</span>
                      </div>
                      <p className="text-[11px] text-rc-text-muted truncate mt-0.5">{contact.region}</p>
                      <p className="text-xs text-rc-text-secondary truncate mt-1">{contact.lastMessage}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Chat Conversation Panel (Right) */}
          <div className="flex-1 flex flex-col bg-rc-bg-primary/40 min-w-0">
            {/* Active Contact Bar Header */}
            <div className="px-5 py-3.5 border-b border-rc-border bg-rc-bg-secondary flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rc-gold/20 border border-rc-gold/40 flex items-center justify-center font-bold text-rc-gold text-xs">
                  {activeContact.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{activeContact.name}</h3>
                  <p className="text-[11px] text-rc-text-muted flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeContact.status === "online" ? "bg-rc-success" : "bg-rc-text-muted"}`} />
                    {activeContact.region} • {activeContact.status === "online" ? "Çevrimiçi" : "Çevrimdışı"}
                  </p>
                </div>
              </div>

              <span className="rc-badge rc-badge-gold text-[10px]">Operasyon Hattı Active</span>
            </div>

            {/* Chat Messages Feed Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeContact.messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[10px] text-rc-text-muted mb-1 px-1">{msg.senderName}</span>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-md leading-relaxed ${
                        isUser
                          ? "bg-gradient-to-r from-rc-gold to-rc-gold-dark text-black font-medium rounded-tr-none"
                          : "bg-rc-bg-card border border-rc-border text-white rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${isUser ? "text-black/70" : "text-rc-text-muted"}`}>
                        <span>{msg.timestamp}</span>
                        {isUser && <CheckCheck size={12} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box Footer */}
            <div className="p-3.5 border-t border-rc-border bg-rc-bg-secondary flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`${activeContact.name} bayisine mesajınızı yazın (Enter ile gönder)...`}
                  className="flex-1 bg-rc-bg-primary border border-rc-border rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-rc-text-muted focus:outline-none focus:border-rc-gold transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="rc-btn-primary !p-2.5 !rounded-xl disabled:opacity-40 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
