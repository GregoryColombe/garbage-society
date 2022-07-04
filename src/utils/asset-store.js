const assetStore = {
	textures: [],

	models: {
		obstacles: [
			{ type: 'glb', src: '/meshes/obstacles/obstacle_car.glb' },
			{ type: 'glb', src: '/meshes/obstacles/obstacle_cone.glb' },
			{ type: 'glb', src: '/meshes/obstacles/obstacle_escalator.glb' },
		],
		trashes: [{ type: 'glb', src: '/meshes/trash/trash.glb' }],
		boost: { type: 'glb', src: '/meshes/boost/obstacle_boost.glb' },
		roads: [{ type: 'glb', src: '/meshes/road/road-1.glb' }],
		truck: {
			type: 'gltf',
			src: '/meshes/truck/camion.glb',
		},
	},
}

export const allAsArray = [...Object.values(assetStore.textures), ...Object.values(assetStore.models).flat()]
export const length = allAsArray.length
export default assetStore
