// SlicedShape Class
class SlicedShape {
    private ctx: CanvasRenderingContext2D;
    private lines: Line[];
    private endSlicePointShown = false;
    private startSlicePoint: Point;
    private endSlicePoint: Point;
    private showTime = 0;

    private readonly SLICE_POINT_SHOW_TIME = 10;

    constructor(ctx: CanvasRenderingContext2D, startSlicePoint: Point) {
        this.ctx = ctx;
        this.lines = [];
        this.startSlicePoint = { ...startSlicePoint };
        this.endSlicePoint = { x: 0, y: 0 };
    }

    public start(endSlicePoint: Point) {
        this.endSlicePoint = { ...endSlicePoint };
        this.endSlicePointShown = true;
        this.showTime++;
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

        // Draw the shape with single background color
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.beginPath();

        if (this.lines.length > 0) {
            this.ctx.moveTo(this.lines[0].getP1().x, this.lines[0].getP1().y);
            for (const line of this.lines) {
                this.ctx.lineTo(line.getP2().x, line.getP2().y);
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
