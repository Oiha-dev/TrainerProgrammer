<script>
    import { typingStats, currentLanguage, languageSamples } from "../lib/store.js";
    import { createEventDispatcher, onMount } from "svelte";
    
    const dispatch = createEventDispatcher();
    let wpmChartCanvas;
    let language;
    
    currentLanguage.subscribe(value => {
        language = languageSamples[value].language;
    });
    
    // Calculate completion status - perfect match vs with errors
    $: perfectMatch = $typingStats.incorrectChars === 0;
    
    onMount(() => {
        if (wpmChartCanvas) {
            drawWpmChart();
        }
    });
    
    function drawWpmChart() {
        const ctx = wpmChartCanvas.getContext('2d');
        const width = wpmChartCanvas.width;
        const height = wpmChartCanvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Set background
        ctx.fillStyle = '#2C2C2C';
        ctx.fillRect(0, 0, width, height);
        
        // Get WPM data points
        const wpmData = $typingStats.wpmOverTime;
        
        if (!wpmData || wpmData.length < 2) {
            // Not enough data points
            ctx.font = '16px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.textAlign = 'center';
            ctx.fillText('Not enough data to display WPM over time', width / 2, height / 2);
            return;
        }
        
        // Chart margins
        const margin = {
            top: 30,
            right: 30,
            bottom: 50,
            left: 60
        };
        
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Find min and max values
        const maxWpm = Math.max(...wpmData.map(d => d.wpm)) * 1.1; // Add 10% for better visualization
        const maxTime = wpmData[wpmData.length - 1].time;
        
        // Scale functions
        const scaleX = (time) => margin.left + (time / maxTime) * chartWidth;
        const scaleY = (wpm) => height - margin.bottom - (wpm / maxWpm) * chartHeight;
        
        // Draw axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(margin.left, height - margin.bottom);
        ctx.lineTo(width - margin.right, height - margin.bottom);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, height - margin.bottom);
        ctx.stroke();
        
        // Draw grid lines
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        
        // Horizontal grid lines (WPM)
        const wpmStep = Math.ceil(maxWpm / 5); // 5 steps
        for (let i = wpmStep; i <= maxWpm; i += wpmStep) {
            const y = scaleY(i);
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(width - margin.right, y);
            ctx.stroke();
            
            // WPM labels
            ctx.font = '12px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(i.toString(), margin.left - 10, y);
        }
        
        // Vertical grid lines (Time)
        const timeStep = Math.ceil(maxTime / 5); // 5 steps
        for (let i = timeStep; i <= maxTime; i += timeStep) {
            const x = scaleX(i);
            ctx.beginPath();
            ctx.moveTo(x, margin.top);
            ctx.lineTo(x, height - margin.bottom);
            ctx.stroke();
            
            // Time labels
            ctx.font = '12px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(formatTime(i), x, height - margin.bottom + 10);
        }
        
        ctx.setLineDash([]); // Reset line dash
        
        // Draw WPM line
        ctx.beginPath();
        ctx.moveTo(scaleX(wpmData[0].time), scaleY(wpmData[0].wpm));
        
        for (let i = 1; i < wpmData.length; i++) {
            ctx.lineTo(scaleX(wpmData[i].time), scaleY(wpmData[i].wpm));
        }
        
        ctx.strokeStyle = '#3DCCA0';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Add gradient fill under the line
        const gradient = ctx.createLinearGradient(0, margin.top, 0, height - margin.bottom);
        gradient.addColorStop(0, 'rgba(61, 204, 160, 0.5)');
        gradient.addColorStop(1, 'rgba(61, 204, 160, 0.1)');
        
        ctx.fillStyle = gradient;
        ctx.lineTo(scaleX(wpmData[wpmData.length - 1].time), height - margin.bottom);
        ctx.lineTo(scaleX(wpmData[0].time), height - margin.bottom);
        ctx.closePath();
        ctx.fill();
        
        // Draw data points
        for (let i = 0; i < wpmData.length; i++) {
            const x = scaleX(wpmData[i].time);
            const y = scaleY(wpmData[i].wpm);
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#3DCCA0';
            ctx.fill();
            ctx.strokeStyle = '#2C2C2C';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // Draw chart title
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('WPM Over Time', width / 2, 10);
        
        // Draw axis labels
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        
        // Y-axis label
        ctx.save();
        ctx.translate(margin.left - 40, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Words Per Minute', 0, 0);
        ctx.restore();
        
        // X-axis label
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Time (seconds)', width / 2, height - 15);
    }
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }
    
    function handleRestart() {
        dispatch('restart');
    }
</script>

<div class="completion-stats">
    <div class="completion-header">
        <h2>Typing Test Complete!</h2>
        <div class="status-badges">
            <div class="language-badge">{language}</div>
            {#if perfectMatch}
                <div class="status-badge perfect">Perfect Match</div>
            {:else}
                <div class="status-badge errors">{$typingStats.incorrectChars} Errors</div>
            {/if}
        </div>
    </div>
    
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">{$typingStats.wpm}</div>
            <div class="stat-label">Words Per Minute</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value">{$typingStats.accuracy}%</div>
            <div class="stat-label">Accuracy</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value">{$typingStats.time}s</div>
            <div class="stat-label">Total Time</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value">{$typingStats.correctChars}</div>
            <div class="stat-label">Correct Characters</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value">{$typingStats.incorrectChars}</div>
            <div class="stat-label">Incorrect Characters</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value">{$typingStats.totalChars}</div>
            <div class="stat-label">Total Characters</div>
        </div>
    </div>
    
    <div class="chart-container">
        <canvas bind:this={wpmChartCanvas} width="600" height="300"></canvas>
    </div>
    
    <div class="actions">
        <button class="restart-button" on:click={handleRestart}>
            Try Again
        </button>
    </div>
</div>

<style>
    .completion-stats {
        width: 90%;
        height: 75%;
        background-color: #2C2C2C;
        border-radius: 16px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        color: white;
        overflow-y: auto;
        overflow-x: hidden; /* Prevent horizontal scrolling */
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .completion-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;
    }
    
    .completion-header h2 {
        margin: 0;
        color: var(--third-color-dark);
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.01em;
        background: linear-gradient(120deg, var(--third-color-dark), var(--second-color-dark));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 1px 1px rgba(0,0,0,0.1);
    }
    
    .status-badges {
        display: flex;
        gap: 10px;
    }
    
    .language-badge {
        background-color: var(--third-color-dark);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    }
    
    .status-badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    }
    
    .status-badge.perfect {
        background-color: #4ad8a8;
        color: #1a3d30;
    }
    
    .status-badge.errors {
        background-color: #ff4d6d;
        color: #3c1219;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 24px;
    }
    
    .stat-card {
        background-color: rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 16px;
        text-align: center;
        transition: transform 0.2s ease, background-color 0.2s ease;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .stat-card:hover {
        background-color: rgba(255, 255, 255, 0.12);
        transform: translateY(-2px);
    }
    
    .stat-value {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 8px;
        color: var(--third-color-dark);
    }
    
    .stat-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
    }
    
    .chart-container {
        flex: 1;
        border-radius: 12px;
        padding: 15px;
        display: flex;
        justify-content: center;
        align-items: center;
        max-height: 350px;
        max-width: 100%; /* Ensure container doesn't exceed parent width */
    }
    
    .actions {
        display: flex;
        justify-content: center;
        margin-top: 24px;
    }
    
    .restart-button {
        background-color: var(--third-color-dark);
        color: white;
        border: none;
        padding: 12px 28px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        letter-spacing: 0.03em;
    }
    
    .restart-button:hover {
        background-color: #4ad8a8;
        transform: translateY(-2px);
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    }
    
    .restart-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    @media (max-width: 600px) {
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .completion-header {
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>

