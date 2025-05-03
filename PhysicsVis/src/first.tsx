import { useNavigate } from "react-router-dom";
import QueryBox from "./Query";
import "./first.css"

const First: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="background">
      <div className="container">
        <QueryBox />
        <div className="button-container">
            <button onClick={() => navigate("/second-page")}>
            Go to Another Page
            </button>
            <button onClick={() => navigate("/")}>
            Go to HomePage
            </button>
        </div>
        <div className="button-hyperlinks">
            <button onClick={() => navigate("/second-page")}>
            Formulas
            </button>
            <button onClick={() => navigate("/second-page")}>
            Solution
            </button>
            <button onClick={() => navigate("/")}>
            Step-by-Step
            </button>
            <button onClick={() => navigate("/")}>
            Visualization
            </button>
            </div>
      </div>
    </div>
  );
};

export default First;