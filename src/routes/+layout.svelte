<script>
    import Canvas from './canvas.svelte';
    import './style.css';
    import { onNavigate } from "$app/navigation";

    onNavigate(() => {
        if (!document.startViewTransition) return;

        return new Promise((fulfill) => {
            document.startViewTransition(() => new Promise(fulfill));
        });
    });

</script>


<div class="app">
    <main>
        <Canvas/>
        <slot/>
    </main>
</div>


<style>
    .app {
        position: relative;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        isolation: isolate; /* Create new stacking context */
    }

    .app::before {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-size: 64px 64px;
        background-repeat: repeat;
        opacity: 0.31;
        z-index: -1;
        pointer-events: none; /* Ensures clicks pass through */
    }

    main {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0;
        width: 100%;
        max-width: 72rem;
        margin: 0 auto;
        box-sizing: border-box;
        position: relative; /* For proper stacking context */
    }

    @media (max-width: 768px) {
        main {
            padding: 0 10px;
            width: 100%;
        }
    }

    @media (max-width: 380px) {
        main {
            padding: 0 5px;
        }
    }
</style>

