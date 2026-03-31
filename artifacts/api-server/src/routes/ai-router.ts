import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { notifications, bills, schemes } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

type Intent =
  | "navigate_atm"
  | "navigate_documents"
  | "navigate_forms"
  | "navigate_healthcare"
  | "navigate_payments"
  | "navigate_schemes"
  | "navigate_notifications"
  | "navigate_profile"
  | "navigate_ai"
  | "navigate_admin"
  | "navigate_security"
  | "check_bills"
  | "check_schemes"
  | "check_notifications"
  | "general";

interface IntentRule {
  intent: Intent;
  keywords: string[];
  route?: string;
  moduleLabel?: string;
}

const INTENT_RULES: IntentRule[] = [
  { intent: "navigate_atm", keywords: ["atm", "cash", "withdraw", "deposit", "card", "pin change", "balance", "एटीएम", "नकद", "ಎಟಿಎಂ"], route: "/atm", moduleLabel: "ATM Assistant" },
  { intent: "navigate_documents", keywords: ["aadhaar", "document", "digilocker", "pan", "voter", "driving", "license", "certificate", "id card", "identity", "आधार", "दस्तावेज़", "पैन", "ಆಧಾರ್", "ದಾಖಲೆ"], route: "/documents", moduleLabel: "Documents" },
  { intent: "navigate_forms", keywords: ["form", "application", "apply", "fill", "submit", "registration", "certificate application", "फॉर्म", "आवेदन", "ಫಾರ್ಮ್"], route: "/forms", moduleLabel: "Government Forms" },
  { intent: "navigate_healthcare", keywords: ["health", "doctor", "medical", "hospital", "report", "prescription", "record", "vitals", "appointment", "स्वास्थ्य", "डॉक्टर", "ಆರೋಗ್ಯ"], route: "/healthcare", moduleLabel: "Healthcare" },
  { intent: "navigate_payments", keywords: ["pay", "bill", "payment", "upi", "electricity", "water", "gas", "recharge", "dues", "pending", "money", "भुगतान", "बिल", "ಪಾವತಿ", "ಬಿಲ್"], route: "/payments", moduleLabel: "Payments" },
  { intent: "navigate_schemes", keywords: ["scheme", "benefit", "subsidy", "welfare", "pmay", "pm-kisan", "ayushman", "government scheme", "eligibility", "योजना", "लाभ", "ಯೋಜನೆ"], route: "/schemes", moduleLabel: "Government Schemes" },
  { intent: "navigate_notifications", keywords: ["notification", "alert", "reminder", "update", "news", "message", "सूचना", "अलर्ट", "ಸೂಚನೆ"], route: "/notifications", moduleLabel: "Notifications" },
  { intent: "navigate_profile", keywords: ["profile", "account", "settings", "language", "kiosk", "preference", "edit profile", "प्रोफ़ाइल", "सेटिंग्स", "ಪ್ರೊಫೈಲ್"], route: "/profile", moduleLabel: "Profile" },
  { intent: "navigate_security", keywords: ["security", "privacy", "access log", "who accessed", "data access", "audit", "सुरक्षा", "ಸೂರಕ್ಷತೆ"], route: "/security", moduleLabel: "Security" },
  { intent: "navigate_admin", keywords: ["admin", "dashboard admin", "analytics", "usage stats"], route: "/admin", moduleLabel: "Admin Panel" },
];

function classifyIntent(message: string): IntentRule | null {
  const lower = message.toLowerCase();
  for (const rule of INTENT_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule;
    }
  }
  return null;
}

function buildResponseText(intent: IntentRule | null, language: string, message: string): string {
  if (!intent || intent.intent === "general") {
    const greetings: Record<string, string> = {
      en: "I'm your SSI assistant. I can help you with payments, documents, health records, government schemes, and more. What do you need?",
      hi: "मैं आपका SSI सहायक हूं। मैं भुगतान, दस्तावेज़, स्वास्थ्य रिकॉर्ड, सरकारी योजनाओं में मदद कर सकता हूं।",
      kn: "ನಾನು ನಿಮ್ಮ SSI ಸಹಾಯಕ. ಪಾವತಿಗಳು, ದಾಖಲೆಗಳು, ಆರೋಗ್ಯ ದಾಖಲೆಗಳು, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
    };
    return greetings[language] || greetings["en"];
  }

  const templates: Record<string, Record<string, string>> = {
    navigate_atm: { en: "Opening ATM Assistant for you.", hi: "ATM सहायक खोल रहा हूं।", kn: "ATM ಸಹಾಯಕ ತೆರೆಯುತ್ತಿದ್ದೇನೆ." },
    navigate_documents: { en: "Taking you to your DigiLocker documents.", hi: "आपके DigiLocker दस्तावेज़ खोल रहा हूं।", kn: "ನಿಮ್ಮ DigiLocker ದಾಖಲೆಗಳಿಗೆ ಕರೆದೊಯ್ಯುತ್ತಿದ್ದೇನೆ." },
    navigate_forms: { en: "Opening government forms for you.", hi: "सरकारी फॉर्म खोल रहा हूं।", kn: "ಸರ್ಕಾರಿ ಫಾರ್ಮ್‌ಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ." },
    navigate_healthcare: { en: "Opening your health records.", hi: "आपके स्वास्थ्य रिकॉर्ड खोल रहा हूं।", kn: "ನಿಮ್ಮ ಆರೋಗ್ಯ ದಾಖಲೆಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ." },
    navigate_payments: { en: "Opening your bills and payments.", hi: "आपके बिल और भुगतान खोल रहा हूं।", kn: "ನಿಮ್ಮ ಬಿಲ್‌ಗಳು ಮತ್ತು ಪಾವತಿಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ." },
    navigate_schemes: { en: "Showing government schemes you may be eligible for.", hi: "सरकारी योजनाएं दिखा रहा हूं।", kn: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇನೆ." },
    navigate_notifications: { en: "Opening your notifications.", hi: "आपकी सूचनाएं खोल रहा हूं।", kn: "ನಿಮ್ಮ ಸೂಚನೆಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ." },
    navigate_profile: { en: "Opening your profile settings.", hi: "आपकी प्रोफ़ाइल सेटिंग्स खोल रहा हूं।", kn: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ." },
    navigate_security: { en: "Opening your security and privacy settings.", hi: "सुरक्षा और गोपनीयता सेटिंग्स खोल रहा हूं।", kn: "ಸೂರಕ್ಷತೆ ಮತ್ತು ಗೌಪ್ಯತೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ." },
    navigate_admin: { en: "Opening the admin dashboard.", hi: "एडमिन डैशबोर्ड खोल रहा हूं।", kn: "ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ." },
  };

  const tmpl = templates[intent.intent];
  if (tmpl) return tmpl[language] || tmpl["en"];
  return "Processing your request...";
}

// POST /api/ai-router
router.post("/", async (req, res) => {
  try {
    const { message = "", language = "en" } = req.body as { message?: string; language?: string };

    if (!message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const matched = classifyIntent(message);
    const responseText = buildResponseText(matched, language, message);

    return res.json({
      intent: matched?.intent || "general",
      route: matched?.route || null,
      moduleLabel: matched?.moduleLabel || null,
      response: responseText,
      shouldNavigate: !!matched?.route,
    });
  } catch (err) {
    req.log.error({ err }, "AI Router error");
    return res.status(500).json({ error: "AI Router failed" });
  }
});

export default router;
