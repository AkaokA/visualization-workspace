/**
 * HeatmapMode.js - Magnitude-based heatmap visualization
 * (MVP version - basic implementation)
 */

class HeatmapMode extends VisualizationMode {
    constructor(vectorField, sceneManager) {
        super(vectorField, sceneManager);
        this.resolution = 30;
    }

    render() {
        this.clear();

        const bounds = this.vectorField.getBounds();
        const dimension = this.vectorField.dimension;

        // For MVP, create a 2D heatmap grid
        const resolutionScaled = Math.ceil(this.resolution * this.config.density);
        const xSpan = bounds.max.x - bounds.min.x;
        const ySpan = bounds.max.y - bounds.min.y;

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        // Sample field and find magnitude range
        const samples = [];
        let minMagnitude = Infinity;
        let maxMagnitude = -Infinity;

        for (let i = 0; i < resolutionScaled; i++) {
            for (let j = 0; j < resolutionScaled; j++) {
                const x = bounds.min.x + (i / (resolutionScaled - 1)) * xSpan;
                const y = bounds.min.y + (j / (resolutionScaled - 1)) * ySpan;

                const vector = this.vectorField.evaluateAt({ x, y, z: 0 });
                if (vector) {
                    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
                    samples.push({ x, y, magnitude });
                    minMagnitude = Math.min(minMagnitude, magnitude);
                    maxMagnitude = Math.max(maxMagnitude, magnitude);
                }
            }
        }

        // Create mesh with color based on magnitude
        const range = maxMagnitude - minMagnitude || 1;

        samples.forEach(sample => {
            positions.push(sample.x, sample.y, 0);

            // Color by magnitude (blue to red)
            const normalized = (sample.magnitude - minMagnitude) / range;
            const hue = (1 - normalized) * 240 / 360;
            const color = new THREE.Color().setHSL(hue, 1, 0.5);
            colors.push(color.r, color.g, color.b);
        });

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

        const material = new THREE.PointsMaterial({
            size: 0.2 * this.config.scale,
            vertexColors: true,
            opacity: this.config.opacity,
            transparent: this.config.opacity < 1
        });

        const points = new THREE.Points(geometry, material);
        this.meshes.push(points);
        this.sceneManager.addMesh(points);
    }

    getDefaultConfig() {
        return {
            color: 0x0066ff,
            opacity: 1.0,
            scale: 1.0,
            density: 1.0,
            animated: false
        };
    }
}

window.HeatmapMode = HeatmapMode;
