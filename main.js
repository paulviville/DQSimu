
import * as THREE from './CMapJS/Libs/three.module.js';
import { OrbitControls } from './CMapJS/Libs/OrbitsControls.js';
import { DualQuaternion } from './DualQuaternion.js';
import DQHelper from './DQHelper.js';
import { GUI } from './CMapJS/Libs/dat.gui.module.js';

import CMap2 from './CMapJS/CMap/CMap2.js';
import Renderer from './CMapJS/Rendering/Renderer.js';
import {loadCMap2} from './CMapJS/IO/SurfaceFormats/CMap2IO.js';


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
		new THREE.Quaternion(1, 0, 0, 0)
	),
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


const octahedronOff = `OFF
6 8 0
 0.0  0.0  1.0
 0.0  0.0 -1.0
 0.0 -1.0  0.0
 1.0  0.0  0.0
 0.0  1.0  0.0
-1.0  0.0  0.0
3 0 2 3
3 0 3 4
3 0 4 5
3 0 5 2
3 1 3 2
3 1 4 3
3 1 5 4
3 1 2 5
`;

const map = loadCMap2('off', octahedronOff);
const mapRenderer = new Renderer(map);
mapRenderer.edges.create().addTo(scene);

(function () {
	const initPosDQ = map.addAttribute(map.vertex, "initDQ");
	const position = map.getAttribute(map.vertex, "position");

	map.foreach(map.vertex, vd => {
		const vid = map.cell(map.vertex, vd);
		const dq = DualQuaternion.setFromTranslation(position[vid]);
		initPosDQ[vid] = dq.clone();
	});
	
})()

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
		this.updateMap();
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

	updateMap : function () {
		const position = map.getAttribute(map.vertex, "position");
		const initPosDQ = map.getAttribute(map.vertex, "initDQ");

		map.foreach(map.vertex, vd => {
			const vid = map.cell(map.vertex, vd);
			const dq = initPosDQ[vid].clone();

			dq.premultiply(controlDQ);
			position[vid].copy(dq.transform(new THREE.Vector3));
		});

		map.foreach(map.edge, ed => {
			const vid0 = map.cell(map.vertex, ed);
			const vid1 = map.cell(map.vertex, map.phi2[ed]);

			console.log(position[vid0].distanceTo(position[vid1]));

		});

		mapRenderer.edges.update();
	}
}

settings.updateDQ();
settings.updateMap();
 
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