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
        display: block; /* Removes potential inline space */
        backface-visibility: hidden; /* Performance optimization */
        -webkit-backface-visibility: hidden;
        transform: translateZ(0); /* Hardware acceleration */
    }
</style>
