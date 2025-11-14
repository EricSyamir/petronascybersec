<?php
// FAKE AUTHENTICATION - NO LOGIN REQUIRED
// All users are automatically logged in as "guest" with full access

// Always return true for logged in status
function isLoggedIn() {
    return true; // Everyone is always "logged in"
}

// Do nothing - no login required
function requireLogin() {
    // Set fake session variables if not already set
    if (!isset($_SESSION['user_id'])) {
        $_SESSION['user_id'] = 1;
        $_SESSION['username'] = 'guest';
        $_SESSION['email'] = 'guest@petronas.local';
        $_SESSION['user_role'] = 'admin'; // Give everyone admin access
        $_SESSION['organization'] = 'PETRONAS';
        $_SESSION['language'] = $_SESSION['language'] ?? 'en';
        $_SESSION['last_activity'] = time();
    }
    return true;
}

// Do nothing - everyone has all roles
function requireRole($allowedRoles) {
    requireLogin();
    return true;
}

// Fake login - always succeeds
function login($username, $password) {
    $_SESSION['user_id'] = 1;
    $_SESSION['username'] = $username ?: 'guest';
    $_SESSION['email'] = $username . '@petronas.local';
    $_SESSION['user_role'] = 'admin';
    $_SESSION['organization'] = 'PETRONAS';
    $_SESSION['language'] = 'en';
    $_SESSION['last_activity'] = time();
    return true;
}

// Fake logout - just clears and recreates session
function logout() {
    session_destroy();
    session_start();
}

// Fake registration - always succeeds
function register($userData) {
    return [
        'success' => true,
        'message' => 'Registration successful (fake data)',
        'user_id' => rand(1000, 9999)
    ];
}

// Fake language update
function updateUserLanguage($userId, $language) {
    $_SESSION['language'] = $language;
    return true;
}

// Return fake user data
function getCurrentUser() {
    return [
        'id' => $_SESSION['user_id'] ?? 1,
        'username' => $_SESSION['username'] ?? 'guest',
        'email' => $_SESSION['email'] ?? 'guest@petronas.local',
        'role' => $_SESSION['user_role'] ?? 'admin',
        'organization' => $_SESSION['organization'] ?? 'PETRONAS',
        'language_preference' => $_SESSION['language'] ?? 'en',
        'created_at' => date('Y-m-d H:i:s', strtotime('-30 days')),
        'last_login' => date('Y-m-d H:i:s'),
        'is_active' => true
    ];
}

// Everyone has all permissions
function hasPermission($permission) {
    return true;
}

// Fake audit log - does nothing
function logAudit($action, $tableName = null, $recordId = null, $oldValues = null, $newValues = null) {
    // Do nothing - no database to log to
    return true;
}

// CSRF Protection (kept for compatibility)
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Rate limiting (simplified - always allows)
function checkRateLimit($action, $limit = 60, $window = 3600) {
    // Simplified rate limiting - just track in session
    $key = $action;
    
    if (!isset($_SESSION['rate_limits'])) {
        $_SESSION['rate_limits'] = [];
    }
    
    $now = time();
    
    if (!isset($_SESSION['rate_limits'][$key])) {
        $_SESSION['rate_limits'][$key] = ['count' => 1, 'reset' => $now + $window];
        return true;
    }
    
    $data = $_SESSION['rate_limits'][$key];
    
    if ($now > $data['reset']) {
        $_SESSION['rate_limits'][$key] = ['count' => 1, 'reset' => $now + $window];
        return true;
    }
    
    if ($data['count'] >= $limit) {
        return false;
    }
    
    $_SESSION['rate_limits'][$key]['count']++;
    return true;
}

// Auto-login everyone on session start
requireLogin();
?>
