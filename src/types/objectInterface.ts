export interface Vector {
    x: number;                  //x, y and z coordinates for the object
    y: number;
    z?: number;
}

export interface Orientation {
    angle: number;              // may be updated later
}

export interface Object {
    id: string;
    type?: string;
    mass: string;
    position: Vector;
    velocity?: Vector;
    acceleration?: Vector;
    orientation?: Orientation;
    angular_velocity: number;
    width?: number;
    height?: number;
}