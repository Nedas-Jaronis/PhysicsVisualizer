import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePhysics } from "./PhysicsContent";
import './query.css'; // Make sure to import your CSS

function QueryBox() {
    const [question, setQuestion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { 
        setSolution, 
        setFormulas, 
        setStepByStep, 
        setProblem,
        setAnimationData 
    } = usePhysics();

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuestion(event.target.value);
        if (error) setError(null);
    };

    const handleSubmit = async () => {
        if (!question.trim()) {
            setError("Please enter a physics problem");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch("http://localhost:5000/api/solve", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ problem: question }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Backend error (${response.status}): ${errorText}`);
            }

            const data = await response.json();

            if (data.status !== 'success') {
                throw new Error(data.error || "Backend processing failed");
            }

            if (!data.problem_solution || !data.animation_data) {
                throw new Error("Invalid response from backend - missing required data");
            }

            const problemSolution = data.problem_solution;
            const animationData = data.animation_data;

            if (!problemSolution.solution || !problemSolution.formulas || !problemSolution.stepByStep || !problemSolution.problem) {
                throw new Error("Incomplete solution data from backend");
            }

            setSolution(problemSolution.solution);
            setFormulas(problemSolution.formulas);
            setStepByStep(problemSolution.stepByStep);
            setProblem(problemSolution.problem);
            setAnimationData(animationData);

            navigate("/second-page");

        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            await handleSubmit();
        }
    };

    return (
        <div className="query-box" style={{ position: 'relative' }}>
            <textarea
                value={question}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                placeholder="Type your physics problem and press Enter (or Shift+Enter for new line)"
                className="query-textarea"
                disabled={isLoading}
            />

            {error && (
                <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px'
                }}>
                    {error}
                </div>
            )}

            {isLoading && (
                <div className="spin"></div>
            )}
        </div>
    );
}

export default QueryBox;
