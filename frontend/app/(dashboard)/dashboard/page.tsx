"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
    TrendingUp, TrendingDown, DollarSign, Users,
    Eye, CheckCircle, Sparkles, AlertTriangle, Info, Lightbulb, MessageCircle,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316"];

const mockTimeline = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" }),
    chiTieu: Math.random() * 200 + 100,
    doanhThu: Math.random() * 800 + 400,
}));

function MetricCard({ title, value, change, icon: Icon, color, explanation }: any) {
    const isPositive = change >= 0;
    return (
        <motion.div whileHover={{ y: -2 }} className="stat-card">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-brand-500/10`}>
                    <Icon className="w-5 h-5 text-brand-500" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"} px-2 py-1 rounded-full`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(change)}%
                </span>
            </div>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
            <p className="text-sm font-medium text-white mt-1">{title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{explanation}</p>
        </motion.div>
    );
}

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [kpi, setKpi] = useState({
        totalImpressions: 45280, totalClicks: 987, totalSpend: 1247,
        totalRevenue: 5238, avgCtr: 2.18, roas: 4.2, activeCampaigns: 3, unreadInsights: 2
    });

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        fetch(`${API_BASE_URL}/api/analytics/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((d) => { if (d.data?.kpi) setKpi(d.data.kpi); })
            .catch(() => { });
    }, []);

    const profit = kpi.totalRevenue - kpi.totalSpend;
    const isProfit = profit >= 0;

    const aiAdvice = [
        {
            type: "warning",
            icon: AlertTriangle,
            title: "⚠️ Quảng cáo đang bị nhàm",
            desc: "Khách hàng đang xem đi xem lại cùng một mẫu quảng cáo quá nhiều lần rồi. Hãy thay hình ảnh hoặc nội dung mới để họ không bị chán nhé!",
            action: "Đổi mẫu quảng cáo",
            href: "/ai-generator"
        },
        {
            type: "tip",
            icon: Lightbulb,
            title: "💡 Chiến dịch này đang tốt!",
            desc: "Cứ mỗi 1đ bạn bỏ ra chạy quảng cáo, bạn đang thu về 4.2đ. Đây là tỷ lệ sinh lời rất tốt! Bạn có thể tăng thêm tiền để bán được nhiều hơn.",
            action: "Tăng ngân sách",
            href: "/campaigns"
        },
        {
            type: "info",
            icon: Info,
            title: "📊 Mẹo tăng hiệu quả",
            desc: "Trong 100 người nhấp vào quảng cáo của bạn, chỉ có 2 người mua hàng. Bạn có thể tăng con số này lên bằng cách làm đẹp hơn trang bán hàng.",
            action: "Tìm hiểu thêm",
            href: "/courses"
        },
    ];

    return (
        <div className="space-y-6">
            {/* Greeting */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        👋 Xin chào, {user?.name?.split(" ").pop() || "bạn"}!
                    </h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Đây là bức tranh toàn cảnh quảng cáo của bạn hôm nay — {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                </div>
                <Link href="/ai-generator" className="btn-primary flex items-center gap-2 text-sm no-underline">
                    <Sparkles className="w-4 h-4" /> Tạo quảng cáo với AI
                </Link>
            </div>

            {/* Profit summary / Hero card */}
            <div className={`glass-card rounded-2xl p-6 relative overflow-hidden border ${isProfit ? "border-emerald-500/30" : "border-red-500/30"}`}>
                <div className={`absolute inset-0 ${isProfit ? "bg-emerald-500/5" : "bg-red-500/5"}`} />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                            {isProfit ? "✅ Đang có lãi" : "❌ Đang bị lỗ"}
                        </span>
                        <h2 className="text-3xl font-bold text-white mt-1">
                            {isProfit ? "+" : "-"}{Math.abs(profit).toLocaleString()}đ
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            {isProfit
                                ? `Bạn đã tiêu ${kpi.totalSpend.toLocaleString()}đ và thu về ${kpi.totalRevenue.toLocaleString()}đ — lãi ${profit.toLocaleString()}đ 🎉`
                                : `Bạn đã tiêu ${kpi.totalSpend.toLocaleString()}đ nhưng chỉ thu về ${kpi.totalRevenue.toLocaleString()}đ — thua lỗ ${Math.abs(profit).toLocaleString()}đ. Hãy xem gợi ý AI bên dưới!`
                            }
                        </p>
                    </div>
                    <div className={`text-center px-6 py-4 rounded-xl ${isProfit ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                        <p className="text-xs text-muted-foreground mb-1">Cứ bỏ 1đ thu về</p>
                        <p className={`text-3xl font-bold ${isProfit ? "text-emerald-400" : "text-red-400"}`}>{kpi.roas}đ</p>
                        <p className="text-xs text-muted-foreground mt-1">{kpi.roas >= 3 ? "👍 Tốt!" : "⚠️ Cần cải thiện"}</p>
                    </div>
                </div>
            </div>

            {/* 4 metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Người nhìn thấy quảng cáo"
                    value={formatNumber(kpi.totalImpressions)}
                    change={12.5}
                    icon={Eye}
                    explanation="Tổng số lượt Facebook hiện quảng cáo của bạn tháng này"
                />
                <MetricCard
                    title="Người bấm vào xem"
                    value={formatNumber(kpi.totalClicks)}
                    change={8.3}
                    icon={Users}
                    explanation={`${kpi.avgCtr}% những người nhìn thấy đã bấm — trung bình ngành là 1.5%`}
                />
                <MetricCard
                    title="Tiền đã chi cho quảng cáo"
                    value={`${kpi.totalSpend.toLocaleString()}đ`}
                    change={-3.1}
                    icon={DollarSign}
                    explanation="Tổng tiền bạn đã trả cho Facebook để hiển thị quảng cáo"
                />
                <MetricCard
                    title="Doanh thu thu về"
                    value={`${kpi.totalRevenue.toLocaleString()}đ`}
                    change={22.4}
                    icon={CheckCircle}
                    explanation="Tổng tiền bán hàng thu về nhờ quảng cáo Facebook"
                />
            </div>

            {/* Revenue chart */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-white">Tiền Chi Ra vs. Tiền Thu Về (30 ngày qua)</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Đường tím = tiền đã tiêu · Đường xanh = tiền thu về. Đường xanh cao hơn tím là đang có lãi!</p>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500" />Thu về</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" />Chi ra</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={mockTimeline}>
                        <defs>
                            <linearGradient id="doanhThu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="chiTieu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1f35" />
                        <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} interval={6} />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ background: "#0a0d1a", border: "1px solid #1a1f35", borderRadius: "12px", color: "#fff", fontSize: 12 }}
                            formatter={(value: any) => [
                                `${Number(value).toLocaleString()}đ`,
                                "Số tiền",
                            ]}
                        />
                        <Area type="monotone" dataKey="doanhThu" stroke="#6366f1" fill="url(#doanhThu)" strokeWidth={2} />
                        <Area type="monotone" dataKey="chiTieu" stroke="#8b5cf6" fill="url(#chiTieu)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* AI Advice - plain language */}
            <div>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-brand-500" />
                    AI Đang Nhắn Với Bạn...
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {aiAdvice.map((item) => (
                        <motion.div
                            key={item.title}
                            whileHover={{ y: -2 }}
                            className={`glass-card rounded-xl p-4 border-l-2 flex flex-col gap-3 ${item.type === "warning" ? "border-yellow-500" : item.type === "tip" ? "border-emerald-500" : "border-blue-500"}`}
                        >
                            <div>
                                <p className="text-sm font-semibold text-white">{item.title}</p>
                                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.desc}</p>
                            </div>
                            <Link href={item.href} className={`text-xs font-medium inline-flex items-center gap-1 no-underline mt-auto ${item.type === "warning" ? "text-yellow-400 hover:text-yellow-300" : item.type === "tip" ? "text-emerald-400 hover:text-emerald-300" : "text-blue-400 hover:text-blue-300"}`}>
                                {item.action} →
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Quick actions */}
            <div className="glass-card rounded-xl p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-500" /> Bạn Muốn Làm Gì Tiếp Theo?
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Tạo Quảng Cáo Mới", emoji: "✍️", href: "/ai-generator", desc: "AI viết nội dung giúp bạn" },
                        { label: "Xem Chiến Dịch", emoji: "📋", href: "/campaigns", desc: "Bật/tắt, thêm ngân sách" },
                        { label: "Danh Sách Khách", emoji: "👥", href: "/crm", desc: "Quản lý khách hàng" },
                        { label: "Học Thêm", emoji: "🎓", href: "/courses", desc: "Video hướng dẫn miễn phí" },
                    ].map((item) => (
                        <Link key={item.href} href={item.href} className="no-underline">
                            <div className="p-4 rounded-xl border border-white/5 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all text-center group cursor-pointer">
                                <div className="text-2xl mb-2">{item.emoji}</div>
                                <p className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors">{item.label}</p>
                                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Onboarding checklist for new users */}
            <OnboardingChecklist />
        </div>
    );
}
