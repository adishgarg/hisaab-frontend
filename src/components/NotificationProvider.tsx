"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { AppNotification } from "@/types/notification";

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const socketUrl = API_URL.replace("/api", "");

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("✅ WebSocket Connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ WebSocket Disconnected");
      setIsConnected(false);
    });

    newSocket.on("new_notification", (notification: AppNotification) => {
      console.log("📬 New notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show browser notification if permitted
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
        });
      }
    });

    newSocket.on("notification_marked_read", ({ notificationId }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    newSocket.on("all_notifications_marked_read", () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });

    setSocket(newSocket);

    // Request notification permission
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const [notificationsRes, countRes] = await Promise.all([
        fetch(`${API_URL}/notifications?page=1&limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (notificationsRes.ok && countRes.ok) {
        const notificationsData = await notificationsRes.json();
        const countData = await countRes.json();
        setNotifications(notificationsData.notifications);
        setUnreadCount(countData.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = (notificationId: string) => {
    if (socket) {
      socket.emit("mark_notification_read", { notificationId });
    }
  };

  const markAllAsRead = () => {
    if (socket) {
      socket.emit("mark_all_read");
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
