import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePhysics } from "./PhysicsContent";

function QueryBox() {
    const [question, setQuestion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { setSolution, setFormulas, setStepByStep, setAnimationData, setNumMotions } = usePhysics();

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuestion(event.target.value);
        // Clear error when user starts typing
        if (error) setError(null);
    };

    const handleSubmit = async () => {
        if (!question.trim()) {
            setError("Please enter a physics problem");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        console.log("🚀 Submitting question:", question);

        try {
            console.log("📡 Making request to backend...");
            
            const response = await fetch("http://localhost:5000/api/solve", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ problem: question }),
            });

            console.log("📨 Response status:", response.status);
            console.log("📨 Response headers:", response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Backend error:", errorText);
                throw new Error(`Backend error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            console.log("✅ Received data:", data);

            // Validate the response data
            if (!data.solution || !data.formulas || !data.step_by_step) {
                console.error("❌ Invalid response structure:", data);
                throw new Error("Invalid response from backend");
            }

            // Save data to context using individual setters
            console.log("💾 Saving to context...");
            setSolution(data.solution);
            setFormulas(data.formulas);
            setStepByStep(data.step_by_step);
            setAnimationData(data.animation_data || {});
            setNumMotions(data.num_motions || 0);

            console.log("🧭 Navigating to second page...");
            navigate("/second-page");

        } catch (err) {
            console.error("❌ Error submitting question:", err);
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
        <div className="query-box">
            <textarea
                value={question}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                placeholder="Type your physics problem and press Enter (or Shift+Enter for new line)"
                className="query-textarea"
                disabled={isLoading}
            />
            
            {/* Submit button for easier testing */}
            {/* <button 
                onClick={handleSubmit}
                disabled={isLoading || !question.trim()}
                style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: isLoading ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
            >
                {isLoading ? "Processing..." : "Submit Question"}
            </button> */}

            {/* Error display */}
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

            {/* Loading indicator */}
            {isLoading && (
                <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: '#d1ecf1',
                    color: '#0c5460',
                    border: '1px solid #bee5eb',
                    borderRadius: '4px'
                }}>
                    Processing your physics problem...
                </div>
            )}
        </div>
    );
}

export default QueryBox;