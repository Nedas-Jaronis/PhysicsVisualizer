interface Vector {
    x: number;                  //x, y and z coordinates for the object
    y: number;
    z?: number;
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
    application_point?: string;
    angle_of_incline?: number;
    acceleration_due_to_gravity?: number;
}

interface AirResistance extends ForceBase {
    type: "airResistance";
    drag_coefficient: number;
    cross_sectional_area: number;
    velocity: number;
    applied_to: string;
    application_point?: object;
    air_density?: number;
}

interface AppliedForce extends ForceBase {
    type
}