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
  Projectile,
  Pendulum,
  Wall,
  Cliff,
  BankedCurve,
  Car
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

// Determine scene type based on animation data
function determineSceneType(animationData: any): string {
  if (!animationData) return 'default';

  const motions = animationData.motions || [];
  const environments = animationData.environments || [];
  const interactions = animationData.interactions || [];
  const forces = animationData.forces || [];

  // Convert to lowercase strings for easier matching
  const motionStr = JSON.stringify(motions).toLowerCase();
  const envStr = JSON.stringify(environments).toLowerCase();
  const interactionStr = JSON.stringify(interactions).toLowerCase();
  const forceStr = JSON.stringify(forces).toLowerCase();

  // Check for pendulum
  if (envStr.includes('pendulum') || motionStr.includes('simpleharmonic')) {
    return 'pendulum';
  }

  // Check for spring/oscillation
  if (forceStr.includes('spring') || motionStr.includes('damped') || motionStr.includes('oscillat')) {
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
  if (envStr.includes('incline')) {
    return 'incline';
  }

  // Check for collision
  if (interactionStr.includes('collision')) {
    return 'collision';
  }

  // Check for projectile motion (2D or 3D)
  if (motionStr.includes('projectile')) {
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
  const objects = animationData.objects || [];
  for (const obj of objects) {
    const vel = obj.velocity || obj.initialVelocity || {};
    if (vel.y > 0 || vel.x !== 0) {
      return 'projectile';
    }
  }

  // Check if there's any motion that implies throwing
  const foundSpeed = deepFind(animationData, ['speed', 'initialSpeed', 'v0', 'velocity']);
  if (foundSpeed !== undefined && typeof foundSpeed === 'number' && foundSpeed > 0) {
    return 'projectile';
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

    return { overrides, hasCliff, cliffHeight, isHorizontalThrow, isBankedCurve };
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
      time: liveData.time ? liveData.time / scale : undefined
    };
  }, [liveData, activeTimeScale]);

  // Determine scene type - override based on problem analysis if needed
  const sceneType = useMemo(() => {
    if (problemAnalysis.isBankedCurve) return 'banked_curve';
    return determineSceneType(animation_data);
  }, [animation_data, problemAnalysis.isBankedCurve]);

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
                  color="#e63946"
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

            {/* Default/freefall scene */}
            {(sceneType === 'default' || sceneType === 'rotation') && (
              <PhysicsBox
                resetTrigger={resetTrigger}
                position={[params.initialPositionX, params.initialPositionY, params.initialPositionZ]}
                velocity={[params.initialVelocityX, params.initialVelocityY, params.initialVelocityZ]}
                mass={params.mass}
                restitution={params.restitution}
                friction={params.friction}
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
