import React from "react";

function Shimmer({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: "linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-overlay) 50%, var(--bg-elevated) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite linear",
        ...style,
      }}
    />
  );
}

export default function HealthcareSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Shimmer style={{ height: 64 }} />

      {/* AbhaProfileCard */}
      <Shimmer style={{ height: 120 }} className="rounded-2xl" />

      {/* Insights row */}
      <div className="grid grid-cols-2 gap-4">
        <Shimmer style={{ height: 160 }} className="rounded-2xl" />
        <Shimmer style={{ height: 160 }} className="rounded-2xl" />
      </div>

      {/* Appointments */}
      <Shimmer style={{ height: 40 }} />
      <Shimmer style={{ height: 72 }} className="rounded-2xl" />
      <Shimmer style={{ height: 72 }} className="rounded-2xl" />

      {/* Records */}
      <Shimmer style={{ height: 36 }} />
      {[1, 2, 3].map((i) => (
        <Shimmer key={i} style={{ height: 70 }} className="rounded-2xl" />
      ))}
    </div>
  );
}
