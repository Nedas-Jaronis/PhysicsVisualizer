import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePhysics } from "./PhysicsContent";
import MatterManager from "./matterManager";
import "./Third.css";

// API configuration
const API_BASE_URL = 'http://localhost:5000';

// API call function
const fetchPhysicsData = async (problem: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/solve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ problem }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching physics data:', error);
    throw error;
  }
};

// Mock data for testing when backend is not available
const MOCK_DATA = {
  step_by_step: `
    Step 1: Identify the given information
    • Initial position: z₀ = 5.0 m
    • Initial velocity: v₀ = 0 m/s
    • Acceleration: a = 9.8 m/s² (gravity)
    
    Step 2: Apply kinematic equations
    • Position equation: z = z₀ + v₀t - ½at²
    • Velocity equation: v = v₀ - at
    
    Step 3: Calculate motion phases
    • Phase 1: Free fall from 5m height
    • Duration: t = √(2z₀/g) = √(2×5/9.8) ≈ 1.01 s
    • Final velocity: v = gt = 9.8 × 1.01 ≈ 9.9 m/s
    
    Step 4: Optional bouncing phases
    • Phase 2: Bounce to 3m height (60% restitution)
    • Phase 3: Bounce to 1.8m height (60% restitution)
  `,
  animation_data: {
    // Phase 1: Drop from 5m
    "1_color": "RED",
    "1_initial_position": 5.0,
    "1_final_position": 0.0,
    "1_initial_velocity": 0.0,
    "1_final_velocity": -9.9,
    "1_acceleration": 9.8,
    "1_bounce_height": 0.0,
    "1_time": 1.01,
    
    // Phase 2: Bounce to 3m
    "2_color": "BLUE",
    "2_initial_position": 0.0,
    "2_final_position": 3.0,
    "2_initial_velocity": 7.67,
    "2_final_velocity": 0.0,
    "2_acceleration": 9.8,
    "2_bounce_height": 3.0,
    "2_time": 0.78,
    
    // Phase 3: Fall from 3m
    "3_color": "GREEN",
    "3_initial_position": 3.0,
    "3_final_position": 0.0,
    "3_initial_velocity": 0.0,
    "3_final_velocity": -7.67,
    "3_acceleration": 9.8,
    "3_bounce_height": 0.0,
    "3_time": 0.78,
    
    // Phase 4: Bounce to 1.8m
    "4_color": "YELLOW",
    "4_initial_position": 0.0,
    "4_final_position": 1.8,
    "4_initial_velocity": 5.94,
    "4_final_velocity": 0.0,
    "4_acceleration": 9.8,
    "4_bounce_height": 1.8,
    "4_time": 0.61,
  },
  num_motions: 4
};

const Third: React.FC = () => {
  const navigate = useNavigate();
  const { 
    step_by_step, 
    animation_data, 
    num_motions,
    setStepByStep,
    setAnimationData,
    setNumMotions 
  } = usePhysics();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [physicsData, setPhysicsData] = useState({
    height: 0,
    velocity: 0,
    time: 0,
    phase: 1,
    timeScale: 1.0,
    isPaused: false
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matterManagerRef = useRef<MatterManager | null>(null);

  const formatStepByStep = (text: string) => {
    if (!text) return "";
    let formatted = text.replace(/•\s+/g, '<li>');
    formatted = formatted.replace(/\n\s*-\s+/g, '\n<li>');
    formatted = formatted.replace(/\n/g, '</li>\n');
    if (formatted.includes('<li>')) {
      formatted = '<ul>' + formatted + '</ul>';
      formatted = formatted.replace(/<li><\/li>/g, '');
    }
    formatted = formatted.replace(/(Step \d+:)/g, '<strong>$1</strong>');
    formatted = formatted.replace(/(\w+)\s*=\s*([^<]+)/g, '<code>$1 = $2</code>');
    return formatted;
  };

  // Load physics data from API
  useEffect(() => {
    const loadPhysicsData = async () => {
      // Check if we already have data from context
      const hasRealData = step_by_step && animation_data && num_motions > 0;
      
      if (hasRealData) {
        console.log("Using existing context data");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // You might want to get the problem from URL params, localStorage, or props
        // For now, using a default problem for testing
        const problem = localStorage.getItem('physics_problem') || "A ball is dropped from 5m height";
        
        console.log("Fetching physics data for problem:", problem);
        const data = await fetchPhysicsData(problem);
        
        // Set the context with the received data
        setStepByStep(data.step_by_step || "");
        setAnimationData(data.animation_data || {});
        setNumMotions(data.num_motions || 0);
        
        console.log("API data received and set in context:", data);
        
      } catch (error) {
        console.error("Failed to load physics data:", error);
        setError("Failed to connect to backend. Using demo mode.");
        
        // Use mock data as fallback
        setStepByStep(MOCK_DATA.step_by_step);
        setAnimationData(MOCK_DATA.animation_data);
        setNumMotions(MOCK_DATA.num_motions);
      } finally {
        setIsLoading(false);
      }
    };

    loadPhysicsData();
  }, []); // Only run once when component mounts

  useEffect(() => {
    console.log("Third.tsx - Received data:", {
      step_by_step: step_by_step ? "Present" : "Missing",
      animation_data: animation_data ? "Present" : "Missing",
      num_motions: num_motions
    });

    // Use mock data if no real data is available
    const hasRealData = step_by_step && animation_data && num_motions > 0;
    
    if (!hasRealData) {
      console.log("No real data found, using mock data for testing");
      setError(null); // Clear any previous error
    } else if (!step_by_step) {
      setError("No explanation found. Go back and submit a question.");
    }
    
    setIsLoading(false);
  }, [step_by_step]);

  useEffect(() => {
    if (!canvasRef.current) {
      console.log("Canvas ref not available yet");
      return;
    }

    // Determine which data to use
    const hasRealData = step_by_step && animation_data && num_motions > 0;
    const dataToUse = hasRealData ? {
      animation_data,
      num_motions
    } : MOCK_DATA;

    console.log("Initializing MatterManager with data:", {
      animation_data: dataToUse.animation_data,
      num_motions: dataToUse.num_motions,
      usingMockData: !hasRealData
    });

    // Pass animation data to window object so MatterManager can access it
    if (dataToUse.animation_data && dataToUse.num_motions) {
      // Convert num_motions to string if it's a number
      const motionsStr = typeof dataToUse.num_motions === 'number' ? 
        dataToUse.num_motions.toString() : 
        String(dataToUse.num_motions);
      
      window.ANIMATION_DATA = JSON.stringify(dataToUse.animation_data);
      window.NUM_MOTIONS = motionsStr;
      
      console.log("Set window properties:", {
        ANIMATION_DATA: window.ANIMATION_DATA,
        NUM_MOTIONS: window.NUM_MOTIONS
      });
    } else {
      console.warn("Missing animation data:", {
        animation_data: dataToUse.animation_data,
        num_motions: dataToUse.num_motions
      });
      // Set default values
      window.ANIMATION_DATA = JSON.stringify({});
      window.NUM_MOTIONS = "0";
    }

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
      setError("Failed to initialize animation. Please try again.");
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
      delete window.NUM_MOTIONS;
    };
  }, [animation_data, num_motions, step_by_step]);

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

  // New handlers for pause and slow motion
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

  // Determine which step-by-step content to show
  const hasRealData = step_by_step && animation_data && num_motions > 0;
  const stepByStepContent = hasRealData ? step_by_step : MOCK_DATA.step_by_step;

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
              {!hasRealData && (
                <div className="demo-alert">
                  <strong>Demo Mode:</strong> Using sample physics problem since backend is unavailable
                </div>
              )}
              {stepByStepContent ? (
                <div dangerouslySetInnerHTML={{ __html: formatStepByStep(stepByStepContent) }} />
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

          {/* Demo Mode Indicator */}
          {!hasRealData && (
            <div id="Demo" className="demo-indicator">
              DEMO MODE
            </div>
          )}

        </div>
      </div>
      
      <div className="button-container">
        <button className="backbutton" onClick={() => navigate("/second-page")}>
          Go back
        </button>
      </div>
    </div>
  );
};

export default Third;