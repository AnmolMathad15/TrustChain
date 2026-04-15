import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useKioskMode } from "../contexts/KioskModeContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Mic, Send } from "lucide-react";
import { useCreateOpenaiConversation, useListOpenaiConversations, useListOpenaiMessages } from "@workspace/api-client-react";

export default function AiAssistant() {
  const { t, language } = useLanguage();
  const { isKioskMode } = useKioskMode();

  const { data: conversations } = useListOpenaiConversations();
  const createConversation = useCreateOpenaiConversation();

  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const hasTriedCreateRef = useRef(false);

  const { data: messages = [] } = useListOpenaiMessages(activeConversationId as number, {
    query: { enabled: !!activeConversationId, queryKey: ["messages", activeConversationId] },
  });

  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mutateRef = useRef(createConversation.mutate);
  useEffect(() => {
    mutateRef.current = createConversation.mutate;
  });

  useEffect(() => {
    if (!conversations) return;
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    } else if (conversations.length === 0 && !hasTriedCreateRef.current) {
      hasTriedCreateRef.current = true;
      mutateRef.current(
        { data: { title: "New Conversation" } },
        { onSuccess: (data: any) => setActiveConversationId(data.id) },
      );
    }
  }, [conversations, activeConversationId]);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, isTyping]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !activeConversationId) return;

    const userMsg = input;
    setInput("");
    setLocalMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await fetch(`/api/openai/conversations/${activeConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMsg, language }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      setLocalMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  setLocalMessages((prev) => {
                    const newMsgs = [...prev];
                    const last = newMsgs[newMsgs.length - 1];
                    if (last && last.role === "assistant") {
                      newMsgs[newMsgs.length - 1] = { ...last, content: last.content + data.content };
                    }
                    return newMsgs;
                  });
                }
              } catch (_) {}
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsTyping(false);
    }
  }, [input, activeConversationId, language]);

  return (
    <div className={`flex flex-col ${isKioskMode ? "h-[75vh]" : "h-[calc(100vh-10rem)]"}`}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.ai_assistant")}</h2>
        <p className="text-muted-foreground">Ask anything in your preferred language.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border shadow-lg">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6 pb-4">
            {localMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground pt-20">
                <Bot className="h-12 w-12 mb-4 opacity-50" />
                <p>Start a conversation. I can help with government forms, schemes, and more.</p>
              </div>
            )}
            {localMessages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm text-foreground"} ${isKioskMode ? "text-lg" : "text-sm"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-4 flex-row">
                <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-muted rounded-tl-sm flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-background border-t">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Button variant="outline" size="icon" className={`shrink-0 rounded-xl ${isKioskMode ? "h-16 w-16" : "h-12 w-12"}`}>
              <Mic className={isKioskMode ? "h-8 w-8 text-primary" : "h-5 w-5 text-primary"} />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message here..."
              className={`flex-1 rounded-xl bg-muted/50 border-transparent focus-visible:ring-1 ${isKioskMode ? "h-16 text-lg px-6" : "h-12"}`}
            />
            <Button
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className={`shrink-0 rounded-xl ${isKioskMode ? "h-16 px-8 text-lg" : "h-12 px-6"}`}
            >
              <Send className={`${isKioskMode ? "h-6 w-6 mr-2" : "h-4 w-4 mr-2"}`} />
              {!isKioskMode && "Send"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
