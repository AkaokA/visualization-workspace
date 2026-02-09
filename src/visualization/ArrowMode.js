/**
 * ArrowMode.js - Arrow glyph visualization mode
 * Displays vector field as arrows at grid points
 */

class ArrowMode extends VisualizationMode {
    constructor(vectorField, sceneManager) {
        super(vectorField, sceneManager);
        this.grid = null;
        this.resolution = 15;
    }

    /**
     * Render arrows for the vector field
     */
    render() {
        this.clear();

        const bounds = this.vectorField.getBounds();
        const dimension = this.vectorField.dimension;

        // Calculate grid spacing
        const resolutionScaled = Math.ceil(this.resolution * this.config.density);
        const xSpan = bounds.max.x - bounds.min.x;
        const ySpan = bounds.max.y - bounds.min.y;

        // Generate sample grid
        const samples = [];
        const xStep = xSpan / (resolutionScaled - 1);
        const yStep = ySpan / (resolutionScaled - 1);

        for (let i = 0; i < resolutionScaled; i++) {
            for (let j = 0; j < resolutionScaled; j++) {
                const x = bounds.min.x + i * xStep;
                const y = bounds.min.y + j * yStep;

                if (dimension === 2) {
                    samples.push({ x, y });
                } else {
                    // For 3D, sample a slice or reduce to 2D
                    samples.push({ x, y, z: 0 });
                }
            }
        }

        // Evaluate field at each sample point
        const maxMagnitude = this.getMaxMagnitude(samples);

        // Create arrows
        for (const pos of samples) {
            const vector = this.vectorField.evaluateAt(pos);
            if (!vector) continue;

            const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
            if (magnitude < 1e-6) continue; // Skip zero vectors

            // Normalize for display
            const displayScale = this.config.scale * 0.8;
            const arrowLength = Math.min(
                displayScale * magnitude / (maxMagnitude || 1),
                displayScale
            );

            const direction = {
                x: vector[0],
                y: vector[1],
                z: vector[2] || 0
            };

            // Scale direction by arrowLength
            const displayDir = {
                x: direction.x * (arrowLength / magnitude || 0),
                y: direction.y * (arrowLength / magnitude || 0),
                z: direction.z * (arrowLength / magnitude || 0)
            };

            // Create arrow
            this.createArrow(
                { x: pos.x, y: pos.y, z: pos.z || 0 },
                displayDir,
                1,
                new THREE.Color(this.config.color),
                this.config.opacity
            );
        }
    }

    /**
     * Get maximum magnitude in samples for scaling
     * @private
     */
    getMaxMagnitude(samples) {
        let max = 0;

        for (const pos of samples) {
            const vector = this.vectorField.evaluateAt(pos);
            if (!vector) continue;

            const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
            max = Math.max(max, magnitude);
        }

        return max;
    }

    /**
     * Override update for any animation (though arrows are static)
     */
    update(deltaTime) {
        // Arrows don't animate, but this could be used for dynamic density changes
    }

    /**
     * Get default config for arrow mode
     */
    getDefaultConfig() {
        return {
            color: 0x0066ff,
            opacity: 1.0,
            scale: 1.0,
            density: 1.0,
            animated: false,
            arrowSize: 0.1
        };
    }
}

window.ArrowMode = ArrowMode;
