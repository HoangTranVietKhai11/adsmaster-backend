"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Play, Pause, Trash2, ChevronRight, DollarSign, Loader2, Target, Layers, AlertCircle, CheckCircle2, PauseCircle, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

interface Campaign {
    id: string;
    name: string;
    objective: string;
    budget: number;
    status: string;
    adSets: any[];
    _count?: { adSets: number };
    createdAt: string;
}

const objectiveLabels: Record<string, { label: string; emoji: string; desc: string }> = {
    AWARENESS: { label: "Tăng độ nhận biết", emoji: "👁️", desc: "Cho nhiều người biết đến bạn" },
    TRAFFIC: { label: "Kéo người vào web", emoji: "🚦", desc: "Dẫn khách đến trang bán hàng" },
    ENGAGEMENT: { label: "Tăng tương tác", emoji: "❤️", desc: "Like, comment, share nhiều hơn" },
    LEADS: { label: "Thu thập khách hàng", emoji: "📋", desc: "Lấy thông tin liên hệ của khách" },
    SALES: { label: "Bán hàng trực tiếp", emoji: "🛒", desc: "Chốt đơn ngay từ quảng cáo" },
    APP_PROMOTION: { label: "Quảng bá ứng dụng", emoji: "📱", desc: "Thúc đẩy tải app" },
};

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; icon: any; cls: string }> = {
        ACTIVE: { label: "Đang chạy", icon: CheckCircle2, cls: "text-emerald-400 bg-emerald-400/10" },
        PAUSED: { label: "Đang tạm dừng", icon: PauseCircle, cls: "text-yellow-400 bg-yellow-400/10" },
        DRAFT: { label: "Bản nháp (chưa chạy)", icon: FileText, cls: "text-gray-400 bg-gray-400/10" },
        ARCHIVED: { label: "Đã lưu trữ", icon: AlertCircle, cls: "text-red-400 bg-red-400/10" },
    };
    const s = map[status] || map["DRAFT"];
    return (
        <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${s.cls}`}>
            <s.icon className="w-3 h-3" />
            {s.label}
        </span>
    );
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: "", objective: "TRAFFIC", budget: "", dailyBudget: "", biddingStrategy: "MAX_CONVERSIONS", targetCpa: "", targetRoas: "" });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { fetchCampaigns(); }, []);

    async function fetchCampaigns() {
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_BASE_URL}/api/campaigns`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setCampaigns(data.data);
        } catch (err) { } finally { setLoading(false); }
    }

    async function createCampaign() {
        setCreating(true); setError(null);
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_BASE_URL}/api/campaigns`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    name: form.name, objective: form.objective,
                    budget: parseFloat(form.budget),
                    dailyBudget: form.dailyBudget ? parseFloat(form.dailyBudget) : undefined,
                    biddingStrategy: form.biddingStrategy,
                    targetCpa: form.targetCpa ? parseFloat(form.targetCpa) : undefined,
                    targetRoas: form.targetRoas ? parseFloat(form.targetRoas) : undefined,
                    status: "DRAFT"
                }),
            });
            const data = await res.json();
            if (data.success) {
                setCampaigns([data.data, ...campaigns]);
                setShowCreate(false);
                setForm({ name: "", objective: "TRAFFIC", budget: "", dailyBudget: "", biddingStrategy: "MAX_CONVERSIONS", targetCpa: "", targetRoas: "" });
            } else {
                setError(data.message || "Không thể tạo chiến dịch. Vui lòng kiểm tra lại.");
            }
        } catch { setError("Lỗi kết nối. Vui lòng thử lại."); }
        finally { setCreating(false); }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">📋 Chiến dịch quảng cáo</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Tất cả các chiến dịch quảng cáo Facebook của bạn — bật/tắt tùy thích</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Tạo chiến dịch mới
                </button>
            </div>

            {/* Help box */}
            <div className="glass-card rounded-xl p-4 border border-blue-500/20 bg-blue-500/5">
                <p className="text-xs text-blue-300 font-medium mb-1">💡 Chiến dịch là gì?</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Chiến dịch là một "kế hoạch quảng cáo" bạn đặt ra. Mỗi chiến dịch có mục tiêu riêng (ví dụ: bán hàng, kéo khách vào website...) và có một khoản ngân sách nhất định. Bạn có thể <strong className="text-white">bật/tắt</strong> chiến dịch bất cứ lúc nào mà không mất tiền.
                </p>
            </div>

            {/* Create modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setShowCreate(false)}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="glass-card rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-1">✨ Tạo chiến dịch mới</h3>
                        <p className="text-xs text-muted-foreground mb-5">Điền tên và ngân sách, AI sẽ giúp bạn tối ưu phần còn lại!</p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1.5">Tên chiến dịch (đặt tên nào bạn dễ nhớ)</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="VD: Khuyến mãi hè 2024, Ra mắt sản phẩm mới..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1.5">Mục tiêu của chiến dịch này là gì?</label>
                                <select value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })}
                                    className="w-full bg-[#0a0d1a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all">
                                    {Object.entries(objectiveLabels).map(([key, val]) => (
                                        <option key={key} value={key} className="bg-gray-900">
                                            {val.emoji} {val.label} — {val.desc}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Bidding Strategy Selection */}
                            <div className="space-y-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                <div>
                                    <label className="text-sm font-semibold text-blue-300 flex items-center gap-2 mb-1.5">
                                        <Target className="w-4 h-4" /> Chiến Lược Đặt Giá Thầu (Quản lý giá)
                                    </label>
                                    <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                                        Quyết định cách AI của nền tảng chi tiêu tiền của bạn. Nếu mới học, nên chọn "Tối đa hóa chuyển đổi".
                                    </p>
                                    <select value={form.biddingStrategy} onChange={(e) => setForm({ ...form, biddingStrategy: e.target.value })}
                                        className="w-full bg-[#0a0d1a] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                                        <option value="MAX_CONVERSIONS" className="bg-gray-900">⭐ Tối Đa Hóa Chuyển Đổi (Khuyên Dùng)</option>
                                        <option value="TARGET_CPA" className="bg-gray-900">🎯 CPA Mục Tiêu (Kiểm Soát Chi Phí/Đơn)</option>
                                        <option value="TARGET_ROAS" className="bg-gray-900">💵 ROAS Mục Tiêu (Thu Hồi Vốn)</option>
                                    </select>
                                </div>

                                {/* Conditional Inputs for Bidding */}
                                {form.biddingStrategy === "TARGET_CPA" && (
                                    <div className="animate-in fade-in zoom-in duration-300">
                                        <label className="text-sm text-muted-foreground block mb-1.5">Mức CPA Mục Tiêu (VNĐ/Đơn hàng)</label>
                                        <input type="number" value={form.targetCpa} onChange={(e) => setForm({ ...form, targetCpa: e.target.value })}
                                            placeholder="VD: 50000"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                                        <p className="text-[11px] text-muted-foreground mt-1">Hệ thống sẽ cố gắng tìm khách hàng với chi phí trung bình bằng hoặc thấp hơn mức này.</p>
                                    </div>
                                )}
                                {form.biddingStrategy === "TARGET_ROAS" && (
                                    <div className="animate-in fade-in zoom-in duration-300">
                                        <label className="text-sm text-muted-foreground block mb-1.5">Mức ROAS Mục Tiêu (%)</label>
                                        <input type="number" value={form.targetRoas} onChange={(e) => setForm({ ...form, targetRoas: e.target.value })}
                                            placeholder="VD: 300 (Tức 300%)"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                                        <p className="text-[11px] text-muted-foreground mt-1">Hệ thống sẽ hướng tới việc tạo ra 300đ doanh thu cho mỗi 100đ chi phí quảng cáo.</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1.5">Tổng ngân sách (VNĐ)</label>
                                    <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
                                        placeholder="500000"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1.5">Tiêu tối đa mỗi ngày (VNĐ)</label>
                                    <input type="number" value={form.dailyBudget} onChange={(e) => setForm({ ...form, dailyBudget: e.target.value })}
                                        placeholder="100000"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                                </div>
                            </div>
                            
                            {/* Feature 1: Budget Guard */}
                            {(Number(form.dailyBudget) > 2500000 || Number(form.budget) > 2500000) && (
                                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3 items-start animate-in slide-in-from-top-2">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <p>
                                        Bạn đang đặt ngân sách khá cao. Người mới học nên bắt đầu chạy thử với <strong>100,000đ - 500,000đ / ngày</strong> để kiểm tra độ hiệu quả trước khi tăng tiền, tránh mất tiền oan nhé!
                                    </p>
                                </div>
                            )}
                            {error && (
                                <div className="p-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-white transition-colors">Hủy</button>
                            <button onClick={createCampaign} disabled={creating || !form.name || !form.budget}
                                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {creating ? "Đang tạo..." : "Tạo ngay!"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
            ) : campaigns.length === 0 ? (
                <div className="glass-card rounded-2xl p-16 text-center">
                    <div className="text-5xl mb-4">🚀</div>
                    <h3 className="text-white font-semibold text-lg">Chưa có chiến dịch nào</h3>
                    <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
                        Bắt đầu bằng cách tạo chiến dịch đầu tiên của bạn. Chỉ mất 1 phút thôi!
                    </p>
                    <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 text-sm inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Tạo chiến dịch đầu tiên
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {campaigns.map((c, i) => {
                        const obj = objectiveLabels[c.objective];
                        return (
                            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="glass-card rounded-xl p-5 hover:border-brand-500/30 border border-white/5 transition-all group">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full min-w-0">
                                    <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                                        {/* Emoji/icon */}
                                        <div className="w-12 h-12 flex-shrink-0 rounded-xl gradient-brand flex items-center justify-center text-xl">
                                            {obj?.emoji || "📢"}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1 truncate">
                                                <h3 className="font-semibold text-white truncate max-w-[120px] sm:max-w-xs">{c.name}</h3>
                                                <StatusBadge status={c.status} />
                                            </div>
                                            <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                                                🎯 {obj?.label || c.objective} &nbsp;·&nbsp; 📁 {c._count?.adSets || 0} nhóm QC
                                            </p>
                                        </div>
                                    </div>
                                    {/* Budget + actions */}
                                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto sm:ml-auto gap-4 flex-shrink-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 mt-1 sm:mt-0">
                                        <div className="text-left sm:text-right">
                                            <p className="text-[15px] sm:text-base font-bold text-white">{c.budget.toLocaleString()}đ</p>
                                            <p className="text-[10px] sm:text-xs text-muted-foreground">NGÂN SÁCH</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                                    </div>
                                </div>

                                {/* Tips based on status */}
                                {c.status === "DRAFT" && (
                                    <div className="mt-3 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300">
                                        ⚠️ Chiến dịch này chưa được bật lên Facebook. Ghé vào để kiểm tra và kích hoạt nhé!
                                    </div>
                                )}
                                {c.status === "ACTIVE" && (
                                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                                        ✅ Chiến dịch đang chạy bình thường và tiêu tiền theo ngân sách bạn đặt.
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
