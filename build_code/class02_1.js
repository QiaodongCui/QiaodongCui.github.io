// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Define the vertices of the square (two triangles)
const vertices = new Float32Array([
    -1.0, 1.0, 0.0,   // Top left vertex of the first triangle
    -1.0, -1.0, 0.0,  // Bottom left vertex of the first triangle
    1.0, -1.0, 0.0,   // Bottom right vertex of the first triangle

    -1.0, 1.0, 0.0,   // Top left vertex of the second triangle (repeated)
    1.0, -1.0, 0.0,   // Bottom right vertex of the second triangle (repeated)
    1.0, 1.0, 0.0     // Top right vertex of the second triangle
]);

// Define colors for each vertex
const colors = new Float32Array([
    1.0, 0.0, 0.0,  // Color for top left vertex
    0.0, 1.0, 0.0,  // Color for bottom left vertex
    0.0, 0.0, 1.0,  // Color for bottom right vertex

    1.0, 0.0, 0.0,  // Color for top left vertex (repeated)
    0.0, 0.0, 1.0,  // Color for bottom right vertex (repeated)
    1.0, 1.0, 0.0   // Color for top right vertex
]);

// Create a geometry and add the vertices and colors
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Define a material that uses the vertex colors
const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });

// Create a mesh with the geometry and material
const triangle = new THREE.Mesh(geometry, material);
scene.add(triangle);

camera.position.z = 3;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the triangle
    triangle.rotation.x += 0.01;
    triangle.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();
