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

        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 400);
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

        if (sceneData.isPixelArt) {
            this.model.traverse(obj => {
                if (!obj.isMesh) return;

                const materials = Array.isArray(obj.material) ? obj.material : [obj.material];

                materials.forEach(mat => {
                    if (!mat.map) return;

                    const tex = mat.map;

                    tex.magFilter = THREE.NearestFilter;
                    tex.minFilter = THREE.NearestFilter;
                    tex.generateMipmaps = false;

                    tex.needsUpdate = true;

                    mat.needsUpdate = true;
                });
            });
        }

        // create bounding for cam
        const boundsObject = sceneData.boundsName ? this.model.getObjectByName(sceneData.boundsName) : null;
        this.boundingBox = new THREE.Box3().setFromObject(boundsObject || this.model);

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

        if (this.controls) {
            this.controls.update();

            if (this.boundingBox) {
                // get camera pos based on orbit sphere
                const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
                const spherical = new THREE.Spherical().setFromVector3(offset);

                this.clampVectorToBox(this.controls.target, this.boundingBox);

                // set camera pos back based on info before clamp
                offset.setFromSpherical(spherical);
                this.camera.position.copy(this.controls.target).add(offset);
                this.camera.lookAt(this.controls.target);
            }
        }

        //console.log('Camera pos:', this.camera.position);
        //console.log('Camera rot:', this.camera.rotation);
        //console.log('Controls target:', this.controls.target);

        this.app.renderer.render(this.scene, this.camera);
    }

    dispose() {
        // Dispose mixer
        if (this.mixer) {
            this.mixer.stopAllAction();
            if (this.model) this.mixer.uncacheRoot(this.model);
            this.mixer = null;
            this.actions = null;
        }

        // Dispose GLTF model
        if (this.model) {
            this.model.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(m => m.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });
            this.scene.remove(this.model);
            this.model = null;
        }

        // Dispose lights
        this.scene?.traverse(obj => {
            if (obj.isLight) this.scene.remove(obj);
        });

        // Remove controls
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }

        // Dispose HDR environment if any
        if (this.scene?.environment?.dispose) this.scene.environment.dispose();
        if (this.scene?.background?.dispose) this.scene.background.dispose();

        this.scene = null;
        this.camera = null;
    }

    clampVectorToBox(vec, box) {
        vec.x = Math.max(box.min.x, Math.min(box.max.x, vec.x));
        vec.y = Math.max(box.min.y, Math.min(box.max.y, vec.y));
        vec.z = Math.max(box.min.z, Math.min(box.max.z, vec.z));
        return vec;
    }

}