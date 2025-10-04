enum Color {
    YELLOW = '#ffff00',
    RED = '#ff0000'
}

interface DrawPoint {
    p: Point;
    color: Color;
}

let debugCtx: CanvasRenderingContext2D;
let debugKeepPoints: DrawPoint[]

function initDebug(ctx: CanvasRenderingContext2D) {
    debugKeepPoints = [];
    debugCtx = ctx;
}

function drawCircle(center: Point,
    fillColor: Color, keep?: boolean, strokeColor?: string): void {

    let r = 15; // Bigger default radius

    debugCtx.beginPath();
    debugCtx.arc(center.x, center.y, r, 0, 2 * Math.PI);

    // Always fill with bright color
    debugCtx.fillStyle = fillColor || Color.YELLOW; // Default bright yellow
    debugCtx.fill();

    // Always stroke with contrasting color
    debugCtx.strokeStyle = strokeColor || '#000000'; // Default black border
    debugCtx.lineWidth = 2;
    debugCtx.stroke();

    if (keep) {
        debugKeepPoints.push({ p: center, color: fillColor });
    }

}

function drawLine(line: Line): void {
    debugCtx.strokeStyle = '#ffff00';
    debugCtx.lineWidth = 3;
    debugCtx.beginPath();
    debugCtx.moveTo(line.getP1().x, line.getP1().y);
    debugCtx.lineTo(line.getP2().x, line.getP2().y);
    debugCtx.stroke();
}

function renderDebugKeeps() {

    for (const dp of debugKeepPoints) {
        drawCircle(dp.p, dp.color);
    }
}