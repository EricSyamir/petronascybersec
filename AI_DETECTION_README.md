# AI Detection Model Integration - Test Files

This directory contains test files for integrating the PyTorch AI detection model (`best_model.pth`) into the PHP platform.

## Files

1. **`ai_detection_inference.py`** - Python script that loads the model and performs inference
2. **`test_ai_detection.php`** - PHP wrapper with web interface for testing the model
3. **`best_model.pth`** - Trained PyTorch model (should be in the same directory)

## Prerequisites

### Python Requirements

Install the following Python packages:

```bash
pip install torch torchvision
pip install timm
pip install albumentations
pip install pillow
pip install numpy
```

Or create a requirements file:

```bash
pip install -r requirements.txt
```

Where `requirements.txt` contains:
```
torch>=2.0.0
torchvision>=0.15.0
timm>=0.9.0
albumentations>=1.4.0
Pillow>=10.0.0
numpy>=1.24.0
```

### PHP Requirements

- PHP 7.4 or higher
- `shell_exec()` function enabled (check `php.ini`)
- File uploads enabled

### System Requirements

- Python 3.7 or higher
- CUDA (optional, for GPU acceleration)
- Sufficient memory to load the model (~500MB+)

## Setup

1. **Place the model file** (`best_model.pth`) in the same directory as the scripts

2. **Make Python script executable** (Linux/Mac):
   ```bash
   chmod +x ai_detection_inference.py
   ```

3. **Test Python script directly**:
   ```bash
   python3 ai_detection_inference.py /path/to/test/image.jpg
   ```
   
   Expected output:
   ```json
   {
     "success": true,
     "label": 1,
     "label_name": "AI-generated",
     "confidence": 0.95,
     "probabilities": {
       "human": 0.05,
       "ai": 0.95
     }
   }
   ```

## Usage

### Method 1: Web Interface

1. Open `test_ai_detection.php` in your web browser
2. Upload an image using the web interface
3. View the detection results

### Method 2: PHP Class Usage

```php
<?php
require_once 'test_ai_detection.php';

$detector = new AIDetectionTester();

// Detect from file path
$result = $detector->detect('/path/to/image.jpg');

if ($result['success']) {
    echo "Label: " . $result['label_name'] . "\n";
    echo "Confidence: " . ($result['confidence'] * 100) . "%\n";
    echo "AI Probability: " . ($result['probabilities']['ai'] * 100) . "%\n";
} else {
    echo "Error: " . $result['error'] . "\n";
}
?>
```

### Method 3: API Endpoint

**POST Request:**
```bash
curl -X POST -F "image=@/path/to/image.jpg" http://localhost/test_ai_detection.php
```

**GET Request:**
```bash
curl "http://localhost/test_ai_detection.php?image_path=/path/to/image.jpg"
```

### Method 4: Direct Python Script

```bash
python3 ai_detection_inference.py /path/to/image.jpg
```

## Response Format

### Success Response

```json
{
  "success": true,
  "label": 1,
  "label_name": "AI-generated",
  "confidence": 0.95,
  "probabilities": {
    "human": 0.05,
    "ai": 0.95
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Label Meanings

- **Label 0**: Human-generated image
- **Label 1**: AI-generated image

## Troubleshooting

### Python Not Found

If you get "Python not found" error:

1. Check if Python is installed:
   ```bash
   python3 --version
   ```

2. Update the `findPythonCommand()` method in `test_ai_detection.php` to use your specific Python path:
   ```php
   private function findPythonCommand() {
       return '/usr/bin/python3'; // or your Python path
   }
   ```

### Model File Not Found

Ensure `best_model.pth` is in the same directory as `ai_detection_inference.py`, or update the `MODEL_PATH` constant in the Python script.

### Permission Errors

Make sure:
- PHP has read permissions for the model file
- PHP has execute permissions for the Python script
- Upload directory is writable (for file uploads)

### Memory Issues

If you encounter memory errors:
- Reduce batch size in the Python script
- Use CPU instead of GPU (modify device selection)
- Process images one at a time

### Import Errors

If Python packages are not found:
```bash
pip install --upgrade torch timm albumentations pillow numpy
```

## Performance Notes

- **First run**: Model loading takes ~5-10 seconds (model is loaded into memory)
- **Subsequent runs**: ~0.5-2 seconds per image (depending on image size and hardware)
- **GPU acceleration**: Significantly faster if CUDA is available

## Security Considerations

⚠️ **Important**: This is a test file. Before integrating into production:

1. **Validate all inputs** - Check file types, sizes, paths
2. **Sanitize paths** - Prevent path traversal attacks
3. **Limit file sizes** - Prevent memory exhaustion
4. **Rate limiting** - Prevent abuse
5. **Error handling** - Don't expose system paths in errors
6. **Authentication** - Add proper authentication/authorization

## Next Steps

Once testing is complete:

1. Create a production-ready API endpoint
2. Add proper error handling and logging
3. Implement caching for model loading
4. Add rate limiting
5. Integrate with the main platform codebase
6. Add unit tests

## Model Information

- **Architecture**: EfficientNetV2-S (from timm)
- **Input Size**: 384x384 pixels
- **Classes**: 2 (Human-generated, AI-generated)
- **Preprocessing**: Resize to 384x384, normalize with ImageNet stats

## Support

For issues or questions:
1. Check Python script output directly
2. Verify model file integrity
3. Check PHP error logs
4. Ensure all dependencies are installed

