import Renderer from './CMapJS/Rendering/Renderer.js';
import * as THREE from './CMapJS/Libs/three.module.js';
import { OrbitControls } from './CMapJS/Libs/OrbitsControls.js';
import { DualQuaternion } from './DualQuaternion.js';
import DQHelper from './DQHelper.js';
import { GUI } from './CMapJS/Libs/dat.gui.module.js';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 1000.0);
camera.position.set(1.11, 1.57, 2.3);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
scene.add(ambientLight);
let pointLight0 = new THREE.PointLight(0xffffff, 1);
pointLight0.position.set(0,4,2.5);
scene.add(pointLight0);

const orbit_controls = new OrbitControls(camera, renderer.domElement)


window.addEventListener('resize', function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});


window.camPos = function() {
	console.log(camera.position)
}

const red = new THREE.MeshLambertMaterial({color: 0xff0000, wireframe: false});
const green = new THREE.MeshLambertMaterial({color: 0x00ff00, wireframe: false});
const blue = new THREE.MeshLambertMaterial({color: 0x4444AA, wireframe: false});
const yellow = new THREE.MeshLambertMaterial({color: 0xffff00, wireframe: false});
const cyan = new THREE.MeshLambertMaterial({color: 0x00FFFF, wireframe: false});
const magenta = new THREE.MeshLambertMaterial({color: 0xFF00FF, wireframe: false});
const white = new THREE.MeshLambertMaterial({color: 0xffffff, wireframe: false});
const black = new THREE.MeshLambertMaterial({color: 0x000000, wireframe: false});

const world0 = new THREE.Vector3(0, 0, 0);
const worldX = new THREE.Vector3(1, 0, 0);
const worldY = new THREE.Vector3(0, 1, 0);
const worldZ = new THREE.Vector3(0, 0, 1);

const keyHeld = {};
const defaultKeyDown = function(event){
	keyHeld[event.code] = true;
};

const defaultKeyUp = function(event){
	console.log(event.which, event.code, event.charCode);
	switch(event.code) {
		case "Escape": 
			break;
		case "Space":
			break;
		case "Delete":
			break;
		case "KeyA":
			break;
		case "KeyC":
			break;
		case "KeyE":
			break;
		case "KeyF":
			break
		case "KeyL":
			break;
		case "Numpad0":
			break;
		case "ArrowRight":
			break;
	};

	keyHeld[event.code] = false;
}

window.addEventListener("keydown", defaultKeyDown);
window.addEventListener("keyup", defaultKeyUp);


const grid0 = new THREE.GridHelper(10, 10)
const grid1 = new THREE.GridHelper(10, 20)
const grid2 = new THREE.GridHelper(10, 100)
grid0.material.linewidth = 4
grid1.material.linewidth = 3


scene.add(grid0)
scene.add(grid1)
scene.add(grid2)
scene.add(new THREE.AxesHelper(100))




const controlDQ = new DualQuaternion;
const controlDQHelper = new DQHelper(controlDQ);
// const controlDQHelper = new DQHelper();
scene.add(controlDQHelper)


const dqsInit = [
	DualQuaternion.setFromRotationTranslation(
		new THREE.Quaternion(),
		new THREE.Quaternion(1, 0, 0, 0)
	),
	// DualQuaternion.setFromRotationTranslation(
	// 	new THREE.Quaternion().setFromAxisAngle(worldZ, Math.PI / 2),
	// 	new THREE.Quaternion(1, 0, 0, 0)
	// ),
	// DualQuaternion.setFromRotationTranslation(
	// 	new THREE.Quaternion().setFromAxisAngle(worldZ, -Math.PI / 2),
	// 	new THREE.Quaternion(1, 0, 0, 0)
	// ),
	// DualQuaternion.setFromRotationTranslation(
	// 	new THREE.Quaternion().setFromAxisAngle(worldZ, -2*Math.PI / 2),
	// 	new THREE.Quaternion(1, 0, 0, 0)
	// ),
	// DualQuaternion.setFromRotationTranslation(
	// 	new THREE.Quaternion().setFromAxisAngle(worldY, Math.PI / 2),
	// 	new THREE.Quaternion(1, 0, 0, 0)
	// ),
	// DualQuaternion.setFromRotationTranslation(
	// 	new THREE.Quaternion().setFromAxisAngle(worldY, -Math.PI / 2),
	// 	new THREE.Quaternion(1, 0, 0, 0)
	// ),

	DualQuaternion.setFromRotationTranslation(
		new THREE.Quaternion(),
		new THREE.Quaternion(-1, 0, 0, 0)
	),
	DualQuaternion.setFromRotationTranslation(
		new THREE.Quaternion(),
		new THREE.Quaternion(0, -1, 0, 0)
	),
	DualQuaternion.setFromRotationTranslation(
		new THREE.Quaternion(),
		new THREE.Quaternion(0, 1, 0, 0)
	),
	DualQuaternion.setFromRotationTranslation(
		new THREE.Quaternion(),
		new THREE.Quaternion(0, 0, -1, 0)
	),
	DualQuaternion.setFromRotationTranslation(
		new THREE.Quaternion(),
		new THREE.Quaternion(0, 0, 1, 0)
	),
];
const dqsTarget = []
const dqsTails = [];
const nbTailDivs = 11;
for(let i = 0; i < dqsInit.length; ++i) {
	dqsTarget.push(new DualQuaternion);

	dqsTails.push([])
	for(let j = 0; j < nbTailDivs; ++j) {
		const dqh = new DQHelper();
		dqh.size = 0.5
		scene.add(dqh);
		dqsTails[i].push(dqh);
	}
}




const settings = {
	rotationAxis: new THREE.Vector3(0, 1, 0),
	angle: 0,
	translation: new THREE.Vector3(0, 0, 0),

	TR: false,

	normalizeYZ : function() {
		const x2 = this.rotationAxis.x * this.rotationAxis.x;
		const vec2 = new THREE.Vector2(this.rotationAxis.y+0.001, this.rotationAxis.z).normalize().multiplyScalar(((1-x2)));
		this.rotationAxis.set(this.rotationAxis.x, vec2.x, vec2.y);
		this.rotationAxis.normalize();
		this.updateDQ();
	},

	normalizeXZ : function() {
		const y2 = this.rotationAxis.y * this.rotationAxis.y;
		const vec2 = new THREE.Vector2(this.rotationAxis.z+0.001, this.rotationAxis.x).normalize().multiplyScalar(((1-y2)));
		this.rotationAxis.set(vec2.y, this.rotationAxis.y, vec2.x);
		this.rotationAxis.normalize();
		this.updateDQ();
	},

	normalizeXY : function() {
		const z2 = this.rotationAxis.z * this.rotationAxis.z;
		const vec2 = new THREE.Vector2(this.rotationAxis.x+0.001, this.rotationAxis.y).normalize().multiplyScalar(((1-z2)));
		this.rotationAxis.set(vec2.x, vec2.y, this.rotationAxis.z);
		this.rotationAxis.normalize();
		this.updateDQ();
	},

	updateDQ : function () {
		const rotation = new THREE.Quaternion().setFromAxisAngle(this.rotationAxis, this.angle);
		const translation = new THREE.Quaternion(this.translation.x, this.translation.y, this.translation.z, 0);

		if(this.TR) {
			controlDQ.copy(DualQuaternion.setFromTranslationRotation(rotation, translation));
		} else {
			controlDQ.copy(DualQuaternion.setFromRotationTranslation(rotation, translation));
		}

		controlDQHelper.dq = controlDQ;
		controlDQHelper.update();

		this.updateDQs();
	},

	updateDQs : function () {
		const step = 1 / (nbTailDivs - 1)
		for(let i = 0; i < dqsInit.length; ++i) {
			dqsTarget[i] = dqsInit[i].clone().premultiply(controlDQ);
			for(let j = 0; j < nbTailDivs; ++j) {
				// dqsTails[i][j].dq = dqsInit[i].clone()
				dqsTails[i][j].dq = new DualQuaternion().lerpDualQuaternions(dqsInit[i], dqsTarget[i], step * j).normalize()
			}
		}
	},
}

settings.updateDQ();
 
const gui = new GUI({autoPlace: true, hideable: false});
const DQFolder = gui.addFolder("dual quaternion");
DQFolder.add(settings, "TR").onChange(settings.updateDQ.bind(settings));
const rotationFolder = gui.addFolder("rotation");
rotationFolder.add(settings.rotationAxis, "x", -1.0, 1.0).step(0.01).onChange(settings.normalizeYZ.bind(settings)).listen();
rotationFolder.add(settings.rotationAxis, "y", -1.0, 1.0).step(0.01).onChange(settings.normalizeXZ.bind(settings)).listen();
rotationFolder.add(settings.rotationAxis, "z", -1.0, 1.0).step(0.01).onChange(settings.normalizeXY.bind(settings)).listen();
rotationFolder.add(settings, "angle", -Math.PI * 4, Math.PI * 4).step(0.01).onChange(settings.updateDQ.bind(settings));
const translationFolder = gui.addFolder("translation");
translationFolder.add(settings.translation, "x", -1.0, 1.0).step(0.01).onChange(settings.updateDQ.bind(settings)).listen();
translationFolder.add(settings.translation, "y", -1.0, 1.0).step(0.01).onChange(settings.updateDQ.bind(settings)).listen();
translationFolder.add(settings.translation, "z", -1.0, 1.0).step(0.01).onChange(settings.updateDQ.bind(settings)).listen();








// const r0 = new THREE.Quaternion();
const r0 = new THREE.Quaternion().setFromAxisAngle(worldY, Math.PI / 2);
const t0 = new THREE.Quaternion(1, 0, 0, 0);
// const dq0 = DualQuaternion.setFromRotationTranslation(r0, t0);
const dq0 = DualQuaternion.setFromTranslationRotation(r0, t0);

const r1 = new THREE.Quaternion()//.setFromAxisAngle(worldY, Math.PI / 2);
const t1 = new THREE.Quaternion(1, 1, 1, 0);
// const dq1 = DualQuaternion.setFromRotationTranslation(r1, t1);
const dq1 = DualQuaternion.setFromTranslationRotation(r1, t1);

const r2 = new THREE.Quaternion().setFromAxisAngle(worldX, Math.PI / 2);
const t2 = new THREE.Quaternion(-1, 0, 0, 0);
const dq2 = DualQuaternion.setFromRotationTranslation(r2, t2);

const dq_0 = dq0.clone().invert();

const dq01 = new DualQuaternion;
dq01.multiplyDualQuaternions(dq1, dq_0);
console.log(dq0, dq1)

// dq01.multiplyDualQuaternions(dq01, dq01.clone().invert());

const dq3 = dq2.clone().premultiply(dq01);

// dq2.premultiply()

// const dqHelper0 = new DQHelper(dq0);
// const dqHelper01 = new DQHelper(dq01);
// const dqHelper1 = new DQHelper(dq1);
// const dqHelper2 = new DQHelper(dq2);
// const dqHelper3 = new DQHelper(dq3);

// scene.add(dqHelper0);
// scene.add(dqHelper01);
// scene.add(dqHelper1);
// scene.add(dqHelper2);
// scene.add(dqHelper3);

// const dqh = [];
// const nbDivs = 10;
// const step = 1 / nbDivs;
// for(let i = 1; i < nbDivs; ++i) {
// 	const dq = new DualQuaternion().lerpDualQuaternions(dq0, dq1, step * i);
// 	dq.normalize()
// 	dqh[i] = new DQHelper(dq)
// 	dqh[i].size = 0.5;
// 	scene.add(dqh[i]);

// 	dq.lerpDualQuaternions(dq2, dq3, step * i);
// 	dq.normalize()
// 	dqh[i + nbDivs + 1] = new DQHelper(dq)
// 	dqh[i + nbDivs + 1].size = 0.5;
// 	scene.add(dqh[i + nbDivs + 1]);
// }



let frameCount = 0;
function update (t)
{
}

function render()
{
	renderer.render(scene, camera);
}

function mainloop(t)
{
    update(t);
    render();
	requestAnimationFrame(mainloop);
}

mainloop(0);