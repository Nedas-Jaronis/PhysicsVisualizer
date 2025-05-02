import { useNavigate } from "react-router-dom";
import QueryBox from "./Query";
import "./HomePage.css"

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="background">
      <div className="container">
        <QueryBox />
        <div className="button-container">
            <button onClick={() => navigate("/next-page")}>
            Go to Another Page
            </button>
        </div>
        
      </div>
    </div>
  );
};

export default HomePage;