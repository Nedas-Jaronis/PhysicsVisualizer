export interface buoyancy {
    type: buoyancy;
    object: string;
    fluidDensity: number;
    submergedVolume: number;
    gravityAcceleration?: number;
}

export interface collision {
    type: "collision";
    objectA: string;
    objectB: string;
    coefficientOfRestitution?: number;
    contactPoint?: [number, number, number]; 
}

export interface dragForce {
    type: "drag_force";
    object: string;
    dragCoefficient: number;
    fluidDensity: number;
    referenceArea: number;
    velocity: [number, number, number]
}

export interface electroStatic {
    type: "electrostatic_force";
    chargeA: string;
    chargeB: string;
    chargeValueA: number;
    chargeValueB: number;
    permittivity?:number;
}

export interface friction {
    type: "friction";
    objectA: string;
    objectB: string;
    staticCoefficient?: number;
    kineticCoefficient?: number;
    frictionDirection?: [number, number, number];
}

export interface gravity {
    type: "gravity";
    objects: string[];
    gravityConstant?: number;
    direction?: [number, number, number];
}

export interface magneticForce {
    type: "magnetic_force";
    magnetA: string;
    magnetB: string;
    magneticMomentA: [number, number, number];
    magneticMomentB: [number, number, number];
    fieldStrength?: number;
}

export interface normalForce {
    type: "normal_force";
    objectA: string;
    objectB: string;
    forceMagnitude: number;
    direction: [number, number, number];
}

export interface springForce {
    type: "spring_force";
    objectA: string;
    objectB: string;
    springConstant: number;
    restLength: number;
    dampingCoefficient?: number;
}

export interface tension {
    type: "tension";
    objectA: string;
    objectB: string;
    tensionMagnitude: number;
    direction: [number, number, number];
}

