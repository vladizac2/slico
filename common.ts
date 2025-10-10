const MIN_VAL = 0.0001
function IS_ZERO(val: number) {
    return (val >= -MIN_VAL && val <= MIN_VAL);
}

enum Color {
    YELLOW = '#ffff00',
    RED = '#ff0000',
    BLUE = '#0000ff',
    BLACK = '#ffffff'
}

interface Point {
    x: number;
    y: number;
}

interface CollidePoint {
    p: Point;
    d: number;
    line: Line;
}

function calcDist(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function calcSmlDiffPoint(p1: Point, p2: Point, diff: number): Point {
    let t = diff;
    return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
}

class Line {

    private readonly smlDiff = MIN_VAL * 5;
    private start: Point;
    private end: Point;
    private m: number;
    private d: number;

    constructor(start: Point, end: Point) {
        this.start = start;
        this.end = end;

        this.start = calcSmlDiffPoint(this.start, this.end, -this.smlDiff);
        this.end = calcSmlDiffPoint(this.end, this.start, -this.smlDiff);

        this.m = 1;
        this.calcM();

        this.d = calcDist(start, end);
    }

    public getStart(): Point {
        return this.start;
    }

    public getEnd(): Point {
        return this.end;
    }

    private calcM() {

        if (IS_ZERO(this.end.x - this.start.x)) {
            this.m = 1;
            return;
        }

        this.m = (this.end.y - this.start.y) / (this.end.x - this.start.x);
    }

    public getM(): number {
        return this.m;
    }

    private calcPointInLine(p: Point): boolean {
        const d1 = calcDist(p, this.start);
        if (d1 > this.d) {
            return false;
        }

        const d2 = calcDist(p, this.end);
        if (d2 > this.d) {
            return false;
        }

        return true;
    }

    public calcCollision(line: Line, collidePoint: Point): boolean {

        const x1 = this.start.x;
        const y1 = this.start.y;
        const m1 = this.m;

        const x2 = line.getStart().x;
        const y2 = line.getStart().y;
        const m2 = line.getM();

        if (IS_ZERO(m1 - m2)) {
            return false;
        }

        const x = (y2 - y1 + m1 * x1 - m2 * x2) / (m1 - m2);
        const y = m2 * (x - x2) + y2;

        collidePoint.x = x;
        collidePoint.y = y;

        if (!this.calcPointInLine(collidePoint)) {
            return false;
        }

        if (!line.calcPointInLine(collidePoint)) {
            return false;
        }

        return true;
    }

    public checkParallelYLineCollides(parallelPoint: Point): boolean {

        if (IS_ZERO(this.m)) {
            return false;
        }

        const x = (parallelPoint.y - this.start.y) / this.m + this.start.x;

        if (x < parallelPoint.x) {
            return false;
        }

        const p = { x: x, y: parallelPoint.y };

        if (!this.calcPointInLine(p)) {
            return false;
        }

        return true;
    }
}

interface CutLine {
    line: Line;
    collidePoint: Point;
    lineIndex: number;
}

interface Block {
    filled: boolean;
}

interface GridLine {
    xiStart: number;
    yiStart: number;
    xiEnd: number;
    yiEnd: number;
}
