"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Sparkles, ChevronDown } from "lucide-react";

const tips = [
    { q: "Tôi đang lãi hay lỗ?", a: "Đến màn hình Tổng Quan, nhìn vào ô lớn ở trên cùng. Màu xanh là đang có lãi, màu đỏ là đang lỗ. Đơn giản vậy thôi!" },
    { q: "Tôi bật/tắt quảng cáo ở đâu?", a: "Vào mục Chiến Dịch trong menu bên trái. Từng chiến dịch sẽ có nút Bật/Tắt riêng. Bạn có thể tắt bất cứ lúc nào mà không bị mất tiền!" },
    { q: "AI tạo nội dung quảng cáo như thế nào?", a: "Vào mục AI Tạo Quảng Cáo trong menu. Chỉ cần điền tên sản phẩm và mô tả ngắn, AI sẽ viết nội dung hấp dẫn cho bạn trong vòng 10 giây!" },
    { q: "Làm sao tăng doanh thu?", a: "Có 3 cách: 1️⃣ Thay hình ảnh/nội dung quảng cáo mới hơn. 2️⃣ Tăng ngân sách cho chiến dịch đang chạy tốt. 3️⃣ Học thêm mẹo qua mục Khóa Học miễn phí!" },
    { q: "Sao tôi thấy nhiều số quá?", a: "Chỉ cần để ý 2 con số thôi: Tiền Chi Ra và Tiền Thu Về. Nếu Thu Về > Chi Ra là ổn. Còn lại bạn bỏ qua được hết nhé!" },
];

export default function FloatingAssistant() {
    const [open, setOpen] = useState(false);
    const [activeQ, setActiveQ] = useState<number | null>(null);

    return (
        <>
            {/* Floating button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full gradient-brand shadow-xl flex items-center justify-center text-white"
                style={{ boxShadow: "0 0 20px rgba(99,102,241,0.5)" }}
            >
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full text-[10px] font-bold flex items-center justify-center text-black">?</span>
            </motion.button>

            {/* Panel */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-40"
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="fixed bottom-24 right-6 z-50 w-80 max-h-[70vh] overflow-y-auto"
                        >
                            <div className="glass-card rounded-2xl overflow-hidden border border-brand-500/30">
                                {/* Header */}
                                <div className="p-4 gradient-brand flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-white" />
                                        <div>
                                            <p className="text-white font-semibold text-sm">Trợ Lý AdsMaster</p>
                                            <p className="text-white/70 text-xs">Hỏi gì mình trả lời liền!</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Questions */}
                                <div className="p-3 space-y-2">
                                    <p className="text-xs text-muted-foreground px-1 mb-3">Bấm vào câu hỏi bạn muốn biết 👇</p>
                                    {tips.map((tip, i) => (
                                        <div key={i} className="rounded-xl overflow-hidden border border-white/5">
                                            <button
                                                onClick={() => setActiveQ(activeQ === i ? null : i)}
                                                className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-white/5 transition-colors"
                                            >
                                                <span className="text-sm text-white font-medium">{tip.q}</span>
                                                <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${activeQ === i ? "rotate-180" : ""}`} />
                                            </button>
                                            <AnimatePresence>
                                                {activeQ === i && (
                                                    <motion.div
                                                        initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <p className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-white/5 pt-2">
                                                            💬 {tip.a}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
