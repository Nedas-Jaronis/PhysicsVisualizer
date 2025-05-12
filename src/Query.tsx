import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePhysics } from "./PhysicsContent";



function QueryBox() {
    const [question, setQuestion] = useState("");
    const navigate = useNavigate();
    const { setPhysicsData } = usePhysics();


    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuestion(event.target.value);
    };

const handleKeyPress = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        console.log("Submitted question:", question);

        try {
            const response = await fetch("http://localhost:5000/api/solve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ problem: question }),
            });

            if (!response.ok) throw new Error("Failed to fetch solution");

            const data = await response.json();

            // Save data to context
            setPhysicsData({
                problem: question,
                solution: data.solution,
                formulas: data.formulas,
                step_by_step: data.step_by_step,
                // Optionally: save video_path here too if needed
            });

            navigate("/second-page");

        } catch (err) {
            console.error("Error submitting question:", err);
            alert("Something went wrong. Please try again.");
        }
    }
};


    return (
        <div className="query-box">
            <textarea
                value={question}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                placeholder="Type your question and press Enter"
                className="query-textarea"
            />
        </div>
    );
}

export default QueryBox;
