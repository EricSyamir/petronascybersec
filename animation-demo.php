<?php
session_start();
require_once 'config/database.php';
require_once 'includes/language.php';

$lang = getCurrentLanguage();
$translations = loadLanguage($lang);

// Get base path dynamically
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$scriptPath = dirname($_SERVER['SCRIPT_NAME']);
$basePath = rtrim($scriptPath, '/');
if ($basePath === '.' || $basePath === '') {
    $basePath = '';
} else {
    $basePath = '/' . ltrim($basePath, '/');
}
$baseUrl = $protocol . '://' . $host . $basePath;
?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Animation Demo - PETRONAS Cybercrime Platform</title>
    <link rel="stylesheet" href="assets/css/petronas-master.css">
</head>
<body>
    <header class="main-header">
        <nav class="navbar">
            <div class="nav-container">
                <div class="logo">
                    <img src="<?php echo $baseUrl; ?>/petronas.png" alt="PETRONAS" class="logo-img">
                    <span class="platform-name">Animation Demo</span>
                </div>
                <div class="nav-links">
                    <a href="index.php" class="nav-link">Back to Home</a>
                    <a href="deepfake-scanner.php" class="nav-link">Deepfake Scanner</a>
                    <a href="osint-monitor.php" class="nav-link">OSINT Monitor</a>
                    <a href="report-incident.php" class="nav-link">Report Incident</a>
                </div>
            </div>
        </nav>
    </header>

    <main class="main-content">
        <!-- Hero Animation Demo -->
        <section class="demo-section">
            <div class="container">
                <h2 class="demo-title">Hero Section Animations</h2>
                <div class="hero-section parallax" data-speed="0.5">
                    <div class="hero-content animate-on-scroll" data-animation="fadeIn">
                        <h1>Beautiful Professional Animations</h1>
                        <p>Powered by Anime.js - Smooth, Professional, and Elegant</p>
                        <div class="cta-buttons">
                            <button class="btn btn-primary">Primary Button</button>
                            <button class="btn btn-secondary">Secondary Button</button>
                            <button class="btn btn-outline">Outline Button</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Card Animations Demo -->
        <section class="demo-section">
            <div class="container">
                <h2 class="demo-title">Card and Stat Animations</h2>
                <div class="demo-grid">
                    <div class="stat-card tilt-effect animate-on-scroll" data-animation="fadeInUp">
                        <h3>1,234</h3>
                        <p>Animated Counter</p>
                    </div>
                    <div class="stat-card tilt-effect animate-on-scroll" data-animation="fadeInUp">
                        <h3>5,678</h3>
                        <p>Smooth Transitions</p>
                    </div>
                    <div class="stat-card tilt-effect animate-on-scroll" data-animation="fadeInUp">
                        <h3>9,012</h3>
                        <p>Professional Feel</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Form Animations Demo -->
        <section class="demo-section">
            <div class="container">
                <h2 class="demo-title">Form Input Animations</h2>
                <div class="demo-card demo-form-card">
                    <form class="ajax-form">
                        <div class="form-group floating-label-group">
                            <input type="text" class="form-input" placeholder=" " id="demo-name">
                            <label for="demo-name">Your Name</label>
                        </div>
                        <div class="form-group floating-label-group">
                            <input type="email" class="form-input" placeholder=" " id="demo-email">
                            <label for="demo-email">Email Address</label>
                        </div>
                        <div class="form-group floating-label-group">
                            <textarea class="form-textarea" placeholder=" " id="demo-message"></textarea>
                            <label for="demo-message">Your Message</label>
                        </div>
                        <button type="submit" class="btn btn-primary">Submit with Animation</button>
                    </form>
                </div>
            </div>
        </section>

        <!-- Notification Demo -->
        <section class="demo-section">
            <div class="container">
                <h2 class="demo-title">Notification Animations</h2>
                <div class="animation-controls">
                    <button class="btn btn-success" onclick="showNotification('Success notification!', 'success')">Show Success</button>
                    <button class="btn btn-info" onclick="showNotification('Info notification!', 'info')">Show Info</button>
                    <button class="btn btn-warning" onclick="showNotification('Warning notification!', 'warning')">Show Warning</button>
                    <button class="btn btn-danger" onclick="showNotification('Error notification!', 'error')">Show Error</button>
                </div>
            </div>
        </section>


        <!-- Scroll Animations Demo -->
        <section class="demo-section">
            <div class="container">
                <h2 class="demo-title">Scroll-Triggered Animations</h2>
                <p class="demo-subtitle">Scroll down to see elements animate into view</p>
                <div class="demo-grid">
                    <div class="demo-card animate-on-scroll" data-animation="fadeInLeft">
                        <h3>Fade In Left</h3>
                        <p>This card slides in from the left</p>
                    </div>
                    <div class="demo-card animate-on-scroll" data-animation="zoomIn">
                        <h3>Zoom In</h3>
                        <p>This card zooms in with a bounce</p>
                    </div>
                    <div class="demo-card animate-on-scroll" data-animation="fadeInRight">
                        <h3>Fade In Right</h3>
                        <p>This card slides in from the right</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Interactive Elements -->
        <section class="demo-section">
            <div class="container">
                <h2 class="demo-title">Interactive Hover Effects</h2>
                <div class="demo-grid">
                    <div class="link-card">
                        <h3>Hover Me!</h3>
                        <p>Watch the subtle shine effect and elevation</p>
                        <a href="#" class="btn btn-outline">Learn More</a>
                    </div>
                    <div class="link-card tilt-effect">
                        <h3>3D Tilt Effect</h3>
                        <p>Move your mouse over this card for a 3D tilt</p>
                        <a href="#" class="btn btn-outline">Explore</a>
                    </div>
                    <div class="link-card">
                        <h3>Professional Touch</h3>
                        <p>All animations are smooth and business-appropriate</p>
                        <a href="#" class="btn btn-outline">Discover</a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="main-footer">
        <div class="footer-content">
            <p>&copy; 2025 PETRONAS Cybercrime Platform - Animation Demo</p>
        </div>
    </footer>

    <script src="assets/js/anime.min.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/petronas-animations.js"></script>
    <script src="assets/js/language-toggle.js"></script>
    <script>
        // Demo-specific animations
        document.addEventListener('DOMContentLoaded', function() {
            // Animate demo title on load
            anime({
                targets: '.demo-title',
                translateY: [-30, 0],
                opacity: [0, 1],
                delay: anime.stagger(200),
                duration: 800,
                easing: 'easeOutExpo'
            });

            // Re-trigger animations for demo
            const demoButtons = document.querySelectorAll('.cta-buttons .btn');
            demoButtons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    anime({
                        targets: this,
                        scale: [1, 1.2, 1],
                        duration: 600,
                        easing: 'easeInOutQuad'
                    });
                });
            });
        });

        // Override form submission for demo
        document.querySelector('.ajax-form').addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Form submitted with beautiful animations!', 'success');
        });

        // Custom notification function for demo
        function showNotification(message, type) {
            if (window.PetronasAnimations) {
                window.PetronasAnimations.showNotification(message, type);
            } else {
                alert(message);
            }
        }
    </script>
</body>
</html>
