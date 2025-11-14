/**
 * ============================================================
 * PETRONAS CYBERSECURITY PLATFORM - FUTURISTIC ANIMATIONS
 * Ultimate animation library powered by Anime.js
 * Featuring energy waves, holographic particles, and cyber effects
 * ============================================================
 */

(function() {
    'use strict';

    // Ensure Anime.js is loaded
    if (typeof anime === 'undefined') {
        console.warn('Anime.js is not loaded. Animations may not work properly.');
        return;
    }

    /**
     * PETRONAS Animations Namespace
     */
    window.PetronasAnimations = {
        
        /**
         * Initialize all animations on page load
         */
        init: function() {
            this.initHeaderAnimations();
            this.initScrollAnimations();
            this.initHeroAnimations();
            this.initParticleEffects();
            this.initHolographicElements();
            this.initButtonEffects();
            this.initCardAnimations();
            this.initCounterAnimations();
            this.initFormAnimations();
        },

        /**
         * Header Navigation Animations with Cyber Scan Effect
         */
        initHeaderAnimations: function() {
            const header = document.querySelector('.main-header');
            if (!header) return;

            // Fade in header on load
            anime({
                targets: header,
                opacity: [0, 1],
                translateY: [-50, 0],
                duration: 800,
                easing: 'easeOutExpo'
            });

            // Animate nav links sequentially
            anime({
                targets: '.nav-link',
                opacity: [0, 1],
                translateY: [-20, 0],
                delay: anime.stagger(100, {start: 500}),
                duration: 600,
                easing: 'easeOutExpo'
            });

            // Logo pulse effect
            anime({
                targets: '.logo-img',
                scale: [1, 1.05, 1],
                filter: [
                    'drop-shadow(0 0 10px rgba(0, 161, 156, 0.5))',
                    'drop-shadow(0 0 25px rgba(0, 161, 156, 0.8))',
                    'drop-shadow(0 0 10px rgba(0, 161, 156, 0.5))'
                ],
                duration: 3000,
                easing: 'easeInOutQuad',
                loop: true
            });

            // Scrolled header effect
            let lastScroll = 0;
            window.addEventListener('scroll', function() {
                const currentScroll = window.pageYOffset;
                if (currentScroll > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                lastScroll = currentScroll;
            });
        },

        /**
         * Floating Holographic Data Particles
         * Creates animated data nodes that float across the screen
         */
        initParticleEffects: function() {
            const heroSection = document.querySelector('.hero-section');
            if (!heroSection) return;

            // Create particle container
            const particleContainer = document.createElement('div');
            particleContainer.className = 'cyber-particles';
            particleContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                pointer-events: none;
                z-index: 1;
            `;
            heroSection.appendChild(particleContainer);

            // Generate particles
            const particleCount = 20;
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'data-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: ${Math.random() * 8 + 4}px;
                    height: ${Math.random() * 8 + 4}px;
                    background: rgba(0, 161, 156, ${Math.random() * 0.5 + 0.3});
                    border-radius: 50%;
                    box-shadow: 0 0 ${Math.random() * 15 + 10}px rgba(0, 161, 156, 0.6);
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                `;
                particleContainer.appendChild(particle);

                // Animate particles with energy flow
                anime({
                    targets: particle,
                    translateY: [
                        {value: anime.random(-100, 100), duration: anime.random(3000, 6000)},
                        {value: anime.random(-100, 100), duration: anime.random(3000, 6000)}
                    ],
                    translateX: [
                        {value: anime.random(-100, 100), duration: anime.random(3000, 6000)},
                        {value: anime.random(-100, 100), duration: anime.random(3000, 6000)}
                    ],
                    opacity: [
                        {value: Math.random() * 0.5 + 0.3, duration: anime.random(1000, 2000)},
                        {value: Math.random() * 0.5 + 0.3, duration: anime.random(1000, 2000)}
                    ],
                    scale: [
                        {value: Math.random() * 0.5 + 0.8, duration: anime.random(2000, 4000)},
                        {value: Math.random() * 0.5 + 0.8, duration: anime.random(2000, 4000)}
                    ],
                    easing: 'easeInOutSine',
                    loop: true,
                    direction: 'alternate'
                });
            }
        },

        /**
         * Energy Wave Effect for Hero Section
         * Creates flowing energy waves that symbolize digital protection
         */
        initHeroAnimations: function() {
            const heroContent = document.querySelector('.hero-content');
            if (!heroContent) return;

            // Hero content fade-in with scale
            anime({
                targets: heroContent,
                opacity: [0, 1],
                scale: [0.95, 1],
                duration: 1200,
                easing: 'easeOutExpo',
                delay: 300
            });

            // Title shimmer effect
            anime({
                targets: '.hero-content h1',
                opacity: [0, 1],
                translateY: [-50, 0],
                duration: 1000,
                easing: 'easeOutExpo',
                delay: 500
            });

            // Subtitle wave effect
            anime({
                targets: '.hero-content p',
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 1000,
                easing: 'easeOutExpo',
                delay: 700
            });

            // CTA buttons with stagger effect
            anime({
                targets: '.cta-buttons .btn',
                opacity: [0, 1],
                scale: [0.8, 1],
                translateY: [40, 0],
                delay: anime.stagger(150, {start: 900}),
                duration: 800,
                easing: 'easeOutElastic(1, .6)'
            });
        },

        /**
         * Holographic Card Elements
         * Adds interactive 3D tilt and holographic shimmer effects
         */
        initHolographicElements: function() {
            const cards = document.querySelectorAll('.tilt-effect');
            
            cards.forEach(card => {
                card.addEventListener('mousemove', function(e) {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / 20;
                    const rotateY = (centerX - x) / 20;
                    
                    anime({
                        targets: card,
                        rotateX: rotateX,
                        rotateY: rotateY,
                        duration: 300,
                        easing: 'easeOutQuad'
                    });
                });
                
                card.addEventListener('mouseleave', function() {
                    anime({
                        targets: card,
                        rotateX: 0,
                        rotateY: 0,
                        duration: 600,
                        easing: 'easeOutExpo'
                    });
                });
            });
        },

        /**
         * Scroll-Triggered Animations
         * Elements animate into view as user scrolls
         */
        initScrollAnimations: function() {
            const animatedElements = document.querySelectorAll('.animate-on-scroll');
            
            const observerOptions = {
                threshold: 0.2,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                        const animationType = entry.target.dataset.animation || 'fadeInUp';
                        this.triggerAnimation(entry.target, animationType);
                        entry.target.classList.add('animated');
                    }
                });
            }, observerOptions);
            
            animatedElements.forEach(el => observer.observe(el));
        },

        /**
         * Trigger specific animation type
         */
        triggerAnimation: function(element, type) {
            const animations = {
                fadeIn: {
                    opacity: [0, 1],
                    duration: 800,
                    easing: 'easeOutQuad'
                },
                fadeInUp: {
                    opacity: [0, 1],
                    translateY: [50, 0],
                    duration: 800,
                    easing: 'easeOutExpo'
                },
                fadeInDown: {
                    opacity: [0, 1],
                    translateY: [-50, 0],
                    duration: 800,
                    easing: 'easeOutExpo'
                },
                fadeInLeft: {
                    opacity: [0, 1],
                    translateX: [-60, 0],
                    duration: 800,
                    easing: 'easeOutExpo'
                },
                fadeInRight: {
                    opacity: [0, 1],
                    translateX: [60, 0],
                    duration: 800,
                    easing: 'easeOutExpo'
                },
                zoomIn: {
                    opacity: [0, 1],
                    scale: [0.8, 1],
                    duration: 800,
                    easing: 'easeOutElastic(1, .6)'
                },
                slideIn: {
                    opacity: [0, 1],
                    translateX: [-100, 0],
                    duration: 1000,
                    easing: 'easeOutExpo'
                }
            };
            
            const config = animations[type] || animations.fadeInUp;
            anime({
                targets: element,
                ...config
            });
        },

        /**
         * Enhanced Button Interactions
         * Liquid metal ripple effect
         */
        initButtonEffects: function() {
            const buttons = document.querySelectorAll('.btn');
            
            buttons.forEach(btn => {
                // Hover animation
                btn.addEventListener('mouseenter', function() {
                    anime({
                        targets: this,
                        scale: 1.05,
                        duration: 300,
                        easing: 'easeOutQuad'
                    });
                });
                
                btn.addEventListener('mouseleave', function() {
                    anime({
                        targets: this,
                        scale: 1,
                        duration: 400,
                        easing: 'easeOutExpo'
                    });
                });
                
                // Click ripple effect
                btn.addEventListener('click', function(e) {
                    const ripple = document.createElement('span');
                    ripple.style.cssText = `
                        position: absolute;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.6);
                        width: 20px;
                        height: 20px;
                        left: ${e.offsetX - 10}px;
                        top: ${e.offsetY - 10}px;
                        pointer-events: none;
                    `;
                    this.appendChild(ripple);
                    
                    anime({
                        targets: ripple,
                        scale: [1, 20],
                        opacity: [0.6, 0],
                        duration: 800,
                        easing: 'easeOutExpo',
                        complete: () => ripple.remove()
                    });
                });
            });
        },

        /**
         * Card Entrance Animations
         */
        initCardAnimations: function() {
            const cards = document.querySelectorAll('.card, .stat-card, .link-card');
            
            anime({
                targets: cards,
                opacity: [0, 1],
                translateY: [40, 0],
                scale: [0.95, 1],
                delay: anime.stagger(100, {start: 300}),
                duration: 800,
                easing: 'easeOutExpo'
            });
        },

        /**
         * Animated Number Counters
         * Counts up numbers with smooth animation
         */
        initCounterAnimations: function() {
            const counters = document.querySelectorAll('.stat-card h3');
            
            counters.forEach(counter => {
                const target = parseInt(counter.textContent.replace(/,/g, ''));
                if (isNaN(target)) return;
                
                const obj = { val: 0 };
                anime({
                    targets: obj,
                    val: target,
                    duration: 2000,
                    easing: 'easeOutExpo',
                    round: 1,
                    update: function() {
                        counter.textContent = obj.val.toLocaleString();
                    }
                });
            });
        },

        /**
         * Form Input Focus Animations
         */
        initFormAnimations: function() {
            const inputs = document.querySelectorAll('.form-input, .form-textarea');
            
            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    anime({
                        targets: this,
                        scale: [1, 1.02, 1],
                        duration: 400,
                        easing: 'easeOutQuad'
                    });
                });
            });
        },


        /**
         * Show Notification Toast
         */
        showNotification: function(message, type = 'info', duration = 4000) {
            const notification = document.createElement('div');
            notification.className = `animated-notification notification-${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: -400px;
                min-width: 300px;
                max-width: 500px;
                padding: 1rem 1.5rem;
                background: rgba(0, 31, 63, 0.95);
                border: 2px solid var(--petronas-teal);
                border-radius: 12px;
                box-shadow: 0 0 30px rgba(0, 161, 156, 0.4);
                color: white;
                z-index: 100000;
                backdrop-filter: blur(10px);
            `;
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="notification-icon" style="font-size: 1.5rem;">
                        ${type === 'success' ? '✓' : type === 'warning' ? '⚠' : type === 'error' ? '✕' : 'ℹ'}
                    </div>
                    <div style="flex: 1;">${message}</div>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--petronas-teal); cursor: pointer; font-size: 1.5rem;">&times;</button>
                </div>
            `;
            document.body.appendChild(notification);
            
            // Slide in
            anime({
                targets: notification,
                right: ['-400px', '20px'],
                duration: 600,
                easing: 'easeOutExpo'
            });
            
            // Auto hide
            setTimeout(() => {
                anime({
                    targets: notification,
                    right: ['20px', '-400px'],
                    opacity: [1, 0],
                    duration: 600,
                    easing: 'easeInExpo',
                    complete: () => notification.remove()
                });
            }, duration);
        },

        /**
         * Modal Show Animation
         */
        showModal: function(modalElement) {
            if (!modalElement) return;
            
            modalElement.style.display = 'flex';
            
            anime({
                targets: modalElement,
                opacity: [0, 1],
                duration: 300,
                easing: 'easeOutQuad'
            });
            
            anime({
                targets: modalElement.querySelector('.modal-content'),
                scale: [0.8, 1],
                opacity: [0, 1],
                duration: 600,
                easing: 'easeOutElastic(1, .6)'
            });
        },

        /**
         * Modal Hide Animation
         */
        hideModal: function(modalElement) {
            if (!modalElement) return;
            
            anime({
                targets: modalElement.querySelector('.modal-content'),
                scale: [1, 0.8],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuad'
            });
            
            anime({
                targets: modalElement,
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuad',
                delay: 100,
                complete: () => modalElement.style.display = 'none'
            });
        },

        /**
         * Cyber Glitch Effect (for error states or emphasis)
         */
        glitchEffect: function(element) {
            anime.timeline({
                targets: element,
                easing: 'easeInOutQuad',
                duration: 100
            })
            .add({
                translateX: [0, -10, 10, -10, 10, 0],
                opacity: [1, 0.8, 1, 0.8, 1, 1]
            })
            .add({
                filter: [
                    'hue-rotate(0deg)',
                    'hue-rotate(90deg)',
                    'hue-rotate(-90deg)',
                    'hue-rotate(0deg)'
                ]
            }, 0);
        }
    };

    /**
     * Initialize on DOM Ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            PetronasAnimations.init();
        });
    } else {
        PetronasAnimations.init();
    }

    /**
     * Export for global use
     */
    window.PetronasAnim = PetronasAnimations;

})();

/**
 * ============================================================
 * END OF PETRONAS ANIMATIONS
 * Futuristic, professional, and cyber-intelligent
 * ============================================================
 */
