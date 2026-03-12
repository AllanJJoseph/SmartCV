"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquareText, Send, User, Bot, Loader2, Sparkles, ArrowRight, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function SimulatorPage() {
  const [isStarted, setIsStarted] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startInterview = async () => {
    if (!jobDescription.trim()) return;
    setIsStarted(true);
    setIsLoading(true);

    const initialMessage = { role: "user" as const, content: "Hello, I am ready for the interview." };
    
    try {
      const response = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [initialMessage],
          jobDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([initialMessage, { role: "assistant", content: data.message }]);
      } else {
        const errText = await response.text();
        alert(`Recruiter AI Error: ${errText}`);
        setIsStarted(false);
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred. Please check your connection.");
      setIsStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          jobDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...newMessages, { role: "assistant", content: data.message }]);
      } else {
        const errText = await response.text();
        alert(`Recruiter AI Error: ${errText}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    if (confirm("Are you sure you want to reset the interview? All progress will be lost.")) {
      setIsStarted(false);
      setMessages([]);
      setJobDescription("");
    }
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden mesh-bg p-4 lg:p-8 flex flex-col">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 w-full max-w-5xl relative z-10 pt-4 mx-auto h-full overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border/50 pb-4 shrink-0">
          <div className="flex items-center gap-3">
             <div className="bg-primary/20 p-2.5 rounded-xl text-primary">
               <MessageSquareText className="w-6 h-6" />
             </div>
             <div>
               <h1 className="text-3xl font-semibold tracking-tight gradient-text inline-block">Recruiter Simulator</h1>
               <p className="text-muted-foreground text-sm">AI-powered mock interviews.</p>
             </div>
          </div>
          {isStarted && (
            <button 
              onClick={resetInterview}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border/50 bg-background/50"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        {!isStarted ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xl w-full rounded-2xl border border-border/50 glass p-8 shadow-xl flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Sparkles className="w-5 h-5" /> Setup your session
                </div>
                <h2 className="text-xl font-bold tracking-tight">Paste a Job Description</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our AI recruiter will analyze the role and conduct a personalized interview spanning technical and behavioral aspects.
                </p>
              </div>

              <textarea 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here (e.g., Frontend Developer at Vercel...)"
                className="min-h-[200px] w-full rounded-xl border border-border/50 bg-background/50 p-4 text-sm transition-all focus:ring-2 focus:ring-primary/50 outline-none resize-none"
              />

              <button 
                onClick={startInterview}
                disabled={!jobDescription.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                Start Practice Interview <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden relative pb-4">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6 scroll-smooth custom-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "flex gap-4 max-w-[85%]",
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border/50 text-muted-foreground"
                    )}>
                      {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={cn(
                      "flex flex-col gap-2",
                      msg.role === "user" ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "rounded-2xl px-5 py-3 text-sm font-medium leading-relaxed shadow-sm",
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-card border border-border/50 text-foreground rounded-tl-none glass"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 mr-auto max-w-[85%]"
                >
                  <div className="h-10 w-10 rounded-xl bg-muted border border-border/50 flex items-center justify-center shrink-0">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                  <div className="bg-card border border-border/50 rounded-2xl rounded-tl-none px-5 py-3 glass">
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="shrink-0 relative mt-2 group">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response here..."
                disabled={isLoading}
                className="w-full h-14 pl-6 pr-16 rounded-2xl border border-border/50 bg-background/80 glass shadow-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
