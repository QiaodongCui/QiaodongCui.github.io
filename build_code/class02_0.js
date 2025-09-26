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
//const geometry = new THREE.SphereGeometry(1, 32, 32);
//const geometry = new THREE.TorusGeometry(0.8, 0.5, 32, 100)

// r g 255 b
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

const edgeGeometry = new THREE.EdgesGeometry(geometry);
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Edge color
const cubeEdges = new THREE.LineSegments(edgeGeometry, edgeMaterial);

const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 16);
const sphereMesh = new THREE.Mesh(sphereGeometry, material);
sphereMesh.position.x = 2

/*const sphereEdges = new THREE.EdgesGeometry(sphereGeometry);
const sphereEdgeSeg = new THREE.LineSegments(sphereEdges, edgeMaterial);
sphereEdgeSeg.position.x = 2
*/

const group = new THREE.Group();
scene.add(group);

/*for (let x = -3; x <= 3; x++) // 7
    for (let y = -3; y <= 3; y++) // 7
        for (let z = -3; z <= 3; z++) { // 7
            const sphereMesh = new THREE.Mesh(sphereGeometry, material);
            sphereMesh.position.set(x * 0.5, y * 0.5, z * 0.5);
            group.add(sphereMesh)
        }
*/

group.add(cube)
group.add(cubeEdges)
//group.add(sphereMesh)
//group.add(sphereEdgeSeg)

camera.position.z = 4;

group.rotation.x = 0.45;
group.rotation.y = 0.45;

function animate() {

    requestAnimationFrame(animate);
    // Rotate the group.
    //group.rotation.x += 0.001;
    //group.rotation.y += 0.001;
    //group.position.x += 0.001;

    renderer.render(scene, camera);
}

animate();