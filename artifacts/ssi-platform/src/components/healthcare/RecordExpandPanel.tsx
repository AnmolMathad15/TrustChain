import React from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import type { MedicalRecord } from "../../types/healthcare";

interface Props {
  record: MedicalRecord;
  aiExplanation?: string;
}

export default function RecordExpandPanel({ record, aiExplanation }: Props) {
  const shortHash = record.blockchainTxHash
    ? `${record.blockchainTxHash.slice(0, 6)}...${record.blockchainTxHash.slice(-4)}`
    : null;

  return (
    <div
      className="px-4 py-3 rounded-b-2xl space-y-3"
      style={{ background: "var(--bg-elevated)", borderTop: "1px solid var(--border-subtle)" }}
    >
      {/* AI Explanation (if present) */}
      {aiExplanation && (
        <div
          className="p-3 rounded-xl"
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#F59E0B" }}>
              ✦ AI Explanation
            </span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {aiExplanation}
          </p>
        </div>
      )}

      {/* Record details */}
      {record.details && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
            Record Details
          </p>
          <p className="text-[12px] leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
            {record.details}
          </p>
        </div>
      )}

      {/* VC anchoring info */}
      {record.vcAnchored && record.blockchainTxHash && (
        <div
          className="flex items-center gap-2 p-2.5 rounded-xl"
          style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}
        >
          <ShieldCheck size={14} style={{ color: "#06B6D4" }} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold" style={{ color: "#06B6D4" }}>
              ✓ Block #{record.blockNumber?.toLocaleString()} · Polygon Mainnet
            </p>
            <a
              href={`https://polygonscan.com/tx/${record.blockchainTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] flex items-center gap-0.5 hover:opacity-80"
              style={{ color: "#06B6D4" }}
            >
              {shortHash}
              <ExternalLink size={9} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
