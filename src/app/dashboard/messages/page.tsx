"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, UserCircle, Search, Stethoscope, User, MoreVertical, Phone, Video } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserId = (session?.user as any)?.id;

  // Fetch contacts
  useEffect(() => {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((data) => setContacts(data.contacts || []))
      .catch(console.error);
  }, []);

  // Fetch messages when contact selected
  useEffect(() => {
    if (!selectedContact) return;

    const fetchMessages = () => {
      fetch(`/api/messages?userId=${selectedContact.id}`)
        .then((r) => r.json())
        .then((data) => setMessages(data.messages || []))
        .catch(console.error);
    };

    fetchMessages();

    // Poll every 3 seconds for new messages
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedContact]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedContact || sending) return;

    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: selectedContact.id, content: input }),
      });
      setInput("");
      // Immediately refetch
      const res = await fetch(`/api/messages?userId=${selectedContact.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!session) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[600px] max-h-[900px] overflow-hidden">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Secure Messages</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Direct communication with your health care network.</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-600" />
              <Input
                placeholder="Search messages..."
                className="pl-10 h-11 bg-slate-50 dark:bg-slate-900 border-0 rounded-xl text-sm dark:text-white focus-visible:ring-blue-600 shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {filteredContacts.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-3">
                <UserCircle className="h-10 w-10 text-slate-200 dark:text-slate-800" />
                <p className="text-sm text-slate-500 dark:text-slate-600">No contacts available</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full text-left p-4 border-l-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/40 relative group ${
                    selectedContact?.id === contact.id
                      ? "bg-blue-50/50 dark:bg-blue-900/10 border-l-blue-600"
                      : "border-l-transparent"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                        contact.role === "DOCTOR"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {contact.role === "DOCTOR" ? (
                        <Stethoscope className="h-6 w-6" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{contact.name}</p>
                        {contact.lastMessageAt && (
                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                             {new Date(contact.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                           </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500 truncate mt-0.5">
                        {contact.lastMessage ? (
                          <span className="italic">“{contact.lastMessage}”</span>
                        ) : (
                          contact.email
                        )}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-2xl dark:bg-slate-900 rounded-3xl hidden md:flex">
          {!selectedContact ? (
            <div className="flex-1 flex items-center justify-center text-center p-12 bg-slate-50/20 dark:bg-slate-950/20">
              <div className="space-y-4">
                <div className="bg-blue-100 dark:bg-blue-900/10 p-10 rounded-full inline-block animate-pulse">
                  <UserCircle className="h-20 w-20 text-blue-200 dark:text-blue-900/50" />
                </div>
                <h3 className="text-2xl font-bold dark:text-white">Start a Conversation</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-lg leading-relaxed">
                  Select a doctor or colleague from the list to begin secure messaging.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-5 px-8 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner ${
                      selectedContact.role === "DOCTOR"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {selectedContact.role === "DOCTOR" ? (
                      <Stethoscope className="h-6 w-6" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold dark:text-white leading-none">{selectedContact.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active Session</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"><Phone className="h-5 w-5" /></Button>
                   <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"><Video className="h-5 w-5" /></Button>
                   <Button variant="ghost" size="icon" className="text-slate-400"><MoreVertical className="h-5 w-5" /></Button>
                </div>
              </CardHeader>

              {/* Messages Content */}
              <CardContent className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-slate-50/30 dark:bg-slate-950/30 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
                       <Send className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                    </div>
                    <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">No previous messages</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === currentUserId;
                    return (
                      <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] p-4 md:p-5 rounded-3xl shadow-md space-y-2 transition-all hover:shadow-lg ${
                            isMe
                              ? "bg-blue-600 text-white rounded-tr-none font-medium"
                              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{m.content}</p>
                          <div
                            className={`flex items-center justify-end gap-1.5 text-[9px] font-bold uppercase tracking-widest mt-1 ${
                              isMe ? "text-blue-200" : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {isMe && <span className="opacity-70">✓✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Chat Input */}
              <CardFooter className="p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <form onSubmit={handleSend} className="w-full flex gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a secure medical message..."
                    className="flex-1 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 dark:text-white focus-visible:ring-blue-600 text-base px-6 shadow-inner"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-2xl shadow-lg shadow-blue-500/20 group active:scale-95 transition-all"
                  >
                    <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </form>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
