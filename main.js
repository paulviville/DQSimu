
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


const points = new IncidenceGraph();
points.createEmbedding(points.vertex);

const position = points.addAttribute(points.vertex, "position");
const velocity = points.addAttribute(points.vertex, "velocity");

const nbpoints = 50;
for(let i = 0; i < nbpoints; ++i) {
	points.addVertex();
	position[i] = new THREE.Vector3(2*Math.random()-1, 2*Math.random()-1, 2*Math.random()-1);
	velocity[i] = new THREE.Vector3(2*Math.random()-1, 2*Math.random()-1, 2*Math.random()-1);
}

const pointsRenderer = new Renderer(points);
pointsRenderer.vertices.create({size: 0.025}).addTo(scene)

const tetPoints = new IncidenceGraph;
tetPoints.createEmbedding(tetPoints.vertex);
const tetPosition = tetPoints.addAttribute(tetPoints.vertex, "position");

tetPoints.addVertex();
tetPoints.addVertex();
tetPoints.addVertex();
tetPoints.addVertex();

const s = 5.0;
tetPosition[0] = new THREE.Vector3(-s, s, -s);
tetPosition[1] = new THREE.Vector3(s, -s, -s);
tetPosition[2] = new THREE.Vector3(s, s, s);
tetPosition[3] = new THREE.Vector3(-s, -s, s);


const tetPointsRenderer = new Renderer(tetPoints);
tetPointsRenderer.vertices.create({size: 0.035, color: new THREE.Color(0x00ff00)}).addTo(scene)

const tetrahedra = [
	[0, 1, 2, 3],
];
const tetrahedraMesh = [

]

let nbTPoints = 0;

function addTetMesh () {
	const tetMesh = new THREE.Mesh(
		new THREE.TetrahedronGeometry(1, 0),
		new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true})
	)
	scene.add(tetMesh)
	return tetMesh 
}

const tetMesh = addTetMesh();
tetrahedraMesh.push(tetMesh);
console.log(tetMesh.geometry)
tetMesh.geometry.vertices[0].copy(tetPosition[0])
tetMesh.geometry.vertices[1].copy(tetPosition[1])
tetMesh.geometry.vertices[2].copy(tetPosition[2])
tetMesh.geometry.vertices[3].copy(tetPosition[3])
tetMesh.geometry.verticesNeedUpdate = true;


function circumCenter(p0, p1, p2, p3) {
	const b = p1.clone().sub(p0);
	const c = p2.clone().sub(p0);
	const d = p3.clone().sub(p0);

	const det = 2.0 * b.dot(c.clone().cross(d));
	// const det = 2.0 * (b.x*(c.y*d.z - c.z*d.y) - b.y*(c.x*d.z - c.z*d.x) + b.z*(c.x*d.y - c.y*d.x));
	if(det == 0)
		return p0.clone();

	const v = new THREE.Vector3();
	v.add(c.clone().cross(d).multiplyScalar(b.dot(b)));
	v.add(d.clone().cross(b).multiplyScalar(c.dot(c)));
	v.add(b.clone().cross(c).multiplyScalar(d.dot(d)));
	v.multiplyScalar(1/det);
	v.add(p0);
	return v;
}

const settings = {
	updateMap : function () {

	},
	
	updateDisplay : function () {
		pointsRenderer.vertices.update();
		tetPointsRenderer.vertices.update();

	},

	play: false,
	disp: 0,
	dt: 0.01,
	step: function() {
		if(nbTPoints < nbpoints) {
			let v = tetPoints.addVertex();
			tetPosition[v] = position[nbTPoints].clone();
			++nbTPoints;
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