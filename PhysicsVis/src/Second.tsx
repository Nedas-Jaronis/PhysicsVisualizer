import { useNavigate } from "react-router-dom";
import "./SecondPage.css"

const Second: React.FC = () => {
    const navigate = useNavigate();
    return (
<div className="background">
  <div className="main-container">
    <div className="Formulas">
      <h2>Formulas Here:</h2>
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