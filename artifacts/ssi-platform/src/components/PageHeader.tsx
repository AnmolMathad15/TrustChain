import React from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: string;
  accentRgb: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ icon, title, subtitle, accent, accentRgb, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative pb-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `rgba(${accentRgb}, 0.15)`,
              border: `1px solid rgba(${accentRgb}, 0.3)`,
              boxShadow: `0 0 20px rgba(${accentRgb}, 0.20)`,
            }}
          >
            <span style={{ color: accent }}>{icon}</span>
          </div>
          <div>
            <h1 className="text-[22px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
              {title}
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      {/* Accent underline */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, ${accent}60 0%, ${accent}20 40%, transparent 100%)`,
        }}
      />
    </motion.div>
  );
}

/** Accent-colored primary button per spec */
export function AccentButton({
  children, onClick, className = "", accent, accentRgb, disabled, type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  accent: string;
  accentRgb: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-[10px] text-[13px] font-medium text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        background: accent,
        boxShadow: `0 4px 16px rgba(${accentRgb}, 0.35)`,
      }}
      onMouseEnter={(e) => { (e.target as HTMLElement).style.filter = "brightness(1.15)"; }}
      onMouseLeave={(e) => { (e.target as HTMLElement).style.filter = ""; }}
    >
      {children}
    </motion.button>
  );
}

/** Glass secondary button */
export function GlassButton({
  children, onClick, className = "", type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all cursor-pointer ${className}`}
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(8px)",
        border: "1px solid var(--border-default)",
        color: "var(--text-primary)",
      }}
    >
      {children}
    </motion.button>
  );
}
