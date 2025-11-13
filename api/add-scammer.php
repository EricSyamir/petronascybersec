<?php
/**
 * Add Scammer API
 * Allows adding new scammers to the database from incident reports
 */

header('Content-Type: application/json');
require_once '../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

// Validate required fields
$requiredFields = ['scam_type', 'description'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit;
    }
}

// Validate scam type
$validScamTypes = ['phishing', 'romance', 'investment', 'lottery', 'job', 'shopping', 'cryptocurrency', 'other'];
if (!in_array($input['scam_type'], $validScamTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid scam type']);
    exit;
}

// Validate threat level
$validThreatLevels = ['low', 'medium', 'high', 'critical'];
$threatLevel = $input['threat_level'] ?? 'medium';
if (!in_array($threatLevel, $validThreatLevels)) {
    $threatLevel = 'medium';
}

// Validate verification status
$validVerificationStatuses = ['unverified', 'pending', 'verified', 'false_positive'];
$verificationStatus = $input['verification_status'] ?? 'unverified';
if (!in_array($verificationStatus, $validVerificationStatuses)) {
    $verificationStatus = 'unverified';
}

try {
    // Check if scammer already exists (by email, phone, or website)
    $existingScammer = null;
    
    if (!empty($input['scammer_email'])) {
        $stmt = $pdo->prepare("SELECT id, report_count FROM scammer_database WHERE scammer_email = ? AND is_active = TRUE");
        $stmt->execute([$input['scammer_email']]);
        $existingScammer = $stmt->fetch();
    }
    
    if (!$existingScammer && !empty($input['scammer_phone'])) {
        $stmt = $pdo->prepare("SELECT id, report_count FROM scammer_database WHERE scammer_phone = ? AND is_active = TRUE");
        $stmt->execute([$input['scammer_phone']]);
        $existingScammer = $stmt->fetch();
    }
    
    if (!$existingScammer && !empty($input['scammer_website'])) {
        $stmt = $pdo->prepare("SELECT id, report_count FROM scammer_database WHERE scammer_website = ? AND is_active = TRUE");
        $stmt->execute([$input['scammer_website']]);
        $existingScammer = $stmt->fetch();
    }
    
    if ($existingScammer) {
        // Update existing scammer - increment report count and update last_updated
        $stmt = $pdo->prepare("
            UPDATE scammer_database 
            SET report_count = report_count + 1, 
                last_updated = NOW(),
                threat_level = CASE 
                    WHEN ? = 'critical' THEN 'critical'
                    WHEN ? = 'high' AND threat_level NOT IN ('critical') THEN 'high'
                    WHEN ? = 'medium' AND threat_level NOT IN ('critical', 'high') THEN 'medium'
                    ELSE threat_level
                END
            WHERE id = ?
        ");
        
        $stmt->execute([$threatLevel, $threatLevel, $threatLevel, $existingScammer['id']]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Existing scammer updated',
            'scammer_id' => $existingScammer['id'],
            'action' => 'updated',
            'new_report_count' => $existingScammer['report_count'] + 1
        ]);
        
    } else {
        // Insert new scammer
        $stmt = $pdo->prepare("
            INSERT INTO scammer_database (
                scammer_email, scammer_phone, scammer_website, scammer_social_media,
                scam_type, description, evidence_links, reported_by, report_source,
                verification_status, threat_level, location, report_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ");
        
        $socialMedia = null;
        if (!empty($input['scammer_social_media'])) {
            $socialMedia = is_string($input['scammer_social_media']) ? 
                $input['scammer_social_media'] : 
                json_encode($input['scammer_social_media']);
        }
        
        $evidenceLinks = null;
        if (!empty($input['evidence_links'])) {
            $evidenceLinks = is_string($input['evidence_links']) ? 
                $input['evidence_links'] : 
                json_encode($input['evidence_links']);
        }
        
        $stmt->execute([
            $input['scammer_email'] ?? null,
            $input['scammer_phone'] ?? null,
            $input['scammer_website'] ?? null,
            $socialMedia,
            $input['scam_type'],
            $input['description'],
            $evidenceLinks,
            $input['reported_by'] ?? 'Anonymous',
            $input['report_source'] ?? 'incident_report',
            $verificationStatus,
            $threatLevel,
            $input['location'] ?? null
        ]);
        
        $scammerId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'New scammer added to database',
            'scammer_id' => $scammerId,
            'action' => 'created'
        ]);
    }
    
} catch (Exception $e) {
    error_log("Add scammer error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
}
?>
