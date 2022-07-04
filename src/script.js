import './assets/scss/main.scss'
import AssetLoader from './class/Game/AssetLoader'
import Home from './class/Home'
import GameScene from './class/Game/GameScene'
import { DEV } from './utils/utils'

const gameScene = new GameScene()

if (DEV) {
	AssetLoader.load().then(() => {
		gameScene.build()
		gameScene.start()
	})
} else {
	const home = new Home()
}
