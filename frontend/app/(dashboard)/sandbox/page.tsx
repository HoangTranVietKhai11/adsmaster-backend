"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Play, RotateCcw, DollarSign, TrendingUp, Eye, Users, Sparkles, AlertTriangle, CheckCircle } from "lucide-react";

const INDUSTRY_BENCHMARKS = {
    TRAFFIC: { ctr: 1.8, cpc: 30000, cpa: 500000, roas: 2.5, cvr: 2.1 },
    SALES: { ctr: 1.5, cpc: 45000, cpa: 450000, roas: 3.5, cvr: 2.8 },
    AWARENESS: { ctr: 0.8, cpc: 12500, cpa: 1000000, roas: 1.2, cvr: 0.5 },
    LEADS: { ctr: 2.1, cpc: 25000, cpa: 300000, roas: 4.0, cvr: 3.5 },
    ENGAGEMENT: { ctr: 3.0, cpc: 10000, cpa: 200000, roas: 1.8, cvr: 1.2 },
};

const OBJECTIVE_LABELS: Record<string, string> = {
    TRAFFIC: "Kéo khách vào website",
    SALES: "Bán hàng trực tiếp",
    AWARENESS: "Tăng nhận biết thương hiệu",
    LEADS: "Thu thập thông tin khách hàng",
    ENGAGEMENT: "Tăng tương tác bài đăng",
};

interface SimResult {
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
    cpa: number;
    roas: number;
    revenue: number;
    profit: number;
    rating: "great" | "ok" | "poor";
    tips: string[];
}

function simulate(objective: string, budget: number, audience: string, product_price: number): SimResult {
    const bench = INDUSTRY_BENCHMARKS[objective as keyof typeof INDUSTRY_BENCHMARKS] || INDUSTRY_BENCHMARKS.SALES;
    const audienceMult = audience === "warm" ? 1.4 : audience === "lookalike" ? 1.15 : 1.0;

    const ctr = +(bench.ctr * audienceMult * (0.85 + Math.random() * 0.3)).toFixed(2);
    const cpc = +(bench.cpc / audienceMult * (0.8 + Math.random() * 0.4)).toFixed(2);
    const clicks = Math.round(budget / cpc);
    const impressions = Math.round(clicks / (ctr / 100));
    const cvr = bench.cvr * audienceMult;
    const conversions = Math.round(clicks * (cvr / 100));
    const cpa = conversions > 0 ? +(budget / conversions).toFixed(2) : 999;
    const revenue = +(conversions * product_price).toFixed(2);
    const roas = budget > 0 ? +(revenue / budget).toFixed(2) : 0;
    const profit = +(revenue - budget).toFixed(2);

    const tips: string[] = [];
    if (ctr < 1.5) tips.push("CTR (tỷ lệ nhấp) dưới trung bình. Thêm emoji vào tiêu đề và dùng hình ảnh nổi bật hơn!");
    if (cpa > product_price * 0.4) tips.push("Chi phí mỗi đơn hàng đang chiếm quá nhiều so với giá sản phẩm. Thử tăng giá hoặc giảm chi phí ads.");
    if (roas >= 3) tips.push("🎉 ROAS trên 3x! Nếu kết quả thực tế thế này, bạn có thể tăng ngân sách gấp đôi!");
    if (audience === "cold") tips.push("Đối tượng lạnh thường hiệu quả thấp hơn. Thử dùng Custom Audience hoặc Lookalike 1% để cải thiện!");
    if (budget < 500000) tips.push("Ngân sách quá thấp, Facebook sẽ khó tối ưu. Thử ít nhất 500,000đ – 1,000,000đ/ngày để có kết quả đáng tin cậy hơn.");
    if (tips.length === 0) tips.push("Thiết lập của bạn trông khá ổn! Hãy bắt đầu với ngân sách nhỏ và scale dần khi kết quả tốt.");

    const rating = roas >= 3 ? "great" : roas >= 1.5 ? "ok" : "poor";
    return { impressions, clicks, ctr, cpc, conversions, cpa, roas, revenue, profit, rating, tips };
}

export default function SandboxPage() {
    const [form, setForm] = useState({ objective: "SALES", budget: "1000000", audience: "cold", product_price: "500000" });
    const [result, setResult] = useState<SimResult | null>(null);
    const [running, setRunning] = useState(false);

    const run = () => {
        setRunning(true);
        setTimeout(() => {
            const res = simulate(form.objective, parseFloat(form.budget) || 1000000, form.audience, parseFloat(form.product_price) || 500000);
            setResult(res);
            setRunning(false);
        }, 1200);
    };

    const ratingConfig = {
        great: { label: "🎉 Chiến dịch có tiềm năng tốt!", color: "border-emerald-500/40 bg-emerald-500/10", text: "text-emerald-300" },
        ok: { label: "⚠️ Được nhưng cần cải thiện thêm", color: "border-yellow-500/40 bg-yellow-500/10", text: "text-yellow-300" },
        poor: { label: "❌ Cấu hình này có thể bị lỗ tiền!", color: "border-red-500/40 bg-red-500/10", text: "text-red-300" },
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-xl">🎮</div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Phòng Tập Chạy Ads</h1>
                    <p className="text-muted-foreground text-sm">Thực hành với 25,000,000đ tiền ảo — không tốn 1 đồng thật nào!</p>
                </div>
            </div>

            <div className="glass-card rounded-xl p-4 border border-blue-500/20 bg-blue-500/5">
                <p className="text-xs text-blue-300 font-semibold mb-1">💡 Phòng tập hoạt động như thế nào?</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Bạn thiết lập chiến dịch giống như thật, rồi bấm "Chạy Thử". Hệ thống sẽ <strong className="text-white">mô phỏng kết quả</strong> dựa trên số liệu trung bình của ngành quảng cáo Facebook. Bạn sẽ học được cách điều chỉnh trước khi bỏ tiền thật!
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Config form */}
                <div className="glass-card rounded-xl p-6 space-y-4 border border-white/5">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-brand-400" /> Thiết lập chiến dịch thử
                    </h3>

                    <div>
                        <label className="text-xs text-muted-foreground block mb-1.5">Mục tiêu chiến dịch</label>
                        <select value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })}
                            className="w-full bg-[#0a0d1a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50">
                            {Object.entries(OBJECTIVE_LABELS).map(([k, v]) => (
                                <option key={k} value={k} className="bg-gray-900">{v}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-muted-foreground block mb-1.5">Ngân sách mỗi ngày (VNĐ)</label>
                        <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                            placeholder="1000000" />
                        {parseFloat(form.budget) > 2500000 && (
                            <p className="text-xs text-yellow-400 mt-1">⚠️ Người mới nên bắt đầu với 100,000đ – 500,000đ/ngày để kiểm tra trước nhé!</p>
                        )}
                    </div>

                    <div>
                        <label className="text-xs text-muted-foreground block mb-1.5">Giá sản phẩm / dịch vụ (VNĐ)</label>
                        <input type="number" value={form.product_price} onChange={e => setForm({ ...form, product_price: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                            placeholder="500000" />
                    </div>

                    <div>
                        <label className="text-xs text-muted-foreground block mb-2">Loại đối tượng khán giả</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: "cold", label: "Khán giả lạnh", desc: "Người chưa biết bạn", emoji: "🥶" },
                                { id: "lookalike", label: "Tương tự (Lookalike)", desc: "Giống khách cũ của bạn", emoji: "🔍" },
                                { id: "warm", label: "Khán giả nóng", desc: "Đã từng vào web / like", emoji: "🔥" },
                            ].map(o => (
                                <button key={o.id} onClick={() => setForm({ ...form, audience: o.id })}
                                    className={`p-3 rounded-xl border text-left transition-all ${form.audience === o.id ? "border-brand-500/50 bg-brand-500/10" : "border-white/5 hover:border-white/20"}`}>
                                    <div className="text-lg mb-1">{o.emoji}</div>
                                    <p className="text-xs font-medium text-white">{o.label}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{o.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={run} disabled={running}
                        className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                        {running ? (
                            <><span className="animate-spin">⚙️</span> Đang mô phỏng...</>
                        ) : (
                            <><Play className="w-4 h-4" /> Chạy Thử Ngay!</>
                        )}
                    </button>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    {!result && (
                        <div className="glass-card rounded-xl p-12 border border-dashed border-white/10 text-center">
                            <div className="text-5xl mb-3">🎯</div>
                            <p className="text-muted-foreground text-sm">Thiết lập chiến dịch và bấm "Chạy Thử" để xem kết quả mô phỏng</p>
                        </div>
                    )}

                    {result && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            {/* Rating */}
                            <div className={`glass-card rounded-xl p-4 border ${ratingConfig[result.rating].color}`}>
                                <p className={`font-semibold text-sm ${ratingConfig[result.rating].text}`}>{ratingConfig[result.rating].label}</p>
                                <p className="text-xs text-muted-foreground mt-1">Kết quả ước tính cho chiến dịch {Number(form.budget).toLocaleString()}đ/ngày</p>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Người nhìn thấy", value: result.impressions.toLocaleString(), icon: Eye, desc: "Lượt hiển thị" },
                                    { label: "Người bấm vào", value: result.clicks.toLocaleString(), icon: Users, desc: `CTR: ${result.ctr}%` },
                                    { label: "Doanh thu ước tính", value: `${result.revenue.toLocaleString()}đ`, icon: TrendingUp, desc: `ROAS: ${result.roas}x` },
                                    { label: "Lãi/Lỗ ước tính", value: `${result.profit >= 0 ? "+" : ""}${result.profit.toLocaleString()}đ`, icon: DollarSign, desc: `${result.conversions} đơn hàng` },
                                ].map(m => (
                                    <div key={m.label} className="glass-card rounded-xl p-4 border border-white/5">
                                        <m.icon className="w-4 h-4 text-brand-400 mb-2" />
                                        <p className={`text-xl font-bold ${m.label.includes("Lãi") && result.profit < 0 ? "text-red-400" : "text-white"}`}>{m.value}</p>
                                        <p className="text-xs font-medium text-white mt-0.5">{m.label}</p>
                                        <p className="text-[11px] text-muted-foreground">{m.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* AI Tips */}
                            <div className="glass-card rounded-xl p-4 border border-brand-500/20">
                                <p className="text-xs font-semibold text-brand-300 mb-3 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Gợi ý cải thiện từ AI:
                                </p>
                                <div className="space-y-2">
                                    {result.tips.map((tip, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                            <span className="flex-shrink-0 mt-0.5">→</span>
                                            <p className="leading-relaxed">{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={() => setResult(null)}
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-white transition-colors">
                                <RotateCcw className="w-4 h-4" /> Thử lại với cấu hình khác
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
