"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, AlertTriangle, User, BrainCircuit, Loader2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingStage, setThinkingStage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const stages = [
    "Parsing health context...",
    "Scanning clinical patterns...",
    "Retrieving relevant knowledge...",
    "Synthesizing health analysis...",
    "Generating recommendations..."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (loading) {
      let stageIdx = 0;
      setThinkingStage(stages[0]);
      const interval = setInterval(() => {
        stageIdx++;
        if (stageIdx < stages.length) {
          setThinkingStage(stages[stageIdx]);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", content: "Agent Error: Communication with the health knowledge base was interrupted. Please try again." }]);
    } finally {
      setLoading(false);
      setThinkingStage("");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[600px] max-h-[900px]">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
              <Bot className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            AI Health Agent
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Your personal assistant for general health analysis.</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
           <Sparkles className="h-4 w-4 text-orange-500" />
           <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Enhanced Mode Active</span>
        </div>
      </div>

      <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 p-4 mb-6 rounded-2xl shadow-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-orange-800 dark:text-orange-300 leading-relaxed font-semibold">
            STRICT DISPATCH: This agent provides advisory information only. It is NOT a substitute for professional medical diagnosis. Consult your doctor for all clinical concerns.
          </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-2xl dark:bg-slate-900 rounded-3xl relative">
        <CardContent className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50/30 dark:bg-slate-950/20 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-8 rounded-full mb-8 animate-pulse">
                <BrainCircuit className="h-16 w-16 text-purple-300 dark:text-purple-800" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xl font-bold mb-2">Health Knowledge Base Initialized</p>
              <p className="text-slate-400 dark:text-slate-500 max-w-sm mb-8">Ask about specific symptoms like headaches, fatigue, or stress for a detailed agent analysis.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                 {["Headaches", "Better Sleep", "Managing Stress", "Blood Pressure"].map(t => (
                   <button key={t} onClick={() => setInput(t)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-purple-400 dark:hover:border-purple-400 transition-all">{t}</button>
                 ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[90%] gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${m.role === "user" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-purple-600 dark:text-purple-400"}`}>
                  {m.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={`p-5 rounded-3xl whitespace-pre-wrap text-sm shadow-md leading-relaxed transition-all ${m.role === "user" ? "bg-blue-600 text-white rounded-tr-none text-base font-medium" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none prose prose-slate dark:prose-invert max-w-full"}`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[90%] gap-4 flex-row">
                <div className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-md flex flex-col gap-3 min-w-[240px]">
                   <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-widest">{thinkingStage}</span>
                   </div>
                   <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-purple-500 animate-[loading-progress_3s_ease-in-out_infinite]" />
                      </div>
                      <div className="h-2 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-full" />
                   </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSend} className="w-full flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Health Agent (e.g. My head hurts and I'm tired)..."
              className="flex-1 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 dark:text-white h-12 rounded-2xl px-6 focus-visible:ring-purple-500 text-base"
              disabled={loading}
            />
            <Button type="submit" disabled={!input.trim() || loading} className="bg-purple-600 hover:bg-purple-700 h-12 px-6 rounded-2xl shadow-lg shadow-purple-500/20 transition-all active:scale-95 group">
              <span className="font-bold flex items-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                <span className="hidden md:inline">DISPATCH</span>
              </span>
            </Button>
          </form>
        </CardFooter>
      </Card>
      <style jsx global>{`
        @keyframes loading-progress {
          0% { width: 0%; transform: translateX(0%); }
          50% { width: 40%; transform: translateX(50%); }
          100% { width: 100%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
