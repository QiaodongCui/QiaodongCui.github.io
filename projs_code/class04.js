// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const cubeL = 1.0;
const cubeW = 1.0;
const cubeH = 1.0;

// Define the vertices of the square
const vertices = new Float32Array([
    -cubeL, cubeW, -cubeH,  // Vertex 0: Top Left
    -cubeL, -cubeW, -cubeH, // Vertex 1: Bottom Left
    cubeL, -cubeW, -cubeH,  // Vertex 2: Bottom Right
    cubeL, cubeW, -cubeH,    // Vertex 3: Top Right
    -cubeL, cubeW, cubeH,  // Vertex 4: Top Left
    -cubeL, -cubeW, cubeH, // Vertex 5: Bottom Left
    cubeL, -cubeW, cubeH,  // Vertex 6: Bottom Right
    cubeL, cubeW, cubeH    // Vertex 7: Top Right
]);

// Define the indices for the two triangles that make up the square
const indices = [
    0, 1, 2, // First Triangle: Top Left, Bottom Left, Bottom Right
    2, 3, 0,  // Second Triangle: Bottom Right, Top Right, Top Left
    4, 5, 6,
    6, 7, 4,
    0, 3, 4,
    3, 4, 7,
    1, 2, 5,
    2, 5, 6,
    0, 1, 4,
    1, 4, 5,
    2, 3, 6,
    3, 6, 7,
];

// Define colors for each vertex
const colors = new Float32Array([
    1.0, 0.0, 0.0,  // Color for Vertex 0: Red
    0.0, 1.0, 0.0,  // Color for Vertex 1: Green
    0.0, 0.0, 1.0,  // Color for Vertex 2: Blue
    1.0, 1.0, 0.0,   // Color for Vertex 3: Yellow
    1.0, 0.0, 0.0,  // Color for Vertex 0: Red
    0.0, 1.0, 0.0,  // Color for Vertex 1: Green
    0.0, 0.0, 1.0,  // Color for Vertex 2: Blue
    1.0, 1.0, 0.0   // Color for Vertex 3: Yellow
]);

// Create a geometry, add the vertices and colors, and define the faces using indices
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.setIndex(indices);
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Define a material that uses the vertex colors
const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });

// Create a mesh with the geometry and material
const square = new THREE.Mesh(geometry, material);
scene.add(square);

camera.position.z = 3;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the square
    square.rotation.x += 0.01;
    square.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();
