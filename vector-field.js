class VectorFieldVisualizer {
    constructor(canvasId = 'viewport') {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Configuration
        this.config = {
            scale: 1,
            density: 20,
            showGrid: true,
            showMagnitude: true,
            animate: true,
            fieldType: 'gradient'
        };

        this.customFormulas = {
            vx: 'x * 0.01 + y * 0.005',
            vy: '-y * 0.01 + x * 0.005'
        };

        this.animationTime = 0;
        this.trail = [];
        this.maxTrailPoints = 5000;

        // Initialize controls
        this.initializeControls();
        this.start();
    }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = Math.min(rect.width - 40, 1200);
        this.canvas.height = Math.min(window.innerHeight - 300, 800);
    }

    initializeControls() {
        // Field select
        document.getElementById('field-select').addEventListener('change', (e) => {
            this.config.fieldType = e.target.value;
            const formulaPanel = document.getElementById('formula-panel');
            formulaPanel.style.display = this.config.fieldType === 'custom' ? 'block' : 'none';
        });

        // Scale slider
        document.getElementById('scale-slider').addEventListener('input', (e) => {
            this.config.scale = parseFloat(e.target.value);
            document.getElementById('scale-value').textContent = e.target.value;
        });

        // Density slider
        document.getElementById('density-slider').addEventListener('input', (e) => {
            this.config.density = parseInt(e.target.value);
            document.getElementById('density-value').textContent = e.target.value;
        });

        // Grid toggle
        document.getElementById('show-grid').addEventListener('change', (e) => {
            this.config.showGrid = e.target.checked;
        });

        // Magnitude toggle
        document.getElementById('show-magnitude').addEventListener('change', (e) => {
            this.config.showMagnitude = e.target.checked;
        });

        // Animate toggle
        document.getElementById('animate').addEventListener('change', (e) => {
            this.config.animate = e.target.checked;
        });

        // Buttons
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearTrail());
        document.getElementById('apply-formula-btn').addEventListener('click', () => this.applyCustomFormula());

        // Canvas mouse tracking
        this.canvas.addEventListener('mousemove', (e) => this.updateInfoPanel(e));
        this.canvas.addEventListener('mouseleave', () => {
            document.getElementById('info-text').textContent = 'Hover over the canvas for coordinates';
        });
    }

    updateInfoPanel(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Convert to world coordinates
        const worldX = (x - this.canvas.width / 2) / this.config.scale;
        const worldY = (y - this.canvas.height / 2) / this.config.scale;

        const vector = this.getVectorAtPoint(worldX, worldY);
        const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);

        document.getElementById('info-text').textContent = 
            `x: ${worldX.toFixed(2)}, y: ${worldY.toFixed(2)} | V: (${vector.x.toFixed(3)}, ${vector.y.toFixed(3)}) | |V|: ${magnitude.toFixed(3)}`;
    }

    getVectorAtPoint(x, y) {
        switch (this.config.fieldType) {
            case 'gradient':
                return { x: 2 * x, y: 2 * y };
            case 'radial':
                const r = Math.sqrt(x ** 2 + y ** 2);
                const magnitude = 1 / (1 + r * r);
                return { x: x * magnitude, y: y * magnitude };
            case 'circular':
                return { x: -y * 0.02, y: x * 0.02 };
            case 'sine':
                const wave = Math.sin(x * 0.05) * Math.cos(this.animationTime * 0.05);
                return { x: wave, y: Math.cos(y * 0.05) * Math.sin(this.animationTime * 0.05) };
            case 'saddle':
                return { x: x * 0.02, y: -y * 0.02 };
            case 'spiral':
                const angle = Math.atan2(y, x);
                const distance = Math.sqrt(x ** 2 + y ** 2);
                const spiralMag = Math.exp(-distance * 0.01) * 0.02;
                return {
                    x: -y * spiralMag,
                    y: x * spiralMag
                };
            case 'custom':
                return this.evaluateCustomFormula(x, y);
            default:
                return { x: 0, y: 0 };
        }
    }

    evaluateCustomFormula(x, y) {
        try {
            const mathObj = { sin: Math.sin, cos: Math.cos, sqrt: Math.sqrt, abs: Math.abs, pow: Math.pow, exp: Math.exp, log: Math.log, PI: Math.PI, E: Math.E };
            const vx = Function(...Object.keys(mathObj), 'x', 'y', `return ${this.customFormulas.vx}`)(...Object.values(mathObj), x, y);
            const vy = Function(...Object.keys(mathObj), 'x', 'y', `return ${this.customFormulas.vy}`)(...Object.values(mathObj), x, y);
            return { x: vx || 0, y: vy || 0 };
        } catch (e) {
            return { x: 0, y: 0 };
        }
    }

    applyCustomFormula() {
        this.customFormulas.vx = document.getElementById('vx-formula').value;
        this.customFormulas.vy = document.getElementById('vy-formula').value;
    }

    reset() {
        this.animationTime = 0;
        this.trail = [];
    }

    clearTrail() {
        this.trail = [];
    }

    drawGrid() {
        const gridSize = 50;
        const startX = -this.canvas.width / 2;
        const startY = -this.canvas.height / 2;

        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let x = Math.floor(startX / gridSize) * gridSize; x < this.canvas.width / 2; x += gridSize) {
            const px = this.canvas.width / 2 + x;
            this.ctx.beginPath();
            this.ctx.moveTo(px, 0);
            this.ctx.lineTo(px, this.canvas.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = Math.floor(startY / gridSize) * gridSize; y < this.canvas.height / 2; y += gridSize) {
            const py = this.canvas.height / 2 + y;
            this.ctx.beginPath();
            this.ctx.moveTo(0, py);
            this.ctx.lineTo(this.canvas.width, py);
            this.ctx.stroke();
        }

        // Draw axes
        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();
    }

    getMagnitudeColor(magnitude, maxMagnitude) {
        // Normalize magnitude
        const norm = Math.min(magnitude / maxMagnitude, 1);
        
        // Create a color gradient from blue to red
        if (norm < 0.5) {
            // Blue to cyan
            const t = norm * 2;
            const r = Math.floor(0 * (1 - t) + 0 * t);
            const g = Math.floor(100 * (1 - t) + 255 * t);
            const b = Math.floor(255 * (1 - t) + 255 * t);
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            // Cyan to red
            const t = (norm - 0.5) * 2;
            const r = Math.floor(0 * (1 - t) + 255 * t);
            const g = Math.floor(255 * (1 - t) + 100 * t);
            const b = Math.floor(255 * (1 - t) + 0 * t);
            return `rgb(${r}, ${g}, ${b})`;
        }
    }

    drawVectorField() {
        const spacing = Math.max(10, Math.floor(80 / this.config.density * 100) / 100);
        const arrowSize = spacing * 0.3;
        
        // Calculate max magnitude for color scaling
        let maxMagnitude = 0;
        const vectors = [];

        for (let px = 0; px < this.canvas.width; px += spacing) {
            for (let py = 0; py < this.canvas.height; py += spacing) {
                const x = (px - this.canvas.width / 2) / this.config.scale;
                const y = (py - this.canvas.height / 2) / this.config.scale;

                const vector = this.getVectorAtPoint(x, y);
                const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);
                maxMagnitude = Math.max(maxMagnitude, magnitude);
                vectors.push({ px, py, x, y, vector, magnitude });
            }
        }

        // Draw vectors
        vectors.forEach(({ px, py, vector, magnitude }) => {
            const scaledVx = vector.x * this.config.scale * 15;
            const scaledVy = vector.y * this.config.scale * 15;
            const length = Math.sqrt(scaledVx ** 2 + scaledVy ** 2);

            if (length === 0) return;

            // Draw line
            if (this.config.showMagnitude) {
                this.ctx.strokeStyle = this.getMagnitudeColor(magnitude, maxMagnitude);
            } else {
                this.ctx.strokeStyle = '#2a5298';
            }
            
            this.ctx.lineWidth = Math.max(1, Math.min(3, length / 50));
            this.ctx.beginPath();
            this.ctx.moveTo(px, py);
            this.ctx.lineTo(px + scaledVx, py + scaledVy);
            this.ctx.stroke();

            // Draw arrowhead
            const angle = Math.atan2(scaledVy, scaledVx);
            const headlen = Math.min(arrowSize, length * 0.3);

            if (this.config.showMagnitude) {
                this.ctx.fillStyle = this.getMagnitudeColor(magnitude, maxMagnitude);
            } else {
                this.ctx.fillStyle = '#2a5298';
            }

            this.ctx.beginPath();
            this.ctx.moveTo(px + scaledVx, py + scaledVy);
            this.ctx.lineTo(px + scaledVx - headlen * Math.cos(angle - Math.PI / 6), py + scaledVy - headlen * Math.sin(angle - Math.PI / 6));
            this.ctx.lineTo(px + scaledVx - headlen * Math.cos(angle + Math.PI / 6), py + scaledVy - headlen * Math.sin(angle + Math.PI / 6));
            this.ctx.closePath();
            this.ctx.fill();
        });
    }

    drawTrail() {
        if (this.trail.length < 2) return;

        this.ctx.strokeStyle = 'rgba(150, 150, 200, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.trail[0].px, this.trail[0].py);

        for (let i = 1; i < this.trail.length; i++) {
            this.ctx.lineTo(this.trail[i].px, this.trail[i].py);
        }
        this.ctx.stroke();

        // Draw start and end points
        if (this.trail.length > 0) {
            this.ctx.fillStyle = 'rgba(0, 200, 0, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(this.trail[0].px, this.trail[0].py, 4, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = 'rgba(200, 0, 0, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(this.trail[this.trail.length - 1].px, this.trail[this.trail.length - 1].py, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    updateAnimation() {
        if (this.config.animate) {
            this.animationTime += 1;
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        if (this.config.showGrid) {
            this.drawGrid();
        }

        // Draw vector field
        this.drawVectorField();

        // Draw trail
        this.drawTrail();
    }

    start() {
        const animate = () => {
            this.updateAnimation();
            this.draw();
            requestAnimationFrame(animate);
        };
        animate();
    }
}

// Initialize visualizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new VectorFieldVisualizer('viewport');
});
