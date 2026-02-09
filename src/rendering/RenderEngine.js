/**
 * RenderEngine.js - Main rendering loop and animation frame management
 */

class RenderEngine {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.isRunning = false;
        this.animationFrameId = null;
        this.lastTime = performance.now();
        this.fixedDeltaTime = 1 / 60; // Target 60 FPS
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateInterval = 0;

        // Performance tracking
        this.stats = {
            fps: 0,
            frameTime: 0,
            vectorCount: 0
        };

        this.visualizationMode = null;
    }

    /**
     * Start the render loop
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = performance.now();
        console.log('Render loop starting...');
        this.animate();
    }

    /**
     * Stop the render loop
     */
    stop() {
        this.isRunning = false;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Main animation loop
     * @private
     */
    animate = () => {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Update visualization if present
        if (this.visualizationMode && this.visualizationMode.update) {
            this.visualizationMode.update(deltaTime);
        }

        // Render scene
        this.render(deltaTime);

        // Update FPS
        this.updateStats(deltaTime);

        // Continue animation loop
        this.animationFrameId = requestAnimationFrame(this.animate);
    };

    /**
     * Render a single frame
     */
    render(deltaTime) {
        this.sceneManager.render();
    }

    /**
     * Update statistics
     * @private
     */
    updateStats(deltaTime) {
        this.frameCount++;
        this.fpsUpdateInterval += deltaTime;

        // Update FPS every 0.5 seconds
        if (this.fpsUpdateInterval >= 0.5) {
            this.stats.fps = Math.round(this.frameCount / this.fpsUpdateInterval);
            this.frameCount = 0;
            this.fpsUpdateInterval = 0;
        }

        this.stats.frameTime = deltaTime * 1000; // Convert to milliseconds
        this.stats.vectorCount = this.sceneManager.meshes.length;
    }

    /**
     * Get current statistics
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Set the visualization mode to update
     */
    setVisualizationMode(mode) {
        this.visualizationMode = mode;
    }

    /**
     * Dispose resources
     */
    dispose() {
        this.stop();
    }
}

window.RenderEngine = RenderEngine;
