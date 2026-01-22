import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePhysics } from "./PhysicsContent";
import MatterManager from "./matterManager";
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
  const [isPaused, setIsPaused] = useState(false);
  const [isSlowMotion, setIsSlowMotion] = useState(false);
  
  
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
      
      // Clean up window properties
      delete window.ANIMATION_DATA;
    };
  }, [animation_data]); // Only depends on animation_data

  // const handleResetAnimation = () => {
  //   if (matterManagerRef.current) {
  //     try {
  //       matterManagerRef.current.resetAnimation();
  //     } catch (error) {
  //       console.error("Failed to reset animation:", error);
  //     }
  //   }
  // };

  const handleStartAnimation = () => {
  if (matterManagerRef.current) {
    try {
      matterManagerRef.current.startAnimation();

      // ✅ Reset UI state
      setIsPaused(false);
      setIsSlowMotion(false);

    } catch (error) {
      console.error("Failed to start animation:", error);
    }
  }
};


  const handleTogglePause = () => {
  if (matterManagerRef.current) {
    try {
      matterManagerRef.current.togglePause();
      setIsPaused(prev => !prev); // <-- update React's version
    } catch (error) {
      console.error("Failed to toggle pause:", error);
    }
  }
};


  const handleToggleSlowMotion = () => {
  if (matterManagerRef.current) {
    try {
      matterManagerRef.current.toggleSlowMotion();
      setIsSlowMotion(prev => !prev); // Toggle the UI state
    } catch (error) {
      console.error("Failed to toggle slow motion:", error);
    }
  }
};


return (
  <div className="background_third">
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
              <div className="stepFont" dangerouslySetInnerHTML={{ __html: formatStepByStep(stepByStep) }} />
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

        <div className="animation-controls">
          <button
            onClick={handleStartAnimation}
            className="animation-button start-button"
          >
            ▶ Start
          </button>

          <button
            onClick={handleTogglePause}
            className={`animation-button pause-button ${isPaused ? 'resumed' : 'paused'}`}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            id="slownormalbutton"
            onClick={handleToggleSlowMotion}
            className={`animation-button slownormal-button ${isSlowMotion ? 'slow' : 'normal'}`}
          >
            {isSlowMotion ? '⚡ Normal' : '🐌 Slow'}
          </button>
        </div>
      </div>
    </div>
    
    <div className="button-container">
      <button className="backbutton" onClick={() => navigate("/second-page")}>
        Previous Page
      </button>
    </div>
  </div>
);}



export default Third;