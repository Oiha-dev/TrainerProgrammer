<script>
    import Select from "./Select.svelte";
    import { currentLanguage, languageSamples, typingStats } from "../lib/store.js";
    import { onMount, onDestroy } from "svelte";

    let sampleText = "";
    let typedText = "";
    let timer;
    let textareaElement;
    let formattedText = "";

    // Subscribe to language changes
    const unsubscribeLanguage = currentLanguage.subscribe(value => {
        sampleText = languageSamples[value].text;
        resetTypingSession();
    });

    // Reset typing session
    function resetTypingSession() {
        typedText = "";
        formattedText = "";
        if (textareaElement) textareaElement.value = "";
        
        typingStats.update(stats => ({
            ...stats,
            wpm: 0,
            accuracy: 100,
            time: 0,
            startTime: null,
            isActive: false,
            correctChars: 0,
            incorrectChars: 0,
            totalChars: 0
        }));
        
        clearInterval(timer);
    }

    // Start timer when typing begins
    function handleInput(event) {
        typedText = event.target.value;
        updateFormattedText();
        
        typingStats.update(stats => {
            // Start timer if not already started
            if (!stats.isActive) {
                stats.startTime = new Date();
                stats.isActive = true;
                startTimer();
            }
            
            // Calculate accuracy
            const correctChars = calculateCorrectChars(typedText, sampleText);
            const totalTyped = typedText.length;
            
            // Calculate WPM: (characters / 5) / minutes
            const timeElapsed = (new Date() - stats.startTime) / 60000; // in minutes
            const wpm = timeElapsed > 0 ? Math.round((correctChars / 5) / timeElapsed) : 0;
            
            // Calculate accuracy
            const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
            
            return {
                ...stats,
                wpm,
                accuracy,
                correctChars,
                incorrectChars: totalTyped - correctChars,
                totalChars: totalTyped
            };
        });

        // Check if typing is complete
        if (typedText.length >= sampleText.length) {
            checkCompletion();
        }
    }

    // Format text with colored spans for correct/incorrect characters
    function updateFormattedText() {
        let result = '';
        for (let i = 0; i < sampleText.length; i++) {
            if (i < typedText.length) {
                if (typedText[i] === sampleText[i]) {
                    result += `<span class="correct">${sampleText[i] === ' ' ? '&nbsp;' : (sampleText[i] === '\n' ? '<br>' : sampleText[i])}</span>`;
                } else {
                    result += `<span class="incorrect">${sampleText[i] === ' ' ? '&nbsp;' : (sampleText[i] === '\n' ? '<br>' : sampleText[i])}</span>`;
                }
            } else {
                result += sampleText[i] === ' ' ? '&nbsp;' : (sampleText[i] === '\n' ? '<br>' : sampleText[i]);
            }
        }
        formattedText = result;
    }

    // Calculate correct characters
    function calculateCorrectChars(typed, sample) {
        let correct = 0;
        for (let i = 0; i < typed.length; i++) {
            if (i < sample.length && typed[i] === sample[i]) {
                correct++;
            }
        }
        return correct;
    }

    // Start timer
    function startTimer() {
        clearInterval(timer);
        timer = setInterval(() => {
            typingStats.update(stats => {
                const elapsed = stats.startTime ? Math.floor((new Date() - stats.startTime) / 1000) : 0;
                return { ...stats, time: elapsed };
            });
        }, 1000);
    }

    // Check if typing is complete
    function checkCompletion() {
        if (typedText === sampleText) {
            clearInterval(timer);
            typingStats.update(stats => ({ ...stats, isActive: false }));
            // Could add completion feedback here
        }
    }

    // Format time display
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    // Add handleKeyDown for 4-spaces support and to handle Enter/Return
    function handleKeyDown(event) {
        if (event.key === "Tab") {
            event.preventDefault();
            const textarea = textareaElement;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            // Insert 4 spaces at cursor
            const spaces = "    ";
            typedText = typedText.slice(0, start) + spaces + typedText.slice(end);
            textarea.value = typedText;
            // Move cursor after the 4 spaces
            textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
            updateFormattedText();
            handleInput({ target: textarea });
        } else if (event.key === "Enter") {
            event.preventDefault();
            
            // Get current cursor position
            const cursorPos = textareaElement.selectionStart;
            
            // Find the next newline in sample text
            const nextNewlinePos = sampleText.indexOf('\n', cursorPos);
            
            if (nextNewlinePos !== -1) {
                // Calculate how many spaces we need to add to reach the end of line
                const spacesToAdd = nextNewlinePos - cursorPos;
                
                if (spacesToAdd > 0) {
                    // Add spaces to fill the current line, plus a newline character
                    const fillerSpaces = '‎'.repeat(spacesToAdd);
                    typedText = typedText.slice(0, cursorPos) + fillerSpaces + '\n' + typedText.slice(cursorPos);
                } else {
                    // Just add the newline if we're already at the end of line
                    typedText = typedText.slice(0, cursorPos) + '\n' + typedText.slice(cursorPos);
                }
                
                // Update textarea
                textareaElement.value = typedText;
                
                // Set cursor position after the newline
                const newCursorPos = cursorPos + spacesToAdd + 1;
                textareaElement.selectionStart = textareaElement.selectionEnd = newCursorPos;
                
                // Update the formatting and stats
                updateFormattedText();
                handleInput({ target: textareaElement });
            }
        }
    }

    // Cleanup on component destruction
    onDestroy(() => {
        clearInterval(timer);
        unsubscribeLanguage();
    });
</script>

<div class="field">
    <div class="top-section">
        <div class="select-wrapper">
            <Select/>
        </div>
        <div class="stats">
            <div class="stat">
                <span class="stat-value">{$typingStats.wpm}</span>
                <span class="stat-label">WPM</span>
            </div>
            <div class="stat">
                <span class="stat-value">{$typingStats.accuracy}%</span>
                <span class="stat-label">Accuracy</span>
            </div>
            <div class="stat">
                <span class="stat-value">{formatTime($typingStats.time)}</span>
                <span class="stat-label">Time</span>
            </div>
        </div>
    </div>
    <div class="typing-container">
        <div class="sample-text">
            {@html formattedText || sampleText}
        </div>
        <textarea 
            bind:this={textareaElement}
            class="text-input" 
            placeholder=""
            on:input={handleInput}
            on:keydown={handleKeyDown}
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
        ></textarea>
        <div class="text-instructions">Start typing to begin...</div>
    </div>
</div>

<style>
    .field {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 700px;
        height: 500px;
        background-color: var(--first-color-dark);
        border-radius: 19px;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        padding: 24px;
    }

    .top-section {
        width: 90%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5%;
    }

    .stats {
        display: flex;
        gap: 24px;
    }

    .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.08);
        padding: 8px 16px;
        border-radius: 12px;
        min-width: 80px;
    }

    .stat-value {
        color: white;
        font-size: 20px;
        font-weight: bold;
    }

    .stat-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        margin-top: 2px;
        min-width: 70px; /* Added for consistent width */
        text-align: center; /* Added to center text */
    }

    .typing-container {
        width: 90%;
        height: 75%;
        position: relative;
        border-radius: 16px;
        background-color: #2C2C2C;
        overflow: hidden;
    }

    .sample-text {
        width: 100%;
        height: 100%;
        padding: 16px;
        color: #aaaaaa;
        font-family: monospace;
        white-space: pre-wrap;
        font-size: 16px;
        line-height: 1.6;
        overflow-y: auto;
        box-sizing: border-box;
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        user-select: none;
    }

    .text-input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 16px;
        background-color: transparent;
        color: transparent; /* Hide user input text */
        caret-color: white; /* Caret remains visible */
        border: none;
        resize: none;
        font-family: monospace;
        font-size: 16px;
        line-height: 1.6;
        z-index: 2;
        box-sizing: border-box;
    }

    .text-input:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(88, 101, 242, 0.6);
    }

    .text-instructions {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: rgba(255, 255, 255, 0.5);
        font-size: 18px;
        pointer-events: none;
        opacity: 0.7;
        transition: opacity 0.3s;
    }

    .text-input:focus ~ .text-instructions,
    .text-input:not(:placeholder-shown) ~ .text-instructions {
        opacity: 0;
    }

    :global(.correct) {
        color: var(--third-color-dark); /* Use theme variable for correct */
        background-color: rgba(61, 204, 160, 0.1);
    }

    :global(.incorrect) {
        color: #ff4d6d; /* Reddish for incorrect */
        background-color: rgba(255, 107, 107, 0.1);
        text-decoration: underline;
    }
</style>
