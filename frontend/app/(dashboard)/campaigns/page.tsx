"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Play, Pause, Trash2, ChevronRight, DollarSign, Eye, MousePointerClick, Loader2, Target, Layers } from "lucide-react";

interface Campaign {
    id: string;
    name: string;
    objective: string;
    budget: number;
    status: string;
    adSets: any[];
    _count?: { adSets: number };
    createdAt: string;
}

const statusColors: Record<string, string> = {
    ACTIVE: "text-emerald-400 bg-emerald-400/10",
    PAUSED: "text-yellow-400 bg-yellow-400/10",
    DRAFT: "text-gray-400 bg-gray-400/10",
    ARCHIVED: "text-red-400 bg-red-400/10",
};

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: "", objective: "SALES", budget: "", dailyBudget: "" });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    async function fetchCampaigns() {
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch("/api/campaigns", { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setCampaigns(data.data);
        } catch { } finally { setLoading(false); }
    }

    async function createCampaign() {
        setCreating(true);
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...form, budget: Number(form.budget), dailyBudget: form.dailyBudget ? Number(form.dailyBudget) : undefined }),
            });
            const data = await res.json();
            if (data.success) { setCampaigns([data.data, ...campaigns]); setShowCreate(false); setForm({ name: "", objective: "SALES", budget: "", dailyBudget: "" }); }
        } catch { } finally { setCreating(false); }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Campaigns</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Build and manage your Facebook ad campaigns</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> New Campaign
                </button>
            </div>

            {/* Create modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-4">New Campaign</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1.5">Campaign Name</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Summer Sale 2024"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1.5">Objective</label>
                                <select value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all appearance-none">
                                    {["AWARENESS", "TRAFFIC", "ENGAGEMENT", "LEADS", "SALES", "APP_PROMOTION"].map(o =>
                                        <option key={o} value={o} className="bg-gray-900">{o}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1.5">Total Budget ($)</label>
                                    <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
                                        placeholder="500"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1.5">Daily Budget ($)</label>
                                    <input type="number" value={form.dailyBudget} onChange={(e) => setForm({ ...form, dailyBudget: e.target.value })}
                                        placeholder="50"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-white transition-colors">Cancel</button>
                            <button onClick={createCampaign} disabled={creating || !form.name || !form.budget}
                                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {creating ? "Creating..." : "Create Campaign"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Campaign list */}
            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
            ) : campaigns.length === 0 ? (
                <div className="glass-card rounded-2xl p-16 text-center">
                    <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-white font-semibold text-lg">No campaigns yet</h3>
                    <p className="text-muted-foreground text-sm mt-2">Create your first campaign to get started</p>
                    <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 text-sm inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create Campaign
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {campaigns.map((c, i) => (
                        <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="glass-card rounded-xl p-5 hover:border-brand-500/30 border border-white/5 transition-all cursor-pointer group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
                                        <Target className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-white truncate">{c.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[c.status] || "text-gray-400 bg-gray-400/10"}`}>{c.status}</span>
                                            <span className="text-xs text-muted-foreground">{c.objective}</span>
                                            <span className="text-xs text-muted-foreground">{c._count?.adSets || 0} ad sets</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 flex-shrink-0">
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-semibold text-white">${c.budget.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">Total Budget</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
