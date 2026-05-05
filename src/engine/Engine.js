import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export default class Engine {
    constructor() {
        this.canvas = document.querySelector('#experience');
        this.scene = new THREE.Scene();
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupLenis();
        this.addEventListeners();
        
        this.clock = new THREE.Clock();
        this.tick = this.tick.bind(this);
        this.tick();
    }

    setupCamera() {
        // Perspective camera with FOV calculated for 1:1 pixel mapping at Z=600
        const perspective = 600;
        const fov = (180 * (2 * Math.atan(this.height / 2 / perspective))) / Math.PI;
        
        this.camera = new THREE.PerspectiveCamera(fov, this.width / this.height, 1, 2000);
        this.camera.position.set(0, 0, perspective);
        this.scene.add(this.camera);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x050505, 0); // Transparent so body background shows, or just dark
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x00F0FF, 1.5);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        const fillLight = new THREE.PointLight(0xff00ff, 1);
        fillLight.position.set(-5, -2, 2);
        this.scene.add(fillLight);
    }

    // Removed heavy post-processing for better performance

    setupLenis() {
        this.lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1.2,
        });

        this.lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            this.lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    }

    addEventListeners() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            const perspective = 600;
            this.camera.fov = (180 * (2 * Math.atan(this.height / 2 / perspective))) / Math.PI;
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(this.width, this.height);
        });
    }

    tick() {
        const elapsedTime = this.clock.getElapsedTime();
        if (this.onUpdate) this.onUpdate(elapsedTime);
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.tick);
    }
}
