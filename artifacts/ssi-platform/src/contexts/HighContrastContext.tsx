import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

type HighContrastContextType = {
  isHighContrast: boolean;
  setHighContrast: (val: boolean) => void;
};

const HighContrastContext = createContext<HighContrastContextType | undefined>(undefined);

export const HighContrastProvider = ({ children }: { children: ReactNode }) => {
  const [isHighContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("ssi-high-contrast") === "true";
  });

  useEffect(() => {
    localStorage.setItem("ssi-high-contrast", String(isHighContrast));
    if (isHighContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [isHighContrast]);

  return (
    <HighContrastContext.Provider value={{ isHighContrast, setHighContrast }}>
      {children}
    </HighContrastContext.Provider>
  );
};

export const useHighContrast = () => {
  const ctx = useContext(HighContrastContext);
  if (!ctx) throw new Error("useHighContrast must be used within HighContrastProvider");
  return ctx;
};
