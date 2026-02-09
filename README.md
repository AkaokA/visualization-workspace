# 2D Vector Field Visualizer

An interactive web-based tool for visualizing and exploring 2D vector fields with multiple preset field types and customization options.

## Features

### Pre-built Vector Fields
- **Gradient (∇f)**: A radially expanding field representing the gradient of a potential function
- **Radial**: Vectors pointing toward or away from a central point with distance-based magnitude
- **Circular (Curl)**: A rotational field creating counter-clockwise circulation
- **Sine Wave**: Time-animated wave patterns based on sine and cosine functions
- **Saddle Point**: A saddle point topology showing opposing forces
- **Spiral**: A converging spiral pattern
- **Custom**: Create your own vector field with mathematical formulas

### Interactive Controls
- **Vector Scale**: Adjust the magnitude of displayed vectors (0.1 - 3.0x)
- **Density**: Control the number of vectors displayed (5 - 50 points per axis)
- **Show Grid**: Toggle coordinate grid and axes on/off
- **Color by Magnitude**: Color vectors based on their magnitude (blue = low, red = high)
- **Animate**: Toggle animation for time-dependent fields
- **Reset View**: Reset animation timer
- **Clear Trail**: Clear particle trails

### Real-time Information
- Hover over the canvas to see:
  - World coordinates (x, y)
  - Vector components (Vx, Vy)
  - Vector magnitude (|V|)

## Usage

### Opening the Visualizer
1. Open `index.html` in a web browser
2. The gradient field will load by default

### Selecting a Field Type
1. Use the "Vector Field" dropdown to select a preset field
2. Each field updates in real-time as you adjust parameters

### Custom Vector Fields
1. Select "Custom Formula" from the dropdown
2. The formula panel will appear below the controls
3. Enter mathematical expressions for Vx (X-component) and Vy (Y-component)
4. Click "Apply Formula" to update the visualization

#### Custom Formula Syntax
Use `x` and `y` as variables, and standard JavaScript Math functions:
- **Basic operators**: `+`, `-`, `*`, `/`, `^` (exponentiation with `Math.pow`)
- **Functions**: `sin()`, `cos()`, `sqrt()`, `abs()`, `pow()`, `exp()`, `log()`
- **Constants**: `PI`, `E`

#### Example Formulas
```
// Vortex field
Vx: -y * 0.01
Vy: x * 0.01

// Source field
Vx: x * 0.005
Vy: y * 0.005

// Wave interference pattern
Vx: sin(x * 0.1) + cos(y * 0.1)
Vy: cos(x * 0.1) + sin(y * 0.1)
```

## Color Scheme

- **Blue regions**: Low magnitude vectors
- **Cyan regions**: Medium magnitude vectors
- **Red regions**: High magnitude vectors
- **Grid lines**: Light gray (coordinate system)
- **Axes**: Dark gray (X and Y axes)
- **Arrowheads**: Match the vector color

## File Structure

```
.
├── index.html           # Main HTML file with markup
├── styles.css          # Styling and layout
├── vector-field.js     # Core visualization logic
└── README.md           # This file
```

## Technical Details

### Canvas Rendering
- Uses HTML5 Canvas API for fast, real-time rendering
- Resolution-independent SVG-style arrow drawing
- Optimized vector field calculation for smooth performance

### Coordinate System
- Origin at canvas center
- X-axis points right, Y-axis points down (standard screen coordinates)
- Configurable scale factor applied to canvas units

### Animation
- Time-based animation for temporal vector fields
- Uses `requestAnimationFrame` for 60 FPS rendering
- Can be toggled on/off independently

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Requires ES6+ JavaScript support

## Performance Tips

- Reduce **Density** if experiencing frame rate drops
- Disable **Show Grid** to save rendering time
- Use simpler custom formulas for better performance
- Lower **Vector Scale** can help with performance on older devices

## Future Enhancement Ideas

- Particle advection/streamlines
- 3D vector field visualization
- Vector field analysis (divergence, curl)
- Field equation solver
- Export to image/video
- Multiple field layers and composition
- Touch gesture support for zooming/panning
