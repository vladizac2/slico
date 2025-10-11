// Shape Class
class Shape {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lines: Line[];
    private innerLines: Line[];
    private minPointsDist: number;
    private baseRadius: number;
    private grid: Grid;

    private readonly lineColor = Color.BLACK;
    private readonly lineWidth = 2;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, grid: Grid) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.grid = grid;
        this.baseRadius = 1;
        this.lines = [];
        this.innerLines = [];

        this.baseRadius = 1;
        this.minPointsDist = Math.min(this.canvas.width, this.canvas.height) * 0.05;
    }

    public addInnerLines(innerLines: Line[]) {

        for (const line of innerLines) {
            this.innerLines.push(line);
        }
    }

    public onCanvasChanged() {
        const padding = 60; // More padding to ensure shape fits
        const maxRadius = Math.min(
            (this.canvas.width - padding) / 2,
            (this.canvas.height - padding) / 2
        );
        this.baseRadius = maxRadius * 0.8; // Use 80% of max radius for safety

        const center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.grid.onCanvasChanged(center, this.baseRadius);
    }

    public getMinPointsDist(): number {
        return this.minPointsDist;
    }

    public buildLineCollisions(curLine: Line, collidePoints: CollidePoint[]) {

        for (const line of this.lines) {

            let collidePoint = { x: 0, y: 0 };

            if (curLine.calcCollision(line, collidePoint)) {
                let d = calcDist(collidePoint, curLine.getStart());
                collidePoints.push({ p: collidePoint, d: d, line: line });
            }
        }
    }

    public calcCutLine(p1: Point, p2: Point, collisionPoint: Point): (Line | null) {

        const curLine: Line = new Line(p1, p2);
        collisionPoint.x = 0;
        collisionPoint.y = 0;
        let tmp: Point = { x: 0, y: 0 };
        let minDist = -1;
        let cutLine: Line | null = null;

        for (const line of this.lines) {

            if (line.calcCollision(curLine, tmp)) {

                const d = calcDist(tmp, p1);

                if (minDist < 0 || d < minDist) {
                    minDist = d;
                    cutLine = line;
                    collisionPoint.x = tmp.x;
                    collisionPoint.y = tmp.y;
                }
            }
        }

        return cutLine;
    }

    public render() {
        if (this.lines.length === 0) {
            // Generate random shape if no lines exist
            this.generateRandomShape();
        }

        // Draw the shape with single background color
        this.ctx.fillStyle = '#FF6B6B';
        // 1) Build your polygon path
        this.ctx.beginPath();
        if (this.lines.length > 0) {
            this.ctx.moveTo(this.lines[0].getStart().x, this.lines[0].getStart().y);
            for (const line of this.lines) {
                this.ctx.lineTo(line.getEnd().x, line.getEnd().y);
            }
            this.ctx.closePath();
        }

        // // 2) Add a subpath for the hole (circle here, use any shape)
        let holeX = 400, holeY = 250, holeR = 40;
        // this.ctx.moveTo(holeX + holeR, holeY);
        // this.ctx.arc(holeX, holeY, holeR, 0, Math.PI * 2);

        // second hole (shifted 100px to the right)
        let hole2X = holeX + 100, hole2Y = holeY;
        this.ctx.moveTo(hole2X + holeR, hole2Y);
        this.ctx.arc(hole2X, hole2Y, holeR, 0, Math.PI * 2);

        // 2️⃣ Draw your custom hole shape using the lines
        if (this.lines.length > 0) {
            let i = 3;
            this.ctx.moveTo(this.lines[0].getStart().x, this.lines[0].getStart().y);

            for (const line of this.lines) {
                i--;
                if (i <= 0) break;
                this.ctx.lineTo(line.getEnd().x, line.getEnd().y);
            }

            this.ctx.lineTo(this.lines[0].getStart().x, this.lines[0].getStart().y);

            // Close the inner hole path
            this.ctx.closePath();
        }

        // 3️⃣ Fill using the even-odd rule to cut the hole
        this.ctx.fill('evenodd');

        // (Optional) outline the outer polygon only:
        this.ctx.strokeStyle = this.lineColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.stroke();

        for (const line of this.innerLines) {
            drawLine(line, this.lineColor, this.lineWidth);
        }

    }

    public inside(pos: Point): boolean {

        let collideCount = 0;

        for (const line of this.lines) {

            if (line.checkParallelYLineCollides(pos)) {
                collideCount++;
            }
        }

        return collideCount % 2 != 0;
    }

    public generateRandomShape(): void {
        if (!this.canvas) {
            return;
        }

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const sides = Math.floor(Math.random() * 5) + 3; // 3-7 sides

        this.lines = [];

        // Generate random points around a circle with some variation
        const points: Point[] = [];

        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides;
            let radiusVariation = this.baseRadius + (Math.random() - 0.5) * (this.baseRadius * 0.3); // ±30% variation
            if (radiusVariation > this.baseRadius * 0.95) {
                radiusVariation = this.baseRadius * 0.95;
            }
            const angleVariation = (Math.random() - 0.5) * 0.4; // ±0.2 rad variation

            const x = centerX + radiusVariation * Math.cos(angle + angleVariation);
            const y = centerY + radiusVariation * Math.sin(angle + angleVariation);

            points.push({ x, y });
        }

        // Create lines connecting the points
        for (let i = 0; i < points.length; i++) {
            const currentPoint = points[i];
            const nextPoint = points[(i + 1) % points.length];

            const line = new Line(currentPoint, nextPoint);
            this.lines.push(line);
            this.grid.addLine(line);
        }
    }

}
