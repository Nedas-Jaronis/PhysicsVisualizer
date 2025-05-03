import { useNavigate } from "react-router-dom";
import "./Third.css";

// Import the video file (this is key!)
import MySceneVideo from "./media/videos/manimtest/480p15/MyScene.mp4";

const Third: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="background">
      <div className="main-container">
        <div className="First-Box">
          <h2>Step-By-Step Goes Here</h2>
        </div>
        <div className="Second-Box">
          <video width="100%" autoPlay loop muted>
            <source src={MySceneVideo} type="video/mp4" />
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
