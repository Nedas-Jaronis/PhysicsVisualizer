import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import QueryBox from "./Query";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="section title">
        <h1>Physics Vis</h1>
      </div>

      <div className="section hook">
        <h2>Search. Learn. Understand.</h2>
      </div>

      <div className="section summary">
        <p>
          The Physics Engine we have all been waiting for, just input any question you desire and get a step by step guide with a dynamic visualization all in real time!
        </p>
      </div>

      <div className="container_query">
        <div className="query-section">
          <QueryBox />
        </div>
      </div>

      <div className="start-now-button">
        <button id="start-button" onClick={() => navigate("/second-page")}>
          Start Now
        </button>
      </div>
    </div>
  );
};

export default HomePage;
