
import * as THREE from './CMapJS/Libs/three.module.js';
import { OrbitControls } from './CMapJS/Libs/OrbitsControls.js';
import { DualQuaternion } from './DualQuaternion.js';
import DQHelper from './DQHelper.js';
import { GUI } from './CMapJS/Libs/dat.gui.module.js';

import CMap2 from './CMapJS/CMap/CMap2.js';
import IncidenceGraph from './CMapJS/CMap/IncidenceGraph.js';
import Renderer from './CMapJS/Rendering/Renderer.js';
// import {loadCMap2, mapFromGeometry} from './CMapJS/IO/SurfaceFormats/CMap2IO.js';
import {mapFromGeometry} from './CMapJS/IO/VolumesFormats/CMap3IO.js';
import Stats from './CMapJS/Libs/stats.module.js';

import handTet from './handTet.js'
import bunnyTet from './bunnyTet.js'
import { exportTet, loadTet } from './CMapJS/IO/VolumesFormats/Tet.js';
import dragonTet from './dragonTet.js';
// import ballTet from './ballTet.js';
import ballTet from './ballTet2.js';
import icosahedronTet from './icosahedronTet.js';

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


const stats = new Stats()
document.body.appendChild( stats.dom );


const geometry = loadTet(ballTet);
console.log(geometry);

const geometry2 = {v: [], tet: []};

geometry.v.forEach(v => {
	geometry2.v.push([...v]);
})
geometry.v.forEach(v => {
	geometry2.v.push([v[0], v[1] + 1, v[2]]);
})


geometry.tet.forEach(v => {
	geometry2.tet.push([v[0], v[1], v[2], v[3]]);
})
geometry.tet.forEach(v => {
	geometry2.tet.push([v[0] + 125, v[1] + 125, v[2] + 125, v[3] + 125]);
})


console.log(geometry2);
console.log(exportTet(geometry2))

const bunny = mapFromGeometry(geometry)

const bunnyRenderer = new Renderer(bunny);
// bunnyRenderer.vertices.create({size: 0.0035, color: new THREE.Color(0x00ff00)}).addTo(scene);
bunnyRenderer.edges.create({size: 0.25}).addTo(scene);
// bunnyRenderer.volumes.create().addTo(scene);


function computeTetVolume(p0, p1, p2, p3) {
	return (1/6) * (p1.clone().sub(p0).cross(p2.clone().sub(p0)).dot(p3.clone().sub(p0)))
}

const vertex = bunny.vertex;
const edge = bunny.edge;
const face = bunny.face;
const volume = bunny.volume;

bunny.createEmbedding(volume);
bunny.setEmbeddings(volume);
// bunny.foreach(volume, wd => {
// 	console.log(bunny.cell(volume, wd));
// })

const position = bunny.getAttribute(vertex, "position");
const positionInit = bunny.addAttribute(vertex, "positionInit");
const prevPosition = bunny.addAttribute(vertex, "prevPosition");
const invMass = bunny.addAttribute(vertex, "invMass");
const velocity = bunny.addAttribute(vertex, "velocity");

const edgeLength = bunny.addAttribute(edge, "edgeLength");
const edgeRestLength = bunny.addAttribute(edge, "edgeRestLength");
const tetVolume = bunny.addAttribute(volume, "tetVolume");
const tetRestVolume = bunny.addAttribute(volume, "tetRestVolume");


const boundaryGraph = new IncidenceGraph
// boundaryGraph.createEmbedding(vertex);

const positionGraph = boundaryGraph.addAttribute(boundaryGraph.vertex, "position");

const vertexBoundaryCache = []
const faceBoundaryCache = []
const volumeBoundaryCache = []
// bunny.foreach(vertex, vd => {
// 	if(bunny.isBoundaryCell(vertex, vd))
// 		vertexBoundaryCache.push(vd);


	
// });

bunny.foreach(volume, wd => {
	if(bunny.isBoundary(wd))
		volumeBoundaryCache.push(wd);
	
	if(bunny.isBoundary(wd)){
		bunny.foreachIncident(vertex, volume, wd, vd => {
			vertexBoundaryCache.push(vd)
			// const vid = bunny.cell(vertex, vd);
			// let v = boundaryGraph.addVertex();
			// positionGraph[v] = position[vid].clone()
		});
		bunny.foreachIncident(face, volume, wd, fd => {
			faceBoundaryCache.push(fd)
			// const vid = bunny.cell(vertex, vd);
			// let v = boundaryGraph.addVertex();
			// positionGraph[v] = position[vid].clone()
		});

	}
});


console.log(bunny.nbCells(volume))
console.log(vertexBoundaryCache)
console.log(faceBoundaryCache)
console.log(volumeBoundaryCache)

// const graphRenderer = new Renderer(boundaryGraph)
// graphRenderer.vertices.create().addTo(scene)



/// initialization
bunny.foreach(vertex, vd => {
	position[bunny.cell(vertex, vd)].y += 1;
	positionInit[bunny.cell(vertex, vd)] = position[bunny.cell(vertex, vd)].clone();
	prevPosition[bunny.cell(vertex, vd)] = new THREE.Vector3;
	invMass[bunny.cell(vertex, vd)] = 0;
	velocity[bunny.cell(vertex, vd)] = new THREE.Vector3;
}, {useEmb: true});

bunnyRenderer.edges.update()

bunny.foreach(edge, ed => {
	const p0 = position[bunny.cell(vertex, ed)];
	const p1 = position[bunny.cell(vertex, bunny.phi2[ed])];

	edgeRestLength[bunny.cell(edge, ed)] = p0.distanceTo(p1);

});

bunny.foreach(volume, wd => {
	const p0 = position[bunny.cell(vertex, wd)];
	const p1 = position[bunny.cell(vertex, bunny.phi_1[wd])];
	const p2 = position[bunny.cell(vertex, bunny.phi1[wd])];
	const p3 = position[bunny.cell(vertex, bunny.phi([2, -1], wd))];
	const vol = computeTetVolume(p0, p1, p2, p3);
	tetRestVolume[bunny.cell(volume, wd)] = vol;
	const invM = vol > 0.0 ? 1.0/(vol / 4.0) : 0.0;
	invMass[bunny.cell(vertex, wd)] += invM;
	invMass[bunny.cell(vertex, bunny.phi_1[wd])] += invM;
	invMass[bunny.cell(vertex, bunny.phi1[wd])] += invM;
	invMass[bunny.cell(vertex, bunny.phi([2, -1], wd))] += invM;

}, {useEmb: false});

console.log(tetRestVolume)

const gravity = new THREE.Vector3(0, -5, 0);

function computeEdgeLengths() {
	bunny.foreach(bunny.edge, ed => {
		const p0 = position[bunny.cell(vertex, ed)];
		const p1 = position[bunny.cell(vertex, bunny.phi2[ed])];
	
		edgeLength[bunny.cell(bunny.edge, ed)] = p0.distanceTo(p1);
	});
}

function computeVolumes() {
	bunny.foreach(bunny.volume, wd => {
		const p0 = position[bunny.cell(vertex, wd)];
		const p1 = position[bunny.cell(vertex, bunny.phi_1[wd])];
		const p2 = position[bunny.cell(vertex, bunny.phi1[wd])];
		const p3 = position[bunny.cell(vertex, bunny.phi([2, -1], wd))];
		tetRestVolume[bunny.cell(vertex, wd)] = computeTetVolume(p0, p1, p2, p3)
	});
}

function preSolve(dt) {
	bunny.foreach(vertex, vd => {
		const vid = bunny.cell(vertex, vd);

		if(invMass[vid] == 0.0)
			return false;

		velocity[vid].addScaledVector(gravity, dt);
		prevPosition[vid].copy(position[vid]);
		position[vid].addScaledVector(velocity[vid], dt);

		if(position[vid].y < 0.0) {
			position[vid].copy(prevPosition[vid]);
			position[vid].y = 0.0;
		}

	}, {useEmb: true});
}


function solveEdges(compliance, dt) {
	const alpha = compliance / (dt * dt);

	const grad = new THREE.Vector3;

	bunny.foreach(edge, ed => {
		const eid = bunny.cell(edge, ed);
		const vid0 = bunny.cell(vertex, ed);
		const vid1 = bunny.cell(vertex, bunny.phi2[ed]);

		const w0 = invMass[vid0];
		const w1 = invMass[vid1];
		const w = w0 + w1;

		if(w == 0.0)
			return false;

		grad.subVectors(position[vid0], position[vid1]);
		const length = grad.length();
		if(length == 0.0)
			return false;

		grad.multiplyScalar(1/length);
		const c = length - edgeRestLength[eid];
		const s = -c / (w + alpha);
		position[vid0].addScaledVector(grad, s * w0);
		position[vid1].addScaledVector(grad, -s * w1);
	}, {useEmb: true});
}

function solveVolumes(compliance, dt) {
	const alpha = compliance / (dt * dt);

	const g0 = new THREE.Vector3;
	const g1 = new THREE.Vector3;
	const g2 = new THREE.Vector3;
	const g3 = new THREE.Vector3;
	bunny.foreach(volume, wd => {
		const wid = bunny.cell(volume, wd);

		const vid0 = bunny.cell(vertex, wd);
		const vid1 = bunny.cell(vertex, bunny.phi_1[wd]);
		const vid2 = bunny.cell(vertex, bunny.phi1[wd]);
		const vid3 = bunny.cell(vertex, bunny.phi_1[bunny.phi2[wd]]);

		const p0 = position[vid0];
		const p1 = position[vid1];
		const p2 = position[vid2];
		const p3 = position[vid3];

		g0.crossVectors(p3.clone().sub(p1), p2.clone().sub(p1)).multiplyScalar(1.0/6.0);
		g1.crossVectors(p2.clone().sub(p0), p3.clone().sub(p0)).multiplyScalar(1.0/6.0);
		g2.crossVectors(p3.clone().sub(p0), p1.clone().sub(p0)).multiplyScalar(1.0/6.0);
		g3.crossVectors(p1.clone().sub(p0), p2.clone().sub(p0)).multiplyScalar(1.0/6.0);

		let w = invMass[vid0] * g0.lengthSq();
		w += invMass[vid1] * g1.lengthSq();
		w += invMass[vid2] * g2.lengthSq();
		w += invMass[vid3] * g3.lengthSq();

		if(w == 0.0)
			return false;

		const vol = computeTetVolume(p0, p1, p2, p3);
		const restVol = tetRestVolume[wid];
		// console.log(vol, restVol)

		const c = vol - restVol;
		const s = -c / (w + alpha);
		// if(c > 0.0000000001 || s > 0.000000001)
		// console.log(c, s)
		// console.log(g0)
		position[vid0].addScaledVector(g0, s * invMass[vid0]);
		position[vid1].addScaledVector(g1, s * invMass[vid1]);
		position[vid2].addScaledVector(g2, s * invMass[vid2]);
		position[vid3].addScaledVector(g3, s * invMass[vid3]);
	}, {useEmb: true});
}

function solve(dt, volumeCompliance, edgeCompliance) {
	solveEdges(edgeCompliance, dt);
	solveVolumes(volumeCompliance, dt);

}

function postSolve(dt) {
	bunny.foreach(vertex, vd => {
		const vid = bunny.cell(vertex, vd);

		if(invMass[vid] == 0.0)
			return false;

		velocity[vid].subVectors(position[vid], prevPosition[vid]).multiplyScalar(1/dt);
	}, {useEmb: true});
}


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




const settings = {
	updateMap : function () {

	},
	
	updateDisplay : function () {
		bunnyRenderer.edges.update();
		// bunnyRenderer.faces.update();

	},

	play: false,
	disp: 0,
	dt: 0.0018,
	volumeCompliance: 0,
	edgeCompliance: 0,
	step: function() {

		for(let i = 0; i < 2; ++i) {
			preSolve(this.dt);
			solve(this.dt, this.volumeCompliance, this.edgeCompliance);
			postSolve(this.dt);
		}

		if(this.disp++ == 0) {
			this.updateDisplay();
			this.disp = 0;
		}
	},

	reset: function() {
		bunny.foreach(vertex, vd => {
			position[bunny.cell(vertex, vd)].copy(positionInit[bunny.cell(vertex, vd)]);
			velocity[bunny.cell(vertex, vd)].set(0, 0, 0);
		}, {useEmb: true});

		this.updateDisplay();
	},	
}

 
const gui = new GUI({autoPlace: true, hideable: false});
const simulationFolder = gui.addFolder("simulation");
simulationFolder.open()
simulationFolder.add(settings, "play");
simulationFolder.add(settings, "step");
simulationFolder.add(settings, "reset");
simulationFolder.add(settings, "volumeCompliance").min(0).max(10000).step(1); 
simulationFolder.add(settings, "edgeCompliance").min(0).max(10).step(0.01); 


let frameCount = 0;
function update (t)
{
	stats.update()
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