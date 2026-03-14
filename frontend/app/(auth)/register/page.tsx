"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

const benefits = [
    "10 tín dụng AI miễn phí mỗi tháng",
    "Trình tạo 3 chiến dịch miễn phí",
    "Bảng điều khiển phân tích cơ bản",
    "Hỗ trợ qua cộng đồng",
];

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Đăng ký thất bại");

            localStorage.setItem("accessToken", data.data.accessToken);
            localStorage.setItem("refreshToken", data.data.refreshToken);
            localStorage.setItem("user", JSON.stringify(data.data.user));
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#080b14] relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left panel — benefits */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="hidden lg:block"
                >
                    <div className="space-y-6">
                        <div>
                            <Link href="/" className="inline-flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-2xl font-bold text-white">
                                    Ads<span className="gradient-text">Master</span> AI
                                </span>
                            </Link>
                            <h2 className="mt-6 text-3xl font-bold text-white leading-tight">
                                Bắt đầu mở rộng quy mô<br />
                                <span className="gradient-text">Facebook Ads với AI</span>
                            </h2>
                            <p className="mt-3 text-gray-400">
                                Tham gia cùng hàng nghìn nhà quảng cáo sử dụng AI để tạo, tối ưu hóa và mở rộng các chiến dịch Facebook Ads hiệu quả.
                            </p>
                        </div>
                        <div className="space-y-3">
                            {benefits.map((b) => (
                                <div key={b} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-brand-500 flex-shrink-0" />
                                    <span className="text-gray-300 text-sm">{b}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Right panel — form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="text-center mb-6 lg:hidden">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">AdsMaster AI</span>
                        </Link>
                    </div>

                    <div className="glass-card rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-white mb-1">Tạo tài khoản mới</h3>
                        <p className="text-gray-400 text-sm mb-6">Miễn phí vĩnh viễn. Không cần thẻ tín dụng.</p>

                        {error && (
                            <div className="bg-destructive/15 border border-destructive/30 rounded-lg px-4 py-3 text-sm text-destructive mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-1.5">Họ và Tên</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-1.5">Mật khẩu</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="Tối thiểu 8 ký tự, có chữ hoa và số"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all pr-12"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {loading ? "Đang tạo..." : "Tạo Tài Khoản Điễn Phí"}
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-400 mt-6">
                            Đã có tài khoản?{" "}
                            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Đăng nhập</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
