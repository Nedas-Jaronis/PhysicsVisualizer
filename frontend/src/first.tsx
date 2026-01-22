import { useNavigate } from "react-router-dom";
import QueryBox from "./Query";
import "./first.css"

const First: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="background_first">
      <div className="container">
  <div className="query-section">
    <QueryBox />
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