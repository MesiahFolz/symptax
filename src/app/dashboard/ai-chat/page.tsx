"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, AlertTriangle, User, BrainCircuit, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    
    // Copy current messages to send as history
    const history = [...messages];
    
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history }),
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
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px] md:min-h-[600px] max-h-[900px] animate-in fade-in duration-500">
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
              <Bot className="h-6 w-6 md:h-7 md:w-7 text-white" />
            </div>
            AI Health Dispatch
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 text-sm md:text-lg font-medium italic md:not-italic">Conversational health analysis and context.</p>
        </div>
        <div className="hidden md:flex bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 items-center gap-2 shadow-sm">
           <Sparkles className="h-4 w-4 text-purple-500" />
           <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Memory Active</span>
        </div>
      </div>

      <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 p-2.5 md:p-4 mb-4 md:mb-6 rounded-xl md:rounded-2xl shadow-sm flex items-start gap-2 md:gap-3">
          <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-orange-600 dark:text-orange-500 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] md:text-sm text-orange-800 dark:text-orange-300 leading-tight md:leading-relaxed font-bold md:font-semibold">
            STRICT DISPATCH: ADVISORY ONLY. NOT A SUBSTITUTE FOR CLINICAL DIAGNOSIS. CONSULT YOUR DOCTOR.
          </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-2xl dark:bg-slate-900 rounded-3xl relative backdrop-blur-md bg-white/70 dark:bg-slate-900/70">
        <CardContent className="flex-1 overflow-y-auto p-3 md:p-8 space-y-4 md:space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 md:px-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 md:p-8 rounded-full mb-4 md:mb-8 animate-pulse shadow-inner">
                <BrainCircuit className="h-10 w-10 md:h-16 md:w-16 text-indigo-500 dark:text-indigo-400" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-lg md:text-xl font-bold mb-1 md:mb-2 text-center">Knowledge Base Linked</p>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 md:mb-8 text-xs md:text-base text-center">I retain conversational context. How can I assist with your wellness today?</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[95%] md:max-w-[85%] gap-2 md:gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`h-8 w-8 md:h-10 md:w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${m.role === "user" ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-purple-600 dark:text-purple-400"}`}>
                  {m.role === "user" ? <User className="h-4 w-4 md:h-5 md:w-5" /> : <Bot className="h-4 w-4 md:h-5 md:w-5" />}
                </div>
                <div className={`p-4 md:p-6 rounded-2xl text-sm shadow-md leading-relaxed overflow-x-auto ${m.role === "user" ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none font-medium" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none"}`}>
                  {m.role === "user" ? (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[95%] md:max-w-[85%] gap-2 md:gap-4 flex-row">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-purple-600 dark:text-purple-400 shadow-md animate-pulse">
                  <Bot className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div className="p-4 md:p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-md flex flex-col gap-2 min-w-[200px] md:min-w-[240px]">
                   <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{thinkingStage}</span>
                   </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="p-3 md:p-5 bg-slate-50/50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 backdrop-blur-xl">
          <form onSubmit={handleSend} className="w-full flex gap-2 md:gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Health Agent..."
              className="flex-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 dark:text-white h-12 md:h-14 rounded-xl px-4 md:px-6 focus-visible:ring-indigo-500 text-sm md:text-base shadow-inner"
              disabled={loading}
            />
            <Button type="submit" disabled={!input.trim() || loading} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12 md:h-14 px-5 md:px-8 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5">
              <span className="font-bold flex items-center gap-2">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="hidden sm:inline text-sm">DISPATCH</span>
              </span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
