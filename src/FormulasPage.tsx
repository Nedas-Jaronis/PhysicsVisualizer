import "./FormulasPage.css"

import { useNavigate } from "react-router-dom";
import "./Second.css"

const Second: React.FC = () => {
    const navigate = useNavigate();
    return (
<div className="background_formulas">
  <div className="main-container">
    <div className="Formulas">
      <h2 id="Ftitle">Formulas:</h2>
      <div className="formula-buttons">
        <a className="PHY2048" href="../data/formulas/PHY2048.pdf" target="_blank" rel="noopener noreferrer">∫ PHY 2048 - Physics w/ Calc 1</a>
        <a className="PHY2049" href="../data/formulas/PHY2048.pdf" target="_blank" rel="noopener noreferrer">∬ PHY 2049 - Physics w/ Calc 2</a>
        <a className="PHY2053" href="../data/formulas/PHY2048.pdf" target="_blank" rel="noopener noreferrer">🏃‍♂️ PHY 2053 - Gen Physics 1</a>
        <a className="PHY2054" href="../data/formulas/PHY2048.pdf" target="_blank" rel="noopener noreferrer">🌡️ PHY 2054 - Gen Physics 2</a>
        <a className="PHY3221" href="../data/formulas/PHY2048.pdf" target="_blank" rel="noopener noreferrer">⚙️ PHY 3221 - Mechanics 1</a>
        <a className="PHY4222" href="../data/formulas/PHY2048.pdf" target="_blank" rel="noopener noreferrer">⚙️ PHY 4222 - Mechanics 2</a>
        <a className="PHY3513" href="../data/formulas/PHY2048.pdf" target="_blank" rel="noopener noreferrer">🔥 PHY 3513 - Thermal Physics 1</a>
        <a className="PHY3323" href="../data/formulas/PHY2048.pdf" target="_blank" rel="noopener noreferrer">⚡ PHY 3323 - Electromagnetism 1</a>
        <a className="PHY4324" href="../data/formulas/PHY2048.pdf" target="_blank" rel="noopener noreferrer">⚡ PHY 4324 - Electromagnetism 2</a>
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