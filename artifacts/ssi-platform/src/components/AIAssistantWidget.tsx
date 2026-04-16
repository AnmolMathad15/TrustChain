import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, X, Mic, Send, Sparkles, Navigation } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { getApiBaseUrl } from "../lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  route?: string | null;
  moduleLabel?: string | null;
  isLoading?: boolean;
}

const GREETINGS: Record<string, string> = {
  en: "Namaste! I'm your Trustchain assistant. Ask me to open ATM, pay bills, show documents, check schemes, and more.",
  hi: "नमस्ते! मैं आपका Trustchain सहायक हूं। ATM, बिल भुगतान, दस्तावेज़ आदि के लिए पूछें।",
  kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ Trustchain ಸಹಾಯಕ. ATM, ಬಿಲ್ ಪಾವತಿ, ದಾಖಲೆಗಳು ಇತ್ಯಾದಿ ಕೇಳಿ.",
};

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: GREETINGS[language] || GREETINGS["en"] },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setMessages([{ role: "assistant", content: GREETINGS[language] || GREETINGS["en"] }]);
  }, [language]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "", isLoading: true }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/ai-router`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language }),
      });
      const data = await res.json();

      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        updated[lastIdx] = {
          role: "assistant",
          content: data.response,
          route: data.route,
          moduleLabel: data.moduleLabel,
          isLoading: false,
        };
        return updated;
      });

      if (data.shouldNavigate && data.route) {
        setTimeout(() => {
          navigate(data.route);
          setIsOpen(false);
        }, 1200);
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again.",
          isLoading: false,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, language, navigate]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : language === "kn" ? "kn-IN" : "en-IN";
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const quickActions = [
    { label: "Pay Bills", msg: "I want to pay my bills" },
    { label: "My Documents", msg: "Show my documents" },
    { label: "Check Schemes", msg: "Show government schemes" },
    { label: "ATM Help", msg: "I need ATM help" },
  ];

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 relative"
              onClick={() => setIsOpen(true)}
              data-testid="button-open-ai-widget"
            >
              <Bot className="h-7 w-7 text-white" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-background" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-80 md:w-96"
          >
            <Card className="flex flex-col h-[520px] shadow-2xl border-primary/20 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-indigo-600 p-4 text-primary-foreground flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm">Trustchain AI</span>
                    <div className="flex items-center gap-1 text-xs text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      Online
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-white/20" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/10">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border text-foreground rounded-bl-sm"
                    }`}>
                      {msg.isLoading ? (
                        <div className="flex gap-1 py-1">
                          {[0, 1, 2].map((j) => (
                            <motion.div key={j} className="w-2 h-2 rounded-full bg-primary/40"
                              animate={{ y: [0, -6, 0] }}
                              transition={{ repeat: Infinity, delay: j * 0.15, duration: 0.6 }}
                            />
                          ))}
                        </div>
                      ) : (
                        <>
                          <p>{msg.content}</p>
                          {msg.route && (
                            <button
                              onClick={() => { navigate(msg.route!); setIsOpen(false); }}
                              className="mt-2 flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                            >
                              <Navigation className="h-3 w-3" />
                              Go to {msg.moduleLabel}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {messages.length === 1 && (
                <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                  {quickActions.map((qa) => (
                    <button
                      key={qa.label}
                      onClick={() => sendMessage(qa.msg)}
                      className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-muted transition-colors"
                    >
                      {qa.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-3 border-t bg-background flex gap-2 items-center">
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  className="shrink-0 rounded-full h-9 w-9"
                  onClick={handleVoice}
                  title="Voice input"
                >
                  <Mic className={`h-4 w-4 ${isListening ? "animate-pulse" : ""}`} />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={language === "hi" ? "संदेश लिखें..." : language === "kn" ? "ಸಂದೇಶ ಬರೆಯಿರಿ..." : "Ask anything..."}
                  className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:ring-1 text-sm"
                  data-testid="ai-chat-input"
                  disabled={isLoading}
                />
                <Button size="icon" className="shrink-0 rounded-full h-9 w-9" onClick={handleSend} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
