import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePhysics } from "./PhysicsContent";
import "./Third.css";

const Third: React.FC = () => {
  const navigate = useNavigate();
  const { step_by_step } = usePhysics();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!step_by_step) {
      setError("No explanation found. Go back and submit a question.");
    }
    setIsLoading(false);
  }, [step_by_step]);

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
                </div>
              )}
            </div>
          )}
        </div>
        <div className="Second-Box">
          {/* Render the video directly from the src folder */}
          <video width="100%" autoPlay loop muted>
            <source src={"/media/videos/manimtest/MyScene.mp4"} type="video/mp4" />
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
