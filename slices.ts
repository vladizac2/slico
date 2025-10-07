
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
            this.curSlicedShape.start(endSlicePoint, this.lines);
            this.curSlicedShape = null;
        }
    }

    private setSlicedShape(newStartSlicePoint: Point) {

        if (this.curSlicedShape == null) {
            console.error("Cur slice shape is null in set");
        } else {
            this.curSlicedShape.set(newStartSlicePoint);
        }
    }

    private checkSelfCollision(curMousePos: Point) {

        let tmp = { x: 0, y: 0 };
        let minDist = -1;
        let minCollidePoint = { x: 0, y: 0 };
        let minCollideLine: Line | null = null;

        if (this.lines.length <= 0) {
            return;
        }

        const lastLine = this.lines[this.lines.length - 1];

        for (let i = 0; i < this.lines.length - 2; i++) {
            const line = this.lines[i];

            if (line.calcCollision(lastLine, tmp)) {
                const d = calcDist(tmp, lastLine.getStart());

                if (minDist < 0 || d < minDist) {
                    minDist = d;
                    minCollideLine = line;
                    minCollidePoint = { ...tmp };
                }
            }
        }

        if (minCollideLine != null) {

            this.clearSlice();

            this.started = true;
            this.lastPos = curMousePos;

            this.setSlicedShape(this.lastPos);

            // if (calcDist(this.lastPos, minCollidePoint) > this.shape.getMinPointsDist()) {
            //     this.addNewLine(minCollidePoint, this.lastPos);
            // }

            console.log("0.1");
            return true;
        }

        return false;
    }

    public update(prevMousePos: Point, curMousePos: Point) {

        if (calcDist(prevMousePos, curMousePos) <= MIN_VAL) {
            return;
        }

        let curLine = new Line(prevMousePos, curMousePos);

        console.log("----------------");

        if (this.checkSelfCollision(curMousePos)) {
            return;
        }

        let collidePoints: CollidePoint[] = [];
        this.shape.buildLineCollisions(curLine, collidePoints);

        let isIn = this.shape.inside(curLine.getStart());

        if (!this.started && isIn) {
            this.lastPos = curLine.getStart();
        }

        for (let i = 0; i < collidePoints.length; i++) {

            const cp = collidePoints[i];

            if (!isIn) {
                this.lastPos = cp.p;
                this.startCutLine = cp.line;
                this.started = true;
                this.addSlicedShape(this.lastPos);
                console.log("1");
            } else {

                if (this.started) {

                    this.started = false;
                    this.addNewLine(this.lastPos, cp.p);

                    this.startSlicedShape(cp.p);
                    this.shape.handleCutShape(this.lines, cp.line, this.startCutLine);
                    console.log("2");
                } else {
                    console.log("2.5");
                }

                this.clearSlice();

            }

            isIn = !isIn;
        }

        let curIn = this.shape.inside(curLine.getEnd());

        if (isIn && curIn && !this.started) {
            this.started = true;
            this.lastPos = curLine.getEnd();

            this.addSlicedShape(this.lastPos);
            console.log("3");
        } else if (!isIn && !curIn) {
            return;
        }

        this.handleSpawningNewLine(curLine.getEnd());
    }

    private clearSlice() {
        this.lines = [];
        this.started = false;
        this.lastPos = { x: 0, y: 0 };
        this.newSliceTime = 0;
    }

    public reset() {
        this.clearSlice();
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
