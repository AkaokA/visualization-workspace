/**
 * SceneManager.js - Manages Three.js scene, camera, renderer
 * Central hub for all rendering operations
 */

class SceneManager {
    constructor(container) {
        this.container = container;
        this.dimension = 2;
        this.meshes = [];

        // Three.js core setup
        this.initRenderer();
        this.initScene();
        this.initLighting();
        this.initCamera();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * Initialize Three.js renderer
     */
    initRenderer() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            preserveDrawingBuffer: true
        });

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio || 1);
        this.renderer.setClearColor(0x1a1a1a, 1);

        this.container.appendChild(this.renderer.domElement);
    }

    /**
     * Initialize Three.js scene
     */
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);
    }

    /**
     * Initialize lighting for 3D
     */
    initLighting() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = false;
        this.scene.add(directionalLight);
    }

    /**
     * Initialize camera for 2D/3D
     */
    initCamera() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        if (this.dimension === 2) {
            const aspect = width / height;
            this.camera = new THREE.OrthographicCamera(
                -10 * aspect, 10 * aspect,  // left, right
                10, -10,                     // top, bottom
                0.1, 1000                    // near, far
            );
            this.camera.position.z = 10;
        } else {
            this.camera = new THREE.PerspectiveCamera(
                75,           // fov
                width / height, // aspect
                0.1,          // near
                1000          // far
            );
            this.camera.position.set(10, 10, 10);
            this.camera.lookAt(0, 0, 0);
        }
    }

    /**
     * Switch between 2D and 3D with smooth transition
     */
    async switchDimension() {
        const newDimension = this.dimension === 2 ? 3 : 2;
        const duration = 0.5; // seconds
        const steps = 30;

        const startTime = performance.now();
        const oldCamera = this.camera;
        const oldPosition = { ...oldCamera.position };

        return new Promise(resolve => {
            const animate = (currentTime) => {
                const elapsed = (currentTime - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);

                if (progress < 1) {
                    // Interpolate camera
                    if (newDimension === 2) {
                        const aspect = this.container.clientWidth / this.container.clientHeight;
                        oldCamera.left = -10 * aspect * (1 - progress * 0.5);
                        oldCamera.right = 10 * aspect * (1 - progress * 0.5);
                        oldCamera.top = 10 * (1 - progress * 0.5);
                        oldCamera.bottom = -10 * (1 - progress * 0.5);
                        oldCamera.position.z = 10 - progress * 5;
                        oldCamera.updateProjectionMatrix();
                    } else {
                        // Transition from orthographic to perspective
                        oldCamera.position.x = 5 + progress * 5;
                        oldCamera.position.y = 5 + progress * 5;
                        oldCamera.position.z = 10 - progress * 2;
                    }

                    requestAnimationFrame(animate);
                } else {
                    // Complete transition
                    this.dimension = newDimension;
                    this.initCamera();
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    /**
     * Add a mesh to the scene
     */
    addMesh(mesh) {
        this.scene.add(mesh);
        this.meshes.push(mesh);
        return mesh;
    }

    /**
     * Remove a mesh from the scene
     */
    removeMesh(mesh) {
        this.scene.remove(mesh);
        const idx = this.meshes.indexOf(mesh);
        if (idx > -1) {
            this.meshes.splice(idx, 1);
        }

        // Cleanup geometry and material
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(m => m.dispose());
            } else {
                mesh.material.dispose();
            }
        }
    }

    /**
     * Clear all meshes from scene
     */
    clearMeshes() {
        this.meshes.forEach(mesh => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
            this.scene.remove(mesh);
        });
        this.meshes = [];
    }

    /**
     * Render a single frame
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Get camera position
     */
    getCameraPosition() {
        return this.camera.position.clone();
    }

    /**
     * Reset camera to default position
     */
    resetCamera() {
        if (this.dimension === 2) {
            this.camera.position.z = 10;
            this.camera.lookAt(0, 0, 0);
        } else {
            this.camera.position.set(10, 10, 10);
            this.camera.lookAt(0, 0, 0);
        }
    }

    /**
     * Window resize handler
     */
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        if (this.dimension === 2) {
            const aspect = width / height;
            this.camera.left = -10 * aspect;
            this.camera.right = 10 * aspect;
            this.camera.updateProjectionMatrix();
        } else {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }

        this.renderer.setSize(width, height);
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.clearMeshes();
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }

    /**
     * Get scene statistics
     */
    getStats() {
        return {
            meshes: this.meshes.length,
            geometries: this.scene.children.length,
            triangles: this.meshes.reduce((sum, m) => {
                if (m.geometry && m.geometry.index) {
                    return sum + m.geometry.index.count / 3;
                }
                return sum;
            }, 0)
        };
    }
}

window.SceneManager = SceneManager;
