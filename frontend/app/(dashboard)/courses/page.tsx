"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users, Play, CheckCircle, Lock, Loader2, Star } from "lucide-react";

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        fetch("/api/courses", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setCourses(d.data); })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Learning Hub</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Master Facebook Ads with expert-curated courses</p>
            </div>

            {/* Featured course banner */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 gradient-brand opacity-10" />
                <div className="relative">
                    <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">Featured Course</span>
                    <h2 className="text-xl font-bold text-white mt-1">Facebook Ads Mastery 2024</h2>
                    <p className="text-muted-foreground text-sm mt-2">From zero to profitable campaigns. Everything you need to dominate Facebook Ads.</p>
                    <div className="flex items-center gap-4 mt-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3.5 h-3.5" /> 8h 24m</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><BookOpen className="w-3.5 h-3.5" /> 24 lessons</span>
                        <span className="flex items-center gap-1 text-xs text-yellow-400"><Star className="w-3.5 h-3.5 fill-current" /> 4.9</span>
                    </div>
                    <button className="btn-primary mt-4 flex items-center gap-2 text-sm">
                        <Play className="w-4 h-4" /> Start Learning Free
                    </button>
                </div>
            </div>

            {/* Course grid */}
            {courses.length === 0 ? (
                <div className="glass-card rounded-2xl p-10 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-white font-medium">No courses available yet</p>
                    <p className="text-muted-foreground text-sm mt-1">Check back soon for new content</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {courses.map((course, i) => (
                        <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="glass-card rounded-xl overflow-hidden group cursor-pointer hover:border-brand-500/30 border border-white/5 transition-all">
                            <div className="h-36 gradient-brand opacity-60 flex items-center justify-center relative">
                                <BookOpen className="w-12 h-12 text-white" />
                                {!course.isFree && <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1"><Lock className="w-3 h-3 text-white" /></div>}
                                {course.enrollments?.[0] && <div className="absolute top-2 left-2"><CheckCircle className="w-4 h-4 text-emerald-400" /></div>}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-white text-sm line-clamp-2">{course.title}</h3>
                                <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{course.description}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{course._count?.modules || 0} modules</span>
                                        <span>·</span>
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course._count?.enrollments || 0}</span>
                                    </div>
                                    <span className={`text-sm font-bold ${course.isFree ? "text-emerald-400" : "text-white"}`}>
                                        {course.isFree ? "Free" : `$${course.price}`}
                                    </span>
                                </div>
                                <button className="w-full mt-3 py-2 rounded-lg text-xs font-medium border border-white/10 text-muted-foreground hover:text-white hover:border-brand-500/50 transition-all">
                                    {course.enrollments?.[0] ? "Continue Learning" : "Enroll Now"}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
