<script>
    import { currentLanguage, languageSamples } from "../lib/store.js";
    
    const options = Object.entries(languageSamples).map(([value, data]) => ({
        value,
        label: data.language
    }));

    let selectedValue;
    let showOptions = false;
    
    // Subscribe to the current language
    currentLanguage.subscribe(value => {
        selectedValue = value;
    });

    $: selectedValueLabel = options.find(option => option.value === selectedValue)?.label;

    function toggleDropdown() {
        showOptions = !showOptions;
    }

    function selectOption(option) {
        // Update the store with the new language
        currentLanguage.set(option.value);
        showOptions = false;
    }
</script>

<div class="component">
    <div class="select-container">
        <div class="dropdown" on:click={toggleDropdown}>
            <div class="selected-option">{selectedValueLabel}</div>
            <div class="select-arrow">▼</div>
        </div>
        {#if showOptions}
            <div class="options-list">
                {#each options as option}
                    <div 
                        class="option-item" 
                        class:selected={option.value === selectedValue}
                        on:click={() => selectOption(option)}
                    >
                        {option.label}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .component {
        border-radius: 8px;
        background-color: var(--first-color-dark);
        width: 140px;
        box-sizing: border-box;
    }

    .select-container {
        position: relative;
        width: 100%;
    }

    .dropdown {
        width: 100%;
        padding: 10px 30px 10px 15px;
        border-radius: 19px;
        font-size: 16px;
        background-color: var(--third-color-dark);
        border-bottom: 4px solid var(--bg-color-dark);
        color: white;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .select-arrow {
        pointer-events: none;
        color: var(--font-color-dark);
        font-size: 14px;
    }

    .options-list {
        position: absolute;
        width: 100%;
        background-color: var(--first-color-dark);
        border: 1px solid var(--bg-color-dark);
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        margin-top: 5px;
        border-radius: 8px;
    }

    .option-item {
        padding: 10px 15px;
        cursor: pointer;
        color: white;
    }

    .option-item:hover, .option-item.selected {
        background-color: var(--third-color-dark);
        border-radius: 4px;
    }
</style>
