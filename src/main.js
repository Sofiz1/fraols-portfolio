import Engine from './engine/Engine.js';
import VelocityEngine from './components/VelocityEngine.js';
import GearMechanism from './components/GearMechanism.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

class App {
    constructor() {
        this.engine = new Engine();
        this.init();
    }

    async init() {
        // Initialize Techno WebGL elements
        this.velocityEngine = new VelocityEngine(this.engine);
        this.gears = new GearMechanism(this.engine);

        // Setup UI animations
        this.setupReveals();
        this.setupCursor();
        this.setupSplashScreen();
        this.setupMobileMenu();

        // Nav Glassmorphism Logic
        const nav = document.querySelector('nav');

        // Update loop
        this.engine.onUpdate = (time) => {
            const scroll = this.engine.lenis.scroll;
            const velocity = this.engine.lenis.velocity;
            
            this.velocityEngine.update(time, velocity);
            this.gears.update(time, velocity);

            // Toggle Nav glassmorphism
            if (scroll > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            // Toggle Background SVG (hide in hero section)
            const bgSvg = document.querySelector('.bg-cycle-svg');
            if (bgSvg) {
                if (scroll > window.innerHeight * 0.5) {
                    bgSvg.classList.add('active');
                } else {
                    bgSvg.classList.remove('active');
                }
            }
        };
    }

    setupSplashScreen() {
        const splash = document.getElementById('splash');
        if (!splash) return;
        
        const loaderProgress = document.querySelector('.loading-progress');
        const glitchTexts = document.querySelectorAll('.glitch-text');
        
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(splash, {
                    yPercent: -100,
                    duration: 1.5,
                    ease: 'power4.inOut',
                    onComplete: () => splash.remove()
                });
            }
        });

        // Fake loading progress
        tl.to(loaderProgress, {
            width: '100%',
            duration: 2,
            ease: 'power2.inOut'
        }, 0);

        // Glitch text sequence
        glitchTexts.forEach((text, i) => {
            tl.to(text, {
                color: '#F5F5F7',
                webkitTextStroke: '0px',
                duration: 0.1,
                yoyo: true,
                repeat: 3
            }, i * 0.5);
            
            tl.to(text, {
                color: 'transparent',
                webkitTextStroke: '1px rgba(255,255,255,0.1)',
                duration: 0.1
            }, "+=0.2");
        });
    }

    setupMobileMenu() {
        const burger = document.querySelector('.bike-burger');
        const icon = document.querySelector('.bike-icon');
        const menu = document.querySelector('.mobile-menu');
        const links = document.querySelectorAll('.mobile-link');

        if (!burger) return;

        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            menu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        links.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                menu.classList.remove('active');
            });
        });
    }

    setupCursor() {
        const cursor = document.querySelector('.cursor');
        const cursorFollower = document.querySelector('.cursor-follower');

        document.addEventListener('mousemove', (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0 });
            gsap.to(cursorFollower, { x: e.clientX, y: e.clientY, duration: 0.15 });
        });

        const interactables = document.querySelectorAll('a, .cinematic-card');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => cursorFollower.classList.add('active'));
            el.addEventListener('mouseleave', () => cursorFollower.classList.remove('active'));
        });
    }

    setupReveals() {
        // Hero Text Parallax
        gsap.to('.hero-text', {
            scrollTrigger: {
                trigger: '.hero-cinematic',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: 150,
            opacity: 0
        });

        // Hero Image Parallax
        gsap.to('.hero-image img', {
            scrollTrigger: {
                trigger: '.hero-cinematic',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            y: -100,
            scale: 1.1
        });

        // Slice reveals for cinematic images
        const sliceImages = document.querySelectorAll('.reveal-slice');
        sliceImages.forEach(container => {
            const img = container.querySelector('img');
            
            // Start state setup
            gsap.set(container, { clipPath: 'inset(100% 0 0 0)' });
            gsap.set(img, { scale: 1.5, y: 50 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    start: 'top 85%',
                    end: 'bottom 15%',
                    toggleActions: 'play reverse play reverse' // Play in, reverse out
                }
            });

            tl.to(container, {
                clipPath: 'inset(0% 0 0 0)',
                duration: 1.2,
                ease: 'power3.inOut'
            }, 0)
            .to(img, {
                scale: 1,
                y: 0,
                duration: 1.2,
                ease: 'power3.inOut'
            }, 0);
        });

        // Text reveals
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(el => {
            gsap.fromTo(el, 
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 90%',
                        end: 'bottom 10%',
                        toggleActions: 'play reverse play reverse'
                    }
                }
            );
        });
    }
}

new App();
