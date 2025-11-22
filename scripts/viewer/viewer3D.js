import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { Viewer } from "./viewer.js";

export class Viewer3D extends Viewer {
    constructor(container) {
        super(container);

        this.model = null;
        this.mixer = null;
        this.actions = [];
        this.animationsPaused = false;
        this.boundingBox = new THREE.Box3();
        this.path = null;

        this.initScene();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0xcce0ff, 0.02);

        const dirLight = new THREE.DirectionalLight(0xffc87e, 2);
        dirLight.position.set(5, 10, 7.5);
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 50;
        dirLight.shadow.camera.left = -10;
        dirLight.shadow.camera.right = 10;
        dirLight.shadow.camera.top = 10;
        dirLight.shadow.camera.bottom = -10;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(1, 1);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.enablePan = true;
        this.controls.minPolarAngle = 0;
        this.controls.maxPolarAngle = Math.PI / 2.1;

        this.setContainer();
        this.renderFrame();
    }

    loadScene(sceneData) {
        if (sceneData.path === this.path) return;
        this.path = sceneData.path;

        if (this.model) {
            this.scene.remove(this.model);
            this.model.traverse(child => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) child.material.forEach(mat => mat.dispose());
                    else if (child.material) child.material.dispose();
                }
            });
            this.model = null;
        }

        const loader = new GLTFLoader();
        loader.load(sceneData.path, gltf => {
            this.model = gltf.scene;
            this.scene.add(this.model);
            if (gltf.animations && gltf.animations.length) {
                this.mixer = new THREE.AnimationMixer(this.model);
                this.actions = [];
                gltf.animations.forEach(clip => {
                    const action = this.mixer.clipAction(clip);
                    action.play();
                    action.setLoop(THREE.LoopRepeat, Infinity);
                    this.actions.push(action);
                });
            }
        });
    }

    toggleAnimations() {
        this.animationsPaused = !this.animationsPaused;
        this.actions.forEach(action => action.paused = this.animationsPaused);
    }

    renderFrame() {
        if (!this.isAnimating) return;
        requestAnimationFrame(() => this.renderFrame());

        const delta = this.clock.getDelta();
        if (this.mixer) this.mixer.update(delta);

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
