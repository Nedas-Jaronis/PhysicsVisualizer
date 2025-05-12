import { useEffect, useState } from "react";
import { useNavigate} from "react-router-dom";
import "./Second.css";
import { usePhysics } from "./PhysicsContent";




const Second: React.FC = () => {
  const navigate = useNavigate();
  const { solution, formulas } = usePhysics();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!solution || !formulas) {
    setError("No solution data available. Submit a question first.");
  }
  setIsLoading(false);
}, [solution, formulas]);



  return (
    <div className="background">
      <div className="main-container">
        <div className="Formulas">
          <h2 id="Ftitle">Formulas:</h2>
          {isLoading ? (
            <p>Loading formulas...</p>
          ) : error ? (
            <p>Error loading formulas</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: formulas.replace(/\n/g, "<br/>") }} />
          )}

          <div className="formula-bottom-button">
            <button
              className="formula-context-button"
              onClick={() => navigate("/formula-page")}
            >
              Go to All Formulas
            </button>
          </div>
        </div>

        <div className="Solution-Box">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <h2>Loading solution...</h2>
              <p>This may take a moment as we process your physics problem</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <h1>Error</h1>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
          ) : (
            <div>
              <h1>Solution</h1>
              <div dangerouslySetInnerHTML={{ __html: solution.replace(/\n/g, "<br/>") }} />
            </div>
          )}
        </div>
      </div>
      <div className="button-container">
        <button className="backbutton" onClick={() => navigate("/first-page")}>
          Go back
        </button>
        <button
          className="ForwardButton"
          onClick={() => navigate("/third-page")}
        >
          Go Forward
        </button>
      </div>
    </div>
  );
};

export default Second;