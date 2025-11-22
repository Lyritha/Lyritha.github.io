import * as THREE from "three";

export class Viewer {
    constructor(container) {
        this.container = container;
        this.width = container?.clientWidth || 0;
        this.height = container?.clientHeight || 0;

        this.renderer = null;
        this.scene = null;
        this.camera = null;

        this.isAnimating = false;
        this.clock = new THREE.Clock();
        this.frames = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        this.currentResolutionTarget = 1;

        this.uniforms = {};
        this.resizeHandler = () => this.resize();

        window.addEventListener('resize', this.resizeHandler);
    }

    setContainer() {
        this.container.appendChild(this.renderer.domElement);
        requestAnimationFrame(() => this.resize());
    }

    resize() {
        if (!this.camera) return;
        const width = this.container?.clientWidth || this.width;
        const height = this.container?.clientHeight || this.height;

        this.width = width;
        this.height = height;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        if (this.uniforms?.u_resolution) {
            this.uniforms.u_resolution.value.set(this.width * window.devicePixelRatio, this.height * window.devicePixelRatio);
        }
    }

    updateDynamicResolution() {
        const ratio = window.devicePixelRatio;
        const targetFPS = 90;
        const minScale = 0.2;
        const maxScale = 1.0;

        let newRatio = this.currentResolutionTarget * (this.fps / targetFPS);
        newRatio = Math.max(ratio * minScale, Math.min(ratio * maxScale, newRatio));
        newRatio = Math.max(0.1, Math.min(1, newRatio));

        if (Math.abs(newRatio - this.currentResolutionTarget) > 0.1) {
            this.renderer.setPixelRatio(newRatio);
            if (this.uniforms?.u_resolution) {
                this.uniforms.u_resolution.value.set(this.width * newRatio, this.height * newRatio);
            }
        }

        this.currentResolutionTarget = newRatio;
    }

    enable() { this.isAnimating = true; }
    disable() { this.isAnimating = false; }

    canOpenViewer() {
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

            this.container.querySelectorAll(".gpu-warning").forEach(d => d.classList.add("active"));
            this.container.querySelectorAll(".gpu-warning ol").forEach(d =>
                d.dataset.browser !== browser ? d.remove() : (d.open = true)
            );
        }

        return result;
    }
}
