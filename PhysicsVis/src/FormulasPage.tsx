import "./FormulasPage.css"

import { useNavigate } from "react-router-dom";
import "./Second.css"

const Second: React.FC = () => {
    const navigate = useNavigate();
    return (
<div className="background">
  <div className="main-container">
    <div className="Formulas">
      <h2 id="Ftitle">Formulas:</h2>
      <div className="formula-buttons">
        <a className="backbutton" href="../data/formulas/PHY2048.pdf" target="_blank" rel="noopener noreferrer"> PHY 2048 - Physics w/ Calc 1</a>
        <button className="backbutton" onClick={() => navigate("/first-page")}>
        <p>PHY 2049 - Physics w/ Calc 2</p>
        </button>
        <button className="backbutton" onClick={() => navigate("/first-page")}>
        <p>PHY 2053 - Gen Physics 1</p>
        </button>
        <button className="backbutton" onClick={() => navigate("/first-page")}>
        <p>PHY 2054 - Gen Physics 2</p>
        </button>
        <button className="backbutton" onClick={() => navigate("/first-page")}>
        <p>PHY 3221 - Mechanics 1</p>
        </button>
        <button className="backbutton" onClick={() => navigate("/first-page")}>
        <p>PHY 3513 - Thermal Physics 1</p>
        </button>
        <button className="backbutton" onClick={() => navigate("/first-page")}>
        <p>PHY 4222 - Mechanics 2</p>
        </button>
        <button className="backbutton" onClick={() => navigate("/first-page")}>
        <p>PHY 3323- Electromagnetism 1</p>
        </button>
        <button className="backbutton" onClick={() => navigate("/first-page")}>
        <p>PHY 4324 - Electromagnetism 2</p>
        </button>
    </div>
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
  
  export default Second;