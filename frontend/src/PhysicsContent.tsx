import React, { createContext, useContext, useState, ReactNode } from "react";

interface PhysicsContextType {
  solution: string;
  stepByStep: string;
  formulas: string;
  problem: string;
  animation_data: any;
  setSolution: (solution: string) => void;
  setStepByStep: (stepByStep: string) => void;
  setFormulas: (formulas: string) => void;
  setProblem: (problem: string) => void;
  setAnimationData: (animation_data: any) => void;
}

const PhysicsContext = createContext<PhysicsContextType | undefined>(undefined);

export const PhysicsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [solution, setSolution] = useState<string>("");
  const [stepByStep, setStepByStep] = useState<string>("");
  const [formulas, setFormulas] = useState<string>("");
  const [problem, setProblem] = useState<string>("");
  const [animation_data, setAnimationData] = useState<any>({});

  const value: PhysicsContextType = {
    solution,
    stepByStep,
    formulas,
    problem,
    animation_data,
    setSolution,
    setStepByStep,
    setFormulas,
    setProblem,
    setAnimationData,
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