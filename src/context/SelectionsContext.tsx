import React, { createContext, useContext, useState, useEffect } from 'react';

interface Selections {
  categories: string[];
  geographies: string[];
}

interface SelectionsContextType {
  selections: Selections;
  setSelections: (selections: Selections) => void;
}

const SelectionsContext = createContext<SelectionsContextType | undefined>(undefined);

export const SelectionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selections, setSelections] = useState<Selections>({
    categories: [],
    geographies: []
  });

  // Listen for selection events from the extractor UI
  useEffect(() => {
    const handleSelections = (event: CustomEvent<Selections>) => {
      console.log('Received selections:', event.detail);
      setSelections(event.detail);
    };

    window.addEventListener('extractorSelections', handleSelections as any);
    return () => window.removeEventListener('extractorSelections', handleSelections as any);
  }, []);

  return (
    <SelectionsContext.Provider value={{ selections, setSelections }}>
      {children}
    </SelectionsContext.Provider>
  );
};

export const useSelections = () => {
  const context = useContext(SelectionsContext);
  if (context === undefined) {
    throw new Error('useSelections must be used within a SelectionsProvider');
  }
  return context;
};
