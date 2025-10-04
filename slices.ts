
// Slices Class
class Slices {
    private ctx: CanvasRenderingContext2D;
    private shape: Shape;
    private lines: Line[];
    private started: boolean;

    private startCutLine: Line | null;
    private lastPos: Point;
    private newSliceTime: number;

    private readonly NEW_SLICE_MS = 2;

    constructor(ctx: CanvasRenderingContext2D, shape: Shape) {
        this.ctx = ctx;
        this.shape = shape;
        this.lines = [];
        this.started = false;
        this.lastPos = { x: 0, y: 0 };
        this.startCutLine = null;
        this.newSliceTime = 0;
    }

    private addNewLine(p1: Point, p2: Point) {
        this.lines.push(new Line(p1, p2));
    }

    private handleSpawningNewLine(curMousePos: Point) {

        if (!this.started) {
            return;
        }

        this.newSliceTime++;

        //console.log(`time: ${this.newSliceTime}, ${this.NEW_SLICE_MS}`);

        if (this.newSliceTime >= this.NEW_SLICE_MS) {
            this.addNewLine(this.lastPos, curMousePos);
            this.lastPos = curMousePos;
            this.newSliceTime = this.newSliceTime - this.NEW_SLICE_MS;
        }
    }

    public update(prevMousePos: Point, curMousePos: Point) {

        //console.log(`p1: ${prevMousePos.x} ${prevMousePos.y} - p: ${mousePos.x} ${mousePos.y}`)

        const prevIn = this.shape.inside(prevMousePos);
        const curIn = this.shape.inside(curMousePos);

        //console.log(`prev: ${prevIn} cur: ${curIn}`);
        //console.log("");

        if (!prevIn && curIn) {
            let collisionPoint = { x: 0, y: 0 };
            // console.log("");
            const cutLine: Line | null = this.shape.calcCutLine(prevMousePos, curMousePos, collisionPoint);
            // console.log(`col: ${collisionPoint.x} ${collisionPoint.y}`)
            // console.log("");
            if (cutLine == null) {
                console.error("No cut line for prev out and cur in");
                return;
            }

            this.started = true;
            this.startCutLine = cutLine;
            this.lastPos = collisionPoint;

            //console.log("got in");

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
                this.shape.handleCutShape(this.lines, cutLine, this.startCutLine);
            }

            this.reset();
        } else if (prevIn && curIn && !this.started) {
            this.started = true;
            this.lastPos = curMousePos;
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

    private renderLine(lineIndex: number): void {
        const line = this.lines[lineIndex];
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.moveTo(line.getP1().x, line.getP1().y);
        this.ctx.lineTo(line.getP2().x, line.getP2().y);
        this.ctx.stroke();
    }

    public render() {

        for (let i = 0; i < this.lines.length; i++) {
            this.renderLine(i);
        }

        // Draw the shape with single background color
        // this.ctx.fillStyle = '#FF6B6B';
        // this.ctx.beginPath();

        // if (this.lines.length > 0) {
        //     this.ctx.moveTo(this.lines[0].getP1().x, this.lines[0].getP1().y);
        //     for (const line of this.lines) {
        //         this.ctx.lineTo(line.getP2().x, line.getP2().y);
        //     }
        //     this.ctx.closePath();
        // }
        // this.ctx.fill();

        // // Draw outline for better visibility
        // this.ctx.strokeStyle = '#ffffff';
        // this.ctx.lineWidth = 2;
        // this.ctx.stroke();
    }

}
