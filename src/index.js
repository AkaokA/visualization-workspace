/**
 * index.js - Main application entry point
 * Initializes and coordinates all components
 */

class VectorFieldVisualization {
    constructor() {
        this.sceneManager = null;
        this.cameraController = null;
        this.renderEngine = null;
        this.uiController = null;
        this.vectorField = null;
        this.visualizationMode = null;
    }

    /**
     * Initialize the application
     */
    init() {
        const canvasContainer = document.getElementById('canvas-container');
        if (!canvasContainer) {
            console.error('Canvas container not found');
            return;
        }

        // Initialize core components
        this.sceneManager = new SceneManager(canvasContainer);
        this.cameraController = new CameraController(
            this.sceneManager.camera,
            canvasContainer,
            this.sceneManager.dimension
        );
        this.renderEngine = new RenderEngine(this.sceneManager);

        // Initialize default vector field (vortex)
        const parser = new FunctionParser();
        const result = parser.parse('[-y, x]', 2);
        this.vectorField = new VectorField(2, result.func);

        // Initialize UI controller
        this.uiController = new UIController(this);

        // Start render loop
        this.renderEngine.start();

        // Initial visualization
        this.uiController.updateVisualization();

        // Update stats display
        this.statsInterval = setInterval(() => {
            const stats = this.renderEngine.getStats();
            this.uiController.updateStats(stats);
        }, 100);

        console.log('Vector Field Visualization initialized');
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
        }

        if (this.renderEngine) {
            this.renderEngine.dispose();
        }

        if (this.cameraController) {
            this.cameraController.dispose();
        }

        if (this.sceneManager) {
            this.sceneManager.dispose();
        }
    }
}

// Initialize when DOM is ready
window.app = null;

document.addEventListener('DOMContentLoaded', () => {
    window.app = new VectorFieldVisualization();
    window.app.init();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.dispose();
    }
});

window.VectorFieldVisualization = VectorFieldVisualization;
