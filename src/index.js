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
        try {
            console.log('Starting initialization...');

            const canvasContainer = document.getElementById('canvas-container');
            if (!canvasContainer) {
                console.error('Canvas container not found');
                return;
            }
            console.log('Canvas container found');

            // Initialize core components
            console.log('Creating SceneManager...');
            this.sceneManager = new SceneManager(canvasContainer);
            console.log('SceneManager created');

            console.log('Creating CameraController...');
            this.cameraController = new CameraController(
                this.sceneManager.camera,
                canvasContainer,
                this.sceneManager.dimension
            );
            console.log('CameraController created');

            console.log('Creating RenderEngine...');
            this.renderEngine = new RenderEngine(this.sceneManager);
            console.log('RenderEngine created');

            // Initialize default vector field (vortex)
            console.log('Creating FunctionParser...');
            const parser = new FunctionParser();
            console.log('Parsing vector field function...');
            const result = parser.parse('[-y, x]', 2);
            if (result.error) {
                console.error('Parse error:', result.error);
                return;
            }
            console.log('Creating VectorField...');
            this.vectorField = new VectorField(2, result.func);
            console.log('VectorField created');

            // Initialize UI controller
            console.log('Creating UIController...');
            this.uiController = new UIController(this);
            console.log('UIController created');

            // Start render loop
            console.log('Starting render loop...');
            this.renderEngine.start();
            console.log('Render loop started');

            // Initial visualization
            console.log('Updating visualization...');
            this.uiController.updateVisualization();
            console.log('Visualization updated');

            // Update stats display
            this.statsInterval = setInterval(() => {
                const stats = this.renderEngine.getStats();
                this.uiController.updateStats(stats);
            }, 100);

            console.log('Vector Field Visualization initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            console.error('Stack:', error.stack);
        }
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
