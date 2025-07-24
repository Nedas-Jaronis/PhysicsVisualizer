import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage.tsx"
import First from "./first.tsx"
import Second from "./Second.tsx";
import Third from "./Third.tsx" 
import Formula from "./FormulasPage.tsx"
import Test from "./testpage.tsx"

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element = {<HomePage />} />
          <Route path="/first-page" element={<First />} />
          <Route path="/second-page" element={<Second />} />
          <Route path = "/third-page" element={<Third />} />
          <Route path ="/formula-page" element ={<Formula />} />
          <Route path ="/'test-page" element = {<Test />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;