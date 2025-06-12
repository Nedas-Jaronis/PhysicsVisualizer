interface Vector {
    x: number;                  //x, y and z coordinates for the object
    y: number;
    z?: number;
}

interface ForceVector {
    magnitude: number;
    angle: number;
}

//Forces

interface GravitaitonalForce {
    type: "gravitational";
    mass1: number;
    mass2: number;
    distance: number;
    object1_id: string
    object2_id: string
    graviational_constant?: number;
    direction?: string;

}

interface NormalForce {
    type: "normal";
    mass: number;
    applied_to: number;
    application_point?: Vector;
    angle_of_incline?: number;
    acceleration_due_to_gravity?: number;
}

interface AirResistance {
    type: "airResistance";
    drag_coefficient: number;
    cross_sectional_area: number;
    velocity: Vector;
    applied_to: string;
    application_point?: Vector;
    air_density?: number;
}

interface AppliedForce {
    type: "applied";
    magnitude: number;
    direction: string;
    applied_to: string;
    application_point?: Vector;
    angle?:number;
}

interface BuoyantForce {
    type: "buoyant";
    fluid_density: number;
    volume_displaced: number;
    applied_to: string;
    application_point?: Vector;
    gravity?: number;
}

interface CentripetalForce {
    type: "centripetal";
    mass: number;
    velocity: Vector;
    radius: number;
    applied_to: string;
    application_point?: Vector;
}

interface CoriolisForce {
    type: "coriolis";
    mass: number;
    velocity: Vector;
    angular_velocity: number;
    applied_to: string;
    application_point?: Vector;
}

interface ElectricForce {
    type: "electric";
    charge1: number;
    charge2: number;
    distance: number;
    object1_id: string;
    object2_id: string;
    k_e?: number;
}

interface FrictionForce {
    type: "friction";
    normal_force: number;
    coefficient_of_friction: number;
    applied_to: string;
    frictionType: string;
    applicationPoint?: Vector;
}

interface LiftThrustForce {
    type: "liftThrust";
    lift: number;
    thrust: number;
}

interface MagneticForce {
    type: "magnetic";
    charge: number;
    velocity: Vector;
    magnetic_fields: number;
    angle: number;
}

interface NetForce {
    type: "net";
    forces: ForceVector[];
    applied_to: string;
    application_point?: Vector;
}

interface SpringForce {
    type: "spring";
    spring_constant: number;
    displacement: number;
    applied_to: string;
    application_point?: Vector;
}

interface TensionForce {
    type: "tension";
    mass: number;
    applied_to: string;
    application_point?: Vector
    gravity?: number;
    acceleration?: number;
}

interface Torque {
    type: "torque";
    force: number;
    lever_arm: number;
    angle: number;
    applied_to:string;
    application_point?: Vector;
}
