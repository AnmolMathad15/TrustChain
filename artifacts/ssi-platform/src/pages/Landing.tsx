import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldCheck, Zap, Globe, Lock, ChevronRight, CheckCircle2,
  Building2, Users, ScanLine, Star, ArrowRight, Blocks,
  FileCheck, Brain, Fingerprint, BadgeCheck,
} from "lucide-react";

const STAGGER = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const ITEM = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
};

const PRICING = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    badge: null,
    gradient: "from-slate-500 to-slate-600",
    features: ["1 DID", "10 credentials/month", "Basic verification", "Community support"],
    cta: "Get Started Free",
    href: "/",
  },
  {
    name: "Starter",
    price: "₹999",
    period: "/month",
    badge: "Most Popular",
    gradient: "from-indigo-500 to-purple-600",
    features: ["1 DID", "500 credentials/month", "API access (500 calls)", "Webhook support", "Priority email support"],
    cta: "Start Free Trial",
    href: "/",
  },
  {
    name: "Enterprise",
    price: "₹4,999",
    period: "/month",
    badge: "Best Value",
    gradient: "from-orange-500 to-rose-600",
    features: ["Unlimited DIDs", "Unlimited credentials", "Unlimited API", "Custom issuer branding", "Dedicated support", "SLA guarantee"],
    cta: "Contact Sales",
    href: "/",
  },
];

const FEATURES = [
  { icon: Fingerprint, title: "W3C Decentralized IDs", desc: "Every citizen gets a sovereign DID anchored on Polygon blockchain — no central authority required.", gradient: "from-blue-500 to-indigo-600" },
  { icon: FileCheck, title: "Verifiable Credentials", desc: "Issue tamper-proof credentials signed with Ed25519. Compatible with W3C VC Data Model 2.0.", gradient: "from-violet-500 to-purple-600" },
  { icon: Blocks, title: "Blockchain Anchoring", desc: "Credential hashes anchored on Polygon Mumbai. Fully auditable on Polygonscan.", gradient: "from-emerald-500 to-teal-600" },
  { icon: Brain, title: "AI-Powered Assistance", desc: "Claude-powered assistant helps citizens understand schemes, credentials, and government services.", gradient: "from-rose-500 to-pink-600" },
  { icon: Globe, title: "Multilingual UI", desc: "Full support for English, Hindi, and Kannada. Accessible for every Indian citizen.", gradient: "from-orange-500 to-amber-500" },
  { icon: BadgeCheck, title: "Trust Registry", desc: "Only whitelisted issuers (banks, universities, govt) can issue credentials. Fraud-proof by design.", gradient: "from-cyan-500 to-blue-600" },
];

const ACTORS = [
  {
    icon: Building2,
    title: "Issuers",
    subtitle: "Banks · Universities · Government",
    desc: "Issue verifiable credentials to your users. Manage your issuance pipeline, revoke compromised credentials, and maintain your reputation score on-chain.",
    gradient: "from-indigo-600 to-blue-700",
    cta: "Issuer Portal",
    href: "/issuer",
  },
  {
    icon: Users,
    title: "Holders",
    subtitle: "Citizens · Employees · Students",
    desc: "Store your credentials in a sovereign wallet. Share with any verifier via QR code. No middleman, no data breach.",
    gradient: "from-purple-600 to-fuchsia-700",
    cta: "Open Wallet",
    href: "/credentials",
  },
  {
    icon: ScanLine,
    title: "Verifiers",
    subtitle: "Employers · Agencies · Banks",
    desc: "Verify credentials in milliseconds via API or QR scanner. Full audit trail, zero fraud risk.",
    gradient: "from-emerald-600 to-teal-700",
    cta: "Verifier Portal",
    href: "/verifier",
  },
];

const STATS = [
  { value: "1M+", label: "Citizens Served" },
  { value: "50+", label: "Trusted Issuers" },
  { value: "99.8%", label: "Uptime SLA" },
  { value: "< 2s", label: "Verify Time" },
];

export default function Landing() {
  return (
    <div className="min-h-screen -m-5 md:-m-8">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-24" style={{ background: "linear-gradient(135deg,#0f0c29,#1a1560,#302b63,#24243e)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl animate-float-slow" />
          <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl" style={{ animation: "float-slow 11s ease-in-out infinite reverse" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-blue-600/8 blur-3xl" />
        </div>

        <motion.div initial="hidden" animate="visible" variants={STAGGER} className="relative z-10 max-w-5xl mx-auto space-y-8">
          <motion.div variants={ITEM}>
            <Badge className="mb-4 bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-4 py-1 text-sm font-semibold">
              Powered by Polygon · W3C DID · Ed25519
            </Badge>
          </motion.div>

          <motion.h1 variants={ITEM} className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
            India's First<br />
            <span className="gradient-text">Self-Sovereign</span><br />
            Identity Platform
          </motion.h1>

          <motion.p variants={ITEM} className="text-xl text-slate-300/80 max-w-2xl mx-auto leading-relaxed">
            Trustchain gives every Indian citizen a blockchain-anchored DID and verifiable credentials — owned by you, verified anywhere, trusted by all.
          </motion.p>

          <motion.div variants={ITEM} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-2xl shadow-indigo-500/40 flex items-center gap-2"
              >
                <Zap className="h-5 w-5" /> Get Your Free DID
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </Link>
            <Link href="/verify">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-2xl border border-white/20 text-white font-bold text-lg backdrop-blur bg-white/5 flex items-center gap-2"
              >
                <ScanLine className="h-5 w-5" /> Verify a Credential
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="relative z-10 mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto w-full"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Actor Portals ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="text-center mb-16">
            <motion.p variants={ITEM} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Three Portals. One Platform.</motion.p>
            <motion.h2 variants={ITEM} className="text-4xl font-black tracking-tight">Built for every actor in the ecosystem</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="grid md:grid-cols-3 gap-6">
            {ACTORS.map((a) => {
              const Icon = a.icon;
              return (
                <motion.div key={a.title} variants={ITEM}>
                  <Link href={a.href}>
                    <motion.div
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative overflow-hidden rounded-3xl p-8 h-full cursor-pointer shimmer-card"
                      style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    >
                      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${a.gradient}`} />
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-black mb-1">{a.title}</h3>
                      <p className="text-xs text-muted-foreground font-semibold mb-4 uppercase tracking-wide">{a.subtitle}</p>
                      <p className="text-muted-foreground leading-relaxed text-sm mb-6">{a.desc}</p>
                      <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${a.gradient} text-white text-sm font-bold shadow-lg group-hover:shadow-xl transition-all`}>
                        {a.cta} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "hsl(var(--muted)/30%)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="text-center mb-16">
            <motion.p variants={ITEM} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Enterprise-Grade Features</motion.p>
            <motion.h2 variants={ITEM} className="text-4xl font-black tracking-tight">Everything you need for sovereign identity</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} variants={ITEM}>
                  <motion.div whileHover={{ y: -4 }} className="p-6 rounded-2xl h-full" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-base mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="text-center mb-16">
            <motion.p variants={ITEM} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Simple Pricing</motion.p>
            <motion.h2 variants={ITEM} className="text-4xl font-black tracking-tight">Start free. Scale when ready.</motion.h2>
            <motion.p variants={ITEM} className="text-muted-foreground mt-3 text-lg">All plans include blockchain anchoring and W3C compliance.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="grid md:grid-cols-3 gap-6 items-start">
            {PRICING.map((plan, i) => (
              <motion.div key={plan.name} variants={ITEM}>
                <motion.div
                  whileHover={{ y: -6, scale: i === 1 ? 1.03 : 1.02 }}
                  className={`relative overflow-hidden rounded-3xl p-8 flex flex-col gap-6 ${i === 1 ? "ring-2 ring-indigo-500 shadow-2xl shadow-indigo-500/20" : ""}`}
                  style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                >
                  {plan.badge && (
                    <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full text-white bg-gradient-to-r ${plan.gradient}`}>
                      {plan.badge}
                    </div>
                  )}
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${plan.gradient}`} />
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{plan.name}</p>
                    <div className="flex items-end gap-1 mt-2">
                      <span className="text-4xl font-black">{plan.price}</span>
                      <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full py-3 rounded-2xl font-bold text-sm ${i === 1 ? `bg-gradient-to-r ${plan.gradient} text-white shadow-lg` : "border border-border bg-muted/40 hover:bg-muted"}`}
                    >
                      {plan.cta}
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div variants={ITEM} className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-10 w-10 text-white" />
          </motion.div>
          <motion.h2 variants={ITEM} className="text-4xl font-black text-white">Ready to give India its digital identity?</motion.h2>
          <motion.p variants={ITEM} className="text-indigo-200/80 text-lg">Join thousands of citizens who have claimed their sovereign identity on Trustchain.</motion.p>
          <motion.div variants={ITEM} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-2xl bg-white text-indigo-700 font-bold text-lg shadow-2xl flex items-center gap-2"
              >
                <Zap className="h-5 w-5" /> Launch Dashboard
              </motion.button>
            </Link>
            <Link href="/issuer">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-2xl border border-white/25 text-white font-bold text-lg bg-white/8 flex items-center gap-2"
              >
                <Building2 className="h-5 w-5" /> Issuer Portal
              </motion.button>
            </Link>
          </motion.div>
          <motion.p variants={ITEM} className="text-indigo-300/60 text-sm flex items-center gap-2 justify-center">
            <Lock className="h-3.5 w-3.5" /> No credit card required · Polygon Mumbai Testnet
          </motion.p>
        </motion.div>
      </section>
    </div>
  );
}
