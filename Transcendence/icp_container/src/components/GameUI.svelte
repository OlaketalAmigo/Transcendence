<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let score: number = 0;
    export let isRunning: boolean = false;
    export let isPaused: boolean = false;

    const dispatch = createEventDispatcher();
</script>

<div class="game-ui">
    <div class="score-display">
        <h3>Score</h3>
        <div class="score">{score}</div>
    </div>

    <div class="controls">
        {#if !isRunning}
            <button class="btn btn-start" on:click={() => dispatch('start')}>
                Start Game
            </button>
        {:else}
            <button class="btn btn-pause" on:click={() => dispatch('pause')}>
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <button class="btn btn-stop" on:click={() => dispatch('stop')}>
                Stop
            </button>
        {/if}
    </div>

    <div class="instructions">
        <h4>Contrôles</h4>
        <ul>
            <li>← → : Déplacer</li>
            <li>↓ : Descendre</li>
            <li>Q/W : Rotation</li>
            <li>Espace : Drop</li>
            <li>C : Hold</li>
        </ul>
    </div>
</div>

<style>
    .game-ui {
        margin-top: 20px;
    }

    .score-display {
        text-align: center;
        margin-bottom: 20px;
    }

    .score-display h3 {
        color: white;
        margin: 0 0 10px 0;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .score {
        font-size: 36px;
        font-weight: bold;
        color: #fbbf24;
        text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
    }

    .controls {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;
    }

    .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .btn-start {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
    }

    .btn-start:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
    }

    .btn-pause {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
    }

    .btn-pause:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(245, 158, 11, 0.4);
    }

    .btn-stop {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
    }

    .btn-stop:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4);
    }

    .instructions {
        color: white;
        font-size: 14px;
    }

    .instructions h4 {
        margin: 0 0 10px 0;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .instructions ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .instructions li {
        padding: 5px 0;
        opacity: 0.8;
    }
</style>