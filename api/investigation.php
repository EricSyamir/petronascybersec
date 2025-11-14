<?php
require_once '../config/database.php';
require_once '../includes/auth.php';

/**
 * Investigation API Endpoint - FAKE VERSION
 * Returns fake data without database operations
 */

class InvestigationAPI {
    private $fake_cases = [];
    
    public function __construct() {
        // Initialize with fake cases
        $this->fake_cases = [
            [
                'id' => 1,
                'case_number' => 'CASE-202411-0001',
                'title' => 'Phishing Campaign Investigation',
                'description' => 'Investigating widespread phishing emails targeting bank customers.',
                'status' => 'in_progress',
                'priority' => 'high',
                'assigned_to' => 1,
                'assigned_username' => 'investigator',
                'created_by' => 1,
                'created_username' => 'admin',
                'created_at' => date('Y-m-d H:i:s', strtotime('-5 days')),
                'updated_at' => date('Y-m-d H:i:s', strtotime('-1 hour')),
                'evidence_count' => 8,
                'notes_count' => 12
            ],
            [
                'id' => 2,
                'case_number' => 'CASE-202411-0002',
                'title' => 'Cryptocurrency Scam Ring',
                'description' => 'Multiple victims reporting investment fraud through fake crypto platform.',
                'status' => 'open',
                'priority' => 'critical',
                'assigned_to' => 2,
                'assigned_username' => 'admin',
                'created_by' => 1,
                'created_username' => 'investigator',
                'created_at' => date('Y-m-d H:i:s', strtotime('-2 days')),
                'updated_at' => date('Y-m-d H:i:s', strtotime('-30 minutes')),
                'evidence_count' => 15,
                'notes_count' => 7
            ]
        ];
    }
    
    private function generateCaseNumber() {
        $year = date('Y');
        $month = date('m');
        $num = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        return 'CASE-' . $year . $month . '-' . $num;
    }
    
    public function createCase($data) {
        $caseNumber = $this->generateCaseNumber();
        $caseId = count($this->fake_cases) + 1;
        
        return [
            'success' => true,
            'case_id' => $caseId,
            'case_number' => $caseNumber,
            'message' => 'Case created successfully (fake data)'
        ];
    }
    
    public function getCases($filters = []) {
        return $this->fake_cases;
    }
    
    public function getCase($caseId) {
        foreach ($this->fake_cases as $case) {
            if ($case['id'] == $caseId) {
                return $case;
            }
        }
        return null;
    }
    
    public function saveQuery($data) {
        return [
            'success' => true,
            'query_id' => rand(1000, 9999),
            'message' => 'Query saved successfully (fake data)'
        ];
    }
    
    public function getQueries($caseId = null) {
        return [
            [
                'id' => 1,
                'case_id' => $caseId,
                'investigator_id' => 1,
                'query_type' => 'semak_mule',
                'query_params' => json_encode(['phone' => '0123456789']),
                'results' => json_encode(['found' => true, 'reports' => 3]),
                'notes' => 'Suspect phone number found in database',
                'created_at' => date('Y-m-d H:i:s', strtotime('-1 day'))
            ]
        ];
    }
    
    public function addEvidence($caseId, $data) {
        return [
            'success' => true,
            'evidence_id' => rand(1000, 9999),
            'message' => 'Evidence added successfully (fake data)'
        ];
    }
    
    public function getEvidence($caseId) {
        return [
            [
                'id' => 1,
                'case_id' => $caseId,
                'evidence_type' => 'osint_result',
                'title' => 'Social Media Profile Analysis',
                'description' => 'Found matching profile on Facebook',
                'content' => json_encode(['platform' => 'facebook', 'profile_url' => 'https://facebook.com/example']),
                'added_by' => 1,
                'added_by_username' => 'investigator',
                'created_at' => date('Y-m-d H:i:s', strtotime('-2 days'))
            ]
        ];
    }
    
    public function addNote($caseId, $noteText, $isPrivate = false) {
        return [
            'success' => true,
            'note_id' => rand(1000, 9999),
            'message' => 'Note added successfully (fake data)'
        ];
    }
    
    public function getNotes($caseId) {
        return [
            [
                'id' => 1,
                'case_id' => $caseId,
                'investigator_id' => 1,
                'investigator_username' => 'investigator',
                'note_text' => 'Initial investigation shows suspicious bank transactions.',
                'is_private' => false,
                'created_at' => date('Y-m-d H:i:s', strtotime('-1 day')),
                'updated_at' => date('Y-m-d H:i:s', strtotime('-1 day'))
            ]
        ];
    }
    
    public function getTimeline($caseId) {
        return [
            [
                'id' => 1,
                'case_id' => $caseId,
                'event_type' => 'case_created',
                'event_description' => 'Case created',
                'user_id' => 1,
                'user_username' => 'admin',
                'metadata' => json_encode(['case_number' => 'CASE-202411-0001']),
                'created_at' => date('Y-m-d H:i:s', strtotime('-3 days'))
            ],
            [
                'id' => 2,
                'case_id' => $caseId,
                'event_type' => 'evidence_added',
                'event_description' => 'Evidence added: OSINT data',
                'user_id' => 1,
                'user_username' => 'investigator',
                'metadata' => json_encode(['evidence_type' => 'osint_result']),
                'created_at' => date('Y-m-d H:i:s', strtotime('-2 days'))
            ]
        ];
    }
    
    public function updateCaseStatus($caseId, $status) {
        return [
            'success' => true,
            'message' => 'Case status updated successfully (fake data)'
        ];
    }
}

// API endpoint handler
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    
    try {
        $api = new InvestigationAPI();
        $action = $_POST['action'];
        
        switch ($action) {
            case 'create_case':
                $result = $api->createCase([
                    'title' => $_POST['title'],
                    'description' => $_POST['description'] ?? null,
                    'priority' => $_POST['priority'] ?? 'medium',
                    'assigned_to' => $_POST['assigned_to'] ?? null
                ]);
                echo json_encode($result);
                break;
                
            case 'get_cases':
                $filters = [];
                if (isset($_POST['status'])) $filters['status'] = $_POST['status'];
                if (isset($_POST['assigned_to'])) $filters['assigned_to'] = $_POST['assigned_to'];
                $cases = $api->getCases($filters);
                echo json_encode(['success' => true, 'cases' => $cases]);
                break;
                
            case 'get_case':
                $case = $api->getCase($_POST['case_id']);
                echo json_encode(['success' => true, 'case' => $case]);
                break;
                
            case 'save_query':
                $result = $api->saveQuery([
                    'case_id' => $_POST['case_id'] ?? null,
                    'query_type' => $_POST['query_type'],
                    'query_params' => json_decode($_POST['query_params'], true),
                    'results' => isset($_POST['results']) ? json_decode($_POST['results'], true) : null,
                    'notes' => $_POST['notes'] ?? null
                ]);
                echo json_encode($result);
                break;
                
            case 'get_queries':
                $queries = $api->getQueries($_POST['case_id'] ?? null);
                echo json_encode(['success' => true, 'queries' => $queries]);
                break;
                
            case 'add_evidence':
                $result = $api->addEvidence($_POST['case_id'], [
                    'evidence_type' => $_POST['evidence_type'],
                    'title' => $_POST['title'],
                    'description' => $_POST['description'] ?? null,
                    'content' => isset($_POST['content']) ? json_decode($_POST['content'], true) : null,
                    'file_path' => $_POST['file_path'] ?? null,
                    'source_url' => $_POST['source_url'] ?? null
                ]);
                echo json_encode($result);
                break;
                
            case 'get_evidence':
                $evidence = $api->getEvidence($_POST['case_id']);
                echo json_encode(['success' => true, 'evidence' => $evidence]);
                break;
                
            case 'add_note':
                $result = $api->addNote(
                    $_POST['case_id'],
                    $_POST['note_text'],
                    isset($_POST['is_private']) && $_POST['is_private'] === '1'
                );
                echo json_encode($result);
                break;
                
            case 'get_notes':
                $notes = $api->getNotes($_POST['case_id']);
                echo json_encode(['success' => true, 'notes' => $notes]);
                break;
                
            case 'get_timeline':
                $timeline = $api->getTimeline($_POST['case_id']);
                echo json_encode(['success' => true, 'timeline' => $timeline]);
                break;
                
            case 'update_status':
                $result = $api->updateCaseStatus($_POST['case_id'], $_POST['status']);
                echo json_encode($result);
                break;
                
            default:
                throw new Exception('Invalid action');
        }
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit;
}
?>
