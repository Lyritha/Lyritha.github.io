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
    modelBoundingBox: new THREE.Box3()
};

export function initViewer(container = document.body) {

    if (!checkWebGL()) {
        return; // Exit if WebGL is not supported
    }

    // scene
    ViewerState.scene = createScene();

    // camera setup
    const width = container.clientWidth;
    const height = container.clientHeight;
    ViewerState.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    ViewerState.camera.position.set(0, 0, 5);

    ViewerState.renderer = createRenderer(width, height);
    ViewerState.controls = createControls(ViewerState.camera, ViewerState.renderer);

    container.appendChild(ViewerState.renderer.domElement);
    setupResize(ViewerState.camera, ViewerState.renderer, container);

    // start updates
    renderFrame();
}

export function loadModel(path, boundingBoxTarget) {
    if (!ViewerState.scene) {
        console.error("Viewer not initialized. Call initViewer first.");
        return;
    }


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

            const houseObject = ViewerState.model.getObjectByName(boundingBoxTarget);
            if (houseObject) {
                ViewerState.modelBoundingBox.setFromObject(houseObject);
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
export function loadHDR(path) {
    if (!ViewerState.scene) {
        console.error("Viewer not initialized. Call initViewer first.");
        return;
    }

    const file = typeof path === 'string' ? path : path.file;
    const folder = typeof path === 'object' && path.folder ? path.folder : '';

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


function checkWebGL() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        alert("WebGL is not supported on your browser. 3D features will not work.");
        return false;
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (/swiftshader/i.test(renderer) || /software/i.test(renderer)) {
            alert(
                "Your browser is using software WebGL, which is very slow. " +
                "For better performance, please enable hardware acceleration in your browser settings."
            );
            return false;
        }
    }

    return true; // Hardware-accelerated WebGL is available
}


function setupResize(camera, renderer, container) {
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    });
}

function createScene() {
    const scene = new THREE.Scene();

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

    scene.add(dirLight);

    return scene;
}
function createRenderer(width, height) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
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