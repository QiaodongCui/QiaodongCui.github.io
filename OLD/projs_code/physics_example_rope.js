import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Graphics variables
let container, stats;
let camera, controls, scene, renderer;
let textureLoader;
const clock = new THREE.Clock();

// Physics variables
const gravityConstant = - 9.8;
let collisionConfiguration;
let dispatcher;
let broadphase;
let solver;
let softBodySolver;
let physicsWorld;
const rigidBodies = [];
const margin = 0.05;
let hinge;
let rope;
let transformAux1;

let armMovement = 0;

Ammo().then(function (AmmoLib) {

	Ammo = AmmoLib;

	init();
	animate();

});

function init() {

	initGraphics();

	initPhysics();

	createObjects();

	initInput();

}

function initGraphics() {

	container = document.getElementById('container');

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xbfd1e5);

	camera.position.set(- 7, 5, 8);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	container.appendChild(renderer.domElement);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 2, 0);
	controls.update();

	textureLoader = new THREE.TextureLoader();

	const ambientLight = new THREE.AmbientLight(0xbbbbbb);
	scene.add(ambientLight);

	const light = new THREE.DirectionalLight(0xffffff, 3);
	light.position.set(- 10, 10, 5);
	light.castShadow = true;
	const d = 10;
	light.shadow.camera.left = - d;
	light.shadow.camera.right = d;
	light.shadow.camera.top = d;
	light.shadow.camera.bottom = - d;

	light.shadow.camera.near = 2;
	light.shadow.camera.far = 50;

	light.shadow.mapSize.x = 1024;
	light.shadow.mapSize.y = 1024;

	scene.add(light);

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild(stats.domElement);

	//

	window.addEventListener('resize', onWindowResize);

}

function initPhysics() {

	// Physics configuration

	collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
	dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
	broadphase = new Ammo.btDbvtBroadphase();
	solver = new Ammo.btSequentialImpulseConstraintSolver();
	softBodySolver = new Ammo.btDefaultSoftBodySolver();
	physicsWorld = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
	physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
	physicsWorld.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, gravityConstant, 0));

	transformAux1 = new Ammo.btTransform();

}

function createObjects() {

	const pos = new THREE.Vector3();
	const quat = new THREE.Quaternion();

	// Ground
	pos.set(0, - 0.5, 0);
	quat.set(0, 0, 0, 1);
	const ground = createParalellepiped(40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }));
	ground.castShadow = true;
	ground.receiveShadow = true;
	textureLoader.load('textures/grid.png', function (texture) {

		texture.colorSpace = THREE.SRGBColorSpace;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(40, 40);
		ground.material.map = texture;
		ground.material.needsUpdate = true;

	});


	// Ball
	const ballMass = 1.2;
	const ballRadius = 0.6;

	const ball = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 20, 20), new THREE.MeshPhongMaterial({ color: 0x202020 }));
	ball.castShadow = true;
	ball.receiveShadow = true;
	const ballShape = new Ammo.btSphereShape(ballRadius);
	ballShape.setMargin(margin);
	pos.set(- 3, 2, 0);
	quat.set(0, 0, 0, 1);
	createRigidBody(ball, ballShape, ballMass, pos, quat);
	ball.userData.physicsBody.setFriction(0.5);

	// Wall
	const brickMass = 0.5;
	const brickLength = 1.2;
	const brickDepth = 0.6;
	const brickHeight = brickLength * 0.5;
	const numBricksLength = 6;
	const numBricksHeight = 8;
	const z0 = - numBricksLength * brickLength * 0.5;
	pos.set(0, brickHeight * 0.5, z0);
	quat.set(0, 0, 0, 1);

	for (let j = 0; j < numBricksHeight; j++) {

		const oddRow = (j % 2) == 1;

		pos.z = z0;

		if (oddRow) {

			pos.z -= 0.25 * brickLength;

		}

		const nRow = oddRow ? numBricksLength + 1 : numBricksLength;

		for (let i = 0; i < nRow; i++) {

			let brickLengthCurrent = brickLength;
			let brickMassCurrent = brickMass;
			if (oddRow && (i == 0 || i == nRow - 1)) {

				brickLengthCurrent *= 0.5;
				brickMassCurrent *= 0.5;

			}

			const brick = createParalellepiped(brickDepth, brickHeight, brickLengthCurrent, brickMassCurrent, pos, quat, createMaterial());
			brick.castShadow = true;
			brick.receiveShadow = true;

			if (oddRow && (i == 0 || i == nRow - 2)) {

				pos.z += 0.75 * brickLength;

			} else {

				pos.z += brickLength;

			}

		}

		pos.y += brickHeight;

	}

	// The rope
	// Rope graphic object
	const ropeNumSegments = 10;
	const ropeLength = 4;
	const ropeMass = 3;
	const ropePos = ball.position.clone();
	ropePos.y += ballRadius;

	const segmentLength = ropeLength / ropeNumSegments;
	const ropeGeometry = new THREE.BufferGeometry();
	const ropeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
	const ropePositions = [];
	const ropeIndices = [];

	for (let i = 0; i < ropeNumSegments + 1; i++) {

		ropePositions.push(ropePos.x, ropePos.y + i * segmentLength, ropePos.z);

	}

	for (let i = 0; i < ropeNumSegments; i++) {

		ropeIndices.push(i, i + 1);

	}

	ropeGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(ropeIndices), 1));
	ropeGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ropePositions), 3));
	ropeGeometry.computeBoundingSphere();
	rope = new THREE.LineSegments(ropeGeometry, ropeMaterial);
	rope.castShadow = true;
	rope.receiveShadow = true;
	scene.add(rope);

	// Rope physic object
	const softBodyHelpers = new Ammo.btSoftBodyHelpers();
	const ropeStart = new Ammo.btVector3(ropePos.x, ropePos.y, ropePos.z);
	const ropeEnd = new Ammo.btVector3(ropePos.x, ropePos.y + ropeLength, ropePos.z);
	const ropeSoftBody = softBodyHelpers.CreateRope(physicsWorld.getWorldInfo(), ropeStart, ropeEnd, ropeNumSegments - 1, 0);
	const sbConfig = ropeSoftBody.get_m_cfg();
	sbConfig.set_viterations(10);
	sbConfig.set_piterations(10);
	ropeSoftBody.setTotalMass(ropeMass, false);
	Ammo.castObject(ropeSoftBody, Ammo.btCollisionObject).getCollisionShape().setMargin(margin * 3);
	physicsWorld.addSoftBody(ropeSoftBody, 1, - 1);
	rope.userData.physicsBody = ropeSoftBody;
	// Disable deactivation
	ropeSoftBody.setActivationState(4);

	// The base
	const armMass = 2;
	const armLength = 3;
	const pylonHeight = ropePos.y + ropeLength;
	const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x606060 });
	pos.set(ropePos.x, 0.1, ropePos.z - armLength);
	quat.set(0, 0, 0, 1);
	const base = createParalellepiped(1, 0.2, 1, 0, pos, quat, baseMaterial);
	base.castShadow = true;
	base.receiveShadow = true;
	pos.set(ropePos.x, 0.5 * pylonHeight, ropePos.z - armLength);
	const pylon = createParalellepiped(0.4, pylonHeight, 0.4, 0, pos, quat, baseMaterial);
	pylon.castShadow = true;
	pylon.receiveShadow = true;
	pos.set(ropePos.x, pylonHeight + 0.2, ropePos.z - 0.5 * armLength);
	const arm = createParalellepiped(0.4, 0.4, armLength + 0.4, armMass, pos, quat, baseMaterial);
	arm.castShadow = true;
	arm.receiveShadow = true;

	// Glue the rope extremes to the ball and the arm
	const influence = 1;
	ropeSoftBody.appendAnchor(0, ball.userData.physicsBody, true, influence);
	ropeSoftBody.appendAnchor(ropeNumSegments, arm.userData.physicsBody, true, influence);

	// Hinge constraint to move the arm
	const pivotA = new Ammo.btVector3(0, pylonHeight * 0.5, 0);
	const pivotB = new Ammo.btVector3(0, - 0.2, - armLength * 0.5);
	const axis = new Ammo.btVector3(0, 1, 0);
	hinge = new Ammo.btHingeConstraint(pylon.userData.physicsBody, arm.userData.physicsBody, pivotA, pivotB, axis, axis, true);
	physicsWorld.addConstraint(hinge, true);


}

function createParalellepiped(sx, sy, sz, mass, pos, quat, material) {

	const threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material);
	const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
	shape.setMargin(margin);

	createRigidBody(threeObject, shape, mass, pos, quat);

	return threeObject;

}

function createRigidBody(threeObject, physicsShape, mass, pos, quat) {

	threeObject.position.copy(pos);
	threeObject.quaternion.copy(quat);

	const transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
	transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
	const motionState = new Ammo.btDefaultMotionState(transform);

	const localInertia = new Ammo.btVector3(0, 0, 0);
	physicsShape.calculateLocalInertia(mass, localInertia);

	const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
	const body = new Ammo.btRigidBody(rbInfo);

	threeObject.userData.physicsBody = body;

	scene.add(threeObject);

	if (mass > 0) {

		rigidBodies.push(threeObject);

		// Disable deactivation
		body.setActivationState(4);

	}

	physicsWorld.addRigidBody(body);

}

function createRandomColor() {

	return Math.floor(Math.random() * (1 << 24));

}

function createMaterial() {

	return new THREE.MeshPhongMaterial({ color: createRandomColor() });

}

function initInput() {

	window.addEventListener('keydown', function (event) {

		switch (event.keyCode) {

			// Q
			case 81:
				armMovement = 1;
				break;

			// A
			case 65:
				armMovement = - 1;
				break;

		}

	});

	window.addEventListener('keyup', function () {

		armMovement = 0;

	});

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

	requestAnimationFrame(animate);

	render();
	stats.update();

}

function render() {

	const deltaTime = clock.getDelta();

	updatePhysics(deltaTime);

	renderer.render(scene, camera);

}

function updatePhysics(deltaTime) {

	// Hinge control
	hinge.enableAngularMotor(true, 1.5 * armMovement, 50);

	// Step world
	physicsWorld.stepSimulation(deltaTime, 10);

	// Update rope
	const softBody = rope.userData.physicsBody;
	const ropePositions = rope.geometry.attributes.position.array;
	const numVerts = ropePositions.length / 3;
	const nodes = softBody.get_m_nodes();
	let indexFloat = 0;

	for (let i = 0; i < numVerts; i++) {

		const node = nodes.at(i);
		const nodePos = node.get_m_x();
		ropePositions[indexFloat++] = nodePos.x();
		ropePositions[indexFloat++] = nodePos.y();
		ropePositions[indexFloat++] = nodePos.z();

	}

	rope.geometry.attributes.position.needsUpdate = true;

	// Update rigid bodies
	for (let i = 0, il = rigidBodies.length; i < il; i++) {

		const objThree = rigidBodies[i];
		const objPhys = objThree.userData.physicsBody;
		const ms = objPhys.getMotionState();
		if (ms) {

			ms.getWorldTransform(transformAux1);
			const p = transformAux1.getOrigin();
			const q = transformAux1.getRotation();
			objThree.position.set(p.x(), p.y(), p.z());
			objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

		}

	}

}
