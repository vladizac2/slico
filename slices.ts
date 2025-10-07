
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

    private checkSelfCollision(prevMousePos: Point, curMousePos: Point) {

        for (const line of this.lines) {

        }
    }

    public update(prevMousePos: Point, curMousePos: Point) {

        if (calcDist(prevMousePos, curMousePos) <= MIN_VAL) {
            return;
        }

        let curLine = new Line(prevMousePos, curMousePos);
        let collidePoints: CollidePoint[] = [];
        this.shape.buildLineCollisions(curLine, collidePoints);

        let isIn = this.shape.inside(curLine.getStart());

        if (collidePoints.length > 0 && isIn) {
            this.lastPos = curLine.getStart();
        }

        for (let i = 0; i < collidePoints.length; i++) {

            const cp = collidePoints[i];

            if (!isIn) {
                this.lastPos = cp.p;
                this.startCutLine = cp.line;
                this.started = true;
                this.addSlicedShape(this.lastPos);

            } else {

                if (this.started) {

                    this.started = false;
                    this.addNewLine(this.lastPos, cp.p);

                    this.startSlicedShape(cp.p);
                    this.shape.handleCutShape(this.lines, cp.line, this.startCutLine);

                }

                this.initSlice();
            }

            isIn = !isIn;
        }

        let curIn = this.shape.inside(curLine.getEnd());

        if (isIn && curIn && !this.started) {
            this.started = true;
            this.lastPos = curLine.getEnd();

            this.addSlicedShape(this.lastPos);
        } else if (!isIn && !curIn) {
            return;
        }

        this.handleSpawningNewLine(curLine.getEnd());
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
