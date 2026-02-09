/**
 * FunctionParser.js - Safe expression parser for vector field functions
 * Uses Math.js for safe evaluation of user-provided mathematical expressions
 */

class FunctionParser {
    constructor() {
        // Whitelist of allowed functions for safety
        this.allowedFunctions = [
            'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
            'sinh', 'cosh', 'tanh',
            'sqrt', 'cbrt', 'abs', 'exp', 'log', 'log10', 'log2',
            'floor', 'ceil', 'round', 'sign',
            'min', 'max', 'pow', 'hypot',
            'random'
        ];
    }

    /**
     * Parse and compile a vector field function string
     * @param {string} expression - Expression like "[-y, x]" or "[sin(x), cos(y), z]"
     * @param {number} dimension - Expected dimension (2 or 3)
     * @returns {Object} - {func, error, variables}
     *   func: Function ready to evaluate, or null if error
     *   error: Error message string, or null if successful
     *   variables: Array of detected variable names
     */
    parse(expression, dimension) {
        // Remove whitespace
        const expr = expression.trim();

        // Check basic structure - should be array notation
        if (!expr.startsWith('[') || !expr.endsWith(']')) {
            return {
                func: null,
                error: 'Function must be in array notation: [vx, vy] or [vx, vy, vz]',
                variables: []
            };
        }

        try {
            // Extract components
            const content = expr.slice(1, -1);
            const components = this.splitComponents(content);

            // Validate component count
            if (components.length !== dimension) {
                return {
                    func: null,
                    error: `Expected ${dimension} components, got ${components.length}`,
                    variables: []
                };
            }

            // Parse and validate each component
            const compiled = [];
            const variables = new Set();

            for (let i = 0; i < components.length; i++) {
                const comp = components[i].trim();

                // Test parse with Math.js to catch syntax errors
                try {
                    const parsed = math.parse(comp);
                    const vars = this.extractVariables(parsed);
                    vars.forEach(v => variables.add(v));
                    compiled.push(comp);
                } catch (e) {
                    return {
                        func: null,
                        error: `Component ${i}: ${e.message}`,
                        variables: Array.from(variables)
                    };
                }
            }

            // Validate variables
            const validVars = dimension === 2 ? ['x', 'y'] : ['x', 'y', 'z'];
            const invalidVars = Array.from(variables).filter(v => !validVars.includes(v));

            if (invalidVars.length > 0) {
                return {
                    func: null,
                    error: `Invalid variables: ${invalidVars.join(', ')}. Use ${validVars.join(', ')}`,
                    variables: Array.from(variables)
                };
            }

            // Create the evaluation function
            const func = (position, params = {}) => {
                const scope = {
                    ...position,
                    ...params,
                    pi: Math.PI,
                    e: Math.E
                };

                const result = [];
                for (const comp of compiled) {
                    try {
                        const value = math.evaluate(comp, scope);
                        result.push(Number(value));
                    } catch (e) {
                        // Return null on evaluation error
                        return null;
                    }
                }
                return result;
            };

            return {
                func,
                error: null,
                variables: Array.from(variables).sort()
            };
        } catch (error) {
            return {
                func: null,
                error: `Parse error: ${error.message}`,
                variables: []
            };
        }
    }

    /**
     * Split array components by comma, respecting parentheses
     * @private
     */
    splitComponents(content) {
        const components = [];
        let current = '';
        let depth = 0;

        for (let i = 0; i < content.length; i++) {
            const char = content[i];

            if (char === '(' || char === '[' || char === '{') {
                depth++;
                current += char;
            } else if (char === ')' || char === ']' || char === '}') {
                depth--;
                current += char;
            } else if (char === ',' && depth === 0) {
                components.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        if (current) {
            components.push(current);
        }

        return components;
    }

    /**
     * Extract variable names from parsed Math.js expression
     * @private
     */
    extractVariables(node) {
        const variables = new Set();

        const traverse = (n) => {
            if (!n) return;

            if (n.type === 'SymbolNode') {
                variables.add(n.name);
            } else if (n.type === 'OperatorNode') {
                if (n.args) {
                    n.args.forEach(traverse);
                }
            } else if (n.type === 'ParenthesisNode') {
                traverse(n.content);
            } else if (n.type === 'FunctionNode') {
                if (n.args) {
                    n.args.forEach(traverse);
                }
            } else if (n.type === 'UnaryMinusNode' || n.type === 'UnaryPlusNode') {
                traverse(n.arg);
            }
        };

        traverse(node);
        return Array.from(variables);
    }

    /**
     * Test if a function works on sample points
     * @param {Function} func - Compiled function from parse()
     * @param {number} dimension - 2 or 3
     * @param {Object} params - Optional parameters
     * @returns {Object} - {success, error, testedPoints}
     */
    testFunction(func, dimension = 2, params = {}) {
        if (!func) {
            return { success: false, error: 'No function provided', testedPoints: 0 };
        }

        const testPoints = [
            dimension === 2 ? { x: 0, y: 0 } : { x: 0, y: 0, z: 0 },
            dimension === 2 ? { x: 1, y: 1 } : { x: 1, y: 1, z: 1 },
            dimension === 2 ? { x: -1, y: 1 } : { x: -1, y: 1, z: 1 },
            dimension === 2 ? { x: 0.5, y: 0.5 } : { x: 0.5, y: 0.5, z: 0.5 }
        ];

        let validCount = 0;
        for (const point of testPoints) {
            const result = func(point, params);
            if (result && result.length === dimension && result.every(v => Number.isFinite(v))) {
                validCount++;
            }
        }

        if (validCount === 0) {
            return {
                success: false,
                error: 'Function produces invalid results',
                testedPoints: testPoints.length
            };
        }

        return {
            success: true,
            error: null,
            testedPoints: testPoints.length,
            validPoints: validCount
        };
    }
}

// Make available globally
window.FunctionParser = FunctionParser;
