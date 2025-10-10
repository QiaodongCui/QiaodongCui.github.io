// Importing OrbitControls (make sure the path matches the version you are using)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.166.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
let object;
init();

function init() {

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20);
	camera.position.z = 2.5;

	// scene
	scene = new THREE.Scene();

	const ambientLight = new THREE.AmbientLight(0xcccccc, 0.2);
	scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 10.8);
	directionalLight.position.set(1, 1, 0).normalize();
	scene.add(directionalLight);

	const envMaploader = new THREE.CubeTextureLoader();
	const environmentMap = envMaploader.load([
		'textures/Bridge2/posx.jpg', 'textures/Bridge2/negx.jpg',
		'textures/Bridge2/posy.jpg', 'textures/Bridge2/negy.jpg',
		'textures/Bridge2/posz.jpg', 'textures/Bridge2/negz.jpg'
	]);
	scene.environment = environmentMap;
	scene.background = environmentMap;

	// Create a metallic material with a gold tint
	const metalMaterial = new THREE.MeshStandardMaterial({
		color: 0xFFD700, // Gold color
		metalness: 0.9, // Fully metallic
		roughness: 0.1 // A bit of roughness to simulate gold's reflectivity
	});

	const loader = new GLTFLoader().setPath('models/2024_ford_shelby_super_snake_s650/');
	loader.load('scene.gltf', async function (gltf) {
		const object = gltf.scene;
		// wait until the model can be added to the scene without blocking due to shader compilation
		await renderer.compileAsync(object, camera, scene);

		// Calculate the bounding box to get model size and center
		const boundingBox = new THREE.Box3().setFromObject(object);
		// Center the model
		const center = boundingBox.getCenter(new THREE.Vector3());
		// Scale the model to a unit scale and center it to (0,0,0)
		const size = boundingBox.getSize(new THREE.Vector3());
		const maxDimension = Math.max(size.x, size.y, size.z);
		const scale = 1.0 / maxDimension;
		object.scale.set(scale, scale, scale);
		object.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
		scene.add(object);

		// add a plane.
		const width = 5;
		const height = 5;
		const planeGeo = new THREE.PlaneGeometry(width, height, 10, 10);
		const plane = new THREE.Mesh(planeGeo, metalMaterial);
		plane.rotation.x = -Math.PI / 2; // rotate to XZ
		plane.position.y = -size.y * scale * 0.5;
		scene.add(plane);

		render();
	});

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', render);
	window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
	renderer.render(scene, camera);
}
