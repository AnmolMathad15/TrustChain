import React, { createContext, useContext, useState, ReactNode } from "react";

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
};

const translations: Record<string, Record<string, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.atm": "ATM Assistant",
    "nav.documents": "Documents",
    "nav.forms": "Forms",
    "nav.healthcare": "Healthcare",
    "nav.payments": "Payments",
    "nav.schemes": "Schemes",
    "nav.notifications": "Notifications",
    "nav.profile": "Profile",
    "nav.ai_assistant": "AI Assistant",
    "greeting": "Welcome back",
    "pending_bills": "Pending Bills",
    "unread_notifications": "Unread Notifications",
    "recent_activity": "Recent Activity",
  },
  hi: {
    "nav.dashboard": "डैशबोर्ड",
    "nav.atm": "एटीएम सहायक",
    "nav.documents": "दस्तावेज़",
    "nav.forms": "फॉर्म",
    "nav.healthcare": "स्वास्थ्य सेवा",
    "nav.payments": "भुगतान",
    "nav.schemes": "योजनाएं",
    "nav.notifications": "सूचनाएं",
    "nav.profile": "प्रोफ़ाइल",
    "nav.ai_assistant": "एआई सहायक",
    "greeting": "वापसी पर स्वागत है",
    "pending_bills": "लंबित बिल",
    "unread_notifications": "अपठित सूचनाएं",
    "recent_activity": "हाल की गतिविधि",
  },
  kn: {
    "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "nav.atm": "ಎಟಿಎಂ ಸಹಾಯಕ",
    "nav.documents": "ದಾಖಲೆಗಳು",
    "nav.forms": "ಫಾರ್ಮ್‌ಗಳು",
    "nav.healthcare": "ಆರೋಗ್ಯ ರಕ್ಷಣೆ",
    "nav.payments": "ಪಾವತಿಗಳು",
    "nav.schemes": "ಯೋಜನೆಗಳು",
    "nav.notifications": "ಸೂಚನೆಗಳು",
    "nav.profile": "ಪ್ರೊಫೈಲ್",
    "nav.ai_assistant": "ಎಐ ಸಹಾಯಕ",
    "greeting": "ಮತ್ತೆ ಸ್ವಾಗತ",
    "pending_bills": "ಬಾಕಿ ಇರುವ ಬಿಲ್‌ಗಳು",
    "unread_notifications": "ಓದದ ಸೂಚನೆಗಳು",
    "recent_activity": "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState("en");

  const t = (key: string) => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
