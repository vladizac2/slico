
// Shape Class
class Shape {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lines: Line[];

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.lines = [];
    }

    public render() {
        if (this.lines.length === 0) {
            // Generate random shape if no lines exist
            this.generateRandomShape();
        }

        // Draw the shape outline
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        if (this.lines.length > 0) {
            this.ctx.moveTo(this.lines[0].p1.x, this.lines[0].p1.y);
            for (const line of this.lines) {
                this.ctx.lineTo(line.p2.x, line.p2.y);
            }
            this.ctx.closePath();
        }
        this.ctx.stroke();

        // Fill the shape
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fill();
    }

    private generateRandomShape(): void {
        if (!this.canvas) {
            return;
        }

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const spc = this.canvas.height * 0.1;
        const baseRadius = (this.canvas.height - 2 * spc) / 2;
        const sides = Math.floor(Math.random() * 5) + 3; // 3-7 sides

        this.lines = [];

        // Generate random points around a circle with some variation
        const points: Point[] = [];

        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides;
            const radiusVariation = baseRadius + (Math.random() - 0.5) * 30; // ±15px variation
            const angleVariation = (Math.random() - 0.5) * 0.4; // ±0.2 rad variation

            const x = centerX + radiusVariation * Math.cos(angle + angleVariation);
            const y = centerY + radiusVariation * Math.sin(angle + angleVariation);

            points.push({ x, y });
        }

        // Create lines connecting the points
        for (let i = 0; i < points.length; i++) {
            const currentPoint = points[i];
            const nextPoint = points[(i + 1) % points.length];

            this.lines.push({ p1: currentPoint, p2: nextPoint });
        }
    }


    // // Method to add a slice line to the shape
    // public addSliceLine(sliceLine: { x1: number; y1: number; x2: number; y2: number }): void {
    //     this.sliceLines.push(sliceLine);
    //     this.sliced = true;
    // }

    // // Method to check if a point is inside the shape
    // public containsPoint(x: number, y: number): boolean {
    //     if (this.points.length === 0) {
    //         // Fallback to bounding box check
    //         return x >= this.x && x <= this.x + this.width &&
    //             y >= this.y && y <= this.y + this.height;
    //     }

    //     // Point-in-polygon algorithm
    //     let inside = false;
    //     for (let i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
    //         const xi = this.points[i].x + this.x;
    //         const yi = this.points[i].y + this.y;
    //         const xj = this.points[j].x + this.x;
    //         const yj = this.points[j].y + this.y;

    //         if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
    //             inside = !inside;
    //         }
    //     }
    //     return inside;
    // }

    // // Method to get the center point of the shape
    // public getCenter(): { x: number; y: number } {
    //     if (this.points.length === 0) {
    //         return {
    //             x: this.x + this.width / 2,
    //             y: this.y + this.height / 2
    //         };
    //     }

    //     let centerX = 0;
    //     let centerY = 0;
    //     for (const point of this.points) {
    //         centerX += point.x;
    //         centerY += point.y;
    //     }
    //     return {
    //         x: this.x + centerX / this.points.length,
    //         y: this.y + centerY / this.points.length
    //     };
    // }

    // // Method to move the shape
    // public move(deltaX: number, deltaY: number): void {
    //     this.x += deltaX;
    //     this.y += deltaY;
    // }

    // // Method to check if shape intersects with a line
    // public intersectsLine(line: SliceLine): boolean {
    //     const minX = Math.min(line.x1, line.x2);
    //     const maxX = Math.max(line.x1, line.x2);
    //     const minY = Math.min(line.y1, line.y2);
    //     const maxY = Math.max(line.y1, line.y2);

    //     return !(maxX < this.x || minX > this.x + this.width ||
    //         maxY < this.y || minY > this.y + this.height);
    // }
}
