import { NodeType } from "../Node";
import { PathNodeWithDirection } from "../Node";
async function dijkstra(
  grid: NodeType[][],
  startNode: NodeType | null,
  endNode: NodeType | null,
  updateGridDuringPathFind: (node: NodeType) => void,
  setPathNodesWithDelay: (pathNodeWithDirection: PathNodeWithDirection) => void
) {
  // console.log("inside dijkstra main function");

  let localGrid = createLocalGrid(grid);

  const localStartNode = localGrid[startNode!.row][startNode!.col];
  localStartNode.distance = 0;

  const nodes = getAllNodes(localGrid);

  // console.log("startnode's distance", localStartNode!.distance)
  // console.log("start node: ", localStartNode);
  // console.log("nodes array: ", nodes);

  while (!!nodes.length) {
    // console.log("inside while loop");
    // console.log("startNode after setting distance: ", localStartNode);
    sortNodesByDistance(nodes);
    // console.log("First few nodes after sorting: ", nodes.slice(0, 5));

    const closestNode = nodes.shift();
    // console.log("First node after shift (closestNode): ", closestNode);

    // console.log("inside while loop, checking isWall");

    if (closestNode!.isWall) continue;

    // console.log("inside while loop, checking distaance");
    // console.log("closestNode distance", closestNode!.distance)
    if (closestNode!.distance === Infinity) return grid;

    closestNode!.isVisited = true;

    await new Promise((resolve) => setTimeout(resolve, 1));

    // console.log("updating grid inside dij");
    updateGridDuringPathFind(closestNode!);

    if (closestNode === localGrid[endNode!.row][endNode!.col]) {
      const pathWithDirections: PathNodeWithDirection[] = reconstructPath(closestNode!);
      pathWithDirections.pop();
      // console.log(path);
      // console.log("calling SetPathNodes");
      // setPathNodes(path);
      for (const pathNodeWithDirection of pathWithDirections){
        await new Promise((resolve) => setTimeout(resolve, 80));
        setPathNodesWithDelay(pathNodeWithDirection); 

      }
      
      break;
    } // Found the shortest path

    updateUnvisitedNeighbors(closestNode!, localGrid);
  }
}

function getAllNodes(grid: NodeType[][]) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

function sortNodesByDistance(nodes: NodeType[]) {
  nodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

function updateUnvisitedNeighbors(node: NodeType, grid: NodeType[][]) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + 1;
    neighbor.previousNode = node;
    // console.log(neighbor.previousNode);
    // console.log("distance of neighbor", neighbor, neighbor.distance);
    // Here, you could add a "previousNode" property to reconstruct the path later
  }
}

function getUnvisitedNeighbors(node: NodeType, grid: NodeType[][]) {
  const neighbors = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter((neighbor) => !neighbor.isVisited);
}
function createLocalGrid(grid: NodeType[][]) {
  return grid.map((row) => row.map((node) => ({ ...node })));
}

function markNodeAsVisitedInLocalGrid(node: NodeType, localGrid: NodeType[][]) {
  const { row, col } = node;
  const gridNode = localGrid[row][col];
  gridNode.isVisited = true;
}

// function reconstructPath(endNode: NodeType) {
//   const path = [];
//   let currentNode: NodeType | null = endNode;
//   console.log("inside rescontruct", currentNode);
//   while (currentNode !== null) {
//     path.unshift(currentNode);
//     currentNode = currentNode.previousNode;
//   }
//   return path;
// }
function reconstructPath(endNode: NodeType): PathNodeWithDirection[] {
  const path: PathNodeWithDirection[] = [];
  let currentNode: NodeType | null = endNode;

  while (currentNode && currentNode.previousNode) {
    const direction = getDirectionFromPrevious(currentNode.previousNode, currentNode);
    path.unshift({ node: currentNode, direction }); // Store node with direction
    currentNode = currentNode.previousNode;
  }

  // Add the start node without direction or with 0 if needed
  if (currentNode) {
    path.unshift({ node: currentNode, direction: 0 });
  }

  return path;
}

function getDirectionFromPrevious(previousNode: NodeType, currentNode: NodeType): number {
  if (previousNode.row < currentNode.row) return 3; // Down
  if (previousNode.row > currentNode.row) return 1; // Up
  if (previousNode.col < currentNode.col) return 2; // Right
  if (previousNode.col > currentNode.col) return 4; // Left
  return 0; // Should not happen if there is always a previous node
}
export default dijkstra;
