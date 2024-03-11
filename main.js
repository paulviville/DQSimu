
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
import ballTet from './ballTet.js';
import cubeTet from './cubeTet.js';
import icosahedronTet from './icosahedronTet.js';
import icosahedronTet2 from './icosahedronTet2.js';
import icosahedron3Tet from './icosahedron3Tet.js';
import cube2Tet from './cubeTet2.js';

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




const A = new THREE.Vector3(Math.sqrt(3)/2, 1, -0.5)
const B = new THREE.Vector3(-Math.sqrt(3)/2, 1, -0.5);
const C = new THREE.Vector3(0, 1, 1)
const P = new THREE.Vector3(0.25, 3, 1.075);
const P3 = new THREE.Vector3(1.5, 3, -1.5);
// const P = new THREE.Vector3(-1, 3, -1.);

const testGraph = new IncidenceGraph;
testGraph.createEmbedding(testGraph.vertex);
const testPos = testGraph.addAttribute(testGraph.vertex, "position");
const testPrevPos = testGraph.addAttribute(testGraph.vertex, "previousPosition");
const testVel = testGraph.addAttribute(testGraph.vertex, "velocity");
const vA = testGraph.addVertex()
testPos[vA] = A
const vB = testGraph.addVertex()
testPos[vB] = B
const vC = testGraph.addVertex()
testPos[vC] = C

const vP = testGraph.addVertex()
testPos[vP] = P

const eAB = testGraph.addEdge(vA, vB)
const eAP = testGraph.addEdge(vA, vP)
const eAC = testGraph.addEdge(vA, vC)
const eBC = testGraph.addEdge(vC, vB)

const fABC = testGraph.addFace(eAB, eAC, eBC);



const sphereMarker = new THREE.Mesh(
	new THREE.SphereBufferGeometry(0.01, 32, 32),
	new THREE.MeshLambertMaterial({color: 0x0000ff})
)
scene.add(sphereMarker)

const sphereMarker2 = new THREE.Mesh(
	new THREE.SphereBufferGeometry(0.01, 32, 32),
	new THREE.MeshLambertMaterial({color: 0xFF00ff})
)
scene.add(sphereMarker2)

const sphereMarker3= new THREE.Mesh(
	new THREE.SphereBufferGeometry(0.01, 32, 32),
	new THREE.MeshLambertMaterial({color: 0xff0000})
)
scene.add(sphereMarker3)

testVel[vA] = new THREE.Vector3
testVel[vB] = new THREE.Vector3
testVel[vC] = new THREE.Vector3
testVel[vP] = new THREE.Vector3

testPrevPos[vA] = testPos[vA].clone()
testPrevPos[vB] = testPos[vB].clone()
testPrevPos[vC] = testPos[vC].clone()
testPrevPos[vP] = testPos[vP].clone()
// const AP = P.clone().sub(A);
// const AB = B.clone().sub(A);
// const AC = C.clone().sub(A);
// const N = AB.clone().cross(AC).normalize();

// const P2 = P.clone().addScaledVector(N, -AP.dot(N));
const vP2 = testGraph.addVertex()
const vP3 = testGraph.addVertex()
testPos[vP3] = P3



// const PA = A.clone().addScaledVector(AB, AB.dot(AP) /AB.dot(AB));
// const vPA = testGraph.addVertex()
// testPos[vPA] = PA

// const PB = A.clone().addScaledVector(AC, AC.dot(AP) /AC.dot(AC));
// const vPB = testGraph.addVertex()
// testPos[vPB] = PB



function barycentricCoordinates(A, B, C, P) {
	const AB = B.clone().sub(A);
	const AC = C.clone().sub(A);
	const AP = P.clone().sub(A);

	const d00 = AB.dot(AB);
	const d01 = AB.dot(AC);
	const d11 = AC.dot(AC);
	const d20 = AP.dot(AB);
	const d21 = AP.dot(AC);
	const denom = d00 * d11 - d01 * d01;

	const bary = new THREE.Vector3();
	bary.y = (d11 * d20 - d01 * d21) / denom;
	bary.z = (d00 * d21 - d01 * d20) / denom;
	bary.x = 1.0 - bary.y - bary.z;
	return bary;
}

function projectionOnTriangle(A, B, C, P) {
	const bary = barycentricCoordinates(A, B, C, P);
	const P2 = A.clone().multiplyScalar(bary.x);
	P2.addScaledVector(B, bary.y);
	P2.addScaledVector(C, bary.z);

	return P2;
}

testPos[vP2] = projectionOnTriangle(A, B, C, P);

function triangleNormal(A, B, C) {
	return B.clone().sub(A).cross(C.clone().sub(A)).normalize();
}
// console.log(P.distanceTo(testPos[vP2]))
function signedDistanceToTriangle(A, B, C, P) {
	const N = triangleNormal(A, B, C);

	const P2 = projectionOnTriangle(A, B, C, P);

	return N.dot(P.clone().sub(P2))
}

function clamp(val, min, max) {
	return Math.max(min, Math.min(val, max));
}

function closestPointOnTriangle(A, B, C, P) {
	const bary = barycentricCoordinates(A, B, C, P);

	if(bary.x < 0) {
		const BC = C.clone().sub(B);
		const BP = P.clone().sub(B);
		const d = BC.length();		
		return B.clone().addScaledVector(BC, clamp(BP.dot(BC) / d, 0, d) / d);
	}
	if(bary.y < 0) {
		const AC = C.clone().sub(A);
		const AP = P.clone().sub(A);
		const d = AC.length();		
		return A.clone().addScaledVector(AC, clamp(AP.dot(AC) / d, 0, d) / d);
	}
	if(bary.z < 0) {
		const AB = B.clone().sub(A);
		const AP = P.clone().sub(A);
		const d = AB.length();		
		return A.clone().addScaledVector(AB, clamp(AP.dot(AB) / d, 0, d) / d);
	}

	return A.clone().multiplyScalar(bary.x).addScaledVector(B, bary.y).addScaledVector(C, bary.z);
}

console.log(barycentricCoordinates(A, B, C, P))

signedDistanceToTriangle(A, B, C, P);


testPos[vP3].copy(closestPointOnTriangle(A, B, C, P))








const testRenderer = new Renderer(testGraph);
// testRenderer.vertices.create({size: 0.05}).addTo(scene);
// testRenderer.edges.create({size: 2}).addTo(scene);
// testRenderer.faces.create({transparent: true, opacity: 0.5, side: THREE.DoubleSide}).addTo(scene);








// console.log(bary)
// testPos[vP2].set(0, 0, 0).addScaledVector(A, bary.x).addScaledVector(B, bary.y).addScaledVector(C, bary.z)

const stats = new Stats()
document.body.appendChild( stats.dom );

 

const geometry = loadTet(ballTet);
// console.log(geometry);

// const geometry2 = {v: [], tet: []};

// geometry.v.forEach(v => {
// 	geometry2.v.push([...v]);
// })
// geometry.v.forEach(v => {
// 	geometry2.v.push([v[0], v[1] + 1, v[2]]);
// })


// geometry.tet.forEach(v => {
// 	geometry2.tet.push([v[0], v[1], v[2], v[3]]);
// })
// geometry.tet.forEach(v => {
// 	geometry2.tet.push([v[0] + 26, v[1] + 26, v[2] + 26, v[3] + 26]);
// })


// console.log(geometry2);
// console.log(exportTet(geometry2))

const bunny = mapFromGeometry(geometry)

const bunnyRenderer = new Renderer(bunny);
// bunnyRenderer.vertices.create({size: 0.035, color: new THREE.Color(0x00ff00)}).addTo(scene);
bunnyRenderer.edges.create({size: 1}).addTo(scene);
// bunnyRenderer.volumes.create().addTo(scene);


function computeTetVolume(p0, p1, p2, p3) {
	return (1/6) * (p1.clone().sub(p0).cross(p2.clone().sub(p0)).dot(p3.clone().sub(p0)))
}

const vertex = bunny.vertex;
const edge = bunny.edge;
const face = bunny.face;
const volume = bunny.volume;

bunny.createEmbedding(face);
bunny.setEmbeddings(face);

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


// const boundaryGraph = new IncidenceGraph
// boundaryGraph.createEmbedding(vertex);

// const positionGraph = boundaryGraph.addAttribute(boundaryGraph.vertex, "position");

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
			// faceBoundaryCache.push(fd)
			faceBoundaryCache.push(bunny.phi3[fd])
			// const vid = bunny.cell(vertex, vd);
			// let v = boundaryGraph.addVertex();
			// positionGraph[v] = position[vid].clone()
		});

	}
});



console.log(faceBoundaryCache, vertexBoundaryCache, volumeBoundaryCache)


bunny.foreachIncident(vertex, volume, volumeBoundaryCache[0], vd => {
	// position[bunny.cell(vertex, vd)].y -= 1;
	position[bunny.cell(vertex, vd)].applyAxisAngle(new THREE.Vector3(1, 0, 1).normalize(), Math.PI / 12)
	// position[bunny.cell(vertex, vd)].y += 1;

});

bunny.foreachIncident(vertex, volume, volumeBoundaryCache[1], vd => {
	position[bunny.cell(vertex, vd)].y -= 1;
	position[bunny.cell(vertex, vd)].applyAxisAngle(new THREE.Vector3(-1, 0, 1).normalize(), Math.PI / 6)

	position[bunny.cell(vertex, vd)].y += 1.5;
});


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




const faceBB = bunny.addAttribute(face, "BB");
const faceBBH = bunny.addAttribute(face, "BBH");
const BBs = [];
bunny.foreach(face, fd => {
	const fid = bunny.cell(face, fd);
	
	const bb = new THREE.Box3();

	// const vid0 = bunny.cell(vertex, fd);
	// const vid1 = bunny.cell(vertex, bunny.phi1[fd]);
	// const vid2 = bunny.cell(vertex, bunny.phi_1[fd]);

	bb.setFromPoints([
		position[bunny.cell(vertex, fd)],
		position[bunny.cell(vertex, bunny.phi1[fd])],
		position[bunny.cell(vertex, bunny.phi_1[fd])],
	]);

	const bbHelper = new THREE.Box3Helper(bb, 0x990000);
	// scene.add(bbHelper)

	faceBB[fid] = bb;
	faceBBH[fid] = bbHelper;

	BBs.push(bb);
	// console.log(fd);
}, {cache: faceBoundaryCache})


function makePrimitive(fd, bb) {
	return {fd, bb};
}

function makeNode(primitives) {
	const bb = new THREE.Box3;
	primitives.forEach(p => {
		bb.union(p.bb);
	});

	return {
		bb,
		primitives,
	}
}


function splitNode(node) {
	const primitives = node.primitives;
	const size = new THREE.Vector3;
	node.bb.getSize(size);

	let axis = size['x'] > size['y'] ? 'x' : 'y';
	axis = size[axis] > size['z'] ? axis : 'z';

	const va = new THREE.Vector3;
	const vb = new THREE.Vector3;
	primitives.sort((a, b) => {
		a.bb.getCenter(va);
		b.bb.getCenter(vb);

		return va[axis] - vb[axis];
	});

	const nbPrimitives = primitives.length;
	const child0 = makeNode(primitives.slice(0, primitives.length / 2));
	const child1 = makeNode(primitives.slice(primitives.length / 2));

	node.children = [child0, child1];
	return [child0, child1];
}


const primitives = [];
bunny.foreach(face, fd => {
	const fid = bunny.cell(face, fd);
	primitives.push(makePrimitive(fd, faceBB[fid]));

}, {cache: faceBoundaryCache});



const expansion = 0.05;
const splitCriteria = 5;
const nodes = [];
function buildBVH() {
	const rootNode = makeNode(primitives);
	const rootHelper = new THREE.Box3Helper(rootNode.bb, 0x990000);
	const size = new THREE.Vector3;
	rootNode.bb.getSize(size);
	rootNode.bb.expandByVector(size.multiplyScalar(expansion))

	// scene.add(rootHelper)

	const stack = [rootNode];
	while(stack.length) {
		const node = stack.shift();
		nodes.push(node);
		if(node.primitives.length <= splitCriteria) 
			continue;
		
		
		const children = splitNode(node);
		children[0].bb.getSize(size);
		children[0].bb.expandByVector(size.multiplyScalar(expansion))
		children[1].bb.getSize(size);
		children[1].bb.expandByVector(size.multiplyScalar(expansion))
		// scene.add(new THREE.Box3Helper(children[0].bb, 0x990000));
		// scene.add(new THREE.Box3Helper(children[1].bb, 0x990000));
		
		stack.push(...children)

		delete node.primitives;
		
	}

	console.log(rootNode)
}
buildBVH()


/// update bvh
bunny.foreach(face, fd => {
	const fid = bunny.cell(face, fd);
	
	const bb = faceBB[fid];

	// const vid0 = bunny.cell(vertex, fd);
	// const vid1 = bunny.cell(vertex, bunny.phi1[fd]);
	// const vid2 = bunny.cell(vertex, bunny.phi_1[fd]);

	bb.setFromPoints([
		position[bunny.cell(vertex, fd)],
		position[bunny.cell(vertex, bunny.phi1[fd])],
		position[bunny.cell(vertex, bunny.phi_1[fd])],
	]);


}, {cache: faceBoundaryCache})

// function buildBvhBoundary(mesh) {
// 	const vertex = mesh.vertex;


// }

// const BVH = buildBvhBoundary(bunny);







bunnyRenderer.edges.update()
bunnyRenderer.volumes.update()

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


const gravity = new THREE.Vector3(0, -10, 0);

// function computeEdgeLengths() {
// 	bunny.foreach(bunny.edge, ed => {
// 		const p0 = position[bunny.cell(vertex, ed)];
// 		const p1 = position[bunny.cell(vertex, bunny.phi2[ed])];
	
// 		edgeLength[bunny.cell(bunny.edge, ed)] = p0.distanceTo(p1);
// 	});
// }

// function computeVolumes() {
// 	bunny.foreach(bunny.volume, wd => {
// 		const p0 = position[bunny.cell(vertex, wd)];
// 		const p1 = position[bunny.cell(vertex, bunny.phi_1[wd])];
// 		const p2 = position[bunny.cell(vertex, bunny.phi1[wd])];
// 		const p3 = position[bunny.cell(vertex, bunny.phi([2, -1], wd))];
// 		tetRestVolume[bunny.cell(vertex, wd)] = computeTetVolume(p0, p1, p2, p3)
// 	});
// }


function preSolveTest(dt) {
	const P = testPos[vP];

	testVel[vP].addScaledVector(gravity, dt);
	testPrevPos[vP].copy(testPos[vP]);
	testPos[vP].addScaledVector(testVel[vP], dt);

	testPrevPos[vA].copy(testPos[vA]);
	testPos[vA].addScaledVector(testVel[vA], dt);
	testPrevPos[vB].copy(testPos[vB]);
	testPos[vB].addScaledVector(testVel[vB], dt);
	testPrevPos[vC].copy(testPos[vC]);
	testPos[vC].addScaledVector(testVel[vC], dt);

	// if(testPos[vP].y < 0.0) {
	// 	testPos[vP].copy(testPrevPos[vP]);
	// 	testPos[vP].y = 0.0;
	// }
}	


function solveTriangle(compliance = 0, dt) {
	const alpha = compliance / (dt * dt);

	const dist = signedDistanceToTriangle(testPos[vA], testPos[vB], testPos[vC], testPos[vP]);
	if(dist > 0)
		return;

	const bary = barycentricCoordinates(testPos[vA], testPos[vB], testPos[vC], testPos[vP])
	const N = triangleNormal(testPos[vA], testPos[vB], testPos[vC]);



	console.log(bary);
	// console.log(dist);

	const w = 2;
	const c = dist;
	const s = -c / (w + alpha);

	testPos[vP].addScaledVector(N, s);
	testPos[vA].addScaledVector(N, -s * bary.x * 5);
	testPos[vB].addScaledVector(N, -s * bary.y);
	testPos[vC].addScaledVector(N, -s * bary.z);
}


function postSolveTest(dt) {
	testVel[vA].subVectors(testPos[vA], testPrevPos[vA]).multiplyScalar(1/dt);
	testVel[vB].subVectors(testPos[vB], testPrevPos[vB]).multiplyScalar(1/dt);
	testVel[vC].subVectors(testPos[vC], testPrevPos[vC]).multiplyScalar(1/dt);
	testVel[vP].subVectors(testPos[vP], testPrevPos[vP]).multiplyScalar(1/dt);

	console.log(testVel[vA])
}

// function



function preSolve(dt) {
	const N = new THREE.Vector3(0, 1, 0);
	const deltaP = new THREE.Vector3;
	const tangent = new THREE.Vector3;

	bunny.foreach(vertex, vd => {
		const vid = bunny.cell(vertex, vd);

		if(invMass[vid] == 0.0)
			return false;

		velocity[vid].addScaledVector(gravity, dt);
		prevPosition[vid].copy(position[vid]);
		position[vid].addScaledVector(velocity[vid], dt);

		if(position[vid].y < 0.0) {
			deltaP.copy(position[vid]).sub(prevPosition[vid]);
			tangent.copy(deltaP).addScaledVector(N, -N.dot(deltaP));
			
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

let first = true;

function closestTriangle(vid) {
	const P = position[vid];
	const triangles = [];
	bunny.foreach(face, fd => {
		const vidA = bunny.cell(vertex, fd);
		const vidB = bunny.cell(vertex, bunny.phi1[fd]);
		const vidC = bunny.cell(vertex, bunny.phi_1[fd]);

		if(vidA == vid || vidB == vid || vidC == vid)
			return;

		const A = position[vidA];
		const B = position[vidB];
		const C = position[vidC];
		const P2 = closestPointOnTriangle(A, B, C, P);
		triangles.push({fd, d: P2.distanceTo(P)});
		// console.log(P2, P)
	}, {cache: faceBoundaryCache});

	triangles.sort((a, b) => a.d - b.d);


	const fd = triangles[0].fd
	const vidA = bunny.cell(vertex, fd);
	const vidB = bunny.cell(vertex, bunny.phi1[fd]);
	const vidC = bunny.cell(vertex, bunny.phi_1[fd]);

	const A = position[vidA];
	const B = position[vidB];
	const C = position[vidC];



	triangles[0].d = signedDistanceToTriangle(A, B, C, P);
	triangles[0].bary = barycentricCoordinates(A, B, C, P);

	if(vid == 3) {
		sphereMarker.position.copy(closestPointOnTriangle(A, B, C, P))
		sphereMarker2.position.copy(projectionOnTriangle(A, B, C, P))
		sphereMarker3.position.copy(P)
	}

	return triangles[0];
}

function closestTriangleTest(P) {
	// const P = position[vid];
	const triangles = [];
	bunny.foreach(face, fd => {
		const vidA = bunny.cell(vertex, fd);
		const vidB = bunny.cell(vertex, bunny.phi1[fd]);
		const vidC = bunny.cell(vertex, bunny.phi_1[fd]);

		// if(vidA == vid || vidB == vid || vidC == vid)
		// 	return;

		const A = position[vidA];
		const B = position[vidB];
		const C = position[vidC];
		const P2 = closestPointOnTriangle(A, B, C, P);
		triangles.push({fd, d: P2.distanceTo(P)});
		// console.log(P2, P)
	}, {cache: faceBoundaryCache});

	triangles.sort((a, b) => a.d - b.d);


	const fd = triangles[0].fd
	const vidA = bunny.cell(vertex, fd);
	const vidB = bunny.cell(vertex, bunny.phi1[fd]);
	const vidC = bunny.cell(vertex, bunny.phi_1[fd]);

	const A = position[vidA];
	const B = position[vidB];
	const C = position[vidC];



	triangles[0].d = signedDistanceToTriangle(A, B, C, P);
	// if(vid == 2) {
	// 	first = false;
	// 	console.log(triangles[0])
	sphereMarker.position.copy(closestPointOnTriangle(A, B, C, P))
	// 	console.log(barycentricCoordinates(A, B, C, P))
	sphereMarker2.position.copy(projectionOnTriangle(A, B, C, P))
	// }

	return triangles[0];
}

function solveCollisions(compliance, dt) {
	const alpha = compliance / (dt * dt);

	const N = new THREE.Vector3;
	const deltaP = new THREE.Vector3;
	const tangent = new THREE.Vector3;
	const vT = new THREE.Vector3;
	const vP = new THREE.Vector3;


	bunny.foreach(vertex, vd => {
		// console.log(vd);
		const vid = bunny.cell(vertex, vd);
		const triangle = closestTriangle(vid);

		if(triangle.d > 0)
			return;

		if(triangle.bary.x < 0 || triangle.bary.y < 0 || triangle.bary.z < 0)
			return;

		const vidA = bunny.cell(vertex, triangle.fd);
		const vidB = bunny.cell(vertex, bunny.phi1[triangle.fd]);
		const vidC = bunny.cell(vertex, bunny.phi_1[triangle.fd]);
		
		const N = triangleNormal(position[vidA], position[vidB], position[vidC]);

		const wP = invMass[vid];
		const wA = invMass[vidA];
		const wB = invMass[vidB];
		const wC = invMass[vidC];
		const w = wP + wA * triangle.bary.x+ wB * triangle.bary.y+ wC* triangle.bary.z;

		const c = triangle.d;
		const s = -c / (w + alpha);

		position[vid].addScaledVector(N, s * wP);
		position[vidA].addScaledVector(N, -s * wA * triangle.bary.x);
		position[vidB].addScaledVector(N, -s * wB * triangle.bary.y);
		position[vidC].addScaledVector(N, -s * wC * triangle.bary.z);
			
		
		// vT.copy(velocity[vidA]).multiplyScalar(triangle.bary.x);
		// vT.addScaledVector(velocity[vidB], triangle.bary.y);
		// vT.addScaledVector(velocity[vidC], triangle.bary.z);
		// vP.copy(velocity[vid]);
		// deltaP.copy(position[vid]).sub(prevPosition[vid]);
		// tangent.copy(deltaP).addScaledVector(N, -N.dot(deltaP));
			
	}, {cache: vertexBoundaryCache});

}


function solve(dt, volumeCompliance, edgeCompliance) {
	solveCollisions(0, dt);
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

let bbId = 0;
let bb = new THREE.Box3
let bbHelper = new THREE.Box3Helper(bb, 0xff0000)
scene.add(bbHelper)

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
			if(bbId < nodes.length){
				++bbId;
				bb.copy(nodes[bbId].bb);
				console.log(nodes[bbId].primitives)
			}
			break;
		case "Numpad1":
			if(bbId > 0){
				--bbId;
				bb.copy(nodes[bbId].bb);
				console.log(nodes[bbId].primitives)
			}
			break;
		case "ArrowLeft":
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







// const controlDQ = new DualQuaternion;
// const controlDQHelper = new DQHelper(controlDQ);
// const controlDQ2 = new DualQuaternion;
// const controlDQHelper2 = new DQHelper(controlDQ2);
// // const controlDQHelper = new DQHelper();
// scene.add(controlDQHelper)
// scene.add(controlDQHelper2)





const settings = {
	updateMap : function () {

	},
	
	updateDisplay : function () {


		// bunnyRenderer.vertices.update();
		bunnyRenderer.edges.update();
		// bunnyRenderer.volumes.update();
		// sphereMarker.
	},

	updateTest : function () {
		// testPos[vP2] = projectionOnTriangle(A, B, C, testPos[vP]);
		// testPos[vP3] = closestPointOnTriangle(A, B, C, testPos[vP]);
		closestTriangleTest(testPos[vP])
		console.log(barycentricCoordinates(A, B, C,testPos[vP] ))

		// bunnyRenderer.edges.update();
		// testRenderer.vertices.update();
		// testRenderer.edges.update();
		// testRenderer.faces.update();

		// bunnyRenderer.volumes.update();

	},

	play: false,
	disp: 0,
	dt: 0.00036,
	volumeCompliance: 0,
	edgeCompliance: 0,
	step: function() {
		// preSolveTest(this.dt);		
		// solveTriangle(0, this.dt)
		// postSolveTest(this.dt)
		// this.updateTest()


		for(let i = 0; i < 10; ++i) {
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
simulationFolder.add(testPos[vP], "x").onChange(settings.updateTest.bind(settings));
simulationFolder.add(testPos[vP], "y").onChange(settings.updateTest.bind(settings));
simulationFolder.add(testPos[vP], "z").onChange(settings.updateTest.bind(settings));
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