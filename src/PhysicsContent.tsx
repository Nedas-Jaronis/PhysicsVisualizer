// PhysicsContext.tsx
import React, { createContext, useContext, useState } from "react";

type PhysicsData = {
  problem: string;
  solution: string;
  formulas: string;
  step_by_step: string;
  setPhysicsData: (data: Partial<PhysicsData>) => void;
};

const defaultData: PhysicsData = {
  problem: "",
  solution: "",
  formulas: "",
  step_by_step: "",
  setPhysicsData: () => {},
};

const PhysicsContext = createContext<PhysicsData>(defaultData);

export const PhysicsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Omit<PhysicsData, "setPhysicsData">>({
    problem: "",
    solution: "",
    formulas: "",
    step_by_step: "",
  });

  const setPhysicsData = (newData: Partial<PhysicsData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  return (
    <PhysicsContext.Provider value={{ ...data, setPhysicsData }}>
      {children}
    </PhysicsContext.Provider>
  );
};

export const usePhysics = () => useContext(PhysicsContext);
