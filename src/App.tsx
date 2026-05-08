import { HashRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Landing from "./pages/landing";
import Game from "./pages/Game";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
