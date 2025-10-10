// Enemies Class
class Enemies {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    public scanEnemiesAreInShape(shapeLines: Line[]): boolean {

        return false;
    }

    public render() {


    }

}
