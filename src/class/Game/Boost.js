import * as THREE from 'three'

import assets from '../../utils/asset-store'
import { DEV, NUMBER_BOOST, OFFSET_SIDE, ROAD_LENGTH } from '../../utils/utils'

class Boost {
	constructor({ group }) {
		this.mathUtils = THREE.MathUtils
		this.group = group

		this.boost = assets.models.boost

		this.randomXPos = [-OFFSET_SIDE, 0, OFFSET_SIDE]

		this.spawnBoosts()
	}

	spawnBoost() {
		// Pick random x position between 'left' || 'center' || 'right'
		const randomXPosId = Math.floor(Math.random() * this.randomXPos.length)
		const randomX = this.randomXPos[randomXPosId]

		// Pick random z position between road length
		const randomZ = this.mathUtils.randInt(-ROAD_LENGTH / 2, ROAD_LENGTH / 2)
		const randomPos = new THREE.Vector3(randomX, 0, randomZ)

		// New boost
		const boost = this.boost.model.scene.clone()
		boost.name = 'boost'

		if (DEV) {
			// BOX
			let box = new THREE.Box3()
			box.setFromObject(boost)

			let helper = new THREE.Box3Helper(box, 'green')
			// boost.add(helper)
		}

		boost.position.copy(randomPos)
		this.group.add(boost)
	}

	spawnBoosts() {
		for (let i = 0; i < NUMBER_BOOST; i++) {
			this.spawnBoost()
		}
	}
}

export default Boost
