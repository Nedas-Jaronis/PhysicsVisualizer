import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Third.css";

// Import the video file
import MySceneVideo from "./media/videos/manimtest/480p15/MyScene.mp4";

const Third: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step_by_step, setStep_by_step] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Helper function to format the step-by-step content
  const formatStepByStep = (text: string) => {
    if (!text) return "";
    
    // Replace bullet points with proper HTML
    let formatted = text.replace(/•\s+/g, '<li>');
    formatted = formatted.replace(/\n\s*-\s+/g, '\n<li>');
    
    // Add line breaks
    formatted = formatted.replace(/\n/g, '</li>\n');
    
    // Wrap in a list if it contains list items
    if (formatted.includes('<li>')) {
      formatted = '<ul>' + formatted + '</ul>';
      // Clean up any empty list items
      formatted = formatted.replace(/<li><\/li>/g, '');
    }
    
    // Format step numbers (e.g., "Step 1:" becomes bold)
    formatted = formatted.replace(/(Step \d+:)/g, '<strong>$1</strong>');
    
    // Format mathematical expressions (simple heuristic)
    formatted = formatted.replace(/(\w+)\s*=\s*([^<]+)/g, '<code>$1 = $2</code>');
    
    return formatted;
  };

  useEffect(() => {
    // Debug what data we're receiving
    console.log("Location state:", location.state);
    setDebugInfo(JSON.stringify(location.state, null, 2));
    
    // Check if we already have the step-by-step from the previous page
    if (location.state?.step_by_step) {
      console.log("Found step_by_step in location state");
      setStep_by_step(location.state.step_by_step);
      setIsLoading(false);
    } else {
      console.log("No step_by_step found in location state");
      // If no data was passed, try to fetch it
      const fetchStepByStep = async () => {
        try {
          const problem = location.state?.problem || "Default physics problem";
          
          const response = await fetch('http://localhost:5000/api/solve', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ problem }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch step-by-step explanation');
          }

          const data = await response.json();
          console.log("API response:", data);
          
          if (data.step_by_step) {
            setStep_by_step(data.step_by_step);
          } else {
            setStep_by_step("No step-by-step explanation available in API response.");
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          setStep_by_step("Error fetching step-by-step explanation. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchStepByStep();
    }
  }, [location.state]);

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
              {step_by_step ? (
                <div dangerouslySetInnerHTML={{ __html: formatStepByStep(step_by_step) }} />
              ) : (
                <div>
                  <p>No step-by-step explanation available.</p>
                  <details>
                    <summary>Debug Info</summary>
                    <pre style={{ color: 'white', textAlign: 'left', fontSize: '12px' }}>
                      {debugInfo}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="Second-Box">
          <video width="100%" autoPlay loop muted>
            <source src={MySceneVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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