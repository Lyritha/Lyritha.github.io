export const hasCss = true;

// 3DViewer.js
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

// Create a container for all 3D viewer state
const ViewerState = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    model: null,
    modelBoundingBox: new THREE.Box3(),
    resizeHandler: null,
    mainContainer: null,
    mainContainerWidth: 0,
    mainContainerHeight: 0,
    modal: null
};

const observer = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // ELEMENT_NODE
                    if (node.matches('.thumbnail3D')) {
                        initFullscreenModels([node]);
                    }
                    const thumbnails = node.querySelectorAll?.('.thumbnail3D');
                    if (thumbnails?.length) {
                        initFullscreenModels(Array.from(thumbnails));
                    }
                }
            });
        }
    }
});

function initFullscreenModels(elements) {
    elements.forEach(el => {
        el.removeEventListener('dblclick', openModal);
        el.addEventListener('dblclick', openModal);
    });
}

function openModal() {
    ViewerState.mainContainer = this;
    ViewerState.mainContainerWidth = this.clientWidth;
    ViewerState.mainContainerHeight = this.clientHeight;
    ViewerState.modal.classList.toggle('active', true);
    setContainer(ViewerState.modal);

    // Request fullscreen on the modal
    if (ViewerState.modal.requestFullscreen) {
        ViewerState.modal.requestFullscreen();
    } else if (ViewerState.modal.webkitRequestFullscreen) {
        ViewerState.modal.webkitRequestFullscreen();
    } else if (ViewerState.modal.msRequestFullscreen) {
        ViewerState.modal.msRequestFullscreen();
    }
}

function closeModal() {
    ViewerState.modal.classList.remove('active');
    setContainer(ViewerState.mainContainer);

    const size = {
        width: ViewerState.mainContainerWidth,
        height: ViewerState.mainContainerHeight
    };
    resizeToContainer(ViewerState.camera, ViewerState.renderer, size);

    // Exit fullscreen if active
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

export function canOpen3DViewer(element) {
    const result = checkWebGL();

    // show instructions if WebGL is not supported
    if (!result) {
        if (checkWebGL()) return;

        const ua = navigator.userAgent.toLowerCase();
        let browser = "unknown";

        if (ua.includes("chrome") && !ua.includes("edg") && !ua.includes("opr")) {
            browser = "chromium"; // Chrome
        } else if (ua.includes("edg")) {
            browser = "chromium"; // Edge (Chromium based)
        } else if (ua.includes("firefox")) {
            browser = "firefox";
        } else if (ua.includes("safari") && !ua.includes("chrome")) {
            browser = "safari";
        }

        // enabled GPU warnings
        element.querySelectorAll(".gpu-warning").forEach(d => {
            d.classList.add('active');
        });

        // remove all details except the detected one
        element.querySelectorAll(".gpu-warning ol").forEach(d => {

            if (d.dataset.browser !== browser) {
                d.remove();
            } else {
                d.open = true; // auto expand relevant one
            }
        });
    }

    return result;
}


export function init(template) {
    if (!checkWebGL()) {
        return;
    }


    const body = document.body;
    body.appendChild(template);
    ViewerState.modal = document.getElementById('3DViewerModal');
    observer.observe(document.body, { childList: true, subtree: true });

    const thumbnails = document.querySelectorAll('.thumbnail3D');
    initFullscreenModels(thumbnails);

    // Close button
    ViewerState.modal.querySelector('[data-function="close-modal"]').addEventListener('click', closeModal);

    // Auto-close modal when fullscreen is exited
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && ViewerState.modal.classList.contains('active')) {
            closeModal();
        }
    });
}

export function openScene({ modelPath, modelBoundsName, hdrPathOrHex, container }) {
    if (!checkWebGL()) return;

    if (!ViewerState.scene) createScene();
    if (container) setContainer(container);

    loadModel(modelPath, modelBoundsName);
    loadHDR(hdrPathOrHex);
}

export function setContainer(containerOrId) {
    // Accept either an element or an ID string
    const container =
        typeof containerOrId === 'string'
            ? document.getElementById(containerOrId)
            : containerOrId;

    if (!container) {
        console.warn('Container not found:', containerOrId);
        return;
    }

    container.appendChild(ViewerState.renderer.domElement);

    // wait for layout to complete
    requestAnimationFrame(() => {
        resizeToContainer(ViewerState.camera, ViewerState.renderer, container);
    });

    // Replace old listener with a new one
    if (ViewerState.resizeHandler) {
        window.removeEventListener('resize', ViewerState.resizeHandler);
    }

    ViewerState.resizeHandler = () => {
        resizeToContainer(ViewerState.camera, ViewerState.renderer, container);
    };
    window.addEventListener('resize', ViewerState.resizeHandler);
}



// handles the initial scene setup
function createScene() {

    // scene
    ViewerState.scene = new THREE.Scene();

    //setup main light
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
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
    ViewerState.scene.add(dirLight);

    // camera setup
    ViewerState.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    ViewerState.camera.position.set(0, 0, 5);

    ViewerState.renderer = createRenderer();
    ViewerState.controls = createControls(ViewerState.camera, ViewerState.renderer);

    // start updates
    renderFrame();
}
function resizeToContainer(camera, renderer, containerOrSize) {
    let width, height;

    if (containerOrSize instanceof HTMLElement) {
        // If a container element is passed
        width = containerOrSize.clientWidth;
        height = containerOrSize.clientHeight;
    } else if (
        typeof containerOrSize === 'object' &&
        typeof containerOrSize.width === 'number' &&
        typeof containerOrSize.height === 'number'
    ) {
        // If an explicit size object is passed
        width = containerOrSize.width;
        height = containerOrSize.height;
    } else {
        console.warn('Invalid argument passed to resizeToContainer', containerOrSize);
        return;
    }

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
}



// create Three.js components
function createRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    return renderer;
}
function createControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: null,    // disables click zoom
        RIGHT: THREE.MOUSE.PAN
    };

    return controls;
}


// handle loading models and HDR environments
function loadModel(path, boundingBoxTarget) {

    // Dispose previous model if it exists
    if (ViewerState.model) {
        ViewerState.scene.remove(ViewerState.model);
        ViewerState.model.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else if (child.material) {
                    child.material.dispose();
                }
            }
        });
        ViewerState.model = null;
    }

    // load new model
    const loader = new GLTFLoader();
    loader.load(
        path,
        (gltf) => {
            ViewerState.model = gltf.scene;
            ViewerState.model.scale.set(1, 1, 1);

            ViewerState.model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => mat.side = THREE.FrontSide);
                        } else {
                            child.material.side = THREE.FrontSide;
                        }
                    }
                }
            });

            ViewerState.scene.add(ViewerState.model);

            const boundsObject = ViewerState.model.getObjectByName(boundingBoxTarget);
            if (boundsObject) {
                ViewerState.modelBoundingBox.setFromObject(boundsObject);
            } else {
                // fallback to entire model
                ViewerState.modelBoundingBox.setFromObject(ViewerState.model);
            }

            // Optional: center controls on this object
            ViewerState.modelBoundingBox.getCenter(ViewerState.controls.target);
            ViewerState.camera.position.copy(ViewerState.controls.target).add(new THREE.Vector3(0, 0, 5));
        },
        (xhr) => { },
        (error) => console.error('An error happened', error)
    );
}
function loadHDR(pathOrHex) {

    // If path is a hex color string
    if (typeof pathOrHex === 'string' && pathOrHex.startsWith('#')) {
        const color = new THREE.Color(pathOrHex);
        ViewerState.scene.background = color;
        ViewerState.scene.environment = null;
        return;
    }

    // Assume it's an HDR file path
    const file = typeof pathOrHex === 'string' ? pathOrHex : pathOrHex.file;
    const folder = typeof pathOrHex === 'object' && pathOrHex.folder ? pathOrHex.folder : '';

    const pmremGenerator = new THREE.PMREMGenerator(ViewerState.renderer);
    pmremGenerator.compileEquirectangularShader();

    new RGBELoader()
        .setPath(folder)
        .load(file, (texture) => {
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            ViewerState.scene.background = envMap;
            ViewerState.scene.environment = envMap;
            texture.dispose();
            pmremGenerator.dispose();
        });
}


// handles updating the scene
function renderFrame() {
    requestAnimationFrame(() => renderFrame());

    if (ViewerState.model) {
        const offset = new THREE.Vector3().copy(ViewerState.camera.position).sub(ViewerState.controls.target);

        const min = ViewerState.modelBoundingBox.min;
        const max = ViewerState.modelBoundingBox.max;
        ViewerState.controls.target.x = Math.max(min.x, Math.min(max.x, ViewerState.controls.target.x));
        ViewerState.controls.target.y = 0;
        ViewerState.controls.target.z = Math.max(min.z, Math.min(max.z, ViewerState.controls.target.z));

        ViewerState.camera.position.copy(ViewerState.controls.target).add(offset);
    }

    ViewerState.controls.update();
    ViewerState.renderer.render(ViewerState.scene, ViewerState.camera);
}


// Check if WebGL is supported and hardware-accelerated
function checkWebGL() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        return false;
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (/swiftshader/i.test(renderer) || /software/i.test(renderer)) {
            return false;
        }
    }

    return true; // Hardware-accelerated WebGL is available
}