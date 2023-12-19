import React from 'react'; 
import Node from './Node';
import {NodeType} from './Node';

import './Grid.css'; // CSS for the grid layout

export type GridType  = {
    grid: NodeType[][];
    onNodeClick: (row: number, col: number) => void;  
    onNodeMouseEnter: (row: number, col: number) => void; 
};

const Grid: React.FC<GridType> = ({ grid, onNodeClick, onNodeMouseEnter }) => {
    return (
        <div className="grid">
            {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="grid-row">
                    {row.map((node, nodeIndex) => (
                        <Node
                            key={nodeIndex}
                            isStart={node.isStart}
                            isEnd={node.isEnd}
                            isWall={node.isWall}
                            row={node.row}
                            col={node.col}
                            onNodeClick={onNodeClick}
                            onNodeMouseEnter={onNodeMouseEnter}
                            isVisited={node.isVisited}
                            distance={node.distance}
                            previousNode={node.previousNode}
                            isPath={node.isPath}
                            isPassage={node.isPassage}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};


export default Grid; 