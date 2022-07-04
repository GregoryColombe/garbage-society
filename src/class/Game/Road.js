import * as THREE from 'three'
import gsap from 'gsap'

import assets from '../../utils/asset-store'
import { BOOST_APPARITION, ROAD_LENGTH, WITH_BLOOM, DEV } from '../../utils/utils'

import Obstacles from './Obstacles'
import Trashes from './Trashes'
import Boost from './Boost'

class Road {
	scene = null
	model = null

	constructor({ scene, onCollideTrash, onCollideObstacle, onCollideBoost, truck, bloom }) {
		this.group = new THREE.Group()
		this.scene = scene
		this.onCollideTrash = onCollideTrash
		this.onCollideObstacle = onCollideObstacle
		this.onCollideBoost = onCollideBoost
		this.truck = truck
		this.bloom = bloom

		// props
		this.mustGenerateAt = 0
		this.inNextChunk = ROAD_LENGTH / 2
		this.generatedCount = 0
		this.currentChunkIndex = 0

		this._vector = new THREE.Vector3()
		this._box = new THREE.Box3()

		this.init()
	}

	init() {
		// add group to scene
		this.scene.add(this.group)

		// create first road and add to group
		this.generateChunk()
		this.generateChunk()
		this.mustGenerateAt = ROAD_LENGTH
	}

	// Core

	update(speed, delta) {
		const milisecondDelta = delta * 1000
		const speedAccordingTick = milisecondDelta * 0.12

		// move forward
		this.group.position.z += speed * speedAccordingTick

		// if must generate
		if (this.group.position.z > this.mustGenerateAt) {
			this.generateChunk()
		}

		if (this.group.position.z > this.inNextChunk) {
			this.inNextChunk += ROAD_LENGTH
			this.currentChunkIndex++
		}

		// collisions
		this.checkCollisions()
	}

	onCollision(child) {
		console.log('COLLIDED WITH', child.name)

		// prevent from collide again
		child.userData.hasCollided = true

		gsap.to(child.scale, {
			duration: 0.2,
			x: 0,
			y: 0,
			z: 0,
			ease: 'power2.out',
			onComplete: () => {
				this.disposeMesh(child)
			},
		})

		if (child.name === 'obstacle') {
			this.onCollideObstacle()
		} else if (child.name === 'trash') {
			this.onCollideTrash()
		} else if (child.name === 'boost') {
			this.onCollideBoost()
		}
	}

	checkCollisions() {
		const currentGroup = this.group.children[this.currentChunkIndex]

		currentGroup.traverse((child) => {
			if (
				(child.name === 'obstacle' || child.name === 'trash' || child.name === 'boost') &&
				!child.userData.hasCollided
			) {
				if (this.truck.isBoosting && child.name !== 'trash') {
					return
				}

				this._box.makeEmpty()
				this._box.setFromObject(child)

				const intersected = this.truck.box.intersectsBox(this._box)

				if (intersected) {
					this.onCollision(child)
				}
			}
		})
	}

	disposeMesh = (obj) => {
		if (obj.isMesh) {
			obj.material.dispose()
			obj.geometry.dispose()
		}
	}

	removeGroup(group) {
		console.log('REMOVE -- ')

		// remove from parent
		group.visible = false

		// dispose all
		group.traverse(this.disposeMesh)

		// group = null
	}

	// Helpers
	generateChunk() {
		console.log('--- GENERATE CHUNK ---')

		// find random array
		const randomIndexRoads = this.generatedCount === 0 ? 0 : Math.floor(Math.random() * assets.models.roads.length)

		// next model
		const nextGroup = new THREE.Group()
		this.group.add(nextGroup)
		nextGroup.position.z = -this.generatedCount * ROAD_LENGTH
		const nextModel = assets.models.roads[randomIndexRoads].model.scene.clone()
		nextGroup.add(nextModel)

		// Generate Obstacles
		if (this.generatedCount >= 1) {
			new Obstacles({ group: nextGroup })
			new Trashes({ group: nextGroup })

			if (this.generatedCount % BOOST_APPARITION === BOOST_APPARITION - 1) {
				new Boost({ group: nextGroup })
			}
		}

		// increased next threshold
		this.mustGenerateAt += ROAD_LENGTH
		this.generatedCount += 1

		// Display box & size

		if (DEV) {
			let box = new THREE.Box3()
			box.setFromObject(nextModel)
			let helper = new THREE.Box3Helper(box)
			nextGroup.add(helper)
		}

		// remove useless group
		let secondPreviousIndex = this.currentChunkIndex - 1
		let secondPreviousGroup = this.group.children[secondPreviousIndex]

		if (secondPreviousGroup) {
			this.removeGroup(secondPreviousGroup)
		}

		// let foo = new THREE.Mesh(new THREE.SphereBufferGeometry(), new THREE.MeshBasicMaterial({ color: 'red' }))
		// foo.position.z = -ROAD_LENGTH * 0.25
		// nextGroup.add(foo)
	}
}

export default Road
