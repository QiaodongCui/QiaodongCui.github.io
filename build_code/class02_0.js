// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const nWidth = width / Math.max(width, height) * 10;
const nHeight = height / Math.max(width, height) * 10;
//const camera = new THREE.OrthographicCamera(-nWidth / 2, nWidth / 2, nHeight / 2, -nHeight / 2, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

const edgeGeometry = new THREE.EdgesGeometry(geometry);
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Edge color
const cubeEdges = new THREE.LineSegments(edgeGeometry, edgeMaterial);

const geometrySphere = new THREE.SphereGeometry(0.1, 32, 16);
//const sphereMesh = new THREE.Mesh(geometrySphere, material);
//sphereMesh.position.x = 1.5

const geometryTorus = new THREE.TorusGeometry(0.8, 0.2, 16, 100)
const torusMesh = new THREE.Mesh(geometryTorus, material);
torusMesh.position.x = -1.5

const group = new THREE.Group();
//group.add(cube)
//group.add(cubeEdges)
//group.add(sphereMesh)
//group.add(torusMesh)

for (let x = -3; x <= 3; x++)
    for (let y = -3; y <= 3; y++)
        for (let z = -3; z <= 3; z++) {
            const sphereMesh = new THREE.Mesh(geometrySphere, material);
            sphereMesh.position.set(x * 0.5, y * 0.5, z * 0.5);
            group.add(sphereMesh)
        }

scene.add(group);

camera.position.z = 5;

// Animation loop
group.rotation.x = 0.45;
group.rotation.y = 0.45;

function animate() {
    requestAnimationFrame(animate);
    // Rotate the cube
    //group.rotation.x += 0.02;
    //group.rotation.y += 0.02;

    renderer.render(scene, camera);
}

animate();