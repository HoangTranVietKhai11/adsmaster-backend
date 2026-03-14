"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Copy, CheckCheck } from "lucide-react";

const templates = [
    {
        id: "pain_solution",
        name: "Nỗi Đau → Giải Pháp",
        emoji: "💊",
        desc: "Kinh điển nhất, hiệu quả nhất cho hàng tiêu dùng",
        fields: [
            { key: "pain", label: "Nỗi đau của khách hàng", placeholder: "đau lưng mãi không khỏi", example: "đau lưng mãi không khỏi" },
            { key: "product", label: "Tên sản phẩm / dịch vụ", placeholder: "Đai lưng trị liệu ProBand", example: "Đai lưng trị liệu ProBand" },
            { key: "benefit", label: "Lợi ích chính", placeholder: "giảm đau ngay trong 5 phút", example: "giảm đau ngay trong 5 phút" },
            { key: "days", label: "Thời gian thấy kết quả", placeholder: "7 ngày", example: "7 ngày" },
        ],
        generate: (f: Record<string, string>) =>
            `😩 Bạn đang bị ${f.pain || "..."}?\n\n✅ ${f.product || "Sản phẩm của bạn"} giúp bạn ${f.benefit || "..."} chỉ trong ${f.days || "..."} — ngay từ lần dùng đầu tiên!\n\n🔥 Hàng ngàn người đã hết khổ sở rồi. Bạn thì sao?\n👇 Bấm ĐẶT HÀNG NGAY để nhận ưu đãi hôm nay!`,
    },
    {
        id: "social_proof",
        name: "Bằng Chứng Xã Hội",
        emoji: "⭐",
        desc: "Dùng thực tế khách hàng cũ để thuyết phục người mới",
        fields: [
            { key: "name", label: "Tên khách hàng (hoặc nhân vật)", placeholder: "Chị Hương, 38 tuổi", example: "Chị Hương, 38 tuổi" },
            { key: "result", label: "Kết quả họ đạt được", placeholder: "giảm 8kg sau 2 tháng", example: "giảm 8kg sau 2 tháng" },
            { key: "product", label: "Tên sản phẩm", placeholder: "Trà giảm cân SlimTea", example: "Trà giảm cân SlimTea" },
        ],
        generate: (f: Record<string, string>) =>
            `💬 "${f.name || "Khách hàng"} chia sẻ: Tôi không tin lắm lúc đầu, nhưng sau khi dùng ${f.product || "sản phẩm"}, tôi đã ${f.result || "..."}. Không nghĩ lại được kết quả như vậy!"\n\n✨ Hàng ngàn người như ${f.name?.split(",")[0] || "bạn"} đã thay đổi nhờ ${f.product || "sản phẩm"} của chúng tôi.\n\n👇 Thử ngay — Miễn phí vận chuyển hôm nay!`,
    },
    {
        id: "urgency",
        name: "Tạo Cấp Bách (Flash Sale)",
        emoji: "⚡",
        desc: "Thúc đẩy mua ngay hôm nay với giảm giá có hạn",
        fields: [
            { key: "discount", label: "Mức giảm giá", placeholder: "50%", example: "50%" },
            { key: "product", label: "Tên sản phẩm", placeholder: "Khóa học Facebook Ads", example: "Khóa học Facebook Ads" },
            { key: "deadline", label: "Thời hạn", placeholder: "hết đêm nay", example: "hết đêm nay" },
            { key: "slots", label: "Số lượng còn lại (nếu có)", placeholder: "5 suất cuối", example: "5 suất cuối" },
        ],
        generate: (f: Record<string, string>) =>
            `🚨 FLASH SALE – Giảm ${f.discount || "..."} | Chỉ còn ${f.slots || "vài suất"} cuối!\n\n📦 ${f.product || "Sản phẩm"} — ${f.deadline || "Ưu đãi chỉ HÔM NAY"}.\n\nSau khi hết, giá sẽ trở về bình thường ngay. Đừng để tiếc nuối!\n\n👉 BẤM VÀO ĐÂY để mua ngay với giá ưu đãi!`,
    },
    {
        id: "curiosity",
        name: "Câu Hỏi Gây Tò Mò",
        emoji: "🤔",
        desc: "Kéo khách bấm vào bằng sự tò mò, sau đó chốt sale",
        fields: [
            { key: "question", label: "Câu hỏi gây tò mò", placeholder: "Tại sao người thành công ít khi làm việc nhiều?", example: "Tại sao người thành công ít khi làm việc nhiều?" },
            { key: "answer_hint", label: "Gợi ý câu trả lời (không tiết lộ hết)", placeholder: "Bí quyết nằm ở cách quản lý thời gian", example: "Bí quyết nằm ở cách quản lý thời gian" },
            { key: "product", label: "Giải pháp (sản phẩm/dịch vụ)", placeholder: "Khóa học Quản Lý Thời Gian 7Zero", example: "Khóa học Quản Lý Thời Gian 7Zero" },
        ],
        generate: (f: Record<string, string>) =>
            `🤔 ${f.question || "???"}\n\n${f.answer_hint || "Bí quyết đó là..."}\n\n💡 Chúng tôi đã đúc kết điều này trong ${f.product || "sản phẩm của chúng tôi"} — giúp hàng nghìn người thay đổi cuộc sống.\n\n👇 Tìm hiểu ngay — hoàn toàn miễn phí!`,
    },
];

export default function AdTemplateSelector() {
    const [selected, setSelected] = useState<string | null>(null);
    const [fields, setFields] = useState<Record<string, string>>({});
    const [output, setOutput] = useState("");
    const [copied, setCopied] = useState(false);

    const activeTemplate = templates.find(t => t.id === selected);

    const generate = () => {
        if (!activeTemplate) return;
        setOutput(activeTemplate.generate(fields));
    };

    const copy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-4">
            <div className="border border-blue-500/20 bg-blue-500/5 rounded-xl p-4">
                <p className="text-xs text-blue-300 font-semibold mb-1">✍️ Mẫu bài quảng cáo cho người mới</p>
                <p className="text-xs text-muted-foreground">Chọn 1 trong 4 khung bài quảng cáo đã được chuyên gia kiểm chứng. Chỉ điền từ vào chỗ trống, AI sẽ viết hoàn chỉnh cho bạn!</p>
            </div>

            {/* Template cards */}
            <div className="grid grid-cols-2 gap-3">
                {templates.map(t => (
                    <button key={t.id} onClick={() => { setSelected(selected === t.id ? null : t.id); setFields({}); setOutput(""); }}
                        className={`p-4 rounded-xl border text-left transition-all ${selected === t.id ? "border-brand-500/50 bg-brand-500/10" : "border-white/5 hover:border-white/20 bg-white/2"}`}>
                        <div className="text-2xl mb-2">{t.emoji}</div>
                        <p className="text-sm font-semibold text-white">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                    </button>
                ))}
            </div>

            {/* Fill-in fields */}
            <AnimatePresence>
                {activeTemplate && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="glass-card rounded-xl p-5 space-y-4 border border-brand-500/20">
                        <h4 className="font-semibold text-white text-sm">📝 Điền thông tin vào đây:</h4>
                        {activeTemplate.fields.map(field => (
                            <div key={field.key}>
                                <label className="text-xs text-muted-foreground block mb-1">{field.label}</label>
                                <input
                                    value={fields[field.key] || ""}
                                    onChange={e => setFields({ ...fields, [field.key]: e.target.value })}
                                    placeholder={`VD: ${field.placeholder}`}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                                />
                            </div>
                        ))}
                        <button onClick={generate}
                            className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                            <Sparkles className="w-4 h-4" /> Tạo bài quảng cáo ngay!
                        </button>

                        {output && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-emerald-300">✅ Bài quảng cáo của bạn:</p>
                                    <button onClick={copy}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors">
                                        {copied ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                        {copied ? "Đã copy!" : "Copy"}
                                    </button>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-sm text-white whitespace-pre-wrap border border-white/5 leading-relaxed">
                                    {output}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-center">💡 Copy đoạn này và dán vào phần "Nội dung quảng cáo" trên Facebook Ads Manager</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
