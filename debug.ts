enum Color {
    YELLOW = '#ffff00',
    RED = '#ff0000'
}

function drawCircle(ctx: CanvasRenderingContext2D, center: Point,
    fillColor: Color, strokeColor?: string): void {

    let r = 15; // Bigger default radius

    ctx.beginPath();
    ctx.arc(center.x, center.y, r, 0, 2 * Math.PI);

    // Always fill with bright color
    ctx.fillStyle = fillColor || Color.YELLOW; // Default bright yellow
    ctx.fill();

    // Always stroke with contrasting color
    ctx.strokeStyle = strokeColor || '#000000'; // Default black border
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawLine(ctx: CanvasRenderingContext2D, line: Line): void {
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(line.getP1().x, line.getP1().y);
    ctx.lineTo(line.getP2().x, line.getP2().y);
    ctx.stroke();
}