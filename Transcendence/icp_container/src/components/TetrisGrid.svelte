<script lang="ts">
    import { onMount } from 'svelte';
    import type { Grid, Piece, CellState } from '$lib/game/tetris';

    export let grid: Grid;
    export let piece: Piece | null = null;
    export let width: number = 10;
    export let height: number = 20;
    export let cellSize: number = 30;

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    // Couleurs des pièces
    const colors: Record<CellState, string> = {
        0: '#1a1a2e',      // Vide
        1: '#a855f7',      // T - Violet
        2: '#f97316',      // L - Orange
        3: '#3b82f6',      // Reverse L - Bleu
        4: '#06b6d4',      // I - Cyan
        5: '#ef4444',      // Z - Rouge
        6: '#22c55e',      // Reverse Z - Vert
        7: '#eab308'       // O - Jaune
    };

    onMount(() => {
        ctx = canvas.getContext('2d')!;
        draw();
    });

    // Redessiner quand les props changent
    $: if (ctx) {
        draw();
    }

    function draw() {
        if (!ctx) return;

        // Effacer le canvas
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(0, 0, width * cellSize, height * cellSize);

        // Dessiner la grille fixe
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                if (grid[y][x] !== 0) {
                    drawCell(x, y, grid[y][x]);
                }
            }
        }

        // Dessiner la pièce en mouvement
        if (piece) {
            const pos = piece.getPosition();
            const shape = piece.getShape();
            const color = piece.getColor();

            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x] !== 0) {
                        drawCell(pos.x + x, pos.y + y, color);
                    }
                }
            }
        }

        // Dessiner la grille de lignes
        drawGridLines();
    }

    function drawCell(x: number, y: number, color: CellState) {
        const padding = 1;
        
        // Couleur principale
        ctx.fillStyle = colors[color];
        ctx.fillRect(
            x * cellSize + padding,
            y * cellSize + padding,
            cellSize - padding * 2,
            cellSize - padding * 2
        );

        // Effet 3D - highlight en haut à gauche
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(
            x * cellSize + padding,
            y * cellSize + padding,
            cellSize - padding * 2,
            3
        );
        ctx.fillRect(
            x * cellSize + padding,
            y * cellSize + padding,
            3,
            cellSize - padding * 2
        );

        // Effet 3D - ombre en bas à droite
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(
            x * cellSize + padding,
            (y + 1) * cellSize - padding - 3,
            cellSize - padding * 2,
            3
        );
        ctx.fillRect(
            (x + 1) * cellSize - padding - 3,
            y * cellSize + padding,
            3,
            cellSize - padding * 2
        );
    }

    function drawGridLines() {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        // Lignes verticales
        for (let x = 0; x <= width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cellSize, 0);
            ctx.lineTo(x * cellSize, height * cellSize);
            ctx.stroke();
        }

        // Lignes horizontales
        for (let y = 0; y <= height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * cellSize);
            ctx.lineTo(width * cellSize, y * cellSize);
            ctx.stroke();
        }
    }
</script>

<canvas
    bind:this={canvas}
    width={width * cellSize}
    height={height * cellSize}
    class="tetris-canvas"
/>

<style>
    .tetris-canvas {
        display: block;
        border-radius: 5px;
        box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
    }
</style>