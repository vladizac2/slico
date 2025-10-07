
// Slices Class
class Slices {
    private ctx: CanvasRenderingContext2D;
    private shape: Shape;
    private lines: Line[];
    private started: boolean;

    private startCutLine: Line | null;
    private lastPos: Point;
    private newSliceTime: number;

    private curSlicedShape: SlicedShape | null;
    private slicedShapes: SlicedShape[];
    private readonly NEW_SLICE_TIME = 2;


    constructor(ctx: CanvasRenderingContext2D, shape: Shape) {
        this.ctx = ctx;
        this.shape = shape;
        this.lines = [];
        this.started = false;
        this.lastPos = { x: 0, y: 0 };
        this.startCutLine = null;
        this.newSliceTime = 0;
        this.curSlicedShape = null;
        this.slicedShapes = [];
    }

    private addNewLine(p1: Point, p2: Point) {
        this.lines.push(new Line(p1, p2));
    }

    private handleSpawningNewLine(curMousePos: Point) {

        if (!this.started) {
            return;
        }

        this.newSliceTime++;

        if (this.newSliceTime >= this.NEW_SLICE_TIME && calcDist(this.lastPos, curMousePos) > this.shape.getMinPointsDist()) {

            this.addNewLine(this.lastPos, curMousePos);
            this.lastPos = curMousePos;
            this.newSliceTime = this.newSliceTime - this.NEW_SLICE_TIME;
        }
    }

    private addSlicedShape(startSlicePoint: Point) {
        this.curSlicedShape = new SlicedShape(this.ctx, startSlicePoint);
        this.slicedShapes.push(this.curSlicedShape);
    }

    private startSlicedShape(endSlicePoint: Point) {
        if (this.curSlicedShape == null) {
            console.error("Cur slice shape is null in end");
        } else {
            this.curSlicedShape.start(endSlicePoint);
            this.curSlicedShape = null;
        }
    }

    private handleMultColliding(curLine: Line): boolean {

        let collidePoints: CollidePoint[] = [];
        this.shape.buildLineCollisions(curLine, collidePoints);

        if (collidePoints.length <= 1) {
            return false;
        }

        let isIn = this.shape.inside(curLine.getStart());

        if (isIn) {
            this.lastPos = curLine.getStart();
        }

        for (let i = 0; i < collidePoints.length; i++) {

            const cp = collidePoints[i];

            if (!isIn) {
                this.lastPos = cp.p;
                this.startCutLine = cp.line;
                this.started = true;
                this.addSlicedShape(this.lastPos);

                //console.log(`1: ${this.shape.inside(this.lastPos)} ${this.shape.inside(calcSmlDiffPoint(this.lastPos, curLine.getEnd()))} `);
            } else {

                if (this.started) {

                    this.started = false;
                    this.addNewLine(this.lastPos, cp.p);

                    this.startSlicedShape(cp.p);
                    this.shape.handleCutShape(this.lines, cp.line, this.startCutLine);
                    // console.log("2");
                } else {
                    // console.log("2.5");
                }

                this.initSlice();
            }

            isIn = !isIn;
        }

        return true;
    }

    private checkSelfCollision(prevMousePos: Point, curMousePos: Point) {

        for (const line of this.lines) {

        }
    }

    public update(prevMousePos: Point, curMousePos: Point) {

        if (calcDist(prevMousePos, curMousePos) <= MIN_VAL) {
            return;
        }

        // console.log("-------------------------");

        let curLine = new Line(prevMousePos, curMousePos);
        if (this.handleMultColliding(curLine)) {
            return;
        }

        const prevIn = this.shape.inside(prevMousePos);
        const curIn = this.shape.inside(curMousePos);

        //console.log(`out: ${prevIn} ${curIn} ${this.started} `)

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

            this.addSlicedShape(this.lastPos);

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

                this.startSlicedShape(collisionPoint);
                this.shape.handleCutShape(this.lines, cutLine, this.startCutLine);
            }

            this.initSlice();

        } else if (prevIn && curIn && !this.started) {
            this.started = true;
            this.lastPos = curMousePos;

            this.addSlicedShape(this.lastPos);
        } else if (!prevIn && !curIn) {
            return;
        }

        this.handleSpawningNewLine(curMousePos);
    }

    private initSlice() {
        this.lines = [];
        this.started = false;
        this.lastPos = { x: 0, y: 0 };
        this.newSliceTime = 0;
    }

    public reset() {
        this.initSlice();
        this.curSlicedShape = null;
        this.slicedShapes = [];
    }

    public render() {

        for (let i = 0; i < this.lines.length; i++) {
            drawLine(this.lines[i], Color.YELLOW, 12);
        }

        for (let i = this.slicedShapes.length - 1; i >= 0; i--) {
            const slicedShape = this.slicedShapes[i];
            const remove = slicedShape.render();
            if (remove) {
                this.slicedShapes.splice(i, 1);
            }
        }

        // console.log(`count: ${this.slicedShapes.length}`);

    }

}
