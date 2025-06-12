import { NumberLiteralType } from "typescript";

interface Vector {
    x: number;                  //x, y and z coordinates for the object
    y: number;
    z?: number;
}

interface translation {
    initialPosition: Vector;
    initialVelocity: Vector;
    acceleration: Vector;
}

interface rotation {
    initialAngle: number;
    initialAngularVelocity: number;
    angularAcceleration: number;
    axis: Vector;
}

interface CombinedTransRotMotion {
    type: "combined_trans_rot_motion";
    objectID: string;
    translation: translation;
    rotation: rotation;
    startTime?: number;
    referenceFrameId?: string;
}

interface DampedOscillation {
    type: "dampedOscillation";
    objectId: string;
    mass: number;
    springConstant: number;
    dampingCoefficient: number;
    initialDisplacement: number;
    initialVelocity: Vector;
    startTime?: number;
    referenceFrameID?: number;
}

interface LinearMotion {
    type: "linear";
    initialPosition: Vector;
    initialVelocity: Vector;
    acceleration: Vector;
    time: number;
    id?: string;
}

interface ProjectileMotion2D {
    type: "projectileMotion2D";
    initialPosition: Vector;
    initialVelocity: Vector;
    acceleration: Vector;
    time: number;
}

interface ProjectileMotion3D {
    type: "projectileMotion3D";
    initialPosition: Vector;
    initialVelocity: Vector;
    acceleration: Vector;
    time: number;
}

interface RelativeMotion {
    type: "relative";
    objectId: string;
    referenceFrameId: string;
    objectVelocity: Vector;
    referenceFrameVelocity: Vector;
    relativeVelocity: Vector;
    time:number;
}

interface ResistiveMotion {
    type: "resistive";
    objectId: string;
    initialVelocity: Vector;
    mass: number;
    resistanceCoefficient: number;
    direction: string;
    duration: number;
    externalForce?: number;
}

interface RotationalMotion {
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

interface SimpleHarmonicMotion {
    type: "simpleHarmonic";
    objectId: string;
    amplitude: number;
    angularFrequency: number;
    phase: number;
    mass: number;
    duration: number;
    equilibriumPosition?: number;
}

interface UniformCircularMotion {
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