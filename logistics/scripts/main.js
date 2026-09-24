import { selectedTool, keys, zoom } from './dom.js';
import { drawRect, drawGrid, screenToWorld, worldToScreen, lerp } from './utils.js';
import { camera, ctx, canvas } from './canvas.js';
import { GRID_SIZE, GRID_COLOR, BG_COLOR } from './constants.js';
import { drawRoadGhost, drawRoads, findClosestNode } from './road.js';

function update() {
    findClosestNode();
}

function draw() {
    drawRect(0, 0, canvas.width, canvas.height, BG_COLOR);
    drawGrid();
    drawRoads();
    drawRoadGhost();
}

function loop() {
    zoom();

    update();
    draw();

    requestAnimationFrame(loop);
}
loop();