"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, Megaphone, BarChart3, Sparkles, BookOpen,
    Users, CreditCard, Settings, Bell, ChevronLeft, ChevronRight,
    Zap, LogOut, User, UserCheck, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Megaphone, label: "Campaigns", href: "/campaigns" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: Sparkles, label: "AI Generator", href: "/ai-generator" },
    { icon: BookOpen, label: "Courses", href: "/courses" },
    { icon: UserCheck, label: "Affiliate", href: "/affiliate" },
    { icon: Users, label: "CRM", href: "/crm" },
    { icon: CreditCard, label: "Billing", href: "/billing" },
];

const adminItems = [
    { icon: Settings, label: "Admin Panel", href: "/admin" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [notifications, setNotifications] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        const token = localStorage.getItem("accessToken");
        if (!token || !stored) { router.push("/login"); return; }
        setUser(JSON.parse(stored));
        // Fetch notification count
        fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((d) => setNotifications(d.unreadCount || 0))
            .catch(() => { });
    }, [router]);

    function logout() {
        localStorage.clear();
        router.push("/login");
    }

    const Sidebar = ({ mobile = false }) => (
        <div className={cn(
            "flex flex-col h-full bg-[#0a0d1a] border-r border-white/5",
            mobile ? "w-72" : collapsed ? "w-20" : "w-64",
            "transition-all duration-300"
        )}>
            {/* Logo */}
            <div className="p-4 flex items-center justify-between border-b border-white/5">
                <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 animate-glow">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <AnimatePresence>
                        {(!collapsed || mobile) && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-bold text-white whitespace-nowrap overflow-hidden"
                            >
                                Ads<span className="gradient-text">Master</span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
                {!mobile && (
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                            <div className={cn("sidebar-item", active && "sidebar-item-active")}>
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <AnimatePresence>
                                    {(!collapsed || mobile) && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="truncate"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Link>
                    );
                })}

                {user?.role === "ADMIN" && (
                    <>
                        <div className={cn("px-3 py-1.5 mt-4", collapsed && !mobile ? "hidden" : "block")}>
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</span>
                        </div>
                        {adminItems.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                                    <div className={cn("sidebar-item", active && "sidebar-item-active")}>
                                        <item.icon className="w-5 h-5 flex-shrink-0" />
                                        {(!collapsed || mobile) && <span className="truncate">{item.label}</span>}
                                    </div>
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* User */}
            <div className="p-3 border-t border-white/5">
                <div className={cn("flex items-center gap-3 p-2 rounded-lg", !collapsed || mobile ? "justify-start" : "justify-center")}>
                    <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <AnimatePresence>
                        {(!collapsed || mobile) && user && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 overflow-hidden"
                            >
                                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {(!collapsed || mobile) && (
                        <button onClick={logout} className="text-muted-foreground hover:text-white transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#080b14] overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-shrink-0">
                <Sidebar />
            </div>

            {/* Mobile sidebar overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-40 md:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.div
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
                        >
                            <Sidebar mobile />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="h-16 border-b border-white/5 bg-[#0a0d1a]/80 backdrop-blur-xl flex items-center px-4 md:px-6 gap-4 flex-shrink-0">
                    <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-400 hover:text-white">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex-1" />
                    {/* Notification bell */}
                    <Link href="/dashboard" className="relative p-2 text-muted-foreground hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                        {notifications > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {notifications > 9 ? "9+" : notifications}
                            </span>
                        )}
                    </Link>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
