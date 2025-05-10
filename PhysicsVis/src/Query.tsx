import { useState } from "react";


function QueryBox() {
    const [question, setQuestion] = useState("");

    // Handle change with typed event
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuestion(event.target.value);
    };

    // Handle key press with typed event
    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            console.log("Submitted question:", question);
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
