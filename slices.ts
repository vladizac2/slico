
// Slices Class
class Slices {
    private ctx: CanvasRenderingContext2D;
    private shape: Shape;
    private scanner: Scanner;
    private lines: Line[];
    private started: boolean;

    private startCutLine: Line | null;
    private lastPos: Point;
    private newSliceTime: number;

    private curSlicedShape: SlicedShape | null;
    private slicedShapes: SlicedShape[];
    private readonly NEW_SLICE_TIME = 2;

    constructor(ctx: CanvasRenderingContext2D, shape: Shape, scanner: Scanner) {
        this.ctx = ctx;
        this.shape = shape;
        this.scanner = scanner;
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

    private addSlicedShape(startSlicePoint: Point, startSliceLine: Line, startIsInside: boolean) {
        this.curSlicedShape = new SlicedShape(this.ctx, this.scanner,
            startSlicePoint, startSliceLine, startIsInside);
        this.slicedShapes.push(this.curSlicedShape);
    }

    private startSlicedShape(endSlicePoint: Point, endSliceLine: Line) {
        if (this.curSlicedShape == null) {
            console.error("Cur slice shape is null in end");
        } else {
            this.curSlicedShape.start(endSlicePoint, endSliceLine, this.lines);
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

    private handleSelfCollision(curMousePos: Point) {

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

        if (minCollideLine == null) {
            return;
        }

        this.clearSlice();

        this.started = true;
        this.lastPos = minCollidePoint;

        this.setSlicedShape(this.lastPos);

    }

    public update(prevMousePos: Point, curMousePos: Point) {

        // if (calcDist(prevMousePos, curMousePos) <= MIN_VAL) {
        //     return;
        // }

        let curLine = new Line(prevMousePos, curMousePos);

        //console.log(`----------------`);

        this.handleSelfCollision(curMousePos);

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
                this.addSlicedShape(cp.p, cp.line, false);
            } else {

                if (this.started) {

                    this.started = false;
                    this.addNewLine(this.lastPos, cp.p);

                    this.startSlicedShape(cp.p, cp.line);
                }

                this.clearSlice();

            }

            isIn = !isIn;
        }

        let curIn = this.shape.inside(curLine.getEnd());

        if (isIn && curIn && !this.started) {
            this.started = true;
            this.lastPos = curLine.getEnd();

            this.addSlicedShape(this.lastPos, curLine, true);
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
            let remove = slicedShape.render();

            if (!remove && !slicedShape.started() && this.curSlicedShape != null
                && i < this.slicedShapes.length - 1) {
                remove = true;
            }

            if (remove) {
                this.slicedShapes.splice(i, 1);
            }
        }

    }

}
