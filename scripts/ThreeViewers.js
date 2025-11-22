/* ADD HTML
    <script type="importmap">
        {
          "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/"
          }
        }
    </script>
*/;

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";


// Unified controls state
const controlsState = {
    dragging: false,
    dragMode: null,
    lastMouse: { x: 0, y: 0 },
    scrollModifier: 1,
    rotationSensitivity: 0.002,
    panSensitivity: 0.01,
    scrollSensitivity: 0.0001
};

// Unified global state
const state = {
    // Scene, camera, renderer
    scene: null,
    camera: null,
    renderer: null,

    // Container info
    container: {
        element: null,
        size: { width: null, height: null }
    },

    // Controls
    controls: controlsState,

    // Model / 3D assets
    model: null,
    boundingBox: new THREE.Box3(),
    mixer: null,
    actions: [],
    animationsPaused: false,
    modal: null,
    path: null,
    resizeHandler: null,

    // Animation / timing
    isAnimating: false,
    clock: new THREE.Clock(),
    lastTime: performance.now(),
    frames: 0,
    fps: 0,
    currentResolutionTarget: 1,

    // Shaders / uniforms
    uniforms: {},

    // Optional quad for post-processing
    quad: null,

    // Canvas size
    width: 0,
    height: 0
};



export function initViewer() {
    // Reference the modal
    state.modal = document.getElementById('3DViewerModal');
    if (!state.modal) return;

    // Close button
    const closeBtn = state.modal.querySelector('[data-function="close-fullscreen"]');
    closeBtn?.addEventListener('click', closeModal);

    // Toggle animation button
    const toggleAnimBtn = state.modal.querySelector('[data-function="toggle-anim"]');
    toggleAnimBtn?.addEventListener('click', () => {
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


// Set the container for the viewer
function setContainer(container) {
    container.appendChild(state.renderer.domElement);
    requestAnimationFrame(() => resizeToContainer(state.camera, state.renderer, container, null));
    state.resizeHandler && window.removeEventListener('resize', state.resizeHandler);
    state.resizeHandler = () => resizeToContainer(state.camera, state.renderer, container, null);
    window.addEventListener('resize', state.resizeHandler);
}
/**
 * Adjusts renderer pixel ratio dynamically based on current FPS.
 * Updates uniforms.u_resolution if available.
 *
 * Should be called once per frame after FPS is calculated.
 */
function updateDynamicResolution() {
    const ratio = window.devicePixelRatio;
    const targetFPS = 90;
    const minScale = 0.2;  // 20% of devicePixelRatio
    const maxScale = 1.0;  // full devicePixelRatio

    // Compute new pixel ratio based on current FPS
    let newRatio = state.currentResolutionTarget * (state.fps / targetFPS);

    // Clamp ratio to devicePixelRatio range
    newRatio = Math.max(ratio * minScale, Math.min(ratio * maxScale, newRatio));
    newRatio = Math.max(0.1, Math.min(1, newRatio)); // prevent extremely low/high values

    // Only update if difference is significant
    if (Math.abs(newRatio - state.currentResolutionTarget) > 0.1) {
        state.renderer.setPixelRatio(newRatio);

        // Update uniforms if present
        if (state.uniforms?.u_resolution) {
            state.uniforms.u_resolution.value.set(state.width * newRatio, state.height * newRatio);
        }

        // Optional: debug logging
        // console.log(`FPS: ${state.fps}, PixelRatio updated: ${newRatio}`);
    }

    state.currentResolutionTarget = newRatio;
}


// check if three.js rendering is supported
export function canOpenViewer(element) {
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