
// Grid Class
class Grid {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private start: Point;
    private blocks: Block[][];
    private lines: Line[];
    private cellSize: number;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.blocks = [];
        this.canvas = canvas;
        this.ctx = ctx;
        this.cellSize = 1; // Size of each grid cell in pixels
        this.start = { x: 0, y: 0 };
        this.lines = [];
    }

    public onCanvasChanged(center: Point, radius: number) {
        const gridWidth = Math.floor(radius * 2);
        const gridHeight = gridWidth;

        this.blocks = [];
        for (let y = 0; y < gridHeight; y++) {
            this.blocks[y] = [];
            for (let x = 0; x < gridWidth; x++) {
                this.blocks[y][x] = {
                    filled: false
                };
            }
        }

        const count = this.blocks.length * this.blocks[0].length;
        console.log(`blocks size: ${count}`);

        this.start = { x: center.x - radius, y: center.y - radius };
        // drawDebugCircle(this.start, Color.RED, true);

        // const end = { x: this.start.x + gridWidth, y: this.start.y + gridHeight };
        // drawDebugCircle(end, Color.BLUE, true);

        // console.log(`start: ${this.start.x}, ${this.start.y}`);
        // console.log(`end: ${end.x} ${end.y}`);
    }

    public addLine(line: Line) {
        // Get the pixels that this line intersects
        const pixels = this.getLinePixels(line);

        // Mark these pixels as filled in the grid
        for (const pixel of pixels) {
            //console.log(`pixel: ${pixel.x} ${pixel.y}`);
            if (this.isValidPixel(pixel.x, pixel.y)) {
                this.blocks[pixel.y][pixel.x].filled = true;
            }
        }
    }

    private getLinePixels(line: Line) {
        const pixels: Point[] = [];
        const start = line.getStart();
        const end = line.getEnd();

        const x0 = Math.floor(start.x - this.start.x);
        const y0 = Math.floor(start.y - this.start.y);
        const x1 = Math.floor(end.x - this.start.x);
        const y1 = Math.floor(end.y - this.start.y);

        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;

        let err = dx - dy;
        let x = x0;
        let y = y0;

        //  pixels.push({ x, y });

        while (true) {
            pixels.push({ x, y });

            if (x === x1 && y === y1) break;

            const e2 = 2 * err;

            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }

            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }

        return pixels;
    }

    public render() {
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        // Draw filled cells with alternating colors
        // let colorIndex = 0;
        // const colors = [
        //     'rgba(255, 0, 0, 0.5)',     // Red
        //     'rgba(0, 255, 0, 0.5)',     // Green
        //     'rgba(0, 0, 255, 0.5)',     // Blue
        //     'rgba(255, 255, 0, 0.5)',   // Yellow
        //     'rgba(255, 0, 255, 0.5)',   // Magenta
        //     'rgba(0, 255, 255, 0.5)'    // Cyan
        // ];

        // for (let y = 0; y < this.blocks.length; y++) {
        //     for (let x = 0; x < this.blocks[y].length; x++) {
        //         if (this.blocks[y][x].filled) {
        //             const pixelX = this.start.x + (x * this.cellSize);
        //             const pixelY = this.start.y + (y * this.cellSize);

        //             //console.log(`checked: ${pixelX} ${pixelY}`);

        //             // Set color before drawing
        //             this.ctx.fillStyle = colors[colorIndex % colors.length];
        //             this.ctx.fillRect(pixelX, pixelY, 1, 1);//this.cellSize, this.cellSize);

        //             colorIndex++;
        //         }
        //     }
        // }
    }

    private isValidPixel(x: number, y: number): boolean {
        return x >= 0 && x < this.blocks[0].length &&
            y >= 0 && y < this.blocks.length;
    }

}
