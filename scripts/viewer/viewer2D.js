import * as THREE from "three";
import { Viewer } from "./viewer.js";

export class Viewer2D extends Viewer {
    constructor(container, fragmentShader) {
        super(container);

        this.quad = null;
        this.fragmentShader = fragmentShader || this.defaultShader();
        this.initScene();
    }

    defaultShader() {
        return `
            precision highp float;
            uniform float u_time;
            uniform vec2 u_resolution;
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                gl_FragColor = vec4(uv.x, uv.y, 0.5 + 0.5*sin(u_time), 1.0);
            }
        `;
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.001, 60);
        this.camera.position.set(0, 0, -3);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.setContainer();

        this.uniforms = {
            u_time: { value: 0.0 },
            u_resolution: { value: new THREE.Vector2(this.width, this.height) },
            u_camPos: { value: this.camera.position.clone() },
            u_camRot: { value: this.camera.rotation.clone() },
            u_camNear: { value: this.camera.near },
            u_camFar: { value: this.camera.far },
            u_scrollModifier: { value: 1.0 }
        };

        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            fragmentShader: this.fragmentShader,
            uniforms: this.uniforms,
            depthTest: false,
            depthWrite: false
        });
        this.quad = new THREE.Mesh(geometry, material);
        this.scene.add(this.quad);

        this.renderFrame();
    }

    setShader(fragmentShader) {
        this.fragmentShader = fragmentShader;
        if (this.quad) {
            this.quad.material.fragmentShader = fragmentShader;
            this.quad.material.needsUpdate = true;
        }
    }

    renderFrame() {
        if (!this.isAnimating) return;
        requestAnimationFrame(() => this.renderFrame());

        this.uniforms.u_time.value = this.clock.getElapsedTime();
        this.uniforms.u_camPos.value.copy(this.camera.position);
        this.uniforms.u_camRot.value.copy(this.camera.rotation);

        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        this.quad.position.copy(this.camera.position).add(forward.multiplyScalar(1));
        this.quad.quaternion.copy(this.camera.quaternion);

        this.renderer.render(this.scene, this.camera);
    }
}
