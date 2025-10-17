import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.166.0/examples/jsm/controls/OrbitControls.js';
import { ShadowMapViewer } from 'https://threejs.org/examples/jsm/utils/ShadowMapViewer.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

const viewDepthMap = true;

let camera, scene, renderer, clock;
let dirLight, spotLight;
let dirLightShadowMapViewer, spotLightShadowMapViewer;
let group, group1;

init();
animate();

function init() {
	initScene();
	initShadowMapViewers();
	initMisc();

	document.body.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize);
}

function initScene() {
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0, 15, 35);

	scene = new THREE.Scene();

	// Lights
	scene.add(new THREE.AmbientLight(0x404040, 3));
	const shadowMapRes = 1024;

	spotLight = new THREE.SpotLight(0xffffff, 500);
	spotLight.name = 'Spot Light';
	spotLight.angle = Math.PI / 5;
	spotLight.penumbra = 0.3;
	spotLight.position.set(10, 15, 5);
	spotLight.castShadow = true;
	spotLight.shadow.camera.near = 8;
	spotLight.shadow.camera.far = 30;
	spotLight.shadow.mapSize.width = shadowMapRes;
	spotLight.shadow.mapSize.height = shadowMapRes;
	scene.add(spotLight);

	scene.add(new THREE.CameraHelper(spotLight.shadow.camera));

	dirLight = new THREE.DirectionalLight(0xffffff, 3);
	dirLight.name = 'Dir. Light';
	dirLight.position.set(0, 10, 0);
	dirLight.castShadow = true;
	dirLight.shadow.camera.near = 1;
	dirLight.shadow.camera.far = 10;
	dirLight.shadow.camera.right = 15;
	dirLight.shadow.camera.left = - 15;
	dirLight.shadow.camera.top = 15;
	dirLight.shadow.camera.bottom = - 15;
	dirLight.shadow.mapSize.width = shadowMapRes;
	dirLight.shadow.mapSize.height = shadowMapRes;
	scene.add(dirLight);

	scene.add(new THREE.CameraHelper(dirLight.shadow.camera));

	// Geometry
	let material = new THREE.MeshPhongMaterial({
		color: 0xff0000,
		shininess: 150,
		specular: 0x222222
	});

	const loader = new GLTFLoader().setPath('models/2024_ford_shelby_super_snake_s650/');
	loader.load('scene.gltf', async function (gltf) {
		const object = gltf.scene;
		// wait until the model can be added to the scene without blocking due to shader compilation
		await renderer.compileAsync(object, camera, scene);

		object.traverse(function (child) {
			if (child.isMesh) {
				child.castShadow = true;
			}
		});

		// Calculate the bounding box to get model size and center
		const boundingBox = new THREE.Box3().setFromObject(object);
		// Center the model
		const center = boundingBox.getCenter(new THREE.Vector3());
		// Scale the model to a unit scale and center it to (0,0,0)
		const size = boundingBox.getSize(new THREE.Vector3());
		const maxDimension = Math.max(size.x, size.y, size.z);
		const scale = 15.0 / maxDimension;
		object.scale.set(scale, scale, scale);
		object.position.set(-center.x * scale, 3 - center.y * scale, -center.z * scale)

		scene.add(object);
		render();
	});

	const geometry = new THREE.BoxGeometry(10, 0.15, 10);
	material = new THREE.MeshPhongMaterial({
		color: 0xa0adaf,
		shininess: 150,
		specular: 0x111111
	});

	const ground = new THREE.Mesh(geometry, material);
	ground.scale.multiplyScalar(3);
	ground.castShadow = false;
	ground.receiveShadow = true;
	scene.add(ground);
}

function initShadowMapViewers() {
	dirLightShadowMapViewer = new ShadowMapViewer(dirLight);
	spotLightShadowMapViewer = new ShadowMapViewer(spotLight);
	resizeShadowMapViewers();
}

function initMisc() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;

	// Mouse control
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 2, 0);
	controls.update();

	clock = new THREE.Clock();
}

function resizeShadowMapViewers() {
	const size = window.innerWidth * 0.15;

	dirLightShadowMapViewer.position.x = 10;
	dirLightShadowMapViewer.position.y = 10;
	dirLightShadowMapViewer.size.width = size;
	dirLightShadowMapViewer.size.height = size;
	dirLightShadowMapViewer.update();

	spotLightShadowMapViewer.size.set(size, size);
	spotLightShadowMapViewer.position.set(size + 20, 10);
	spotLightShadowMapViewer.update();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

	resizeShadowMapViewers();
	dirLightShadowMapViewer.updateForWindowResize();
	spotLightShadowMapViewer.updateForWindowResize();
}

function animate() {
	requestAnimationFrame(animate);
	render();
}

function renderScene() {
	renderer.render(scene, camera);
}

function renderShadowMapViewers() {
	dirLightShadowMapViewer.render(renderer);
	spotLightShadowMapViewer.render(renderer);
}

function render() {
	const delta = clock.getDelta();

	renderScene();
	if (viewDepthMap)
		renderShadowMapViewers();
}
