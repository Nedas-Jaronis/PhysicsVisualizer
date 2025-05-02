import { useNavigate } from "react-router-dom";
import "./Third.css"

const Third: React.FC = () => {
    const navigate = useNavigate();
    return (
<div className="background">
  <div className="main-container">
    <div className="First-Box">
      <h2>Step-By-Step Goes Here</h2>
    </div>
    <div className="Second-Box">
      <h1>Visualization Goes Here</h1>
    </div>
  </div>
  <div className="button-container">
    <button className="backbutton" onClick={() => navigate("/next-page")}>
      Go back
    </button>
 
  </div>
</div>


    );
  };
  
  export default Third;