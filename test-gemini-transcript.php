<?php
/**
 * Test Gemini Video Transcription
 * This file tests the Gemini API video transcription functionality
 */

// Configuration
$geminiApiKey = 'AIzaSyCOnJaGxm18KuXFBj7kJdo16mEcdmyJYzw';
$videoFilePath = isset($_GET['video']) ? $_GET['video'] : 'C:\\Users\\erics\\Downloads\\deepfake.mp4'; // Default video path

echo "<h1>Gemini Video Transcription Test</h1>";
echo "<p>Testing video file: <strong>$videoFilePath</strong></p>";
echo "<hr>";

if (!file_exists($videoFilePath)) {
    die("<p style='color: red;'>❌ Error: Video file not found at: $videoFilePath</p>");
}

$fileSize = filesize($videoFilePath);
echo "<p>File size: " . round($fileSize / 1024 / 1024, 2) . " MB</p>";

// Determine MIME type
$fileExtension = strtolower(pathinfo($videoFilePath, PATHINFO_EXTENSION));
$mimeTypes = [
    'mp4' => 'video/mp4',
    'mov' => 'video/quicktime',
    'avi' => 'video/x-msvideo',
    'mkv' => 'video/x-matroska',
    'webm' => 'video/webm'
];
$videoMimeType = $mimeTypes[$fileExtension] ?? 'video/mp4';
echo "<p>MIME type: $videoMimeType</p>";
echo "<hr>";

// ==========================================================
// STEP 1: UPLOAD THE VIDEO FILE TO GEMINI
// ==========================================================
echo "<h2>Step 1: Uploading Video File</h2>";
echo "<p>Uploading to Gemini API...</p>";

$fileBytes = file_get_contents($videoFilePath);
if (!$fileBytes) {
    die("<p style='color: red;'>❌ Failed to read video file</p>");
}

$uploadUrl = 'https://generativelanguage.googleapis.com/upload/v1beta/files?key=' . $geminiApiKey . '&uploadType=media';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $uploadUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $fileBytes);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: ' . $videoMimeType]);
curl_setopt($ch, CURLOPT_TIMEOUT, 120);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
    die("<p style='color: red;'>❌ cURL Error (Upload): $err</p>");
}

if ($httpCode !== 200) {
    echo "<p style='color: red;'>❌ Upload failed: HTTP $httpCode</p>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
    die();
}

$uploadResult = json_decode($response, true);
if (!isset($uploadResult['file'])) {
    echo "<p style='color: red;'>❌ Error uploading file</p>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
    die();
}

$fileUri = $uploadResult['file']['uri'];
$fileName = $uploadResult['file']['name'];
echo "<p style='color: green;'>✅ File uploaded successfully!</p>";
echo "<p>File URI: <code>$fileUri</code></p>";
echo "<p>File Name: <code>$fileName</code></p>";
echo "<hr>";

// ==========================================================
// STEP 2: POLL FOR FILE STATUS
// ==========================================================
echo "<h2>Step 2: Waiting for File Processing</h2>";
$fileApiUrl = 'https://generativelanguage.googleapis.com/v1beta/' . $fileName . '?key=' . $geminiApiKey;
$fileState = '';
$maxAttempts = 12; // Maximum 60 seconds
$attempt = 0;

while ($fileState !== 'ACTIVE' && $attempt < $maxAttempts) {
    $attempt++;
    echo "<p>Polling attempt $attempt/$maxAttempts...</p>";
    flush();
    ob_flush();
    
    sleep(5);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $fileApiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);
    
    if ($err) {
        echo "<p style='color: orange;'>⚠️ cURL Error (Polling): $err</p>";
        continue;
    }
    
    $fileData = json_decode($response, true);
    if (isset($fileData['state'])) {
        $fileState = $fileData['state'];
        echo "<p>File state: <strong>$fileState</strong></p>";
    } elseif (isset($fileData['error'])) {
        echo "<p style='color: red;'>❌ Error checking file state: " . $fileData['error']['message'] . "</p>";
        die();
    }
    
    if ($fileState === 'FAILED') {
        echo "<p style='color: red;'>❌ File processing failed</p>";
        die();
    }
}

if ($fileState !== 'ACTIVE') {
    echo "<p style='color: red;'>❌ File did not become ACTIVE within timeout period</p>";
    die();
}

echo "<p style='color: green;'>✅ File is ACTIVE and ready!</p>";
echo "<hr>";

// ==========================================================
// STEP 3: REQUEST TRANSCRIPTION
// ==========================================================
echo "<h2>Step 3: Requesting Transcription</h2>";
echo "<p>Sending transcription request...</p>";

$modelUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $geminiApiKey;

$prompt = 'Please provide a full, accurate transcript of this video. Provide only the transcript text without any additional commentary.';

$postData = [
    'contents' => [
        [
            'parts' => [
                ['text' => $prompt],
                [
                    'fileData' => [
                        'mimeType' => $videoMimeType,
                        'fileUri' => $fileUri
                    ]
                ]
            ]
        ]
    ],
    'generationConfig' => [
        'temperature' => 0.1,
        'maxOutputTokens' => 2048
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $modelUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 120);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
    die("<p style='color: red;'>❌ cURL Error (Transcription): $err</p>");
}

if ($httpCode !== 200) {
    echo "<p style='color: red;'>❌ Transcription failed: HTTP $httpCode</p>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
    die();
}

$result = json_decode($response, true);

if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
    echo "<p style='color: red;'>❌ Error in transcription response</p>";
    echo "<pre>" . htmlspecialchars(json_encode($result, JSON_PRETTY_PRINT)) . "</pre>";
    die();
}

// ==========================================================
// STEP 4: DISPLAY RESULT
// ==========================================================
$transcript = $result['candidates'][0]['content']['parts'][0]['text'];

echo "<h2>Step 4: Transcription Result</h2>";
echo "<p style='color: green;'>✅ Transcription completed successfully!</p>";
echo "<p>Transcript length: <strong>" . strlen($transcript) . "</strong> characters</p>";
echo "<hr>";

echo "<h3>Transcript:</h3>";
echo "<div style='background: #f5f5f5; padding: 15px; border-radius: 8px; max-height: 400px; overflow-y: auto; white-space: pre-wrap; font-family: monospace;'>";
echo htmlspecialchars($transcript);
echo "</div>";

echo "<hr>";
echo "<h3>Full API Response:</h3>";
echo "<pre style='background: #f5f5f5; padding: 15px; border-radius: 8px; max-height: 400px; overflow-y: auto;'>";
echo htmlspecialchars(json_encode($result, JSON_PRETTY_PRINT));
echo "</pre>";

echo "<hr>";
echo "<p><strong>Test completed!</strong></p>";
?>

