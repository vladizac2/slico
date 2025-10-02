// Game Object Interfaces
interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    color: string;
    type: 'projectile' | 'enemy';
}

interface Player {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    color: string;
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

    // Player object
    private player: Player;

    // Game objects array
    private objects: GameObject[];
    private lastObjectTime: number;

    // Touch controls
    private touchStartX: number;
    private touchStartY: number;

    constructor() {
        this.canvas = document.getElementById('gameBoard') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = 1000; // milliseconds
        this.gameLoop = null;
        this.gameMode = 'infinite';
        this.gameTime = 0;
        this.gameStartTime = 0;

        // Player object
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            width: 40,
            height: 40,
            speed: 5,
            color: '#3498db'
        };

        // Game objects array
        this.objects = [];
        this.lastObjectTime = 0;

        // Touch controls
        this.touchStartX = 0;
        this.touchStartY = 0;

        this.initializeEventListeners();
        this.resizeCanvas();
    }

    private initializeEventListeners(): void {
        // Button controls
        document.getElementById('timedBtn')!.addEventListener('click', () => this.startGame('timed'));
        document.getElementById('infiniteBtn')!.addEventListener('click', () => this.startGame('infinite'));
        document.getElementById('playAgainBtn')!.addEventListener('click', () => this.restartGame());

        // Arrow controls
        document.getElementById('leftBtn')!.addEventListener('click', () => this.movePlayer(-1));
        document.getElementById('rightBtn')!.addEventListener('click', () => this.movePlayer(1));
        document.getElementById('actionBtn')!.addEventListener('click', () => this.performAction());

        // Keyboard controls
        document.addEventListener('keydown', (e: KeyboardEvent) => this.handleKeyPress(e));

        // Touch controls
        this.canvas.addEventListener('touchstart', (e: TouchEvent) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e: TouchEvent) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e: TouchEvent) => this.handleTouchEnd(e), { passive: false });

        // Prevent scrolling on touch
        document.addEventListener('touchmove', (e: TouchEvent) => {
            if (this.gameRunning) {
                e.preventDefault();
            }
        }, { passive: false });

        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    private resizeCanvas(): void {
        const container = document.getElementById('gameCanvas')!;
        const containerRect = container.getBoundingClientRect();
        const maxWidth = containerRect.width - 20;
        const maxHeight = containerRect.height - 20;

        // Maintain aspect ratio
        const aspectRatio = 400 / 600;
        let newWidth = maxWidth;
        let newHeight = newWidth / aspectRatio;

        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
        }

        this.canvas.width = newWidth;
        this.canvas.height = newHeight;

        // Update player position
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 50;
    }

    private handleKeyPress(e: KeyboardEvent): void {
        if (!this.gameRunning) return;

        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.movePlayer(-1);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.movePlayer(1);
                break;
            case ' ':
            case 'Enter':
                e.preventDefault();
                this.performAction();
                break;
            case 'Escape':
                e.preventDefault();
                this.restartGame();
                break;
        }
    }

    private handleTouchStart(e: TouchEvent): void {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }

    private handleTouchMove(e: TouchEvent): void {
        e.preventDefault();
        if (!this.gameRunning) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;

        // Horizontal swipe detection
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
            if (deltaX > 0) {
                this.movePlayer(1);
            } else {
                this.movePlayer(-1);
            }
            this.touchStartX = touch.clientX;
        }
    }

    private handleTouchEnd(e: TouchEvent): void {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;

        // Tap detection for action
        if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
            this.performAction();
        }
    }

    private movePlayer(direction: number): void {
        if (!this.gameRunning || this.gamePaused) return;

        const newX = this.player.x + (direction * this.player.speed);
        if (newX >= 0 && newX <= this.canvas.width - this.player.width) {
            this.player.x = newX;
        }
    }

    private performAction(): void {
        if (!this.gameRunning || this.gamePaused) return;

        // Create a projectile or special action
        this.objects.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y,
            width: 8,
            height: 15,
            speed: -8,
            color: '#e74c3c',
            type: 'projectile'
        });

        // Visual feedback
        const actionBtn = document.getElementById('actionBtn') as HTMLButtonElement;
        actionBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            actionBtn.style.transform = 'scale(1)';
        }, 100);
    }

    private startGame(mode: 'timed' | 'infinite'): void {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameMode = mode;
        this.score = 0;
        this.level = 1;
        this.objects = [];
        this.gameSpeed = 1000;
        this.gameStartTime = Date.now();
        this.gameTime = 0;

        // Hide the start menu and game over screen
        document.getElementById('gameMenu')!.style.display = 'none';
        document.getElementById('gameOverScreen')!.style.display = 'none';

        this.updateUI();
        this.gameLoop = setInterval(() => this.update(), 16); // ~60 FPS
    }


    private restartGame(): void {
        this.gameRunning = false;
        this.gamePaused = false;
        clearInterval(this.gameLoop!);

        // Show the start menu again, hide game over screen
        document.getElementById('gameMenu')!.style.display = 'flex';
        document.getElementById('gameOverScreen')!.style.display = 'none';

        this.clearCanvas();
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
        }

        this.clearCanvas();
        this.updateObjects();
        this.spawnObjects();
        this.checkCollisions();
        this.drawPlayer();
        this.drawObjects();
        this.updateUI();
    }

    private updateObjects(): void {
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            obj.y += obj.speed;

            // Remove objects that are off screen
            if (obj.y < -obj.height || obj.y > this.canvas.height + obj.height) {
                this.objects.splice(i, 1);
            }
        }
    }

    private spawnObjects(): void {
        const now = Date.now();
        if (now - this.lastObjectTime > this.gameSpeed) {
            this.objects.push({
                x: Math.random() * (this.canvas.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: 2 + (this.level * 0.5),
                color: '#f39c12',
                type: 'enemy'
            });
            this.lastObjectTime = now;
        }
    }

    private checkCollisions(): void {
        // Check projectile-enemy collisions
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            if (obj.type === 'projectile') {
                for (let j = this.objects.length - 1; j >= 0; j--) {
                    const enemy = this.objects[j];
                    if (enemy.type === 'enemy' && this.isColliding(obj, enemy)) {
                        this.objects.splice(i, 1);
                        this.objects.splice(j, 1);
                        this.score += 10;
                        this.addScoreAnimation();

                        // Level up every 100 points
                        if (this.score > 0 && this.score % 100 === 0) {
                            this.level++;
                            this.gameSpeed = Math.max(200, this.gameSpeed - 100);
                        }
                        break;
                    }
                }
            }
        }

        // Check player-enemy collisions
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            if (obj.type === 'enemy' && this.isColliding(this.player, obj)) {
                this.gameOver();
                return;
            }
        }
    }

    private isColliding(obj1: GameObject | Player, obj2: GameObject | Player): boolean {
        return obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y;
    }

    private drawPlayer(): void {
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Add some visual flair
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.player.x + 5, this.player.y + 5, this.player.width - 10, this.player.height - 10);
    }

    private drawObjects(): void {
        this.objects.forEach(obj => {
            this.ctx.fillStyle = obj.color;
            this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

            // Add visual effects
            if (obj.type === 'enemy') {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(obj.x + 5, obj.y + 5, obj.width - 10, obj.height - 10);
            }
        });
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

        // Update timer display for timed mode
        if (this.gameMode === 'timed') {
            const minutes = Math.floor(this.gameTime / 60000);
            const seconds = Math.floor((this.gameTime % 60000) / 1000);
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById('level')!.textContent = `Time: ${timeString}`;
        }
    }

    private addScoreAnimation(): void {
        const scoreElement = document.getElementById('score')!;
        scoreElement.classList.add('score-pop');
        setTimeout(() => {
            scoreElement.classList.remove('score-pop');
        }, 300);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GameState();

    // Prevent context menu on long press
    document.addEventListener('contextmenu', (e: Event) => {
        e.preventDefault();
    });

    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e: TouchEvent) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
});
