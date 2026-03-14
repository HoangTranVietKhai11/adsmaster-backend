"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Building2, CreditCard, Loader2 } from "lucide-react";

const plans = [
    {
        name: "Miễn phí",
        icon: Zap,
        price: 0,
        period: "mãi mãi",
        features: ["3 Chiến dịch", "10 AI Credits/tháng", "Phân tích cơ bản", "Hỗ trợ cộng đồng"],
        cta: "Gói hiện tại",
        disabled: true,
    },
    {
        name: "Pro",
        icon: Crown,
        price: 19,
        period: "tháng",
        popular: true,
        features: ["20 Chiến dịch", "100 AI Credits/tháng", "Phân tích nâng cao", "Gợi ý từ AI", "Chương trình cộng tác", "Ưu tiên hỗ trợ"],
        cta: "Nâng cấp lên Pro",
    },
    {
        name: "Agency",
        icon: Building2,
        price: 49,
        period: "tháng",
        features: ["Không giới hạn chiến dịch", "500 AI Credits/tháng", "Dashboard nhãn trắng", "Quản lý khách hàng", "Truy cập API", "Hỗ trợ riêng"],
        cta: "Nâng cấp lên Agency",
    },
];

export default function BillingPage() {
    const [loading, setLoading] = useState<string | null>(null);

    async function handleUpgrade(planName: string) {
        setLoading(planName);
        // In production: call /api/payments/subscribe to get Stripe checkout session
        setTimeout(() => {
            alert(`Stripe checkout for ${planName} plan would open here with your configured price ID.`);
            setLoading(null);
        }, 1000);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Thanh toán & Gói dịch vụ</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Chọn gói phù hợp để mở rộng quy mô kinh doanh của bạn</p>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, i) => (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`relative glass-card rounded-2xl p-6 flex flex-col ${plan.popular ? "border-brand-500/50 shadow-brand-500/20 shadow-xl" : ""}`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="gradient-brand text-white text-xs font-bold px-4 py-1 rounded-full">Phổ biến nhất</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.popular ? "gradient-brand" : "bg-white/5"}`}>
                                <plan.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-white">${plan.price}</span>
                                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                                </div>
                            </div>
                        </div>
                        <ul className="space-y-2.5 flex-1 mb-6">
                            {plan.features.map((f) => (
                                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                                    <Check className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => !plan.disabled && handleUpgrade(plan.name)}
                            disabled={!!plan.disabled || loading === plan.name}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${plan.popular ? "btn-primary" : plan.disabled ? "bg-white/5 text-muted-foreground cursor-default" : "border border-white/10 text-white hover:bg-white/5"}`}
                        >
                            {loading === plan.name ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                            {plan.disabled ? "Gói hiện tại" : loading === plan.name ? "Đang chuyển hướng..." : plan.cta}
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Billing info */}
            <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-brand-500" /> Lịch sử thanh toán</h3>
                <div className="text-center py-8 text-muted-foreground text-sm">
                    <p>Chưa có giao dịch nào. Nâng cấp để xem lịch sử thanh toán tại đây.</p>
                </div>
            </div>
        </div>
    );
}
