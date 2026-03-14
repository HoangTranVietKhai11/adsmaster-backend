"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Map, Target, Layers, PlayCircle, Lightbulb, ChevronRight, CheckCircle2, Search, BarChart3 } from "lucide-react";
import Link from "next/link";

const FUNDAMENTALS = [
    {
        title: "1. Quảng cáo Facebook (Ads) là gì?",
        desc: "Là cách bạn trả tiền cho Facebook để hiển thị bài viết, sản phẩm của bạn đến đúng những người có khả năng mua hàng nhất, dựa trên sở thích, độ tuổi, và hành vi của họ.",
        icon: Target,
        color: "text-blue-400",
        bg: "bg-blue-500/10"
    },
    {
        title: "2. Tại sao lại mất tiền oan?",
        desc: "Thường do người mới: Để ngân sách quá lớn khi chưa biết hiệu quả, Nội dung quảng cáo không hấp dẫn, hoặc Chọn sai tệp khách hàng. AdsMaster AI sinh ra để giúp bạn tránh những lỗi này.",
        icon: Lightbulb,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10"
    },
    {
        title: "3. Cấu trúc 3 cấp độ (Quan trọng)",
        desc: "Mọi quảng cáo đều chia làm 3 phần: (1) Chiến dịch (Mục tiêu: Bán hàng hay Tăng tương tác?), (2) Nhóm quảng cáo (Nhắm vào ai: Nam 18-24 ở HN?), (3) Bài quảng cáo (Nội dung hiển thị là gì?).",
        icon: Layers,
        color: "text-purple-400",
        bg: "bg-purple-500/10"
    }
];

const WORKFLOW_STEPS = [
    {
        step: 1,
        title: "Tập bơi an toàn",
        name: "Phòng Tập (Sandbox)",
        link: "/sandbox",
        icon: PlayCircle,
        desc: "Không dùng tiền thật! Bạn được cấp $1000 ảo để tập lên chiến dịch. Xem hệ thống AI mô phỏng kết quả Lỗ/Lãi (ROAS) giả lập để hiểu cơ chế hoạt động."
    },
    {
        step: 2,
        title: "Tạo nội dung thu hút",
        name: "AI Tạo Quảng Cáo",
        link: "/ai-generator",
        icon: Search,
        desc: "Không biết viết gì? Vào mục này chọn 'Điền vào chỗ trống' (Mad Libs). AI sẽ viết giúp bạn một bài quảng cáo chuyên nghiệp theo chuẩn Nỗi đau -> Giải pháp."
    },
    {
        step: 3,
        title: "Chạy thật (với số tiền nhỏ)",
        name: "Quản lý Chiến dịch",
        link: "/campaigns",
        icon: Target,
        desc: "Tạo chiến dịch, hệ thống 'Bảo vệ ngân sách' sẽ nhắc nhở nếu bạn đặt tiền quá cao. Bắt đầu với $5/ngày để xem khách có nhắn tin hay không."
    },
    {
        step: 4,
        title: "Đo lường & Tối ưu",
        name: "Xem Thống Kê",
        link: "/analytics",
        icon: BarChart3,
        desc: "Quay lại ngày hôm sau, xem tỷ lệ nhấp (CTR) và chi phí mỗi khách (CPA). Nếu đỏ (xấu) -> Tắt đi. Nếu xanh (tốt) -> Tăng tiền lên đôi chút."
    }
];

export default function GuidePage() {
    const [activeTab, setActiveTab] = useState<"fundamentals" | "workflow">("fundamentals");

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-brand-400" /> Hướng dẫn cho Người Mới (Từ A-Z)
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Đừng lo lắng! Hãy dành 5 phút đọc trang này, bạn sẽ hiểu cách làm chủ sân chơi Facebook Ads.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/5 pb-px">
                <button
                    onClick={() => setActiveTab("fundamentals")}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "fundamentals" ? "border-brand-500 text-white" : "border-transparent text-muted-foreground hover:text-white"}`}
                >
                    1. Kiến Thức Căn Bản
                </button>
                <button
                    onClick={() => setActiveTab("workflow")}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "workflow" ? "border-brand-500 text-white" : "border-transparent text-muted-foreground hover:text-white"}`}
                >
                    2. Lộ Trình Thực Hành Hoàn Hảo
                </button>
            </div>

            {/* Content */}
            <div className="mt-4">
                <AnimatePresence mode="wait">
                    {activeTab === "fundamentals" && (
                        <motion.div key="fun" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {FUNDAMENTALS.map((item, idx) => (
                                    <div key={idx} className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.bg}`}>
                                            <item.icon className={`w-6 h-6 ${item.color}`} />
                                        </div>
                                        <h3 className="text-white font-semibold text-base mb-2">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="glass-card rounded-2xl p-6 border border-brand-500/20 bg-brand-500/5 mt-6 flex gap-4 items-start">
                                <div className="text-2xl">💡</div>
                                <div>
                                    <h3 className="text-white font-semibold mb-1">Mẹo "Sống còn" cho người mới:</h3>
                                    <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                                        <li>Luôn chia nhỏ ngân sách ra trải đều nhiều ngày, không dồn hết tiền vào 1 ngày duy nhất.</li>
                                        <li>Quảng cáo Facebook không phải "Bấm phát là có đơn ngay". Hệ thống cần 2-3 ngày để học thói quen người dùng mua hàng.</li>
                                        <li>Nếu bài quảng cáo không có hình ảnh đẹp, ngắn gọn - đừng đốt tiền chạy Ads!</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "workflow" && (
                        <motion.div key="wf" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="glass-card rounded-2xl p-8 border border-white/5">
                                <h3 className="text-white font-semibold flex items-center gap-2 mb-6">
                                    <Map className="w-5 h-5 text-emerald-400" /> Con Đường Đi Đến Thành Công Cùng AdsMaster
                                </h3>
                                
                                <div className="relative">
                                    {/* Connection Line */}
                                    <div className="absolute top-8 bottom-8 left-6 w-0.5 bg-white/10 hidden md:block" />

                                    <div className="space-y-6">
                                        {WORKFLOW_STEPS.map((step, idx) => (
                                            <div key={idx} className="relative flex flex-col md:flex-row gap-6 md:items-center">
                                                {/* Step Circle */}
                                                <div className="w-12 h-12 rounded-full bg-[#0d1224] border-2 border-brand-500 flex items-center justify-center font-bold text-white z-10 mx-auto md:mx-0 shrink-0">
                                                    {step.step}
                                                </div>
                                                
                                                {/* Card */}
                                                <div className="glass-card rounded-xl p-5 border border-white/5 flex-1 hover:border-white/10 transition-colors group">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <step.icon className="w-5 h-5 text-brand-400" />
                                                            <h4 className="text-white font-semibold text-lg">{step.name}</h4>
                                                            <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-muted-foreground">{step.title}</span>
                                                        </div>
                                                        <Link href={step.link} className="flex items-center justify-center gap-1 text-xs text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-lg font-medium transition-colors w-full sm:w-auto">
                                                            Tới trang này <ChevronRight className="w-3 h-3" />
                                                        </Link>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-10 flex justify-center">
                                    <button onClick={() => setActiveTab("fundamentals")} className="text-sm text-brand-400 flex items-center gap-2 hover:text-brand-300 transition-colors">
                                        <CheckCircle2 className="w-4 h-4" /> Tuyệt vời! Tôi đã hiểu cách làm.
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
