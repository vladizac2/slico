// SlicedShape Class
class SlicedShape {
    private ctx: CanvasRenderingContext2D;
    private lines: Line[];
    private scanner: Scanner;
    private sliceLines: Line[];
    private endSlicePointShown = false;
    private startSlicePoint: Point;
    private startSliceLine: Line | null;
    private endSlicePoint: Point;
    private showTime = 0;

    private readonly SLICE_POINT_SHOW_TIME = 10;

    constructor(ctx: CanvasRenderingContext2D, scanner: Scanner, startSlicePoint: Point,
        startSliceLine?: Line) {
        this.ctx = ctx;
        this.scanner = scanner;
        this.lines = [];
        this.sliceLines = [];
        this.startSlicePoint = { ...startSlicePoint };

        if (startSliceLine == null) {
            this.startSliceLine = null;
        } else {
            this.startSliceLine = startSliceLine;
        }
        this.endSlicePoint = { x: 0, y: 0 };
    }

    public start(endSlicePoint: Point, endSliceLine: Line, sliceLines: Line[]) {

        for (const line of sliceLines) {
            this.sliceLines.push(new Line(line.getStart(), line.getEnd()));
        }

        this.endSlicePoint = { ...endSlicePoint };
        this.endSlicePointShown = true;

        if (this.startSliceLine == null) {
            this.scanner.getShape().addInnerLines(sliceLines);
        } else {
            this.scanner.onSliceFinished(this.startSlicePoint, this.startSliceLine,
                endSlicePoint, endSliceLine, sliceLines);
        }

        this.showTime++;
    }

    public set(startSlicePoint: Point) {
        this.lines = [];
        this.sliceLines = [];
        this.startSlicePoint = { ...startSlicePoint };
        this.startSliceLine = null;
        this.endSlicePoint = { x: 0, y: 0 };
    }

    public started(): boolean {
        return this.showTime > 0;
    }

    public render(): boolean {

        if (this.showTime >= this.SLICE_POINT_SHOW_TIME) {
            this.showTime = 0;
            return true;
        } else if (this.showTime > 0) {
            this.showTime++;
        }

        const dim = 1 - (this.SLICE_POINT_SHOW_TIME - this.showTime) / this.SLICE_POINT_SHOW_TIME;
        const alpha = Math.max(0, 1 - dim);

        this.ctx.globalAlpha = alpha;

        for (const line of this.sliceLines) {
            drawLine(line, Color.YELLOW, 12);
        }

        // Draw the shape with single background color
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.beginPath();

        if (this.lines.length > 0) {
            this.ctx.moveTo(this.lines[0].getStart().x, this.lines[0].getStart().y);
            for (const line of this.lines) {
                this.ctx.lineTo(line.getEnd().x, line.getEnd().y);
            }
            this.ctx.closePath();
        }
        this.ctx.fill();

        // Draw outline for better visibility
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        drawCircle(this.startSlicePoint, Color.BLUE);

        if (this.endSlicePointShown) {
            drawCircle(this.endSlicePoint, Color.BLUE);
        }

        this.ctx.globalAlpha = 1;

        return false;
    }


}
