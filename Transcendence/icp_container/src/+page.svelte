<script lang="ts">
  import "../index.scss";

  /* normal pour ces erreurs, le fichiers sera charge dans le containers */
  import { backend } from "$lib/canisters";
  import { Tetris } from "$lib/game/tetris";
  import TetrisGame from '$lib/components/TetrisGame.svelte';
  /* fin des erreurs normales */
</script>

<svelte:head>
    <title>Tetris Game</title>
</svelte:head>

<main>
    <button class="play-btn">Play</button>
</main>

<TetrisGame />

<style global>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        overflow: hidden;
    }
</style>