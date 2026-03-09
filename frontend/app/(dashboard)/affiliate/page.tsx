"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserCheck, Link2, Copy, CheckCheck, TrendingUp, DollarSign, Users, Loader2 } from "lucide-react";

export default function AffiliatePage() {
  const [affiliate, setAffiliate] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch("/api/affiliates/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setAffiliate(d.data?.affiliate); setStats(d.data?.stats); })
      .finally(() => setLoading(false));
  }, []);

  async function joinProgram() {
    setJoining(true);
    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/affiliates/join", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json();
    if (d.success) { setAffiliate(d.data); setStats({ totalReferrals: 0, totalEarned: 0, totalPaid: 0, balance: 0, referralLink: `${window.origin}/ref/${d.data.code}` }); }
    setJoining(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(stats?.referralLink || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  if (!affiliate) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Affiliate Program</h1>
      <div className="glass-card rounded-2xl p-12 flex flex-col items-center text-center max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mb-6 animate-glow">
          <UserCheck className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Earn 30% Recurring Commission</h2>
        <p className="text-muted-foreground mt-3 text-sm">Refer customers and earn 30% of their monthly subscription — forever. No cap.</p>
        <div className="grid grid-cols-3 gap-4 mt-6 w-full">
          {[["30%", "Commission"], ["Recurring", "Monthly"], ["Unlimited", "Earnings"]].map(([val, lbl]) => (
            <div key={lbl} className="bg-white/5 rounded-xl p-3">
              <p className="text-xl font-bold text-white">{val}</p>
              <p className="text-xs text-muted-foreground">{lbl}</p>
            </div>
          ))}
        </div>
        <button onClick={joinProgram} disabled={joining} className="btn-primary mt-6 flex items-center gap-2">
          {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
          {joining ? "Joining..." : "Join Affiliate Program"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Affiliate Dashboard</h1>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Referrals", value: stats?.totalReferrals || 0 },
          { icon: DollarSign, label: "Total Earned", value: `$${(stats?.totalEarned || 0).toFixed(2)}` },
          { icon: TrendingUp, label: "Balance", value: `$${(stats?.balance || 0).toFixed(2)}` },
          { icon: DollarSign, label: "Total Paid", value: `$${(stats?.totalPaid || 0).toFixed(2)}` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><s.icon className="w-4 h-4 text-brand-500" /><span className="text-xs text-muted-foreground">{s.label}</span></div>
            <p className="text-xl font-bold text-white">{s.value}</p>
          </motion.div>
        ))}
      </div>
      {/* Referral link */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Link2 className="w-4 h-4 text-brand-500" /> Your Referral Link</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-muted-foreground font-mono truncate">
            {stats?.referralLink}
          </div>
          <button onClick={copyLink} className="flex items-center gap-2 px-4 py-3 bg-brand-500/10 text-brand-400 rounded-xl text-sm hover:bg-brand-500/20 transition-colors border border-brand-500/20">
            {copied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Earn 30% commission for every paid user you refer — recurring monthly.</p>
      </div>
    </div>
  );
}
