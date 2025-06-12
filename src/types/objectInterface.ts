interface Vector {
    x: number;                  //x, y and z coordinates for the object
    y: number;
    z?: number;
}

interface Orientation {
    angle: number;              // may be updated later
}

interface Object {
    id: string;
    type?: string;
    mass: string;
    position: Vector;
    velocity?: Vector;
    acceleration?: Vector;
    orientation?: Orientation;
    angular_velocity: number;
}