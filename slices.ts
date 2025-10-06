
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

    private scanColliding(startPos: Point, curMousePos: Point) {

        if (calcDist(startPos, curMousePos) <= MIN_VAL) {
            return;
        }

        let curLine = new Line(startPos, curMousePos);

        interface CollidePoint {
            p: Point;
            d: number;
            line: Line;
        }

        let collidePoints: CollidePoint[] = [];

        for (const line of this.lines) {

            let collidePoint = { x: 0, y: 0 };

            if (curLine.calcCollision(line, collidePoint)) {
                let d = calcDist(collidePoint, startPos);
                collidePoints.push({ p: collidePoint, d: d, line: line });
            }
        }

        // Sort by distance (closest first)
        collidePoints.sort((a, b) => a.d - b.d);

        let isIn = this.shape.inside(startPos);

        if (isIn) {
            this.lastPos = startPos;
        }

        // if (collidePoints.length > 0) {
        //     console.log(`count: ${collidePoints.length}`);
        //     drawDebugCircle(startPos, Color.RED, true);
        //     drawDebugCircle(curMousePos, Color.YELLOW, true);
        // }

        // for (const cp of collidePoints) {

        //     if (!isIn) {
        //         this.lastPos = cp.p;
        //         this.startCutLine = cp.line;
        //         this.addSlicedShape(this.lastPos);
        //     } else {
        //         this.addNewLine(this.lastPos, cp.p);
        //         this.lastPos = cp.p;
        //         this.startSlicedShape(this.lastPos);
        //         this.shape.handleCutShape(this.lines, cp.line, this.startCutLine);
        //         this.startCutLine = null;
        //     }

        //     isIn = !isIn;
        // }
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

            this.addSlicedShape(this.lastPos);

        } else if (prevIn && !curIn) {

            let startPos = prevMousePos;

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

                startPos = calcSmlDiffPoint(collisionPoint, curMousePos);
            }


            this.scanColliding(startPos, curMousePos);

            this.initSlice();

        } else if (prevIn && curIn && !this.started) {
            this.started = true;
            this.lastPos = curMousePos;

            this.addSlicedShape(this.lastPos);
        } else if (!prevIn && !curIn) {
            // this.scanColliding(prevMousePos, curMousePos);
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

        let removalIndexes = [];

        for (let i = 0; i < this.slicedShapes.length; i++) {
            const slicedShape = this.slicedShapes[i];
            const remove = slicedShape.render();
            if (remove) {
                removalIndexes.push(i);
            }
        }

        for (const removalIndex of removalIndexes) {
            if (removalIndex > -1) {
                this.slicedShapes.splice(removalIndex, 1);
            }
        }

    }

}
