const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const camera = { x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 1, min: 0.2, max: 5 };
let target = { x: camera.x, y: camera.y, scale: camera.scale };
const SMOOTHING = 0.15;

let isPanning = false;
let panStart = { x: 0, y: 0 };
let targetAtPanStart = { x: 0, y: 0 };
let mouse = { x: 0, y: 0 };

function worldToScreen(wx, wy) {
    return { x: wx * camera.scale + camera.x, y: wy * camera.scale + camera.y };
}
function screenToWorld(sx, sy) {
    return { x: (sx - camera.x) / camera.scale, y: (sy - camera.y) / camera.scale };
}
function lerp(a, b, t) { return a + (b - a) * t; }

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

function update() {
    // your logic here
}

function draw() {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // your drawing here
}

function loop() {
    camera.x = lerp(camera.x, target.x, SMOOTHING);
    camera.y = lerp(camera.y, target.y, SMOOTHING);
    camera.scale = lerp(camera.scale, target.scale, SMOOTHING);

    update();
    draw();

    requestAnimationFrame(loop);
}
loop();