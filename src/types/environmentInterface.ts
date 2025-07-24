export interface Incline {
  id: string;
  type: "incline";
  angle: number; // 0 to 90
  position: {
    x: number;
    y: number;
    z?: number; // default 0
  };
  length: number;
  width?: number;
  friction: {
    static?: number;
    kinetic: number;
  };
  material?: string;
}


export interface Ground {
  id: string;
  type: "ground";
  position: {
    x: number;
    y: number;
    z?: number; // default 0
  };
  width: number;
  height?: number; // default 1
  friction: {
    static?: number;
    kinetic: number;
  };
  material?: string;
}

export interface Cliff {
  id: string;
  type: "cliff";
  position: {
    x: number;
    y: number;
    z?: number; // default 0
  };
  height: number;
  width: number;
  edgeType?: "sharp" | "rounded";
  material?: string;
  edge?: string;
}

export interface Wall {
  id: string;
  type: "wall";
  position: {
    x: number;
    y: number;
    z?: number; // default 0
  };
  height: number;
  width: number;
  thickness?: number; // default 0.5
  material?: string;
  isReflective?: boolean; // default false
  edge?: string;
}


export interface PulleySystem {
  id: string;
  type: "pulley";

  position: {
    x: number;
    y: number;
    z?: number;
  };

  radius: number;

  masslessString?: boolean;
  frictionlessPulley?: boolean;

  blocks: Block[];

  stringLength?: number;

  supports?: Support[];
}

export interface Block {
  id: string;
  mass: number;
  position: {
    x: number;
    y: number;
  };
  initialVelocity?: number;
  color?: string;
}

export interface Support {
  position: {
    x: number;
    y: number;
  };
  length: number;
  thickness?: number;
  material?: string;
}



export interface ConstraintEnvironment {
  type: "constraint";
  constraints: Constraint[];
}

export interface Constraint {
  id: string;
  bodies: string[];
  constraintType: "rope" | "spring" | "pulleyRope" | "rod";
  massless: boolean;
  length: number;
  stiffness: number;
  damping?: number;
  pulleyId?: string | null;
  breakForce?: number | null;
  description?: string;
  solid?: boolean;
}


export interface Pendulum {
  id: string; // Unique identifier for the pendulum
  type: "pendulum";

  pivot: {
    x: number;
    y: number;
    z?: number; // Optional for 3D applications
  };

  arm: {
    length: number; // In meters
    thickness?: number; // Optional width of rod or string
    flexible?: boolean; // Whether it's a rigid rod or flexible string
    material?: string; // Optional material name
  };

  bob: {
    mass: number; // In kilograms
    radius?: number; // For rendering the bob
    color?: string;
  };

  initialAngle?: number; // In radians, from vertical downward
  damping?: number; // Optional damping coefficient
  gravity?: number; // Local gravity override (m/s^2)

  constraints?: {
    maxSwingAngle?: number; // Optional swing limits
    fixedLength?: boolean; // If true, pendulum length doesn't change
  };
}
