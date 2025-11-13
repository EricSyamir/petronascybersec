// Deepfake Scanner - Specific Animations
// Professional scanning and analysis animations

document.addEventListener('DOMContentLoaded', function() {
    // Scanner upload area animation
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
        // Pulse effect for upload area
        anime({
            targets: uploadArea,
            scale: [1, 1.02, 1],
            boxShadow: [
                '0 4px 12px rgba(0,0,0,0.1)',
                '0 8px 24px rgba(0,166,81,0.2)',
                '0 4px 12px rgba(0,0,0,0.1)'
            ],
            duration: 3000,
            loop: true,
            easing: 'easeInOutQuad'
        });

        // Hover effect
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            anime({
                targets: this,
                scale: 1.05,
                backgroundColor: 'rgba(0, 166, 81, 0.05)',
                borderColor: 'var(--petronas-green)',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });

        uploadArea.addEventListener('dragleave', function() {
            anime({
                targets: this,
                scale: 1,
                backgroundColor: 'transparent',
                borderColor: '#ddd',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    }

    // Scanning progress animation
    window.startScanAnimation = function() {
        const scanProgress = document.querySelector('.scan-progress');
        if (!scanProgress) return;

        // Create scanning wave effect
        const scanWave = document.createElement('div');
        scanWave.className = 'scan-wave';
        scanWave.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--petronas-green), transparent);
            opacity: 0;
        `;
        scanProgress.style.position = 'relative';
        scanProgress.appendChild(scanWave);

        anime({
            targets: scanWave,
            translateY: [0, scanProgress.offsetHeight],
            opacity: [0, 1, 0],
            duration: 2000,
            loop: true,
            easing: 'linear'
        });

        // Progress bar animation
        const progressBar = scanProgress.querySelector('.progress-bar');
        if (progressBar) {
            anime({
                targets: progressBar,
                width: '100%',
                duration: 30000,
                easing: 'easeInOutQuad',
                update: function(anim) {
                    const progress = Math.round(anim.progress);
                    progressBar.textContent = progress + '%';
                }
            });
        }
    };

    // Result animation
    window.showScanResult = function(isDeepfake, confidence) {
        const resultContainer = document.querySelector('.scan-result');
        if (!resultContainer) return;

        resultContainer.style.display = 'block';
        
        if (isDeepfake) {
            // Danger animation
            anime.timeline({
                easing: 'easeOutExpo'
            })
            .add({
                targets: resultContainer,
                scale: [0.8, 1.1, 1],
                backgroundColor: ['#fff', '#ffe6e6', '#fff'],
                duration: 800
            })
            .add({
                targets: '.result-icon',
                rotate: [0, 360],
                scale: [0, 1.2, 1],
                color: '#dc3545',
                duration: 600
            }, '-=400')
            .add({
                targets: '.confidence-meter',
                width: confidence + '%',
                backgroundColor: confidence > 80 ? '#dc3545' : '#ffc107',
                duration: 1000
            }, '-=200');
        } else {
            // Success animation
            anime.timeline({
                easing: 'easeOutBack'
            })
            .add({
                targets: resultContainer,
                scale: [0.9, 1],
                opacity: [0, 1],
                duration: 600
            })
            .add({
                targets: '.result-icon',
                scale: [0, 1],
                rotate: [180, 0],
                color: '#28a745',
                duration: 800
            }, '-=400')
            .add({
                targets: '.confidence-meter',
                width: confidence + '%',
                backgroundColor: '#28a745',
                duration: 1000
            }, '-=400');
        }
    };

    // Feature cards animation
    const featureCards = document.querySelectorAll('.scanner-feature');
    if (featureCards.length > 0) {
        anime({
            targets: featureCards,
            translateY: [30, 0],
            opacity: [0, 1],
            delay: anime.stagger(100, {start: 300}),
            duration: 800,
            easing: 'easeOutQuad'
        });
    }
});

// Public Dashboard - Specific Animations
document.addEventListener('DOMContentLoaded', function() {
    // Search bar animation
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        const searchInput = searchForm.querySelector('input[type="search"]');
        const searchButton = searchForm.querySelector('button[type="submit"]');

        // Focus animation
        searchInput?.addEventListener('focus', function() {
            anime({
                targets: searchForm,
                scale: [1, 1.02],
                boxShadow: '0 4px 20px rgba(0, 166, 81, 0.15)',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });

        searchInput?.addEventListener('blur', function() {
            anime({
                targets: searchForm,
                scale: 1,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });

        // Search button pulse
        searchButton?.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: [1, 1.1, 1],
                duration: 600,
                easing: 'easeInOutQuad'
            });
        });
    }

    // Scammer cards entrance
    const scammerCards = document.querySelectorAll('.scammer-card');
    if (scammerCards.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    entry.target.classList.add('animated');
                    
                    anime({
                        targets: entry.target,
                        translateX: index % 2 === 0 ? [-50, 0] : [50, 0],
                        opacity: [0, 1],
                        duration: 600,
                        delay: index * 50,
                        easing: 'easeOutQuad'
                    });

                    // Animate verification badge
                    const badge = entry.target.querySelector('.verification-badge');
                    if (badge) {
                        anime({
                            targets: badge,
                            scale: [0, 1.2, 1],
                            rotate: [0, 360],
                            duration: 800,
                            delay: 300,
                            easing: 'easeOutBack'
                        });
                    }
                }
            });
        }, { threshold: 0.1 });

        scammerCards.forEach(card => observer.observe(card));
    }

    // Modal animations
    const modal = document.querySelector('.scammer-modal');
    if (modal) {
        window.showScammerModal = function(scammerId) {
            modal.style.display = 'flex';
            
            anime.timeline({
                easing: 'easeOutExpo'
            })
            .add({
                targets: modal,
                opacity: [0, 1],
                duration: 300
            })
            .add({
                targets: '.modal-content',
                scale: [0.8, 1],
                translateY: [-50, 0],
                opacity: [0, 1],
                duration: 500
            }, '-=200')
            .add({
                targets: '.modal-header',
                translateX: [-20, 0],
                opacity: [0, 1],
                duration: 400
            }, '-=300')
            .add({
                targets: '.modal-body > *',
                translateY: [20, 0],
                opacity: [0, 1],
                delay: anime.stagger(50),
                duration: 400
            }, '-=200');
        };

        window.hideScammerModal = function() {
            anime.timeline({
                easing: 'easeInQuad'
            })
            .add({
                targets: '.modal-content',
                scale: [1, 0.8],
                opacity: [1, 0],
                duration: 300
            })
            .add({
                targets: modal,
                opacity: [1, 0],
                duration: 200,
                complete: () => modal.style.display = 'none'
            }, '-=100');
        };
    }

    // Filter animations
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all
            filterButtons.forEach(b => {
                if (b !== this) {
                    anime({
                        targets: b,
                        scale: 1,
                        backgroundColor: '#f0f0f0',
                        color: '#333',
                        duration: 200,
                        easing: 'easeOutQuad'
                    });
                }
            });

            // Add active to clicked
            anime({
                targets: this,
                scale: [1, 1.1, 1],
                backgroundColor: 'var(--petronas-green)',
                color: '#fff',
                duration: 300,
                easing: 'easeOutBack'
            });

            // Animate filtered results
            anime({
                targets: '.results-container',
                opacity: [1, 0, 1],
                duration: 500,
                easing: 'easeInOutQuad'
            });
        });
    });

    // Pagination animation
    const paginationLinks = document.querySelectorAll('.pagination a');
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.classList.contains('disabled')) {
                anime({
                    targets: '.results-container',
                    translateX: [0, -20, 0],
                    opacity: [1, 0.5, 1],
                    duration: 400,
                    easing: 'easeInOutQuad'
                });
            }
        });
    });

    // Stats counter animation for dashboard
    const statNumbers = document.querySelectorAll('.dashboard-stat-number');
    statNumbers.forEach(stat => {
        const value = parseInt(stat.textContent) || 0;
        stat.textContent = '0';
        
        anime({
            targets: { count: 0 },
            count: value,
            round: 1,
            duration: 2000,
            delay: 500,
            easing: 'easeOutExpo',
            update: function(anim) {
                stat.textContent = Math.floor(anim.animations[0].currentValue).toLocaleString();
            }
        });
    });
});
