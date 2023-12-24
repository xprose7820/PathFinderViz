import React, { useRef } from "react";
import Grid from "./Grid";
import { useState } from "react";
import { NodeType } from "./Node";
import { GridType } from "./Grid";
import { useEffect } from "react";
import { PathNodeWithDirection } from "./Node";
import "./Visualizer.css"; // CSS for the visualizer layout
import dijkstra from "./PathAlgorithms/Dijkstra";
import { start } from "repl";
import { EvalSourceMapDevToolPlugin } from "webpack";
import AStar from "./PathAlgorithms/AStar";
import { stringify } from "querystring";

const Visualizer = () => {
  const numRows = 22; // Define the number of rows
  const numCols = 60; // Define the number of columns

  const [selectedAlgorithm, setSelectedAlgorithm] = useState("");

  const handleAlgorithmChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    clearVisitState();
    setTimeout(() => clearVisitState, 10);

    setSelectedAlgorithm(event.target.value);
    console.log(event.target.value);
  };

  const [isMazeGenerating, setIsMazeGenerating] = useState(false);

  const handleMazePatternChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const pattern = event.target.value;
    setSelectedMazePattern(pattern); // Assuming you have a state for this
    setIsMazeGenerating(true);
    setTimeout(() => setIsMazeGenerating(true), 10); 
    

    if (pattern === "recursiveDivision") {
      stopExecution.current = false;
      generateMaze()
        .then(() => {
          setIsMazeGenerating(false);
          setTimeout(() => setIsMazeGenerating(false), 10); 
        })
        .catch(() => {});
    }
  };

  // Initialize the grid
  const initializeGrid = () => {
    const grid = new Array(numRows);
    for (let row = 0; row < numRows; row++) {
      grid[row] = new Array(numCols);
      for (let col = 0; col < numCols; col++) {
        grid[row][col] = createNode(row, col);
      }
    }
    return grid;
  };

  // Create a node
  const createNode = (row: number, col: number) => {
    return {
      row,
      col,
      isStart: false,
      isEnd: false,
      isWall: false,
      isVisited: false,
      distance: Infinity,
      previousNode: null,
      onNodeClick: () => handleNodeClick(row, col),
      onNodeMouseEnter: () => handleNodeMouseEnter(row, col),
      isPath: 0,
      isPassage: false,

      // other properties as needed
    };
  };

  // State for the grid
  const [grid, setGrid] = useState(initializeGrid());
  const [startNode, setStartNode] = useState<NodeType | null>(null);
  const [endNode, setEndNode] = useState<NodeType | null>(null);
  const [firstClickStart, setFirstClickStart] = useState(false);
  const [secondClickEnd, setSecondClickEnd] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [selectedMazePattern, setSelectedMazePattern] = useState("");
  const stopExecution = useRef(false);
  const handleNodeClick = (row: number, col: number) => {
    // Implement logic for node click event
    // Create a new grid with updated values
    const newGrid = grid.map((gridRow, rowIndex) => {
      return gridRow.map((node: NodeType, nodeIndex: number) => {
        if (rowIndex === row && nodeIndex === col) {
          // Update the node as necessary
          // For example, toggling isWall
          if (!firstClickStart) {
            // Check if it is border
            if (row === 0 || row === numRows - 1 || col === 0 || col === numCols - 1) {
              return node;
            }
            setFirstClickStart(true);
            setStartNode({ ...node, isStart: true });

            return { ...node, isStart: true };
          } else if (!secondClickEnd) {
            // Check if it is border
            if (row === 0 || row === numRows - 1 || col === 0 || col === numCols - 1) {
              return node;
            }
            setSecondClickEnd(true);
            setEndNode({ ...node, isEnd: true });
            return { ...node, isEnd: true };
          } else {
            return { ...node, isWall: !node.isWall };
          }
        } else {
          return node;
        }
      });
    });

    // Update the grid state
    setGrid(newGrid);
  };

  // no need to pass in grid, we are accessing it directly inside Visualizer
  const updateGridDuringPathFind = (node: NodeType) => {
    // const newGrid = grid.map((gridRow) => {
    //   return gridRow.map((gridNode: NodeType) => {
    //     if (gridNode.row == node.row && gridNode.col == node.col) {
    //       console.log("node should turn blue");
    //       return { ...gridNode, isVisited: true };
    //     } else {
    //       return {...gridNode;
    //     }
    //   });
    // });
    // console.log(newGrid);

    // setGrid(newGrid);
    setGrid((prevGrid) => {
      return prevGrid.map((gridRow) => {
        return gridRow.map((gridNode: NodeType) => {
          if (gridNode.row === node.row && gridNode.col === node.col) {
            return { ...gridNode, isVisited: true };
          } else {
            return gridNode;
          }
        });
      });
    });
  };

  const setPathNodes = (path: NodeType[]) => {
    setGrid((prevGrid) => {
      // Update the grid based on the previous grid state
      return prevGrid.map((row) => {
        return row.map((node: NodeType) => {
          // Check if the current node is in the path
          const isPathNode = path.some((pathNode) => pathNode.row === node.row && pathNode.col === node.col);
          if (isPathNode) {
            // Mark node as part of the path
            return { ...node, isPath: true };
          }
          return node;
        });
      });
    });
  };

  // const setPathNodesWithDelay = (node: NodeType) => {

  //   setGrid((prevGrid) => {
  //     return prevGrid.map((gridRow) => {
  //       return gridRow.map((gridNode: NodeType) => {
  //         if (gridNode.row === node.row && gridNode.col === node.col) {
  //           return { ...gridNode, isPath: true };
  //         } else {
  //           return gridNode;
  //         }
  //       });
  //     });
  //   });

  // };
  const setPathNodesWithDelay = (pathNodeWithDirection: PathNodeWithDirection) => {
    const { node, direction } = pathNodeWithDirection;

    setGrid((prevGrid) => {
      return prevGrid.map((gridRow) => {
        return gridRow.map((gridNode: NodeType) => {
          if (gridNode.row === node.row && gridNode.col === node.col) {
            // Set the isPath property to the direction number
            return { ...gridNode, isPath: direction };
          } else {
            return gridNode;
          }
        });
      });
    });

    // ... other logic to handle delay if needed
  };

  const handleNodeMouseEnter = (row: number, col: number) => {
    console.log("is mouse down", mouseDown);
    if (mouseDown && firstClickStart && secondClickEnd) {
      console.log("trying to setwall");
      const newGrid = grid.map((gridRow, rowIndex) =>
        gridRow.map((node: NodeType, nodeIndex: number) => (rowIndex === row && nodeIndex === col ? { ...node, isWall: !node.isWall } : node))
      );
      setGrid(newGrid);
    }
  };

  const startPathFinding = () => {
    // console.log(
    //   "this is startNode when clickgin run",
    //   JSON.stringify(startNode, null, 2)
    // );
    // console.log("this is end node", JSON.stringify(endNode, null, 2));

    // console.log("should be calling clearVisitState");
    clearVisitState();

    stopExecution.current = false;

    console.log("this is row 1, col 2, should be right after clearVisitState", JSON.stringify(grid[1][2], null, 2));

    // console.log("inside startPathFinding function");
    if (selectedAlgorithm === "dijkstra") {
      console.log("starting dijkstra");
      dijkstra(grid, startNode, endNode, updateGridDuringPathFind, setPathNodesWithDelay, stopExecution);
    } else if (selectedAlgorithm === "aStar") {
      console.log("starting astar");
      AStar(startNode!, endNode!, grid, updateGridDuringPathFind, setPathNodesWithDelay, stopExecution);
    }
  };

  const clearVisitState = () => {
    console.log("inside clear VisitState");
    stopExecution.current = true;

    setGrid((prevGrid) => {
      return prevGrid.map((row) => {
        return row.map((node: NodeType) => {
          // console.log("print isPath status", JSON.stringify(node.isPath, null, 2));
          // if (node.isPath !== 0){
          //   console.log("this node is a path", JSON.stringify(node, null, 2));
          // }
          if (node.isVisited) {
            console.log("node was visited, fixing now", JSON.stringify(node, null, 2));
          }

          return {
            ...node,

            isVisited: false,
            isPath: 0,
          };
        });
      });
    });
  };

  const resetGrid = () => {
    stopExecution.current = true;

    // const newGrid = grid.map((row) => {
    //   return row.map((node: NodeType) => {
    //     // Reset the properties for each node
    //     return {
    //       ...node,
    //       isStart: false,
    //       isEnd: false,
    //       isWall: false,
    //       isPath: 0,
    //       isVisited: false, // Reset this if needed
    //       distance: Infinity, // Reset this if needed
    //       // ... other properties to reset
    //       previousNode: null,
    //     };
    //   });
    // });

    // setGrid(newGrid);

    setGrid((prevGrid) => {
      return prevGrid.map((row) => {
        return row.map((node: NodeType) => {
          return {
            ...node,
            isStart: false,
            isEnd: false,
            isWall: false,
            isPath: 0,
            isVisited: false, // Reset this if needed
            distance: Infinity, // Reset this if needed
            // ... other properties to reset
            previousNode: null,
            isPassage: false,
          };
        });
      });
    });

    setFirstClickStart(false);
    setSecondClickEnd(false);
    setStartNode(null);
    setEndNode(null);
    setSelectedAlgorithm("");
    setSelectedMazePattern("");
  };

  const handleResetClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    resetGrid(); // First call
    setTimeout(() => resetGrid(), 10); // Second call, after the first one finishes
  };

  function addOuterWalls(grid: NodeType[][]) {
    const height = grid.length;
    const width = grid[0].length;

    // Top and bottom rows
    for (let x = 0; x < width; x++) {
      grid[0][x].isWall = true;
      grid[height - 1][x].isWall = true;
    }

    // Left and right columns
    for (let y = 0; y < height; y++) {
      grid[y][0].isWall = true;
      grid[y][width - 1].isWall = true;
    }
  }

  function generateMaze(): Promise<void> {
    return new Promise( (resolve, reject) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) =>
        row.map((node: NodeType) => ({
          ...node,
          isWall: node.isStart || node.isEnd ? node.isWall : false,
        }))
      );

      addOuterWalls(newGrid);
      return newGrid;
    });

    divideArea(1, 1, grid[0].length - 1, grid.length - 1, startNode!, endNode!);
  resolve(); 
  reject(new Error("maze failed"));
  });
  }

  type Passage = {
    x: number;
    y: number;
    direction: "horizontal" | "vertical";
  };

  const globalPassages: Passage[] = [];

  async function divideArea(x1: number, y1: number, x2: number, y2: number, startNode: NodeType, endNode: NodeType): Promise<void> {
    if (stopExecution.current) {
      return;
    }
    if (x2 - x1 < 3 || y2 - y1 < 3) {
      
      return;
    }

    const horizontal = y2 - y1 >= x2 - x1;
    const wx = horizontal ? x1 : Math.floor(Math.random() * (x2 - x1 - 2)) + x1 + 1;
    const wy = horizontal ? Math.floor(Math.random() * (y2 - y1 - 2)) + y1 + 1 : y1;

    // Determine the passage position
    const px = horizontal ? Math.floor(Math.random() * (x2 - x1 - 2)) + x1 + 1 : wx;
    const py = horizontal ? wy : Math.floor(Math.random() * (y2 - y1 - 2)) + y1 + 1;

    globalPassages.push({
      x: px,
      y: py,
      direction: horizontal ? "horizontal" : "vertical",
    });
    // Add the new passage to the global list

    // setPassage(py, px);

    for (let x = x1; x < x2; x++) {
      for (let y = y1; y < y2; y++) {
        if ((horizontal && y === wy) || (!horizontal && x === wx)) {
          if ((horizontal && x === px) || (!horizontal && y === py)) continue;
          if ((x === startNode.col && y === startNode.row) || (x === endNode.col && y === endNode.row)) continue;

          // Check if this position is adjacent to a passage in the global list
          if (
            globalPassages.some(
              (passage) =>
                (passage.direction === "vertical" && Math.abs(passage.x - x) === 1 && passage.y === y) ||
                (passage.direction === "horizontal" && Math.abs(passage.y - y) === 1 && passage.x === x)
            )
          ) {
            continue; // Skip placing a wall here if it's adjacent to a passage
          }

          setWallWithDelay(y, x);
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
      }
    }

    if (stopExecution.current) {
      return;
    }

    // Recursive calls to divide the remaining area
    if (horizontal) {
      await divideArea(x1, y1, x2, wy, startNode, endNode);
      await divideArea(x1, wy + 1, x2, y2, startNode, endNode);
    } else {
      await divideArea(x1, y1, wx, y2, startNode, endNode);
      await divideArea(wx + 1, y1, x2, y2, startNode, endNode);
    }
  }

  function setWallWithDelay(row: number, col: number) {
    setGrid((prevGrid) => {
      return prevGrid.map((gridRow) => {
        return gridRow.map((gridNode: NodeType) => {
          if (gridNode.row === row && gridNode.col === col) {
            return { ...gridNode, isWall: true };
          } else {
            return gridNode;
          }
        });
      });
    });
  }
  function setPassage(row: number, col: number) {
    setGrid((prevGrid) => {
      return prevGrid.map((gridRow) => {
        return gridRow.map((gridNode: NodeType) => {
          if (gridNode.row === row && gridNode.col === col) {
            return { ...gridNode, isPassage: true };
          } else {
            return gridNode;
          }
        });
      });
    });
  }

  // useEffect(() => {
  //   console.log("Start Node Updated: ", startNode);
  // }, [startNode]);

  return (
    <>
      <div className="header">
        <div className="header-title">PathFinding Visualizer</div>
        <div className="controls-container">
          <div className="controls">
            <select className="form-select select-algorithm-custom" value={selectedAlgorithm} onChange={handleAlgorithmChange} disabled={isMazeGenerating}>
              <option value="" disabled selected>
                Select Algorithm
              </option>
              <option value="dijkstra">Dijkstra's Algorithm</option>
              <option value="aStar">A* Algorithm</option>
              {/* Add more options for other algorithms */}
            </select>
            <select
              className="form-select select-maze-custom"
              value={selectedMazePattern}
              onChange={handleMazePatternChange}
              disabled={!startNode || !endNode}
            >
              <option value="" disabled selected>
                Select Maze Pattern
              </option>
              <option value="recursiveDivision">Recursive Division</option>
            </select>
            <button className="btn btn-custom" onClick={startPathFinding} disabled={!startNode || !endNode || !selectedAlgorithm}>
              Run {selectedAlgorithm.charAt(0).toUpperCase() + selectedAlgorithm.slice(1)} Algorithm
            </button>
            <button className="btn btn-danger" onClick={handleResetClick}>
              Reset
            </button>
          </div>
        </div>
      </div>
      <div className="container_middle">
        <div className="legend-flex-container">
          <div id="carImg"></div>
          <div style={{ marginLeft: "-.1rem" }}>Start Node, check</div>
        </div>
        <div className="legend-flex-container">
          <div id="flagImg"></div>
          <div style={{ marginLeft: "-.1rem" }}> End Node</div>
        </div>
        <div className="legend-flex-container">
          <div id="whiteSquare"></div>
          <div style={{ marginLeft: "-.1rem" }}>Unvisited Node</div>
        </div>
        <div className="legend-flex-container">
          <div id="lightBlueSquare"></div>
          <div style={{ marginLeft: "-.1rem" }}>Visited Node</div>
        </div>
        <div className="legend-flex-container">
          <div id="yellowSquare"></div>
          <div style={{ marginLeft: "-.1rem" }}>Shortest-path Node</div>
        </div>
        <div className="legend-flex-container">
          <div id="wallSquare"></div>
          <div style={{ marginLeft: "-.1rem" }}>Wall Node</div>
        </div>
      </div>
      <div
        className="visualizer"
        onMouseDown={() => setMouseDown(true)}
        onMouseUp={() => setMouseDown(false)}
        onMouseLeave={() => setMouseDown(false)}
      >
        <Grid grid={grid} onNodeClick={handleNodeClick} onNodeMouseEnter={handleNodeMouseEnter} />
      </div>
      {/* Rest of your component */}
    </>
  );
};

export default Visualizer;
