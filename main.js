
import * as THREE from './CMapJS/Libs/three.module.js';
import { OrbitControls } from './CMapJS/Libs/OrbitsControls.js';
import { DualQuaternion } from './DualQuaternion.js';
import DQHelper from './DQHelper.js';
import { GUI } from './CMapJS/Libs/dat.gui.module.js';

import CMap2 from './CMapJS/CMap/CMap2.js';
import IncidenceGraph from './CMapJS/CMap/IncidenceGraph.js';
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
const controlDQ2 = new DualQuaternion;
const controlDQHelper2 = new DQHelper(controlDQ2);
// const controlDQHelper = new DQHelper();
scene.add(controlDQHelper)
scene.add(controlDQHelper2)

const octahedronOff = `OFF
6 8 0
 0.0  0.0  0.25
 0.0  0.0 -0.25
 0.0 -0.25  0.0
 0.25  0.0  0.0
 0.0  0.25  0.0
-0.25  0.0  0.0
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
// mapRenderer.edges.create().addTo(scene);



// const displacement = new IncidenceGraph()
// displacement.createEmbedding(displacement.vertex);

// const dispNB = 1000;
// const dispPos = displacement.addAttribute(displacement.vertex, "position");
// for(let i = 0; i < dispNB; ++i) {
// 	displacement.addVertex();
// 	dispPos[i] = new THREE.Vector3;
// }


// for(let i = 0; i < dispNB - 1; ++i) {
// 	displacement.addEdge(i, i + 1);
// }

// const displacementRenderer = new Renderer(displacement);
// displacementRenderer.vertices.create().addTo(scene);


const particles = new IncidenceGraph();
particles.createEmbedding(particles.vertex);

const position = particles.addAttribute(particles.vertex, "position");
const mass = particles.addAttribute(particles.vertex, "mass");
const radius = particles.addAttribute(particles.vertex, "radius");
const velocity = particles.addAttribute(particles.vertex, "velocity");

const nbParticles = 50;
for(let i = 0; i < nbParticles; ++i) {
	particles.addVertex();
	position[i] = new THREE.Vector3(2*Math.random()-1, 2*Math.random()-1, 2*Math.random()-1);
	velocity[i] = new THREE.Vector3(2*Math.random()-1, 2*Math.random()-1, 2*Math.random()-1);
	radius[i] = 0.05+Math.random()*0.1;
	mass[i] = 4/3* Math.PI * Math.pow(radius[i], 3);
}

const particlesRenderer = new Renderer(particles);
particlesRenderer.vertices.create().addTo(scene)


function collideParticles(p0, p1, restitution) {
	const direction = position[p1].clone().sub(position[p0]);
	const d = direction.length();

	if(d == 0.0 || d > radius[p0] + radius[p1])
		return;

	direction.multiplyScalar(1.0 / d);

	const correction = (radius[p0] + radius[p1] - d) / 2.0;
	position[p0].addScaledVector(direction, -correction);
	position[p1].addScaledVector(direction, correction);

	const v0 = velocity[p0].dot(direction);
	const v1 = velocity[p1].dot(direction);

	const m0 = mass[p0];
	const m1 = mass[p1];

	const newV0 = (m0 * v0 + m1 * v1 - m1 * (v0 - v1) * restitution) / (m0 + m1);
	const newV1 = (m0 * v0 + m1 * v1 - m0 * (v1 - v0) * restitution) / (m0 + m1);

	velocity[p0].addScaledVector(direction, newV0 - v0);
	velocity[p1].addScaledVector(direction, newV1 - v1);
}

function collideWalls(p) {
	const size = 1;
	if(position[p].x < -size + radius[p]) {
		position[p].x = -size + radius[p];
		velocity[p].x *= -1;
	}
	 
	if(position[p].x > size - radius[p]) {
		position[p].x = size - radius[p];
		velocity[p].x *= -1;
	}
	 
	if(position[p].y < -size + radius[p]) {
		position[p].y = -size + radius[p];
		velocity[p].y *= -1;
	}
	 
	if(position[p].y > size - radius[p]) {
		position[p].y = size - radius[p];
		velocity[p].y *= -1;
	}

	if(position[p].z < -size + radius[p]) {
		position[p].z = -size + radius[p];
		velocity[p].z *= -1;
	}
	 
	if(position[p].z > size - radius[p]) {
		position[p].z = size - radius[p];
		velocity[p].z *= -1;
 	}
}


const settings = {
	updateMap : function () {

	},
	
	updateDisplay : function () {
		particlesRenderer.vertices.update();

	},

	play: false,
	disp: 0,
	dt: 0.01,
	step: function() {
		for(let i = 0; i < nbParticles; ++i) {
			position[i].addScaledVector(velocity[i], this.dt);

			for(let j = i + 1; j < nbParticles; ++j) {
				collideParticles(i, j, 0.5);
			}

			collideWalls(i);
		}

		this.updateDisplay();
	},

	reset: function() {

	},	
}

 
const gui = new GUI({autoPlace: true, hideable: false});
const simulationFolder = gui.addFolder("simulation");
simulationFolder.open()
simulationFolder.add(settings, "play");
simulationFolder.add(settings, "step");
simulationFolder.add(settings, "reset");



let frameCount = 0;
function update (t)
{
	if(settings.play) {
		settings.step();
	}
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