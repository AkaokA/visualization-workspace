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

        // Generate fewer, better spaced seed points for streamlines
        const seedCount = Math.ceil(this.numStreamlines * this.config.density * 0.4); // Reduce density significantly
        const seedPoints = this.generateSeedPoints(bounds, seedCount);
        console.log('StreamlineMode: Generated', seedPoints.length, 'seed points');

        const color = new THREE.Color(this.config.color);
        let totalPoints = 0;

        // Trace streamlines
        for (let s = 0; s < seedPoints.length; s++) {
            const seed = seedPoints[s];
            const path = this.vectorField.integrateRK4(seed, 50, 0.2);

            if (path.length < 2) {
                continue;
            }

            // Show every 2-3 points to reduce overlapping geometry
            const stepSize = Math.max(2, Math.floor(path.length / 20)); // Show ~20 points per streamline

            for (let i = 0; i < path.length; i += stepSize) {
                const p = path[i];

                // Create small sphere to mark streamline path
                this.createPoint(
                    { x: p.x, y: p.y, z: p.z || 0 },
                    0.15 * this.config.scale,  // larger radius so points are more visible
                    color,
                    this.config.opacity
                );
                totalPoints++;
            }
        }

        console.log('StreamlineMode: Created', totalPoints, 'point spheres along', seedPoints.length, 'streamlines');
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
