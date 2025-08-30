export const hasCss = true;

// 3DViewer.js
import * as THREE from "three";

// Controls object
const controlsState = {
    dragging: false,
    dragMode: null,
    lastMouse: { x: 0, y: 0 },
    scrollModifier: 1,
    rotationSensitivity: 0.002,
    panSensitivity: 0.01,
    scrollSensitivity: 0.0001
};

// Global state
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
    height: 0,
    controls: controlsState
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
    if (!state.scene) createScene(element);
    else setContainer(element);

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
function createScene(element) {
    state.scene = new THREE.Scene();
    state.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.001, 60);
    state.camera.position.set(0, 0, -3);

    state.renderer = new THREE.WebGLRenderer({ antialias: true });
    setContainer(element);

    controls(true, false);

    // Uniforms
    state.uniforms = {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(state.renderer.domElement.width, state.renderer.domElement.height) },
        u_camPos: { value: state.camera.position.clone() },
        u_camRot: { value: state.camera.rotation.clone() },
        u_camNear: { value: state.camera.near },
        u_camFar: { value: state.camera.far },
        u_scrollModifier: { value: 1.0 }
    };

    // Default 2D shader
    const defaultShader = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            gl_FragColor = vec4(uv.x, uv.y, 0.5 + 0.5*sin(u_time), 1.0);
        }
    `;

    // Fullscreen quad attached to camera
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
        fragmentShader: defaultShader,
        uniforms: state.uniforms,
        depthTest: false,
        depthWrite: false
    });
    const quad = new THREE.Mesh(geometry, material);
    state.scene.add(quad);
    quad.position.set(0, 0, 0.05);
    quad.renderOrder = 999;
    quad.material.depthTest = false;
    quad.material.depthWrite = false;
    state.quad = quad;

    renderFrame();
}

function controls(rotate = true, pan = true) {
    const dom = state.renderer.domElement;
    const c = state.controls; // shorthand

    let lastPinchDist = null;

    // --- Mouse controls ---
    dom.addEventListener('mousedown', e => {
        c.dragging = true;
        c.lastMouse.x = e.clientX;
        c.lastMouse.y = e.clientY;
        c.dragMode = e.button === 0 ? 'rotate' : e.button === 2 ? 'pan' : null;
    });
    window.addEventListener('mouseup', () => c.dragging = false);
    window.addEventListener('mousemove', e => {
        if (!c.dragging || !c.dragMode) return;
        const dx = e.clientX - c.lastMouse.x;
        const dy = e.clientY - c.lastMouse.y;
        handleDrag(dx, dy, rotate, pan);
        c.lastMouse.x = e.clientX;
        c.lastMouse.y = e.clientY;
    });
    dom.addEventListener('wheel', e => {
        e.preventDefault();
        c.scrollModifier += e.deltaY * c.scrollSensitivity;
        state.uniforms.u_scrollModifier.value = c.scrollModifier;
    });

    // --- Touch controls ---
    dom.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
            c.dragging = true;
            c.dragMode = 'rotate';
            c.lastMouse.x = e.touches[0].clientX;
            c.lastMouse.y = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            c.dragging = true;
            c.dragMode = 'pan';
            lastPinchDist = distanceBetweenTouches(e.touches);
            const t0 = e.touches[0];
            const t1 = e.touches[1];
            c.lastMouse.x = (t0.clientX + t1.clientX) / 2;
            c.lastMouse.y = (t0.clientY + t1.clientY) / 2;
        }
    });
    dom.addEventListener('touchmove', e => {
        if (!c.dragging || !c.dragMode) return;
        e.preventDefault();

        if (e.touches.length === 1 && c.dragMode === 'rotate') {
            const dx = e.touches[0].clientX - c.lastMouse.x;
            const dy = e.touches[0].clientY - c.lastMouse.y;
            handleDrag(dx, dy, rotate, pan);
            c.lastMouse.x = e.touches[0].clientX;
            c.lastMouse.y = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            // Pan
            const t0 = e.touches[0];
            const t1 = e.touches[1];
            const cx = (t0.clientX + t1.clientX) / 2;
            const cy = (t0.clientY + t1.clientY) / 2;
            const dx = cx - c.lastMouse.x;
            const dy = cy - c.lastMouse.y;
            if (c.dragMode === 'pan') handleDrag(dx, dy, rotate, pan);
            c.lastMouse.x = cx;
            c.lastMouse.y = cy;

            // Pinch zoom
            const pinchDist = distanceBetweenTouches(e.touches);
            if (lastPinchDist != null) {
                const delta = lastPinchDist - pinchDist;
                c.scrollModifier += delta * c.scrollSensitivity * 1.5; // adjust factor if needed
                state.uniforms.u_scrollModifier.value = c.scrollModifier;
            }
            lastPinchDist = pinchDist;
        }
    });
    window.addEventListener('touchend', e => {
        if (e.touches.length === 0) {
            c.dragging = false;
            lastPinchDist = null;
        }
    });

    // Prevent context menu on right click
    dom.addEventListener('contextmenu', e => e.preventDefault());

    // --- Helper functions ---
    function handleDrag(dx, dy, rotate, pan) {
        if (c.dragMode === 'rotate' && rotate) {
            state.camera.rotation.y -= dx * c.rotationSensitivity;
            state.camera.rotation.x -= dy * c.rotationSensitivity;
            state.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, state.camera.rotation.x));
        } else if (c.dragMode === 'pan' && pan) {
            const forward = new THREE.Vector3();
            const right = new THREE.Vector3();
            const up = new THREE.Vector3();
            state.camera.getWorldDirection(forward);
            right.crossVectors(state.camera.up, forward).normalize();
            up.copy(state.camera.up).normalize();
            state.camera.position.addScaledVector(right, -dx * c.panSensitivity);
            state.camera.position.addScaledVector(up, dy * c.panSensitivity);
        }
    }

    function distanceBetweenTouches(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
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
    const width = container?.clientWidth ?? size?.width;
    let height = container?.clientHeight ?? size?.height;

    if (!width || !height) {
        return console.warn('Invalid container or size passed to resizeToContainer', { container, size });
    }

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    state.width = width;
    state.height = height;

    const devicePixels = window.devicePixelRatio;
    state.renderer.setPixelRatio(devicePixels);
    renderer.setSize(width, height);
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
    state.uniforms.u_time.value = state.clock.getElapsedTime();
    state.uniforms.u_camPos.value.copy(state.camera.position);
    state.uniforms.u_camRot.value.copy(state.camera.rotation);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
    state.quad.position.copy(state.camera.position).add(forward.multiplyScalar(1));
    state.quad.quaternion.copy(state.camera.quaternion);

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

    state.currentResolutionTarget = newRatio;
}
