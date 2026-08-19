import { HashRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Landing from "./pages/Landing";
import Game from "./pages/Game";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/game" element={<Game />} />
        {/* vvv /game/:id lets an in-progress game be bookmarked/resumed after refresh*/}
        <Route path="/game/:id" element={<Game />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
