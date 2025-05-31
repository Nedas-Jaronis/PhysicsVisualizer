import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePhysics } from "./PhysicsContent";
import MatterManager from "./matterManager";
import "./Third.css";

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
  const { step_by_step, animation_data, num_motions } = usePhysics();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [physicsData, setPhysicsData] = useState({
    height: 0,
    velocity: 0,
    time: 0,
    phase: 1
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

  const handleStopAnimation = () => {
    if (matterManagerRef.current) {
      try {
        matterManagerRef.current.stopAnimation();
      } catch (error) {
        console.error("Failed to stop animation:", error);
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
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: '#f0f8ff', 
                  border: '1px solid #007acc',
                  borderRadius: '4px',
                  marginBottom: '15px',
                  fontSize: '14px',
                  color: '#004d79'
                }}>
                  <strong>Demo Mode:</strong> Using sample physics problem since backend is unavailable
                </div>
              )}
              {stepByStepContent ? (
                <div
                  dangerouslySetInnerHTML={{ __html: formatStepByStep(stepByStepContent) }}
                />
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
          
          {/* Physics Data Display */}
          <div className="physics-display" style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '15px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: '8px',
            fontFamily: 'Consolas, monospace',
            fontSize: '14px',
            minWidth: '200px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'white' }}>Height:</span>
              <span style={{ color: '#4CAF50' }}>{physicsData.height.toFixed(2)} m</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'white' }}>Velocity:</span>
              <span style={{ color: '#2196F3' }}>{physicsData.velocity.toFixed(2)} m/s</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'white' }}>Time:</span>
              <span style={{ color: '#FF9800' }}>{physicsData.time.toFixed(2)} s</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'white' }}>Phase:</span>
              <span style={{ color: '#E91E63' }}>{physicsData.phase}</span>
            </div>
          </div>

          {/* Animation Controls */}
          <div className="animation-controls" style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '10px',
            borderRadius: '8px',
            backdropFilter: 'blur(5px)'
          }}>
            <button 
              onClick={handleStartAnimation}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                fontSize: '14px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
            >
              ▶ Start
            </button>
            <button 
              onClick={handleStopAnimation}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                fontSize: '14px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#da190b'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f44336'}
            >
              ⏸ Stop
            </button>
            <button 
              onClick={handleResetAnimation}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                fontSize: '14px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0b7dda'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
            >
              🔄 Reset
            </button>
          </div>

          {/* Demo Mode Indicator */}
          {!hasRealData && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              padding: '8px 12px',
              backgroundColor: 'rgba(255, 165, 0, 0.8)',
              color: 'white',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
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