const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const camera = { x: 0, y: 0, scale: 1, min: 0.2, max: 5 };
let target = { x: camera.x, y: camera.y, scale: camera.scale };
const SMOOTHING = 0.15;

let isPanning = false;
let panStart = { x: 0, y: 0 };
let targetAtPanStart = { x: 0, y: 0 };
let mouse = { x: 0, y: 0 };

const BG_COLOR = "#1a1a1a";
const GRID_COLOR = "#232323";
const GRID_SIZE = 24;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

window.dispatchEvent(new Event('resize'));

const TILES = {
    DEEP_WATER: 1,
    SHALLOW_WATER: 2,
    BEACH: 3,
    LAND: 4,
    MOUNTAIN: 5,
    SNOW_MOUNTAIN: 6,
    HOUSE: 7
};

const IMPASSABLE_TILES = [
    1, 2, 5, 6, 7
]

let map = [];
let houses = [];
const MAP_SIZE = 150;

function generateHeightMap() {
    const seed = Math.random() * 1000000;
    const noise = new SimplexNoise(seed);

    const heightMap = Array.from({ length: MAP_SIZE }, () =>
        Array(MAP_SIZE).fill(0)
    );

    const frequency = 0.012;
    const octaves = 4;
    const baseAmplitude = 1;

    for (let x = 0; x < MAP_SIZE; x++) {
        for (let y = 0; y < MAP_SIZE; y++) {

            let freq = frequency;
            let amplitude = baseAmplitude;

            let value = 0;
            let totalAmplitude = 0;

            for (let i = 0; i < octaves; i++) {
                value += noise.noise2D(x * freq, y * freq) * amplitude;

                totalAmplitude += amplitude;

                freq *= 2;
                amplitude *= 0.5;
            }

            value = value / totalAmplitude;
            value = (value + 1) / 2;

            value = Math.pow(value, 1.15);

            heightMap[y][x] = value;
        }
    }

    return heightMap;
}

function getTerrain(height) {
    if (height < 0.32)
        return TILES.DEEP_WATER;

    if (height < 0.37)
        return TILES.SHALLOW_WATER;

    if (height < 0.40)
        return TILES.BEACH;

    if (height < 0.68)
        return TILES.LAND;

    if (height < 0.75)
        return TILES.MOUNTAIN;

    return TILES.SNOW_MOUNTAIN;
}

function createMap() {
    map = Array.from({ length: MAP_SIZE }, () =>
        Array(MAP_SIZE).fill(TILES.EMPTY)
    );
}

const heightMap = generateHeightMap();

createMap();

const DIRECTIONS = [
    "north",
    "south",
    "east", 
    "west"
];

function createHouse() {
    const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    console.log(direction);
}

createHouse();

function initializeMap() {
    for (let y = map.length - 1; y >= 0; y--) {
        for (let x = map[y].length - 1; x >= 0; x--) {
            const tile = getTerrain(heightMap[y][x]);
            
            map[y][x] = {
                terrain: tile,
                building: null,
                isEnterance: false,
                isSolid: IMPASSABLE_TILES.includes(tile)
            };
        }
    }
}

initializeMap();

camera.x = MAP_SIZE / 2 * GRID_SIZE;
camera.y = MAP_SIZE / 2 * GRID_SIZE;

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

function drawRect(wx, wy, ww, wh, color) {
    const p = worldToScreen(wx, wy);
    const x = Math.floor(p.x);
    const y = Math.floor(p.y);
    const w = Math.ceil((wx + ww) * camera.scale + camera.x) - x + 1;
    const h = Math.ceil((wy + wh) * camera.scale + camera.y) - y + 1;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
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

function getColor(tile) {
    switch (tile) {
        case TILES.DEEP_WATER:
            return "#4b7eeb";

        case TILES.SHALLOW_WATER:
            return "#0ebbe6";

        case TILES.BEACH:
            return "#e8d38a";

        case TILES.LAND:
            return "#6fdf7e";

        case TILES.MOUNTAIN:
            return "#8c8c8c";

        case TILES.SNOW_MOUNTAIN:
            return "#bfc6da";

        default:
            return "#000000";
    }
}

function drawMap() {
    for (let y = map.length - 1; y >= 0; y--) {
        for (let x = map[y].length - 1; x >= 0; x--) {
            const wx = x * GRID_SIZE;
            const wy = y * GRID_SIZE;
                
            let color = getColor(map[y][x].terrain);

            drawRect(wx, wy, GRID_SIZE, GRID_SIZE, color)
        }
    }
}

function update() {
    // your logic here
}

function draw() {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawMap();
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