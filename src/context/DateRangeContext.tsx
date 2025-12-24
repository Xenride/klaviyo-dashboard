import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DateRangeContextType {
  rangeDays: number;
  setRangeDays: (days: number) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export const DateRangeProvider = ({ children }: { children: ReactNode }) => {
  const [rangeDays, setRangeDays] = useState(30); // Valor por defecto: 30 días

  return (
    <DateRangeContext.Provider value={{ rangeDays, setRangeDays }}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) throw new Error("useDateRange debe usarse dentro de DateRangeProvider");
  return context;
};