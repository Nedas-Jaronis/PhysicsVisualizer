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
}


export interface Incline {
  id: string;
  type: "incline";
  angle: number;
  position: {
    x: number;
    y: number;
    z?: number;
  };
  length: number;
  width?: number;
  friction: {
    static?: number;
    kinetic: number;
  };
  material?: string;
}
