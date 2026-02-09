/**
 * CameraController.js - Handle camera controls for 2D (pan/zoom) and 3D (orbit)
 */

class CameraController {
    constructor(camera, container, dimension = 2) {
        this.camera = camera;
        this.container = container;
        this.dimension = dimension;

        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.zoom = 1;
        this.minZoom = 0.1;
        this.maxZoom = 10;

        // For 3D orbit
        this.rotation = { x: 0, y: 0 };
        this.distance = 12;
        this.minDistance = 2;
        this.maxDistance = 100;
        this.target = new THREE.Vector3(0, 0, 0);

        this.initEventListeners();
    }

    /**
     * Initialize mouse and touch event listeners
     */
    initEventListeners() {
        // Mouse events
        this.container.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.container.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.container.addEventListener('wheel', (e) => this.onMouseWheel(e), { passive: false });

        // Touch events
        this.container.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.container.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.container.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }

    /**
     * Handle mouse down
     */
    onMouseDown(event) {
        if (event.button !== 0 && event.button !== 2) return; // Only left and right click

        this.isDragging = true;
        this.previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    /**
     * Handle mouse move
     */
    onMouseMove(event) {
        if (!this.isDragging) return;

        const deltaX = event.clientX - this.previousMousePosition.x;
        const deltaY = event.clientY - this.previousMousePosition.y;

        if (this.dimension === 2) {
            this.panCamera(deltaX, deltaY);
        } else {
            this.orbitCamera(deltaX, deltaY);
        }

        this.previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    /**
     * Handle mouse up
     */
    onMouseUp(event) {
        this.isDragging = false;
    }

    /**
     * Handle mouse wheel for zoom
     */
    onMouseWheel(event) {
        event.preventDefault();

        const zoomSpeed = 0.1;
        const direction = event.deltaY > 0 ? 1 : -1;

        if (this.dimension === 2) {
            this.zoom += direction * zoomSpeed;
            this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
            this.updateOrthographicCamera();
        } else {
            this.distance += direction * zoomSpeed * this.distance;
            this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
            this.updatePerspectiveCamera();
        }
    }

    /**
     * Handle touch start
     */
    onTouchStart(event) {
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
    }

    /**
     * Handle touch move (pan and pinch)
     */
    onTouchMove(event) {
        event.preventDefault();

        if (event.touches.length === 1 && this.isDragging) {
            const deltaX = event.touches[0].clientX - this.previousMousePosition.x;
            const deltaY = event.touches[0].clientY - this.previousMousePosition.y;

            if (this.dimension === 2) {
                this.panCamera(deltaX, deltaY);
            } else {
                this.orbitCamera(deltaX, deltaY);
            }

            this.previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        } else if (event.touches.length === 2) {
            // Pinch zoom
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const dist = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            if (this.previousDistance) {
                const delta = dist - this.previousDistance;
                const zoomSpeed = 0.01;

                if (this.dimension === 2) {
                    this.zoom -= delta * zoomSpeed;
                    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
                    this.updateOrthographicCamera();
                } else {
                    this.distance -= delta * zoomSpeed * this.distance;
                    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
                    this.updatePerspectiveCamera();
                }
            }

            this.previousDistance = dist;
        }
    }

    /**
     * Handle touch end
     */
    onTouchEnd(event) {
        if (event.touches.length === 0) {
            this.isDragging = false;
            this.previousDistance = null;
        }
    }

    /**
     * Pan camera for 2D view
     */
    panCamera(deltaX, deltaY) {
        const panSpeed = 0.05 / this.zoom;
        this.camera.position.x -= deltaX * panSpeed;
        this.camera.position.y += deltaY * panSpeed;
    }

    /**
     * Orbit camera for 3D view
     */
    orbitCamera(deltaX, deltaY) {
        const rotateSpeed = 0.005;
        this.rotation.y += deltaX * rotateSpeed;
        this.rotation.x += deltaY * rotateSpeed;

        // Clamp x rotation to prevent flipping
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));

        this.updatePerspectiveCamera();
    }

    /**
     * Update orthographic camera position (for 2D)
     */
    updateOrthographicCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.left = -10 * aspect / this.zoom;
        this.camera.right = 10 * aspect / this.zoom;
        this.camera.top = 10 / this.zoom;
        this.camera.bottom = -10 / this.zoom;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Update perspective camera position (for 3D orbit)
     */
    updatePerspectiveCamera() {
        const x = this.target.x + this.distance * Math.sin(this.rotation.y) * Math.cos(this.rotation.x);
        const y = this.target.y + this.distance * Math.sin(this.rotation.x);
        const z = this.target.z + this.distance * Math.cos(this.rotation.y) * Math.cos(this.rotation.x);

        this.camera.position.set(x, y, z);
        this.camera.lookAt(this.target);
    }

    /**
     * Reset view
     */
    reset() {
        this.zoom = 1;
        this.rotation = { x: 0, y: 0 };
        this.distance = 12;

        if (this.dimension === 2) {
            this.camera.position.set(0, 0, 10);
            this.updateOrthographicCamera();
        } else {
            this.updatePerspectiveCamera();
        }
    }

    /**
     * Set dimension (2D or 3D)
     */
    setDimension(dimension) {
        this.dimension = dimension;
        this.reset();
    }

    /**
     * Clean up event listeners
     */
    dispose() {
        this.container.removeEventListener('mousedown', (e) => this.onMouseDown(e));
        this.container.removeEventListener('mousemove', (e) => this.onMouseMove(e));
        this.container.removeEventListener('mouseup', (e) => this.onMouseUp(e));
        this.container.removeEventListener('wheel', (e) => this.onMouseWheel(e));
        this.container.removeEventListener('touchstart', (e) => this.onTouchStart(e));
        this.container.removeEventListener('touchmove', (e) => this.onTouchMove(e));
        this.container.removeEventListener('touchend', (e) => this.onTouchEnd(e));
    }
}

window.CameraController = CameraController;
