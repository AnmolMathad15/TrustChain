import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, Delete } from "lucide-react";

interface PinAuthModalProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

const DEMO_PIN = "1234";

export default function PinAuthModal({ open, onSuccess, onCancel, title = "PIN Verification", description = "Enter your 4-digit security PIN to continue." }: PinAuthModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError("");
    if (next.length === 4) {
      setTimeout(() => {
        if (next === DEMO_PIN) {
          setPin("");
          onSuccess();
        } else {
          setShaking(true);
          setError("Incorrect PIN. (Demo PIN: 1234)");
          setTimeout(() => { setPin(""); setShaking(false); }, 600);
        }
      }, 200);
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError("");
  };

  const dots = Array.from({ length: 4 }, (_, i) => i < pin.length);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setPin(""); setError(""); onCancel(); } }}>
      <DialogContent className="max-w-xs mx-auto" data-testid="pin-auth-modal">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <motion.div
            animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex justify-center gap-4"
          >
            {dots.map((filled, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-colors ${filled ? "bg-primary border-primary" : "border-muted-foreground"}`}
              />
            ))}
          </motion.div>

          {error && <p className="text-center text-sm text-destructive">{error}</p>}

          <div className="grid grid-cols-3 gap-3">
            {["1","2","3","4","5","6","7","8","9"].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="h-14 rounded-xl text-xl font-semibold bg-muted hover:bg-muted/80 transition-colors active:scale-95"
                data-testid={`pin-digit-${d}`}
              >
                {d}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleDigit("0")}
              className="h-14 rounded-xl text-xl font-semibold bg-muted hover:bg-muted/80 transition-colors active:scale-95"
              data-testid="pin-digit-0"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-14 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors active:scale-95"
            >
              <Delete className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => { setPin(""); setError(""); onCancel(); }}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
