import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, CheckCircle2, Volume2, VolumeX, Landmark } from "lucide-react";
import { useKioskMode } from "../contexts/KioskModeContext";
import { useMakePayment } from "@workspace/api-client-react";

type Step = 'INSERT_CARD' | 'PIN' | 'TRANSACTION' | 'AMOUNT' | 'CONFIRM' | 'COMPLETE';

const STEP_VOICE_GUIDE: Record<Step, string> = {
  INSERT_CARD: "Welcome to SSI ATM Assistant. Please insert your card or tap your phone to begin.",
  PIN: "Please enter your 4-digit PIN using the number pad. Your PIN is hidden for security.",
  TRANSACTION: "Please select your transaction type. Options are Cash Withdrawal, Balance Enquiry, Mini Statement, or PIN Change.",
  AMOUNT: "Please enter the amount you wish to withdraw. You can choose from preset amounts or type a custom amount.",
  CONFIRM: "Please review your transaction details and confirm to proceed.",
  COMPLETE: "Transaction successful! Please collect your cash. Thank you for using SSI Platform.",
};

export default function AtmAssistant() {
  const { isKioskMode } = useKioskMode();
  const [step, setStep] = useState<Step>('INSERT_CARD');
  const [pin, setPin] = useState("");
  const [amount, setAmount] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const makePayment = useMakePayment();

  const speakStep = useCallback((targetStep?: Step) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const text = STEP_VOICE_GUIDE[targetStep ?? step];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [step]);

  const goToStep = (next: Step) => {
    setStep(next);
    speakStep(next);
  };

  const handleNext = () => {
    switch (step) {
      case 'INSERT_CARD': goToStep('PIN'); break;
      case 'PIN':
        if (pin.length === 4) goToStep('TRANSACTION');
        break;
      case 'TRANSACTION': goToStep('AMOUNT'); break;
      case 'AMOUNT':
        if (amount) goToStep('CONFIRM');
        break;
      case 'CONFIRM':
        makePayment.mutate({ data: { amount: parseFloat(amount), upiId: "atm-withdrawal" } }, {
          onSuccess: () => goToStep('COMPLETE'),
        });
        break;
      case 'COMPLETE':
        setStep('INSERT_CARD');
        setPin("");
        setAmount("");
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
        break;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'INSERT_CARD':
        return (
          <div className="flex flex-col items-center text-center space-y-8 py-12">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <CreditCard className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">Please Insert Your Card</h2>
            <p className="text-xl text-muted-foreground">Or tap your phone to begin</p>
            <Button size="lg" className="h-16 px-12 text-xl mt-8" onClick={handleNext}>
              Simulate Card Insert
            </Button>
          </div>
        );
      case 'PIN':
        return (
          <div className="flex flex-col items-center text-center space-y-8 py-12">
            <h2 className="text-3xl font-bold">Enter your 4-digit PIN</h2>
            <div className="flex gap-4 justify-center my-8">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-16 h-16 border-4 border-primary rounded-xl flex items-center justify-center text-3xl font-bold bg-card">
                  {pin[i] ? "•" : ""}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-sm w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'Clear', 0, 'Enter'].map((key) => (
                <Button 
                  key={key} 
                  variant={key === 'Enter' ? 'default' : key === 'Clear' ? 'destructive' : 'outline'}
                  className="h-16 text-2xl font-semibold"
                  onClick={() => {
                    if (key === 'Clear') setPin("");
                    else if (key === 'Enter') handleNext();
                    else if (pin.length < 4) setPin(p => p + key);
                  }}
                >
                  {key}
                </Button>
              ))}
            </div>
          </div>
        );
      case 'TRANSACTION':
        return (
          <div className="flex flex-col items-center text-center space-y-8 py-12 w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold">Select Transaction</h2>
            <div className="grid grid-cols-2 gap-6 w-full">
              {['Cash Withdrawal', 'Balance Enquiry', 'Mini Statement', 'PIN Change'].map((t) => (
                <Button 
                  key={t} 
                  variant="outline" 
                  className="h-32 text-2xl hover:bg-primary hover:text-white transition-all flex flex-col gap-2"
                  onClick={() => t === 'Cash Withdrawal' && handleNext()}
                >
                  <Landmark className="w-8 h-8" />
                  {t}
                </Button>
              ))}
            </div>
          </div>
        );
      case 'AMOUNT':
        return (
          <div className="flex flex-col items-center text-center space-y-8 py-12">
            <h2 className="text-3xl font-bold">Enter Amount</h2>
            <div className="text-5xl font-mono font-bold py-8 flex items-center">
              <span className="text-muted-foreground mr-2">₹</span>
              {amount || "0"}
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <Button variant="outline" className="h-16 text-xl" onClick={() => { setAmount("500"); setStep('CONFIRM'); }}>₹500</Button>
              <Button variant="outline" className="h-16 text-xl" onClick={() => { setAmount("1000"); setStep('CONFIRM'); }}>₹1,000</Button>
              <Button variant="outline" className="h-16 text-xl" onClick={() => { setAmount("2000"); setStep('CONFIRM'); }}>₹2,000</Button>
              <Button variant="outline" className="h-16 text-xl" onClick={() => { setAmount("5000"); setStep('CONFIRM'); }}>₹5,000</Button>
            </div>
            <div className="flex gap-4 mt-8 w-full max-w-md">
              <Button variant="outline" className="flex-1 h-16 text-xl" onClick={() => setStep('TRANSACTION')}>Cancel</Button>
              <Button className="flex-1 h-16 text-xl" onClick={handleNext} disabled={!amount}>Confirm</Button>
            </div>
          </div>
        );
      case 'CONFIRM':
        return (
          <div className="flex flex-col items-center text-center space-y-8 py-12">
            <h2 className="text-3xl font-bold">Confirm Transaction</h2>
            <Card className="w-full max-w-md bg-muted/50">
              <CardContent className="pt-6 space-y-4 text-left">
                <div className="flex justify-between text-lg">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-semibold">Cash Withdrawal</span>
                </div>
                <div className="flex justify-between text-lg border-t pt-4">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-2xl">₹{amount}</span>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-4 w-full max-w-md">
              <Button variant="outline" className="flex-1 h-16 text-xl" onClick={() => setStep('AMOUNT')}>Back</Button>
              <Button className="flex-1 h-16 text-xl bg-green-600 hover:bg-green-700" onClick={handleNext} disabled={makePayment.isPending}>
                {makePayment.isPending ? "Processing..." : "Proceed"}
              </Button>
            </div>
          </div>
        );
      case 'COMPLETE':
        return (
          <div className="flex flex-col items-center text-center space-y-8 py-12">
            <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16" />
            </div>
            <h2 className="text-3xl font-bold">Please collect your cash</h2>
            <p className="text-xl text-muted-foreground mb-8">Thank you for using SSI Platform</p>
            <Button size="lg" className="h-16 px-12 text-xl" onClick={handleNext}>
              Finish
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-tight">ATM Assistant</h1>
          <Button
            variant="secondary"
            className={`gap-2 h-12 px-6 rounded-full border transition-all ${isSpeaking ? "bg-blue-100 text-blue-800 border-blue-300 animate-pulse" : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"}`}
            onClick={() => isSpeaking ? (window.speechSynthesis.cancel(), setIsSpeaking(false)) : speakStep()}
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            {isSpeaking ? "Stop" : "Voice Guide"}
          </Button>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2">
            {['INSERT_CARD', 'PIN', 'TRANSACTION', 'AMOUNT', 'CONFIRM'].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-3 h-3 rounded-full ${['INSERT_CARD', 'PIN', 'TRANSACTION', 'AMOUNT', 'CONFIRM', 'COMPLETE'].indexOf(step) >= i ? 'bg-primary' : 'bg-muted'}`} />
                {i < 4 && <div className={`w-12 h-1 ${['INSERT_CARD', 'PIN', 'TRANSACTION', 'AMOUNT', 'CONFIRM', 'COMPLETE'].indexOf(step) > i ? 'bg-primary' : 'bg-muted'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Card className="shadow-xl border-primary/20 bg-card overflow-hidden">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}