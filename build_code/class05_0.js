// Importing OrbitControls (make sure the path matches the version you are using)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.166.0/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';

let camera, scene, renderer;
let object;
init();

function init() {
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20);
	camera.position.z = 2.5;

	// scene and light definition.
	scene = new THREE.Scene();
	const ambientLight = new THREE.AmbientLight(0xcccccc, 0.2);
	scene.add(ambientLight);
	const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
	directionalLight.position.set(1, 1, 0).normalize();
	scene.add(directionalLight);

	const textureMap = new THREE.TextureLoader().load('models/chess_1_base_color.png');
	const textureMaterial = new THREE.MeshStandardMaterial({ map: textureMap });
	const plainMaterial = new THREE.MeshStandardMaterial({
		color: 0x0000FF
	});

	/// ---- load obj file --////
	const loader = new OBJLoader();
	function onProgress(xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = xhr.loaded / xhr.total * 100;
			console.log('model ' + percentComplete.toFixed(2) + '% downloaded');
		}
	}

	function onError() { console.log('cant find model'); }

	loader.load('models/chess_1.obj', function (object) {
		// attach material
		object.traverse(function (child) {
			if (child.isMesh) {
				child.material = textureMaterial; // Apply the material to each mesh
			}
		});

		object.scale.set(0.05, 0.05, 0.05);
		// Add the model to the scene
		scene.add(object);
		render();
	}, onProgress, onError);
	/// ---- load obj file --////

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.minDistance = 2;
	controls.maxDistance = 5;
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
