export interface Vector {
    x: number;                  //x, y and z coordinates for the object
    y: number;
    z?: number;
}

export interface translation {
    initialPosition: Vector;
    initialVelocity: Vector;
    acceleration: Vector;
}

export interface rotation {
    initialAngle: number;
    initialAngularVelocity: number;
    angularAcceleration: number;
    axis: Vector;
}

export interface CombinedTransRotMotion {
    type: "combined_trans_rot_motion";
    objectId: string;
    translation: translation;
    rotation: rotation;
    startTime?: number;
    referenceFrameId?: string;
}

export interface DampedOscillation {
    type: "dampedOscillation";
    objectId: string;
    mass: number;
    direction: string;
    springConstant: number;
    dampingCoefficient: number;
    initialDisplacement: number;
    initialVelocity: Vector;
    startTime?: number;
    referenceFrameID?: number;
}

export interface LinearMotion {
    type: "linear";
    initialPosition: Vector;
    initialVelocity: Vector;
    acceleration: Vector;
    time: number;
    objectId?: string;
}

export interface ProjectileMotion2D {
    type: "projectileMotion2D";
    initialPosition: Vector;
    initialVelocity: Vector;
    acceleration: Vector;
    time: number;
}

export interface ProjectileMotion3D {
    type: "projectileMotion3D";
    initialPosition: Vector;
    initialVelocity: Vector;
    acceleration: Vector;
    time: number;
}

export interface RelativeMotion {
    type: "relative";
    objectId: string;
    referenceFrameId: string;
    objectVelocity: Vector;
    referenceFrameVelocity: Vector;
    relativeVelocity: Vector;
    time:number;
}

export interface ResistiveMotion {
    type: "resistive";
    objectId: string;
    initialVelocity: Vector;
    mass: number;
    resistanceCoefficient: number;
    direction: string;
    duration: number;
    externalForce?: number;
}

export interface RotationalMotion {
    type: "rotational";
    objectId: string;
    axis: string;
    angularVelocity: number;
    duration: number;
    initialAngle?: number;
    momentOfInertia?: number;
    torque?: number;
    repeat?: boolean;
}

export interface SimpleHarmonicMotion {
    type: "simpleHarmonic";
    objectId: string;
    amplitude: number;
    angularFrequency: number;
    phase: number;
    mass: number;
    duration: number;
    equilibriumPosition?: number;
}

export interface UniformCircularMotion {
    type: "uniformCircular";
    objectId: string;
    radius: number;
    angularaVelocity: number;
    center: Vector;
    duration: number;
    repeat?: boolean;
    plane?: string;
    initialAngle?: number;
}