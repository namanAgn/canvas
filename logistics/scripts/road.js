import { selectedTool, mouse } from './dom.js';
import { camera } from './canvas.js';
import { GRID_SIZE } from './constants.js';
import { drawCircle, drawLine, screenToWorld, drawQuadraticBezier } from './utils.js'; 

const ROAD_COLOR = "#303030";
const MARKING_COLOR = "#d8d8d8";
const PAVEMENT_COLOR = "#666666";
const ROAD_GHOST_COLOR = "#3d83c9";
let ROAD_PLACEMENT_PHASE = 0;
const ROAD_WIDTH = GRID_SIZE / 4;
const SNAPPING_DISTANCE = GRID_SIZE;

let ghostRoad = {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    controlPoint: { x: 0, y: 0 }
};

let roads = [];

export function findClosestNode() {
    if (selectedTool !== "straight" && selectedTool !== "curve") {
        return;
    }

    const worldMouse = screenToWorld(mouse.x, mouse.y);
    let closestNode = null;
    let closestDistance = SNAPPING_DISTANCE;

    roads.forEach(road => {
        const points = [road.start, road.end];
        points.forEach(point => {
            const distance = Math.hypot(
                worldMouse.x - point.x,
                worldMouse.y - point.y
            );

            if (distance < closestDistance) {
                closestDistance = distance;
                closestNode = point;
            }
        });
    });

    const targetPoint = closestNode || worldMouse;

    // Apply snapped or raw coordinates based on state phase
    if (ROAD_PLACEMENT_PHASE === 0) {
        ghostRoad.start = targetPoint;
    } else if (
        (selectedTool === "straight" && ROAD_PLACEMENT_PHASE === 1) ||
        (selectedTool === "curve" && ROAD_PLACEMENT_PHASE === 4)
    ) {
        ghostRoad.end = targetPoint;
    }
}

export function drawRoadGhost() {
    // Ensure snapping coordinates are updated before rendering ghost overlay
    findClosestNode();

    if ((selectedTool === "curve" || selectedTool === "straight") && ROAD_PLACEMENT_PHASE === 0) {
        drawCircle(ghostRoad.start.x, ghostRoad.start.y, ROAD_WIDTH / 2, ROAD_GHOST_COLOR);
    }
    
    if (selectedTool === "straight" && ROAD_PLACEMENT_PHASE === 1) {
        drawLine(ghostRoad.start, ghostRoad.end, ROAD_WIDTH, ROAD_GHOST_COLOR, ROAD_WIDTH / 2);
    }
    
    if (selectedTool === "curve" && ROAD_PLACEMENT_PHASE === 3) {
        const worldMouse = screenToWorld(mouse.x, mouse.y);
        drawLine(ghostRoad.start, worldMouse, ROAD_WIDTH, ROAD_GHOST_COLOR, ROAD_WIDTH / 2);
    }

    if (selectedTool === "curve" && ROAD_PLACEMENT_PHASE === 4) {
        drawQuadraticBezier(
            ghostRoad.start,
            ghostRoad.controlPoint,
            ghostRoad.end,
            ROAD_WIDTH,
            ROAD_GHOST_COLOR,
            true
        );
    }
}

window.addEventListener('mousedown', e => {
    // Ensure ghost values reflect snapping at moment of click
    findClosestNode();

    if (e.button === 0) {
        if (selectedTool === "straight") {
            if (ROAD_PLACEMENT_PHASE === 0) {
                ROAD_PLACEMENT_PHASE = 1;
            } else if (ROAD_PLACEMENT_PHASE === 1) {
                roads.push({
                    start: { ...ghostRoad.start },
                    end: { ...ghostRoad.end },
                    type: "straight"
                });
                
                resetGhostRoad();
                ROAD_PLACEMENT_PHASE = 0;
            }
        } else if (selectedTool === "curve") {
            if (ROAD_PLACEMENT_PHASE === 0) {
                ROAD_PLACEMENT_PHASE = 3;
            } else if (ROAD_PLACEMENT_PHASE === 3) {
                ghostRoad.controlPoint = screenToWorld(mouse.x, mouse.y);
                ROAD_PLACEMENT_PHASE = 4;
            } else if (ROAD_PLACEMENT_PHASE === 4) {
                roads.push({
                    start: { ...ghostRoad.start },
                    controlPoint: { ...ghostRoad.controlPoint },
                    end: { ...ghostRoad.end },
                    type: "curve"
                });
                
                resetGhostRoad();
                ROAD_PLACEMENT_PHASE = 0;
            }
        }
    }

    // Right click / Middle click cancel
    if (e.button === 1 || e.button === 2) {
        if ((selectedTool === "straight" || selectedTool === "curve") && ROAD_PLACEMENT_PHASE >= 1) {
            resetGhostRoad();
            ROAD_PLACEMENT_PHASE = 0;
        }
    }
});

function resetGhostRoad() {
    ghostRoad = {
        start: { x: 0, y: 0 },
        end: { x: 0, y: 0 },
        controlPoint: { x: 0, y: 0 }
    };
}

export function drawRoads() {
    roads.forEach(road => {
        if (road.type === "straight") {
            drawLine(road.start, road.end, ROAD_WIDTH + 4, PAVEMENT_COLOR, true);
        } else {
            drawQuadraticBezier(road.start, road.controlPoint, road.end, ROAD_WIDTH + 4, PAVEMENT_COLOR, true);
        }
    });
    
    roads.forEach(road => {
        if (road.type === "straight") {
            drawLine(road.start, road.end, ROAD_WIDTH, ROAD_COLOR, ROAD_WIDTH / 2);
        } else {  
            drawQuadraticBezier(road.start, road.controlPoint, road.end, ROAD_WIDTH, ROAD_COLOR, true);
        }
    });
}