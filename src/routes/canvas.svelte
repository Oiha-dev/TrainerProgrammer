<script>
    import { onMount } from 'svelte';
    let canvas;

    onMount(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    });

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

</script>


<canvas bind:this={canvas}></canvas>


<style>
    canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -10;
    }
</style>


