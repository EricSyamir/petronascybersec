<?php
/**
 * Helper script to find which Python installation has PyTorch
 * Run this from command line: php find_python.php
 */

echo "Finding Python installation with PyTorch...\n\n";

$isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';

// Common Python paths on Windows
$pathsToCheck = [];

if ($isWindows) {
    $username = getenv('USERNAME') ?: getenv('USER');
    $pathsToCheck = [
        'python',
        'python3',
        'C:\\Python39\\python.exe',
        'C:\\Python310\\python.exe',
        'C:\\Python311\\python.exe',
        'C:\\Python312\\python.exe',
        'C:\\Python313\\python.exe',
        'C:\\Program Files\\Python39\\python.exe',
        'C:\\Program Files\\Python310\\python.exe',
        'C:\\Program Files\\Python311\\python.exe',
        'C:\\Program Files\\Python312\\python.exe',
        'C:\\Program Files\\Python313\\python.exe',
    ];
    
    if ($username) {
        $pathsToCheck = array_merge($pathsToCheck, [
            "C:\\Users\\{$username}\\AppData\\Local\\Programs\\Python\\Python39\\python.exe",
            "C:\\Users\\{$username}\\AppData\\Local\\Programs\\Python\\Python310\\python.exe",
            "C:\\Users\\{$username}\\AppData\\Local\\Programs\\Python\\Python311\\python.exe",
            "C:\\Users\\{$username}\\AppData\\Local\\Programs\\Python\\Python312\\python.exe",
            "C:\\Users\\{$username}\\AppData\\Local\\Programs\\Python\\Python313\\python.exe",
        ]);
    }
} else {
    $pathsToCheck = ['python3', 'python', '/usr/bin/python3', '/usr/local/bin/python3'];
}

$foundPython = [];

foreach ($pathsToCheck as $pythonPath) {
    // Check if Python exists
    $versionCmd = escapeshellarg($pythonPath) . ' --version 2>&1';
    $versionOutput = shell_exec($versionCmd);
    
    if (empty($versionOutput) || strpos($versionOutput, 'Python') === false) {
        continue;
    }
    
    echo "Found Python: $pythonPath\n";
    echo "  Version: " . trim($versionOutput) . "\n";
    
    // Check for PyTorch
    $torchCmd = escapeshellarg($pythonPath) . ' -c "import torch; print(torch.__version__)" 2>&1';
    $torchOutput = shell_exec($torchCmd);
    
    if (!empty($torchOutput) && strpos($torchOutput, 'error') === false && strpos($torchOutput, 'Error') === false) {
        echo "  ✓ PyTorch: " . trim($torchOutput) . "\n";
        
        // Check for other required packages
        $packages = ['timm', 'albumentations', 'PIL', 'numpy'];
        $allInstalled = true;
        
        foreach ($packages as $pkg) {
            $testCmd = escapeshellarg($pythonPath) . " -c \"import $pkg\" 2>&1";
            $testOutput = shell_exec($testCmd);
            if (empty($testOutput) || (strpos($testOutput, 'error') === false && strpos($testOutput, 'Error') === false)) {
                echo "  ✓ $pkg: installed\n";
            } else {
                echo "  ✗ $pkg: NOT installed\n";
                $allInstalled = false;
            }
        }
        
        if ($allInstalled) {
            $foundPython[] = [
                'path' => $pythonPath,
                'version' => trim($versionOutput),
                'torch' => trim($torchOutput)
            ];
            echo "  → This Python has all required packages!\n";
        } else {
            echo "  → Missing some packages. Install with: " . escapeshellarg($pythonPath) . " -m pip install timm albumentations Pillow numpy\n";
        }
    } else {
        echo "  ✗ PyTorch: NOT installed\n";
        echo "  → Install with: " . escapeshellarg($pythonPath) . " -m pip install torch torchvision\n";
    }
    
    echo "\n";
}

if (empty($foundPython)) {
    echo "❌ No Python installation found with all required packages.\n\n";
    echo "To fix this:\n";
    echo "1. Find your Python installation (check the list above)\n";
    echo "2. Install packages using: python -m pip install torch torchvision timm albumentations Pillow numpy\n";
    echo "3. Or update test_ai_detection.php to use the correct Python path\n";
} else {
    echo "✅ Found " . count($foundPython) . " Python installation(s) with all packages:\n\n";
    foreach ($foundPython as $python) {
        echo "  Path: {$python['path']}\n";
        echo "  Version: {$python['version']}\n";
        echo "  PyTorch: {$python['torch']}\n\n";
    }
    
    echo "If PHP is not using this Python, update test_ai_detection.php:\n";
    echo "  Modify findPythonCommand() to check this path first, or\n";
    echo "  Set a specific path in the constructor.\n";
}

