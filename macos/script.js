const GRID_SIZE = 64;

const HOUSE_W = GRID_SIZE * 1.5;
const HOUSE_H = GRID_SIZE;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

window.dispatchEvent(new Event('resize'));

function worldToScreen(wx, wy) {
    return { x: wx * camera.scale + camera.x, y: wy * camera.scale + camera.y };
}

function screenToWorld(sx, sy) {
    return { x: (sx - camera.x) / camera.scale, y: (sy - camera.y) / camera.scale };
}

function lerp(a, b, t) { return a + (b - a) * t; }

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
    const worldMouse = screenToWorld(mouse.x, mouse.y);

    if (selectedTool === "house") {
        ghostBuilding.x = worldMouse.x;
        ghostBuilding.y = worldMouse.y;
    }
});

window.addEventListener('wheel', e => {
    if (selectedTool === "house") {
        e.preventDefault();
        ghostBuilding.angle += e.deltaX < 0 ? 5 : -5;
    }
    else {
        e.preventDefault();

        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        const newScale = Math.min(
            camera.max,
            Math.max(camera.min, target.scale * factor)
        );

        const worldX = (e.clientX - camera.x) / camera.scale;
        const worldY = (e.clientY - camera.y) / camera.scale;

        target.scale = newScale;
        target.x = e.clientX - worldX * newScale;
        target.y = e.clientY - worldY * newScale;
    }
}, { passive: false });

let keys = {
    "`": false,
    "1": false,
    "2": false,
    "shift": false,
}

let ghostBuilding = {};
let selectedTool = "none";

window.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    if (key in keys) {
        keys[key] = true;
    }
});

window.addEventListener('keyup', e => {
                  const key = e.key.toLowerCase();
    if (key in keys) {
        keys[key] = false;
    }
});

function chooseGhost() {
    const worldMouse = screenToWorld(mouse.x, mouse.y);

    if (keys["`"]) {
        selectedTool = "none";
    }
    else if (keys["1"]) {
        if (selectedTool !== "house") {
            selectedTool = "house";

            ghostBuilding = {
                x: worldMouse.x,
                y: worldMouse.y,
                w: HOUSE_W,
                h: HOUSE_H,
                type: "house",
                angle: 0,
            };
        }
    }
}

function drawGhost() {
    if (selectedTool === "house") {
        drawRect(ghostBuilding.x - ghostBuilding.w / 2, ghostBuilding.y - ghostBuilding.h / 2, ghostBuilding.w, ghostBuilding.h, "#ffffff75", ghostBuilding.angle);
    }
}
 
function drawRect(wx, wy, ww, wh, color, angle = 0) {
    const p = worldToScreen(wx, wy);
    const w = ww * camera.scale;
    const h = wh * camera.scale;

    const radians = angle * Math.PI / 180;

    ctx.save();

    ctx.translate(p.x + w / 2, p.y + h / 2);
    ctx.rotate(radians);

    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -h / 2, w, h);

    ctx.restore();
}

function drawLine(wx1, wy1, wx2, wy2, color, width = 1) {
    const p1 = worldToScreen(wx1, wy1);
    const p2 = worldToScreen(wx2, wy2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function drawGrid() {
    const step = GRID_SIZE * camera.scale;
    if (step < 3) return;
    const offsetX = ((camera.x % step) + step) % step;
    const offsetY = ((camera.y % step) + step) % step;
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = offsetX; x < canvas.width; x += step) {
        ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, canvas.height);
    }
    for (let y = offsetY; y < canvas.height; y += step) {
        ctx.moveTo(0, y + 0.5); ctx.lineTo(canvas.width, y + 0.5);
    }
    ctx.stroke();
}

function update() {
    chooseGhost();
}

function draw() {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();
    drawGhost();
}

function loop() {
    camera.x = lerp(camera.x, target.x, SMOOTHING);
    camera.y = lerp(camera.y, target.y, SMOOTHING);
    camera.scale = lerp(camera.scale, target.scale, SMOOTHING);
    
    draw();
    update();
    
    requestAnimationFrame(loop)
}

loop();