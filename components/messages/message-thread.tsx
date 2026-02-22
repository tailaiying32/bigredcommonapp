"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { sendMessage, getMessages } from "@/lib/actions/messages";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import type { Message } from "@/types/database";

interface MessageThreadProps {
  applicationId: string;
  currentUserId: string;
  canSend: boolean;
  initialMessages: Message[];
}

export function MessageThread({
  applicationId,
  currentUserId,
  canSend,
  initialMessages,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Scroll to bottom on mount and when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await getMessages(applicationId);
      if (result.messages && !result.error) {
        setMessages(result.messages);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [applicationId]);

  async function handleSend() {
    const trimmed = body.trim();
    if (!trimmed || sending) return;

    setSending(true);
    const result = await sendMessage(applicationId, trimmed);

    if (result.success) {
      setBody("");
      // Fetch latest messages
      const updated = await getMessages(applicationId);
      if (updated.messages && !updated.error) {
        setMessages(updated.messages);
      }
    }
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="space-y-4">
      <div ref={scrollRef} className="max-h-80 overflow-y-auto space-y-3 p-1">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No messages yet
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar size="sm">
                  <AvatarFallback>
                    {msg.sender_type === "team" ? "T" : "S"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[75%] space-y-1 ${isOwn ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.body}
                  </div>
                  <p
                    className={`text-xs text-muted-foreground ${isOwn ? "text-right" : "text-left"}`}
                  >
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {canSend ? (
        <div className="flex gap-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={2}
            className="resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={sending || !body.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          Read-only — only the team account can send messages.
        </p>
      )}
    </div>
  );
}
