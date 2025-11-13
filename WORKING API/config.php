<?php
/**
 * SightEngine API Configuration
 * 
 * Replace these credentials with your actual SightEngine API credentials
 * You can get them from: https://sightengine.com/
 */

// SightEngine API Configuration
define('SIGHTENGINE_API_USER', '1931720966');
define('SIGHTENGINE_API_SECRET', 'Ey7EbcJMjAtQZDiD38xLtyXvJrqpCVmw');
define('SIGHTENGINE_API_URL', 'https://api.sightengine.com/1.0/check.json');

// Upload Configuration
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
define('UPLOAD_DIR', 'uploads/');

// Create upload directory if it doesn't exist
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>
