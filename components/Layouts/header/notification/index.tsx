"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { BellIcon } from "./icons";
import { useAuth } from "@/context/AuthContext";
import { getNotifications, getNotificationsUnreadCount, markNotificationRead, NotificationItem } from "@/lib/api";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface SSEMessageData {
  type: string;
  message?: Partial<NotificationItem> & { whatyouneed?: string; category?: string };
}

const TYPE_META: Record<string, { label: string; color: string; href: string }> = {
  general: { label: "General", color: "bg-gray-100 text-gray-700", href: "/admin/general/messages" },
  message: { label: "Client Message", color: "bg-blue-100 text-blue-700", href: "/admin/messages" },
  enquiry: { label: "Enquiry", color: "bg-purple-100 text-purple-700", href: "/admin/client-messages" },
};

function sseToNotification(type: string, m: SSEMessageData["message"]): NotificationItem {
  const base = {
    id: m?.id || "",
    full_name: m?.full_name || "",
    email: m?.email || "",
    brief: m?.brief || "",
    is_unread: true,
    status: m?.status || null,
    category: m?.whatyouneed || m?.category || null,
    created_at: m?.created_at || new Date().toISOString(),
  };
  const t = type === "new_general_message" ? "general" : type === "new_client_message" ? "enquiry" : "message";
  return { ...base, type: t as NotificationItem["type"] };
}

export function Notification() {
  const { token, role } = useAuth();
  const router = useRouter();
  const isAdmin = role?.toLowerCase() === "admin";
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleNotificationClick = useCallback(async (item: NotificationItem) => {
    if (!token) return;
    if (item.is_unread) {
      setItems(prev => prev.map(n => (n.id === item.id ? { ...n, is_unread: false } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
      try {
        await markNotificationRead(token, item.id);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
    setIsOpen(false);
    const meta = TYPE_META[item.type] || TYPE_META.general;
    router.push(meta.href);
  }, [token, router]);

  const fetchUnreadCount = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const data = await getNotificationsUnreadCount(token);
      setUnreadCount(data.unread_count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, [token, isAdmin]);

  const fetchNotifications = useCallback(async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    try {
      const data = await getNotifications(token);
      setItems(data.items);
      setUnreadCount(data.total_unread);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  const handleSSEMessage = useCallback((data: SSEMessageData) => {
    if (data.message && ["new_message", "new_client_message", "new_general_message"].includes(data.type)) {
      const newItem = sseToNotification(data.type, data.message);
      setItems(prev => [newItem, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);

      // Show browser notification if permission granted
      if (typeof window !== "undefined" && window.Notification.permission === "granted" && !isOpen) {
        new window.Notification("New Notification", {
          body: `${newItem.full_name}: ${newItem.brief}`,
          icon: "/favicon.ico",
        });
      }
    }
  }, [isOpen]);

  // Fetch unread count on mount and when token changes
  useEffect(() => {
    if (!token || !isAdmin) return;
    const timeoutId = setTimeout(() => {
      fetchUnreadCount();
    }, 0);
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [token, isAdmin, fetchUnreadCount]);

  // Connect to SSE for real-time updates
  useEffect(() => {
    if (!token || !isAdmin) return;

    const accessToken = token || localStorage.getItem("memmic_access_token") || sessionStorage.getItem("memmic_access_token");
    if (!accessToken) return;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const eventSource = new EventSource(`${apiBaseUrl}/admin/client/messages/stream?token=${encodeURIComponent(accessToken)}`);

    eventSource.onopen = () => {
      console.log("SSE connection established");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SSEMessageData;
        handleSSEMessage(data);
      } catch (err) {
        console.error("Failed to parse SSE message:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      eventSource.close();
    };

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [token, isAdmin, handleSSEMessage]);

  // Fetch full feed when dropdown opens
  useEffect(() => {
    if (!token || !isAdmin || !isOpen) return;
    const timeoutId = setTimeout(() => {
      fetchNotifications();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [token, isOpen, isAdmin, fetchNotifications]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.Notification.permission === "default") {
      window.Notification.requestPermission();
    }
  }, []);

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);
      }}
    >
      <DropdownTrigger
        className="relative grid size-10 cursor-pointer border-stroke place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3 dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon className="w-5 h-5" />
          {unreadCount > 0 && (
            <>
              <span
                className={cn(
                  "absolute -top-1 -right-1 z-10 flex items-center justify-center min-w-[18px] h-5 rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5",
                )}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 z-10 flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
              </span>
            </>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "end"}
        className="border border-stroke bg-white shadow-lg min-w-[380px] max-w-[420px] dark:border-dark-3 dark:bg-gray-dark"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-stroke dark:border-dark-3">
          <span className="text-lg font-semibold text-dark dark:text-white">
            Notifications
          </span>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="px-4 py-6 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-6 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <ul className="divide-y divide-stroke dark:divide-dark-3">
              {items.map((item) => {
                const meta = TYPE_META[item.type] || TYPE_META.general;
                return (
                  <li
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={cn("px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-3 transition-colors", item.is_unread && "bg-blue-50/50 dark:bg-blue-900/20")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", meta.color)}>
                            {meta.label}
                          </span>
                          <span className="font-medium text-dark dark:text-white truncate">
                            {item.full_name}
                          </span>
                          {item.is_unread && (
                            <span className="flex size-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        {item.category && (
                          <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {item.brief}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(item.created_at), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-4 py-2 border-t border-stroke dark:border-dark-3 text-center">
            <Link
              href="/admin/client-messages"
              onClick={() => setIsOpen(false)}
              className="text-sm text-primary hover:underline font-medium"
            >
              View client enquiries
            </Link>
            <span className="mx-2 text-muted-foreground">·</span>
            <Link
              href="/admin/messages"
              onClick={() => setIsOpen(false)}
              className="text-sm text-primary hover:underline font-medium"
            >
              View client messages
            </Link>
          </div>
        )}
      </DropdownContent>
    </Dropdown>
  );
}