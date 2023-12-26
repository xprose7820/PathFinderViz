import React, { useState } from 'react';
import './Tutorial.css'; // Make sure to import your CSS file
const bannerData = [
    {
      id: 1,
      text: "Welcome to the PathFinding Visualizer! This tool allows you to visualize various pathfinding algorithms in action. Start by selecting an algorithm and watch it find the shortest path.",
    },
    {
      id: 2,
      text: "Customize the grid by adding walls and weights. Use the tools provided to draw on the grid and then run the algorithm to see how it navigates around the obstacles you've placed.",
    },
    {
      id: 3,
      text: "Explore different algorithms and mazes. Learn how each algorithm approaches the problem of finding the shortest path and how they perform under different conditions.",
    },
  ];
  
const TutorialBanner = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1 < bannerData.length ? prev + 1 : prev));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
  };

  const closeBanner = () => {
    // Logic to close the banner
  };

  return (
    <div className="tutorial-banner">
      <div className="tutorial-content">
        <p>{bannerData[currentPage].text}</p>
        <div className="tutorial-navigation">
          {currentPage > 0 && <button onClick={goToPrevPage}>Prev</button>}
          {currentPage < bannerData.length - 1 && <button onClick={goToNextPage}>Next</button>}
          <button className="close-button" onClick={closeBanner}>X</button>
        </div>
      </div>
    </div>
  );
};

export default TutorialBanner;

