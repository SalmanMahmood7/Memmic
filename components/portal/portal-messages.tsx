"use client";

import { useAuth } from "@/context/AuthContext";
import { getPortalMessages, markPortalMessageRead, PortalMessageItem, sendPortalMessage } from "@/lib/api";
import { Building2, MessageSquarePlus, RefreshCw, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";

export function PortalMessages() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<PortalMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setMessages(await getPortalMessages(token));
    } catch {
      // best-effort
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !subject.trim() || !body.trim()) return;
    setSending(true);
    setNotice(null);
    try {
      await sendPortalMessage(token, subject.trim(), body.trim());
      setSubject("");
      setBody("");
      setNotice("Message sent to the MEMMIC team.");
      await load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  async function handleMarkRead(id: string) {
    if (!token) return;
    try {
      await markPortalMessageRead(token, id);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
    } catch {
      // best-effort
    }
  }

  return (
    <div className="space-y-6">
      {/* Compose */}
      <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquarePlus className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-ink">Message MEMMIC</h2>
        </div>
        <form onSubmit={handleSend} className="space-y-4">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full rounded-lg border border-border bg-white dark:bg-dark-4 px-4 py-2.5 text-sm text-ink outline-none focus:border-primary"
            required
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message…"
            rows={4}
            className="w-full resize-none rounded-lg border border-border bg-white dark:bg-dark-4 px-4 py-2.5 text-sm text-ink outline-none focus:border-primary"
            required
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Our team usually responds within one business day.</p>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              <Send className="size-4" /> {sending ? "Sending…" : "Send"}
            </button>
          </div>
          {notice && <p className="text-sm text-primary">{notice}</p>}
        </form>
      </div>

      {/* Inbox */}
      <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">Conversation History</h2>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
          >
            <RefreshCw className="size-3.5" /> Refresh
          </button>
        </div>

        {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading messages…</p>}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center py-10 text-center">
            <Building2 className="size-8 text-gray-300 mb-2" />
            <p className="text-sm text-muted-foreground">No messages yet. Send your first message above.</p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((m) => {
            const fromFirm = m.sender === "firm";
            return (
              <div
                key={m.id}
                className={`rounded-xl border p-4 ${fromFirm ? "border-primary/30 bg-primary/5" : "border-border bg-gray-50 dark:bg-dark-4"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        fromFirm ? "bg-primary/15 text-primary" : "bg-gray-200 text-gray-600 dark:bg-gray-700"
                      }`}
                    >
                      {fromFirm ? "MEMMIC Team" : "You"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(m.created_at), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                  {!fromFirm && !m.is_read && (
                    <button
                      onClick={() => handleMarkRead(m.id)}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <p className="mt-2 font-semibold text-ink">{m.subject}</p>
                <p className="mt-1 text-sm text-ink/80 whitespace-pre-wrap">{m.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
