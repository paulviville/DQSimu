import { AxesHelper, Quaternion, Vector3, Matrix4 } from './CMapJS/Libs/three.module.js';
import { DualQuaternion } from './DualQuaternion.js';

export default class DQHelper extends AxesHelper {
	#dq;

	constructor ( dq = new DualQuaternion ) {
		super(0.25);
		this.material.linewidth = 8;

		this.#dq = dq.clone();
		this.update()
	}

	update () {
		this.position.copy(this.#dq.transform(new Vector3));
		this.quaternion.copy(this.#dq.getRotation())
	}

	get dq () {
		return this.#dq.clone();
	}

	set dq ( dq ) {
		this.#dq.copy(dq);
		this.update()
	}

	get size () {
		return this.scale.x;
	}

	set size ( size ) {
		this.scale.set(size, size, size);
	}

	debug () {
		console.log(this.#dq);
		console.log(this);
	}
}

