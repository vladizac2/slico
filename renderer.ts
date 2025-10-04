
let renderCtx: CanvasRenderingContext2D;

function initRenderer(ctx: CanvasRenderingContext2D) {
    renderCtx = ctx;
}

function drawCircle(center: Point, fillColor: Color): void {

    let r = 15; // Bigger default radius

    renderCtx.beginPath();
    renderCtx.arc(center.x, center.y, r, 0, 2 * Math.PI);

    // Always fill with bright color
    renderCtx.fillStyle = fillColor || Color.YELLOW; // Default bright yellow
    renderCtx.fill();

    // Always stroke with contrasting color
    renderCtx.strokeStyle = '#000000'; // Default black border
    renderCtx.lineWidth = 2;
    renderCtx.stroke();
}

function drawLine(line: Line, color: Color, lineWidth: number): void {
    renderCtx.strokeStyle = color;
    renderCtx.lineWidth = lineWidth;
    renderCtx.beginPath();
    renderCtx.moveTo(line.getP1().x, line.getP1().y);
    renderCtx.lineTo(line.getP2().x, line.getP2().y);
    renderCtx.stroke();
}