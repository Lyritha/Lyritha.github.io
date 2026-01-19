import * as THREE from "three";
import { SceneViewerBase } from "./SceneViewerBase.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class SceneViewer3D extends SceneViewerBase {
    async createScene(sceneData) {
        this.scene = new THREE.Scene();

        if (sceneData.hdrPathOrHex) {
            if (sceneData.hdrPathOrHex.endsWith(".hdr")) {
                const hdr = await new RGBELoader().loadAsync(sceneData.hdrPathOrHex);
                hdr.mapping = THREE.EquirectangularReflectionMapping;
                this.scene.environment = hdr;
                this.scene.background = hdr;
            } else {
                this.scene.background = new THREE.Color(sceneData.hdrPathOrHex);
            }
        }

        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
        if (sceneData.cameraPosition) 
            this.camera.position.fromArray(sceneData.cameraPosition);
        if (sceneData.cameraRotation)
            this.camera.rotation.fromArray(sceneData.cameraRotation);


        this.controls = new OrbitControls(
            this.camera,
            this.app.renderer.domElement
        );

        if (sceneData.cameraTarget)
            this.controls.target.fromArray(sceneData.cameraTarget);

        if (sceneData.cameraZoom) {
            this.controls.minDistance = sceneData.cameraZoom.min;
            this.controls.maxDistance = sceneData.cameraZoom.max;
            this.camera.position
                .clone()
                .sub(this.controls.target)
                .setLength(sceneData.cameraZoom.current)
                .add(this.controls.target);
        }

        this.controls.enableDamping = true;
        this.controls.update();

        const light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.set(5, 10, 7);
        light.castShadow = true;
        this.scene.add(light);

        const gltf = await new GLTFLoader().loadAsync(sceneData.path);
        this.model = gltf.scene;
        this.scene.add(this.model);

        if (sceneData.boundsName) {
            const boundsObject = this.model.getObjectByName(sceneData.boundsName);
            if (boundsObject) {
                this.boundingBox = new THREE.Box3().setFromObject(boundsObject);
            }
        }

        // Animation mixer
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
    }

    renderFrame(dt) {
        if (!this.scene || !this.camera) return; // safety

        if (this.mixer && !this.actionsPaused) {
            // Only advance time if not paused
            this.mixer.update(dt);
        }

        this.controls?.update();
        this.app.renderer.render(this.scene, this.camera);
    }
}