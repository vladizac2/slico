
// Game State Management
class GameState {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private shape: Shape;
    private score: number;
    private level: number;
    private gameRunning: boolean;
    private gamePaused: boolean;
    private gameSpeed: number; // milliseconds
    private gameLoop: number | null;
    private gameMode: 'timed' | 'infinite';
    private gameTime: number;
    private gameStartTime: number;
    private shapeSpawnTimeout: number | null;
    private shapeSpawnDelay: number;
    private shapeSpawnStartTime: number;

    private slices: Slices;

    // Game objects
    private prevMousePos: Point;
    private curMousePos: Point;
    private mousePos: Point;

    constructor() {
        this.canvas = document.getElementById('gameBoard') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        initRenderer(this.ctx);
        initDebug();
        this.shape = new Shape(this.canvas, this.ctx);
        this.slices = new Slices(this.ctx, this.shape);
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = 16; // ~60 FPS
        this.gameLoop = null;
        this.gameMode = 'infinite';
        this.gameTime = 0;
        this.gameStartTime = 0;
        this.shapeSpawnTimeout = null;
        this.shapeSpawnDelay = 3000; // 3 seconds
        this.shapeSpawnStartTime = 0;

        // Initialize controls
        this.mousePos = { x: 0, y: 0 };
        this.prevMousePos = { ... this.mousePos };
        this.curMousePos = { ... this.mousePos };

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
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    private handleMouseMove(e: MouseEvent): void {
        if (!this.gameRunning || this.gamePaused) return;
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
    }

    private startGame(mode: 'timed' | 'infinite'): void {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameMode = mode;
        this.score = 0;
        this.level = 1;
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

        this.mousePos = { x: 0, y: 0 };
        this.prevMousePos = { ... this.mousePos };
        this.curMousePos = { ... this.mousePos };

        // Clear any existing timeout
        if (this.shapeSpawnTimeout) {
            clearTimeout(this.shapeSpawnTimeout);
        }

        // Start the game loop immediately but delay shape spawning
        this.updateUI();
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);

        // Record when shape spawning started
        this.shapeSpawnStartTime = Date.now();

        // Spawn shape after 3 seconds
        this.shapeSpawnTimeout = setTimeout(() => {
            this.spawnShape();
        }, this.shapeSpawnDelay);
    }

    private spawnShape(): void {
        this.shape.generateRandomShape();
        this.shapeSpawnTimeout = null; // Clear the timeout reference
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

        // Show countdown if shape hasn't spawned yet
        if (this.shapeSpawnTimeout) {
            const elapsed = Date.now() - this.shapeSpawnStartTime;
            const remaining = Math.max(0, this.shapeSpawnDelay - elapsed);
            const seconds = Math.ceil(remaining / 1000);

            if (seconds > 0) {
                // Create a semi-transparent background circle
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.beginPath();
                this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 60, 0, 2 * Math.PI);
                this.ctx.fill();

                // Add a border
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();

                // Draw the countdown number with better styling
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 64px "Segoe UI", Arial, sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(seconds.toString(), this.canvas.width / 2, this.canvas.height / 2);

                // Add a subtle glow effect
                this.ctx.shadowColor = '#00ffff';
                this.ctx.shadowBlur = 20;
                this.ctx.fillText(seconds.toString(), this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.shadowBlur = 0;
            }

        } else {
            this.prevMousePos = { ... this.curMousePos };
            this.curMousePos = { ... this.mousePos };
            this.slices.update(this.prevMousePos, this.curMousePos);

            this.shape.render();
            this.slices.render();
            renderDebugKeeps();
            drawCircle(this.mousePos, Color.RED);
        }

        this.updateUI();
    }

    private restartGame(): void {
        this.gameRunning = false;
        this.gamePaused = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.shapeSpawnTimeout) {
            clearTimeout(this.shapeSpawnTimeout);
            this.shapeSpawnTimeout = null;
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

        // Clear the canvas immediately
        this.clearCanvas();
        this.slices.reset();

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
        if (this.shapeSpawnTimeout) {
            clearTimeout(this.shapeSpawnTimeout);
            this.shapeSpawnTimeout = null;
        }

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

        // Set canvas to fill the entire container
        this.canvas.width = containerRect.width;
        this.canvas.height = containerRect.height;

        // Redraw the canvas content
        this.clearCanvas();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GameState();
});