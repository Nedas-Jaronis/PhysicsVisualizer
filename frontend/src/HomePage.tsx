import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePhysics } from "./PhysicsContent";
import { SpiralAnimation } from "./SpiralAnimation";

const HomePage: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleVisible, setTitleVisible] = useState(false);
  const navigate = useNavigate();
  const {
    setSolution,
    setFormulas,
    setStepByStep,
    setProblem,
    setAnimationData
  } = usePhysics();

  // Fade in the title after animation loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setTitleVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    if (!question.trim()) {
      setError("Please enter a physics problem");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ problem: question }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (data.status !== 'success') {
        throw new Error(data.error || "Backend processing failed");
      }

      if (!data.problem_solution || !data.animation_data) {
        throw new Error("Invalid response from backend - missing required data");
      }

      const problemSolution = data.problem_solution;
      const animationData = data.animation_data;

      if (!problemSolution.solution || !problemSolution.formulas || !problemSolution.stepByStep || !problemSolution.problem) {
        throw new Error("Incomplete solution data from backend");
      }

      setSolution(problemSolution.solution);
      setFormulas(problemSolution.formulas);
      setStepByStep(problemSolution.stepByStep);
      setProblem(problemSolution.problem);
      setAnimationData(animationData);

      navigate("/second-page");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await handleSubmit();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: 'black'
    }}>
      {/* Spiral Animation Background */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <SpiralAnimation />
      </div>

      {/* Title at spiral center - styled like reference */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) ${titleVisible ? 'translateY(0)' : 'translateY(16px)'}`,
          zIndex: 10,
          opacity: titleVisible ? 1 : 0,
          transition: 'all 1.5s ease-out'
        }}
      >
        <span
          className="title-text"
          style={{
            color: 'white',
            fontSize: '2rem',
            fontWeight: 200,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            display: 'block',
            animation: titleVisible ? 'pulse 2s ease-in-out infinite' : 'none',
            cursor: 'default'
          }}
        >
          Physics Vis
        </span>
      </div>

      {/* Input at bottom */}
      <div style={{
        position: 'absolute',
        left: '50%',
        bottom: '80px',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        width: '90%',
        maxWidth: '500px'
      }}>
        <textarea
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyPress}
          placeholder="Enter your physics problem..."
          disabled={isLoading}
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '14px 18px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            color: 'white',
            resize: 'vertical',
            outline: 'none',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            padding: '12px 40px',
            fontSize: '1rem',
            fontWeight: 300,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'white',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          }}
        >
          {isLoading ? 'Solving...' : 'Solve'}
        </button>

        {error && (
          <div style={{
            padding: '12px 20px',
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            border: '1px solid rgba(220, 53, 69, 0.5)',
            borderRadius: '8px',
            color: '#ff6b6b',
            fontSize: '0.9rem',
            textAlign: 'center',
            maxWidth: '100%'
          }}>
            {error}
          </div>
        )}

        {isLoading && (
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255, 255, 255, 0.2)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .title-text:hover {
          letter-spacing: 0.3em;
          transition: letter-spacing 0.7s ease;
        }
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default HomePage;
