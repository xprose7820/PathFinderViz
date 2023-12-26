import React from "react";
import "./App.css";
import TutorialBanner from "./Tutorial"; // Make sure to import the TutorialBanner component
import Visualizer from "./Visualizer";

function App() {
  return (
    <>
      <TutorialBanner /> {/* Overlay should be at the root level, not nested */}
      <div className="app">
        <Visualizer />
      </div>
    </>
  );
}

export default App;
