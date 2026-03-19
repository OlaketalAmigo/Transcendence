// ─────────────────────────────────────────────
// LOGIQUE TETRIS
// ───────────────────────────────────────────

class Tetris {
    constructor(onRender, onGameOver, onBlockPlaced = null, onLinesCleared = null, onShieldChanged = null) {
        this.onRender       = onRender;
        this.onGameOver     = onGameOver;
        this.onBlockPlaced  = onBlockPlaced;
        this.onLinesCleared = onLinesCleared;
        this.onShieldChanged = onShieldChanged;

        this.grid         = this._createGrid(10, 20);
        this.bufferGrid   = this._createGrid(10, 5);
        this.currentPiece = null;
        this.storedPiece  = null;
        this.nextPiece    = null;

        this.score            = 0;
        this.initialTimeToDown = 1000;
        this.timeToDown       = 1000;
        this.hardening        = 1000;
        this.count            = 0;
        this.decrementTTD     = 100;

        this.lastLandingCol = 4;

        this.isRunning = false;
        this.isPaused  = false;
        this.canStore  = true;

        // Shield
        this.shieldActive     = false;
        this.shieldActiveMs   = 0;
        this.shieldCooldownMs = 0;
        this.shieldReady      = true;   // prêt dès le début

        this.animationFrameId = null;
        this.lastTime         = 0;
        this.accumulator      = 0;

        this._keyHandler = this._handleKey.bind(this);
    }

    configure({ timeToDown, hardening, decrementTTD }) {
        if (timeToDown   !== undefined) this.initialTimeToDown = this.timeToDown = timeToDown;
        if (hardening    !== undefined) this.hardening    = hardening;
        if (decrementTTD !== undefined) this.decrementTTD = decrementTTD;
    }

    _createGrid(w, h) {
        return Array.from({ length: h }, () => Array(w).fill(0));
    }

    start() {
        if (this.isRunning) return;
        this.isRunning  = true;
        this.isPaused   = false;
        this.grid       = this._createGrid(10, 20);
        this.score      = 0;
        this.count      = 0;
        this.timeToDown = this.initialTimeToDown;
        this.storedPiece = null;
        this.canStore    = true;
        this.shieldActive     = false;
        this.shieldActiveMs   = 0;
        this.shieldCooldownMs = 0;
        this.shieldReady      = true;
        this._spawnNewPiece();
        document.addEventListener('keydown', this._keyHandler);
        this._startGameLoop();
    }

    stop() {
        this.isRunning = false;
        this.isPaused  = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.accumulator = 0;
        this.lastTime    = 0;
        document.removeEventListener('keydown', this._keyHandler);
    }

    restart() {
        this.stop();
        this.start();
    }

    pause() {
        if (!this.isRunning) return;
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.lastTime = 0;
            this._startGameLoop();
        }
    }

    _startGameLoop() {
        this.lastTime    = 0;
        this.accumulator = 0;

        const gameLoop = (currentTime) => {
            if (!this.isRunning) return;

            if (this.isPaused) {
                this.animationFrameId = requestAnimationFrame(gameLoop);
                return;
            }

            if (this.lastTime === 0) {
                this.lastTime = currentTime;
                this.animationFrameId = requestAnimationFrame(gameLoop);
                return;
            }

            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            this.accumulator += deltaTime;

            this._updateShield(deltaTime);

            while (this.isRunning && this.accumulator >= this.timeToDown) {
                this._tick();
                this.accumulator -= this.timeToDown;
                if (this.accumulator > this.timeToDown * 3) {
                    this.accumulator = 0;
                    break;
                }
            }

            this.onRender();
            this.animationFrameId = requestAnimationFrame(gameLoop);
        };

        this.animationFrameId = requestAnimationFrame(gameLoop);
    }

    _tick() {
        if (!this.currentPiece) return;
        if (this._canMoveDown()) {
            this.currentPiece.moveDown();
        } else {
            this._lockPiece();
            this.verifierLignes();
            this._makeHarder();
            this._spawnNewPiece();
            this.canStore = true;
            if (!this._canSpawn()) this._gameOver(true);
        }
    }

    _handleKey(e) {
        if (!this.isRunning || !this.currentPiece) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (!this.isPaused && this._canMoveLeft())  this.currentPiece.moveLeft();
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (!this.isPaused && this._canMoveRight()) this.currentPiece.moveRight();
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!this.isPaused && this._canMoveDown()) {
                    this.currentPiece.moveDown();
                    this.score += 1;
                    this.accumulator = 0;
                }
                break;
            case ' ':
                e.preventDefault();
                if (!this.isPaused) this._hardDrop();
                break;
            case 'q': case 'Q':
                e.preventDefault();
                if (!this.isPaused) this._rotatePiece(-1);
                break;
            case 'w': case 'W':
                e.preventDefault();
                if (!this.isPaused) this._rotatePiece(1);
                break;
            case 'c': case 'C':
                e.preventDefault();
                if (!this.isPaused) this._storePiece();
                break;
            case 'e': case 'E':
                e.preventDefault();
                if (!this.isPaused) this._activateShield();
                break;
        }

        this.onRender();
    }

    _activateShield() {
        if (!this.shieldReady || this.shieldActive) return;
        this.shieldActive   = true;
        this.shieldActiveMs = 3000;
        this.shieldReady    = false;
        if (this.onShieldChanged) this.onShieldChanged('activated');
    }

    _updateShield(deltaTime) {
        if (this.shieldActive) {
            this.shieldActiveMs -= deltaTime;
            if (this.shieldActiveMs <= 0) {
                this.shieldActive     = false;
                this.shieldActiveMs   = 0;
                this.shieldCooldownMs = 60000;
                if (this.onShieldChanged) this.onShieldChanged('deactivated');
            }
        } else if (!this.shieldReady) {
            this.shieldCooldownMs -= deltaTime;
            if (this.shieldCooldownMs <= 0) {
                this.shieldCooldownMs = 0;
                this.shieldReady      = true;
                if (this.onShieldChanged) this.onShieldChanged('ready');
            }
        }
    }

    _hardDrop() {
        if (!this.currentPiece) return;
        let dist = 0;
        while (this._canMoveDown()) { this.currentPiece.moveDown(); dist++; }
        this.score += dist * 2;
        this._lockPiece();
        this.verifierLignes();
        this._makeHarder();
        this._spawnNewPiece();
        this.canStore    = true;
        this.accumulator = 0;
        if (!this._canSpawn()) this._gameOver(true);
    }

    _rotatePiece(direction) {
        if (!this.currentPiece) return;
        const originalPos = { ...this.currentPiece.getPosition() };

        if (direction === -1) this.currentPiece.rotateLeft();
        else                  this.currentPiece.rotateRight();

        if (!this._isValidPosition()) {
            this.currentPiece.moveRight();
            if (this._isValidPosition()) return;

            this.currentPiece.moveLeft();
            this.currentPiece.moveLeft();
            if (this._isValidPosition()) return;

            this.currentPiece.moveLeft();
            if (this._isValidPosition()) return;

            this.currentPiece.moveRight();
            this.currentPiece.moveRight();
            this.currentPiece.position.y--;
            if (this._isValidPosition()) return;

            this.currentPiece.position.y = originalPos.y;
            this.currentPiece.position.x = originalPos.x;
            if (direction === -1) this.currentPiece.rotateRight();
            else                  this.currentPiece.rotateLeft();
        }
    }

    _storePiece() {
        if (!this.canStore || !this.currentPiece) return;

        if (this.storedPiece === null) {
            this.storedPiece = this.currentPiece;
            this._spawnNewPiece();
        } else {
            const temp        = this.storedPiece;
            this.storedPiece  = this.currentPiece;
            this.currentPiece = temp;
            this.currentPiece.position.x = 3;
            this.currentPiece.position.y = 0;
        }
        this.canStore    = false;
        this.accumulator = 0;
    }

    _spawnNewPiece() {
        this.currentPiece = this.nextPiece || this._createRandomPiece();
        this.nextPiece    = this._createRandomPiece();
        this._updateBufferGrid();
    }

    _createRandomPiece() {
        const types = [PieceT, PieceL, PieceReverseL, PieceI, PieceZ, PieceReverseZ, PieceO];
        return new types[Math.floor(Math.random() * types.length)](3, 0);
    }

    _updateBufferGrid() {
        this.bufferGrid = this._createGrid(10, 5);
        if (!this.nextPiece) return;
        const shape   = this.nextPiece.getShape();
        const offsetX = Math.floor((10 - shape[0].length) / 2);
        for (let y = 0; y < shape.length; y++)
            for (let x = 0; x < shape[y].length; x++)
                if (shape[y][x] !== 0)
                    this.bufferGrid[y + 1][x + offsetX] = this.nextPiece.getColor();
    }

    verifierLignes() {
        let cleared = 0;
        for (let y = this.grid.length - 1; y >= 0; y--) {
            if (this.grid[y].every(c => c !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(10).fill(0));
                cleared++;
                y++;
            }
        }
        const points = [0, 100, 300, 500, 800];
        this.score += points[cleared];
        this.count += points[cleared];
        if (cleared > 0) {
            // Chaque ligne remplie réduit le cooldown du shield de 10s
            if (!this.shieldActive && !this.shieldReady) {
                this.shieldCooldownMs = Math.max(0, this.shieldCooldownMs - cleared * 10000);
                if (this.shieldCooldownMs === 0) {
                    this.shieldReady = true;
                    if (this.onShieldChanged) this.onShieldChanged('ready');
                }
            }
            if (this.onLinesCleared) this.onLinesCleared(cleared, this.lastLandingCol);
        }
    }

    _makeHarder() {
        if (this.count >= this.hardening) {
            this.count = 0;
            this.timeToDown = Math.max(100, this.timeToDown - this.decrementTTD);
        }
    }

    _canMoveDown() {
        if (!this.currentPiece) return false;
        const { x, y } = this.currentPiece.getPosition();
        const shape    = this.currentPiece.getShape();
        for (let row = 0; row < shape.length; row++)
            for (let col = 0; col < shape[row].length; col++)
                if (shape[row][col] !== 0) {
                    const ny = y + row + 1;
                    const nx = x + col;
                    if (ny < 0) continue; // encore au-dessus de la grille
                    if (ny >= this.grid.length || this.grid[ny][nx] !== 0) return false;
                }
        return true;
    }

    _canMoveLeft() {
        if (!this.currentPiece) return false;
        const { x, y } = this.currentPiece.getPosition();
        const shape    = this.currentPiece.getShape();
        for (let row = 0; row < shape.length; row++)
            for (let col = 0; col < shape[row].length; col++)
                if (shape[row][col] !== 0) {
                    if (y + row < 0) continue; // au-dessus de la grille
                    const nx = x + col - 1;
                    if (nx < 0 || this.grid[y + row][nx] !== 0) return false;
                }
        return true;
    }

    _canMoveRight() {
        if (!this.currentPiece) return false;
        const { x, y } = this.currentPiece.getPosition();
        const shape    = this.currentPiece.getShape();
        for (let row = 0; row < shape.length; row++)
            for (let col = 0; col < shape[row].length; col++)
                if (shape[row][col] !== 0) {
                    if (y + row < 0) continue; // au-dessus de la grille
                    const nx = x + col + 1;
                    if (nx >= this.grid[0].length || this.grid[y + row][nx] !== 0) return false;
                }
        return true;
    }

    _isValidPosition() {
        if (!this.currentPiece) return false;
        const { x, y } = this.currentPiece.getPosition();
        const shape    = this.currentPiece.getShape();
        for (let row = 0; row < shape.length; row++)
            for (let col = 0; col < shape[row].length; col++)
                if (shape[row][col] !== 0) {
                    const gx = x + col;
                    const gy = y + row;
                    if (gx < 0 || gx >= this.grid[0].length ||
                        gy < 0 || gy >= this.grid.length ||
                        this.grid[gy][gx] !== 0) return false;
                }
        return true;
    }

    _canSpawn()  { return this._isValidPosition(); }

    _lockPiece() {
        if (!this.currentPiece) return;
        const { x, y } = this.currentPiece.getPosition();
        const shape    = this.currentPiece.getShape();
        const color    = this.currentPiece.getColor();
        for (let row = 0; row < shape.length; row++)
            for (let col = 0; col < shape[row].length; col++)
                if (shape[row][col] !== 0 && y + row >= 0)
                    this.grid[y + row][x + col] = color;
        this.lastLandingCol = x + Math.floor(shape[0].length / 2);
        if (this.onBlockPlaced) this.onBlockPlaced(this.grid.map(r => [...r]));
    }

    addGarbageLines(lines) {
        if (this.shieldActive) return;  // shield bloque les lignes garbage
        if (!this.isRunning || !lines.length) return;
        this.grid.splice(0, lines.length);
        for (const line of lines) this.grid.push([...line]); // ...line pour faire une copie independante
        // La grille a remonté de lines.length lignes — on remonte la pièce du même décalage
        // pour qu'elle reste dans la même position relative aux blocs verrouillés.
        if (this.currentPiece) {
            this.currentPiece.position.y -= lines.length;
        }
        if (this.grid[0].some(c => c !== 0)) { this._gameOver(false); return; }
        if (!this._isValidPositionAllowTop()) this._gameOver(false);
    }

    // Comme _isValidPosition mais tolère gy < 0 (zone tampon au-dessus de la grille après garbage)
    _isValidPositionAllowTop() {
        if (!this.currentPiece) return true;
        const { x, y } = this.currentPiece.getPosition();
        const shape    = this.currentPiece.getShape();
        for (let row = 0; row < shape.length; row++)
            for (let col = 0; col < shape[row].length; col++)
                if (shape[row][col] !== 0) {
                    const gy = y + row;
                    const gx = x + col;
                    if (gy < 0) continue; // au-dessus de la grille : OK
                    if (gx < 0 || gx >= this.grid[0].length ||
                        gy >= this.grid.length ||
                        this.grid[gy][gx] !== 0) return false;
                }
        return true;
    }

    _gameOver(validBlock = false) {
        this.stop();
        this.onGameOver(this.score, validBlock);
    }
}
