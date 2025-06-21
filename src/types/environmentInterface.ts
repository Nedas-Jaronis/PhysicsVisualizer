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
}
