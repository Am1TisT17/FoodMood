import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Bell,
  ChevronDown,
  Circle,
  Globe,
  LayoutDashboard,
  Leaf,
  Mail,
  MoreHorizontal,
  Save,
  Scan,
  Search,
  ShieldCheck,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { api, auth, UserDTO } from "../../lib/api";
import { useLanguage } from "../context/LanguageContext";

const users = [
  { id: "USR-0041", name: "Sarah Chen", email: "sarah.c@email.com", registered: "2024-01-12", status: "active", scans: 47 },
  { id: "USR-0042", name: "Marcus Rivera", email: "m.rivera@email.com", registered: "2024-02-08", status: "active", scans: 31 },
  { id: "USR-0043", name: "Priya Patel", email: "priya.p@email.com", registered: "2024-02-14", status: "banned", scans: 3 },
  { id: "USR-0044", name: "Jonas Weber", email: "j.weber@email.com", registered: "2024-03-01", status: "active", scans: 89 },
  { id: "USR-0045", name: "Amara Osei", email: "amara.o@email.com", registered: "2024-03-19", status: "active", scans: 55 },
  { id: "USR-0046", name: "Lena Muller", email: "lena.m@email.com", registered: "2024-04-02", status: "inactive", scans: 6 },
];

const kpis = [
  { labelKey: "kpiUsersOnline", sublabelKey: "kpiUsersOnlineSub", value: "3,842", icon: Globe, iconBg: "bg-[#B2D2A4]/15", iconColor: "text-[#B2D2A4]", trend: "up" },
  { labelKey: "kpiTotalUsers", sublabelKey: "kpiTotalUsersSub", value: "48,200", icon: Users, iconBg: "bg-blue-50", iconColor: "text-blue-500", trend: "up" },
  { labelKey: "kpiScansToday", sublabelKey: "kpiScansTodaySub", value: "8,730", icon: Scan, iconBg: "bg-amber-50", iconColor: "text-amber-500", trend: "up" },
  { labelKey: "kpiCo2Saved", sublabelKey: "kpiCo2SavedSub", value: "12,490", icon: Leaf, iconBg: "bg-emerald-50", iconColor: "text-emerald-500", trend: "neutral" },
];

const navItems = [
  { icon: LayoutDashboard, key: "dashboardOverview" },
  { icon: Users, key: "userManagement" },
  { icon: User, key: "profileSettings" },
];

type AdminNavKey = "dashboardOverview" | "userManagement" | "profileSettings";
type Translate = (key: string, fallback?: string) => string;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AdminSidebar({ activeNav, setActiveNav, t }: { activeNav: AdminNavKey; setActiveNav: (s: AdminNavKey) => void; t: Translate }) {
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
            onClick={() => setActiveNav(item.key as AdminNavKey)}
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

      <div className="px-4 pb-5">
        <div className="rounded-2xl bg-white/5 border border-white/8 p-4">
          <div className="flex items-center gap-2 text-[#B2D2A4] text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4" />
            {t("pages.admin.secureArea")}
          </div>
          <p className="text-white/35 text-xs leading-relaxed">{t("pages.admin.secureAreaText")}</p>
        </div>
      </div>
    </aside>
  );
}

function KPICards({ t }: { t: Translate }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
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

function DashboardOverview({ t, setActiveNav }: { t: Translate; setActiveNav: (s: AdminNavKey) => void }) {
  const statusCounts = {
    active: users.filter((user) => user.status === "active").length,
    inactive: users.filter((user) => user.status === "inactive").length,
    banned: users.filter((user) => user.status === "banned").length,
  };

  return (
    <div className="space-y-8">
      <KPICards t={t} />
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
        <section className="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#1a2332]">{t("pages.admin.recentUsers")}</h2>
              <p className="text-xs text-[#4A5568]/50 mt-0.5">{t("pages.admin.recentUsersText")}</p>
            </div>
            <button
              onClick={() => setActiveNav("userManagement")}
              className="px-3.5 py-2 text-sm rounded-xl border border-gray-200 text-[#4A5568]/70 hover:border-[#B2D2A4] transition-colors"
            >
              {t("pages.admin.openUsers")}
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {users.slice(0, 4).map((user) => (
              <div key={user.id} className="px-7 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#B2D2A4]/20 flex items-center justify-center text-[#B2D2A4] text-xs font-bold">
                    {initials(user.name)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1a2332]">{user.name}</div>
                    <div className="text-xs text-[#4A5568]/40">{user.email}</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#4A5568]/40">{user.id}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-7">
          <h2 className="font-bold text-[#1a2332] mb-2">{t("pages.admin.userStatusTitle")}</h2>
          <p className="text-xs text-[#4A5568]/50 mb-6">{t("pages.admin.userStatusText")}</p>
          <div className="space-y-4">
            {(["active", "inactive", "banned"] as const).map((status) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-[#4A5568]">{t(`pages.admin.statuses.${status}`)}</span>
                  <span className="text-sm font-bold text-[#1a2332]">{statusCounts[status]}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${status === "active" ? "bg-emerald-400" : status === "inactive" ? "bg-gray-400" : "bg-red-400"}`}
                    style={{ width: `${(statusCounts[status] / users.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function UserManagementPage({ t }: { t: Translate }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const headers = ["userId", "name", "registrationDate", "ocrScans", "status", "actions"];

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
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
    </motion.section>
  );
}

function ProfileSettingsPage({ adminUser, t }: { adminUser: UserDTO | null; t: Translate }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.8fr] gap-6">
      <section className="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-7">
        <div className="mb-7">
          <h2 className="font-bold text-[#1a2332]">{t("pages.admin.profileSettingsTitle")}</h2>
          <p className="text-xs text-[#4A5568]/50 mt-0.5">{t("pages.admin.profileSettingsText")}</p>
        </div>
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-[#4A5568]">{t("pages.admin.profileName")}</span>
            <div className="mt-2 relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]/35" />
              <input value={adminUser?.name || "Admin"} readOnly className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-[#f8fafb] text-sm text-[#1a2332] outline-none" />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#4A5568]">{t("pages.admin.profileEmail")}</span>
            <div className="mt-2 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]/35" />
              <input value={adminUser?.email || "admin@foodmood.local"} readOnly className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-[#f8fafb] text-sm text-[#1a2332] outline-none" />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#4A5568]">{t("pages.admin.profileRole")}</span>
            <div className="mt-2 relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]/35" />
              <input value={t("pages.admin.superAdmin")} readOnly className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-[#f8fafb] text-sm text-[#1a2332] outline-none" />
            </div>
          </label>
          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#B2D2A4] text-[#1a2332] text-sm font-bold hover:bg-[#9BC18A] transition-colors">
            <Save className="w-4 h-4" />
            {t("pages.admin.saveProfile")}
          </button>
        </div>
      </section>

      <section className="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-7">
        <h2 className="font-bold text-[#1a2332] mb-2">{t("pages.admin.securityTitle")}</h2>
        <p className="text-xs text-[#4A5568]/50 mb-6">{t("pages.admin.securityText")}</p>
        <div className="space-y-3">
          {["twoFactor", "loginAlerts", "sessionReview"].map((key) => (
            <div key={key} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
              <div>
                <div className="text-sm font-semibold text-[#1a2332]">{t(`pages.admin.security.${key}.title`)}</div>
                <div className="text-xs text-[#4A5568]/45 mt-0.5">{t(`pages.admin.security.${key}.text`)}</div>
              </div>
              <div className="w-11 h-6 rounded-full bg-[#B2D2A4] relative">
                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [activeNav, setActiveNav] = useState<AdminNavKey>("dashboardOverview");
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
          {activeNav === "dashboardOverview" && <DashboardOverview t={t} setActiveNav={setActiveNav} />}
          {activeNav === "userManagement" && <UserManagementPage t={t} />}
          {activeNav === "profileSettings" && <ProfileSettingsPage adminUser={adminUser} t={t} />}
        </div>
      </main>
    </div>
  );
}
