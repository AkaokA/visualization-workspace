/**
 * VisualizationMode.js - Abstract base class for visualization modes
 * Defines the interface that all visualization modes must implement
 */

class VisualizationMode {
    /**
     * Create a visualization mode
     * @param {VectorField} vectorField - The vector field to visualize
     * @param {SceneManager} sceneManager - The scene manager for rendering
     */
    constructor(vectorField, sceneManager) {
        this.vectorField = vectorField;
        this.sceneManager = sceneManager;
        this.meshes = [];
        this.config = this.getDefaultConfig();
    }

    /**
     * Get default configuration for this mode
     * @returns {Object}
     */
    getDefaultConfig() {
        return {
            color: 0xffffff,
            opacity: 1.0,
            scale: 1.0,
            density: 1.5,
            animated: false,
            showArrowheads: true
        };
    }

    /**
     * Render the visualization
     * Must be implemented by subclasses
     */
    render() {
        throw new Error('render() must be implemented by subclass');
    }

    /**
     * Update visualization style
     * @param {Object} config - New configuration
     */
    updateStyle(config) {
        this.config = { ...this.config, ...config };
        this.updateMeshColors();
    }

    /**
     * Update mesh colors based on config
     * Can be overridden by subclasses
     */
    updateMeshColors() {
        const color = new THREE.Color(this.config.color);

        this.meshes.forEach(mesh => {
            if (mesh.material) {
                if (mesh.material.color) {
                    mesh.material.color.copy(color);
                }
                if (mesh.material.opacity !== undefined) {
                    mesh.material.opacity = this.config.opacity;
                }
            }
        });
    }

    /**
     * Update animation (if applicable)
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Override in subclasses if animation needed
    }

    /**
     * Clear all meshes for this mode
     */
    clear() {
        this.meshes.forEach(mesh => {
            this.sceneManager.removeMesh(mesh);
        });
        this.meshes = [];
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.clear();
    }

    /**
     * Helper: Create a line from two points
     * @protected
     */
    createLine(start, end, color = this.config.color, opacity = this.config.opacity) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            start.x, start.y, start.z || 0,
            end.x, end.y, end.z || 0
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.LineBasicMaterial({
            color,
            opacity,
            transparent: opacity < 1
        });

        const line = new THREE.Line(geometry, material);
        this.meshes.push(line);
        return this.sceneManager.addMesh(line);
    }

    /**
     * Helper: Create arrow mesh (cone + cylinder)
     * @protected
     */
    createArrow(start, direction, length, color = this.config.color, opacity = this.config.opacity, showHead = true) {
        const group = new THREE.Group();

        // Normalize direction
        const dir = new THREE.Vector3(direction.x, direction.y, direction.z || 0);
        const magnitude = dir.length();
        if (magnitude === 0) return group;

        dir.normalize();

        // Cylinder for shaft
        const cylinderGeometry = new THREE.CylinderGeometry(length * 0.05, length * 0.05, length * 0.7, 8);
        const material = new THREE.MeshBasicMaterial({ color, opacity, transparent: opacity < 1 });

        const cylinder = new THREE.Mesh(cylinderGeometry, material);
        cylinder.position.copy(start);
        cylinder.position.addScaledVector(dir, length * 0.35);

        // Quaternion for cylinder orientation
        const axis = new THREE.Vector3(0, 1, 0).cross(dir);
        if (axis.length() > 0.001) {
            const quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(axis.normalize(), Math.acos(dir.y));
            cylinder.quaternion.copy(quaternion);
        }

        group.add(cylinder);

        // Cone for arrowhead (only if showHead is true)
        if (showHead) {
            const coneGeometry = new THREE.ConeGeometry(length * 0.15, length * 0.3, 8);
            const cone = new THREE.Mesh(coneGeometry, material);

            cone.position.copy(start);
            cone.position.addScaledVector(dir, length * 0.85);

            if (axis.length() > 0.001) {
                const quaternion = new THREE.Quaternion();
                quaternion.setFromAxisAngle(axis.normalize(), Math.acos(dir.y));
                cone.quaternion.copy(quaternion);
            }

            group.add(cone);
        }

        this.meshes.push(group);
        return this.sceneManager.addMesh(group);
    }

    /**
     * Helper: Create sphere for point visualization
     * @protected
     */
    createPoint(position, size = 0.1, color = this.config.color, opacity = this.config.opacity) {
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color, opacity, transparent: opacity < 1 });
        const sphere = new THREE.Mesh(geometry, material);

        sphere.position.set(position.x, position.y, position.z || 0);

        this.meshes.push(sphere);
        return this.sceneManager.addMesh(sphere);
    }

    /**
     * Helper: Get color for a component (e.g., based on magnitude)
     * @protected
     */
    getComponentColor(value, min = 0, max = 1) {
        const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
        const hue = (1 - normalized) * 240 / 360; // Blue to red
        return new THREE.Color().setHSL(hue, 1, 0.5);
    }
}

window.VisualizationMode = VisualizationMode;
