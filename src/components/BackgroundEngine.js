import * as THREE from 'three';
import gsap from 'gsap';

export default class BackgroundEngine {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.planes = [];
        this.init();
    }

    init() {
        this.objects = [];
        
        // Complex Glass Material
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 1.0,
            thickness: 1.5,
            ior: 1.5,
            transparent: true,
            opacity: 1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            side: THREE.DoubleSide
        });

        // Matte Accent Material
        const accentMaterial = new THREE.MeshStandardMaterial({
            color: 0xC5A059, // Champagne Gold
            roughness: 0.3,
            metalness: 0.8
        });

        // Background Plaster Material
        const plasterMaterial = new THREE.MeshStandardMaterial({
            color: 0xFBFBFB,
            roughness: 0.9,
            metalness: 0.0
        });

        const geometries = [
            new THREE.TorusGeometry(3, 0.8, 32, 100),
            new THREE.IcosahedronGeometry(2, 0),
            new THREE.CylinderGeometry(1, 1, 8, 32),
            new THREE.SphereGeometry(1.5, 64, 64)
        ];

        // Create main sculptural centerpiece
        const centerPiece = new THREE.Mesh(geometries[0], glassMaterial);
        centerPiece.position.set(2, 0, -5);
        centerPiece.rotation.set(Math.PI / 4, Math.PI / 4, 0);
        this.scene.add(centerPiece);
        this.objects.push({ mesh: centerPiece, speedX: 0.002, speedY: 0.003, floatSpeed: 0.5 });

        // Add floating accents
        for (let i = 0; i < 5; i++) {
            const isAccent = Math.random() > 0.7;
            const geo = geometries[Math.floor(Math.random() * geometries.length)];
            const mat = isAccent ? accentMaterial : glassMaterial;
            const mesh = new THREE.Mesh(geo, mat);
            
            mesh.position.set(
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 15,
                -Math.random() * 10 - 2
            );
            
            // Random initial rotation
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            
            // Scale variation
            const scale = 0.3 + Math.random() * 0.8;
            mesh.scale.set(scale, scale, scale);

            mesh.castShadow = true;
            mesh.receiveShadow = true;

            this.scene.add(mesh);
            this.objects.push({ 
                mesh, 
                speedX: (Math.random() - 0.5) * 0.005, 
                speedY: (Math.random() - 0.5) * 0.005,
                floatSpeed: 0.2 + Math.random() * 0.8,
                initialY: mesh.position.y
            });
        }
    }

    update(time, scroll) {
        this.objects.forEach((obj, i) => {
            // Continuous rotation
            obj.mesh.rotation.x += obj.speedX;
            obj.mesh.rotation.y += obj.speedY;
            
            // Floating motion combined with scroll parallax
            // Different layers move at different parallax speeds based on Z depth
            const parallaxFactor = Math.abs(obj.mesh.position.z) * 0.0005;
            const floatOffset = Math.sin(time * obj.floatSpeed + i) * 0.5;
            
            obj.mesh.position.y = obj.initialY + floatOffset - scroll * parallaxFactor;
        });
    }
}
