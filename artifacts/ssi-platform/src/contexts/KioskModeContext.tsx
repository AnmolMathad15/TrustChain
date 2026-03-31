import React, { createContext, useContext, useState, ReactNode } from "react";

type KioskModeContextType = {
  isKioskMode: boolean;
  setKioskMode: (isKiosk: boolean) => void;
};

const KioskModeContext = createContext<KioskModeContextType | undefined>(undefined);

export const KioskModeProvider = ({ children }: { children: ReactNode }) => {
  const [isKioskMode, setKioskMode] = useState(false);

  return (
    <KioskModeContext.Provider value={{ isKioskMode, setKioskMode }}>
      {children}
    </KioskModeContext.Provider>
  );
};

export const useKioskMode = () => {
  const context = useContext(KioskModeContext);
  if (!context) {
    throw new Error("useKioskMode must be used within a KioskModeProvider");
  }
  return context;
};
