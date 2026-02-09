/**
 * VectorField.js - Base class for vector field representation and evaluation
 * Provides the foundation for all vector field operations
 */

class VectorField {
    /**
     * Create a vector field
     * @param {number} dimension - 2 or 3 for 2D or 3D field
     * @param {Function} func - Function that evaluates the field: f(x, y) or f(x, y, z)
     * @param {Object} bounds - Domain bounds: {min: {x, y, z?}, max: {x, y, z?}}
     */
    constructor(dimension, func, bounds = null) {
        this.dimension = dimension;
        this.func = func;
        this.bounds = bounds || this.getDefaultBounds();
        this.params = {}; // Store custom parameters (a, b, c, etc.)
    }

    /**
     * Evaluate the vector field at a given position
     * @param {Object} position - {x, y, z?}
     * @param {Object} params - Optional parameters to use in evaluation
     * @returns {Array|null} - Vector components [vx, vy] or [vx, vy, vz], or null if invalid
     */
    evaluateAt(position, params = {}) {
        try {
            const mergedParams = { ...this.params, ...params };
            const result = this.func(position, mergedParams);

            // Validate result
            if (!Array.isArray(result) || result.length < this.dimension) {
                return null;
            }

            // Check for invalid numbers
            for (let i = 0; i < this.dimension; i++) {
                if (!Number.isFinite(result[i])) {
                    return null;
                }
            }

            return result.slice(0, this.dimension);
        } catch (error) {
            console.error('Error evaluating vector field:', error);
            return null;
        }
    }

    /**
     * Evaluate field at multiple positions efficiently
     * @param {Array} positions - Array of {x, y, z?} objects
     * @param {Object} params - Optional parameters
     * @returns {Array} - Array of vectors or nulls
     */
    evaluateAtMany(positions, params = {}) {
        return positions.map(pos => this.evaluateAt(pos, params));
    }

    /**
     * Get the magnitude of the field at a position
     * @param {Object} position - {x, y, z?}
     * @param {Object} params - Optional parameters
     * @returns {number} - Magnitude of the vector
     */
    getMagnitude(position, params = {}) {
        const result = this.evaluateAt(position, params);
        if (!result) return 0;
        return Math.sqrt(result.reduce((sum, comp) => sum + comp * comp, 0));
    }

    /**
     * Get the bounds of the field domain
     * @returns {Object} - {min: {x, y, z?}, max: {x, y, z?}}
     */
    getBounds() {
        return this.bounds;
    }

    /**
     * Set custom parameters for evaluation
     * @param {Object} params - {paramName: value, ...}
     */
    setParameters(params) {
        this.params = { ...params };
    }

    /**
     * Get default bounds based on dimension
     * @returns {Object}
     */
    getDefaultBounds() {
        if (this.dimension === 2) {
            return {
                min: { x: -10, y: -10 },
                max: { x: 10, y: 10 }
            };
        } else {
            return {
                min: { x: -5, y: -5, z: -5 },
                max: { x: 5, y: 5, z: 5 }
            };
        }
    }

    /**
     * Sample the field on a grid
     * @param {number} resolution - Number of samples per dimension
     * @param {Object} params - Optional parameters
     * @returns {Array} - Array of {position, vector} objects
     */
    sampleGrid(resolution = 20, params = {}) {
        const bounds = this.getBounds();
        const samples = [];

        const xStep = (bounds.max.x - bounds.min.x) / (resolution - 1);
        const yStep = (bounds.max.y - bounds.min.y) / (resolution - 1);

        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const x = bounds.min.x + i * xStep;
                const y = bounds.min.y + j * yStep;

                if (this.dimension === 2) {
                    const vector = this.evaluateAt({ x, y }, params);
                    if (vector) {
                        samples.push({ position: { x, y }, vector });
                    }
                } else {
                    const zStep = (bounds.max.z - bounds.min.z) / (resolution - 1);
                    for (let k = 0; k < resolution; k++) {
                        const z = bounds.min.z + k * zStep;
                        const vector = this.evaluateAt({ x, y, z }, params);
                        if (vector) {
                            samples.push({ position: { x, y, z }, vector });
                        }
                    }
                }
            }
        }

        return samples;
    }

    /**
     * Integrate the field along a curve using Runge-Kutta 4th order method
     * Useful for streamline computation
     * @param {Object} startPos - Starting position {x, y, z?}
     * @param {number} steps - Number of integration steps
     * @param {number} dt - Time step size
     * @param {Object} params - Optional parameters
     * @returns {Array} - Array of positions along the curve
     */
    integrateRK4(startPos, steps = 100, dt = 0.1, params = {}) {
        const path = [startPos];
        let current = { ...startPos };

        for (let i = 0; i < steps; i++) {
            const k1 = this.evaluateAt(current, params);
            if (!k1) break;

            const pos2 = this.addPosition(current, this.scaleVector(k1, dt / 2));
            const k2 = this.evaluateAt(pos2, params);
            if (!k2) break;

            const pos3 = this.addPosition(current, this.scaleVector(k2, dt / 2));
            const k3 = this.evaluateAt(pos3, params);
            if (!k3) break;

            const pos4 = this.addPosition(current, this.scaleVector(k3, dt));
            const k4 = this.evaluateAt(pos4, params);
            if (!k4) break;

            const avg = k1.map((v, i) => (v + 2*k2[i] + 2*k3[i] + k4[i]) / 6);
            current = this.addPosition(current, this.scaleVector(avg, dt));

            path.push({ ...current });
        }

        return path;
    }

    /**
     * Helper: Add position vectors
     * @private
     */
    addPosition(pos1, pos2) {
        const result = { ...pos1 };
        for (const key in pos2) {
            if (pos1.hasOwnProperty(key)) {
                result[key] = pos1[key] + pos2[key];
            }
        }
        return result;
    }

    /**
     * Helper: Scale a vector
     * @private
     */
    scaleVector(vec, scalar) {
        return vec.map(v => v * scalar);
    }
}

// Export to global if not using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VectorField;
}
