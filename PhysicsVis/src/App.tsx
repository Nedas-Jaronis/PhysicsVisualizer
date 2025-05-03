import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage.tsx"
import First from "./first.tsx"
import Second from "./Second.tsx";
import Third from "./Third.tsx" 

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element = {<HomePage />} />
          <Route path="/first-page" element={<First />} />
          <Route path="/second-page" element={<Second />} />
          <Route path = "/third-page" element={<Third />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;