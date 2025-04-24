import type React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom";
import TrackPlay from "./TrackPlay/components/TrackPlay";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={{ width: "100vw", height: "100vh" }}>
        <Routes>
          <Route path="/" element={<TrackPlay />} />
          <Route path="/track-play/:tripId?" element={<TrackPlay />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;