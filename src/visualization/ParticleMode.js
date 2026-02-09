/**
 * ParticleMode.js - Particle flow visualization
 * (MVP version - basic implementation)
 */

class ParticleMode extends VisualizationMode {
    constructor(vectorField, sceneManager) {
        super(vectorField, sceneManager);
        this.particles = [];
        this.numParticles = 100;
        this.time = 0;
    }

    render() {
        this.clear();
        this.particles = [];

        const bounds = this.vectorField.getBounds();
        const numParticles = Math.ceil(this.numParticles * this.config.density);

        // Create particles
        for (let i = 0; i < numParticles; i++) {
            const x = bounds.min.x + Math.random() * (bounds.max.x - bounds.min.x);
            const y = bounds.min.y + Math.random() * (bounds.max.y - bounds.min.y);
            const z = bounds.min.z ? bounds.min.z + Math.random() * (bounds.max.z - bounds.min.z) : 0;

            const sphere = this.createPoint(
                { x, y, z },
                0.05 * this.config.scale,
                new THREE.Color(this.config.color),
                this.config.opacity
            );

            this.particles.push({
                mesh: sphere,
                position: { x, y, z },
                velocity: { x: 0, y: 0, z: 0 }
            });
        }
    }

    update(deltaTime) {
        // Advect particles through the field
        const bounds = this.vectorField.getBounds();
        const speed = 1.0;

        for (const particle of this.particles) {
            const vector = this.vectorField.evaluateAt(particle.position);

            if (vector) {
                const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));

                if (magnitude > 0) {
                    // Update position
                    particle.position.x += vector[0] * deltaTime * speed * 0.1;
                    particle.position.y += vector[1] * deltaTime * speed * 0.1;

                    if (vector[2] !== undefined) {
                        particle.position.z += vector[2] * deltaTime * speed * 0.1;
                    }

                    // Wrap around bounds
                    if (particle.position.x > bounds.max.x) particle.position.x = bounds.min.x;
                    if (particle.position.x < bounds.min.x) particle.position.x = bounds.max.x;
                    if (particle.position.y > bounds.max.y) particle.position.y = bounds.min.y;
                    if (particle.position.y < bounds.min.y) particle.position.y = bounds.max.y;

                    if (bounds.min.z !== undefined) {
                        if (particle.position.z > bounds.max.z) particle.position.z = bounds.min.z;
                        if (particle.position.z < bounds.min.z) particle.position.z = bounds.max.z;
                    }

                    // Update mesh position
                    particle.mesh.position.copy(particle.position);
                }
            }
        }

        this.time += deltaTime;
    }

    getDefaultConfig() {
        return {
            color: 0x0066ff,
            opacity: 0.8,
            scale: 1.0,
            density: 1.0,
            animated: true
        };
    }
}

window.ParticleMode = ParticleMode;
