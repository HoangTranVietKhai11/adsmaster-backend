"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart3, TrendingUp, TrendingDown, DollarSign,
    MousePointerClick, Eye, Target, Loader2, RefreshCw,
    Activity, Zap, AlertTriangle, CheckCircle, PieChart, Layout
} from "lucide-react";

import { MetricTooltip, METRIC_DEFS } from "@/components/MetricTooltip";
import { API_BASE_URL } from "@/lib/api";

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
        if (!token) {
            window.location.href = "/login";
            return;
        }
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/analytics/dashboard`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (res.status === 401) {
                localStorage.clear();
                window.location.href = "/login";
                return;
            }
            
            const json = await res.json();
            if (json.success) {
                setData(json.data || {});
            } else {
                if (json.error === "Token expired") {
                    localStorage.clear();
                    window.location.href = "/login";
                    return;
                }
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
        const token = localStorage.getItem("accessToken");
        try {
            // Using placeholder data to demonstrate the AI analysis capability
            const res = await fetch("/api/ai/analyze-metrics", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    metrics: [
                        { ad_id: "demo-1", impressions: 10000, clicks: 250, ctr: 2.5, cpc: 0.48, cpa: 6.66, roas: 4.5, spend: 120, revenue: 540, conversions: 18, reach: 9000, frequency: 1.11, date: new Date().toISOString().split("T")[0] },
                        { ad_id: "demo-2", impressions: 5000, clicks: 80, ctr: 1.6, cpc: 0.75, cpa: 15.0, roas: 2.0, spend: 60, revenue: 120, conversions: 4, reach: 4500, frequency: 1.11, date: new Date().toISOString().split("T")[0] },
                    ],
                }),
            });
            const json = await res.json();
            if (json.success) {
                setAiInsights(json.recommendations || []);
            } else {
                setAiInsights([{ severity: "LOW", type: "INFO", recommendation: json.error || "Không thể phân tích dữ liệu." }]);
            }
        } catch {
            setAiInsights([{ severity: "LOW", type: "INFO", recommendation: "Lỗi kết nối đến máy chủ AI." }]);
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
                    <h1 className="text-2xl font-bold text-white">Phân tích</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Tổng quan hiệu suất cho tất cả chiến dịch của bạn
                    </p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-white hover:border-brand-500/40 transition-all"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Làm mới
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
                            "Tổng chi tiêu",
                            fmt(data.totalSpend, "đ"),
                            "Tất cả chiến dịch",
                            <DollarSign className="w-5 h-5 text-brand-400" />,
                            "neutral",
                            "brand"
                        )}
                        {metricCard(
                            "Lượt hiển thị",
                            fmt(data.totalImpressions, "", 0),
                            "Tổng lượt xem",
                            <Eye className="w-5 h-5 text-purple-400" />,
                            "up",
                            "brand"
                        )}
                        {metricCard(
                            "Lượt nhấp",
                            fmt(data.totalClicks, "", 0),
                            "Tổng lượt nhấp link",
                            <MousePointerClick className="w-5 h-5 text-blue-400" />,
                            "up",
                            "green"
                        )}
                        {metricCard(
                            "Chuyển đổi",
                            fmt(data.totalConversions, "", 0),
                            "Mục tiêu hoàn thành",
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
                                    <MetricTooltip label="Tỷ lệ nhấp (CTR)" value="" plain={METRIC_DEFS.CTR.plain} tip={METRIC_DEFS.CTR.tip} />
                                    <p className="text-2xl font-bold text-white mt-1">{ctr !== undefined ? `${ctr.toFixed(2)}%` : "—"}</p>
                                    <p className="text-2xl font-bold text-white">{ctr !== undefined ? `${ctr.toFixed(2)}%` : "—"}</p>
                                </div>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700"
                                    style={{ width: `${Math.min((ctr ?? 0) * 20, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">TB ngành: 1.5% — 3%</p>
                        </div>

                        <div className="glass-card rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <MetricTooltip label="Phí mỗi khách (CPA)" value="" plain={METRIC_DEFS.CPA.plain} tip={METRIC_DEFS.CPA.tip} />
                                    <p className="text-2xl font-bold text-white mt-1">{cpa !== undefined ? `${cpa.toLocaleString()}đ` : "—"}</p>
                                </div>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-700"
                                    style={{ width: `${Math.min(100 - (cpa ?? 50) * 2, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Càng thấp càng tốt</p>
                        </div>

                        <div className="glass-card rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <MetricTooltip label="Lợi nhuận (ROAS)" value="" plain={METRIC_DEFS.ROAS.plain} tip={METRIC_DEFS.ROAS.tip} />
                                    <p className="text-2xl font-bold text-white mt-1">{roas !== undefined ? `${roas.toFixed(2)}x` : "—"}</p>
                                    <p className="text-2xl font-bold text-white">{roas !== undefined ? `${roas.toFixed(2)}x` : "—"}</p>
                                </div>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                                    style={{ width: `${Math.min((roas ?? 0) * 25, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">ROAS hòa vốn: 1.0x</p>
                        </div>
                    </div>

                    {/* No data placeholder */}
                    {!data.totalSpend && !data.totalImpressions && !error && (
                        <div className="glass-card rounded-2xl p-16 text-center border border-white/5">
                            <BarChart3 className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-white font-semibold text-lg">Chưa có dữ liệu phân tích</h3>
                            <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
                                Tạo chiến dịch và thêm các chỉ số quảng cáo để bắt đầu thấy dữ liệu hiệu suất tại đây.
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Feature 4: 2025 Performance Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Asset Performance Table */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-2 mb-6 text-white font-semibold">
                        <Layout className="w-5 h-5 text-brand-400" /> Phân Tích Hiệu Suất Tài Sản (Asset Performance)
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-muted-foreground border-b border-white/5">
                                    <th className="text-left py-3 font-medium">Tài sản (Hình ảnh/Tiêu đề)</th>
                                    <th className="text-center py-3 font-medium">CTR (%)</th>
                                    <th className="text-center py-3 font-medium">CPA (VNĐ)</th>
                                    <th className="text-right py-3 font-medium">Đánh giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: "Video: Launch Hook (0-15s)", ctr: "2.8%", cpa: "25k", rank: "Xuất sắc", color: "text-emerald-400 bg-emerald-400/10" },
                                    { name: "Image: Lifestyle model", ctr: "1.5%", cpa: "45k", rank: "Ổn định", color: "text-brand-400 bg-brand-400/10" },
                                    { name: "Headline: Miễn phí vận chuyển", ctr: "0.9%", cpa: "75k", rank: "Kém", color: "text-red-400 bg-red-400/10" },
                                ].map((asset, i) => (
                                    <tr key={i} className="border-b border-white/3">
                                        <td className="py-4 text-white font-medium">{asset.name}</td>
                                        <td className="py-4 text-center text-muted-foreground">{asset.ctr}</td>
                                        <td className="py-4 text-center text-muted-foreground">{asset.cpa}</td>
                                        <td className="py-4 text-right">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${asset.color}`}>
                                                {asset.rank}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-4 italic">
                        * Dữ liệu mô phỏng dựa trên Performance Max insights năm 2025.
                    </p>
                </div>

                {/* Demographics Pie Chart (Visual representation) */}
                <div className="glass-card rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-2 mb-6 text-white font-semibold">
                        <PieChart className="w-5 h-5 text-purple-400" /> Nhân khẩu học (Demographics)
                    </div>
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs text-muted-foreground mb-2 flex justify-between">
                                <span>Độ tuổi: 25-34</span>
                                <span className="text-white">45%</span>
                            </p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full">
                                <div className="h-full bg-brand-500 rounded-full" style={{ width: "45%" }} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-2 flex justify-between">
                                <span>Độ tuổi: 18-24</span>
                                <span className="text-white">30%</span>
                            </p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: "30%" }} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-2 flex justify-between">
                                <span>Giới tính: Nữ</span>
                                <span className="text-white">65%</span>
                            </p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full">
                                <div className="h-full bg-pink-500 rounded-full" style={{ width: "65%" }} />
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 mt-4">
                            <p className="text-[11px] text-purple-200">
                                💡 <strong>Mẹo 2025:</strong> Nhóm <strong>Nữ (25-34)</strong> là tệp đối tượng có tỷ lệ chuyển đổi (ROAS) cao nhất của bạn. Hãy thử tăng ngân sách cho tệp này!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Insights */}
            <div className="glass-card rounded-2xl p-6 border border-brand-500/20">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">Gợi Ý AI</h2>
                            <p className="text-xs text-muted-foreground">Được hỗ trợ bởi công cụ phân tích Python</p>
                        </div>
                    </div>
                    <button
                        onClick={runAiAnalysis}
                        disabled={aiLoading}
                        className="btn-primary text-sm flex items-center gap-2"
                    >
                        {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        {aiLoading ? "Đang phân tích..." : "Chạy Phân Tích"}
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
                                        <p className="text-sm font-medium">{insight.type || "Gợi ý"}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{insight.description || insight.message || insight.recommendation}</p>
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
                        Nhấn <strong className="text-white">Chạy Phân Tích</strong> để nhận các đề xuất hỗ trợ bởi AI cho chiến dịch của bạn.
                    </p>
                )}
            </div>
        </div>
    );
}
