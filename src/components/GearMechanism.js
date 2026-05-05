import * as THREE from 'three';

export default class GearMechanism {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.gears = [];
        
        this.init();
    }

    init() {
        // Material for gears - metallic, dark, sleek
        const material = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.8,
            roughness: 0.3,
            wireframe: true, // Gives it a very techno/architectural look
            transparent: true,
            opacity: 0.15
        });

        // Create main gear
        this.createGear(material, 300, 40, 20, { x: -400, y: 0, z: -500 }, 1);
        
        // Create secondary gear interlocking
        this.createGear(material, 200, 30, 15, { x: 100, y: 250, z: -600 }, -1.5);
        
        // Create third gear
        this.createGear(material, 450, 50, 25, { x: 500, y: -300, z: -800 }, 0.5);
    }

    createGear(material, radius, tube, radialSegments, position, speedMultiplier) {
        // We use a TorusKnot to simulate a complex, aggressive mechanical gear structure
        const geometry = new THREE.TorusKnotGeometry(radius, tube, 100, radialSegments, 2, 3);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(position.x, position.y, position.z);
        this.scene.add(mesh);
        
        this.gears.push({
            mesh: mesh,
            speed: speedMultiplier,
            rotation: 0
        });
    }

    update(time, scrollVelocity) {
        // Gears rotate constantly but accelerate massively with scroll
        const baseRotationSpeed = 0.001;
        const scrollRotationSpeed = scrollVelocity * 0.0005;

        this.gears.forEach(gear => {
            gear.rotation += (baseRotationSpeed + scrollRotationSpeed) * gear.speed;
            gear.mesh.rotation.z = gear.rotation;
            
            // Add a slight wobble for realism
            gear.mesh.rotation.x = Math.sin(time * 0.5) * 0.1;
            gear.mesh.rotation.y = Math.cos(time * 0.3) * 0.1;
        });
    }
}
