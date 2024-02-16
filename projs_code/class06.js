// Importing OrbitControls (make sure the path matches the version you are using)
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

// Creating the scene
var scene = new THREE.Scene();

// Creating the camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Creating the renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// add light.
const directionLight = new THREE.DirectionalLight(0xffffff, 1)
directionLight.position.set(0, 0, 10)
scene.add(directionLight)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // white light at 50% intensity
scene.add(ambientLight)

// load different color textures
const textureRock = new THREE.TextureLoader().load('textures/cracked+rock.jpg');
const textureGold = new THREE.TextureLoader().load('textures/intricateGold.png');
//const texture = new THREE.TextureLoader().load('textures/wood.jpg');
const displacementMap = new THREE.TextureLoader().load('textures/cracked+rock.jpg');

textureGold.colorSpace = THREE.SRGBColorSpace;
textureRock.colorSpace = THREE.SRGBColorSpace;

// Creating a cube
const boxX = 1, boxY = 1, boxZ = 1;
const boxSegment = 100;
const boxGeometry = new THREE.BoxGeometry(boxX, boxY, boxZ, boxSegment, boxSegment, boxSegment);
const materialSimple = new THREE.MeshStandardMaterial({ map: textureGold });
const materialDisplacement = new THREE.MeshStandardMaterial({ map: textureRock, displacementMap: displacementMap, displacementScale: 0.2 });

// add cube to the scene
const cube = new THREE.Mesh(boxGeometry, materialSimple);
cube.position.set(0, 1, 0);
scene.add(cube);

const planeGeometry = new THREE.PlaneGeometry(3.6, 1.8, 180, 90);
const plane = new THREE.Mesh(planeGeometry, materialDisplacement)
plane.position.set(0, -1, 0)
scene.add(plane);

// Adding OrbitControls
var controls = new OrbitControls(camera, renderer.domElement);

// Adjust control settings if needed
controls.minDistance = 1;
controls.maxDistance = 10;
controls.enablePan = true;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    // Rendering the scene
    renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);
animate();
