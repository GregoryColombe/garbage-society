import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Constants
export const DEV = false
export const MUTED_DEFAULT = DEV
export const NUMBER_TRASHES = 2
export const NUMBER_OBSTACLES = 3
export const NUMBER_BOOST = 1
export const OFFSET_SIDE = 5.2
export const ROAD_LENGTH = 86.33146253843381
export const WITH_BLOOM = false
export const CAMERA_FOV = 65
export const BOOST_SPEED_COEF = 3
export const BOOST_APPARITION = 3

// Colors
export const COLORS = {
	RED: 0xc0392b,
	WHITE: 0xf7d794,
}

// Loaders
export const gltfLoader = new GLTFLoader()
