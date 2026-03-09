"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
    TrendingUp, TrendingDown, DollarSign, MousePointerClick,
    Eye, Target, Sparkles, ArrowUpRight, AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316"];

function StatCard({ title, value, change, icon: Icon, prefix = "", suffix = "", color = "brand" }: any) {
    const isPositive = change >= 0;
    return (
        <motion.div whileHover={{ y: -2 }} className="stat-card">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">
                        {prefix}{typeof value === "number" ? formatNumber(value) : value}{suffix}
                    </h3>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-brand-500/10`}>
                    <Icon className="w-5 h-5 text-brand-500" />
                </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
                {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={isPositive ? "text-emerald-500" : "text-red-500"}>
                    {Math.abs(change)}% vs last month
                </span>
            </div>
        </motion.div>
    );
}

const mockTimeline = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ctr: Math.random() * 2 + 1,
    roas: Math.random() * 3 + 2,
    spend: Math.random() * 200 + 100,
    revenue: Math.random() * 800 + 400,
}));

const funnelData = [
    { name: "Impressions", value: 45280 },
    { name: "Clicks", value: 987 },
    { name: "Landing Page Views", value: 712 },
    { name: "Add to Cart", value: 234 },
    { name: "Conversions", value: 67 },
];

const mockInsights = [
    { type: "CRITICAL", title: "Creative Fatigue Detected", desc: "Summer Sale Ad — Frequency 5.2x. Rotate creatives immediately.", icon: AlertTriangle },
    { type: "WARNING", title: "CTR Below Average", desc: "Ad Set 'Lookalike 1%' CTR dropped to 0.8%", icon: TrendingDown },
    { type: "SUCCESS", title: "ROAS Improving", desc: "Overall ROAS up 18% this week — great momentum!", icon: TrendingUp },
];

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [kpi, setKpi] = useState({ totalImpressions: 45280, totalClicks: 987, totalSpend: 1247, totalRevenue: 5238, avgCtr: 2.18, roas: 4.2, activeCampaigns: 3, unreadInsights: 2 });

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        fetch("/api/analytics/dashboard", { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((d) => { if (d.data?.kpi) setKpi(d.data.kpi); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Your campaign performance at a glance</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-primary flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4" />
                        Generate AI Insights
                    </button>
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Impressions" value={kpi.totalImpressions} change={12.5} icon={Eye} />
                <StatCard title="Total Clicks" value={kpi.totalClicks} change={8.3} icon={MousePointerClick} />
                <StatCard title="Total Ad Spend" value={kpi.totalSpend} change={-3.1} icon={DollarSign} prefix="$" />
                <StatCard title="Revenue Generated" value={kpi.totalRevenue} change={22.4} icon={Target} prefix="$" />
            </div>

            {/* Sub KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "CTR", value: `${kpi.avgCtr}%`, desc: "Industry avg: 1.5%" },
                    { label: "ROAS", value: `${kpi.roas}x`, desc: "Target: 3.0x" },
                    { label: "Active Campaigns", value: kpi.activeCampaigns, desc: "Out of 5 total" },
                    { label: "AI Insights", value: kpi.unreadInsights, desc: "Unread recommendations" },
                ].map((item) => (
                    <div key={item.label} className="glass-card rounded-xl p-4">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-xl font-bold text-white mt-1">{item.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue chart */}
                <div className="lg:col-span-2 glass-card rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Revenue & Spend (30 days)</h3>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500" />Revenue</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" />Spend</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={mockTimeline}>
                            <defs>
                                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a1f35" />
                            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} interval={6} />
                            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: "#0a0d1a", border: "1px solid #1a1f35", borderRadius: "12px", color: "#fff" }} />
                            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revenue)" strokeWidth={2} />
                            <Area type="monotone" dataKey="spend" stroke="#8b5cf6" fill="url(#spend)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Conversion funnel */}
                <div className="glass-card rounded-xl p-6">
                    <h3 className="font-semibold text-white mb-4">Conversion Funnel</h3>
                    <div className="space-y-3">
                        {funnelData.map((item, i) => (
                            <div key={item.name}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">{item.name}</span>
                                    <span className="text-white font-medium">{formatNumber(item.value)}</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.value / funnelData[0].value) * 100}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="h-full rounded-full"
                                        style={{ background: COLORS[i % COLORS.length] }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-3 bg-brand-500/10 rounded-lg">
                        <p className="text-xs text-brand-300 font-medium">Overall CVR</p>
                        <p className="text-lg font-bold text-white">6.79%</p>
                        <p className="text-xs text-muted-foreground">Of clicks → purchase</p>
                    </div>
                </div>
            </div>

            {/* AI Insights */}
            <div>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    AI Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockInsights.map((insight) => (
                        <motion.div
                            key={insight.title}
                            whileHover={{ y: -2 }}
                            className={`glass-card rounded-xl p-4 border-l-2 ${insight.type === "CRITICAL" ? "border-red-500" :
                                    insight.type === "WARNING" ? "border-yellow-500" : "border-emerald-500"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <insight.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${insight.type === "CRITICAL" ? "text-red-500" :
                                        insight.type === "WARNING" ? "text-yellow-500" : "text-emerald-500"
                                    }`} />
                                <div>
                                    <p className="text-sm font-medium text-white">{insight.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{insight.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
