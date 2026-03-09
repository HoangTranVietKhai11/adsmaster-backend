"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Phone, Mail, Building2, Search, Loader2, ChevronRight } from "lucide-react";

const statusColors: Record<string, string> = {
    NEW: "text-blue-400 bg-blue-400/10",
    CONTACTED: "text-yellow-400 bg-yellow-400/10",
    QUALIFIED: "text-brand-400 bg-brand-400/10",
    CONVERTED: "text-emerald-400 bg-emerald-400/10",
    LOST: "text-red-400 bg-red-400/10",
};

export default function CRMPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", source: "Facebook Ads" });

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        fetch("/api/crm", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setLeads(d.data); })
            .finally(() => setLoading(false));
    }, []);

    async function createLead() {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/crm", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(form),
        });
        const d = await res.json();
        if (d.success) { setLeads([d.data, ...leads]); setShowCreate(false); setForm({ name: "", email: "", phone: "", company: "", source: "Facebook Ads" }); }
    }

    const filtered = leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">CRM — Lead Manager</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Track and manage your sales pipeline</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Add Lead
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"].map(status => (
                    <div key={status} className="glass-card rounded-xl p-3 text-center">
                        <p className={`text-lg font-bold ${statusColors[status]?.split(" ")[0]}`}>{leads.filter(l => l.status === status).length}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{status}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search leads..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
            </div>

            {/* Create modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-4">Add New Lead</h3>
                        <div className="space-y-3">
                            {[["name", "Name *"], ["email", "Email"], ["phone", "Phone"], ["company", "Company"], ["source", "Source"]].map(([k, l]) => (
                                <div key={k}>
                                    <label className="text-sm text-muted-foreground block mb-1">{l}</label>
                                    <input value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-white transition-colors">Cancel</button>
                            <button onClick={createLead} className="btn-primary flex-1 text-sm">Add Lead</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Lead table */}
            {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
            ) : (
                <div className="glass-card rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead><tr className="border-b border-white/5">
                            {["Name", "Email", "Company", "Source", "Status", "Interactions"].map(h => (
                                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3 first:pl-5">{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No leads found</td></tr>
                            ) : filtered.map((lead, i) => (
                                <motion.tr key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                    className="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-xs text-white font-bold flex-shrink-0">{lead.name[0]}</div>
                                            <span className="text-sm text-white font-medium">{lead.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{lead.email || "—"}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{lead.company || "—"}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{lead.source || "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[lead.status]}`}>{lead.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{lead._count?.interactions || 0}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
