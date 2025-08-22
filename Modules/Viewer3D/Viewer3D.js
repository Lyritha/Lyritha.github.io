/* ADD IN HEAD OF HTML
    <script type="importmap">
        {
          "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/"
          }
        }
    </script>
*/

export const hasCss = true;

// 3DViewer.js
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

const state = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    model: null,
    boundingBox: new THREE.Box3(),
    modal: null,
    resizeHandler: null,
    isAnimating: false,
    path: null,
    container: {
        element: null,
        size: {
            width: null,
            height: null
        }
    },

    // Animation
    mixer: null,
    actions: [],
    animationsPaused: false,
    clock: new THREE.Clock(),
};

const clock = new THREE.Clock();

export function init(template) {
    const body = document.body;
    body.appendChild(template);
    state.modal = document.getElementById('3DViewerModal');

    // Close button
    state.modal.querySelector('[data-function="close-fullscreen"]').addEventListener('click', closeModal);

    // Close button
    state.modal.querySelector('[data-function="toggle-anim"]').addEventListener('click', () => {
        console.log("Toggling animations");
        state.animationsPaused = !state.animationsPaused;
        state.actions.forEach(action => action.paused = state.animationsPaused);
    });

    // Auto-close modal when fullscreen is exited
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && state.modal.classList.contains('active')) {
            closeModal();
        }
    });
}

export function createWindow({ element, scene }) {
    const target = element.closest("[data-page][data-section]");

    if (target) {
        // Create an observer
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    if (target.classList.contains("active")) enableViewer(element, scene);
                    else disableViewer();
                }
            });
        });

        observer.observe(target, { attributes: true, attributeFilter: ["class"] });
    }

    const button = element.querySelector('[data-function="fullscreen"]');
    button.addEventListener('click', () => openModal(element));

    // Animation toggle button
    const toggleBtn = element.querySelector('[data-function="toggle-anim"]');
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            console.log("Toggling animations");
            state.animationsPaused = !state.animationsPaused;
            state.actions.forEach(action => action.paused = state.animationsPaused);
        });
    }
}

export function canOpen3DViewer(element) {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    const result = !!gl && (() => {
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        if (!info) return true;
        const renderer = gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
        return !(/swiftshader|software/i.test(renderer));
    })();

    if (!result) {
        const agent = navigator.userAgent.toLowerCase();
        const browser =
            agent.includes("edg") || (agent.includes("chrome") && !agent.includes("opr")) ? "chromium" :
                agent.includes("firefox") ? "firefox" :
                    agent.includes("safari") && !agent.includes("chrome") ? "safari" :
                        "unknown";

        element.querySelectorAll(".gpu-warning").forEach(d => d.classList.add("active"));
        element.querySelectorAll(".gpu-warning ol").forEach(d =>
            d.dataset.browser !== browser ? d.remove() : (d.open = true)
        );
    }

    return result;
}

// enable/disable the viewer when the element isn't visible
function enableViewer(element, scene) {
    state.isAnimating = true;

    if (!state.scene) createScene();
    else { renderFrame(); }

    setContainer(element);

    if (scene.path !== state.path) loadSceneData(scene);
}
function disableViewer() {
    state.isAnimating = false;
}

// modal open/close functions
function openModal(element) {
    state.container.element = element;
    state.container.size = {
        width: element.clientWidth,
        height: element.clientHeight
    };

    state.modal.classList.toggle('active', true);
    setContainer(state.modal);

    if (state.modal.requestFullscreen) {
        state.modal.requestFullscreen();
    } else if (state.modal.webkitRequestFullscreen) {
        state.modal.webkitRequestFullscreen();
    } else if (state.modal.msRequestFullscreen) {
        state.modal.msRequestFullscreen();
    }
}
function closeModal() {
    state.modal.classList.remove('active');
    setContainer(state.container.element);

    resizeToContainer(state.camera, state.renderer, null, state.container.size);

    if (document.fullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// create the scene and renderer
function createScene() {
    state.scene = new THREE.Scene();

    const fogColor = 0xcce0ff;
    state.scene.fog = new THREE.FogExp2(fogColor, 0.02);

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
    state.scene.add(dirLight);

    state.renderer = new THREE.WebGLRenderer({ antialias: true });
    state.renderer.setSize(1, 1);
    state.renderer.outputColorSpace = THREE.SRGBColorSpace;
    state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    state.renderer.toneMappingExposure = 1.0;
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    state.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);

    state.controls = new OrbitControls(state.camera, state.renderer.domElement);
    state.controls.enableDamping = true;
    state.controls.enablePan = true;
    state.controls.minPolarAngle = 0;
    state.controls.maxPolarAngle = Math.PI / 2.1;
    state.controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: null,
        RIGHT: THREE.MOUSE.PAN
    };

    renderFrame();
}

function loadSceneData(scene) {
    state.path = scene.path;

    if (state.model) {
        state.scene.remove(state.model);
        state.model.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else if (child.material) {
                    child.material.dispose();
                }
            }
        });
        state.model = null;
    }

    const loader = new GLTFLoader();
    loader.load(scene.path, (gltf) => {
        state.model = gltf.scene;
        state.model.scale.set(1, 1, 1);
        state.model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    if (Array.isArray(child.material)) child.material.forEach(m => m.side = THREE.FrontSide);
                    else child.material.side = THREE.FrontSide;
                }
            }
        });
        state.scene.add(state.model);

        const boundsObject = state.model.getObjectByName(scene.boundsName);
        if (boundsObject) state.boundingBox.setFromObject(boundsObject);
        else state.boundingBox.setFromObject(state.model);

        // Animation
        if (gltf.animations && gltf.animations.length) {
            state.mixer = new THREE.AnimationMixer(state.model);
            state.actions = [];
            gltf.animations.forEach(clip => {
                const action = state.mixer.clipAction(clip);
                action.play();
                action.setLoop(THREE.LoopRepeat, Infinity);
                state.actions.push(action);
            });
        }
    });

    if (typeof scene.hdrPathOrHex === 'string' && scene.hdrPathOrHex.startsWith('#')) {
        const color = new THREE.Color(scene.hdrPathOrHex);
        state.scene.background = color;
        state.scene.environment = null;
        return;
    }

    const file = typeof scene.hdrPathOrHex === 'string' ? scene.hdrPathOrHex : scene.hdrPathOrHex.file;
    const folder = typeof scene.hdrPathOrHex === 'object' && scene.hdrPathOrHex.folder ? scene.hdrPathOrHex.folder : '';

    const pmremGenerator = new THREE.PMREMGenerator(state.renderer);
    pmremGenerator.compileEquirectangularShader();

    new RGBELoader().setPath(folder).load(file, (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        state.scene.background = envMap;
        state.scene.environment = envMap;
        texture.dispose();
        pmremGenerator.dispose();
    });

    state.controls.target.fromArray(scene.cameraTarget);
    state.camera.position.fromArray(scene.cameraPosition);
    state.camera.rotation.fromArray(scene.cameraRotation);

    if (scene.cameraZoom) {
        const { min, max, current } = scene.cameraZoom;
        state.controls.minDistance = min;
        state.controls.maxDistance = max;

        const direction = new THREE.Vector3().subVectors(state.camera.position, state.controls.target).normalize();
        state.camera.position.copy(state.controls.target).add(direction.multiplyScalar(current));
    }

    state.controls.update();
}

// Set the container for the 3D viewer
function setContainer(container) {
    container.appendChild(state.renderer.domElement);
    requestAnimationFrame(() => resizeToContainer(state.camera, state.renderer, container, null));
    state.resizeHandler && window.removeEventListener('resize', state.resizeHandler);
    state.resizeHandler = () => resizeToContainer(state.camera, state.renderer, container, null);
    window.addEventListener('resize', state.resizeHandler);
}

function resizeToContainer(camera, renderer, container = null, size = null) {
    if (!state.isAnimating) return;
    renderer.setSize(1, 1);

    const width = container?.clientWidth ?? size?.width;
    let height = container?.clientHeight ?? size?.height;

    if (!width || !height) {
        return console.warn('Invalid container or size passed to resizeToContainer', { container, size });
    }

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
}

// handles updating the scene
function renderFrame() {
    if (!state.isAnimating) return;

    requestAnimationFrame(() => renderFrame());

    const delta = clock.getDelta();
    if (state.mixer) state.mixer.update(delta);

    if (state.model) {
        const offset = new THREE.Vector3().copy(state.camera.position).sub(state.controls.target);
        const min = state.boundingBox.min;
        const max = state.boundingBox.max;
        state.controls.target.x = Math.max(min.x, Math.min(max.x, state.controls.target.x));
        state.controls.target.y = Math.max(min.y, Math.min(max.y, state.controls.target.y));
        state.controls.target.z = Math.max(min.z, Math.min(max.z, state.controls.target.z));
        state.camera.position.copy(state.controls.target).add(offset);
    }

    state.controls.update();
    state.renderer.render(state.scene, state.camera);
}