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
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px] md:min-h-[600px] max-h-[900px]">
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
              <Bot className="h-6 w-6 md:h-7 md:w-7 text-purple-600 dark:text-purple-400" />
            </div>
            AI Health Agent
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 text-sm md:text-lg font-medium italic md:not-italic">General health analysis assistant.</p>
        </div>
        <div className="hidden md:flex bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 items-center gap-2">
           <Sparkles className="h-4 w-4 text-orange-500" />
           <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Enhanced Mode Active</span>
        </div>
      </div>

      <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 p-2.5 md:p-4 mb-4 md:mb-6 rounded-xl md:rounded-2xl shadow-sm flex items-start gap-2 md:gap-3">
          <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-orange-600 dark:text-orange-500 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] md:text-sm text-orange-800 dark:text-orange-300 leading-tight md:leading-relaxed font-bold md:font-semibold">
            STRICT DISPATCH: ADVISORY ONLY. NOT A SUBSTITUTE FOR CLINICAL DIAGNOSIS. CONSULT YOUR DOCTOR.
          </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-2xl dark:bg-slate-900 rounded-3xl relative">
        <CardContent className="flex-1 overflow-y-auto p-3 md:p-8 space-y-4 md:space-y-6 bg-slate-50/30 dark:bg-slate-950/20">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 md:px-6">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-6 md:p-8 rounded-full mb-4 md:mb-8 animate-pulse">
                <BrainCircuit className="h-10 w-10 md:h-16 md:w-16 text-purple-300 dark:text-purple-800" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-bold mb-1 md:mb-2 text-center">Knowledge Base Active</p>
              <p className="text-slate-400 dark:text-slate-500 max-w-sm mb-6 md:mb-8 text-xs md:text-base text-center">Inquire about specific symptoms for a detailed agent analysis.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[95%] md:max-w-[90%] gap-2 md:gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`h-8 w-8 md:h-10 md:w-10 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${m.role === "user" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-purple-600 dark:text-purple-400"}`}>
                  {m.role === "user" ? <User className="h-4 w-4 md:h-5 md:w-5" /> : <Bot className="h-4 w-4 md:h-5 md:w-5" />}
                </div>
                <div className={`p-3 md:p-5 rounded-2xl md:rounded-3xl whitespace-pre-wrap text-sm shadow-md leading-relaxed ${m.role === "user" ? "bg-blue-600 text-white rounded-tr-none font-medium" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none prose prose-slate dark:prose-invert"}`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[95%] md:max-w-[90%] gap-2 md:gap-4 flex-row">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl md:rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
                  <Bot className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-md flex flex-col gap-2 md:gap-3 min-w-[200px] md:min-w-[240px]">
                   <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{thinkingStage}</span>
                   </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="p-3 md:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSend} className="w-full flex gap-2 md:gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Health Agent..."
              className="flex-1 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 dark:text-white h-11 md:h-12 rounded-xl md:rounded-2xl px-4 md:px-6 focus-visible:ring-purple-500 text-sm md:text-base"
              disabled={loading}
            />
            <Button type="submit" disabled={!input.trim() || loading} className="bg-purple-600 hover:bg-purple-700 h-11 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl shadow-lg">
              <span className="font-bold flex items-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="hidden sm:inline text-xs md:text-sm">DISPATCH</span>
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
