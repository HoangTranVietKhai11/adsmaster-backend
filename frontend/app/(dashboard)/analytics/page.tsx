"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart3, TrendingUp, TrendingDown, DollarSign,
    MousePointerClick, Eye, Target, Loader2, RefreshCw,
    Activity, Zap, AlertTriangle, CheckCircle
} from "lucide-react";

interface AnalyticsData {
    totalSpend?: number;
    totalImpressions?: number;
    totalClicks?: number;
    totalConversions?: number;
    avgCTR?: number;
    avgCPA?: number;
    avgROAS?: number;
    campaigns?: any[];
}

const metricCard = (
    label: string,
    value: string,
    sub: string,
    icon: React.ReactNode,
    trend?: "up" | "down" | "neutral",
    color = "brand"
) => {
    const colors: Record<string, string> = {
        brand: "from-brand-500/20 to-purple-500/20 border-brand-500/30",
        green: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
        yellow: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
        red: "from-red-500/20 to-pink-500/20 border-red-500/30",
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card rounded-2xl p-5 border bg-gradient-to-br ${colors[color] || colors.brand}`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-white/5">{icon}</div>
                {trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                {trend === "down" && <TrendingDown className="w-4 h-4 text-red-400" />}
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
        </motion.div>
    );
};

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData>({});
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiInsights, setAiInsights] = useState<any[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAnalytics();
    }, []);

    async function fetchAnalytics() {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch("/api/analytics/dashboard", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success) {
                setData(json.data || {});
            } else {
                setError(json.error || "Failed to load analytics");
            }
        } catch {
            setError("Could not connect to analytics service");
        } finally {
            setLoading(false);
        }
    }

    async function runAiAnalysis() {
        setAiLoading(true);
        try {
            const res = await fetch("http://localhost:8001/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: "demo",
                    metrics: [
                        { campaign_id: "demo-1", impressions: 10000, clicks: 250, spend: 120, conversions: 18, date: new Date().toISOString().split("T")[0] },
                        { campaign_id: "demo-2", impressions: 5000, clicks: 80, spend: 60, conversions: 4, date: new Date().toISOString().split("T")[0] },
                    ],
                }),
            });
            const json = await res.json();
            setAiInsights(json.recommendations || []);
        } catch {
            setAiInsights([{ severity: "LOW", type: "INFO", message: "AI Engine not available. Make sure the AI service is running on port 8001." }]);
        } finally {
            setAiLoading(false);
        }
    }

    const fmt = (n?: number, prefix = "", decimals = 2) =>
        n !== undefined ? `${prefix}${n.toLocaleString(undefined, { maximumFractionDigits: decimals })}` : "—";

    const ctr = data.avgCTR ?? (data.totalClicks && data.totalImpressions ? (data.totalClicks / data.totalImpressions) * 100 : undefined);
    const roas = data.avgROAS;
    const cpa = data.avgCPA;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Performance overview for all your campaigns
                    </p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-white hover:border-brand-500/40 transition-all"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="glass-card rounded-xl p-4 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Metrics grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {metricCard(
                            "Total Spend",
                            fmt(data.totalSpend, "$"),
                            "Across all campaigns",
                            <DollarSign className="w-5 h-5 text-brand-400" />,
                            "neutral",
                            "brand"
                        )}
                        {metricCard(
                            "Impressions",
                            fmt(data.totalImpressions, "", 0),
                            "Total ad views",
                            <Eye className="w-5 h-5 text-purple-400" />,
                            "up",
                            "brand"
                        )}
                        {metricCard(
                            "Clicks",
                            fmt(data.totalClicks, "", 0),
                            "Total link clicks",
                            <MousePointerClick className="w-5 h-5 text-blue-400" />,
                            "up",
                            "green"
                        )}
                        {metricCard(
                            "Conversions",
                            fmt(data.totalConversions, "", 0),
                            "Completed goals",
                            <Target className="w-5 h-5 text-emerald-400" />,
                            "up",
                            "green"
                        )}
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass-card rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Click-Through Rate</p>
                                    <p className="text-2xl font-bold text-white">{ctr !== undefined ? `${ctr.toFixed(2)}%` : "—"}</p>
                                </div>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700"
                                    style={{ width: `${Math.min((ctr ?? 0) * 20, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Industry avg: 1.5% — 3%</p>
                        </div>

                        <div className="glass-card rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Cost Per Acquisition</p>
                                    <p className="text-2xl font-bold text-white">{cpa !== undefined ? `$${cpa.toFixed(2)}` : "—"}</p>
                                </div>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-700"
                                    style={{ width: `${Math.min(100 - (cpa ?? 50) * 2, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Lower is better</p>
                        </div>

                        <div className="glass-card rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Return on Ad Spend</p>
                                    <p className="text-2xl font-bold text-white">{roas !== undefined ? `${roas.toFixed(2)}x` : "—"}</p>
                                </div>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                                    style={{ width: `${Math.min((roas ?? 0) * 25, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Break-even ROAS: 1.0x</p>
                        </div>
                    </div>

                    {/* No data placeholder */}
                    {!data.totalSpend && !data.totalImpressions && !error && (
                        <div className="glass-card rounded-2xl p-16 text-center border border-white/5">
                            <BarChart3 className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-white font-semibold text-lg">No analytics data yet</h3>
                            <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
                                Create campaigns and add ad metrics to start seeing performance data here.
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* AI Insights */}
            <div className="glass-card rounded-2xl p-6 border border-brand-500/20">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">AI Insights</h2>
                            <p className="text-xs text-muted-foreground">Powered by Python analytics engine</p>
                        </div>
                    </div>
                    <button
                        onClick={runAiAnalysis}
                        disabled={aiLoading}
                        className="btn-primary text-sm flex items-center gap-2"
                    >
                        {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        {aiLoading ? "Analyzing..." : "Run Analysis"}
                    </button>
                </div>

                {aiInsights.length > 0 ? (
                    <div className="space-y-3">
                        {aiInsights.map((insight: any, i: number) => {
                            const colors: Record<string, string> = {
                                HIGH: "border-red-500/40 bg-red-500/10 text-red-400",
                                MEDIUM: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
                                LOW: "border-brand-500/40 bg-brand-500/10 text-brand-400",
                            };
                            const cls = colors[insight.severity] || colors.LOW;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`flex items-start gap-3 p-4 rounded-xl border ${cls}`}
                                >
                                    {insight.severity === "HIGH" ? (
                                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium">{insight.type || "Insight"}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{insight.message || insight.recommendation}</p>
                                    </div>
                                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${cls} flex-shrink-0`}>
                                        {insight.severity}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Click <strong className="text-white">Run Analysis</strong> to get AI-powered recommendations for your campaigns.
                    </p>
                )}
            </div>
        </div>
    );
}
