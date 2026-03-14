"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

const steps = [
    { id: "created_campaign", label: "Tạo chiến dịch đầu tiên", desc: "Vào mục Chiến Dịch và bấm 'Tạo mới'", emoji: "🚀" },
    { id: "learned_metrics", label: "Hiểu những con số cơ bản", desc: "Xem trang Thống Kê và bấm vào các chỉ số để đọc giải thích", emoji: "📊" },
    { id: "created_ad", label: "Tạo nội dung quảng cáo với AI", desc: "Vào AI Tạo Quảng Cáo và thử tạo bài đầu tiên", emoji: "✍️" },
    { id: "watched_course", label: "Xem 1 video Khóa Học", desc: "Vào mục Khóa Học và học 1 bài cơ bản", emoji: "🎓" },
    { id: "tried_sandbox", label: "Thử Chạy Ads (tiền ảo)", desc: "Vào Phòng Tập để thực hành miễn phí, không tốn tiền thật", emoji: "🎮" },
];

export default function OnboardingChecklist() {
    const [open, setOpen] = useState(false);
    const [done, setDone] = useState<Record<string, boolean>>({});
    const [celebrate, setCelebrate] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("onboarding_checklist");
        if (saved) setDone(JSON.parse(saved));
    }, []);

    const toggle = (id: string) => {
        const next = { ...done, [id]: !done[id] };
        setDone(next);
        localStorage.setItem("onboarding_checklist", JSON.stringify(next));
        const newCount = Object.values(next).filter(Boolean).length;
        if (newCount > Object.values(done).filter(Boolean).length) {
            setCelebrate(true);
            setTimeout(() => setCelebrate(false), 2000);
        }
    };

    const completed = Object.values(done).filter(Boolean).length;
    const total = steps.length;
    const pct = Math.round((completed / total) * 100);

    return (
        <div className="glass-card rounded-xl overflow-hidden border border-white/5">
            {/* Header */}
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-2xl flex-shrink-0">🗺️</div>
                    <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold text-white truncate">Hành trình Người Mới</p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[200px]">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500"
                                />
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0">{completed}/{total}</span>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
            </button>

            {/* Celebration */}
            <AnimatePresence>
                {celebrate && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mx-4 mb-2 p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-center">
                        <p className="text-xs text-emerald-300 font-semibold">🎉 Tuyệt vời! Bạn vừa hoàn thành 1 bước!</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Steps */}
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                        className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
                            {steps.map((step) => {
                                const isDone = done[step.id];
                                return (
                                    <button key={step.id} onClick={() => toggle(step.id)}
                                        className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${isDone ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-white/5 border border-transparent"}`}>
                                        {isDone
                                            ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            : <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        }
                                        <div>
                                            <p className={`text-xs font-medium ${isDone ? "text-emerald-300 line-through" : "text-white"}`}>
                                                {step.emoji} {step.label}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">{step.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                            {completed === total && (
                                <div className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/20 text-center">
                                    <p className="text-xs text-brand-300 font-semibold">🏆 Bạn đã hoàn thành Hành Trình Người Mới! Giờ bạn đã sẵn sàng để chạy Ads thật rồi!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
