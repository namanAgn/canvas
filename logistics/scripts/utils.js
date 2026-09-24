import { camera, ctx, canvas } from './canvas.js';
import { GRID_SIZE, GRID_COLOR } from './constants.js';

export function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

export function drawCircle(x, y, radius, color) {
    const screen = worldToScreen(x, y);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
        screen.x,
        screen.y,
        radius * camera.scale,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

export function drawLine(p1, p2, width, color, round = false) {
    const start = worldToScreen(p1.x, p1.y);
    const end = worldToScreen(p2.x, p2.y);

    ctx.strokeStyle = color;
    ctx.lineWidth = width * camera.scale;
    ctx.lineCap = round ? 'round' : 'butt';

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}

export function drawQuadraticBezier(p0, p1, p2, width, color, round = false) {
    const start = worldToScreen(p0.x, p0.y);
    const control = worldToScreen(p1.x, p1.y);
    const end = worldToScreen(p2.x, p2.y);

    ctx.strokeStyle = color;
    ctx.lineWidth = width * camera.scale;
    ctx.lineCap = round ? 'round' : 'butt';

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.quadraticCurveTo(
        control.x,
        control.y,
        end.x,
        end.y
    );
    ctx.stroke();
}

export function drawGrid() {
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

export function worldToScreen(wx, wy) {
    return { x: wx * camera.scale + camera.x, y: wy * camera.scale + camera.y };
}

export function screenToWorld(sx, sy) {
    return { x: (sx - camera.x) / camera.scale, y: (sy - camera.y) / camera.scale };
}

export function lerp(a, b, t) { return a + (b - a) * t; }