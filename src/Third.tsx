import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePhysics } from "./PhysicsContent";
import MatterManager from "./matterManager";
import { setUpdateCallback } from "./matterManager"; // adjust path
import "./Third.css";

declare global {
  interface Window {
    ANIMATION_DATA?: string;
  }
}

const Third: React.FC = () => {
  const navigate = useNavigate();
  const { 
    stepByStep, 
    animation_data,
    problem,
    solution
  } = usePhysics();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [physicsData, setPhysicsData] = useState({
    height: 0,
    velocity: 1,
    time: 0,
    phase: 1,
    timeScale: 1.0,
    isPaused: false
  });

  useEffect(() => {
    // Register the callback ONCE after component mounts
    setUpdateCallback((data) => {
      setPhysicsData((prev) => ({
        ...prev,
        velocity: Math.sqrt(data.vx ** 2 + data.vy ** 2),
        height: data.y,
        time: data.time,
      }));
    });
  }, []);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matterManagerRef = useRef<MatterManager | null>(null);

  const formatStepByStep = (text: string) => {
    if (!text) return "";
    
    // Handle bullet points starting with '-'
    let formatted = text.replace(/^\s*-\s+/gm, '<li>');
    
    // Handle bullet points starting with '•'
    formatted = formatted.replace(/^\s*•\s+/gm, '<li>');
    
    // Replace newlines with closing/opening list items
    formatted = formatted.replace(/\n(?=<li>)/g, '</li>\n');
    
    // Wrap in unordered list if we have list items
    if (formatted.includes('<li>')) {
      // Add closing tag for the last item
      if (!formatted.endsWith('</li>')) {
        formatted += '</li>';
      }
      formatted = '<ul>' + formatted + '</ul>';
      // Clean up any empty list items
      formatted = formatted.replace(/<li><\/li>/g, '');
    }
    
    // Format step headers
    formatted = formatted.replace(/(Step \d+:)/g, '<strong>$1</strong>');
    
    // Format equations (simple pattern)
    formatted = formatted.replace(/(\w+)\s*=\s*([^<\n]+)/g, '<code>$1 = $2</code>');
    
    return formatted;
  };

  // Check if we have the step-by-step data (independent of animation)
  useEffect(() => {
    console.log("Third.tsx - Checking step-by-step data:", {
      stepByStep: stepByStep ? "Present" : "Missing",
      problem: problem ? "Present" : "Missing",
      solution: solution ? "Present" : "Missing"
    });

    if (!stepByStep) {
      setError("No step-by-step explanation available. Please go back and submit a question.");
      return;
    }
    
    setError(null);
    setIsLoading(false);
  }, [stepByStep, problem, solution]);

  // Initialize animation (completely independent of step-by-step)
  useEffect(() => {
    if (!canvasRef.current) {
      console.log("Canvas ref not available yet");
      return;
    }



  if (!animation_data || Object.keys(animation_data).length === 0) {
    console.log(typeof animation_data, "=====here here here")
    console.log("No animation data available - animation will not be shown");
    return;
  }

  window.ANIMATION_DATA = animation_data;
  console.log("Window animation data set successfully:", animation_data);






    // Clean up previous instance
    if (matterManagerRef.current) {
      matterManagerRef.current.cleanup();
    }

    // Initialize MatterManager
    try {
      matterManagerRef.current = new MatterManager(canvasRef.current);
      console.log("MatterManager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize MatterManager:", error);
      // Don't set error state - animation failure shouldn't prevent showing step-by-step
      console.log("Animation failed but step-by-step explanation will still be shown");
      return;
    }

    // Listen for physics updates
    const handlePhysicsUpdate = (event: CustomEvent) => {
      setPhysicsData(event.detail);
    };

    window.addEventListener('physicsUpdate', handlePhysicsUpdate as EventListener);

    // Resize handler
    const handleResize = () => {
      if (matterManagerRef.current) {
        matterManagerRef.current.resize();
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial size adjustment

    // Start animation after a short delay
    const animationTimeout = setTimeout(() => {
      if (matterManagerRef.current) {
        try {
          matterManagerRef.current.startAnimation();
          console.log("Animation started");
        } catch (error) {
          console.error("Failed to start animation:", error);
        }
      }
    }, 500);

    // Cleanup on unmount
    return () => {
      clearTimeout(animationTimeout);
      if (matterManagerRef.current) {
        matterManagerRef.current.cleanup();
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener('physicsUpdate', handlePhysicsUpdate as EventListener);
      
      // Clean up window properties
      delete window.ANIMATION_DATA;
    };
  }, [animation_data]); // Only depends on animation_data

  const handleResetAnimation = () => {
    if (matterManagerRef.current) {
      try {
        matterManagerRef.current.resetAnimation();
      } catch (error) {
        console.error("Failed to reset animation:", error);
      }
    }
  };

  const handleStartAnimation = () => {
    if (matterManagerRef.current) {
      try {
        matterManagerRef.current.startAnimation();
      } catch (error) {
        console.error("Failed to start animation:", error);
      }
    }
  };

  const handleTogglePause = () => {
    if (matterManagerRef.current) {
      try {
        matterManagerRef.current.togglePause();
      } catch (error) {
        console.error("Failed to toggle pause:", error);
      }
    }
  };

  const handleToggleSlowMotion = () => {
    if (matterManagerRef.current) {
      try {
        matterManagerRef.current.toggleSlowMotion();
      } catch (error) {
        console.error("Failed to toggle slow motion:", error);
      }
    }
  };

  return (
    <div className="background">
      <div className="main-container">
        <div className="First-Box">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <h2>Loading step-by-step explanation...</h2>
            </div>
          ) : error ? (
            <div className="error-container">
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={() => navigate("/second-page")}>Go Back</button>
            </div>
          ) : (
            <div className="step-by-step-content">
              <h2>Step-By-Step Explanation</h2>
              {stepByStep ? (
                <div dangerouslySetInnerHTML={{ __html: formatStepByStep(stepByStep) }} />
              ) : (
                <p>No step-by-step explanation available.</p>
              )}
            </div>
          )}
        </div>
        
        <div className="Second-Box">
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
          
          <div className="physics-display">
            <div className="physics-row">
              <span className="label">Height:</span>
              <span className="value green">{physicsData.height.toFixed(2)} m</span>
            </div>
            <div className="physics-row">
              <span className="label">Velocity:</span>
              <span className="value blue">{physicsData.velocity.toFixed(2)} m/s</span>
            </div>
            <div className="physics-row">
              <span className="label">Time:</span>
              <span className="value orange">{physicsData.time.toFixed(2)} s</span>
            </div>
            <div className="physics-row">
              <span className="label">Phase:</span>
              <span className="value pink">{physicsData.phase}</span>
            </div>
            <div className="physics-row">
              <span className="label">Speed:</span>
              <span className="value purple">{physicsData.timeScale?.toFixed(1)}x</span>
            </div>
            <div className="physics-row">
              <span className="label">Status:</span>
              <span className={`value ${physicsData.isPaused ? 'orange-dark' : 'lime'}`}>
                {physicsData.isPaused ? 'PAUSED' : 'RUNNING'}
              </span>
            </div>
          </div>

          <div className="animation-controls">
            <button
              onClick={handleStartAnimation}
              className="animation-button start-button"
            >
              ▶ Start
            </button>

            <button
              onClick={handleTogglePause}
              className={`animation-button pause-button ${physicsData.isPaused ? 'paused' : ''}`}
            >
              {physicsData.isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>

            <button
              onClick={handleResetAnimation}
              className="animation-button reset-button"
            >
              🔄 Reset
            </button>

            <button
              id="slownormalbutton"
              onClick={handleToggleSlowMotion}
              className={`animation-button slownormal-button ${physicsData.timeScale === 1.0 ? 'normal' : 'slow'}`}
            >
              {physicsData.timeScale === 1.0 ? '🐌 Slow' : '⚡ Normal'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="button-container">
        <button className="backbutton" onClick={() => navigate("/second-page")}>
          Go back
        </button>
        <button className="NextButton" onClick={()=> navigate("/test-page")}>Go Final Page</button>
      </div>
    </div>
  );
};

export default Third;