import * as THREE from 'three';

export default class VelocityEngine {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        
        this.particleCount = 2000;
        this.particles = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.particleCount * 3);
        this.velocities = new Float32Array(this.particleCount);
        
        this.init();
    }

    init() {
        for (let i = 0; i < this.particleCount; i++) {
            // Distribute particles in a long tunnel
            this.positions[i * 3] = (Math.random() - 0.5) * 2000; // x
            this.positions[i * 3 + 1] = (Math.random() - 0.5) * 2000; // y
            this.positions[i * 3 + 2] = (Math.random() - 0.5) * 4000 - 1000; // z
            
            // Base velocity
            this.velocities[i] = Math.random() * 2 + 1;
        }

        this.particles.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x00F0FF, // Neon blue
            size: 2,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particleSystem = new THREE.Points(this.particles, material);
        this.scene.add(this.particleSystem);
    }

    update(time, scrollVelocity) {
        const positions = this.particleSystem.geometry.attributes.position.array;
        
        // The speed is based on a constant forward movement + scroll velocity multiplier
        const baseSpeed = 2;
        const warpSpeed = baseSpeed + Math.abs(scrollVelocity) * 0.1;

        for (let i = 0; i < this.particleCount; i++) {
            // Move particles towards camera (positive Z)
            positions[i * 3 + 2] += this.velocities[i] * warpSpeed;

            // Reset particles that pass the camera
            if (positions[i * 3 + 2] > 600) {
                positions[i * 3 + 2] = -3000;
                positions[i * 3] = (Math.random() - 0.5) * 2000;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
            }
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        
        // Stretch particles based on speed for warp effect (simulated via stretching the geometry matrix or custom shader, but we'll stick to points for performance unless we use a shader)
        // A simple way to simulate speed is to increase the FOV or move the camera slightly, but we are keeping camera static for DOM alignment.
    }
}
