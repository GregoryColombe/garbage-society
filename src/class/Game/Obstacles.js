import * as THREE from 'three'

import assets from '../../utils/asset-store'
import { DEV, NUMBER_OBSTACLES, OFFSET_SIDE, ROAD_LENGTH } from '../../utils/utils'

class Obstacles {
	constructor({ group }) {
		this.mathUtils = THREE.MathUtils
		this.group = group

		this.obstacles = assets.models.obstacles

		this.randomXPos = [-OFFSET_SIDE, 0, OFFSET_SIDE]

		this.spawnObstacles()
	}

	spawnObstacle() {
		// Pick random int from trashes
		const randomObstacleId = Math.floor(Math.random() * this.obstacles.length)

		// Pick random x position between 'left' || 'center' || 'right'
		const randomXPosId = Math.floor(Math.random() * this.randomXPos.length)
		const randomX = this.randomXPos[randomXPosId]

		// Pick random z position between road length
		const randomZ = this.mathUtils.randInt(-ROAD_LENGTH / 2, ROAD_LENGTH / 2)
		const randomPos = new THREE.Vector3(randomX, 0, randomZ)

		// New obstacle
		const obstacle = this.obstacles[randomObstacleId].model.scene.clone()
		obstacle.name = 'obstacle'

		// BOX
		if (DEV) {
			let box = new THREE.Box3()
			box.setFromObject(obstacle)
			let helper = new THREE.Box3Helper(box, 'red')
			// obstacle.add(helper)
			obstacle.userData.box = box
		}

		obstacle.position.copy(randomPos)
		this.group.add(obstacle)
	}

	spawnObstacles() {
		for (let i = 0; i < NUMBER_OBSTACLES; i++) {
			this.spawnObstacle()
		}
	}
}

export default Obstacles
