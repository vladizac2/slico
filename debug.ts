
interface DrawPoint {
    p: Point;
    color: Color;
}

let debugKeepPoints: DrawPoint[];

function initDebug() {
    debugKeepPoints = [];
}

function drawDebugCircle(center: Point, fillColor: Color, keep?: boolean): void {

    drawCircle(center, fillColor);

    if (keep) {
        debugKeepPoints.push({ p: center, color: fillColor });
    }

}



function renderDebugKeeps() {

    for (const dp of debugKeepPoints) {
        drawCircle(dp.p, dp.color);
    }
}