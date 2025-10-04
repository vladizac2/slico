const MIN_VAL = 0.0001
function IS_ZERO(val: number) {
    return (val >= -MIN_VAL && val <= MIN_VAL);
}

enum Color {
    YELLOW = '#ffff00',
    RED = '#ff0000'
}

interface Point {
    x: number;
    y: number;
}

function calcDist(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

class Line {

    private p1: Point;
    private p2: Point;
    private m: number;
    private d: number;

    constructor(p1: Point, p2: Point) {
        this.p1 = p1;
        this.p2 = p2;
        this.m = 1;
        this.calcM();

        this.d = calcDist(p1, p2);
    }

    public getP1(): Point {
        return this.p1;
    }

    public getP2(): Point {
        return this.p2;
    }

    private calcM() {

        if (IS_ZERO(this.p2.x - this.p1.x)) {
            this.m = 1;
            return;
        }

        this.m = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
    }

    public getM(): number {
        return this.m;
    }

    public calcCollision(line: Line, collidePoint: Point): boolean {

        const x1 = this.p1.x;
        const y1 = this.p1.y;
        const m1 = this.m;

        const x2 = line.getP1().x;
        const y2 = line.getP1().y;
        const m2 = line.getM();

        if (IS_ZERO(m1 - m2)) {
            return false;
        }

        const x = (y2 - y1 + m1 * x1 - m2 * x2) / (m1 - m2);
        const y = m2 * (x - x2) + y2;

        collidePoint.x = x;
        collidePoint.y = y;

        return true;
    }

    public checkParallelYLineCollides(parallelPoint: Point): boolean {

        if (IS_ZERO(this.m)) {
            return false;
        }

        const x = (parallelPoint.y - this.p1.y) / this.m + this.p1.x;

        if (x < parallelPoint.x) {
            return false;
        }

        const p = { x: x, y: parallelPoint.y };

        const d1 = calcDist(p, this.p1);
        if (d1 > this.d) {
            return false;
        }

        const d2 = calcDist(p, this.p2);
        if (d2 > this.d) {
            return false;
        }

        return true;
    }
}