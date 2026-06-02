import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Activity,
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronDown,
  Circle,
  Globe,
  LayoutDashboard,
  Leaf,
  MoreHorizontal,
  Scan,
  ScrollText,
  Search,
  ShoppingBag,
  TrendingUp,
  User,
  Users,
  XCircle,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, auth, UserDTO } from "../../lib/api";
import { useLanguage } from "../context/LanguageContext";

const apiData = [
  { time: "00:00", ocr: 42, recipe: 18 },
  { time: "03:00", ocr: 28, recipe: 11 },
  { time: "06:00", ocr: 61, recipe: 33 },
  { time: "09:00", ocr: 145, recipe: 78 },
  { time: "12:00", ocr: 198, recipe: 112 },
  { time: "15:00", ocr: 174, recipe: 95 },
  { time: "18:00", ocr: 230, recipe: 143 },
  { time: "21:00", ocr: 117, recipe: 67 },
  { time: "Now", ocr: 89, recipe: 52 },
];

const users = [
  { id: "USR-0041", name: "Sarah Chen", email: "sarah.c@email.com", registered: "2024-01-12", status: "active", scans: 47 },
  { id: "USR-0042", name: "Marcus Rivera", email: "m.rivera@email.com", registered: "2024-02-08", status: "active", scans: 31 },
  { id: "USR-0043", name: "Priya Patel", email: "priya.p@email.com", registered: "2024-02-14", status: "banned", scans: 3 },
  { id: "USR-0044", name: "Jonas Weber", email: "j.weber@email.com", registered: "2024-03-01", status: "active", scans: 89 },
  { id: "USR-0045", name: "Amara Osei", email: "amara.o@email.com", registered: "2024-03-19", status: "active", scans: 55 },
  { id: "USR-0046", name: "Lena Muller", email: "lena.m@email.com", registered: "2024-04-02", status: "inactive", scans: 6 },
];

const listings = [
  { id: 1, name: "Organic Bananas", donor: "Sarah C.", category: "Fruit", expires: "2026-06-05", qty: "8 pcs", img: "BN", submitted: "2 hrs ago" },
  { id: 2, name: "Sourdough Bread", donor: "Jonas W.", category: "Bakery", expires: "2026-06-04", qty: "1 loaf", img: "BR", submitted: "4 hrs ago" },
  { id: 3, name: "Greek Yogurt", donor: "Priya P.", category: "Dairy", expires: "2026-06-07", qty: "500g", img: "YG", submitted: "6 hrs ago" },
  { id: 4, name: "Cherry Tomatoes", donor: "Amara O.", category: "Vegetable", expires: "2026-06-06", qty: "250g", img: "TM", submitted: "8 hrs ago" },
  { id: 5, name: "Avocados", donor: "Marcus R.", category: "Fruit", expires: "2026-06-05", qty: "3 pcs", img: "AV", submitted: "12 hrs ago" },
  { id: 6, name: "Fresh Pasta", donor: "Lena M.", category: "Grain", expires: "2026-06-08", qty: "400g", img: "PA", submitted: "1 day ago" },
];

const kpis = [
  { labelKey: "kpiUsersOnline", sublabelKey: "kpiUsersOnlineSub", value: "3,842", icon: Globe, iconBg: "bg-[#B2D2A4]/15", iconColor: "text-[#B2D2A4]", trend: "up" },
  { labelKey: "kpiActiveListings", sublabelKey: "kpiActiveListingsSub", value: "1,249", icon: ShoppingBag, iconBg: "bg-blue-50", iconColor: "text-blue-500", trend: "up" },
  { labelKey: "kpiScansToday", sublabelKey: "kpiScansTodaySub", value: "8,730", icon: Scan, iconBg: "bg-amber-50", iconColor: "text-amber-500", trend: "up" },
  { labelKey: "kpiCo2Saved", sublabelKey: "kpiCo2SavedSub", value: "12,490", icon: Leaf, iconBg: "bg-emerald-50", iconColor: "text-emerald-500", trend: "neutral" },
];

const navItems = [
  { icon: LayoutDashboard, key: "dashboardOverview" },
  { icon: Users, key: "userManagement" },
  { icon: ShoppingBag, key: "marketplaceModeration" },
  { icon: Activity, key: "systemHealth" },
  { icon: User, key: "profileSettings" },
];

type Translate = (key: string, fallback?: string) => string;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AdminSidebar({ activeNav, setActiveNav, t }: { activeNav: string; setActiveNav: (s: string) => void; t: Translate }) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#1a2332] flex flex-col z-40">
      <div className="h-16 flex items-center px-6 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#B2D2A4] flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">FoodMood</div>
            <div className="text-white/40 text-xs mt-0.5">{t("pages.admin.adminPanel")}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-3">
          <span className="text-white/30 text-xs font-semibold tracking-widest uppercase">{t("pages.admin.main")}</span>
        </div>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveNav(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
              activeNav === item.key ? "bg-[#B2D2A4]/15 text-[#B2D2A4]" : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">{t(`pages.admin.nav.${item.key}`)}</span>
            {activeNav === item.key && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#B2D2A4]" />}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-white/8 pt-4">
        <div className="px-3 mb-3">
          <span className="text-white/30 text-xs font-semibold tracking-widest uppercase">{t("pages.admin.system")}</span>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/5 transition-all duration-200 text-left">
          <ScrollText className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">{t("pages.admin.systemLogs")}</span>
        </button>
        <div className="mt-3 mx-1 p-3 bg-white/5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-xs font-medium">{t("pages.admin.systemStatus")}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">{t("pages.admin.operational")}</span>
            </div>
          </div>
          {["OCR API", "Recipe API", "Auth Service"].map((svc) => (
            <div key={svc} className="flex items-center justify-between">
              <span className="text-white/30 text-xs">{svc}</span>
              <span className="text-white/25 text-xs">99.9%</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function KPICards({ t }: { t: Translate }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.labelKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-[14px] ${kpi.iconBg} flex items-center justify-center`}>
              <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
            </div>
            {kpi.trend === "up" && (
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-500 font-semibold">{t("pages.admin.up")}</span>
              </div>
            )}
          </div>
          <div className="text-3xl font-black text-[#1a2332] mb-0.5">{kpi.value}</div>
          <div className="text-xs font-semibold text-[#4A5568]/50 mb-1">{t(`pages.admin.${kpi.labelKey}`)}</div>
          <div className="text-xs text-emerald-500 font-medium">{t(`pages.admin.${kpi.sublabelKey}`)}</div>
        </motion.div>
      ))}
    </div>
  );
}

function UserTable({ t }: { t: Translate }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const headers = ["userId", "name", "registrationDate", "ocrScans", "status", "actions"];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-8 overflow-hidden">
      <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-[#1a2332]">{t("pages.admin.userManagement")}</h2>
          <p className="text-xs text-[#4A5568]/50 mt-0.5">{t("pages.admin.registeredUsers").replace("{count}", String(users.length))}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]/30" />
            <input type="text" placeholder={t("pages.admin.searchUsers")} className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-[#f8fafb] text-[#4A5568] placeholder-[#4A5568]/30 outline-none focus:border-[#B2D2A4] transition-colors w-48" />
          </div>
          <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm border border-gray-200 rounded-xl text-[#4A5568]/60 hover:border-gray-300 transition-colors">
            {t("pages.admin.filter")}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-[#fafbfc]">
              {headers.map((h) => (
                <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-[#4A5568]/40 uppercase tracking-wider">
                  {t(`pages.admin.table.${h}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-gray-50 hover:bg-[#fafbfc] transition-colors">
                <td className="px-6 py-4"><span className="text-xs font-mono text-[#4A5568]/40">{user.id}</span></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#B2D2A4]/20 flex items-center justify-center text-[#B2D2A4] text-xs font-bold">{initials(user.name)}</div>
                    <div>
                      <div className="text-sm font-semibold text-[#1a2332]">{user.name}</div>
                      <div className="text-xs text-[#4A5568]/40">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#4A5568]/60">{user.registered}</td>
                <td className="px-6 py-4 text-sm font-semibold text-[#1a2332]">{user.scans}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user.status === "active" ? "bg-emerald-50 text-emerald-600" : user.status === "banned" ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"
                  }`}>
                    <Circle className="w-2 h-2" style={{ fill: user.status === "active" ? "#10b981" : user.status === "banned" ? "#ef4444" : "#9ca3af", stroke: "none" }} />
                    {t(`pages.admin.statuses.${user.status}`)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <button onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition-all">
                      <MoreHorizontal className="w-4 h-4 text-[#4A5568]/50" />
                    </button>
                    {openMenu === user.id && (
                      <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 w-40 py-1.5 overflow-hidden">
                        {["viewProfile", "sendMessage", user.status === "active" ? "suspend" : "activate", "delete"].map((action) => (
                          <button key={action} className={`w-full text-left px-4 py-2 text-sm transition-colors ${action === "delete" ? "text-red-500 hover:bg-red-50" : "text-[#4A5568] hover:bg-gray-50"}`} onClick={() => setOpenMenu(null)}>
                            {t(`pages.admin.actions.${action}`)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function ModerationQueue({ t }: { t: Translate }) {
  const [approved, setApproved] = useState<number[]>([]);
  const [rejected, setRejected] = useState<number[]>([]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-8">
      <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-[#1a2332]">{t("pages.admin.moderationQueue")}</h2>
          <p className="text-xs text-[#4A5568]/50 mt-0.5">{t("pages.admin.pendingReview").replace("{count}", String(listings.length - approved.length - rejected.length))}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-amber-600">{t("pages.admin.needsReview")}</span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {listings.map((listing, i) => {
          const isApproved = approved.includes(listing.id);
          const isRejected = rejected.includes(listing.id);
          const isDone = isApproved || isRejected;

          return (
            <motion.div key={listing.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }} className={`border rounded-[18px] p-5 transition-all duration-300 ${
              isApproved ? "border-emerald-200 bg-emerald-50/50" : isRejected ? "border-red-100 bg-red-50/30 opacity-60" : "border-gray-100 hover:border-gray-200 hover:shadow-md"
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-[14px] bg-[#fafbfc] border border-gray-100 flex items-center justify-center text-sm font-black text-[#B2D2A4]">{listing.img}</div>
                <div className="text-right">
                  <span className="text-xs text-[#4A5568]/40">{listing.submitted}</span>
                  {isDone && (
                    <div className="mt-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isApproved ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                        {isApproved ? t("pages.admin.approved") : t("pages.admin.rejected")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-1 font-bold text-[#1a2332] text-sm">{listing.name}</div>
              <div className="text-xs text-[#4A5568]/50 mb-0.5">{listing.qty} · {listing.category}</div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 rounded-full bg-[#B2D2A4]/20 flex items-center justify-center text-xs font-bold text-[#B2D2A4]">{listing.donor[0]}</div>
                  <span className="text-xs text-[#4A5568]/50">{listing.donor}</span>
                </div>
                <div className="mt-2 text-xs text-red-400 font-medium">{t("pages.admin.exp")}: {listing.expires}</div>
              </div>

              {!isDone ? (
                <div className="flex gap-2">
                  <button onClick={() => setApproved((p) => [...p, listing.id])} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-[#B2D2A4] text-[#B2D2A4] text-xs font-bold hover:bg-[#B2D2A4]/10 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t("pages.admin.approve")}
                  </button>
                  <button onClick={() => setRejected((p) => [...p, listing.id])} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-red-400 text-xs font-semibold hover:bg-red-50 transition-colors border border-red-100">
                    <XCircle className="w-3.5 h-3.5" /> {t("pages.admin.reject")}
                  </button>
                </div>
              ) : (
                <button onClick={() => { setApproved((p) => p.filter((id) => id !== listing.id)); setRejected((p) => p.filter((id) => id !== listing.id)); }} className="w-full py-2 rounded-xl text-[#4A5568]/40 text-xs font-medium hover:bg-gray-50 transition-colors border border-gray-100">
                  {t("pages.admin.undo")}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function SystemMetrics({ t }: { t: Translate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-[#1a2332]">{t("pages.admin.systemMetrics")}</h2>
          <p className="text-xs text-[#4A5568]/50 mt-0.5">{t("pages.admin.requestsLast24h")}</p>
        </div>
        <div className="flex items-center gap-4">
          {["OCR API", "Recipe API"].map((label, index) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${index === 0 ? "bg-[#B2D2A4]" : "bg-[#4A5568]"}`} />
              <span className="text-xs text-[#4A5568]/60 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={apiData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={35} />
            <Tooltip contentStyle={{ backgroundColor: "white", border: "none", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", fontSize: "12px" }} labelStyle={{ color: "#1a2332", fontWeight: 700, marginBottom: 4 }} />
            <Line type="monotone" dataKey="ocr" name="OCR API" stroke="#B2D2A4" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#B2D2A4", strokeWidth: 2, stroke: "white" }} />
            <Line type="monotone" dataKey="recipe" name="Recipe API" stroke="#4A5568" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#4A5568", strokeWidth: 2, stroke: "white" }} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {[
            { name: "External OCR API", requests: "8,730", latency: "142ms" },
            { name: "Recipe API", requests: "4,891", latency: "89ms" },
          ].map((item) => (
            <div key={item.name} className="p-4 bg-[#fafbfc] rounded-[16px] border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#1a2332]">{item.name}</span>
                <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {t("pages.admin.statuses.healthy")}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-[#4A5568]/40">{t("pages.admin.requestsToday")}</div>
                  <div className="text-sm font-bold text-[#1a2332]">{item.requests}</div>
                </div>
                <div>
                  <div className="text-xs text-[#4A5568]/40">{t("pages.admin.avgLatency")}</div>
                  <div className="text-sm font-bold text-[#1a2332]">{item.latency}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [activeNav, setActiveNav] = useState("dashboardOverview");
  const [adminUser, setAdminUser] = useState<UserDTO | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAdminAccess() {
      if (localStorage.getItem("foodmood_demo_admin") === "true") {
        setAdminUser({
          id: "demo-admin",
          name: localStorage.getItem("foodmood_demo_admin_name") || "Demo Admin",
          email: "admin@foodmood.local",
          role: "admin",
          stats: {
            foodSavedKg: 0,
            co2Offset: 0,
            moneySaved: 0,
            wasteWarriorLevel: 1,
          },
        });
        setCheckingAccess(false);
        return;
      }

      if (!auth.isAuthenticated()) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const { user } = await api.me();
        if (cancelled) return;
        if (user.role !== "admin") {
          navigate("/dashboard", { replace: true });
          return;
        }
        setAdminUser(user);
      } catch {
        if (!cancelled) navigate("/login", { replace: true });
      } finally {
        if (!cancelled) setCheckingAccess(false);
      }
    }

    checkAdminAccess();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const dateLocale = useMemo(() => (language === "kz" ? "kk-KZ" : language), [language]);

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-[#4A5568]">
        {t("pages.admin.checkingAccess")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} t={t} />
      <main className="ml-64">
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm h-16 flex items-center px-8 justify-between">
          <div>
            <h1 className="font-bold text-[#1a2332]">{t(`pages.admin.nav.${activeNav}`)}</h1>
            <p className="text-xs text-[#4A5568]/40">
              {new Date().toLocaleDateString(dateLocale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-[#4A5568]/50 hover:border-gray-300 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-400 rounded-full text-white text-[8px] flex items-center justify-center font-bold">4</span>
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-xl bg-[#1a2332] flex items-center justify-center text-white text-xs font-bold">
                {initials(adminUser?.name || "Admin")}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-[#1a2332]">{adminUser?.name || t("pages.admin.admin")}</div>
                <div className="text-xs text-[#4A5568]/40">{t("pages.admin.superAdmin")}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#4A5568]/30" />
            </div>
          </div>
        </div>

        <div className="p-8">
          <KPICards t={t} />
          <UserTable t={t} />
          <ModerationQueue t={t} />
          <SystemMetrics t={t} />
        </div>
      </main>
    </div>
  );
}
