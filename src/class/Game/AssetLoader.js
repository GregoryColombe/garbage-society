// assets
import assets, { allAsArray } from '../../utils/asset-store'

// loaders
import { gltfLoader } from '../../utils/utils'

class AssetLoader {
	constructor() {}

	async load() {
		const promises = []

		// iterate
		allAsArray.forEach((assetItem) => {
			if (assetItem.type === 'gltf' || assetItem.type === 'glb') {
				promises.push(
					gltfLoader.loadAsync(assetItem.src).then((model) => {
						assetItem.model = model
					})
				)
			}
		})

		// wait all
		await Promise.all(promises)
	}
}

export default new AssetLoader()
