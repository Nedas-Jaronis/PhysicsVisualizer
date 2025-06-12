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

interface ForceBase {
    id: string;             //identifier
    applied_to: string;        //what object the force acts on
    application_point?: Vector;     //point of application
    forceType: string;          //discriminator for force type
}

interface GravitaitonalForce extends ForceBase {
    type: "gravitational";
    mass1: number;
    mass2: number;
    distance: number;
    object1_id: string
    object2_id: string
    graviational_constant?: number;
    direction?: string;

}

interface NormalForce extends ForceBase {
    type: "normal";
    mass: number;
    applied_to: number;
    application_point?: Vector;
    angle_of_incline?: number;
    acceleration_due_to_gravity?: number;
}

interface AirResistance extends ForceBase {
    type: "airResistance";
    drag_coefficient: number;
    cross_sectional_area: number;
    velocity: Vector;
    applied_to: string;
    application_point?: Vector;
    air_density?: number;
}

interface AppliedForce extends ForceBase {
    type: "applied";
    magnitude: number;
    direction: string;
    applied_to: string;
    application_point?: Vector;
    angle?:number;
}

interface BuoyantForce extends ForceBase {
    type: "buoyant";
    fluid_density: number;
    volume_displaced: number;
    applied_to: string;
    application_point?: Vector;
    gravity?: number;
}

interface CentripetalForce extends ForceBase {
    type: "centripetal";
    mass: number;
    velocity: Vector;
    radius: number;
    applied_to: string;
    application_point?: Vector;
}

interface CoriolisForce extends ForceBase {
    type: "coriolis";
    mass: number;
    velocity: Vector;
    angular_velocity: number;
    applied_to: string;
    application_point?: Vector;
}

interface ElectricForce extends ForceBase {
    type: "electric";
    charge1: number;
    charge2: number;
    distance: number;
    object1_id: string;
    object2_id: string;
    k_e?: number;
}

interface FrictionForce extends ForceBase {
    type: "friction";
    normal_force: number;
    coefficient_of_friction: number;
    applied_to: string;
    frictionType: string;
    applicationPoint?: Vector;
}

interface LiftThrustForce extends ForceBase {
    type: "liftThrust";
    lift: number;
    thrust: number;
}

interface MagneticForce extends ForceBase {
    type: "magnetic";
    charge: number;
    velocity: Vector;
    magnetic_fields: number;
    angle: number;
}

interface NetForce extends ForceBase {
    type: "net";
    forces: ForceVector[];
    applied_to: string;
    application_point?: Vector;
}

interface SpringForce extends ForceBase {
    type: "spring";
    spring_constant: number;
    displacement: number;
    applied_to: string;
    application_point?: Vector;
}

interface TensionForce extends ForceBase {
    type: "tension";
    mass: number;
    applied_to: string;
    application_point?: Vector
    gravity?: number;
    acceleration?: number;
}

interface Torque extends ForceBase {
    type: "torque";
    force: number;
    lever_arm: number;
    angle: number;
    applied_to:string;
    application_point?: Vector;
}
