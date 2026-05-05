import * as THREE from 'three';

const vertexShader = `
uniform float uScrollVelocity;
varying vec2 vUv;
void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Liquid distortion based on scroll velocity
    float distortion = sin(pos.y * 0.05 + uScrollVelocity * 0.1) * uScrollVelocity * 0.5;
    pos.z += distortion;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform float uScrollVelocity;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    
    // RGB Shift based on scroll velocity
    float rOffset = uScrollVelocity * 0.001;
    float bOffset = -uScrollVelocity * 0.001;
    
    float r = texture2D(uTexture, uv + vec2(0.0, rOffset)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv + vec2(0.0, bOffset)).b;
    
    gl_FragColor = vec4(r, g, b, 1.0);
}
`;

export default class KineticImage {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.images = [];
        this.loader = new THREE.TextureLoader();
        
        this.init();
    }

    init() {
        // Find all DOM image containers
        const domContainers = document.querySelectorAll('.project-image');
        
        domContainers.forEach((container) => {
            const img = container.querySelector('img');
            const rect = container.getBoundingClientRect();
            
            // If rect width is 0 (shouldn't happen with aspect-ratio), fallback to 400
            const w = rect.width || 400;
            const h = rect.height || (400 * 4/3);
            
            const geometry = new THREE.PlaneGeometry(w, h, 64, 64);
            let material;

            if (img && img.src && img.src !== window.location.href) {
                const texture = this.loader.load(img.src);
                material = new THREE.ShaderMaterial({
                    vertexShader,
                    fragmentShader,
                    uniforms: {
                        uTexture: { value: texture },
                        uScrollVelocity: { value: 0 }
                    },
                    transparent: true
                });
            } else {
                // Fallback material for empty placeholders
                material = new THREE.MeshBasicMaterial({ 
                    color: 0xE5E5E5,
                    transparent: true,
                    opacity: 0.5
                });
            }
            
            const mesh = new THREE.Mesh(geometry, material);
            this.scene.add(mesh);
            
            this.images.push({
                domElement: container,
                mesh: mesh,
                material: material,
                bounds: { width: w, height: h }
            });
        });
    }

    update(time, scrollVelocity, scrollPosition) {
        this.images.forEach((imgObj) => {
            const rect = imgObj.domElement.getBoundingClientRect();
            
            if (rect.width === 0) return;

            // Map DOM pixel coordinates to WebGL coordinates
            // Screen center is (0,0) in WebGL
            const x = rect.left - window.innerWidth / 2 + rect.width / 2;
            const y = -rect.top + window.innerHeight / 2 - rect.height / 2;
            
            imgObj.mesh.position.set(x, y, 0);
            
            // Update scale if resized
            imgObj.mesh.scale.set(rect.width / imgObj.bounds.width, rect.height / imgObj.bounds.height, 1);
            
            // Apply smoothed scroll velocity for shaders
            if (imgObj.material.uniforms) {
                imgObj.material.uniforms.uScrollVelocity.value += (scrollVelocity - imgObj.material.uniforms.uScrollVelocity.value) * 0.1;
            }
        });
    }
}
