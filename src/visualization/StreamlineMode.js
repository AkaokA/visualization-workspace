/**
 * StreamlineMode.js - Streamline/field line visualization
 * (MVP version - basic implementation)
 */

class StreamlineMode extends VisualizationMode {
    constructor(vectorField, sceneManager) {
        super(vectorField, sceneManager);
        this.numStreamlines = 20;
    }

    render() {
        this.clear();

        const bounds = this.vectorField.getBounds();
        const dimension = this.vectorField.dimension;

        // Generate seed points for streamlines
        const seedPoints = this.generateSeedPoints(bounds, Math.ceil(this.numStreamlines * this.config.density));

        const color = new THREE.Color(this.config.color);

        // Trace streamlines
        for (const seed of seedPoints) {
            const path = this.vectorField.integrateRK4(seed, 50, 0.2);

            if (path.length < 2) continue;

            // Draw line along path using createLine helper
            for (let i = 0; i < path.length - 1; i++) {
                const start = path[i];
                const end = path[i + 1];

                this.createLine(
                    { x: start.x, y: start.y, z: start.z || 0 },
                    { x: end.x, y: end.y, z: end.z || 0 },
                    color,
                    this.config.opacity
                );
            }
        }
    }

    generateSeedPoints(bounds, count) {
        const seeds = [];
        const xSpan = bounds.max.x - bounds.min.x;
        const ySpan = bounds.max.y - bounds.min.y;

        const sqrtCount = Math.ceil(Math.sqrt(count));

        for (let i = 0; i < sqrtCount; i++) {
            for (let j = 0; j < sqrtCount; j++) {
                const x = bounds.min.x + (i + 0.5) / sqrtCount * xSpan;
                const y = bounds.min.y + (j + 0.5) / sqrtCount * ySpan;

                seeds.push({ x, y, z: 0 });
            }
        }

        return seeds.slice(0, count);
    }

    getDefaultConfig() {
        return {
            color: 0xffffff,
            opacity: 1.0,
            scale: 1.0,
            density: 1.5,
            animated: false
        };
    }
}

window.StreamlineMode = StreamlineMode;
