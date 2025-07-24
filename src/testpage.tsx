import { useNavigate } from "react-router-dom";


const Test: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="background">
            <div className="container">
                  <div className="button-container">
                        <button onClick={() => navigate("/third-page")}>Go to Previous Page</button>
                    </div>
            </div>
        </div>
    )
}

export default Test;