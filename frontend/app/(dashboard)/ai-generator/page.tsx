"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Copy, CheckCheck, ChevronDown, ChevronUp, Target, Megaphone, MessageSquare, Lightbulb, TrendingUp } from "lucide-react";
import AdTemplateSelector from "@/components/AdTemplateSelector";
import { API_BASE_URL } from "@/lib/api";

const tones = ["professional", "casual", "urgent", "inspirational", "humorous"];
const adTypes = ["image", "video", "carousel", "story"];

interface AdResult {
    headline: string;
    primaryText: string;
    description: string;
    callToAction: string;
    creativeIdea: string;
    targetingTip: string;
    predictedCtr: string;
    imagePrompt?: string;
    videoScript?: {
        hook: string;
        body: string;
        cta: string;
    };
    adVariants: { headline: string; primaryText: string }[];
}

export default function AIGeneratorPage() {
    const [form, setForm] = useState({ productName: "", targetAudience: "", productBenefits: "", budget: "", tone: "professional", adType: "image" });
    const [result, setResult] = useState<AdResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState("");

    async function generate() {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_BASE_URL}/api/ai/generate-ad`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...form, budget: form.budget ? Number(form.budget) : undefined }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Generation failed");
            setResult(data.data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    function copyText(text: string, key: string) {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(""), 2000);
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-brand-500" />
                    AI Tạo Quảng Cáo
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Tạo nội dung quảng cáo Facebook chuyển đổi cao trong vài giây với GPT-4</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input form */}
                <div className="glass-card rounded-2xl p-6 space-y-5">
                    <h3 className="font-semibold text-white">Chi Tiết Chiến Dịch</h3>

                    <div className="space-y-1">
                        <label className="text-sm text-muted-foreground flex items-center gap-1"><Megaphone className="w-3.5 h-3.5" /> Tên Sản Phẩm</label>
                        <input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })}
                            placeholder="VD: Bộ Dưỡng Da ProGlow"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-muted-foreground flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Đối Tượng Mục Tiêu</label>
                        <input value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                            placeholder="VD: Phụ nữ 25-45, quan tâm đến làm đẹp"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-muted-foreground flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5" /> Điểm Nổi Bật</label>
                        <textarea value={form.productBenefits} onChange={(e) => setForm({ ...form, productBenefits: e.target.value })}
                            placeholder="VD: Thành phần tự nhiên, hiệu quả rõ rệt sau 7 ngày, đã kiểm nghiệm da liễu"
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Giọng Điệu</label>
                            <select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all appearance-none">
                                {tones.map((t) => <option key={t} value={t} className="bg-gray-900">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Loại Quảng Cáo</label>
                            <select value={form.adType} onChange={(e) => setForm({ ...form, adType: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all appearance-none">
                                {adTypes.map((t) => <option key={t} value={t} className="bg-gray-900">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-muted-foreground">Ngân Sách Ngày (VNĐ, Tùy chọn)</label>
                        <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
                            placeholder="VD: 100000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                    </div>

                    {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

                    <button onClick={generate} disabled={loading || !form.productName || !form.targetAudience || !form.productBenefits}
                        className="btn-primary w-full flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {loading ? "Đang tạo với GPT-4..." : "Taọ Mẫu Quảng Cáo"}
                    </button>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    <AnimatePresence mode="wait">
                        {!result && !loading && (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                                <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mb-4 animate-glow">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-white font-semibold text-lg">Quảng Cáo Sinh Bởi AI</h3>
                                <p className="text-muted-foreground text-sm mt-2">Điền thông tin và nhấn Tạo để có mẫu quảng cáo Facebook tuyệt vời</p>
                            </motion.div>
                        )}
                        {loading && (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-10 flex flex-col items-center justify-center min-h-[300px]">
                                <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                                <p className="text-white font-medium">Đang tạo nội dung quảng cáo...</p>
                                <p className="text-muted-foreground text-sm mt-1">GPT-4 đang biên soạn thông điệp hoàn hảo</p>
                            </motion.div>
                        )}
                        {result && !loading && (
                            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                {/* Main output */}
                                <div className="glass-card rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-white">Nội Dung Hoàn Chỉnh</h3>
                                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                            Dự đoán CTR: {result.predictedCtr}
                                        </span>
                                    </div>

                                    {[
                                        { label: "Tiêu Đề (Headline)", value: result.headline, key: "headline" },
                                        { label: "Nội Dung Chính (Primary Text)", value: result.primaryText, key: "primary" },
                                        { label: "Mô Tả Bổ Sung (Description)", value: result.description, key: "desc" },
                                        { label: "Nút Kêu Gọi (Call to Action)", value: result.callToAction, key: "cta" },
                                    ].map(({ label, value, key }) => (
                                        <div key={key} className="bg-white/5 rounded-xl p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
                                                <button onClick={() => copyText(value, key)} className="text-muted-foreground hover:text-white transition-colors">
                                                    {copied === key ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <p className="text-white text-sm">{value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Creative idea + targeting tip */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="glass-card rounded-xl p-4 border border-white/5">
                                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Lightbulb className="w-3 h-3 text-yellow-400" /> Ý Tưởng Hình Ảnh/Video</p>
                                        <p className="text-sm text-white leading-relaxed">{result.creativeIdea}</p>
                                    </div>
                                    <div className="glass-card rounded-xl p-4 border border-white/5">
                                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Target className="w-3 h-3 text-blue-400" /> Mẹo Nhắm Mục Tiêu</p>
                                        <p className="text-sm text-white leading-relaxed">{result.targetingTip}</p>
                                    </div>
                                </div>

                                {/* 2025 Trends: Video Script & Image Prompt */}
                                <div className="grid grid-cols-1 gap-4">
                                    {result.videoScript && (
                                        <div className="glass-card rounded-xl p-4 border border-purple-500/20 bg-purple-500/5">
                                            <p className="text-xs text-purple-300 font-semibold mb-3 flex items-center gap-1">
                                                🎬 KỊCH BẢN VIDEO NGẮN (REELS/TIKTOK - 15S)
                                            </p>
                                            <div className="space-y-3">
                                                <div className="pl-3 border-l-2 border-purple-500/30">
                                                    <p className="text-[10px] uppercase text-purple-400 font-bold mb-0.5">Mở đầu (0-3s)</p>
                                                    <p className="text-sm text-white italic">"{result.videoScript.hook}"</p>
                                                </div>
                                                <div className="pl-3 border-l-2 border-purple-500/30">
                                                    <p className="text-[10px] uppercase text-purple-400 font-bold mb-0.5">Nội dung (3-12s)</p>
                                                    <p className="text-sm text-white leading-relaxed">{result.videoScript.body}</p>
                                                </div>
                                                <div className="pl-3 border-l-2 border-purple-500/30">
                                                    <p className="text-[10px] uppercase text-purple-400 font-bold mb-0.5">Kêu gọi (12-15s)</p>
                                                    <p className="text-sm text-white">"{result.videoScript.cta}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {result.imagePrompt && (
                                        <div className="glass-card rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                                                    🎨 CÂU LỆNH VẼ HÌNH AI (MIDJOURNEY/CANVA)
                                                </p>
                                                <button onClick={() => copyText(result.imagePrompt!, "img_prompt")} className="text-emerald-400 hover:text-white transition-colors">
                                                    {copied === "img_prompt" ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <p className="text-sm text-white/80 italic leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                                                {result.imagePrompt}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Variants */}
                                {result.adVariants && (
                                    <div className="glass-card rounded-xl p-4">
                                        <h4 className="text-sm font-medium text-white mb-3">Các Biến Thể Của Quảng Cáo (dùng cho A/B testing)</h4>
                                        <div className="space-y-3">
                                            {result.adVariants.map((v, i) => (
                                                <div key={i} className="bg-white/5 rounded-lg p-3 border-l-2 border-brand-500">
                                                    <p className="text-sm font-medium text-white">{v.headline}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{v.primaryText}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Feature 2: Mad Libs Ads Templates (for beginners) */}
            <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <span>📝</span> Dành Cho Người Mới: Điền Vào Chỗ Trống
                </h2>
                <p className="text-sm text-muted-foreground mb-4">Không biết viết quảng cáo? Chọn 1 trong 4 mẫu câu chuyên nghiệp bên dưới, điền thông tin sản phẩm của bạn, bấm nút là xong!</p>
                <AdTemplateSelector />
            </div>
        </div>
    );
}
