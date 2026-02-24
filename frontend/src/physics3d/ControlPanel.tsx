import { useState, useCallback } from 'react'

// ============================================
// CONTROL PANEL TYPES
// ============================================
export interface PhysicsParams {
  gravity: number
  timeScale: number
  // Object params
  mass: number
  initialVelocityX: number
  initialVelocityY: number
  initialVelocityZ: number
  initialPositionX: number
  initialPositionY: number
  initialPositionZ: number
  restitution: number
  friction: number
  // Ramp params
  rampAngle: number
  // Spring params
  springStiffness: number
  springDamping: number
  springRestLength: number
  springOrientation: 'horizontal' | 'vertical'
  springAmplitude: number
  // Pendulum params
  pendulumLength: number
  pendulumAngle: number
  // Banked curve params
  curveRadius: number
  bankAngle: number
  carSpeed: number
  // Linear kinematics params
  acceleration: number
  maxTime: number
  // Newton's Laws (horizontal push, friction)
  appliedForce: number
  staticFrictionCoeff: number
  kineticFrictionCoeff: number
  // Elevator
  elevatorAcceleration: number
  personMass: number
  // Rope/String
  ropeAngle: number
  stringLength: number
  // Circular motion
  circularRadius: number
  circularSpeed: number
  circularPlane: 'horizontal' | 'vertical' | 'conical'
  // Pulley Systems
  mass2: number
  pulleyMass: number
  pulleyRadius: number
  hangingMass: number
  tableMass: number
  // Collisions
  velocity1: number
  velocity2: number
  collisionType: 'elastic' | 'inelastic'
  collisionDuration: number
  // Rotational
  leverArm: number
  forceAngle: number
  forceMagnitude: number
  leftMass: number
  leftDistance: number
  rightMass: number
  rightDistance: number
  // Rolling
  rollingShape: 'solid_sphere' | 'hollow_sphere' | 'solid_cylinder' | 'hollow_cylinder' | 'hoop'
  objectRadius: number
  // Powered lift
  power: number
  liftHeight: number
  // Energy ramp
  rampHeight: number
  // Wave params
  waveAmplitude: number
  waveFrequency: number
  wavelength: number
  waveStringLength: number
  // Standing wave
  harmonicNumber: number
  waveSpeed: number
  boundaryType: 'fixed_fixed' | 'fixed_free'
  // Buoyancy
  objectDensity: number
  fluidDensity: number
  objectVolume: number
  // Doppler
  sourceFrequency: number
  sourceSpeed: number
  soundSpeed: number
  // Angular momentum
  initialRadius: number
  finalRadius: number
  initialAngularVelocity: number
  diskMass: number
  armMass: number
  // Orbit
  planetMass: number
  orbitRadius: number
  // Superposition
  wave2Frequency: number
  wave2Amplitude: number
  phaseOffset: number
}

export const defaultParams: PhysicsParams = {
  gravity: 9.81,
  timeScale: 1,
  mass: 1,
  initialVelocityX: 0,
  initialVelocityY: 0,
  initialVelocityZ: 0,
  initialPositionX: 0,
  initialPositionY: 2,
  initialPositionZ: 0,
  restitution: 0.3,
  friction: 0.5,
  rampAngle: 30,
  springStiffness: 50,
  springDamping: 1,
  springRestLength: 2,
  springOrientation: 'horizontal',
  springAmplitude: 0.5,
  pendulumLength: 3,
  pendulumAngle: 45,
  curveRadius: 50,
  bankAngle: 20,
  carSpeed: 13.4,
  acceleration: 2.5,
  maxTime: 8,
  // Newton's Laws
  appliedForce: 10,
  staticFrictionCoeff: 0.5,
  kineticFrictionCoeff: 0.3,
  // Elevator
  elevatorAcceleration: 2,
  personMass: 70,
  // Rope/String
  ropeAngle: 30,
  stringLength: 1,
  // Circular motion
  circularRadius: 0.8,
  circularSpeed: 6,
  circularPlane: 'horizontal',
  // Pulley Systems
  mass2: 2,
  pulleyMass: 0,
  pulleyRadius: 0.1,
  hangingMass: 3,
  tableMass: 2,
  // Collisions
  velocity1: 5,
  velocity2: 0,
  collisionType: 'elastic',
  collisionDuration: 0.1,
  // Rotational
  leverArm: 1,
  forceAngle: 0,
  forceMagnitude: 10,
  leftMass: 2,
  leftDistance: 1,
  rightMass: 2,
  rightDistance: 1,
  // Rolling
  rollingShape: 'solid_sphere',
  objectRadius: 0.2,
  // Powered lift
  power: 500,
  liftHeight: 10,
  // Energy ramp
  rampHeight: 5,
  // Wave params
  waveAmplitude: 0.5,
  waveFrequency: 2,
  wavelength: 2,
  waveStringLength: 10,
  // Standing wave
  harmonicNumber: 1,
  waveSpeed: 10,
  boundaryType: 'fixed_fixed' as const,
  // Buoyancy
  objectDensity: 500,
  fluidDensity: 1000,
  objectVolume: 0.125,
  // Doppler
  sourceFrequency: 5,
  sourceSpeed: 3,
  soundSpeed: 343,
  // Angular momentum
  initialRadius: 1.5,
  finalRadius: 0.3,
  initialAngularVelocity: 2,
  diskMass: 5,
  armMass: 1,
  // Orbit
  planetMass: 5.97e24,
  orbitRadius: 5,
  // Superposition
  wave2Frequency: 2.5,
  wave2Amplitude: 0.5,
  phaseOffset: 0
}

// ============================================
// SLIDER COMPONENT
// ============================================
interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}

function Slider({ label, value, min, max, step = 0.1, unit = '', onChange }: SliderProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px'
      }}>
        <span style={{
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          {label}
        </span>
        <span style={{
          fontSize: '0.8rem',
          color: 'white',
          fontFamily: 'monospace'
        }}>
          {value.toFixed(step < 1 ? 2 : 0)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: '4px',
          WebkitAppearance: 'none',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '2px',
          outline: 'none',
          cursor: 'pointer'
        }}
      />
    </div>
  )
}

// ============================================
// SECTION COMPONENT
// ============================================
interface SectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      paddingBottom: '16px',
      marginBottom: '16px'
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '8px 0',
          fontSize: '0.8rem',
          fontWeight: 500,
          letterSpacing: '0.15em',
          textTransform: 'uppercase'
        }}
      >
        {title}
        <span style={{
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </button>
      {open && (
        <div style={{ paddingTop: '12px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================
// CONTROL PANEL COMPONENT
// ============================================
interface ControlPanelProps {
  params: PhysicsParams
  onChange: (params: PhysicsParams) => void
  onReplay: () => void
  onReset: () => void
  onPlay: () => void
  onPause: () => void
  isPaused: boolean
  autoResetOnChange?: boolean
  liveData?: {
    position?: { x: number; y: number; z: number }
    velocity?: { x: number; y: number; z: number }
    time?: number
  }
}

export function ControlPanel({
  params,
  onChange,
  onReplay,
  onReset,
  onPlay,
  onPause,
  isPaused,
  liveData
}: ControlPanelProps) {
  const update = useCallback((key: keyof PhysicsParams, value: number) => {
    onChange({ ...params, [key]: value })
  }, [params, onChange])

  return (
    <div style={{
      width: '280px',
      backgroundColor: 'rgba(0,0,0,0.95)',
      borderLeft: '1px solid rgba(255,255,255,0.1)',
      padding: '20px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{
          fontSize: '0.9rem',
          fontWeight: 300,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          margin: 0,
          color: 'white'
        }}>
          Parameters
        </h2>
      </div>

      {/* Replay & Reset Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <button
          onClick={onReplay}
          style={{
            flex: 1,
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(64, 200, 255, 0.4), rgba(64, 128, 255, 0.4))',
            border: '1px solid rgba(64, 180, 255, 0.6)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(64, 200, 255, 0.6), rgba(64, 128, 255, 0.6))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(64, 200, 255, 0.4), rgba(64, 128, 255, 0.4))';
          }}
        >
          Replay
        </button>
        <button
          onClick={onReset}
          style={{
            flex: 1,
            padding: '12px',
            background: 'rgba(255, 160, 64, 0.3)',
            border: '1px solid rgba(255, 160, 64, 0.5)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 160, 64, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 160, 64, 0.3)';
          }}
        >
          Reset
        </button>
      </div>

      {/* Play/Pause Button */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <button
          onClick={isPaused ? onPlay : onPause}
          style={{
            flex: 1,
            padding: '10px',
            background: isPaused ? 'rgba(64, 255, 64, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            border: '1px solid',
            borderColor: isPaused ? 'rgba(64, 255, 64, 0.5)' : 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
            color: 'white',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}
        >
          {isPaused ? 'Play' : 'Pause'}
        </button>
      </div>
      <p style={{
        fontSize: '0.65rem',
        color: 'rgba(255,255,255,0.4)',
        margin: '0 0 16px 0',
        lineHeight: 1.5
      }}>
        <strong>Replay:</strong> Restart with current settings<br/>
        <strong>Reset:</strong> Restore original problem values
      </p>

      {/* Live Data Display */}
      {liveData && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '20px',
          fontFamily: 'monospace',
          fontSize: '0.75rem'
        }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
            LIVE DATA
          </div>
          {liveData.position && (
            <div style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>
              Pos: ({liveData.position.x.toFixed(2)}, {liveData.position.y.toFixed(2)}, {liveData.position.z.toFixed(2)})
            </div>
          )}
          {liveData.velocity && (
            <div style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>
              Vel: ({liveData.velocity.x.toFixed(2)}, {liveData.velocity.y.toFixed(2)}, {liveData.velocity.z.toFixed(2)})
            </div>
          )}
          {liveData.time !== undefined && (
            <div style={{ color: 'rgba(255,255,255,0.8)' }}>
              Time: {liveData.time.toFixed(2)}s
            </div>
          )}
        </div>
      )}

      {/* World Settings */}
      <Section title="World">
        <Slider
          label="Gravity"
          value={params.gravity}
          min={0}
          max={20}
          step={0.1}
          unit=" m/s²"
          onChange={(v) => update('gravity', v)}
        />
        <Slider
          label="Time Scale"
          value={params.timeScale}
          min={0.25}
          max={2}
          step={0.25}
          unit="x"
          onChange={(v) => update('timeScale', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', margin: '-8px 0 8px 0' }}>
          Click Replay to apply new speed
        </p>
      </Section>

      {/* Object Settings */}
      <Section title="Object">
        <Slider
          label="Mass"
          value={params.mass}
          min={0.1}
          max={10}
          step={0.1}
          unit=" kg"
          onChange={(v) => update('mass', v)}
        />
        <Slider
          label="Restitution"
          value={params.restitution}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update('restitution', v)}
        />
        <Slider
          label="Friction"
          value={params.friction}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update('friction', v)}
        />
      </Section>

      {/* Initial Conditions */}
      <Section title="Initial Position">
        <Slider
          label="X"
          value={params.initialPositionX}
          min={-10}
          max={10}
          step={0.1}
          unit=" m"
          onChange={(v) => update('initialPositionX', v)}
        />
        <Slider
          label="Y"
          value={params.initialPositionY}
          min={0}
          max={10}
          step={0.1}
          unit=" m"
          onChange={(v) => update('initialPositionY', v)}
        />
        <Slider
          label="Z"
          value={params.initialPositionZ}
          min={-10}
          max={10}
          step={0.1}
          unit=" m"
          onChange={(v) => update('initialPositionZ', v)}
        />
      </Section>

      {/* Initial Velocity */}
      <Section title="Initial Velocity" defaultOpen={true}>
        <Slider
          label="Vx"
          value={params.initialVelocityX}
          min={-50}
          max={50}
          step={1}
          unit=" m/s"
          onChange={(v) => update('initialVelocityX', v)}
        />
        <Slider
          label="Vy"
          value={params.initialVelocityY}
          min={-50}
          max={50}
          step={1}
          unit=" m/s"
          onChange={(v) => update('initialVelocityY', v)}
        />
        <Slider
          label="Vz"
          value={params.initialVelocityZ}
          min={-50}
          max={50}
          step={1}
          unit=" m/s"
          onChange={(v) => update('initialVelocityZ', v)}
        />
      </Section>

      {/* Ramp Settings */}
      <Section title="Ramp" defaultOpen={false}>
        <Slider
          label="Angle"
          value={params.rampAngle}
          min={0}
          max={60}
          step={1}
          unit="°"
          onChange={(v) => update('rampAngle', v)}
        />
      </Section>

      {/* Spring Settings */}
      <Section title="Spring" defaultOpen={false}>
        <Slider
          label="Stiffness"
          value={params.springStiffness}
          min={1}
          max={200}
          step={1}
          unit=" N/m"
          onChange={(v) => update('springStiffness', v)}
        />
        <Slider
          label="Damping"
          value={params.springDamping}
          min={0}
          max={10}
          step={0.1}
          onChange={(v) => update('springDamping', v)}
        />
        <Slider
          label="Rest Length"
          value={params.springRestLength}
          min={0.5}
          max={5}
          step={0.1}
          unit=" m"
          onChange={(v) => update('springRestLength', v)}
        />
      </Section>

      {/* Pendulum Settings */}
      <Section title="Pendulum" defaultOpen={false}>
        <Slider
          label="Length"
          value={params.pendulumLength}
          min={1}
          max={10}
          step={0.1}
          unit=" m"
          onChange={(v) => update('pendulumLength', v)}
        />
        <Slider
          label="Initial Angle"
          value={params.pendulumAngle}
          min={0}
          max={90}
          step={1}
          unit="°"
          onChange={(v) => update('pendulumAngle', v)}
        />
      </Section>

      {/* Banked Curve Settings */}
      <Section title="Banked Curve" defaultOpen={false}>
        <Slider
          label="Curve Radius"
          value={params.curveRadius}
          min={10}
          max={100}
          step={5}
          unit=" m"
          onChange={(v) => update('curveRadius', v)}
        />
        <Slider
          label="Bank Angle"
          value={params.bankAngle}
          min={5}
          max={45}
          step={1}
          unit="°"
          onChange={(v) => update('bankAngle', v)}
        />
        <Slider
          label="Car Speed"
          value={params.carSpeed}
          min={5}
          max={30}
          step={0.1}
          unit=" m/s"
          onChange={(v) => update('carSpeed', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          No-slip speed: v = √(r·g·tan θ)
        </p>
      </Section>

      {/* Linear Kinematics Settings */}
      <Section title="Kinematics" defaultOpen={false}>
        <Slider
          label="Initial Velocity"
          value={params.initialVelocityX}
          min={0}
          max={30}
          step={0.5}
          unit=" m/s"
          onChange={(v) => update('initialVelocityX', v)}
        />
        <Slider
          label="Acceleration"
          value={params.acceleration}
          min={0}
          max={10}
          step={0.1}
          unit=" m/s²"
          onChange={(v) => update('acceleration', v)}
        />
        <Slider
          label="Time"
          value={params.maxTime}
          min={1}
          max={20}
          step={0.5}
          unit=" s"
          onChange={(v) => update('maxTime', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          v = v₀ + at | x = v₀t + ½at²
        </p>
      </Section>

      {/* Newton's Laws / Forces */}
      <Section title="Forces" defaultOpen={false}>
        <Slider
          label="Applied Force"
          value={params.appliedForce}
          min={0}
          max={100}
          step={1}
          unit=" N"
          onChange={(v) => update('appliedForce', v)}
        />
        <Slider
          label="Static μs"
          value={params.staticFrictionCoeff}
          min={0}
          max={1.5}
          step={0.05}
          onChange={(v) => update('staticFrictionCoeff', v)}
        />
        <Slider
          label="Kinetic μk"
          value={params.kineticFrictionCoeff}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update('kineticFrictionCoeff', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          f = μN | a = (F - f) / m
        </p>
      </Section>

      {/* Elevator Settings */}
      <Section title="Elevator" defaultOpen={false}>
        <Slider
          label="Person Mass"
          value={params.personMass}
          min={40}
          max={120}
          step={1}
          unit=" kg"
          onChange={(v) => update('personMass', v)}
        />
        <Slider
          label="Acceleration"
          value={params.elevatorAcceleration}
          min={-10}
          max={10}
          step={0.5}
          unit=" m/s²"
          onChange={(v) => update('elevatorAcceleration', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          W_app = m(g + a) | + = up, - = down
        </p>
      </Section>

      {/* Rope Tension Settings */}
      <Section title="Rope Tension" defaultOpen={false}>
        <Slider
          label="Rope Angle"
          value={params.ropeAngle}
          min={5}
          max={85}
          step={1}
          unit="°"
          onChange={(v) => update('ropeAngle', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          T = mg / (2·cos θ)
        </p>
      </Section>

      {/* Circular Motion Settings */}
      <Section title="Circular Motion" defaultOpen={false}>
        <Slider
          label="Radius"
          value={params.circularRadius}
          min={0.3}
          max={5}
          step={0.1}
          unit=" m"
          onChange={(v) => update('circularRadius', v)}
        />
        <Slider
          label="Speed"
          value={params.circularSpeed}
          min={1}
          max={20}
          step={0.5}
          unit=" m/s"
          onChange={(v) => update('circularSpeed', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          ac = v²/r | T = mv²/r
        </p>
      </Section>

      {/* Pulley Systems */}
      <Section title="Pulley System" defaultOpen={false}>
        <Slider
          label="Mass 1"
          value={params.mass}
          min={0.5}
          max={10}
          step={0.1}
          unit=" kg"
          onChange={(v) => update('mass', v)}
        />
        <Slider
          label="Mass 2"
          value={params.mass2}
          min={0.5}
          max={10}
          step={0.1}
          unit=" kg"
          onChange={(v) => update('mass2', v)}
        />
        <Slider
          label="Table Mass"
          value={params.tableMass}
          min={0.5}
          max={10}
          step={0.1}
          unit=" kg"
          onChange={(v) => update('tableMass', v)}
        />
        <Slider
          label="Hanging Mass"
          value={params.hangingMass}
          min={0.5}
          max={10}
          step={0.1}
          unit=" kg"
          onChange={(v) => update('hangingMass', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          a = (m₂-m₁)g / (m₁+m₂)
        </p>
      </Section>

      {/* Collision Settings */}
      <Section title="Collision" defaultOpen={false}>
        <Slider
          label="Mass 1"
          value={params.mass}
          min={0.5}
          max={10}
          step={0.1}
          unit=" kg"
          onChange={(v) => update('mass', v)}
        />
        <Slider
          label="Velocity 1"
          value={params.velocity1}
          min={0}
          max={20}
          step={0.5}
          unit=" m/s"
          onChange={(v) => update('velocity1', v)}
        />
        <Slider
          label="Mass 2"
          value={params.mass2}
          min={0.5}
          max={10}
          step={0.1}
          unit=" kg"
          onChange={(v) => update('mass2', v)}
        />
        <Slider
          label="Velocity 2"
          value={params.velocity2}
          min={-10}
          max={10}
          step={0.5}
          unit=" m/s"
          onChange={(v) => update('velocity2', v)}
        />
        <Slider
          label="Collision Time"
          value={params.collisionDuration}
          min={0.01}
          max={0.5}
          step={0.01}
          unit=" s"
          onChange={(v) => update('collisionDuration', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          J = Δp = m·Δv | F_avg = J/Δt
        </p>
      </Section>

      {/* Torque/Rotational Settings */}
      <Section title="Torque" defaultOpen={false}>
        <Slider
          label="Force Position"
          value={params.leverArm}
          min={0.1}
          max={2}
          step={0.1}
          unit=" m"
          onChange={(v) => update('leverArm', v)}
        />
        <Slider
          label="Force"
          value={params.forceMagnitude}
          min={1}
          max={50}
          step={1}
          unit=" N"
          onChange={(v) => update('forceMagnitude', v)}
        />
        <Slider
          label="Force Angle"
          value={params.forceAngle}
          min={0}
          max={60}
          step={1}
          unit="°"
          onChange={(v) => update('forceAngle', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          τ = r × F = rF·cos θ
        </p>
      </Section>

      {/* Seesaw/Balance Settings */}
      <Section title="Seesaw" defaultOpen={false}>
        <Slider
          label="Left Mass"
          value={params.leftMass}
          min={0.5}
          max={10}
          step={0.1}
          unit=" kg"
          onChange={(v) => update('leftMass', v)}
        />
        <Slider
          label="Left Distance"
          value={params.leftDistance}
          min={0.5}
          max={3}
          step={0.1}
          unit=" m"
          onChange={(v) => update('leftDistance', v)}
        />
        <Slider
          label="Right Mass"
          value={params.rightMass}
          min={0.5}
          max={10}
          step={0.1}
          unit=" kg"
          onChange={(v) => update('rightMass', v)}
        />
        <Slider
          label="Right Distance"
          value={params.rightDistance}
          min={0.5}
          max={3}
          step={0.1}
          unit=" m"
          onChange={(v) => update('rightDistance', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          Equilibrium: m₁d₁ = m₂d₂
        </p>
      </Section>

      {/* Energy Ramp Settings */}
      <Section title="Energy Ramp" defaultOpen={false}>
        <Slider
          label="Ramp Height"
          value={params.rampHeight}
          min={1}
          max={15}
          step={0.5}
          unit=" m"
          onChange={(v) => update('rampHeight', v)}
        />
        <Slider
          label="Ramp Angle"
          value={params.rampAngle}
          min={10}
          max={60}
          step={1}
          unit="°"
          onChange={(v) => update('rampAngle', v)}
        />
        <Slider
          label="Friction μk"
          value={params.kineticFrictionCoeff}
          min={0}
          max={0.8}
          step={0.01}
          onChange={(v) => update('kineticFrictionCoeff', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          KE + PE + W_friction = E_total
        </p>
      </Section>

      {/* Rolling Settings */}
      <Section title="Rolling" defaultOpen={false}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Shape</div>
          <select
            value={params.rollingShape}
            onChange={(e) => onChange({ ...params, rollingShape: e.target.value as any })}
            style={{
              width: '100%', padding: '6px', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px',
              color: 'white', fontSize: '0.8rem'
            }}
          >
            <option value="solid_sphere">Solid Sphere (c=2/5)</option>
            <option value="hollow_sphere">Hollow Sphere (c=2/3)</option>
            <option value="solid_cylinder">Solid Cylinder (c=1/2)</option>
            <option value="hollow_cylinder">Hollow Cylinder (c=1)</option>
            <option value="hoop">Hoop (c=1)</option>
          </select>
        </div>
        <Slider
          label="Object Radius"
          value={params.objectRadius}
          min={0.1}
          max={0.8}
          step={0.05}
          unit=" m"
          onChange={(v) => update('objectRadius', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          a = g·sin θ / (1 + c)
        </p>
      </Section>

      {/* Wave Settings */}
      <Section title="Wave" defaultOpen={false}>
        <Slider
          label="Amplitude"
          value={params.waveAmplitude}
          min={0.1}
          max={2}
          step={0.05}
          unit=" m"
          onChange={(v) => update('waveAmplitude', v)}
        />
        <Slider
          label="Frequency"
          value={params.waveFrequency}
          min={0.5}
          max={10}
          step={0.1}
          unit=" Hz"
          onChange={(v) => update('waveFrequency', v)}
        />
        <Slider
          label="Wavelength"
          value={params.wavelength}
          min={0.5}
          max={8}
          step={0.1}
          unit=" m"
          onChange={(v) => update('wavelength', v)}
        />
        <Slider
          label="String Length"
          value={params.waveStringLength}
          min={4}
          max={20}
          step={1}
          unit=" m"
          onChange={(v) => update('waveStringLength', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          v = fλ | k = 2π/λ
        </p>
      </Section>

      {/* Standing Wave Settings */}
      <Section title="Standing Wave" defaultOpen={false}>
        <Slider
          label="Harmonic (n)"
          value={params.harmonicNumber}
          min={1}
          max={8}
          step={1}
          onChange={(v) => update('harmonicNumber', v)}
        />
        <Slider
          label="Wave Speed"
          value={params.waveSpeed}
          min={1}
          max={50}
          step={1}
          unit=" m/s"
          onChange={(v) => update('waveSpeed', v)}
        />
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Boundary</div>
          <select
            value={params.boundaryType}
            onChange={(e) => onChange({ ...params, boundaryType: e.target.value as any })}
            style={{
              width: '100%', padding: '6px', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px',
              color: 'white', fontSize: '0.8rem'
            }}
          >
            <option value="fixed_fixed">Fixed-Fixed</option>
            <option value="fixed_free">Fixed-Free</option>
          </select>
        </div>
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          λn = 2L/n | fn = nv/(2L)
        </p>
      </Section>

      {/* Buoyancy Settings */}
      <Section title="Buoyancy" defaultOpen={false}>
        <Slider
          label="Object Density"
          value={params.objectDensity}
          min={100}
          max={3000}
          step={50}
          unit=" kg/m³"
          onChange={(v) => update('objectDensity', v)}
        />
        <Slider
          label="Fluid Density"
          value={params.fluidDensity}
          min={500}
          max={13600}
          step={100}
          unit=" kg/m³"
          onChange={(v) => update('fluidDensity', v)}
        />
        <Slider
          label="Object Volume"
          value={params.objectVolume}
          min={0.01}
          max={1}
          step={0.01}
          unit=" m³"
          onChange={(v) => update('objectVolume', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          Fb = ρ_fluid · V_sub · g
        </p>
      </Section>

      {/* Doppler Settings */}
      <Section title="Doppler" defaultOpen={false}>
        <Slider
          label="Source Frequency"
          value={params.sourceFrequency}
          min={1}
          max={20}
          step={0.5}
          unit=" Hz"
          onChange={(v) => update('sourceFrequency', v)}
        />
        <Slider
          label="Source Speed"
          value={params.sourceSpeed}
          min={0}
          max={20}
          step={0.5}
          unit=" m/s"
          onChange={(v) => update('sourceSpeed', v)}
        />
        <Slider
          label="Sound Speed"
          value={params.soundSpeed}
          min={100}
          max={600}
          step={10}
          unit=" m/s"
          onChange={(v) => update('soundSpeed', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          f' = f·v/(v∓v_s)
        </p>
      </Section>

      {/* Angular Momentum Settings */}
      <Section title="Angular Momentum" defaultOpen={false}>
        <Slider
          label="Disk Mass"
          value={params.diskMass}
          min={1}
          max={20}
          step={0.5}
          unit=" kg"
          onChange={(v) => update('diskMass', v)}
        />
        <Slider
          label="Arm Mass (each)"
          value={params.armMass}
          min={0.5}
          max={5}
          step={0.1}
          unit=" kg"
          onChange={(v) => update('armMass', v)}
        />
        <Slider
          label="Initial Radius"
          value={params.initialRadius}
          min={0.3}
          max={3}
          step={0.1}
          unit=" m"
          onChange={(v) => update('initialRadius', v)}
        />
        <Slider
          label="Final Radius"
          value={params.finalRadius}
          min={0.1}
          max={2}
          step={0.1}
          unit=" m"
          onChange={(v) => update('finalRadius', v)}
        />
        <Slider
          label="Initial ω"
          value={params.initialAngularVelocity}
          min={0.5}
          max={10}
          step={0.5}
          unit=" rad/s"
          onChange={(v) => update('initialAngularVelocity', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          L = Iω = constant
        </p>
      </Section>

      {/* Orbit Settings */}
      <Section title="Orbit" defaultOpen={false}>
        <Slider
          label="Orbit Radius"
          value={params.orbitRadius}
          min={2}
          max={10}
          step={0.5}
          unit=" units"
          onChange={(v) => update('orbitRadius', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          v = √(GM/r) | T = 2πr/v
        </p>
      </Section>

      {/* Superposition Settings */}
      <Section title="Superposition" defaultOpen={false}>
        <Slider
          label="Wave 2 Freq"
          value={params.wave2Frequency}
          min={0.5}
          max={10}
          step={0.1}
          unit=" Hz"
          onChange={(v) => update('wave2Frequency', v)}
        />
        <Slider
          label="Wave 2 Amp"
          value={params.wave2Amplitude}
          min={0.1}
          max={2}
          step={0.05}
          unit=" m"
          onChange={(v) => update('wave2Amplitude', v)}
        />
        <Slider
          label="Phase Offset"
          value={params.phaseOffset}
          min={0}
          max={6.28}
          step={0.1}
          unit=" rad"
          onChange={(v) => update('phaseOffset', v)}
        />
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
          y = y₁ + y₂ | f_beat = |f₁ - f₂|
        </p>
      </Section>
    </div>
  )
}
