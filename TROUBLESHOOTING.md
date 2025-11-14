# Troubleshooting File Upload Issues

## Common Issues and Solutions

### 1. File Upload Not Working

**Symptoms:**
- Form submits but no file is received
- Error message about file upload
- `$_FILES` is empty

**Solutions:**

#### Check PHP Configuration (`php.ini`)

Make sure these settings are configured:

```ini
file_uploads = On
upload_max_filesize = 10M
post_max_size = 10M
max_file_uploads = 20
```

**To check current settings:**
- Click "Check System Diagnostics" button on the test page
- Or create a PHP file with: `<?php phpinfo(); ?>` and check the values

**To modify settings:**
1. Find your `php.ini` file (check `phpinfo()` output)
2. Edit the values above
3. Restart your web server (Apache/XAMPP)

#### Check Form Attributes

The form must have:
```html
<form enctype="multipart/form-data" method="POST">
```

✅ **Fixed in the code** - The form now explicitly has `method="POST"`

#### Check File Size

If your image is too large:
- Increase `upload_max_filesize` and `post_max_size` in `php.ini`
- Or compress/resize the image before uploading

### 2. Windows-Specific Issues

**Symptoms:**
- Python not found
- Script execution fails
- Path issues

**Solutions:**

#### Python Command Detection

✅ **Fixed** - The code now detects Python on Windows correctly:
- Uses `python --version` instead of `which` command
- Works with both `python` and `python3` commands

#### Path Issues

On Windows, paths use backslashes. The code now:
- Detects Windows OS automatically
- Handles path escaping correctly
- Uses proper command formatting

**To manually set Python path:**
Edit `test_ai_detection.php` and modify `findPythonCommand()`:
```php
private function findPythonCommand() {
    // For Windows, you can specify full path:
    if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
        // Try common Windows Python locations
        $paths = [
            'C:\\Python39\\python.exe',
            'C:\\Python310\\python.exe',
            'C:\\Python311\\python.exe',
            'python', // Fallback to PATH
        ];
        foreach ($paths as $path) {
            if (file_exists($path) || $path === 'python') {
                $testCmd = escapeshellarg($path) . ' --version 2>&1';
                $output = shell_exec($testCmd);
                if ($output && strpos($output, 'Python') !== false) {
                    return $path;
                }
            }
        }
    }
    // ... rest of code
}
```

### 3. Shell Execution Disabled

**Symptoms:**
- Error: "Failed to execute Python script"
- Python command not found

**Solutions:**

#### Enable shell_exec in PHP

1. Open `php.ini`
2. Find `disable_functions`
3. Remove `shell_exec` from the list (if present)
4. Restart web server

**Alternative:** Use `exec()` or `proc_open()` if `shell_exec` is disabled

### 4. Permission Issues

**Symptoms:**
- Cannot write to upload directory
- File upload fails silently

**Solutions:**

#### Check Directory Permissions

The upload directory is created automatically at:
```
/uploads/test_ai_detection/
```

**On Windows:**
- Make sure the directory is writable
- Check folder properties → Security → Permissions

**On Linux/Mac:**
```bash
chmod 755 uploads/
chmod 755 uploads/test_ai_detection/
```

### 5. Python Dependencies Missing

**Symptoms:**
- Python script runs but fails
- Import errors in Python output

**Solutions:**

Install required packages:
```bash
pip install torch torchvision timm albumentations pillow numpy
```

Or use the requirements file:
```bash
pip install -r requirements.txt
```

### 6. Model File Not Found

**Symptoms:**
- Error: "Model file not found"

**Solutions:**

1. Ensure `best_model.pth` is in the same directory as `test_ai_detection.php`
2. Check file permissions (must be readable)
3. Verify the file path in the error message

### 7. Debugging Steps

#### Step 1: Check System Diagnostics

Click the "Check System Diagnostics" button on the test page to see:
- PHP version
- Upload settings
- File permissions
- Python availability
- File existence checks

#### Step 2: Test Python Script Directly

Open command prompt/terminal and run:
```bash
python ai_detection_inference.py "path/to/test/image.jpg"
```

This will show if the Python script works independently.

#### Step 3: Check PHP Error Logs

Check your PHP error log:
- XAMPP: `xampp/apache/logs/error.log`
- Or check `php.ini` for `error_log` location

#### Step 4: Enable Error Display

Temporarily add to the top of `test_ai_detection.php`:
```php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
```

**Remember to remove this in production!**

#### Step 5: Test with Simple Upload

Create a simple test file `test_upload.php`:
```php
<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<pre>";
    print_r($_FILES);
    echo "</pre>";
    if (isset($_FILES['image'])) {
        echo "File uploaded: " . $_FILES['image']['name'] . "\n";
        echo "Temp file: " . $_FILES['image']['tmp_name'] . "\n";
        echo "Error code: " . $_FILES['image']['error'] . "\n";
    }
}
?>
<form method="POST" enctype="multipart/form-data">
    <input type="file" name="image">
    <button type="submit">Upload</button>
</form>
```

### 8. Common Error Codes

**UPLOAD_ERR_OK (0):** Success
**UPLOAD_ERR_INI_SIZE (1):** File exceeds `upload_max_filesize`
**UPLOAD_ERR_FORM_SIZE (2):** File exceeds `MAX_FILE_SIZE` in form
**UPLOAD_ERR_PARTIAL (3):** File was only partially uploaded
**UPLOAD_ERR_NO_FILE (4):** No file was uploaded
**UPLOAD_ERR_NO_TMP_DIR (6):** Missing temporary folder
**UPLOAD_ERR_CANT_WRITE (7):** Failed to write file to disk
**UPLOAD_ERR_EXTENSION (8):** File upload stopped by extension

✅ **Fixed** - The code now shows detailed error messages for each error code.

### 9. XAMPP-Specific Issues

**If using XAMPP on Windows:**

1. **Check Apache is running** - Start Apache from XAMPP Control Panel
2. **Check PHP version** - XAMPP includes PHP, verify it's active
3. **Check file paths** - Use forward slashes or `__DIR__` constant
4. **Python PATH** - Make sure Python is in system PATH, or specify full path

### 10. Still Not Working?

1. **Check browser console** (F12) for JavaScript errors
2. **Check network tab** (F12 → Network) to see the actual request/response
3. **Try a different browser** to rule out browser-specific issues
4. **Test with curl**:
   ```bash
   curl -X POST -F "image=@test.jpg" http://localhost/test_ai_detection.php
   ```

## Quick Checklist

- [ ] PHP `file_uploads` is enabled
- [ ] `upload_max_filesize` is large enough (e.g., 10M)
- [ ] `post_max_size` is large enough (e.g., 10M)
- [ ] Form has `enctype="multipart/form-data"`
- [ ] Form has `method="POST"`
- [ ] Upload directory exists and is writable
- [ ] Python is installed and in PATH
- [ ] Python packages are installed (torch, timm, albumentations)
- [ ] `best_model.pth` exists in the same directory
- [ ] `ai_detection_inference.py` exists and is readable
- [ ] `shell_exec` is not disabled in PHP
- [ ] Check system diagnostics shows all green

## Getting Help

If you're still having issues:

1. Run the diagnostics and note all values
2. Check PHP error logs
3. Test Python script directly
4. Note the exact error message
5. Check which step fails (upload, Python execution, model loading)

