import { useState } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { BottomNav } from "../components/BottomNav";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Bell, Clock, Package, ChefHat, Users,
  Check, Trash2, Filter, BellOff, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "expiry" | "recipe" | "community" | "achievement" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  actionPath?: string;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "expiry",
    title: "⏰ Expiry Alert",
    message: "Chicken Breast expires in 1 day. Cook it today to avoid waste!",
    time: "10 min ago",
    read: false,
    actionLabel: "Find Recipes",
    actionPath: "/recipes",
  },
  {
    id: "2",
    type: "expiry",
    title: "⏰ Expiry Warning",
    message: "Milk expires in 2 days. Consider using it in a smoothie or cooking.",
    time: "25 min ago",
    read: false,
    actionLabel: "View Pantry",
    actionPath: "/pantry",
  },
  {
    id: "3",
    type: "community",
    title: "🤝 New Near You",
    message: "Sarah M. just listed 2 kg of fresh apples just 400m from you!",
    time: "1 hour ago",
    read: false,
    actionLabel: "View Listing",
    actionPath: "/community",
  },
  {
    id: "4",
    type: "recipe",
    title: "🍳 Recipe Suggestion",
    message: "You have all the ingredients for Creamy Chicken Pasta — perfect for tonight!",
    time: "2 hours ago",
    read: true,
    actionLabel: "Cook Now",
    actionPath: "/recipes",
  },
  {
    id: "5",
    type: "achievement",
    title: "🏆 Achievement Unlocked!",
    message: "Congratulations! You've reached Waste Warrior Level 5. You've saved over 100 kg of food!",
    time: "Yesterday",
    read: true,
    actionLabel: "View Profile",
    actionPath: "/profile",
  },
  {
    id: "6",
    type: "community",
    title: "📦 Request Received",
    message: "John D. is requesting your shared Homemade Bread listing. Confirm pickup details.",
    time: "Yesterday",
    read: true,
    actionLabel: "Respond",
    actionPath: "/community",
  },
  {
    id: "7",
    type: "system",
    title: "📊 Weekly Report Ready",
    message: "Your weekly sustainability report is ready. You saved 4.2 kg of food this week!",
    time: "2 days ago",
    read: true,
    actionLabel: "View Analytics",
    actionPath: "/analytics",
  },
  {
    id: "8",
    type: "expiry",
    title: "✅ Well Done!",
    message: "You consumed Yogurt before it expired. You've saved $4.99 and 0.5 kg of CO₂.",
    time: "3 days ago",
    read: true,
  },
];

const typeIcons: Record<string, React.ReactNode> = {
  expiry: <Clock className="w-4 h-4" />,
  recipe: <ChefHat className="w-4 h-4" />,
  community: <Users className="w-4 h-4" />,
  achievement: <TrendingUp className="w-4 h-4" />,
  system: <Bell className="w-4 h-4" />,
};

const typeColors: Record<string, string> = {
  expiry: "bg-amber-100 text-amber-600",
  recipe: "bg-[#B2D2A4]/30 text-[#4A5568]",
  community: "bg-blue-100 text-blue-600",
  achievement: "bg-purple-100 text-purple-600",
  system: "bg-gray-100 text-gray-500",
};

export function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  const filtered = notifications.filter((n) => filter === "all" || !n.read);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <BottomNav />

      <main className="lg:ml-64 pb-20 lg:pb-6">
        <div className="max-w-3xl mx-auto p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between flex-wrap gap-4 mb-8"
          >
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#4A5568]">Notifications</h1>
              {unreadCount > 0 && (
                <Badge className="bg-[#B2D2A4] text-[#4A5568]">{unreadCount} new</Badge>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllRead}
                  className="rounded-xl text-sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="rounded-xl text-sm text-red-400 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
          </motion.div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-[#B2D2A4] text-[#4A5568]"
                  : "bg-white text-[#4A5568]/60 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              <Bell className="w-4 h-4" />
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === "unread"
                  ? "bg-[#4A5568] text-white"
                  : "bg-white text-[#4A5568]/60 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications list */}
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <BellOff className="w-12 h-12 text-[#4A5568]/20 mx-auto mb-4" />
                  <p className="text-[#4A5568]/60 font-medium">
                    {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                  </p>
                  <p className="text-sm text-[#4A5568]/40 mt-1">
                    {filter === "unread"
                      ? "You're all caught up!"
                      : "Notifications about expiry, recipes, and community will appear here"}
                  </p>
                </motion.div>
              ) : (
                filtered.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => markRead(notification.id)}
                  >
                    <Card
                      className={`p-4 rounded-[20px] shadow-[0px_2px_8px_rgba(0,0,0,0.04)] cursor-pointer hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-all border-l-4 ${
                        !notification.read
                          ? "border-l-[#B2D2A4] bg-white"
                          : "border-l-transparent bg-white/70"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Type icon */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            typeColors[notification.type]
                          }`}
                        >
                          {typeIcons[notification.type]}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p
                              className={`text-sm font-semibold ${
                                !notification.read ? "text-[#4A5568]" : "text-[#4A5568]/70"
                              }`}
                            >
                              {notification.title}
                              {!notification.read && (
                                <span className="ml-2 w-2 h-2 bg-[#B2D2A4] rounded-full inline-block" />
                              )}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-xs text-[#4A5568]/40">{notification.time}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 rounded-lg text-[#4A5568]/30 hover:text-red-400 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-[#4A5568]/60 mb-3 leading-relaxed">
                            {notification.message}
                          </p>
                          {notification.actionLabel && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markRead(notification.id);
                                navigate(notification.actionPath || "/dashboard");
                              }}
                              className="h-7 text-xs bg-[#B2D2A4]/20 hover:bg-[#B2D2A4]/40 text-[#4A5568] border border-[#B2D2A4]/30 rounded-lg px-3"
                            >
                              {notification.actionLabel}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Quick settings link */}
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center"
            >
              <button
                onClick={() => navigate("/profile")}
                className="text-sm text-[#4A5568]/50 hover:text-[#4A5568] transition-colors flex items-center gap-2 mx-auto"
              >
                <Bell className="w-4 h-4" />
                Manage notification preferences
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
