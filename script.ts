// Game Object Interfaces
interface SliceableShape {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    points: { x: number; y: number }[];
    sliced: boolean;
    sliceLines: { x1: number; y1: number; x2: number; y2: number }[];
}

interface SliceLine {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    active: boolean;
}

// Game State Management
class GameState {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private score: number;
    private level: number;
    private gameRunning: boolean;
    private gamePaused: boolean;
    private gameSpeed: number; // milliseconds
    private gameLoop: number | null;
    private gameMode: 'timed' | 'infinite';
    private gameTime: number;
    private gameStartTime: number;

    // Game objects
    private shapes: SliceableShape[];
    private sliceLines: SliceLine[];
    private currentSlice: SliceLine | null;
    private lastShapeTime: number;
    private shapeIdCounter: number;

    // Mouse/Touch controls
    private isDrawing: boolean;
    private mouseX: number;
    private mouseY: number;

    constructor() {
        this.canvas = document.getElementById('gameBoard') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = 16; // ~60 FPS
        this.gameLoop = null;
        this.gameMode = 'infinite';
        this.gameTime = 0;
        this.gameStartTime = 0;

        // Initialize game objects
        this.shapes = [];
        this.sliceLines = [];
        this.currentSlice = null;
        this.lastShapeTime = 0;
        this.shapeIdCounter = 0;

        // Initialize controls
        this.isDrawing = false;
        this.mouseX = 0;
        this.mouseY = 0;

        this.initializeEventListeners();
        this.resizeCanvas();
    }

    private initializeEventListeners(): void {
        // Button controls
        document.getElementById('timedBtn')!.addEventListener('click', () => this.startGame('timed'));
        document.getElementById('infiniteBtn')!.addEventListener('click', () => this.startGame('infinite'));
        document.getElementById('playAgainBtn')!.addEventListener('click', () => this.restartGame());
        document.getElementById('pauseBtn')!.addEventListener('click', () => this.showPauseMenu());

        // Pause menu controls
        document.getElementById('resumeBtn')!.addEventListener('click', () => this.resumeGame());
        document.getElementById('newGameBtn')!.addEventListener('click', () => this.startNewGame());
        document.getElementById('mainMenuBtn')!.addEventListener('click', () => this.goToMainMenu());

        // Mouse events for slicing
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Touch events for slicing
        this.canvas.addEventListener('touchstart', (e: TouchEvent) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e: TouchEvent) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e: TouchEvent) => this.handleTouchEnd(e), { passive: false });

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    private handleMouseDown(e: MouseEvent): void {
        if (!this.gameRunning || this.gamePaused) return;
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        this.isDrawing = true;
        this.currentSlice = {
            x1: this.mouseX,
            y1: this.mouseY,
            x2: this.mouseX,
            y2: this.mouseY,
            active: true
        };
    }

    private handleMouseMove(e: MouseEvent): void {
        if (!this.gameRunning || this.gamePaused || !this.isDrawing || !this.currentSlice) return;
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        this.currentSlice.x2 = this.mouseX;
        this.currentSlice.y2 = this.mouseY;
    }

    private handleMouseUp(e: MouseEvent): void {
        console.log(`e: ${e}`)
        if (!this.gameRunning || this.gamePaused || !this.isDrawing || !this.currentSlice) return;
        this.isDrawing = false;
        this.sliceLines.push({ ...this.currentSlice });
        this.checkSliceIntersections();
        this.currentSlice = null;
    }

    private handleTouchStart(e: TouchEvent): void {
        e.preventDefault();
        if (!this.gameRunning || this.gamePaused) return;
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = touch.clientX - rect.left;
        this.mouseY = touch.clientY - rect.top;
        this.isDrawing = true;
        this.currentSlice = {
            x1: this.mouseX,
            y1: this.mouseY,
            x2: this.mouseX,
            y2: this.mouseY,
            active: true
        };
    }

    private handleTouchMove(e: TouchEvent): void {
        e.preventDefault();
        if (!this.gameRunning || this.gamePaused || !this.isDrawing || !this.currentSlice) return;
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = touch.clientX - rect.left;
        this.mouseY = touch.clientY - rect.top;
        this.currentSlice.x2 = this.mouseX;
        this.currentSlice.y2 = this.mouseY;
    }

    private handleTouchEnd(e: TouchEvent): void {
        e.preventDefault();
        if (!this.gameRunning || this.gamePaused || !this.isDrawing || !this.currentSlice) return;
        this.isDrawing = false;
        this.sliceLines.push({ ...this.currentSlice });
        this.checkSliceIntersections();
        this.currentSlice = null;
    }

    private checkSliceIntersections(): void {
        if (!this.currentSlice) return;

        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            if (shape.sliced) continue;

            if (this.lineIntersectsShape(this.currentSlice, shape)) {
                this.sliceShape(shape, this.currentSlice);
                this.score += 10;
                this.updateUI();
            }
        }
    }

    private lineIntersectsShape(line: SliceLine, shape: SliceableShape): boolean {
        // Simple bounding box intersection check
        const minX = Math.min(line.x1, line.x2);
        const maxX = Math.max(line.x1, line.x2);
        const minY = Math.min(line.y1, line.y2);
        const maxY = Math.max(line.y1, line.y2);

        return !(maxX < shape.x || minX > shape.x + shape.width ||
            maxY < shape.y || minY > shape.y + shape.height);
    }

    private sliceShape(shape: SliceableShape, sliceLine: SliceLine): void {
        shape.sliced = true;
        shape.sliceLines.push({
            x1: sliceLine.x1,
            y1: sliceLine.y1,
            x2: sliceLine.x2,
            y2: sliceLine.y2
        });
    }

    private generateRandomShape(): SliceableShape {
        const size = 40 + Math.random() * 40; // 40-80px
        const x = Math.random() * (this.canvas.width - size);
        const y = Math.random() * (this.canvas.height - size - 100) + 50; // Avoid header area

        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Generate random polygon points
        const points = this.generatePolygonPoints(size, 3 + Math.floor(Math.random() * 5)); // 3-7 sides

        return {
            id: this.shapeIdCounter++,
            x: x,
            y: y,
            width: size,
            height: size,
            color: color,
            points: points,
            sliced: false,
            sliceLines: []
        };
    }

    private generatePolygonPoints(size: number, sides: number): { x: number; y: number }[] {
        const points: { x: number; y: number }[] = [];
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2;

        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            points.push({ x, y });
        }

        return points;
    }

    private startGame(mode: 'timed' | 'infinite'): void {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameMode = mode;
        this.score = 0;
        this.level = 1;
        this.shapes = [];
        this.sliceLines = [];
        this.shapeIdCounter = 0;
        this.lastShapeTime = 0;
        this.gameSpeed = 16; // 60 FPS

        if (mode === 'timed') {
            this.gameTime = 60; // 60 seconds
            this.gameStartTime = Date.now();
        }

        // Hide menu and game over screen
        const gameMenu = document.getElementById('gameMenu') as HTMLElement;
        const gameOverScreen = document.getElementById('gameOverScreen') as HTMLElement;
        gameMenu.style.display = 'none';
        gameOverScreen.style.display = 'none';

        this.updateUI();
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    private restartGame(): void {
        this.gameRunning = false;
        this.gamePaused = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }

        // Show start menu and hide game over screen
        const gameMenu = document.getElementById('gameMenu') as HTMLElement;
        const gameOverScreen = document.getElementById('gameOverScreen') as HTMLElement;
        gameMenu.style.display = 'flex';
        gameOverScreen.style.display = 'none';
    }

    private showPauseMenu(): void {
        if (!this.gameRunning) return;

        this.gamePaused = true;
        const pauseMenu = document.getElementById('pauseMenu') as HTMLElement;
        pauseMenu.style.display = 'flex';
    }

    private resumeGame(): void {
        this.gamePaused = false;
        const pauseMenu = document.getElementById('pauseMenu') as HTMLElement;
        pauseMenu.style.display = 'none';
    }

    private startNewGame(): void {
        // Hide pause menu
        const pauseMenu = document.getElementById('pauseMenu') as HTMLElement;
        pauseMenu.style.display = 'none';

        // Stop current game loop to prevent drawing old content
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }

        // Clear existing shapes immediately to prevent visual hiccup
        this.shapes = [];
        this.sliceLines = [];
        this.currentSlice = null;
        this.isDrawing = false;

        // Clear the canvas immediately
        this.clearCanvas();

        // Start a new game with the same mode
        this.startGame(this.gameMode);
    }

    private goToMainMenu(): void {
        // Hide pause menu
        const pauseMenu = document.getElementById('pauseMenu') as HTMLElement;
        pauseMenu.style.display = 'none';

        // Stop current game and show main menu
        this.gameRunning = false;
        this.gamePaused = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }

        const gameMenu = document.getElementById('gameMenu') as HTMLElement;
        gameMenu.style.display = 'flex';
    }

    private gameOver(): void {
        this.gameRunning = false;
        clearInterval(this.gameLoop!);

        document.getElementById('finalScore')!.textContent = this.score.toString();
        document.getElementById('finalLevel')!.textContent = this.level.toString();
        document.getElementById('finalMode')!.textContent = this.gameMode === 'timed' ? 'Timed' : 'Infinite';

        // Show time for timed mode
        if (this.gameMode === 'timed') {
            const minutes = Math.floor(this.gameTime / 60000);
            const seconds = Math.floor((this.gameTime % 60000) / 1000);
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById('finalTime')!.textContent = timeString;
            document.getElementById('finalTimeLabel')!.style.display = 'block';
            document.getElementById('finalLevelLabel')!.style.display = 'none';
        } else {
            document.getElementById('finalTimeLabel')!.style.display = 'none';
            document.getElementById('finalLevelLabel')!.style.display = 'block';
        }

        // Show game over screen
        document.getElementById('gameOverScreen')!.style.display = 'flex';
    }

    private update(): void {
        if (!this.gameRunning || this.gamePaused) return;

        // Update game time for timed mode
        if (this.gameMode === 'timed') {
            this.gameTime = Date.now() - this.gameStartTime;
            if (this.gameTime >= 60000) { // 60 seconds
                this.gameOver();
                return;
            }
        }

        this.clearCanvas();
        this.spawnShapes();
        this.updateShapes();
        this.drawShapes();
        this.drawSliceLines();
        this.drawCurrentSlice();
        this.updateUI();
    }

    private spawnShapes(): void {
        const now = Date.now();
        if (now - this.lastShapeTime > 2000) { // Spawn every 2 seconds
            this.shapes.push(this.generateRandomShape());
            this.lastShapeTime = now;
        }
    }

    private updateShapes(): void {
        // Remove shapes that have been sliced for too long
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            if (shape.sliced && shape.sliceLines.length > 0) {
                // Remove after 3 seconds
                if (Date.now() - this.lastShapeTime > 3000) {
                    this.shapes.splice(i, 1);
                }
            }
        }
    }

    private drawShapes(): void {
        this.shapes.forEach(shape => {
            this.ctx.save();
            this.ctx.translate(shape.x, shape.y);

            if (shape.sliced) {
                this.ctx.globalAlpha = 0.5;
            }

            this.ctx.fillStyle = shape.color;
            this.ctx.beginPath();

            if (shape.points.length > 0) {
                this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
                for (let i = 1; i < shape.points.length; i++) {
                    this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
                }
                this.ctx.closePath();
            } else {
                // Fallback to rectangle if no points
                this.ctx.fillRect(0, 0, shape.width, shape.height);
            }

            this.ctx.fill();
            this.ctx.restore();
        });
    }

    private drawSliceLines(): void {
        this.sliceLines.forEach(line => {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(line.x1, line.y1);
            this.ctx.lineTo(line.x2, line.y2);
            this.ctx.stroke();
        });
    }

    private drawCurrentSlice(): void {
        if (this.currentSlice && this.isDrawing) {
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(this.currentSlice.x1, this.currentSlice.y1);
            this.ctx.lineTo(this.currentSlice.x2, this.currentSlice.y2);
            this.ctx.stroke();
        }
    }

    private clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background pattern
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add subtle grid pattern
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    private updateUI(): void {
        document.getElementById('score')!.textContent = this.score.toString();
        document.getElementById('level')!.textContent = this.level.toString();

        // Update time display for timed mode
        if (this.gameMode === 'timed') {
            const remainingTime = Math.max(0, 60000 - this.gameTime);
            const minutes = Math.floor(remainingTime / 60000);
            const seconds = Math.floor((remainingTime % 60000) / 1000);
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById('level')!.textContent = timeString;
        }
    }

    private resizeCanvas(): void {
        const container = document.getElementById('gameCanvas') as HTMLElement;
        const containerRect = container.getBoundingClientRect();

        this.canvas.width = Math.min(400, containerRect.width - 20);
        this.canvas.height = Math.min(600, window.innerHeight - 200);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GameState();
});