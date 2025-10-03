const MIN_VAL = 0.0001
function IS_ZERO(val: number) {
    return (val >= -MIN_VAL && val <= MIN_VAL);
}

interface Point {
    x: number;
    y: number;
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

        this.d = this.calcDist(p1, p2);
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

    private calcDist(p1: Point, p2: Point): number {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
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

        const d1 = this.calcDist(p, this.p1);
        if (d1 > this.d) {
            return false;
        }

        const d2 = this.calcDist(p, this.p2);
        if (d2 > this.d) {
            return false;
        }

        return true;
    }
}