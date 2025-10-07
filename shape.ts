// Shape Class
class Shape {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lines: Line[];
    private minPointsDist: number;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.lines = [];
        this.minPointsDist = Math.min(this.canvas.width, this.canvas.height) * 0.05;
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

    public handleCutShape(sliceLines: Line[], endCutLine: Line, startCutLine: Line | null) {

    }

    public render() {
        if (this.lines.length === 0) {
            // Generate random shape if no lines exist
            this.generateRandomShape();
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
        const padding = 60; // More padding to ensure shape fits
        const maxRadius = Math.min(
            (this.canvas.width - padding) / 2,
            (this.canvas.height - padding) / 2
        );
        const baseRadius = maxRadius * 0.8; // Use 80% of max radius for safety
        const sides = Math.floor(Math.random() * 5) + 3; // 3-7 sides

        this.lines = [];

        // Generate random points around a circle with some variation
        const points: Point[] = [];

        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides;
            const radiusVariation = baseRadius + (Math.random() - 0.5) * (baseRadius * 0.3); // ±30% variation
            const angleVariation = (Math.random() - 0.5) * 0.4; // ±0.2 rad variation

            const x = centerX + radiusVariation * Math.cos(angle + angleVariation);
            const y = centerY + radiusVariation * Math.sin(angle + angleVariation);

            points.push({ x, y });
        }

        // Create lines connecting the points
        for (let i = 0; i < points.length; i++) {
            const currentPoint = points[i];
            const nextPoint = points[(i + 1) % points.length];

            this.lines.push(new Line(currentPoint, nextPoint));
        }
    }

}
