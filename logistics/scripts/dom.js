import { camera, canvas, ctx } from './canvas.js';
import { lerp } from './utils.js';

let target = { x: camera.x, y: camera.y, scale: camera.scale };

const SMOOTHING = 0.15;

let isPanning = false;
let panStart = { x: 0, y: 0 };
let targetAtPanStart = { x: 0, y: 0 };
export let mouse = { x: 0, y: 0 };

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
window.dispatchEvent(new Event('resize'));

window.addEventListener('contextmenu', e => e.preventDefault());

window.addEventListener('mousedown', e => {
    if (e.button === 2) {
        isPanning = true;
        panStart = { x: e.clientX, y: e.clientY };
        targetAtPanStart = { x: target.x, y: target.y };
    }
});

window.addEventListener('mouseup', e => { if (e.button === 2) isPanning = false; });

window.addEventListener('mousemove', e => {
    if (isPanning) {
        target.x = targetAtPanStart.x + (e.clientX - panStart.x);
        target.y = targetAtPanStart.y + (e.clientY - panStart.y);
    }
    mouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(camera.max, Math.max(camera.min, target.scale * factor));
    const worldX = (e.clientX - camera.x) / camera.scale;
    const worldY = (e.clientY - camera.y) / camera.scale;
    target.scale = newScale;
    target.x = e.clientX - worldX * newScale;
    target.y = e.clientY - worldY * newScale;
}, { passive: false });

export function zoom() {
    camera.x = lerp(camera.x, target.x, SMOOTHING);
    camera.y = lerp(camera.y, target.y, SMOOTHING);
    camera.scale = lerp(camera.scale, target.scale, SMOOTHING);
}


export let keys = {
    "`": false,
    "1": false,
    "2": false,
    "3": false,
}

const curveButton = document.querySelector(".tool.curve");
const straightButton = document.querySelector(".tool.straight");
const houseButton = document.querySelector(".tool.house");

export let selectedTool = "none";

function removeSelection() {
    curveButton.classList.remove("selected");
    straightButton.classList.remove("selected");
    houseButton.classList.remove("selected");
}

curveButton.addEventListener('click', () => {
    removeSelection();
    curveButton.classList.add("selected");
    selectedTool = "curve";
});

straightButton.addEventListener('click', () => {
    removeSelection();
    straightButton.classList.add("selected");
    selectedTool = "straight";
});

houseButton.addEventListener('click', () => {
    removeSelection();
    houseButton.classList.add("selected");
    selectedTool = "house";
});

window.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = true;

    if (key === "`") {
        removeSelection();
    }
    else if (key === "1") {
        removeSelection();
        curveButton.classList.add("selected");
        selectedTool = "curve"; 
    }
    else if (key === "2") {
        removeSelection();
        straightButton.classList.add("selected");
        selectedTool = "straight"; 
    }
    else if (key === "3") {
        removeSelection();
        houseButton.classList.add("selected");
        selectedTool = "house"; 
    }
});

window.addEventListener("keyup", e => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = false;
});

