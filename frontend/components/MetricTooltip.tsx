"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle } from "lucide-react";

interface MetricTooltipProps {
    label: string;
    value: string;
    plain: string;       // plain-language explanation
    tip?: string;        // extra colour-coded tip
    good?: boolean;      // show green/red hint
}

export function MetricTooltip({ label, value, plain, tip, good }: MetricTooltipProps) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-flex items-center gap-1"
            onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            <span className="cursor-help underline decoration-dotted decoration-muted-foreground">{label}</span>
            <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />

            <AnimatePresence>
                {show && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute bottom-full left-0 mb-2 z-50 w-60 glass-card border border-white/10 rounded-xl p-3 pointer-events-none shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-bold text-brand-300">{label}</p>
                            {value && <p className="text-sm font-bold text-white">{value}</p>}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{plain}</p>
                        {tip && (
                            <p className={`text-[11px] mt-2 px-2 py-1 rounded-lg font-medium ${good !== undefined ? (good ? "bg-emerald-500/20 text-emerald-300" : "bg-yellow-500/20 text-yellow-300") : "bg-blue-500/20 text-blue-300"}`}>
                                💡 {tip}
                            </p>
                        )}
                        {/* Arrow */}
                        <div className="absolute -bottom-1.5 left-4 w-3 h-3 rotate-45 bg-[#0a0d1a] border-r border-b border-white/10" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/** Quick tooltip definitions used across the analytics page */
export const METRIC_DEFS = {
    CTR: {
        plain: "Cứ 100 người nhìn thấy quảng cáo, bao nhiêu người bấm vào xem. Ví dụ CTR 2% = 100 người nhìn, 2 người bấm.",
        tip: "Tốt nếu ≥ 1.5%. Dưới 1% thì nên thay hình ảnh mới!"
    },
    CPC: {
        plain: "Mỗi lần 1 khách bấm vào quảng cáo của bạn, bạn tốn bao nhiêu tiền. Càng thấp càng tốt.",
        tip: "Trung bình ngành: 10,000đ – 30,000đ mỗi lượt nhấp."
    },
    CPA: {
        plain: "Bạn tốn bao nhiêu tiền quảng cáo để có được 1 khách mua hàng. Ví dụ CPA 200,000đ = bỏ 200k ads để bán được 1 đơn.",
        tip: "Phải thấp hơn lợi nhuận bạn kiếm được từ 1 đơn hàng!"
    },
    CPM: {
        plain: "Giá để 1000 người nhìn thấy quảng cáo của bạn. Giống như tiền rải tờ rơi – cứ 1000 tờ rơi phát ra thì tốn bấy nhiêu tiền.",
        tip: "CPM thấp = tiếp cận được nhiều người hơn với cùng số tiền."
    },
    ROAS: {
        plain: "Cứ bỏ 1 đồng vào quảng cáo, thu về bao nhiêu đồng doanh thu. ROAS 4x = bỏ 100k tiền ads, thu 400k doanh số.",
        tip: "ROAS > 3x là đang có lãi tốt. Dưới 1x là đang lỗ nặng!"
    },
    FREQUENCY: {
        plain: "Trung bình mỗi người đã xem quảng cáo của bạn bao nhiêu lần rồi. Quá cao → họ chán và bỏ qua.",
        tip: "Frequency > 3.5 là dấu hiệu khán giả đang chán quảng cáo của bạn."
    }
};
