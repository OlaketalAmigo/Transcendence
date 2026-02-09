<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Tetris } from '$lib/game/tetris';
    import type { Grid, Piece } from '$lib/game/tetris';
    import TetrisGrid from '$lib/components/TetrisGrid.svelte';
    import GameUI from '$lib/components/GameUI.svelte';

    let tetris: Tetris;
    let gameGrid: Grid = [];
    let bufferGrid: Grid = [];
    let currentPiece: Piece | null = null;
    let storedPiece: Piece | null = null;
    let score: number = 0;
    let isRunning: boolean = false;
    let isPaused: boolean = false;

    // Rafraîchir l'affichage à 60 FPS
    let renderInterval: number;

    onMount(() => {
        tetris = new Tetris();
        
        // Boucle de rendu (séparée de la logique du jeu)
        renderInterval = window.setInterval(() => {
            if (tetris) {
                gameGrid = tetris.getGrid();
                bufferGrid = tetris.getBufferGrid();
                currentPiece = tetris.getCurrentPiece();
                storedPiece = tetris.getStoredPiece();
                score = tetris.getScore();
                isRunning = tetris.isGameRunning();
                isPaused = tetris.isGamePaused();
            }
        }, 16); // ~60 FPS
    });

    onDestroy(() => {
        if (renderInterval) {
            clearInterval(renderInterval);
        }
        if (tetris) {
            tetris.stop();
        }
    });

    function handleStart() {
        tetris.start();
    }

    function handlePause() {
        tetris.pause();
    }

    function handleStop() {
        tetris.stop();
    }
</script>

<div class="tetris-container">
    <div class="game-area">
        <!-- Grille de stockage (pièce hold) -->
        <div class="side-panel left">
            <h3>Hold</h3>
            <TetrisGrid 
                grid={[[0]]} 
                piece={storedPiece} 
                width={4} 
                height={4}
                cellSize={20}
            />
        </div>

        <!-- Grille principale -->
        <div class="main-grid">
            <TetrisGrid 
                grid={gameGrid} 
                piece={currentPiece} 
                width={10} 
                height={20}
                cellSize={30}
            />
        </div>

        <!-- Panneau de droite -->
        <div class="side-panel right">
            <h3>Next</h3>
            <TetrisGrid 
                grid={bufferGrid} 
                piece={null} 
                width={10} 
                height={5}
                cellSize={20}
            />
            
            <GameUI 
                {score} 
                {isRunning} 
                {isPaused}
                on:start={handleStart}
                on:pause={handlePause}
                on:stop={handleStop}
            />
        </div>
    </div>
</div>

<style>
    .tetris-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
    }

    .game-area {
        display: flex;
        gap: 20px;
        align-items: flex-start;
    }

    .side-panel {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .side-panel h3 {
        color: white;
        margin: 0 0 10px 0;
        text-align: center;
        font-size: 18px;
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    .main-grid {
        background: rgba(0, 0, 0, 0.3);
        padding: 10px;
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }
</style>