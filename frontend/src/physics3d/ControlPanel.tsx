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
  // Pendulum params
  pendulumLength: number
  pendulumAngle: number
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
  pendulumLength: 3,
  pendulumAngle: 45
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
    </div>
  )
}
