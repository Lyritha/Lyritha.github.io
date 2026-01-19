import * as THREE from "three";
import { SceneViewerBase } from "./SceneViewerBase.js";

export class SceneViewer2D extends SceneViewerBase {
    createScene(sceneData) {
        this.scene = new THREE.Scene();

        // --- Camera ---
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.001, 60);
        this.camera.position.set(0, 0, -3);
        this.camera.rotation.set(0, 0, 0);

        // --- Controls state ---
        this.controls = {
            dragging: false,
            lastMouse: { x: 0, y: 0 },
            rotationSensitivity: 0.005,
            scrollSensitivity: 0.0001,
            scrollModifier: 1.0
        };

        // --- Uniforms ---
        this.uniforms = {
            u_time: { value: 0 },
            u_resolution: { value: new THREE.Vector2() },
            u_camPos: { value: this.camera.position.clone() },
            u_camRot: { value: this.camera.rotation.clone() },
            u_camNear: { value: this.camera.near },
            u_camFar: { value: this.camera.far },
            u_scrollModifier: { value: 1.0 }
        };

        const material = new THREE.ShaderMaterial({
            fragmentShader: sceneData.shader,
            uniforms: this.uniforms,
            depthTest: false,
            depthWrite: false
        });

        const quad = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            material
        );

        quad.renderOrder = 999;

        this.scene.add(quad);
        this.quad = quad;

        this.initControls(true, false);
    }

    renderFrame(dt) {
        if (!this.scene || !this.camera) return; // safety

        // update time
        this.uniforms.u_time.value += dt;

        // copy camera uniforms
        this.uniforms.u_camPos.value.copy(this.camera.position);
        this.uniforms.u_camRot.value.copy(this.camera.rotation);

        // position quad 1 unit in front of camera
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        this.quad.position.copy(this.camera.position).add(forward.multiplyScalar(1));
        this.quad.quaternion.copy(this.camera.quaternion);

        // render
        this.app.renderer.render(this.scene, this.camera);
    }

    initControls(rotate = true, pan = false) {
        const dom = this.app.renderer.domElement;
        const c = this.controls;
        const camera = this.camera;
        const uniforms = this.uniforms;

        let lastPinchDist = null;

        // ---------- Mouse ----------
        dom.addEventListener("mousedown", e => {
            c.dragging = true;
            c.lastMouse.x = e.clientX;
            c.lastMouse.y = e.clientY;
            c.dragMode = e.button === 0 ? "rotate" : null;
        });

        window.addEventListener("mouseup", () => {
            c.dragging = false;
            c.dragMode = null;
        });

        window.addEventListener("mousemove", e => {
            if (!c.dragging || c.dragMode !== "rotate" || !rotate) return;

            const dx = e.clientX - c.lastMouse.x;
            const dy = e.clientY - c.lastMouse.y;

            camera.rotation.y -= dx * c.rotationSensitivity;
            camera.rotation.x -= dy * c.rotationSensitivity;

            // Clamp pitch
            camera.rotation.x = Math.max(
                -Math.PI / 2,
                Math.min(Math.PI / 2, camera.rotation.x)
            );

            c.lastMouse.x = e.clientX;
            c.lastMouse.y = e.clientY;
        });

        dom.addEventListener("wheel", e => {
            e.preventDefault();
            c.scrollModifier += e.deltaY * c.scrollSensitivity;
            c.scrollModifier = Math.max(0.1, c.scrollModifier);
            uniforms.u_scrollModifier.value = c.scrollModifier;
        }, { passive: false });

        // ---------- Touch ----------
        dom.addEventListener("touchstart", e => {
            if (e.touches.length === 1) {
                c.dragging = true;
                c.dragMode = "rotate";
                c.lastMouse.x = e.touches[0].clientX;
                c.lastMouse.y = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                lastPinchDist = distanceBetweenTouches(e.touches);
            }
        }, { passive: false });

        dom.addEventListener("touchmove", e => {
            if (!c.dragging) return;
            e.preventDefault();

            if (e.touches.length === 1 && c.dragMode === "rotate" && rotate) {
                const dx = e.touches[0].clientX - c.lastMouse.x;
                const dy = e.touches[0].clientY - c.lastMouse.y;

                camera.rotation.y -= dx * c.rotationSensitivity;
                camera.rotation.x -= dy * c.rotationSensitivity;

                camera.rotation.x = Math.max(
                    -Math.PI / 2,
                    Math.min(Math.PI / 2, camera.rotation.x)
                );

                c.lastMouse.x = e.touches[0].clientX;
                c.lastMouse.y = e.touches[0].clientY;
            }

            // Pinch zoom
            if (e.touches.length === 2) {
                const pinchDist = distanceBetweenTouches(e.touches);
                if (lastPinchDist !== null) {
                    const delta = lastPinchDist - pinchDist;
                    c.scrollModifier += delta * c.scrollSensitivity * 1.5;
                    c.scrollModifier = Math.max(0.1, c.scrollModifier);
                    uniforms.u_scrollModifier.value = c.scrollModifier;
                }
                lastPinchDist = pinchDist;
            }
        }, { passive: false });

        window.addEventListener("touchend", () => {
            c.dragging = false;
            c.dragMode = null;
            lastPinchDist = null;
        });

        dom.addEventListener("contextmenu", e => e.preventDefault());

        // ---------- Helpers ----------
        function distanceBetweenTouches(touches) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        }
    }

}