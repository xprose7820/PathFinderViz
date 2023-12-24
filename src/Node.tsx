import React from "react";

import "./Node.css"; // CSS for node styling
export type PathNodeWithDirection = {
  node: NodeType;
  direction: number; // 0 for none, 1 for up, 2 for right, 3 for down, 4 for left
};
export type NodeType = {
  isStart: boolean;
  isEnd: boolean;
  isWall: boolean;
  row: number;
  col: number;
  onNodeClick: (row: number, col: number) => void;
  onNodeMouseEnter: (row: number, col: number) => void;
  isVisited: boolean;
  distance: number;
  previousNode: NodeType | null;
  isPath: number;
  isPassage: boolean;
};
const Node: React.FC<NodeType> = ({
  isStart,
  isEnd,
  isWall,
  row,
  col,
  onNodeClick,
  onNodeMouseEnter,
  isVisited,
  distance,
  previousNode,
  isPath,
  isPassage
}) => {
  // !!!!!!!!!!!!!!!!!!!!!!!!!!! order matters for condition, spent hours on this on why isPath doesn't update conditional
  // that why even when resetGrid didn't have isPath: false, the isVisited was still true, and thus isVisited was set to false but isPath was still true !!!!!!!!!!
  // const extraClassName = isPath
  //   ? "node-path"
  //   : isEnd
  //   ? "node-end"
  //   : isStart
  //   ? "node-start"
  //   : isWall
  //   ? "node-wall"
  //   : isVisited
  //   ? "node-visited"
  //   : "";
  // console.log(`Rendering node ${row}-${col}, isPath: ${isPath}, className: ${extraClassName}`);
  let classNameForPassage; 
  // is passage was for debugging, could be considered a "hole"
  if (isPassage){
    classNameForPassage = 'node-passage';
  }else if (isPassage === false){
    classNameForPassage = ""; 
  }
  let extraClassName;
  switch (isPath) {
    case 0:
      // If isPath is 0, it means it's not part of the path, so we check other properties.
      extraClassName = isEnd
        ? "node-end"
        : isStart
        ? "node-start"
        : isWall
        ? "node-wall"
        : isVisited
        ? "node-visited"
        : "";
      break;
    case 1:
      extraClassName = "node-path-up"; // Assuming '1' means the path is going up
      break;
    case 2:
      extraClassName = "node-path-right"; // Assuming '2' means the path is going right
      break;
    case 3:
      extraClassName = "node-path-down"; // Assuming '3' means the path is going down
      break;
    case 4:
      extraClassName = "node-path-left"; // Assuming '4' means the path is going left
      break;
    default:
      extraClassName = ""; // Default case if none of the above
  }

  return (
    <div
      id={`node-${row}-${col}`}
      className={`node ${extraClassName} ${classNameForPassage}`}
      onClick={() => onNodeClick(row, col)}
      onMouseEnter={() => onNodeMouseEnter(row, col)}
    >
      {/* Additional content if needed */}
    </div>
  );
};

export default Node;
