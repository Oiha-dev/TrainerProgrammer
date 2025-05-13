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
        padding: 10px 15px;
        border-radius: 19px;
        font-size: 16px;
        background-color: var(--third-color-dark);
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.2s ease, transform 0.1s ease;
        box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
    }
    
    .dropdown:hover {
        background-color: #45d4a8;
        transform: translateY(-1px);
    }
    
    .dropdown:active {
        transform: translateY(1px);
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
    }

    .select-arrow {
        pointer-events: none;
        color: var(--font-color-dark);
        font-size: 12px;
        transition: transform 0.2s ease;
    }
    
    .dropdown:hover .select-arrow {
        transform: translateY(2px);
    }

    .options-list {
        position: absolute;
        width: 100%;
        background-color: var(--first-color-dark);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        margin-top: 8px;
        border-radius: 8px;
        overflow: hidden;
        animation: fadeIn 0.2s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .option-item {
        padding: 10px 15px;
        cursor: pointer;
        color: white;
        transition: background-color 0.2s ease;
    }

    .option-item:hover, .option-item.selected {
        background-color: var(--third-color-dark);
    }
    
    .option-item.selected {
        font-weight: 500;
    }
</style>
