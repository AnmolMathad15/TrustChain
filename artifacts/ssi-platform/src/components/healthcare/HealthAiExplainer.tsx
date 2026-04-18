import React from "react";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";
import { useHealthcareStore } from "../../store/healthcareStore";
import { useToast } from "@/hooks/use-toast";
import type { RecordType } from "../../types/healthcare";

interface Props {
  recordId: string;
  recordTitle: string;
  recordDetails: string;
  recordType: RecordType;
  doctor: string;
  date: string;
  onExpand: () => void;
}

export default function HealthAiExplainer({
  recordId,
  recordTitle,
  recordDetails,
  recordType,
  doctor,
  date,
  onExpand,
}: Props) {
  const { aiExplainingId, setAiExplaining, setAiExplanation, aiExplanations } =
    useHealthcareStore();
  const { toast } = useToast();

  const isExplaining = aiExplainingId === recordId;
  const isDone = !!aiExplanations[recordId];

  const handleExplain = async () => {
    if (isExplaining || isDone) {
      onExpand();
      return;
    }
    setAiExplaining(recordId);
    onExpand();

    try {
      const res = await fetch("/api/ai/explain-credential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: recordTitle,
          type: recordType,
          details: recordDetails,
          doctor,
          date,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setAiExplanation(recordId, data.explanation);
      toast({ title: "AI explanation ready", description: recordTitle });
    } catch {
      toast({
        title: "AI explanation failed, try again",
        variant: "destructive",
      });
    } finally {
      setAiExplaining(null);
    }
  };

  return (
    <button
      onClick={handleExplain}
      disabled={isExplaining}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all hover:opacity-80 disabled:opacity-60"
      style={{
        background: isDone ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.10)",
        color: isDone ? "#22C55E" : "#F59E0B",
        border: isDone ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(245,158,11,0.25)",
      }}
    >
      {isExplaining ? (
        <>
          <Loader2 size={12} className="animate-spin" /> Explaining...
        </>
      ) : isDone ? (
        <>
          <CheckCircle size={12} /> Explained ✓
        </>
      ) : (
        <>
          <Sparkles size={12} /> Explain
        </>
      )}
    </button>
  );
}
