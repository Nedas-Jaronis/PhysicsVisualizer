import { useEffect, useState, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { usePhysics } from "./PhysicsContent";
import {
  PhysicsScene,
  ControlPanel,
  PhysicsParams,
  defaultParams,
  PhysicsBox,
  PhysicsSphere,
  Ground,
  Ramp,
  Pendulum,
  Wall,
  Cliff,
  BankedCurve,
  Car,
  StraightRoad,
  LinearCar,
  MassSpringSystem,
  CircularMotionString,
  HorizontalPush,
  Elevator,
  TwoRopeTension,
  AtwoodMachine,
  TablePulley,
  TorqueDemo,
  Seesaw,
  EnhancedCollision,
  PoweredLift,
  EnergyRamp,
  RollingIncline,
  TransverseWave,
  StandingWave,
  BuoyancyDemo,
  DopplerEffect,
  AngularMomentumDemo,
  SatelliteOrbit,
  WaveSuperposition,
  FBDOverlay
} from "./physics3d";

// Deep search for a value in nested object
function deepFind(obj: any, keys: string[]): any {
  if (!obj || typeof obj !== 'object') return undefined;

  for (const key of keys) {
    if (obj[key] !== undefined) return obj[key];
  }

  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      const found = deepFind(value, keys);
      if (found !== undefined) return found;
    }
  }

  return undefined;
}

// Safely convert a value to a number, returning undefined if not possible
function toNumber(val: any): number | undefined {
  if (val === undefined || val === null) return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
}

// Extract physics values from animation_data
function extractPhysicsParams(animationData: any): Partial<PhysicsParams> {
  if (!animationData) return {};

  console.log("Raw animation_data:", JSON.stringify(animationData, null, 2));

  const params: Partial<PhysicsParams> = {};

  // Extract from objects array
  const objects = animationData.objects || [];
  if (objects.length > 0) {
    const obj = objects[0]; // Primary object
    console.log("Primary object:", obj);

    // Mass
    const mass = toNumber(obj.mass);
    if (mass !== undefined) params.mass = mass;

    // Position - check multiple possible field names
    const pos = obj.position || obj.initialPosition || {};
    const posX = toNumber(pos.x);
    const posY = toNumber(pos.y);
    const posZ = toNumber(pos.z);
    if (posX !== undefined) params.initialPositionX = posX;
    if (posY !== undefined) params.initialPositionY = Math.max(posY, 0.5);
    if (posZ !== undefined) params.initialPositionZ = posZ;

    // Velocity - check multiple possible field names
    const vel = obj.velocity || obj.initialVelocity || {};
    const velX = toNumber(vel.x);
    const velY = toNumber(vel.y);
    const velZ = toNumber(vel.z);
    if (velX !== undefined) params.initialVelocityX = velX;
    if (velY !== undefined) params.initialVelocityY = velY;
    if (velZ !== undefined) params.initialVelocityZ = velZ;

    // Options
    if (obj.options) {
      const optFriction = toNumber(obj.options.friction);
      const optRestitution = toNumber(obj.options.restitution);
      if (optFriction !== undefined) params.friction = optFriction;
      if (optRestitution !== undefined) params.restitution = optRestitution;
    }

    // Direct friction/restitution on object
    const objFriction = toNumber(obj.friction);
    const objRestitution = toNumber(obj.restitution);
    if (objFriction !== undefined) params.friction = objFriction;
    if (objRestitution !== undefined) params.restitution = objRestitution;
  }

  // Extract from motions array for velocity and angle info
  const motions = animationData.motions || [];
  for (const motion of motions) {
    console.log("Motion data:", motion);

    // Check for initial velocity in motion data
    if (motion.initialVelocity) {
      const iv = motion.initialVelocity;
      const ivX = toNumber(iv.x);
      const ivY = toNumber(iv.y);
      const ivZ = toNumber(iv.z);
      if (ivX !== undefined) params.initialVelocityX = ivX;
      if (ivY !== undefined) params.initialVelocityY = ivY;
      if (ivZ !== undefined) params.initialVelocityZ = ivZ;
    }

    // Direct velocity fields
    const motionVel = toNumber(motion.velocity);
    if (motionVel !== undefined) {
      params.initialVelocityY = motionVel;
    }

    const initialSpeed = toNumber(motion.initialSpeed);
    if (initialSpeed !== undefined) {
      const angle = toNumber(motion.angle) || toNumber(motion.launchAngle) || 0;
      if (angle > 0) {
        const angleRad = (angle * Math.PI) / 180;
        params.initialVelocityX = initialSpeed * Math.cos(angleRad);
        params.initialVelocityY = initialSpeed * Math.sin(angleRad);
      } else {
        params.initialVelocityY = initialSpeed;
      }
    }

    const speed = toNumber(motion.speed);
    if (speed !== undefined) {
      const angle = toNumber(motion.angle) || toNumber(motion.launchAngle) || 0;
      if (angle > 0) {
        const angleRad = (angle * Math.PI) / 180;
        params.initialVelocityX = speed * Math.cos(angleRad);
        params.initialVelocityY = speed * Math.sin(angleRad);
      } else {
        params.initialVelocityY = speed;
      }
    }

    // Initial position from motion
    if (motion.initialPosition) {
      const ip = motion.initialPosition;
      const ipX = toNumber(ip.x);
      const ipY = toNumber(ip.y);
      const ipZ = toNumber(ip.z);
      if (ipX !== undefined) params.initialPositionX = ipX;
      if (ipY !== undefined) params.initialPositionY = Math.max(ipY, 0.5);
      if (ipZ !== undefined) params.initialPositionZ = ipZ;
    }

    // Pendulum parameters
    const pendLength = toNumber(motion.length) || toNumber(motion.pendulumLength);
    if (pendLength !== undefined) params.pendulumLength = pendLength;
    const pendAngle = toNumber(motion.initialAngle);
    if (pendAngle !== undefined) params.pendulumAngle = pendAngle;

    // Spring parameters
    const springK = toNumber(motion.springConstant) || toNumber(motion.stiffness);
    if (springK !== undefined) params.springStiffness = springK;
    const springDamp = toNumber(motion.damping);
    if (springDamp !== undefined) params.springDamping = springDamp;
  }

  // Extract from environments for ramp angle and other setup
  const environments = animationData.environments || [];
  for (const env of environments) {
    const envAngle = toNumber(env.angle) || toNumber(env.inclineAngle);
    if (envAngle !== undefined) params.rampAngle = envAngle;
    const envFriction = toNumber(env.friction);
    if (envFriction !== undefined) params.friction = envFriction;
  }

  // Extract from forces for gravity modifications
  const forces = animationData.forces || [];
  for (const force of forces) {
    const grav = toNumber(force.gravity) || toNumber(force.g);
    if (grav !== undefined) params.gravity = grav;
  }

  // Deep search fallback - look for any velocity-like values in the entire structure
  if (params.initialVelocityY === undefined || params.initialVelocityY === 0) {
    const foundVelY = toNumber(deepFind(animationData, ['vy', 'velocityY', 'initial_velocity_y', 'v0y', 'v_y']));
    if (foundVelY !== undefined) {
      params.initialVelocityY = foundVelY;
    }
  }

  // Look for speed/velocity as a single number (for problems like "thrown at 20 m/s")
  const foundSpeed = toNumber(deepFind(animationData, ['speed', 'initialSpeed', 'v0', 'velocity', 'v']));
  const foundAngle = toNumber(deepFind(animationData, ['angle', 'launchAngle', 'theta']));

  if (foundSpeed !== undefined) {
    if (foundAngle !== undefined && foundAngle > 0) {
      // Projectile at an angle
      const angleRad = (foundAngle * Math.PI) / 180;
      if (!params.initialVelocityX) params.initialVelocityX = foundSpeed * Math.cos(angleRad);
      if (!params.initialVelocityY) params.initialVelocityY = foundSpeed * Math.sin(angleRad);
    } else if (!params.initialVelocityY) {
      // Vertical throw
      params.initialVelocityY = foundSpeed;
    }
  }

  console.log("Extracted physics params:", params);
  return params;
}

// Determine scene type based on animation data and problem text
function determineSceneType(animationData: any, problem?: string): string {
  if (!animationData && !problem) return 'default';

  const motions = animationData?.motions || [];
  const environments = animationData?.environments || [];
  const interactions = animationData?.interactions || [];
  const forces = animationData?.forces || [];

  // Convert to lowercase strings for easier matching
  const motionStr = JSON.stringify(motions).toLowerCase();
  const envStr = JSON.stringify(environments).toLowerCase();
  const interactionStr = JSON.stringify(interactions).toLowerCase();
  const forceStr = JSON.stringify(forces).toLowerCase();
  const wavesStr = JSON.stringify(animationData?.waves || []).toLowerCase();
  const lowerProblem = (problem || '').toLowerCase();

  // --- NEW SCENE TYPE DETECTION ---

  // Check for wave superposition / interference / beats
  if (lowerProblem.includes('superposition') || lowerProblem.includes('interference') ||
      lowerProblem.includes('constructive') || lowerProblem.includes('destructive') ||
      lowerProblem.includes('beats') || wavesStr.includes('wavesuperposition')) {
    return 'wave_superposition';
  }

  // Check for standing wave / harmonics
  if (lowerProblem.includes('standing wave') || lowerProblem.includes('harmonic') ||
      lowerProblem.includes('node') || lowerProblem.includes('antinode') ||
      lowerProblem.includes('resonan') || wavesStr.includes('standingwave')) {
    return 'standing_wave';
  }

  // Check for Doppler effect
  if (lowerProblem.includes('doppler') || lowerProblem.includes('siren') ||
      (lowerProblem.includes('moving source') && lowerProblem.includes('frequen')) ||
      (lowerProblem.includes('approaching') && lowerProblem.includes('sound')) ||
      wavesStr.includes('dopplereffect')) {
    return 'doppler';
  }

  // Check for transverse wave
  if ((lowerProblem.includes('wave') && (lowerProblem.includes('transverse') || lowerProblem.includes('string wave'))) ||
      (lowerProblem.includes('amplitude') && lowerProblem.includes('wavelength')) ||
      wavesStr.includes('transversewave')) {
    return 'transverse_wave';
  }

  // Check for energy conservation on ramp
  if ((lowerProblem.includes('energy') && (lowerProblem.includes('conserv') || lowerProblem.includes('ramp') || lowerProblem.includes('incline'))) ||
      (lowerProblem.includes('work-energy') || lowerProblem.includes('work energy')) ||
      (lowerProblem.includes('kinetic energy') && lowerProblem.includes('potential energy')) ||
      motionStr.includes('energyconservation')) {
    return 'energy_ramp';
  }

  // Check for rolling on incline
  if ((lowerProblem.includes('roll') && (lowerProblem.includes('incline') || lowerProblem.includes('ramp') || lowerProblem.includes('hill'))) ||
      lowerProblem.includes('rolls without slipping') ||
      (lowerProblem.includes('moment of inertia') && (lowerProblem.includes('incline') || lowerProblem.includes('ramp'))) ||
      motionStr.includes('rollingmotion')) {
    return 'rolling_incline';
  }

  // Check for buoyancy
  if (lowerProblem.includes('buoyan') || lowerProblem.includes('float') ||
      lowerProblem.includes('sink') || lowerProblem.includes('submerge') ||
      lowerProblem.includes('archimedes') || lowerProblem.includes('fluid density')) {
    return 'buoyancy';
  }

  // Check for angular momentum conservation
  if ((lowerProblem.includes('angular momentum') && lowerProblem.includes('conserv')) ||
      lowerProblem.includes('figure skater') ||
      (lowerProblem.includes('spinning') && lowerProblem.includes('radius'))) {
    return 'angular_momentum';
  }

  // Check for satellite orbit
  if (lowerProblem.includes('satellite') || lowerProblem.includes('orbit') ||
      (lowerProblem.includes('planet') && lowerProblem.includes('gravitational') && lowerProblem.includes('circular'))) {
    return 'satellite_orbit';
  }

  // Check for horizontal push with friction
  if (lowerProblem.includes('push') &&
      (lowerProblem.includes('friction') || lowerProblem.includes('surface'))) {
    return 'horizontal_push';
  }

  // Check for elevator/apparent weight
  if (lowerProblem.includes('elevator') ||
      (lowerProblem.includes('scale') && lowerProblem.includes('accelerat'))) {
    return 'elevator';
  }

  // Check for two-rope tension
  if ((lowerProblem.includes('rope') || lowerProblem.includes('string')) &&
      lowerProblem.includes('hang') &&
      (lowerProblem.includes('angle') || lowerProblem.includes('two'))) {
    return 'rope_tension';
  }

  // Check for Atwood machine
  if (lowerProblem.includes('atwood') ||
      (lowerProblem.includes('pulley') && lowerProblem.match(/two\s*(?:hanging\s*)?masses/i))) {
    return 'atwood';
  }

  // Check for table-edge pulley
  if (lowerProblem.includes('pulley') &&
      (lowerProblem.includes('table') || lowerProblem.includes('edge'))) {
    return 'table_pulley';
  }

  // Check for torque/door problems
  if (lowerProblem.includes('torque') ||
      (lowerProblem.includes('door') && lowerProblem.includes('push'))) {
    return 'torque';
  }

  // Check for seesaw/lever equilibrium
  if (lowerProblem.includes('seesaw') || lowerProblem.includes('lever') ||
      (lowerProblem.includes('balance') && lowerProblem.includes('pivot'))) {
    return 'seesaw';
  }

  // Check for mass-spring oscillation
  if (lowerProblem.match(/mass[\s-]*spring/i) ||
      (lowerProblem.includes('spring') && lowerProblem.includes('oscillat'))) {
    return 'mass_spring';
  }

  // Check for circular motion on string
  if (lowerProblem.includes('whirl') ||
      (lowerProblem.includes('string') && lowerProblem.includes('circle')) ||
      (lowerProblem.includes('mass') && lowerProblem.includes('radius') && lowerProblem.includes('m/s'))) {
    return 'circular_string';
  }

  // Check for collision with impulse
  if (lowerProblem.includes('impulse') ||
      (lowerProblem.includes('collision') && lowerProblem.includes('cart')) ||
      lowerProblem.includes('caught') || lowerProblem.includes('embeds')) {
    return 'enhanced_collision';
  }

  // Check for powered lift / machine lifting load
  if ((lowerProblem.includes('machine') && lowerProblem.includes('lift')) ||
      (lowerProblem.includes('power') && lowerProblem.includes('lift')) ||
      (lowerProblem.includes('lift') && lowerProblem.includes('load') && lowerProblem.includes('w'))) {
    return 'powered_lift';
  }

  // Check for pendulum
  if (envStr.includes('pendulum') || motionStr.includes('simpleharmonic') ||
      lowerProblem.includes('pendulum')) {
    return 'pendulum';
  }

  // Check for spring/oscillation
  if (forceStr.includes('spring') || motionStr.includes('damped') || motionStr.includes('oscillat') ||
      (lowerProblem.includes('spring') && !lowerProblem.includes('mass-spring'))) {
    return 'spring';
  }

  // Check for banked curve (circular motion on banked track)
  if (envStr.includes('banked') || (motionStr.includes('circular') && envStr.includes('curve'))) {
    return 'banked_curve';
  }

  // Check for circular motion
  if (motionStr.includes('circular') || forceStr.includes('centripetal')) {
    return 'circular';
  }

  // Check for pulley system
  if (envStr.includes('pulley') || interactionStr.includes('tension')) {
    return 'pulley';
  }

  // Check for incline
  if (envStr.includes('incline') || lowerProblem.includes('ramp') || lowerProblem.includes('incline')) {
    return 'incline';
  }

  // Check for collision
  if (interactionStr.includes('collision') || lowerProblem.includes('collision')) {
    return 'collision';
  }

  // Check for projectile motion (2D or 3D)
  if (motionStr.includes('projectile') || lowerProblem.includes('projectile')) {
    return 'projectile';
  }

  // Check for linear/freefall motion
  if (motionStr.includes('linear')) {
    return 'freefall';
  }

  // Check for rotational motion
  if (motionStr.includes('rotational') || forceStr.includes('torque')) {
    return 'rotation';
  }

  // Default to projectile for thrown objects (like ball thrown up)
  const objects = animationData?.objects || [];
  for (const obj of objects) {
    const vel = obj.velocity || obj.initialVelocity || {};
    if (vel.y > 0 || vel.x !== 0) {
      return 'projectile';
    }
  }

  // Check if there's any motion that implies throwing
  if (animationData) {
    const foundSpeed = deepFind(animationData, ['speed', 'initialSpeed', 'v0', 'velocity']);
    if (foundSpeed !== undefined && typeof foundSpeed === 'number' && foundSpeed > 0) {
      return 'projectile';
    }
  }

  return 'freefall'; // Default to freefall (dropping an object)
}

const Third: React.FC = () => {
  const navigate = useNavigate();
  const { stepByStep, animation_data, problem } = usePhysics();

  const [visible, setVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [key, setKey] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [activeTimeScale, setActiveTimeScale] = useState(1); // Only updates on Replay
  const [liveData, setLiveData] = useState<{
    position?: { x: number; y: number; z: number };
    velocity?: { x: number; y: number; z: number };
    time?: number;
  }>({});

  // Check problem text for special keywords and extract values
  const problemAnalysis = useMemo(() => {
    if (!problem) return { overrides: {}, hasCliff: false, cliffHeight: 0, isHorizontalThrow: false, isBankedCurve: false };
    const lowerProblem = problem.toLowerCase();
    const overrides: Partial<PhysicsParams> = {};

    // Check for frictionless
    if (lowerProblem.includes('frictionless') || lowerProblem.includes('no friction') || lowerProblem.includes('without friction')) {
      overrides.friction = 0;
    }

    // Check for elastic collision
    if (lowerProblem.includes('elastic') && lowerProblem.includes('collision')) {
      overrides.restitution = 1;
    }

    // Check for inelastic collision
    if (lowerProblem.includes('inelastic') || lowerProblem.includes('perfectly inelastic')) {
      overrides.restitution = 0;
    }

    // Check for banked curve
    const isBankedCurve = lowerProblem.includes('banked') &&
                          (lowerProblem.includes('curve') || lowerProblem.includes('turn') || lowerProblem.includes('road'));

    // Extract banked curve parameters
    if (isBankedCurve) {
      // Extract radius (e.g., "radius 50 m", "radius of 50m", "50 m radius")
      const radiusPatterns = [
        /radius\s*(?:of|is|=)?\s*(\d+(?:\.\d+)?)\s*m/i,
        /(\d+(?:\.\d+)?)\s*m\s*radius/i,
        /r\s*=\s*(\d+(?:\.\d+)?)\s*m/i
      ];
      for (const pattern of radiusPatterns) {
        const match = problem.match(pattern);
        if (match) {
          overrides.curveRadius = parseFloat(match[1]);
          break;
        }
      }

      // Extract bank angle (e.g., "banked at 20°", "20 degree bank", "θ = 20°")
      const anglePatterns = [
        /banked\s*(?:at)?\s*(\d+(?:\.\d+)?)\s*(?:°|deg)/i,
        /(\d+(?:\.\d+)?)\s*(?:°|deg(?:ree)?s?)\s*(?:bank|angle)/i,
        /bank\s*angle\s*(?:of|is|=)?\s*(\d+(?:\.\d+)?)/i,
        /θ\s*=\s*(\d+(?:\.\d+)?)/i
      ];
      for (const pattern of anglePatterns) {
        const match = problem.match(pattern);
        if (match) {
          overrides.bankAngle = parseFloat(match[1]);
          break;
        }
      }

      // Calculate ideal speed for no-slip: v = sqrt(r * g * tan(θ))
      const r = overrides.curveRadius || 50;
      const theta = overrides.bankAngle || 20;
      const thetaRad = (theta * Math.PI) / 180;
      const idealSpeed = Math.sqrt(r * 9.81 * Math.tan(thetaRad));
      overrides.carSpeed = parseFloat(idealSpeed.toFixed(1));
    }

    // Check for cliff/height scenarios
    const hasCliff = lowerProblem.includes('cliff') || lowerProblem.includes('building') ||
                     lowerProblem.includes('tower') || lowerProblem.includes('rooftop') ||
                     (lowerProblem.includes('high') && lowerProblem.includes('thrown'));

    // Extract height from problem (look for patterns like "20 m high", "50m tall", "height of 30")
    let cliffHeight = 0;
    const heightPatterns = [
      /(\d+(?:\.\d+)?)\s*m(?:eter)?s?\s*(?:high|tall|above|height)/i,
      /height\s*(?:of|is|=)?\s*(\d+(?:\.\d+)?)\s*m/i,
      /(\d+(?:\.\d+)?)\s*m\s*(?:cliff|building|tower)/i,
      /from\s*(?:a\s*)?(\d+(?:\.\d+)?)\s*m/i
    ];
    for (const pattern of heightPatterns) {
      const match = problem.match(pattern);
      if (match) {
        cliffHeight = parseFloat(match[1]);
        break;
      }
    }

    // Check if thrown horizontally
    const isHorizontalThrow = lowerProblem.includes('horizontally') ||
                               lowerProblem.includes('horizontal');

    // If horizontal throw, set vertical velocity to 0
    if (isHorizontalThrow) {
      overrides.initialVelocityY = 0;
    }

    // If we have a cliff height, set initial Y position
    if (cliffHeight > 0) {
      overrides.initialPositionY = cliffHeight;
    }

    // Extract horizontal speed for horizontal throws
    if (isHorizontalThrow) {
      const speedMatch = problem.match(/(?:speed|velocity)\s*(?:of|is|=)?\s*(\d+(?:\.\d+)?)\s*m/i);
      if (speedMatch) {
        overrides.initialVelocityX = parseFloat(speedMatch[1]);
      }
    }

    // Check for linear kinematics (acceleration problems)
    const isLinearKinematics = (lowerProblem.includes('accelerat') &&
                                (lowerProblem.includes('car') || lowerProblem.includes('vehicle') ||
                                 lowerProblem.includes('object') || lowerProblem.includes('starts'))) ||
                               (lowerProblem.includes('from rest') && lowerProblem.includes('accelerat'));

    // Extract kinematics parameters
    if (isLinearKinematics) {
      // Extract acceleration (e.g., "accelerates at 2.5 m/s²", "a = 3 m/s^2")
      const accelPatterns = [
        /accelerat\w*\s*(?:at|of|is|=)?\s*(\d+(?:\.\d+)?)\s*m\/s/i,
        /a\s*=\s*(\d+(?:\.\d+)?)\s*m\/s/i,
        /(\d+(?:\.\d+)?)\s*m\/s\s*[²2]/i
      ];
      for (const pattern of accelPatterns) {
        const match = problem.match(pattern);
        if (match) {
          overrides.acceleration = parseFloat(match[1]);
          break;
        }
      }

      // Extract time (e.g., "for 8 seconds", "t = 5 s")
      const timePatterns = [
        /(?:for|during|over)\s*(\d+(?:\.\d+)?)\s*s(?:ec|econds?)?/i,
        /t\s*=\s*(\d+(?:\.\d+)?)\s*s/i,
        /(\d+(?:\.\d+)?)\s*s(?:ec|econds?)?\s*(?:later|after)/i
      ];
      for (const pattern of timePatterns) {
        const match = problem.match(pattern);
        if (match) {
          overrides.maxTime = parseFloat(match[1]);
          break;
        }
      }

      // Check for "from rest" - initial velocity = 0
      if (lowerProblem.includes('from rest') || lowerProblem.includes('starts from rest')) {
        overrides.initialVelocityX = 0;
      }

      // Extract initial velocity if specified
      const initVelPatterns = [
        /initial\s*(?:velocity|speed)\s*(?:of|is|=)?\s*(\d+(?:\.\d+)?)\s*m\/s/i,
        /v[₀0]\s*=\s*(\d+(?:\.\d+)?)/i,
        /starts\s*(?:at|with)\s*(\d+(?:\.\d+)?)\s*m\/s/i
      ];
      for (const pattern of initVelPatterns) {
        const match = problem.match(pattern);
        if (match) {
          overrides.initialVelocityX = parseFloat(match[1]);
          break;
        }
      }
    }

    // ===== NEW PARSING PATTERNS =====

    // Applied force (e.g., "pushed with 24 N", "force of 10 N")
    const appliedForceMatch = problem.match(/push(?:ed|ing)?\s*(?:with)?\s*(?:a\s*)?(?:force\s*(?:of)?)?\s*(\d+(?:\.\d+)?)\s*N/i);
    if (appliedForceMatch) overrides.appliedForce = parseFloat(appliedForceMatch[1]);

    // Friction coefficient (e.g., "coefficient of friction 0.20", "μ = 0.3")
    const frictionMatch = problem.match(/(?:coefficient\s*(?:of)?\s*(?:kinetic\s*)?friction|μk?)\s*(?:is|=|of)?\s*(\d+(?:\.\d+)?)/i);
    if (frictionMatch) {
      const coeff = parseFloat(frictionMatch[1]);
      overrides.kineticFrictionCoeff = coeff;
      overrides.staticFrictionCoeff = coeff * 1.2; // Static typically ~20% higher
    }

    // Elevator acceleration (e.g., "accelerating upward at 2 m/s²")
    const elevatorMatch = problem.match(/elevator[^.]*?accelerat\w*\s*(upward|downward|up|down)[^.]*?(\d+(?:\.\d+)?)\s*m\/s/i);
    if (elevatorMatch) {
      const direction = elevatorMatch[1].toLowerCase().startsWith('up') ? 1 : -1;
      overrides.elevatorAcceleration = direction * parseFloat(elevatorMatch[2]);
    }

    // Person mass for elevator (e.g., "70 kg person", "person weighs 65 kg")
    const personMassMatch = problem.match(/(\d+(?:\.\d+)?)\s*kg\s*(?:person|man|woman|stands)/i) ||
                            problem.match(/person\s*(?:weighs?|of)?\s*(\d+(?:\.\d+)?)\s*kg/i);
    if (personMassMatch) overrides.personMass = parseFloat(personMassMatch[1]);

    // Rope angle (e.g., "30° from vertical", "angle of 45 degrees")
    const ropeAngleMatch = problem.match(/(?:angle|angled?)\s*(?:of|at)?\s*(\d+(?:\.\d+)?)\s*(?:°|deg)/i) ||
                           problem.match(/(\d+(?:\.\d+)?)\s*(?:°|deg)\s*(?:from\s*vertical)?/i);
    if (ropeAngleMatch) overrides.ropeAngle = parseFloat(ropeAngleMatch[1]);

    // Circular motion radius (e.g., "radius 0.8 m", "r = 0.5 m")
    const circularRadiusMatch = problem.match(/radius\s*(?:of|is|=)?\s*(\d+(?:\.\d+)?)\s*m/i);
    if (circularRadiusMatch) overrides.circularRadius = parseFloat(circularRadiusMatch[1]);

    // Circular motion speed (e.g., "at 6 m/s", "speed of 8 m/s")
    const circularSpeedMatch = problem.match(/(?:at|speed\s*(?:of)?)\s*(\d+(?:\.\d+)?)\s*m\/s/i);
    if (circularSpeedMatch && !lowerProblem.includes('accelerat')) {
      overrides.circularSpeed = parseFloat(circularSpeedMatch[1]);
    }

    // Spring constant (e.g., "k = 500 N/m", "spring constant 400 N/m")
    const springKMatch = problem.match(/(?:k\s*=|spring\s*constant)\s*(\d+(?:\.\d+)?)\s*N\/m/i);
    if (springKMatch) overrides.springStiffness = parseFloat(springKMatch[1]);

    // Spring compression/stretch (e.g., "compressed 0.15 m", "stretched by 0.2 m")
    const springCompressionMatch = problem.match(/(?:compress(?:ed|ion)?|stretch(?:ed)?)\s*(?:of|by)?\s*(\d+(?:\.\d+)?)\s*m(?:eters?)?/i);
    if (springCompressionMatch) overrides.springAmplitude = parseFloat(springCompressionMatch[1]);

    // Two masses for pulleys/collisions (e.g., "Cart A (2 kg)", "mass of 3 kg")
    const massMatches = [...problem.matchAll(/(?:mass|cart|block|object)\s*[AB12]?\s*\(?(\d+(?:\.\d+)?)\s*kg\)?/gi)];
    if (massMatches.length >= 1) overrides.mass = parseFloat(massMatches[0][1]);
    if (massMatches.length >= 2) overrides.mass2 = parseFloat(massMatches[1][1]);

    // Collision duration (e.g., "in 0.02 s", "over 0.1 seconds")
    const durationMatch = problem.match(/(?:in|over|during|takes?)\s*(\d+(?:\.\d+)?)\s*(?:s|sec|ms)/i);
    if (durationMatch) {
      let duration = parseFloat(durationMatch[1]);
      if (problem.toLowerCase().includes('ms')) duration /= 1000;
      overrides.collisionDuration = duration;
    }

    // Collision type
    if (lowerProblem.includes('elastic') && !lowerProblem.includes('inelastic')) {
      overrides.collisionType = 'elastic';
    } else if (lowerProblem.includes('inelastic') || lowerProblem.includes('stick') || lowerProblem.includes('embeds')) {
      overrides.collisionType = 'inelastic';
    }

    // Velocity for collision (e.g., "moving at 5 m/s", "velocity of 40 m/s")
    const velocityMatch = problem.match(/(?:moving|velocity)\s*(?:at|of)?\s*(\d+(?:\.\d+)?)\s*m\/s/i);
    if (velocityMatch) overrides.velocity1 = parseFloat(velocityMatch[1]);

    // Seesaw/lever distances (e.g., "1.5 m from pivot", "distance of 2 m")
    const distanceMatches = [...problem.matchAll(/(\d+(?:\.\d+)?)\s*m\s*(?:from\s*(?:the\s*)?(?:pivot|fulcrum|center))/gi)];
    if (distanceMatches.length >= 1) overrides.leftDistance = parseFloat(distanceMatches[0][1]);
    if (distanceMatches.length >= 2) overrides.rightDistance = parseFloat(distanceMatches[1][1]);

    // Door/lever length (e.g., "door is 2 m wide", "lever 1.5 m long")
    const lengthMatch = problem.match(/(?:door|lever|rod)\s*(?:is)?\s*(\d+(?:\.\d+)?)\s*m\s*(?:wide|long)/i);
    if (lengthMatch) overrides.leverArm = parseFloat(lengthMatch[1]) * 0.9; // Force typically applied near end

    // Force magnitude for torque (e.g., "force of 15 N", "pushes with 20 N")
    const torqueForceMatch = problem.match(/(?:force\s*(?:of)?|push(?:es|ed)?\s*(?:with)?)\s*(\d+(?:\.\d+)?)\s*N/i);
    if (torqueForceMatch && !appliedForceMatch) {
      overrides.forceMagnitude = parseFloat(torqueForceMatch[1]);
    }

    // Power (e.g., "500 W", "using 500 W", "power of 500 W")
    const powerMatch = problem.match(/(\d+(?:\.\d+)?)\s*W(?:atts?)?/i);
    if (powerMatch) overrides.power = parseFloat(powerMatch[1]);

    // Lift height (e.g., "lift it 10 m", "raise 5 m", "height of 10 m")
    const liftHeightMatch = problem.match(/(?:lift\s*(?:it)?|raise|height\s*(?:of)?)\s*(\d+(?:\.\d+)?)\s*m/i);
    if (liftHeightMatch) overrides.liftHeight = parseFloat(liftHeightMatch[1]);

    // ===== NEW PARSING: Wave parameters =====
    // Wave amplitude (e.g., "amplitude 0.5 m", "A = 3 cm")
    const amplitudeMatch = problem.match(/amplitude\s*(?:of|is|=)?\s*(\d+(?:\.\d+)?)\s*(m|cm|mm)/i);
    if (amplitudeMatch) {
      let amp = parseFloat(amplitudeMatch[1]);
      if (amplitudeMatch[2] === 'cm') amp /= 100;
      if (amplitudeMatch[2] === 'mm') amp /= 1000;
      overrides.waveAmplitude = amp;
    }

    // Wave frequency (e.g., "frequency 5 Hz", "f = 440 Hz")
    const freqMatch = problem.match(/(?:frequency|freq)\s*(?:of|is|=)?\s*(\d+(?:\.\d+)?)\s*Hz/i);
    if (freqMatch) {
      overrides.waveFrequency = parseFloat(freqMatch[1]);
      overrides.sourceFrequency = parseFloat(freqMatch[1]);
    }

    // Wavelength (e.g., "wavelength 2 m", "λ = 0.5 m")
    const wavelengthMatch = problem.match(/(?:wavelength|λ)\s*(?:of|is|=)?\s*(\d+(?:\.\d+)?)\s*m/i);
    if (wavelengthMatch) overrides.wavelength = parseFloat(wavelengthMatch[1]);

    // Harmonic number (e.g., "3rd harmonic", "n = 2")
    const harmonicMatch = problem.match(/(\d+)(?:st|nd|rd|th)?\s*harmonic/i) || problem.match(/n\s*=\s*(\d+)/i);
    if (harmonicMatch) overrides.harmonicNumber = parseInt(harmonicMatch[1]);

    // Wave speed (e.g., "wave speed 340 m/s", "v = 10 m/s")
    const waveSpeedMatch = problem.match(/(?:wave\s*speed|speed\s*of\s*(?:the\s*)?wave)\s*(?:is|=)?\s*(\d+(?:\.\d+)?)\s*m\/s/i);
    if (waveSpeedMatch) overrides.waveSpeed = parseFloat(waveSpeedMatch[1]);

    // Ramp/incline height (e.g., "height 5 m", "5 m height")
    const rampHeightMatch = problem.match(/(?:height|h)\s*(?:of|is|=)?\s*(\d+(?:\.\d+)?)\s*m/i);
    if (rampHeightMatch && (lowerProblem.includes('ramp') || lowerProblem.includes('incline') || lowerProblem.includes('slide') || lowerProblem.includes('roll'))) {
      overrides.rampHeight = parseFloat(rampHeightMatch[1]);
    }

    // Object density (e.g., "density 800 kg/m³")
    const densityMatch = problem.match(/(?:density)\s*(?:of|is|=)?\s*(\d+(?:\.\d+)?)\s*kg\/m/i);
    if (densityMatch) overrides.objectDensity = parseFloat(densityMatch[1]);

    // Fluid density (e.g., "water" -> 1000, "oil" -> 800, "mercury" -> 13600)
    if (lowerProblem.includes('water')) overrides.fluidDensity = 1000;
    if (lowerProblem.includes('oil')) overrides.fluidDensity = 800;
    if (lowerProblem.includes('mercury')) overrides.fluidDensity = 13600;
    if (lowerProblem.includes('seawater') || lowerProblem.includes('sea water')) overrides.fluidDensity = 1025;

    // Source speed for Doppler (e.g., "source moving at 30 m/s")
    const sourceSpeedMatch = problem.match(/(?:source|siren|car|train)\s*(?:moving|traveling|approaching)\s*(?:at)?\s*(\d+(?:\.\d+)?)\s*m\/s/i);
    if (sourceSpeedMatch) overrides.sourceSpeed = parseFloat(sourceSpeedMatch[1]);

    // Angular velocity (e.g., "spinning at 2 rad/s", "ω = 5 rad/s")
    const omegaMatch = problem.match(/(?:spinning\s*(?:at)?|ω\s*=)\s*(\d+(?:\.\d+)?)\s*rad\/s/i);
    if (omegaMatch) overrides.initialAngularVelocity = parseFloat(omegaMatch[1]);

    return { overrides, hasCliff, cliffHeight, isHorizontalThrow, isBankedCurve, isLinearKinematics };
  }, [problem]);

  const problemOverrides = problemAnalysis.overrides;

  // Extract initial params from animation data
  const initialParams = useMemo(() => {
    const extracted = extractPhysicsParams(animation_data);
    return { ...defaultParams, ...extracted, ...problemOverrides };
  }, [animation_data, problemOverrides]);

  const [params, setParams] = useState<PhysicsParams>(initialParams);

  // Update params when animation_data changes
  useEffect(() => {
    const extracted = extractPhysicsParams(animation_data);
    setParams(prev => ({ ...prev, ...extracted, ...problemOverrides }));
    setKey(k => k + 1); // Reset scene with new params
  }, [animation_data, problemOverrides]);

  useEffect(() => {
    if (!stepByStep) {
      navigate("/");
      return;
    }
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [stepByStep, navigate]);

  // Replay: restart animation with current (user-modified) settings (no full reload)
  const handleReplay = useCallback(() => {
    // Use flushSync to ensure gravity update is processed before velocity reset
    flushSync(() => {
      setActiveTimeScale(params.timeScale); // Lock in the timeScale for this run
    });
    // Now trigger reset - gravity is already updated in Rapier
    setResetTrigger((t) => t + 1);
    setIsPaused(false);
  }, [params.timeScale]);

  // Reset: restore all values back to original problem values (full reload)
  const handleReset = useCallback(() => {
    const extracted = extractPhysicsParams(animation_data);
    setParams({ ...defaultParams, ...extracted, ...problemOverrides });
    setActiveTimeScale(1); // Reset to default time scale
    setKey((k) => k + 1); // Full reload for reset
    setIsPaused(false);
  }, [animation_data, problemOverrides]);

  const handlePlay = useCallback(() => setIsPaused(false), []);
  const handlePause = useCallback(() => setIsPaused(true), []);

  const handleObjectUpdate = useCallback((data: {
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
    time?: number;
  }) => {
    setLiveData({
      position: data.position,
      velocity: data.velocity,
      time: data.time
    });
  }, []);

  // Un-scale live data for display (show real physics values, not time-scaled)
  const displayLiveData = useMemo(() => {
    if (!liveData.velocity) return liveData;
    const scale = activeTimeScale || 1;
    return {
      position: liveData.position,
      velocity: liveData.velocity ? {
        x: liveData.velocity.x / scale,
        y: liveData.velocity.y / scale,
        z: liveData.velocity.z / scale
      } : undefined,
      // Time is already reported as physics time from components, pass through directly
      time: liveData.time
    };
  }, [liveData, activeTimeScale]);

  // Determine scene type - override based on problem analysis if needed
  const sceneType = useMemo(() => {
    if (problemAnalysis.isBankedCurve) return 'banked_curve';
    if (problemAnalysis.isLinearKinematics) return 'linear_kinematics';
    return determineSceneType(animation_data, problem);
  }, [animation_data, problem, problemAnalysis.isBankedCurve, problemAnalysis.isLinearKinematics]);

  // Calculate camera position based on INITIAL scene requirements only (not live params)
  // This prevents camera from shifting when user adjusts sliders
  const cameraSettings = useMemo(() => {
    const { hasCliff, cliffHeight, isBankedCurve } = problemAnalysis;
    // Use initial params for camera calculation, not live params
    const g = 9.81; // Always use standard gravity for camera calc
    const vy = initialParams.initialVelocityY || 0;
    const vx = initialParams.initialVelocityX || 10;
    const posY = initialParams.initialPositionY || 2;

    if (hasCliff && cliffHeight > 0) {
      const h = cliffHeight;

      // Time to fall: t = sqrt(2h/g)
      const fallTime = Math.sqrt((2 * h) / g);
      // Horizontal distance: x = vx * t
      const horizontalRange = vx * fallTime;

      // Position camera to see the whole trajectory
      const maxDimension = Math.max(h, horizontalRange);
      const cameraDistance = maxDimension * 1.5;

      return {
        position: [horizontalRange / 2, h / 2 + 5, cameraDistance] as [number, number, number],
        target: [horizontalRange / 2, h / 2, 0] as [number, number, number]
      };
    }

    if (sceneType === 'projectile' || sceneType === 'freefall') {
      // Max height for vertical throws: h = vy^2 / (2g)
      const maxHeight = vy > 0 ? (vy * vy) / (2 * g) + posY : posY;
      // Time of flight: t = 2 * vy / g (for throw and catch at same level)
      const flightTime = vy > 0 ? (2 * vy) / g : 2;
      const horizontalRange = Math.abs(vx) * flightTime;

      const maxDimension = Math.max(maxHeight, horizontalRange, 20);
      const cameraDistance = maxDimension * 1.2;

      return {
        position: [cameraDistance * 0.7, maxHeight * 0.6 + 5, cameraDistance] as [number, number, number],
        target: [horizontalRange / 4, maxHeight / 2, 0] as [number, number, number]
      };
    }

    // Banked curve camera - bird's eye view to see the circular track
    if (isBankedCurve || sceneType === 'banked_curve') {
      const radius = initialParams.curveRadius || 50;
      const cameraHeight = radius * 1.2;
      const cameraDistance = radius * 0.8;
      return {
        position: [cameraDistance, cameraHeight, cameraDistance] as [number, number, number],
        target: [0, 0, 0] as [number, number, number]
      };
    }

    // Linear kinematics camera - side view of straight road
    if (problemAnalysis.isLinearKinematics || sceneType === 'linear_kinematics') {
      const a = initialParams.acceleration || 2.5;
      const t = initialParams.maxTime || 8;
      const v0 = initialParams.initialVelocityX || 0;
      // Calculate total distance: x = v₀t + ½at²
      const totalDistance = v0 * t + 0.5 * a * t * t;
      const cameraDistance = Math.max(totalDistance * 0.6, 30);
      return {
        position: [totalDistance / 2, 15, cameraDistance] as [number, number, number],
        target: [totalDistance / 2, 0, 0] as [number, number, number]
      };
    }

    // Mass-spring system camera
    if (sceneType === 'mass_spring') {
      return {
        position: [5, 2, 8] as [number, number, number],
        target: [0, 0, 0] as [number, number, number]
      };
    }

    // Circular motion on string camera
    if (sceneType === 'circular_string') {
      return {
        position: [0, 8, 8] as [number, number, number],
        target: [0, 4, 0] as [number, number, number]
      };
    }

    // Horizontal push camera
    if (sceneType === 'horizontal_push') {
      return {
        position: [8, 4, 8] as [number, number, number],
        target: [3, 0.5, 0] as [number, number, number]
      };
    }

    // Elevator camera
    if (sceneType === 'elevator') {
      return {
        position: [8, 10, 12] as [number, number, number],
        target: [0, 5, 0] as [number, number, number]
      };
    }

    // Rope tension camera
    if (sceneType === 'rope_tension') {
      return {
        position: [0, 4, 10] as [number, number, number],
        target: [0, 2.5, 0] as [number, number, number]
      };
    }

    // Atwood machine camera
    if (sceneType === 'atwood') {
      return {
        position: [6, 6, 10] as [number, number, number],
        target: [0, 5, 0] as [number, number, number]
      };
    }

    // Table pulley camera
    if (sceneType === 'table_pulley') {
      return {
        position: [8, 6, 10] as [number, number, number],
        target: [3, 2, 0] as [number, number, number]
      };
    }

    // Torque demo camera
    if (sceneType === 'torque') {
      return {
        position: [4, 3, 6] as [number, number, number],
        target: [1, 1.5, 0] as [number, number, number]
      };
    }

    // Seesaw camera
    if (sceneType === 'seesaw') {
      return {
        position: [0, 5, 10] as [number, number, number],
        target: [0, 1, 0] as [number, number, number]
      };
    }

    // Enhanced collision camera
    if (sceneType === 'enhanced_collision') {
      return {
        position: [0, 5, 15] as [number, number, number],
        target: [0, 1, 0] as [number, number, number]
      };
    }

    // Powered lift camera - adjust based on lift height
    if (sceneType === 'powered_lift') {
      const h = initialParams.liftHeight || 10;
      return {
        position: [12, h / 2 + 3, 14] as [number, number, number],
        target: [0, h / 2, 0] as [number, number, number]
      };
    }

    // Energy ramp camera
    if (sceneType === 'energy_ramp') {
      const h = initialParams.rampHeight || 5;
      return {
        position: [8, h + 2, 12] as [number, number, number],
        target: [0, h / 2, 0] as [number, number, number]
      };
    }

    // Rolling incline camera
    if (sceneType === 'rolling_incline') {
      const h = initialParams.rampHeight || 5;
      return {
        position: [8, h + 2, 12] as [number, number, number],
        target: [0, h / 2, 0] as [number, number, number]
      };
    }

    // Transverse wave camera
    if (sceneType === 'transverse_wave') {
      const len = initialParams.waveStringLength || 10;
      return {
        position: [0, 4, len * 0.8] as [number, number, number],
        target: [0, 2, 0] as [number, number, number]
      };
    }

    // Standing wave camera
    if (sceneType === 'standing_wave') {
      const len = initialParams.waveStringLength || 10;
      return {
        position: [0, 4, len * 0.8] as [number, number, number],
        target: [0, 2, 0] as [number, number, number]
      };
    }

    // Buoyancy camera
    if (sceneType === 'buoyancy') {
      return {
        position: [8, 4, 8] as [number, number, number],
        target: [0, 0, 0] as [number, number, number]
      };
    }

    // Doppler camera - top-down-ish view
    if (sceneType === 'doppler') {
      return {
        position: [0, 20, 10] as [number, number, number],
        target: [0, 0, 0] as [number, number, number]
      };
    }

    // Angular momentum camera
    if (sceneType === 'angular_momentum') {
      return {
        position: [5, 5, 5] as [number, number, number],
        target: [0, 0, 0] as [number, number, number]
      };
    }

    // Satellite orbit camera
    if (sceneType === 'satellite_orbit') {
      const r = initialParams.orbitRadius || 5;
      return {
        position: [0, r * 2, r * 1.5] as [number, number, number],
        target: [0, 0, 0] as [number, number, number]
      };
    }

    // Wave superposition camera
    if (sceneType === 'wave_superposition') {
      const len = initialParams.waveStringLength || 10;
      return {
        position: [0, 2, len * 0.9] as [number, number, number],
        target: [0, 2, 0] as [number, number, number]
      };
    }

    // Default camera
    return {
      position: [15, 12, 15] as [number, number, number],
      target: [0, 5, 0] as [number, number, number]
    };
  }, [problemAnalysis, initialParams, sceneType]);

  // Debug: log animation data
  useEffect(() => {
    console.log("Animation data received:", animation_data);
    console.log("Scene type:", sceneType);
    console.log("Problem analysis:", problemAnalysis);
    console.log("Current params:", params);
    console.log("Camera settings:", cameraSettings);
  }, [animation_data, sceneType, problemAnalysis, params, cameraSettings]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'black',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease-out'
      }}>
        <div>
          <h1 style={{
            fontSize: '1rem',
            fontWeight: 200,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            margin: 0
          }}>
            3D Physics Simulation
          </h1>
          {problem && (
            <p style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.75rem',
              margin: '6px 0 0 0',
              maxWidth: '500px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {problem}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/second-page")}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'color 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
        >
          ← Back to Solution
        </button>
      </header>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease-out 0.1s'
      }}>
        {/* 3D Scene */}
        <div style={{ flex: 1, position: 'relative' }}>
          <PhysicsScene
            key={key}
            gravity={[0, -params.gravity * activeTimeScale * activeTimeScale, 0]}
            paused={isPaused}
            cameraPosition={cameraSettings.position}
            cameraTarget={cameraSettings.target}
          >
            <Ground />

            {/* Cliff for cliff-based projectile problems */}
            {problemAnalysis.hasCliff && problemAnalysis.cliffHeight > 0 && (
              <Cliff
                height={problemAnalysis.cliffHeight}
                width={3}
                depth={4}
                position={[0, 0, 0]}
                color="#3a3a3a"
              />
            )}

            {/* Projectile / Thrown object */}
            {(sceneType === 'projectile' || sceneType === 'freefall') && (
              <PhysicsSphere
                resetTrigger={resetTrigger}
                position={[
                  problemAnalysis.hasCliff ? 0 : params.initialPositionX,
                  params.initialPositionY,
                  params.initialPositionZ
                ] as [number, number, number]}
                velocity={[
                  params.initialVelocityX * activeTimeScale,
                  params.initialVelocityY * activeTimeScale,
                  params.initialVelocityZ * activeTimeScale
                ]}
                mass={params.mass}
                radius={0.5}
                restitution={params.restitution}
                friction={params.friction}
                color="#40ff80"
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={handleObjectUpdate}
              />
            )}

            {/* Incline scene */}
            {sceneType === 'incline' && (() => {
              // Ramp parameters
              const rampLength = 10;
              const rampThickness = 0.4;
              const rampWidth = 3;
              const rampCenterY = 2; // Raise ramp so it's visible
              const angleRad = (params.rampAngle * Math.PI) / 180;

              // Block parameters
              const blockSize = 0.8;
              const distanceFromCenter = 3; // How far up the ramp from center (positive = toward high end)

              // Calculate block position on ramp surface
              // Ramp is rotated around Z axis, so positive X end goes UP
              // Block should be placed ON the ramp surface at the high end
              const surfaceOffset = rampThickness / 2 + blockSize / 2 + 0.05; // Small gap to prevent clipping

              const blockX = distanceFromCenter * Math.cos(angleRad) - surfaceOffset * Math.sin(angleRad);
              const blockY = rampCenterY + distanceFromCenter * Math.sin(angleRad) + surfaceOffset * Math.cos(angleRad);
              const blockZ = 0;

              console.log(`Incline: angle=${params.rampAngle}°, block position=(${blockX.toFixed(2)}, ${blockY.toFixed(2)}, ${blockZ})`);

              return (
                <>
                  <Ramp
                    position={[0, rampCenterY, 0]}
                    angle={params.rampAngle}
                    size={[rampLength, rampThickness, rampWidth]}
                    friction={params.friction}
                    restitution={0.05}
                  />
                  <PhysicsBox
                    resetTrigger={resetTrigger}
                    position={[blockX, blockY, blockZ] as [number, number, number]}
                    size={[blockSize, blockSize, blockSize] as [number, number, number]}
                    mass={params.mass}
                    restitution={0.05}
                    friction={params.friction}
                    color="#4080ff"
                    timeScale={activeTimeScale}
                    isPaused={isPaused}
                    onUpdate={handleObjectUpdate}
                  />
                </>
              );
            })()}

            {/* Collision scene */}
            {sceneType === 'collision' && (
              <>
                <PhysicsBox
                  resetTrigger={resetTrigger}
                  position={[-3, 1, 0]}
                  velocity={[params.initialVelocityX || 5, 0, 0]}
                  mass={params.mass}
                  restitution={params.restitution}
                  color="#4080ff"
                />
                <PhysicsBox
                  resetTrigger={resetTrigger}
                  position={[3, 1, 0]}
                  velocity={[-(params.initialVelocityX || 5), 0, 0]}
                  mass={params.mass}
                  restitution={params.restitution}
                  color="#ff4080"
                />
              </>
            )}

            {/* Pendulum scene */}
            {sceneType === 'pendulum' && (
              <Pendulum
                key={`pendulum-${key}`}
                pivot={[0, 8, 0]}
                length={params.pendulumLength}
                initialAngle={params.pendulumAngle}
                bobMass={params.mass}
                color="#ff8040"
              />
            )}

            {/* Spring scene - mass on spring */}
            {sceneType === 'spring' && (
              <>
                <Wall position={[0, 6, 0]} size={[2, 0.3, 2]} color="#444" />
                <PhysicsSphere
                  resetTrigger={resetTrigger}
                  position={[0, 4, 0]}
                  velocity={[0, params.initialVelocityY, 0]}
                  mass={params.mass}
                  restitution={0.1}
                  color="#40ffff"
                  timeScale={activeTimeScale}
                  isPaused={isPaused}
                  onUpdate={handleObjectUpdate}
                />
              </>
            )}

            {/* Circular motion - placeholder using sphere */}
            {sceneType === 'circular' && (
              <PhysicsSphere
                resetTrigger={resetTrigger}
                position={[3, 2, 0]}
                velocity={[0, 0, 5]}
                mass={params.mass}
                restitution={0.8}
                color="#ff40ff"
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={handleObjectUpdate}
              />
            )}

            {/* Banked curve - car on circular banked track */}
            {sceneType === 'banked_curve' && (
              <>
                <BankedCurve
                  radius={params.curveRadius}
                  bankAngle={params.bankAngle}
                  trackWidth={8}
                  color="#2a2a2a"
                />
                <Car
                  radius={params.curveRadius}
                  speed={params.carSpeed * activeTimeScale}
                  bankAngle={params.bankAngle}
                  resetTrigger={resetTrigger}
                  timeScale={activeTimeScale}
                  isPaused={isPaused}
                  color="#e63946"
                  onUpdate={handleObjectUpdate}
                />
              </>
            )}

            {/* Linear kinematics - car accelerating on straight road */}
            {sceneType === 'linear_kinematics' && (
              <>
                <StraightRoad
                  length={Math.max(
                    (params.initialVelocityX || 0) * (params.maxTime || 8) +
                    0.5 * (params.acceleration || 2.5) * Math.pow(params.maxTime || 8, 2) + 20,
                    100
                  )}
                  width={10}
                />
                <LinearCar
                  initialVelocity={params.initialVelocityX || 0}
                  acceleration={params.acceleration || 2.5}
                  maxTime={params.maxTime || 8}
                  resetTrigger={resetTrigger}
                  timeScale={activeTimeScale}
                  isPaused={isPaused}
                  color="#2266cc"
                  onUpdate={handleObjectUpdate}
                />
              </>
            )}

            {/* Pulley system - two connected masses */}
            {sceneType === 'pulley' && (
              <>
                <Wall position={[0, 8, 0]} size={[4, 0.3, 1]} color="#444" />
                <PhysicsBox
                  resetTrigger={resetTrigger}
                  position={[-2, 6, 0]}
                  mass={params.mass}
                  color="#4080ff"
                  timeScale={activeTimeScale}
                  isPaused={isPaused}
                  onUpdate={handleObjectUpdate}
                />
                <PhysicsBox
                  resetTrigger={resetTrigger}
                  position={[2, 4, 0]}
                  mass={params.mass * 1.5}
                  color="#ff8040"
                />
              </>
            )}

            {/* Mass-Spring System (SHM) */}
            {sceneType === 'mass_spring' && (
              <MassSpringSystem
                mass={params.mass}
                springConstant={params.springStiffness}
                dampingCoefficient={params.springDamping}
                amplitude={params.springAmplitude || 0.5}
                orientation={params.springOrientation || 'horizontal'}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: data.velocity,
                  time: data.time
                })}
              />
            )}

            {/* Circular Motion on String */}
            {sceneType === 'circular_string' && (
              <CircularMotionString
                mass={params.mass}
                radius={params.circularRadius || 0.8}
                speed={params.circularSpeed || 6}
                plane={params.circularPlane || 'horizontal'}
                pivotPosition={[0, 5, 0]}
                gravity={params.gravity}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: data.velocity,
                  time: data.time
                })}
              />
            )}

            {/* Horizontal Push with Friction */}
            {sceneType === 'horizontal_push' && (
              <HorizontalPush
                mass={params.mass}
                appliedForce={params.appliedForce}
                staticFrictionCoeff={params.staticFrictionCoeff}
                kineticFrictionCoeff={params.kineticFrictionCoeff}
                gravity={params.gravity}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: data.velocity,
                  time: data.time
                })}
              />
            )}

            {/* Elevator Scene */}
            {sceneType === 'elevator' && (
              <Elevator
                personMass={params.personMass || 70}
                elevatorAcceleration={params.elevatorAcceleration}
                maxHeight={20}
                gravity={params.gravity}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: data.velocity,
                  time: data.time
                })}
              />
            )}

            {/* Two Rope Tension */}
            {sceneType === 'rope_tension' && (
              <TwoRopeTension
                mass={params.mass}
                ropeAngle={params.ropeAngle || 30}
                gravity={params.gravity}
                resetTrigger={resetTrigger}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: { x: 0, y: 0, z: 0 },
                  time: 0
                })}
              />
            )}

            {/* Atwood Machine */}
            {sceneType === 'atwood' && (
              <AtwoodMachine
                mass1={params.mass}
                mass2={params.mass2}
                initialHeight1={5}
                gravity={params.gravity}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position1,
                  velocity: { x: 0, y: data.velocity, z: 0 },
                  time: data.time
                })}
              />
            )}

            {/* Table Pulley System */}
            {sceneType === 'table_pulley' && (
              <TablePulley
                tableMass={params.tableMass || 2}
                hangingMass={params.hangingMass || 3}
                frictionCoefficient={params.friction}
                tableLength={5}
                gravity={params.gravity}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.tableBlockPosition,
                  velocity: { x: data.velocity, y: 0, z: 0 },
                  time: data.time
                })}
              />
            )}

            {/* Torque Demo */}
            {sceneType === 'torque' && (
              <TorqueDemo
                objectType="door"
                length={2}
                mass={params.mass}
                forcePosition={params.leverArm || 1.5}
                forceMagnitude={params.forceMagnitude || 10}
                forceAngle={params.forceAngle || 0}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: { x: data.angle * Math.PI / 180, y: 0, z: 0 },
                  velocity: { x: data.angularVelocity, y: 0, z: 0 },
                  time: data.time
                })}
              />
            )}

            {/* Seesaw/Balance */}
            {sceneType === 'seesaw' && (
              <Seesaw
                beamLength={6}
                leftMass={params.leftMass || 2}
                leftDistance={params.leftDistance || 1}
                rightMass={params.rightMass || 2}
                rightDistance={params.rightDistance || 1}
                gravity={params.gravity}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: { x: data.angle, y: 0, z: 0 },
                  velocity: { x: 0, y: 0, z: 0 },
                  time: 0
                })}
              />
            )}

            {/* Enhanced Collision */}
            {sceneType === 'enhanced_collision' && (
              <EnhancedCollision
                mass1={params.mass}
                velocity1={params.velocity1 || 5}
                mass2={params.mass2}
                velocity2={params.velocity2 || 0}
                collisionType={params.collisionType || 'elastic'}
                collisionDuration={params.collisionDuration || 0.1}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position1,
                  velocity: { x: data.velocity1, y: 0, z: 0 },
                  time: data.time
                })}
              />
            )}

            {/* Powered Lift / Machine */}
            {sceneType === 'powered_lift' && (
              <PoweredLift
                mass={params.mass}
                power={params.power || 500}
                liftHeight={params.liftHeight || 10}
                gravity={params.gravity}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: data.velocity,
                  time: data.time
                })}
              />
            )}

            {/* Energy Ramp */}
            {sceneType === 'energy_ramp' && (
              <EnergyRamp
                mass={params.mass}
                rampAngle={params.rampAngle}
                rampHeight={params.rampHeight}
                frictionCoeff={params.kineticFrictionCoeff}
                gravity={params.gravity}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: data.velocity,
                  time: data.time
                })}
              />
            )}

            {/* Rolling Incline */}
            {sceneType === 'rolling_incline' && (
              <RollingIncline
                mass={params.mass}
                objectRadius={params.objectRadius}
                rampAngle={params.rampAngle}
                rampHeight={params.rampHeight}
                rollingShape={params.rollingShape}
                gravity={params.gravity}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: data.velocity,
                  time: data.time
                })}
              />
            )}

            {/* Transverse Wave */}
            {sceneType === 'transverse_wave' && (
              <TransverseWave
                amplitude={params.waveAmplitude}
                frequency={params.waveFrequency}
                wavelength={params.wavelength}
                stringLength={params.waveStringLength}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: data.velocity,
                  time: data.time
                })}
              />
            )}

            {/* Standing Wave */}
            {sceneType === 'standing_wave' && (
              <StandingWave
                harmonicNumber={params.harmonicNumber}
                stringLength={params.waveStringLength}
                waveSpeed={params.waveSpeed}
                amplitude={params.waveAmplitude}
                boundaryType={params.boundaryType}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: data.velocity,
                  time: data.time
                })}
              />
            )}

            {/* Buoyancy Demo */}
            {sceneType === 'buoyancy' && (
              <BuoyancyDemo
                objectDensity={params.objectDensity}
                fluidDensity={params.fluidDensity}
                objectVolume={params.objectVolume}
                gravity={params.gravity}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: data.velocity,
                  time: data.time
                })}
              />
            )}

            {/* Doppler Effect */}
            {sceneType === 'doppler' && (
              <DopplerEffect
                sourceFrequency={params.sourceFrequency}
                sourceSpeed={params.sourceSpeed}
                soundSpeed={params.soundSpeed}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: data.velocity,
                  time: data.time
                })}
              />
            )}

            {/* Angular Momentum */}
            {sceneType === 'angular_momentum' && (
              <AngularMomentumDemo
                diskMass={params.diskMass}
                diskRadius={1}
                initialRadius={params.initialRadius}
                finalRadius={params.finalRadius}
                armMass={params.armMass}
                initialAngularVelocity={params.initialAngularVelocity}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: data.velocity,
                  time: data.time
                })}
              />
            )}

            {/* Satellite Orbit */}
            {sceneType === 'satellite_orbit' && (
              <SatelliteOrbit
                planetMass={params.planetMass}
                orbitRadius={params.orbitRadius}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: data.velocity,
                  time: data.time
                })}
              />
            )}

            {/* Wave Superposition */}
            {sceneType === 'wave_superposition' && (
              <WaveSuperposition
                amplitude1={params.waveAmplitude}
                frequency1={params.waveFrequency}
                amplitude2={params.wave2Amplitude}
                frequency2={params.wave2Frequency}
                wavelength={params.wavelength}
                phaseOffset={params.phaseOffset}
                stringLength={params.waveStringLength}
                resetTrigger={resetTrigger}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={(data) => handleObjectUpdate({
                  position: data.position,
                  velocity: data.velocity,
                  time: data.time
                })}
              />
            )}

            {/* Default/freefall scene */}
            {(sceneType === 'default' || sceneType === 'rotation') && (
              <PhysicsBox
                resetTrigger={resetTrigger}
                position={[params.initialPositionX, params.initialPositionY, params.initialPositionZ]}
                velocity={[params.initialVelocityX, params.initialVelocityY, params.initialVelocityZ]}
                mass={params.mass}
                restitution={params.restitution}
                friction={params.friction}
                timeScale={activeTimeScale}
                isPaused={isPaused}
                onUpdate={handleObjectUpdate}
              />
            )}
          </PhysicsScene>

          {/* Scene info overlay */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(0,0,0,0.8)',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontFamily: 'monospace'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {sceneType} simulation
            </div>
            {(sceneType === 'projectile' || sceneType === 'freefall' || sceneType === 'default') && (
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                v₀ = ({Number(params.initialVelocityX || 0).toFixed(1)}, {Number(params.initialVelocityY || 0).toFixed(1)}, {Number(params.initialVelocityZ || 0).toFixed(1)}) m/s
              </div>
            )}
            {sceneType === 'incline' && (
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                θ = {Number(params.rampAngle || 0).toFixed(0)}° | μ = {Number(params.friction || 0).toFixed(2)}
              </div>
            )}
            {sceneType === 'pendulum' && (
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                L = {Number(params.pendulumLength || 0).toFixed(1)}m | θ₀ = {Number(params.pendulumAngle || 0).toFixed(0)}°
              </div>
            )}
            {sceneType === 'spring' && (
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                k = {Number(params.springStiffness || 0).toFixed(0)} N/m | m = {Number(params.mass || 0).toFixed(1)} kg
              </div>
            )}
            {sceneType === 'collision' && (
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                m = {Number(params.mass || 0).toFixed(1)} kg | e = {Number(params.restitution || 0).toFixed(2)}
              </div>
            )}
            {sceneType === 'banked_curve' && (
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                r = {Number(params.curveRadius || 50).toFixed(0)}m | θ = {Number(params.bankAngle || 20).toFixed(0)}° | v = {Number(params.carSpeed || 13.4).toFixed(1)} m/s
              </div>
            )}
            {sceneType === 'linear_kinematics' && (() => {
              const v0 = params.initialVelocityX || 0;
              const a = params.acceleration || 2.5;
              const t = params.maxTime || 8;
              const vFinal = v0 + a * t;
              const distance = v0 * t + 0.5 * a * t * t;
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>v₀ = {v0.toFixed(1)} m/s | a = {a.toFixed(1)} m/s² | t = {t.toFixed(1)} s</div>
                  <div style={{ marginTop: '4px', color: '#40ff80' }}>
                    v = {vFinal.toFixed(1)} m/s | d = {distance.toFixed(1)} m
                  </div>
                </div>
              );
            })()}
            {sceneType === 'mass_spring' && (() => {
              const k = params.springStiffness || 50;
              const x = params.springAmplitude || 0.15;
              const elasticPE = 0.5 * k * x * x;
              const maxForce = k * x;
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>k = {k.toFixed(0)} N/m | x = {x.toFixed(2)} m</div>
                  <div style={{ marginTop: '4px', color: '#ff8800' }}>
                    PE = ½kx² = {elasticPE.toFixed(2)} J
                  </div>
                  <div style={{ marginTop: '4px', color: '#ff4444' }}>
                    F_max = kx = {maxForce.toFixed(1)} N
                  </div>
                </div>
              );
            })()}
            {sceneType === 'circular_string' && (() => {
              const m = params.mass || 1;
              const r = params.circularRadius || 0.8;
              const v = params.circularSpeed || 6;
              const ac = (v * v) / r;
              const tension = m * ac;
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>m = {m.toFixed(1)} kg | r = {r.toFixed(2)} m | v = {v.toFixed(1)} m/s</div>
                  <div style={{ marginTop: '4px', color: '#40ff80' }}>
                    ac = {ac.toFixed(1)} m/s² | T = {tension.toFixed(1)} N
                  </div>
                </div>
              );
            })()}
            {sceneType === 'horizontal_push' && (() => {
              const m = params.mass || 1;
              const F = params.appliedForce || 10;
              const uk = params.kineticFrictionCoeff || 0.3;
              const g = params.gravity || 9.81;
              const friction = uk * m * g;
              const netForce = F - friction;
              const acc = netForce > 0 ? netForce / m : 0;
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>F = {F.toFixed(0)} N | m = {m.toFixed(1)} kg | μk = {uk.toFixed(2)}</div>
                  <div style={{ marginTop: '4px', color: '#40ff80' }}>
                    f = {friction.toFixed(1)} N | a = {acc.toFixed(2)} m/s²
                  </div>
                </div>
              );
            })()}
            {sceneType === 'elevator' && (() => {
              const m = params.personMass || 70;
              const a = params.elevatorAcceleration || 2;
              const g = params.gravity || 9.81;
              const apparentW = m * (g + a);
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>m = {m.toFixed(0)} kg | a = {a.toFixed(1)} m/s² ({a > 0 ? 'up' : 'down'})</div>
                  <div style={{ marginTop: '4px', color: '#40ff80' }}>
                    W_apparent = {apparentW.toFixed(0)} N
                  </div>
                </div>
              );
            })()}
            {sceneType === 'rope_tension' && (() => {
              const m = params.mass || 1;
              const angle = params.ropeAngle || 30;
              const g = params.gravity || 9.81;
              const angleRad = (angle * Math.PI) / 180;
              const tension = (m * g) / (2 * Math.cos(angleRad));
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>m = {m.toFixed(1)} kg | θ = {angle.toFixed(0)}°</div>
                  <div style={{ marginTop: '4px', color: '#40ff80' }}>
                    T = {tension.toFixed(1)} N (each rope)
                  </div>
                </div>
              );
            })()}
            {(sceneType === 'atwood' || sceneType === 'table_pulley') && (() => {
              const m1 = params.mass || 2;
              const m2 = params.mass2 || 3;
              const g = params.gravity || 9.81;
              const acc = ((m2 - m1) * g) / (m1 + m2);
              const tension = (2 * m1 * m2 * g) / (m1 + m2);
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>m₁ = {m1.toFixed(1)} kg | m₂ = {m2.toFixed(1)} kg</div>
                  <div style={{ marginTop: '4px', color: '#40ff80' }}>
                    a = {Math.abs(acc).toFixed(2)} m/s² | T = {tension.toFixed(1)} N
                  </div>
                </div>
              );
            })()}
            {sceneType === 'torque' && (() => {
              const r = params.leverArm || 1;
              const F = params.forceMagnitude || 10;
              const angle = params.forceAngle || 0;
              const angleRad = (angle * Math.PI) / 180;
              const torque = r * F * Math.cos(angleRad);
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>r = {r.toFixed(1)} m | F = {F.toFixed(0)} N | θ = {angle.toFixed(0)}°</div>
                  <div style={{ marginTop: '4px', color: '#40ff80' }}>
                    τ = {torque.toFixed(1)} N·m
                  </div>
                </div>
              );
            })()}
            {sceneType === 'seesaw' && (() => {
              const m1 = params.leftMass || 2;
              const d1 = params.leftDistance || 1;
              const m2 = params.rightMass || 2;
              const d2 = params.rightDistance || 1;
              const g = params.gravity || 9.81;
              const tau1 = m1 * g * d1;
              const tau2 = m2 * g * d2;
              const isBalanced = Math.abs(tau1 - tau2) < 0.1;
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>Left: {m1.toFixed(1)}kg × {d1.toFixed(1)}m | Right: {m2.toFixed(1)}kg × {d2.toFixed(1)}m</div>
                  <div style={{ marginTop: '4px', color: isBalanced ? '#40ff80' : '#ff8040' }}>
                    τ₁ = {tau1.toFixed(1)} N·m | τ₂ = {tau2.toFixed(1)} N·m {isBalanced ? '(BALANCED)' : ''}
                  </div>
                </div>
              );
            })()}
            {sceneType === 'enhanced_collision' && (() => {
              const m1 = params.mass || 2;
              const v1 = params.velocity1 || 5;
              const m2 = params.mass2 || 1;
              const v2 = params.velocity2 || 0;
              const type = params.collisionType || 'elastic';
              const pBefore = m1 * v1 + m2 * v2;
              const keBefore = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>m₁={m1}kg @ {v1}m/s | m₂={m2}kg @ {v2}m/s | {type}</div>
                  <div style={{ marginTop: '4px', color: '#40ff80' }}>
                    p = {pBefore.toFixed(1)} kg·m/s | KE = {keBefore.toFixed(1)} J
                  </div>
                </div>
              );
            })()}
            {sceneType === 'powered_lift' && (() => {
              const m = params.mass || 50;
              const P = params.power || 500;
              const h = params.liftHeight || 10;
              const g = params.gravity || 9.81;
              const W = m * g;
              const v = P / W;
              const work = m * g * h;
              const time = work / P;
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>m = {m} kg | P = {P} W | h = {h} m</div>
                  <div style={{ marginTop: '4px', color: '#ff8844' }}>
                    Work = mgh = {work.toFixed(0)} J
                  </div>
                  <div style={{ marginTop: '2px', color: '#44aaff' }}>
                    Time = W/P = {time.toFixed(2)} s
                  </div>
                  <div style={{ marginTop: '2px', color: '#44ff44' }}>
                    Speed = P/(mg) = {v.toFixed(2)} m/s
                  </div>
                </div>
              );
            })()}
            {sceneType === 'energy_ramp' && (() => {
              const m = params.mass || 1;
              const h = params.rampHeight || 5;
              const g = params.gravity || 9.81;
              const theta = params.rampAngle || 30;
              const uk = params.kineticFrictionCoeff || 0;
              const thetaRad = (theta * Math.PI) / 180;
              const accel = g * Math.sin(thetaRad) - uk * g * Math.cos(thetaRad);
              const vBottom = Math.sqrt(Math.max(0, 2 * accel * h / Math.sin(thetaRad)));
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>m = {m.toFixed(1)} kg | h = {h.toFixed(1)} m | θ = {theta}° | μk = {uk.toFixed(2)}</div>
                  <div style={{ marginTop: '4px', color: '#ff8844' }}>
                    PE_top = mgh = {(m * g * h).toFixed(1)} J
                  </div>
                  <div style={{ marginTop: '2px', color: '#44ff44' }}>
                    v_bottom = {vBottom.toFixed(2)} m/s
                  </div>
                </div>
              );
            })()}
            {sceneType === 'rolling_incline' && (() => {
              const m = params.mass || 1;
              const h = params.rampHeight || 5;
              const g = params.gravity || 9.81;
              const theta = params.rampAngle || 30;
              const shapeFactors: Record<string, number> = { solid_sphere: 2/5, hollow_sphere: 2/3, solid_cylinder: 1/2, hollow_cylinder: 1, hoop: 1 };
              const c = shapeFactors[params.rollingShape] || 2/5;
              const accel = (g * Math.sin(theta * Math.PI / 180)) / (1 + c);
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>{params.rollingShape.replace('_', ' ')} | c = {c.toFixed(2)} | θ = {theta}°</div>
                  <div style={{ marginTop: '4px', color: '#44aaff' }}>
                    a = g·sinθ/(1+c) = {accel.toFixed(2)} m/s²
                  </div>
                  <div style={{ marginTop: '2px', color: '#ff8844' }}>
                    E = mgh = {(m * g * h).toFixed(1)} J
                  </div>
                </div>
              );
            })()}
            {sceneType === 'transverse_wave' && (() => {
              const A = params.waveAmplitude || 0.5;
              const f = params.waveFrequency || 2;
              const lam = params.wavelength || 2;
              const v = f * lam;
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>A = {A.toFixed(2)} m | f = {f.toFixed(1)} Hz | λ = {lam.toFixed(2)} m</div>
                  <div style={{ marginTop: '4px', color: '#44ff44' }}>
                    v = fλ = {v.toFixed(2)} m/s
                  </div>
                </div>
              );
            })()}
            {sceneType === 'standing_wave' && (() => {
              const n = params.harmonicNumber || 1;
              const L = params.waveStringLength || 10;
              const v = params.waveSpeed || 10;
              const lambdaN = (2 * L) / n;
              const fN = v / lambdaN;
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>n = {n} | L = {L.toFixed(1)} m | v = {v.toFixed(1)} m/s</div>
                  <div style={{ marginTop: '4px', color: '#44ff44' }}>
                    f{n} = {fN.toFixed(2)} Hz | λ{n} = {lambdaN.toFixed(2)} m
                  </div>
                </div>
              );
            })()}
            {sceneType === 'buoyancy' && (() => {
              const rhoObj = params.objectDensity || 500;
              const rhoFluid = params.fluidDensity || 1000;
              const V = params.objectVolume || 0.125;
              const g = params.gravity || 9.81;
              const Fb = rhoFluid * V * g;
              const W = rhoObj * V * g;
              const floats = rhoObj < rhoFluid;
              const subFrac = floats ? rhoObj / rhoFluid : 1;
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>ρ_obj = {rhoObj} | ρ_fluid = {rhoFluid} kg/m³</div>
                  <div style={{ marginTop: '4px', color: '#44aaff' }}>
                    Fb_max = {Fb.toFixed(1)} N | W = {W.toFixed(1)} N
                  </div>
                  <div style={{ marginTop: '2px', color: floats ? '#44ff44' : '#ff4444' }}>
                    {floats ? `Floats (${(subFrac * 100).toFixed(0)}% submerged)` : 'Sinks'}
                  </div>
                </div>
              );
            })()}
            {sceneType === 'doppler' && (() => {
              const f = params.sourceFrequency || 5;
              const vs = params.sourceSpeed || 3;
              const v = params.soundSpeed || 343;
              const fFront = f * v / (v - vs);
              const fBehind = f * v / (v + vs);
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>f₀ = {f.toFixed(0)} Hz | v_s = {vs.toFixed(1)} m/s | v = {v.toFixed(0)} m/s</div>
                  <div style={{ marginTop: '4px', color: '#44ff44' }}>
                    f_front = {fFront.toFixed(1)} Hz
                  </div>
                  <div style={{ marginTop: '2px', color: '#ff8844' }}>
                    f_behind = {fBehind.toFixed(1)} Hz
                  </div>
                </div>
              );
            })()}
            {sceneType === 'angular_momentum' && (() => {
              const M = params.diskMass || 5;
              const m = params.armMass || 1;
              const r1 = params.initialRadius || 1.5;
              const r2 = params.finalRadius || 0.3;
              const w1 = params.initialAngularVelocity || 2;
              const I1 = 0.5 * M * 1 + 2 * m * r1 * r1;
              const I2 = 0.5 * M * 1 + 2 * m * r2 * r2;
              const w2 = (I1 * w1) / I2;
              const L = I1 * w1;
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>L = Iω = {L.toFixed(2)} kg·m²/s (conserved)</div>
                  <div style={{ marginTop: '4px', color: '#44aaff' }}>
                    ω₁ = {w1.toFixed(1)} → ω₂ = {w2.toFixed(1)} rad/s
                  </div>
                  <div style={{ marginTop: '2px', color: '#ff8844' }}>
                    I₁ = {I1.toFixed(2)} → I₂ = {I2.toFixed(2)} kg·m²
                  </div>
                </div>
              );
            })()}
            {sceneType === 'satellite_orbit' && (() => {
              const r = params.orbitRadius || 5;
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>Orbit radius = {r.toFixed(1)} units</div>
                  <div style={{ marginTop: '4px', color: '#44ff44' }}>
                    v = √(GM/r) | F = GMm/r²
                  </div>
                </div>
              );
            })()}
            {sceneType === 'wave_superposition' && (() => {
              const f1 = params.waveFrequency || 2;
              const f2 = params.wave2Frequency || 2.5;
              const fBeat = Math.abs(f1 - f2);
              const phi = params.phaseOffset || 0;
              return (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <div>f₁ = {f1.toFixed(1)} Hz | f₂ = {f2.toFixed(1)} Hz</div>
                  {fBeat > 0.01 && (
                    <div style={{ marginTop: '4px', color: '#ffaa00' }}>
                      f_beat = |f₁ - f₂| = {fBeat.toFixed(1)} Hz
                    </div>
                  )}
                  {phi !== 0 && (
                    <div style={{ marginTop: '2px', color: '#aaa' }}>
                      Δφ = {(phi * 180 / Math.PI).toFixed(0)}°
                    </div>
                  )}
                </div>
              );
            })()}
            <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
              g = {Number(params.gravity || 9.81).toFixed(2)} m/s²
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <ControlPanel
          params={params}
          onChange={setParams}
          onReplay={handleReplay}
          onReset={handleReset}
          onPlay={handlePlay}
          onPause={handlePause}
          isPaused={isPaused}
          liveData={displayLiveData}
        />
      </div>
    </div>
  );
};

export default Third;
