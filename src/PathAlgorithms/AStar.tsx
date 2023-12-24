// create a new type

import { captureRejectionSymbol } from "events";
import { NodeType, PathNodeWithDirection } from "../Node";
import { useEffect } from "react";

type AStarNode = {
  node: NodeType;
  gCost: number;
  hCost: number;
  fCost: number;
  parent: AStarNode | null;
};

class PriorityQueue {
  private items: AStarNode[];

  constructor() {
    this.items = [];
  }

  enqueue(node: AStarNode) {
    this.removeDuplicates(node.node);
    this.items.push(node);
    this.items.sort((a, b) => {
      const fCostDifference = a.fCost - b.fCost;
      if (fCostDifference === 0) {
        return a.hCost - b.hCost;
      }
      return fCostDifference;
    });
  }

  reorder() {
    this.items.sort((a, b) => {
      const fCostDifference = a.fCost - b.fCost;
      if (fCostDifference === 0) {
        return a.hCost - b.hCost;
      }
      return fCostDifference;
    });
  }

  removeDuplicates(newNode: NodeType): void {
    const index = this.items.findIndex((aStarNode) => aStarNode.node === newNode);
    if (index !== -1) {
      // Remove the older instance of the node
      this.items.splice(index, 1);
    }
  }

  dequeue(): AStarNode | undefined {
    return this.items.shift();
  }

  contains(node: NodeType): AStarNode | undefined {
    return this.items.find((aStarNode) => aStarNode.node === node);
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

async function AStar(
  startNode: NodeType,
  endNode: NodeType,
  grid: NodeType[][],
  updateGridDuringPathFind: (node: NodeType) => void,
  setPathNodesWithDelay: (pathNodeWithDirection: PathNodeWithDirection) => void,
  stopExecution: React.MutableRefObject<boolean> 
) {
  stopExecution.current = false; 
  let openList = new PriorityQueue();
  // console.log("initialized openList", JSON.stringify(openList, null, 2));
  let closedSet = new Set<NodeType>();

  let startAStartNode: AStarNode = {
    node: startNode,
    gCost: 0,
    hCost: heuristic(startNode, endNode),
    fCost: heuristic(startNode, endNode),
    parent: null,
  };

  openList.enqueue(startAStartNode);

  while (!openList.isEmpty()) {
    if (stopExecution.current){
      break; 
    }
    // console.log(
    //   "inside while loop, openlist",
    //   JSON.stringify(openList, null, 2)
    // );

    let currentAStarNode = openList.dequeue();

    // if (currentAStarNode?.node.row === 1 && currentAStarNode.node.col === 2) {
    //   console.log("before updating visited state", JSON.stringify(grid[1][2], null, 2));
    // }

    // console.log("deuqueing", JSON.stringify(currentAStarNode!.node, null, 2));
    // console.log("dequeue fcost", JSON.stringify(currentAStarNode?.fCost, null, 2));

    updateGridDuringPathFind(currentAStarNode!.node);

    // if (currentAStarNode?.node.row === 1 && currentAStarNode.node.col === 2) {
    //   console.log("after updating visited state", JSON.stringify(grid[1][2], null, 2));
    // }
    await new Promise((resolve) => setTimeout(resolve, 1));
    // console.log("should grab the lowest f cost");
    // console.log("lowest f cost node", currentAStarNode);

    // what is this for

    if (currentAStarNode!.node.row === endNode.row && currentAStarNode!.node.col === endNode.col) {
      // console.log("in astar, we found endNode", JSON.stringify(grid[1][2], null, 2));
      // console.log("done with astar");
      const pathWithDirections: PathNodeWithDirection[] = reconstructPath(currentAStarNode!);

      console.log("pathWith", pathWithDirections);

      pathWithDirections.pop();
      

      for (const pathWithDirection of pathWithDirections) {
        await new Promise((resolve) => setTimeout(resolve, 20));

        if (stopExecution.current) {
          break;
        }
        setPathNodesWithDelay(pathWithDirection);
      }
      break;
    }

    closedSet.add(currentAStarNode!.node);

    let neighbors = getNeighbors(currentAStarNode!.node, grid);

    for (let neighbor of neighbors) {
      // essentially we have processed it already
      if (neighbor.isWall) {
        continue;
      }
      if (closedSet.has(neighbor)) {
        continue;
      }

      // only considering left, right, up and down, cost of reaching neighbor node if to go thru currentNode
      let tentativeCost = currentAStarNode!.gCost + 100;
      let existingNeighborNode = openList.contains(neighbor);

      if (existingNeighborNode) {
        if (tentativeCost < existingNeighborNode.gCost) {
          // Update the existing node's costs and parent
          existingNeighborNode.gCost = tentativeCost;
          existingNeighborNode.hCost = heuristic(neighbor, endNode);
          existingNeighborNode.fCost = tentativeCost + existingNeighborNode.hCost;
          existingNeighborNode.parent = currentAStarNode!;
          openList.reorder();

          // Rebalance or reorder the open list if necessary
          // (Specific implementation depends on the priority queue structure)
        }
      } else {
        // If the neighbor is not in the open list, add it as a new node
        let neighborAStarNode: AStarNode = {
          node: neighbor,
          gCost: tentativeCost,
          hCost: heuristic(neighbor, endNode),
          fCost: tentativeCost + heuristic(neighbor, endNode),
          parent: currentAStarNode!,
        };
        openList.enqueue(neighborAStarNode);

        // most likely where we will process node for visual
      }
    }
  }

  return null;
}

function heuristic(node: NodeType, endNode: NodeType): number {
  // Manhattan Distance
  return (Math.abs(node.col - endNode.col) + Math.abs(node.row - endNode.row)) * 100;
}

function getNeighbors(node: NodeType, grid: NodeType[][]): NodeType[] {
  const neighbors = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors;
}

function reconstructPath(endNode: AStarNode): PathNodeWithDirection[] {
  const path: PathNodeWithDirection[] = [];
  let currentNode: AStarNode | null = endNode;

  while (currentNode && currentNode.parent) {
    const direction = getDirectionFromPrevious(currentNode.parent, currentNode);
    path.unshift({ node: currentNode.node, direction }); // Store node with direction
    currentNode = currentNode.parent;
  }

  // Add the start node without direction or with 0 if needed
  if (currentNode) {
    path.unshift({ node: currentNode.node, direction: 0 });
  }

  return path;
}

function getDirectionFromPrevious(previousNode: AStarNode, currentNode: AStarNode): number {
  if (previousNode.node.row < currentNode.node.row) return 3; // Down
  if (previousNode.node.row > currentNode.node.row) return 1; // Up
  if (previousNode.node.col < currentNode.node.col) return 2; // Right
  if (previousNode.node.col > currentNode.node.col) return 4; // Left
  return 0; // Should not happen if there is always a previous node
}

export default AStar;
