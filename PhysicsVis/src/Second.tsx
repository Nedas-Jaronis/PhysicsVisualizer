import { useNavigate } from "react-router-dom";
import "./Second.css"

const Second: React.FC = () => {
    const navigate = useNavigate();
    return (
<div className="background">
  <div className="main-container">
  <div className="Formulas">
  <h2 id="Ftitle">Formulas:</h2>

  <div className="formula-bottom-button">
    <button className="formula-context-button" onClick={() => navigate("/formula-page")}>
      Go to All Formulas
    </button>
  </div>
</div>

    <div className="Solution-Box">
      <h1>Solution Goes Here</h1>
    </div>
  </div>
  <div className="button-container">
    <button className="backbutton" onClick={() => navigate("/first-page")}>
      Go back
    </button>
    <button className="ForwardButton" onClick={() => navigate("/third-page")}>
      Go Forward
    </button>
  </div>
</div>


    );
  };
  
  export default Second;