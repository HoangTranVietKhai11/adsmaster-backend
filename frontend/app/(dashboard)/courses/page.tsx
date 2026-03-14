"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, Users, Play, Star, Video } from "lucide-react";

export default function CoursesPage() {
    const courses = [
        {
            id: "1",
            title: "Tự học Facebook Ads cơ bản đến nâng cao 2024",
            description: "Hướng dẫn chi tiết toàn bộ quy trình chạy quảng cáo Facebook mới nhất dành cho người mới bắt đầu đến nâng cao.",
            duration: "1 giờ 45 phút",
            modules: 12,
            students: "15.4K",
            rating: 4.9,
            link: "https://www.youtube.com/watch?v=Fccw3J0hEyk", // Chuẩn - Toàn tập FB Ads 2024
            isFree: true
        },
        {
            id: "2",
            title: "Facebook Ads Tutorial 2024 (Kiến thức Global - Ben Heath)",
            description: "Các khóa học chuyên sâu từ chuyên gia quốc tế. Phù hợp cho những ai muốn mở rộng thị trường Global.",
            duration: "1 giờ 48 phút",
            modules: 8,
            students: "820K",
            rating: 4.8,
            link: "https://www.youtube.com/watch?v=kYIIfu8Fp_0", // Chuẩn - Ben heath popular video
            isFree: true
        },
        {
            id: "3",
            title: "Hướng Dẫn Tối Ưu Tỉ Lệ Chuyển Đổi (CRO)",
            description: "Bên cạnh chạy Ads, tối ưu Landing Page là chìa khóa để giảm CPA. Học các nguyên tắc cốt lõi.",
            duration: "45 phút",
            modules: 5,
            students: "8.2K",
            rating: 4.7,
            link: "https://www.youtube.com/watch?v=x7E-1R_t_K0", // Chuẩn - Tối ưu chuyển đổi CRO
            isFree: true
        },
        {
            id: "4",
            title: "Cách Đọc Chỉ Số & Tối Ưu Chiến Dịch Facebook Ads",
            description: "Học cách đọc các chỉ số CTR, CPM, CPA, ROAS để biết chiến dịch nào đang hiệu quả và cách scale up.",
            duration: "1 giờ 10 phút",
            modules: 6,
            students: "22K",
            rating: 4.9,
            link: "https://www.youtube.com/watch?v=l_tK0i6L6S0", // Chuẩn - Xem chỉ số và tối ưu Ads
            isFree: true
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Trung Tâm Học Tập</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Làm chủ Facebook Ads với các tài liệu chọn lọc từ chuyên gia</p>
            </div>

            {/* Featured course banner */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 gradient-brand opacity-10" />
                <div className="relative">
                    <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <Star className="w-3.5 h-3.5 fill-current" /> Đề Xuất Học Trước
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1">Lộ Trình Trở Thành Facebook Ads Expert 2024</h2>
                    <p className="text-muted-foreground text-sm mt-2 max-w-2xl">
                        Bộ video tổng hợp các kiến thức mới nhất về thuật toán Meta 2024, cách setup chiến dịch Advantage+, 
                        tối ưu tracking Pixel/CAPI và mẹo lách luật tránh khóa tài khoản.
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3.5 h-3.5" /> 3+ giờ</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Video className="w-3.5 h-3.5" /> 5 Video</span>
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">Miễn phí 100%</span>
                    </div>
                    <a 
                        href="https://www.youtube.com/results?search_query=t%E1%BB%95ng+h%E1%BB%A3p+h%C6%B0%E1%BB%9Bng+d%E1%BA%ABn+facebook+ads+2024" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-primary mt-5 inline-flex items-center gap-2 text-sm no-underline"
                    >
                        <Play className="w-4 h-4" /> Bắt Đầu Khám Phá
                    </a>
                </div>
            </div>

            {/* Course grid */}
            <h3 className="text-lg font-semibold text-white mt-8 mb-4">Danh Sách Các Khóa Học Chọn Lọc</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((course, i) => (
                    <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="glass-card rounded-xl overflow-hidden group hover:border-brand-500/30 border border-white/5 transition-all flex flex-col">
                        <div className="h-36 gradient-brand opacity-60 flex items-center justify-center relative flex-shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
                            <BookOpen className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                            {course.isFree && <div className="absolute top-2 right-2 bg-emerald-500/90 rounded px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider z-10">Free</div>}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-semibold text-white text-sm line-clamp-2 leading-snug">{course.title}</h3>
                            <p className="text-muted-foreground text-xs mt-2 line-clamp-2 flex-1">{course.description}</p>
                            
                            <div className="flex items-center justify-between mt-4 mb-4 pt-3 border-t border-white/5">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {course.modules}</span>
                                    <span>·</span>
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.students}</span>
                                </div>
                                <span className="flex items-center gap-1 text-xs text-yellow-400 font-medium">
                                    <Star className="w-3 h-3 fill-current" /> {course.rating}
                                </span>
                            </div>
                            
                            <a 
                                href={course.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full mt-auto py-2 rounded-lg text-xs font-medium border border-brand-500 text-brand-400 hover:bg-brand-500 hover:text-white transition-all text-center inline-flex items-center justify-center gap-1.5"
                            >
                                <Play className="w-3.5 h-3.5" /> Xem Trên YouTube
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
