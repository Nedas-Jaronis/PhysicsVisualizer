import { useNavigate } from "react-router-dom";
import QueryBox from "./Query";
import "./first.css"

const First: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="background">
      <div className="container">
  <div className="query-section">
    <QueryBox />
    <div className="button-hyperlinks">
      <button id="formulas"onClick={() => navigate("/second-page")}>Formulas</button>
      <button id="solution" onClick={() => navigate("/second-page")}>Solution</button>
      <button id="SBS" onClick={() => navigate("/third-page")}>Step-by-Step</button>
      <button id= "vis" onClick={() => navigate("/third-page")}>Visualization</button>
    </div>
  </div>

  <div className="button-container">
    <button onClick={() => navigate("/second-page")}>Go to Another Page</button>
    <button onClick={() => navigate("/")}>Go to HomePage</button>
  </div>
</div>

    </div>
  );
};

export default First;