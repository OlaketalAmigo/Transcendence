// types
export type CellState = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7; // 0 = vide, 1-7 = différentes pièces
export type Grid = CellState[][];
export type Position = { x: number; y: number };
export type ShapeMatrix = number[][];

// Piece - Classe abstraite de base
export abstract class Piece {
    protected position: Position;
    protected shape: ShapeMatrix;
    protected color: CellState;
    protected currentRotation: number = 0;
    protected rotations: ShapeMatrix[];

    constructor(startX: number, startY: number) {
        this.position = { x: startX, y: startY };
        this.rotations = this.defineRotations();
        this.shape = this.rotations[0];
        this.color = this.getColor();
    }

    abstract defineRotations(): ShapeMatrix[];
    abstract getColor(): CellState;

    public getPosition(): Position {
        return { ...this.position };
    }

    public getShape(): ShapeMatrix {
        return this.shape;
    }

    public moveDown(): void {
        this.position.y++;
    }

    public moveLeft(): void {
        this.position.x--;
    }

    public moveRight(): void {
        this.position.x++;
    }

    public rotateLeft(): void {
        this.currentRotation = (this.currentRotation - 1 + this.rotations.length) % this.rotations.length;
        this.shape = this.rotations[this.currentRotation];
    }

    public rotateRight(): void {
        this.currentRotation = (this.currentRotation + 1) % this.rotations.length;
        this.shape = this.rotations[this.currentRotation];
    }

    public drop(): void {
        // Utilisé pour la chute instantanée (espace)
    }
}

// PieceT
export class PieceT extends Piece {
    defineRotations(): ShapeMatrix[] {
        return [
            [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            [
                [0, 1, 0],
                [0, 1, 1],
                [0, 1, 0]
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]
            ],
            [
                [0, 1, 0],
                [1, 1, 0],
                [0, 1, 0]
            ]
        ];
    }

    getColor(): CellState {
        return 1;
    }
}

// PieceL
export class PieceL extends Piece {
    defineRotations(): ShapeMatrix[] {
        return [
            [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 1]
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [1, 0, 0]
            ],
            [
                [1, 1, 0],
                [0, 1, 0],
                [0, 1, 0]
            ]
        ];
    }

    getColor(): CellState {
        return 2;
    }
}

// PieceReverseL
export class PieceReverseL extends Piece {
    defineRotations(): ShapeMatrix[] {
        return [
            [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            [
                [0, 1, 1],
                [0, 1, 0],
                [0, 1, 0]
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 1]
            ],
            [
                [0, 1, 0],
                [0, 1, 0],
                [1, 1, 0]
            ]
        ];
    }

    getColor(): CellState {
        return 3;
    }
}

// PieceI
export class PieceI extends Piece {
    defineRotations(): ShapeMatrix[] {
        return [
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            [
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0]
            ]
        ];
    }

    getColor(): CellState {
        return 4;
    }
}

// PieceZ
export class PieceZ extends Piece {
    defineRotations(): ShapeMatrix[] {
        return [
            [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            [
                [0, 0, 1],
                [0, 1, 1],
                [0, 1, 0]
            ]
        ];
    }

    getColor(): CellState {
        return 5;
    }
}

// PieceReverseZ
export class PieceReverseZ extends Piece {
    defineRotations(): ShapeMatrix[] {
        return [
            [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            [
                [0, 1, 0],
                [0, 1, 1],
                [0, 0, 1]
            ]
        ];
    }

    getColor(): CellState {
        return 6;
    }
}

// PieceO (carré)
export class PieceO extends Piece {
    defineRotations(): ShapeMatrix[] {
        return [
            [
                [1, 1],
                [1, 1]
            ]
        ];
    }

    getColor(): CellState {
        return 7;
    }
}

// Tetris - Classe principale avec timing précis
export class Tetris {
    private grid: Grid;
    private bufferGrid: Grid;
    private currentPiece: Piece | null = null;
    private storedPiece: Piece | null = null;
    private nextPiece: Piece | null = null;
    
    private score: number = 0;
    private timeToDown: number = 1000; // ms
    private harding: number = 1000; // Score multiple pour augmenter difficulté
    private decrementTTD: number = 50; // Décrémentation en ms
    
    private isRunning: boolean = false;
    private isPaused: boolean = false;
    private canStore: boolean = true; // Empêche de stocker plusieurs fois de suite
    
    // Système de timing précis
    private animationFrameId: number | null = null;
    private lastTime: number = 0;
    private accumulator: number = 0;

    constructor() {
        this.grid = this.createGrid(10, 20);
        this.bufferGrid = this.createGrid(10, 5);
    }

    private createGrid(width: number, height: number): Grid {
        return Array.from({ length: height }, () => 
            Array.from({ length: width }, () => 0)
        );
    }

    public start(): void {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.grid = this.createGrid(10, 20);
        this.score = 0;
        this.timeToDown = 1000;
        
        this.spawnNewPiece();
        this.bindingKeyboard();
        this.startGameLoop();
    }

    public stop(): void {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        this.accumulator = 0;
        this.lastTime = 0;
    }

    public pause(): void {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        
        if (!this.isPaused) {
            // Réinitialiser le timing lors de la reprise
            this.lastTime = 0;
            this.startGameLoop();
        }
    }

    private startGameLoop(): void {
        this.lastTime = 0;
        this.accumulator = 0;
        
        const gameLoop = (currentTime: number) => {
            // Vérifier si le jeu est toujours actif
            if (!this.isRunning) {
                return;
            }
            
            // Si en pause, continuer la boucle mais ne rien faire
            if (this.isPaused) {
                this.animationFrameId = requestAnimationFrame(gameLoop);
                return;
            }
            
            // Initialiser lastTime au premier frame
            if (this.lastTime === 0) {
                this.lastTime = currentTime;
                this.animationFrameId = requestAnimationFrame(gameLoop);
                return;
            }
            
            // Calculer le temps écoulé depuis le dernier frame
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            // Accumuler le temps
            this.accumulator += deltaTime;
            
            // Exécuter un tick quand assez de temps s'est écoulé
            while (this.accumulator >= this.timeToDown) {
                this.tick();
                this.accumulator -= this.timeToDown;
                
                // Sécurité : si trop de ticks accumulés (lag), on réinitialise
                if (this.accumulator > this.timeToDown * 3) {
                    this.accumulator = 0;
                    break;
                }
            }
            
            // Continuer la boucle
            this.animationFrameId = requestAnimationFrame(gameLoop);
        };
        
        this.animationFrameId = requestAnimationFrame(gameLoop);
    }

    private tick(): void {
        if (!this.currentPiece) return;
        
        if (this.canMoveDown()) {
            this.currentPiece.moveDown();
        } else {
            this.lockPiece();
            this.verifierLignes();
            this.makeHarder();
            this.spawnNewPiece();
            this.canStore = true;
            
            if (!this.canSpawn()) {
                this.gameOver();
            }
        }
    }

    public bindingKeyboard(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!this.isRunning || this.isPaused || !this.currentPiece) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    if (this.canMoveLeft()) {
                        this.currentPiece.moveLeft();
                    }
                    break;
                    
                case 'ArrowRight':
                    e.preventDefault();
                    if (this.canMoveRight()) {
                        this.currentPiece.moveRight();
                    }
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.canMoveDown()) {
                        this.currentPiece.moveDown();
                        this.score += 1; // Bonus pour descente manuelle
                        this.accumulator = 0; // Réinitialiser pour éviter double tick
                    }
                    break;
                    
                case ' ':
                    e.preventDefault();
                    this.hardDrop();
                    break;
                    
                case 'q':
                case 'Q':
                    e.preventDefault();
                    this.rotatePiece(-1);
                    break;
                    
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.rotatePiece(1);
                    break;
                    
                case 'c':
                case 'C':
                    e.preventDefault();
                    this.storePiece();
                    break;
            }
        });
    }

    private hardDrop(): void {
        if (!this.currentPiece) return;
        
        let dropDistance = 0;
        while (this.canMoveDown()) {
            this.currentPiece.moveDown();
            dropDistance++;
        }
        
        this.score += dropDistance * 2; // Bonus pour hard drop
        this.lockPiece();
        this.verifierLignes();
        this.makeHarder();
        this.spawnNewPiece();
        this.canStore = true;
        this.accumulator = 0; // Réinitialiser après hard drop
    }

    private rotatePiece(direction: number): void {
        if (!this.currentPiece) return;
        
        const originalPos = { ...this.currentPiece.getPosition() };
        
        if (direction === -1) {
            this.currentPiece.rotateLeft();
        } else {
            this.currentPiece.rotateRight();
        }
        
        // Wall kick: essayer de déplacer si rotation impossible
        if (!this.isValidPosition()) {
            // Essayer à droite
            this.currentPiece.moveRight();
            if (this.isValidPosition()) return;
            
            // Essayer à gauche (2 fois)
            this.currentPiece.moveLeft();
            this.currentPiece.moveLeft();
            if (this.isValidPosition()) return;
            
            // Essayer encore plus à gauche
            this.currentPiece.moveLeft();
            if (this.isValidPosition()) return;
            
            // Essayer en haut
            this.currentPiece.moveRight();
            this.currentPiece.moveRight();
            const pos = this.currentPiece.getPosition();
            pos.y--;
            if (this.isValidPosition()) return;
            
            // Restaurer position et rotation originales
            pos.y = originalPos.y;
            pos.x = originalPos.x;
            
            if (direction === -1) {
                this.currentPiece.rotateRight();
            } else {
                this.currentPiece.rotateLeft();
            }
        }
    }

    private storePiece(): void {
        if (!this.canStore || !this.currentPiece) return;
        
        if (this.storedPiece === null) {
            this.storedPiece = this.currentPiece;
            this.spawnNewPiece();
        } else {
            const temp = this.storedPiece;
            this.storedPiece = this.currentPiece;
            this.currentPiece = temp;
            
            // Réinitialiser la position
            const pos = this.currentPiece.getPosition();
            pos.x = 3;
            pos.y = 0;
        }
        
        this.canStore = false;
        this.accumulator = 0; // Réinitialiser lors du swap
    }

    private spawnNewPiece(): void {
        if (this.nextPiece) {
            this.currentPiece = this.nextPiece;
        } else {
            this.currentPiece = this.createRandomPiece();
        }
        
        this.nextPiece = this.createRandomPiece();
        this.updateBufferGrid();
    }

    private createRandomPiece(): Piece {
        const pieces = [
            PieceT, PieceL, PieceReverseL, PieceI, 
            PieceZ, PieceReverseZ, PieceO
        ];
        
        const PieceClass = pieces[Math.floor(Math.random() * pieces.length)];
        return new PieceClass(3, 0);
    }

    private updateBufferGrid(): void {
        // Effacer le buffer
        this.bufferGrid = this.createGrid(10, 5);
        
        // Dessiner la prochaine pièce au centre du buffer
        if (this.nextPiece) {
            const shape = this.nextPiece.getShape();
            const offsetX = Math.floor((10 - shape[0].length) / 2);
            const offsetY = 1;
            
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x] !== 0) {
                        this.bufferGrid[y + offsetY][x + offsetX] = this.nextPiece.getColor();
                    }
                }
            }
        }
    }

    public verifierLignes(): void {
        let linesCleared = 0;
        
        for (let y = this.grid.length - 1; y >= 0; y--) {
            if (this.isLineFull(y)) {
                this.clearLine(y);
                linesCleared++;
                y++; // Revérifier cette ligne car tout a été décalé
            }
        }
        
        // Système de score
        const points = [0, 100, 300, 500, 800];
        this.score += points[linesCleared] || 0;
    }

    private isLineFull(lineIndex: number): boolean {
        return this.grid[lineIndex].every(cell => cell !== 0);
    }

    private clearLine(lineIndex: number): void {
        // Supprimer la ligne
        this.grid.splice(lineIndex, 1);
        
        // Ajouter une nouvelle ligne vide en haut
        this.grid.unshift(Array(10).fill(0));
    }

    private makeHarder(): void {
        const previousLevel = Math.floor((this.score - this.harding) / this.harding);
        const currentLevel = Math.floor(this.score / this.harding);
        
        if (currentLevel > previousLevel && currentLevel > 0) {
            this.decrTTD();
        }
    }

    private decrTTD(): void {
        this.timeToDown = Math.max(100, this.timeToDown - this.decrementTTD);
        console.log(`Niveau augmenté ! Nouvelle vitesse: ${this.timeToDown}ms`);
    }

    private canMoveDown(): boolean {
        if (!this.currentPiece) return false;
        
        const pos = this.currentPiece.getPosition();
        const shape = this.currentPiece.getShape();
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 0) {
                    const newY = pos.y + y + 1;
                    const newX = pos.x + x;
                    
                    if (newY >= this.grid.length || this.grid[newY][newX] !== 0) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    private canMoveLeft(): boolean {
        if (!this.currentPiece) return false;
        
        const pos = this.currentPiece.getPosition();
        const shape = this.currentPiece.getShape();
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 0) {
                    const newX = pos.x + x - 1;
                    const newY = pos.y + y;
                    
                    if (newX < 0 || this.grid[newY][newX] !== 0) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    private canMoveRight(): boolean {
        if (!this.currentPiece) return false;
        
        const pos = this.currentPiece.getPosition();
        const shape = this.currentPiece.getShape();
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 0) {
                    const newX = pos.x + x + 1;
                    const newY = pos.y + y;
                    
                    if (newX >= this.grid[0].length || this.grid[newY][newX] !== 0) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    private isValidPosition(): boolean {
        if (!this.currentPiece) return false;
        
        const pos = this.currentPiece.getPosition();
        const shape = this.currentPiece.getShape();
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 0) {
                    const gridX = pos.x + x;
                    const gridY = pos.y + y;
                    
                    if (gridX < 0 || gridX >= this.grid[0].length ||
                        gridY < 0 || gridY >= this.grid.length ||
                        this.grid[gridY][gridX] !== 0) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    private canSpawn(): boolean {
        return this.isValidPosition();
    }

    private lockPiece(): void {
        if (!this.currentPiece) return;
        
        const pos = this.currentPiece.getPosition();
        const shape = this.currentPiece.getShape();
        const color = this.currentPiece.getColor();
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 0) {
                    this.grid[pos.y + y][pos.x + x] = color;
                }
            }
        }
    }

    private gameOver(): void {
        this.stop();
        console.log(`Game Over! Score final: ${this.score}`);
        // Ici tu peux ajouter un événement ou callback pour l'interface
    }

    // Getters pour le rendu
    public getGrid(): Grid {
        return this.grid;
    }

    public getBufferGrid(): Grid {
        return this.bufferGrid;
    }

    public getScore(): number {
        return this.score;
    }

    public getCurrentPiece(): Piece | null {
        return this.currentPiece;
    }

    public getStoredPiece(): Piece | null {
        return this.storedPiece;
    }
    
    public getTimeToDown(): number {
        return this.timeToDown;
    }
    
    public isGameRunning(): boolean {
        return this.isRunning;
    }
    
    public isGamePaused(): boolean {
        return this.isPaused;
    }
}