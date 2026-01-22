export interface Vector {
  x: number;
  y: number;
}

export interface Vector3D extends Vector {
  z?: number;
}


export interface Orientation {
    angle: number;              // may be updated later
}

export interface Object {
  id: string;
  type?: 'circle' | 'polygon' | 'rectangle' | 'trapezoid' | 'fromvertices';
  mass: number;

  width?: number;
  height?: number;
  radius?: number;
  sides?: number;
  slope?: number;

  position: Vector3D;
  velocity?: Vector3D;
  acceleration?: Vector3D;
  orientation?: { angle: number };
  angular_velocity?: number;

  onCliff?: boolean;
  onIncline?: boolean;
  inclinePositionRatio?: number;

  options: {
    isStatic?: boolean;
    friction?: number;
    restitution?: number;
    angle?: number;
    render?: {
      fillStyle?: string;
      strokeStyle?: string;
      lineWidth?: number;
    };
  };
  
  vertexSet?: Vector[];
}
