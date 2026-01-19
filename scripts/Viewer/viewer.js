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

import * as THREE from "three";
import { SceneViewer2D } from "./ViewerTypes/SceneViewer2D.js";
import { SceneViewer3D } from "./ViewerTypes/SceneViewer3D.js";

const app = {
    renderer: null,
    modal: null,
    activeInstance: null,
    clock: new THREE.Clock(),

    isAnimating: false,
    frames: 0,
    fps: 0,
    lastTime: performance.now(),
    pixelRatioTarget: window.devicePixelRatio
};


export function init() {
    app.modal = document.getElementById("ViewerModal");

    // initialize renderer
    app.renderer = new THREE.WebGLRenderer({ antialias: true });
    app.renderer.outputColorSpace = THREE.SRGBColorSpace;
    app.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    app.renderer.shadowMap.enabled = true;

    initModalUI();
    initAnimationLoop();

    const viewers = document.querySelectorAll('[data-role="section-scene"]');
    viewers.forEach(el => {
        if (canOpenViewer(el)) {
            createViewer({ element: el });
        }
    });
}

class ViewerInstance {
    constructor(element, sceneData) {
        this.element = element;
        this.sceneData = sceneData;
        this.viewer = null;
        this.active = false;
        this.size = {
            width: 1,
            height: 1
        };
    }

    async enable() {
        if (this.active) return;

        this.active = true;
        app.isAnimating = true;
        app.activeInstance = this;

        if (!this.viewer) {
            this.viewer =
                this.sceneData.type === "ShaderToy"
                    ? new SceneViewer2D(app)
                    : new SceneViewer3D(app);

            await this.viewer.createScene(this.sceneData); // wait until done
        }

        setContainer(this.element);
        resizeToContainer(this.element);

        this.viewer.renderFrame(0);
    }

    disable() {
        this.active = false;

        if (app.activeInstance === this) {
            app.isAnimating = false;
            app.activeInstance = null;
        }
    }

    render(dt) {
        this.viewer?.renderFrame(dt);
    }
}

async function createViewer({ element }) {
    const target = element.closest("[data-page][data-section]");
    const sceneData = await GetSceneData(element);
    if (!sceneData) return;

    const instance = new ViewerInstance(element, sceneData);

    element.querySelector('[data-function="fullscreen"]')?.addEventListener("click", () => openModal(instance));
    element.querySelector('[data-function="toggle-anim"]')?.addEventListener("click", () => app.isAnimating = !app.isAnimating);


    if (target?.classList.contains("active")) {
        instance.enable();
        return;
    }

    if (target) {
        const observer = new MutationObserver(() => {
            if (target.classList.contains("active")) {
                instance.enable();
            } else {
                instance.disable();
            }
        });

        observer.observe(target, {
            attributes: true,
            attributeFilter: ["class"]
        });
    }
}

// modal UI
function initModalUI() {
    app.modal.querySelector('[data-function="close-fullscreen"]').addEventListener("click", closeModal);
    app.modal.querySelector('[data-function="toggle-anim"]')?.addEventListener("click", () => app.isAnimating = !app.isAnimating);

    document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) closeModal();
    });
}

function openModal(instance) {
    app.modal.classList.add("active");
    app.modal.requestFullscreen?.();

    setContainer(app.modal);
    resizeToContainer(app.modal);
}

function closeModal() {
    app.modal.classList.remove("active");

    if (app.activeInstance) {
        setContainer(app.activeInstance.element);
        resizeToContainer(app.activeInstance.element);
    }

    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

function initAnimationLoop() {
    function animate() {
        requestAnimationFrame(animate);

        if (!app.activeInstance) return;

        let dt = 0;
        if (app.isAnimating) dt = app.clock.getDelta();
        else app.clock.getDelta();

        dynamicResolution();

        app.activeInstance.render(dt);
    }

    animate();
}

function setContainer(container) {
    container.appendChild(app.renderer.domElement);
}

function resizeToContainer(container) {
    app.renderer.setSize(1, 1); // reset size to avoid issues when shrinking

    const instance = app.activeInstance;
    if (!instance) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;

    instance.size.width = w;
    instance.size.height = h;

    const viewer = instance.viewer;
    if (!viewer) return;

    viewer.camera.aspect = w / h;
    viewer.camera.updateProjectionMatrix();

    const devicePixels = window.devicePixelRatio;
    app.renderer.setSize(w, h);
    app.renderer.setPixelRatio(devicePixels);

    if (viewer?.camera?.isOrthographicCamera)
        viewer.uniforms.u_resolution.value.set(w * devicePixels, h * devicePixels);

    const dt = app.clock.getDelta();
    app.activeInstance.render(dt);
}

window.addEventListener("resize", () => {
    if (app.activeInstance) {
        resizeToContainer(
            document.fullscreenElement ? app.modal : app.activeInstance.element
        );
    }
});

function dynamicResolution() {
    const targetFPS = 90;
    const minScale = 0.3;
    const maxScale = 1.0;

    const now = performance.now();
    app.frames++;

    if (now >= app.lastTime + 1000) {
        app.fps = Math.round((app.frames * 1000) / (now - app.lastTime));
        app.frames = 0;
        app.lastTime = now;

        let newRatio = app.pixelRatioTarget * (app.fps / targetFPS);
        const base = window.devicePixelRatio;

        newRatio = Math.max(
            base * minScale,
            Math.min(base * maxScale, newRatio)
        );

        if (Math.abs(newRatio - app.pixelRatioTarget) > 0.1) {
            app.pixelRatioTarget = newRatio;
            app.renderer.setPixelRatio(newRatio);

            const instance = app.activeInstance;
            if (instance?.viewer?.uniforms?.u_resolution) {
                instance.viewer.uniforms.u_resolution.value.set(
                    instance.size.width * newRatio,
                    instance.size.height * newRatio
                );
            }
        }
    }
}

// utils
function canOpenViewer(element) {
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

async function GetSceneData(element) {
    const path = element.dataset.scene;
    if (!path) return null;

    try {
        const res = await fetch(path);
        return await res.json();
    } catch {
        return null;
    }
}
