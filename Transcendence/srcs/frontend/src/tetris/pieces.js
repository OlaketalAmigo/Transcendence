// ─────────────────────────────────────────────
// PIÈCES
// ─────────────────────────────────────────────

class Piece {
    constructor(startX, startY) {
        this.position = { x: startX, y: startY };
        this.currentRotation = 0;
        this.rotations = this.defineRotations();
        this.shape = this.rotations[0];
        this.color = this.getColor();
    }
    defineRotations() { return [[[1]]]; }
    getColor()        { return 1; }
    getPosition()     { return { ...this.position }; }
    getShape()        { return this.shape; }
    moveDown()        { this.position.y++; }
    moveLeft()        { this.position.x--; }
    moveRight()       { this.position.x++; }
    rotateLeft() {
        this.currentRotation = (this.currentRotation - 1 + this.rotations.length) % this.rotations.length;
        this.shape = this.rotations[this.currentRotation];
    }
    rotateRight() {
        this.currentRotation = (this.currentRotation + 1) % this.rotations.length;
        this.shape = this.rotations[this.currentRotation];
    }
}

class PieceT extends Piece {
    defineRotations() {
        return [
            [[0,1,0],[1,1,1],[0,0,0]],
            [[0,1,0],[0,1,1],[0,1,0]],
            [[0,0,0],[1,1,1],[0,1,0]],
            [[0,1,0],[1,1,0],[0,1,0]]
        ];
    }
    getColor() { return 1; }
}

class PieceL extends Piece {
    defineRotations() {
        return [
            [[0,0,1],[1,1,1],[0,0,0]],
            [[0,1,0],[0,1,0],[0,1,1]],
            [[0,0,0],[1,1,1],[1,0,0]],
            [[1,1,0],[0,1,0],[0,1,0]]
        ];
    }
    getColor() { return 2; }
}

class PieceReverseL extends Piece {
    defineRotations() {
        return [
            [[1,0,0],[1,1,1],[0,0,0]],
            [[0,1,1],[0,1,0],[0,1,0]],
            [[0,0,0],[1,1,1],[0,0,1]],
            [[0,1,0],[0,1,0],[1,1,0]]
        ];
    }
    getColor() { return 3; }
}

class PieceI extends Piece {
    defineRotations() {
        return [
            [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
            [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]]
        ];
    }
    getColor() { return 4; }
}

class PieceZ extends Piece {
    defineRotations() {
        return [
            [[1,1,0],[0,1,1],[0,0,0]],
            [[0,0,1],[0,1,1],[0,1,0]]
        ];
    }
    getColor() { return 5; }
}

class PieceReverseZ extends Piece {
    defineRotations() {
        return [
            [[0,1,1],[1,1,0],[0,0,0]],
            [[0,1,0],[0,1,1],[0,0,1]]
        ];
    }
    getColor() { return 6; }
}

class PieceO extends Piece {
    defineRotations() { return [[[1,1],[1,1]]]; }
    getColor() { return 7; }
}
