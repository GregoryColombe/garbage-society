import * as THREE from 'three'

import assets from '../../utils/asset-store'
import { DEV, NUMBER_TRASHES, OFFSET_SIDE, ROAD_LENGTH } from '../../utils/utils'

class Trashes {
	constructor({ group }) {
		this.mathUtils = THREE.MathUtils
		this.group = group

		this.trashes = assets.models.trashes

		this.randomXPos = [-OFFSET_SIDE, 0, OFFSET_SIDE]

		this.spawnTrashes()
	}

	spawnTrash() {
		// Pick random int from trashes
		const randomTrashId = Math.floor(Math.random() * this.trashes.length)

		// Pick random x position between 'left' || 'center' || 'right'
		const randomXPosId = Math.floor(Math.random() * this.randomXPos.length)
		const randomX = this.randomXPos[randomXPosId]

		// Pick random z position between road length
		const randomZ = this.mathUtils.randInt(-ROAD_LENGTH / 2, ROAD_LENGTH / 2)
		const randomPos = new THREE.Vector3(randomX, 0, randomZ)

		// New trash
		const trash = this.trashes[randomTrashId].model.scene.clone()
		trash.name = 'trash'

		if (DEV) {
			// BOX
			let box = new THREE.Box3()
			box.setFromObject(trash)

			let helper = new THREE.Box3Helper(box, 'green')
			// trash.add(helper)
		}

		trash.position.copy(randomPos)
		this.group.add(trash)
	}

	spawnTrashes() {
		for (let i = 0; i < NUMBER_TRASHES; i++) {
			this.spawnTrash()
		}
	}
}

export default Trashes
