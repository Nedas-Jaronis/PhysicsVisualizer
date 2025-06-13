export interface accelerationField {
    positions : {
        point : [number, number, number];
        acceleration: [number, number, number];
    }[];
}

export interface electricField {
    charge_source: number;
    position_source: [number, number, number];
    observation_point: [number, number, number];
}

export interface FluidFlowField {
  fluid_type: "water" | "air" | "oil" | "other";
  velocity_vectors: {
    location: [number, number, number];
    velocity: [number, number, number];
  }[];
  density?: number;   // in kg/m^3 (optional)
  viscosity?: number; // in Pa·s (optional)
}

export interface fluidVelocityField {
  positions: {
    point: [number, number, number];
    velocity: [number, number, number];
  }[];
}

export interface potentialField {
  type: "gravitational" | "electric";
  source_strength: number;
  position_source: [number, number, number];
  observation_point: [number, number, number];
}

export interface gravitationalField {
  mass_source: number;
  position_source: [number, number, number];
  observation_point: [number, number, number];
  G?: number;
}

export interface magneticField {
  current: number;
  position_wire: [number, number, number];
  observation_point: [number, number, number];
  mu_0?: number;
}

export interface ForceField {
  positions: {
    point: [number, number, number];
    force: [number, number, number];
  }[];
}

export interface PressureField {
  fluid_density: number;
  gravity?: number;
  depth: number;
}

export interface TemperatureField {
  positions: {
    point: [number, number, number];
    temperature: number;
  }[];
}

