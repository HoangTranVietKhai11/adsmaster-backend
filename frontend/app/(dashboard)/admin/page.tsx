"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, Megaphone, UserCheck, BarChart3, Settings, Loader2, TrendingUp } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function AdminPage() {
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"overview" | "users" | "payments">("overview");

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        Promise.all([
            fetch(`${API_BASE_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch(`${API_BASE_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ]).then(([statsData, usersData]) => {
            if (statsData.success) setStats(statsData.data);
            if (usersData.success) setUsers(usersData.data);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Settings className="w-6 h-6 text-brand-500" />
                <h1 className="text-2xl font-bold text-white">Trang quản trị</h1>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: Users, label: "Tổng người dùng", value: stats.totalUsers, color: "text-brand-500" },
                        { icon: Megaphone, label: "Số chiến dịch", value: stats.totalCampaigns, color: "text-purple-500" },
                        { icon: DollarSign, label: "Tổng doanh thu", value: `$${stats.totalRevenue?.toFixed(0)}`, color: "text-emerald-500" },
                        { icon: UserCheck, label: "Cộng tác viên", value: stats.totalAffiliates, color: "text-pink-500" },
                    ].map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="glass-card rounded-xl p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted-foreground">{s.label}</span>
                                <s.icon className={`w-5 h-5 ${s.color}`} />
                            </div>
                            <p className="text-2xl font-bold text-white">{s.value}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2">
                {(["overview", "users", "payments"] as const).map(t => {
                    const labels: Record<string, string> = {
                        overview: "Tổng quan",
                        users: "Người dùng",
                        payments: "Thanh toán"
                    };
                    return (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "gradient-brand text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>
                            {labels[t]}
                        </button>
                    );
                })}
            </div>

            {/* Users table */}
            {tab === "users" && (
                <div className="glass-card rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead><tr className="border-b border-white/5">
                            {[["User", "Người dùng"], ["Email", "Email"], ["Role", "Vai trò"], ["Plan", "Gói"], ["Campaigns", "Chiến dịch"], ["Joined", "Ngày tham gia"]].map(([k, h]) => (
                                <th key={k} className="text-left text-xs font-medium text-muted-foreground px-4 py-3 first:pl-5">{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {users.map((u, i) => (
                                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                    className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-xs text-white font-bold">{u.name[0]}</div>
                                            <span className="text-sm text-white">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "ADMIN" ? "text-red-400 bg-red-400/10" : u.role === "INSTRUCTOR" ? "text-brand-400 bg-brand-400/10" : "text-gray-400 bg-gray-400/10"}`}>
                                            {{
                                                ADMIN: "QUẢN TRỊ",
                                                INSTRUCTOR: "GIẢNG VIÊN",
                                                USER: "THÀNH VIÊN"
                                            }[u.role as string] || u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{u.plan?.name || "MIỄN PHÍ"}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{u._count?.campaigns || 0}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === "overview" && stats?.recentPayments && (
                <div className="glass-card rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/5">
                        <h3 className="font-semibold text-white">Thanh toán gần đây</h3>
                    </div>
                    <table className="w-full">
                        <thead><tr className="border-b border-white/5">
                            {[["User", "Người dùng"], ["Amount", "Số tiền"], ["Status", "Trạng thái"], ["Date", "Ngày"]].map(([k, h]) => (
                                <th key={k} className="text-left text-xs font-medium text-muted-foreground px-4 py-3 first:pl-5">{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {stats.recentPayments.map((p: any, i: number) => (
                                <tr key={p.id} className="border-b border-white/5">
                                    <td className="px-5 py-3 text-sm text-white">{p.user?.name}</td>
                                    <td className="px-4 py-3 text-sm text-emerald-400 font-semibold">${p.amount}</td>
                                    <td className="px-4 py-3"><span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">THÀNH CÔNG</span></td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
