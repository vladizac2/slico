
let renderCtx: CanvasRenderingContext2D;

function initRenderer(ctx: CanvasRenderingContext2D) {
    renderCtx = ctx;
}

function drawCircle(center: Point, fillColor: Color): void {

    let r = 15; // Bigger default radius

    renderCtx.beginPath();
    renderCtx.arc(center.x, center.y, r, 0, 2 * Math.PI);

    renderCtx.fillStyle = fillColor || Color.YELLOW;
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
    renderCtx.moveTo(line.getStart().x, line.getStart().y);
    renderCtx.lineTo(line.getEnd().x, line.getEnd().y);
    renderCtx.stroke();
}