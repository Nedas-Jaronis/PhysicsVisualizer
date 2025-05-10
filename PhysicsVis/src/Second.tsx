import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Second.css";

const Second: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [solution, setSolution] = useState<string>("");
  const [formulas, setFormulas] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolution = async () => {
      try {
        const problem = location.state?.problem || "A circular loop of radius R = 0.1m and resistance Rloop = 2.o ohm is placed in a time-varying magnetic field B(t) = 0.01t^2 T where t is in seconds. 1. Derive an expression for the induced EMF in the loop. 2. Find the current induced in the loop at t = 5s";
        
        console.log("Fetching solution for problem:", problem.substring(0, 50) + "...");
        
        const response = await fetch('http://localhost:5000/api/solve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ problem }),
        });

        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch solution');
        }

        const data = await response.json();
        console.log("Data received:", Object.keys(data));
        
        setSolution(data.solution || "No solution provided");
        setFormulas(data.formulas || "No formulas provided");
      } catch (err) {
        console.error('Error fetching solution:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolution();
  }, [location.state]);

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