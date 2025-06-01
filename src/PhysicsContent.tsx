import React, { createContext, useContext, useState, ReactNode } from "react";

interface PhysicsContextType {
  solution: string;
  step_by_step: string;
  formulas: string;
  animation_data: any;
  num_motions: number;
  setSolution: (solution: string) => void;
  setStepByStep: (step_by_step: string) => void;
  setFormulas: (formulas: string) => void;
  setAnimationData: (animation_data: any) => void;
  setNumMotions: (num_motions: number) => void;
}

// Fix: Properly create the context with undefined as default
const PhysicsContext = createContext<PhysicsContextType | undefined>(undefined);

export const PhysicsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [solution, setSolution] = useState<string>("");
  const [step_by_step, setStepByStep] = useState<string>("");
  const [formulas, setFormulas] = useState<string>("");
  const [animation_data, setAnimationData] = useState<any>({});
  const [num_motions, setNumMotions] = useState<number>(0);

  const value: PhysicsContextType = {
    solution,
    step_by_step,
    formulas,
    animation_data,
    num_motions,
    setSolution,
    setStepByStep,
    setFormulas,
    setAnimationData,
    setNumMotions,
  };

  return (
    <PhysicsContext.Provider value={value}>
      {children}
    </PhysicsContext.Provider>
  );
};

export const usePhysics = (): PhysicsContextType => {
  const context = useContext(PhysicsContext);
  if (context === undefined) {
    throw new Error("usePhysics must be used within a PhysicsProvider");
  }
  return context;
};