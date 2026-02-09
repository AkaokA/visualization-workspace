/**
 * UIController.js - Manages UI events, state updates, and communication with rendering engine
 */

class UIController {
    constructor(app) {
        this.app = app;
        this.state = {
            dimension: 2,
            mode: 'arrows',
            function: '[-y, x]',
            functionVariables: ['x', 'y'],
            color: '#0066ff',
            scale: 1.0,
            density: 1.0,
            opacity: 1.0,
            parameters: {}
        };

        this.initEventListeners();
    }

    /**
     * Initialize all UI event listeners
     */
    initEventListeners() {
        // Dimension toggle
        const dimensionBtn = document.getElementById('dimension-toggle');
        if (dimensionBtn) {
            dimensionBtn.addEventListener('click', () => this.toggleDimension());
        }

        // Reset view
        const resetBtn = document.getElementById('reset-view');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetView());
        }

        // Function preset
        const presetSelect = document.getElementById('function-preset');
        if (presetSelect) {
            presetSelect.addEventListener('change', (e) => this.setFunctionPreset(e.target.value));
        }

        // Function input
        const functionInput = document.getElementById('function-input');
        if (functionInput) {
            functionInput.addEventListener('input', (e) => this.setCustomFunction(e.target.value));
        }

        // Visualization mode
        const modeSelect = document.getElementById('visualization-mode');
        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => this.setVisualizationMode(e.target.value));
        }

        // Density slider
        const densitySlider = document.getElementById('density-slider');
        if (densitySlider) {
            densitySlider.addEventListener('input', (e) => {
                this.state.density = parseFloat(e.target.value);
                document.getElementById('density-value').textContent = e.target.value;
                this.updateVisualization();
            });
        }

        // Color input
        const colorInput = document.getElementById('vector-color');
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                this.state.color = e.target.value;
                this.updateVisualization();
            });
        }

        // Scale slider
        const scaleSlider = document.getElementById('vector-scale');
        if (scaleSlider) {
            scaleSlider.addEventListener('input', (e) => {
                this.state.scale = parseFloat(e.target.value);
                document.getElementById('scale-value').textContent = e.target.value;
                this.updateVisualization();
            });
        }

        // Opacity slider
        const opacitySlider = document.getElementById('opacity-slider');
        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                this.state.opacity = parseFloat(e.target.value);
                document.getElementById('opacity-value').textContent = Math.round(parseFloat(e.target.value) * 100);
                this.updateVisualization();
            });
        }
    }

    /**
     * Toggle between 2D and 3D
     */
    async toggleDimension() {
        const newDimension = this.state.dimension === 2 ? 3 : 2;

        // Disable button during transition
        const btn = document.getElementById('dimension-toggle');
        btn.disabled = true;

        try {
            await this.app.sceneManager.switchDimension();
            this.state.dimension = newDimension;
            this.app.cameraController.setDimension(newDimension);

            btn.textContent = newDimension === 2 ? 'Switch to 3D' : 'Switch to 2D';

            // Re-render with new dimension
            this.updateVisualization();
        } finally {
            btn.disabled = false;
        }
    }

    /**
     * Reset view
     */
    resetView() {
        this.app.cameraController.reset();
    }

    /**
     * Set function from preset
     */
    setFunctionPreset(key) {
        const presets = {
            'vortex-2d': '[[-y, x]]',
            'saddle-2d': '[[x, -y]]',
            'spiral-2d': '[[-y + 0.1*x, x + 0.1*y]]',
            'wave-2d': '[[sin(y), cos(x)]]',
            'gradient-2d': '[[x, y]]',
            'curl-2d': '[[cos(x)*sin(y), sin(x)*cos(y)]]'
        };

        if (presets[key]) {
            const func = presets[key].slice(1, -1); // Remove outer brackets
            document.getElementById('function-input').value = func;
            this.setCustomFunction(func);
        }
    }

    /**
     * Set custom function
     */
    setCustomFunction(funcString) {
        const parser = new FunctionParser();
        const result = parser.parse(funcString, this.state.dimension);

        const errorEl = document.getElementById('function-error');
        if (result.error) {
            errorEl.textContent = result.error;
            errorEl.className = 'error';
            return;
        }

        // Clear previous error
        errorEl.textContent = '';
        errorEl.className = '';

        // Test the function
        const test = parser.testFunction(result.func, this.state.dimension);
        if (!test.success) {
            errorEl.textContent = 'Function produces invalid results';
            errorEl.className = 'error';
            return;
        }

        // Success
        this.state.function = funcString;
        this.state.functionVariables = result.variables;

        // Update vector field
        this.app.vectorField = new VectorField(
            this.state.dimension,
            result.func
        );

        // Create/update parameter sliders
        this.createParameterSliders(result.variables);

        // Re-render
        this.updateVisualization();
    }

    /**
     * Create parameter sliders for function variables
     */
    createParameterSliders(variables) {
        const paramsSection = document.getElementById('parameters-section');
        const container = document.getElementById('parameters-container');

        // Filter to only custom variables (exclude x, y, z)
        const customvars = variables.filter(v => !['x', 'y', 'z'].includes(v));

        if (customvars.length === 0) {
            paramsSection.style.display = 'none';
            return;
        }

        paramsSection.style.display = 'block';
        container.innerHTML = '';

        customvars.forEach(varName => {
            const group = document.createElement('div');
            group.className = 'control-group';

            const label = document.createElement('label');
            label.className = 'label';
            label.textContent = varName;

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = '-5';
            slider.max = '5';
            slider.step = '0.1';
            slider.value = '1';

            const valueSpan = document.createElement('small');
            valueSpan.style.color = '#666';
            valueSpan.style.display = 'block';
            valueSpan.style.marginTop = '5px';
            valueSpan.textContent = '1.0';

            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                valueSpan.textContent = value.toFixed(1);
                this.state.parameters[varName] = value;
                this.updateVisualization();
            });

            group.appendChild(label);
            group.appendChild(slider);
            group.appendChild(valueSpan);
            container.appendChild(group);

            // Initialize parameter
            this.state.parameters[varName] = 1;
        });
    }

    /**
     * Set visualization mode
     */
    setVisualizationMode(mode) {
        this.state.mode = mode;
        this.updateVisualization();
    }

    /**
     * Update visualization with current state
     */
    updateVisualization() {
        try {
            console.log('updateVisualization() called, mode:', this.state.mode);

            // Clear previous visualization
            this.app.sceneManager.clearMeshes();
            console.log('Cleared meshes');

            // Create new visualization mode
            let ModeClass;
            console.log('Available classes - ArrowMode:', typeof window.ArrowMode, 'StreamlineMode:', typeof window.StreamlineMode);

            switch (this.state.mode) {
                case 'arrows':
                    ModeClass = window.ArrowMode;
                    break;
                case 'streamlines':
                    ModeClass = window.StreamlineMode;
                    break;
                case 'particles':
                    ModeClass = window.ParticleMode;
                    break;
                case 'heatmap':
                    ModeClass = window.HeatmapMode;
                    break;
                default:
                    ModeClass = window.ArrowMode;
            }

            if (!ModeClass) {
                throw new Error('ModeClass is null - visualization mode not found');
            }

            console.log('ModeClass selected:', ModeClass.name);

            const mode = new ModeClass(this.app.vectorField, this.app.sceneManager);
            console.log('Visualization mode instantiated');

            // Apply style config
            try {
                mode.updateStyle({
                    color: this.hexToInt(this.state.color),
                    scale: this.state.scale,
                    density: this.state.density,
                    opacity: this.state.opacity
                });
                console.log('Style updated');
            } catch (e) {
                console.error('Style update error:', e);
                // Invalid color, use default
                mode.updateStyle({
                    color: 0x0066ff,
                    scale: this.state.scale,
                    density: this.state.density,
                    opacity: this.state.opacity
                });
            }

            // Set parameters if any
            if (Object.keys(this.state.parameters).length > 0) {
                this.app.vectorField.setParameters(this.state.parameters);
                console.log('Parameters set');
            }

            // Render
            console.log('Calling mode.render()...');
            mode.render();
            console.log('mode.render() completed');

            // Update stats
            const stats = this.app.sceneManager.getStats();
            document.getElementById('vector-count').textContent = stats.meshes;
            console.log('Visualization complete. Mesh count:', stats.meshes);
        } catch (error) {
            console.error('Visualization error:', error);
            console.error('Error stack:', error.stack);
            const errorEl = document.getElementById('function-error');
            if (errorEl) {
                errorEl.textContent = 'Rendering error: ' + error.message;
                errorEl.className = 'error';
            }
        }
    }

    /**
     * Helper: Convert hex color to integer
     */
    hexToInt(hex) {
        try {
            return parseInt(hex.replace('#', ''), 16);
        } catch (e) {
            return 0x0066ff;
        }
    }

    /**
     * Update FPS display
     */
    updateStats(stats) {
        document.getElementById('fps').textContent = stats.fps;
    }
}

window.UIController = UIController;
