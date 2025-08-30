export const hasCss = true;

// 3DViewer.js
import * as THREE from "three";

const state = {
    scene: null,
    camera: null,
    renderer: null,
    container: { element: null, size: { width: null, height: null } },
    uniforms: {},
    isAnimating: false,
    clock: new THREE.Clock(),
    lastTime: performance.now(),
    frames: 0,
    fps: 0,
    currentResolutionTarget: 1,
    quad: null,
    width: 0,
    height: 0
};

export function init(template) {
    const body = document.body;
    body.appendChild(template);
    state.modal = document.getElementById('2DViewerModal');

    // Close button
    state.modal.querySelector('[data-function="close-fullscreen"]').addEventListener('click', closeModal);

    // Close button
    state.modal.querySelector('[data-function="toggle-anim"]').addEventListener('click', () => {
            state.isAnimating = !state.isAnimating;
        if (state.isAnimating) {
                state.lastTime = performance.now()
                renderFrame();
            }
    });

    // Auto-close modal when fullscreen is exited
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && state.modal.classList.contains('active')) {
            closeModal();
        }
    });
}

export function createWindow({ element, fragment }) {
    const target = element.closest("[data-page][data-section]");

    if (target) {
        // Create an observer
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    if (target.classList.contains("active")) enableViewer(element, fragment);
                    else state.isAnimating = false;
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
            state.isAnimating = !state.isAnimating;
            if (state.isAnimating) {
                state.lastTime = performance.now()
                renderFrame();
            }
        });
    }
}

export function canOpen2DViewer(element) {
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
function enableViewer(element, fragmentShader) {
    state.isAnimating = true;
    if (!state.scene) createScene();

    setContainer(element);

    // Swap shader if provided
    if (fragmentShader && state.quad) {
        state.quad.material.fragmentShader = fragmentShader;
        state.quad.material.needsUpdate = true;
    }

    if (state.isAnimating) {
        renderFrame();
    }
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

    // Fullscreen orthographic camera
    state.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Renderer
    state.renderer = new THREE.WebGLRenderer({ antialias: true });
    state.renderer.setSize(1, 1);
    state.renderer.setPixelRatio(window.devicePixelRatio);

    // Fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Uniforms
    state.uniforms = {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(1, 1) },
    };

    // Default 2D shader
    const defaultShader = `
        precision mediump float;
        uniform float u_time;
        uniform vec2 u_resolution;
        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            gl_FragColor = vec4(uv.x, uv.y, 0.5 + 0.5*sin(u_time), 1.0);
        }
    `;
    const material = new THREE.ShaderMaterial({
        fragmentShader: defaultShader,
        uniforms: state.uniforms
    });

    const quad = new THREE.Mesh(geometry, material);
    state.scene.add(quad);
    state.quad = quad; // store for shader swaps

    // Start rendering
    renderFrame();
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
    renderer.setSize(1, 1);

    const width = container?.clientWidth ?? size?.width;
    let height = container?.clientHeight ?? size?.height;

    if (!width || !height) {
        return console.warn('Invalid container or size passed to resizeToContainer', { container, size });
    }

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    state.width = width;
    state.height = height;

    const devicePixels = window.devicePixelRatio;
    state.renderer.setPixelRatio(devicePixels);
    state.uniforms.u_resolution.value.set(state.width * devicePixels, state.height * devicePixels);
    state.renderer.render(state.scene, state.camera);
}

// handles updating the scene
function renderFrame() {
    if (!state.isAnimating) return;

    requestAnimationFrame(() => renderFrame());

    // Update FPS
    const now = performance.now();
    state.frames++;
    if (now >= state.lastTime + 1000) { // every 1s
        state.fps = Math.round((state.frames * 1000) / (now - state.lastTime));
        framesDynamicResolution();
        state.frames = 0;
        state.lastTime = now;
    }


    // Update uniforms
    state.uniforms.u_time.value = parseFloat(state.clock.getElapsedTime().toFixed(2));

    // Render
    state.renderer.render(state.scene, state.camera);
}

function framesDynamicResolution() {
    const ratio = window.devicePixelRatio;
    const targetFPS = 90;
    const minScale = 0.2;
    const maxScale = 1.0;

    let newRatio = state.currentResolutionTarget * (state.fps / targetFPS);
    newRatio = Math.max(ratio * minScale, Math.min(ratio * maxScale, newRatio));
    newRatio = Math.max(0.1, Math.min(1, newRatio));

    if (Math.abs(newRatio - state.currentResolutionTarget) > 0.1) {
        state.renderer.setPixelRatio(newRatio);
        state.uniforms.u_resolution.value.set(state.width * newRatio, state.height * newRatio);
    }

    console.log(`FPS: ${state.fps}, Ration: ${newRatio}`);

    state.currentResolutionTarget = newRatio;
}
