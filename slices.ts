
// Slices Class
class Slices {
    private ctx: CanvasRenderingContext2D;
    private shape: Shape;
    private lines: Line[];
    private started: boolean;

    private startCutLine: Line | null;
    private lastPos: Point;
    private newSliceTime: number;

    private startSlicePointShown = false;
    private endSlicePointShown = false;
    private startSlicePoint: Point;
    private endSlicePoint: Point;
    private slicePointsShowTime = 0;

    private readonly NEW_SLICE_TIME = 2;
    private readonly SLICE_POINT_SHOW_TIME = 50;

    constructor(ctx: CanvasRenderingContext2D, shape: Shape) {
        this.ctx = ctx;
        this.shape = shape;
        this.lines = [];
        this.started = false;
        this.lastPos = { x: 0, y: 0 };
        this.startCutLine = null;
        this.newSliceTime = 0;
        this.startSlicePoint = { x: 0, y: 0 };
        this.endSlicePoint = { x: 0, y: 0 };
    }

    private addNewLine(p1: Point, p2: Point) {
        this.lines.push(new Line(p1, p2));
    }

    private handleSpawningNewLine(curMousePos: Point) {

        if (!this.started) {
            return;
        }

        this.newSliceTime++;

        if (this.newSliceTime >= this.NEW_SLICE_TIME) {

            if (calcDist(this.lastPos, curMousePos) > this.shape.getMinPointsDist()) {
                this.addNewLine(this.lastPos, curMousePos);
            }

            this.lastPos = curMousePos;
            this.newSliceTime = this.newSliceTime - this.NEW_SLICE_TIME;
        }
    }

    public update(prevMousePos: Point, curMousePos: Point) {

        const prevIn = this.shape.inside(prevMousePos);
        const curIn = this.shape.inside(curMousePos);

        if (!prevIn && curIn) {
            let collisionPoint = { x: 0, y: 0 };
            const cutLine: Line | null = this.shape.calcCutLine(prevMousePos, curMousePos, collisionPoint);

            if (cutLine == null) {
                console.error("No cut line for prev out and cur in");
                return;
            }

            this.started = true;
            this.startCutLine = cutLine;
            this.lastPos = collisionPoint;

            this.startSlicePointShown = true;
            this.startSlicePoint = { ... this.lastPos };

        } else if (prevIn && !curIn) {

            if (this.started) {

                let collisionPoint = { x: 0, y: 0 };
                const cutLine: Line | null = this.shape.calcCutLine(prevMousePos, curMousePos, collisionPoint);
                if (cutLine == null) {
                    console.error("No cut line for prev in and cur out");
                    return;
                }

                this.started = false;
                this.addNewLine(this.lastPos, collisionPoint);
                this.endSlicePointShown = true;
                this.endSlicePoint = { ...collisionPoint };
                this.shape.handleCutShape(this.lines, cutLine, this.startCutLine);
            }

            this.reset();
        } else if (prevIn && curIn && !this.started) {
            this.started = true;
            this.lastPos = curMousePos;
            this.startSlicePointShown = true;
            this.startSlicePoint = { ... this.lastPos };
        } else if (!prevIn && !curIn) {
            return;
        }

        this.handleSpawningNewLine(curMousePos);
    }

    private reset() {
        this.lines = [];
        this.started = false;
        this.lastPos = { x: 0, y: 0 };
        this.newSliceTime = 0;
    }

    public render() {

        for (let i = 0; i < this.lines.length; i++) {
            drawLine(this.lines[i], Color.YELLOW, 12);
        }

        if (this.startSlicePointShown) {

        }

    }

}
