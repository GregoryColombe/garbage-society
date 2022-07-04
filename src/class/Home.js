import gsap from 'gsap'
import AssetLoader from './Game/AssetLoader'
import GameScene from './Game/GameScene'

class Home {
	constructor() {
		this.btn = document.querySelector('#ui-home_start-button')
		this.init()
	}

	init() {
		console.log('toto : ', this.btn)
		this.btn.addEventListener('click', this.startGame)
	}

	startGame = () => {
		const gameScene = new GameScene()

		AssetLoader.load().then(() => {
			gameScene.build()
			// gameScene.start()
			gameScene.game.ui.startIntroduction()
		})
	}
}

export default Home
