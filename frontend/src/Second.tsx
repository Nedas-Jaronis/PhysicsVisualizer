import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePhysics } from "./PhysicsContent";

const Second: React.FC = () => {
  const navigate = useNavigate();
  const { solution, formulas, problem, stepByStep } = usePhysics();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!solution || !formulas) {
      navigate("/");
      return;
    }
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [solution, formulas, navigate]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'black',
      color: 'white',
      overflowY: 'auto',
      padding: '60px 40px',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <header style={{
        maxWidth: '900px',
        margin: '0 auto 60px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'all 0.6s ease-out'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 200,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          marginBottom: '24px'
        }}>
          Solution
        </h1>
        {problem && (
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '1rem',
            lineHeight: 1.6,
            margin: 0
          }}>
            {problem}
          </p>
        )}
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.6s ease-out 0.1s'
      }}>
        {/* Formulas Section */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{
            fontSize: '0.75rem',
            fontWeight: 400,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '16px'
          }}>
            Formulas
          </h2>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '1rem',
            lineHeight: 2,
            color: 'rgba(255,255,255,0.9)'
          }}>
            {formulas.split('\n').filter(line => line.trim()).map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          margin: '40px 0'
        }} />

        {/* Step by Step Section */}
        {stepByStep && (
          <>
            <section style={{ marginBottom: '50px' }}>
              <h2 style={{
                fontSize: '0.75rem',
                fontWeight: 400,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '16px'
              }}>
                Step by Step
              </h2>
              <div style={{
                fontSize: '1rem',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.85)'
              }}>
                {stepByStep.split('\n').filter(line => line.trim()).map((line, i) => (
                  <p key={i} style={{ margin: '0 0 12px 0' }}>{line}</p>
                ))}
              </div>
            </section>

            {/* Divider */}
            <div style={{
              height: '1px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              margin: '40px 0'
            }} />
          </>
        )}

        {/* Answer Section */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{
            fontSize: '0.75rem',
            fontWeight: 400,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '16px'
          }}>
            Answer
          </h2>
          <div style={{
            fontSize: '1.1rem',
            lineHeight: 1.8,
            color: 'white'
          }}>
            {solution.split('\n').filter(line => line.trim()).map((line, i) => (
              <p key={i} style={{ margin: '0 0 12px 0' }}>{line}</p>
            ))}
          </div>
        </section>
      </main>

      {/* Navigation */}
      <nav style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '40px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease-out 0.2s'
      }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            padding: '8px 0',
            transition: 'color 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
        >
          ← New Problem
        </button>
        <button
          onClick={() => navigate("/third-page")}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            padding: '8px 0',
            transition: 'color 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
        >
          View Animation →
        </button>
      </nav>
    </div>
  );
};

export default Second;
