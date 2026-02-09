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
        const seedPoints = this.generateSeedPoints(bounds, this.numStreamlines * this.config.density);

        const color = new THREE.Color(this.config.color);

        // Trace streamlines
        for (const seed of seedPoints) {
            const path = this.vectorField.integrateRK4(seed, 50, 0.2);

            // Draw line along path
            for (let i = 0; i < path.length - 1; i++) {
                const start = path[i];
                const end = path[i + 1];

                const lineGeometry = new THREE.BufferGeometry();
                const positions = new Float32Array([
                    start.x, start.y, start.z || 0,
                    end.x, end.y, end.z || 0
                ]);

                lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

                const lineMaterial = new THREE.LineBasicMaterial({
                    color,
                    opacity: this.config.opacity,
                    transparent: this.config.opacity < 1,
                    linewidth: 2 * this.config.scale
                });

                const line = new THREE.Line(lineGeometry, lineMaterial);
                this.meshes.push(line);
                this.sceneManager.addMesh(line);
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
            color: 0x0066ff,
            opacity: 1.0,
            scale: 1.0,
            density: 1.0,
            animated: false
        };
    }
}

window.StreamlineMode = StreamlineMode;
