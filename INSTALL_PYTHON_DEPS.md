# Installing Python Dependencies for AI Detection

## Quick Installation

### Option 1: Install All Dependencies at Once (Recommended)

Open Command Prompt or PowerShell and run:

```bash
pip install -r requirements.txt
```

### Option 2: Install Packages Individually

```bash
pip install torch torchvision
pip install timm
pip install albumentations
pip install Pillow
pip install numpy
```

## Detailed Installation Guide

### Step 1: Verify Python Installation

First, make sure Python is installed:

```bash
python --version
```

You should see something like `Python 3.8.x` or higher.

If Python is not installed:
1. Download from https://www.python.org/downloads/
2. **Important**: Check "Add Python to PATH" during installation
3. Restart your computer after installation

### Step 2: Install PyTorch

PyTorch is the main deep learning framework. Installation depends on your system:

#### For Windows (CPU only - recommended for testing):

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

#### For Windows (with GPU support - if you have NVIDIA GPU):

1. First, check if you have CUDA installed:
   ```bash
   nvidia-smi
   ```

2. If you have CUDA, install PyTorch with GPU support:
   ```bash
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
   ```

#### Alternative: Install from PyPI (simpler, but larger download):

```bash
pip install torch torchvision
```

### Step 3: Install Other Dependencies

```bash
pip install timm
pip install albumentations
pip install Pillow
pip install numpy
```

### Step 4: Verify Installation

Test if everything is installed correctly:

```bash
python -c "import torch; import timm; import albumentations; import PIL; import numpy; print('All packages installed successfully!')"
```

Or test the inference script directly:

```bash
python ai_detection_inference.py --help
```

## Troubleshooting

### Issue: "pip is not recognized"

**Solution:**
1. Python might not be in your PATH
2. Try using `python -m pip` instead of just `pip`:
   ```bash
   python -m pip install -r requirements.txt
   ```

### Issue: "Permission denied" or "Access denied"

**Solution:**
1. Run Command Prompt as Administrator
2. Or use `--user` flag:
   ```bash
   pip install --user -r requirements.txt
   ```

### Issue: "No module named 'torch'" after installation

**Solution:**
1. Make sure you're using the same Python that PHP uses
2. Check which Python PHP is using:
   - Look at the diagnostics in `test_ai_detection.php`
   - Or check the error message from the Python script
3. Install packages for that specific Python:
   ```bash
   C:\Python39\python.exe -m pip install -r requirements.txt
   ```
   (Replace `C:\Python39\python.exe` with your actual Python path)

### Issue: Installation is very slow

**Solution:**
1. PyTorch is a large package (~500MB+)
2. Be patient, it may take 5-10 minutes
3. Use a stable internet connection
4. Consider using a faster pip mirror:
   ```bash
   pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
   ```

### Issue: Out of disk space

**Solution:**
1. PyTorch requires ~2-3 GB of disk space
2. Free up space or install on a different drive
3. Consider using CPU-only version (smaller)

### Issue: Multiple Python installations

**Solution:**
1. Find which Python PHP is using (check diagnostics)
2. Use the full path to that Python:
   ```bash
   C:\path\to\python.exe -m pip install -r requirements.txt
   ```

## Verify PHP Can Find Python Packages

After installation, test from PHP:

1. Open `test_ai_detection.php` in browser
2. Click "Check System Diagnostics"
3. Verify Python command is found
4. Try uploading an image to test if packages are accessible

## Alternative: Using Virtual Environment (Advanced)

If you want to isolate the dependencies:

```bash
# Create virtual environment
python -m venv ai_detection_env

# Activate it (Windows)
ai_detection_env\Scripts\activate

# Install packages
pip install -r requirements.txt

# Update PHP script to use the virtual environment Python
# Edit test_ai_detection.php and modify findPythonCommand() to point to:
# ai_detection_env\Scripts\python.exe
```

## Package Versions

The current requirements specify:
- `torch>=2.0.0` - Deep learning framework
- `torchvision>=0.15.0` - Computer vision utilities
- `timm>=0.9.0` - PyTorch image models
- `albumentations>=1.4.0` - Image augmentation library
- `Pillow>=10.0.0` - Image processing
- `numpy>=1.24.0` - Numerical computing

## System Requirements

- **Python**: 3.7 or higher (3.8+ recommended)
- **Disk Space**: ~3-5 GB for all packages
- **RAM**: 4 GB minimum (8 GB recommended)
- **OS**: Windows 7/10/11, Linux, or macOS

## Still Having Issues?

1. Check Python version: `python --version`
2. Check pip version: `pip --version`
3. Upgrade pip: `python -m pip install --upgrade pip`
4. Try installing packages one by one to identify which one fails
5. Check error messages carefully - they often contain helpful hints

## Quick Test Command

After installation, test everything works:

```bash
python -c "import torch; print('PyTorch version:', torch.__version__); import timm; print('timm installed'); import albumentations; print('albumentations installed')"
```

If this runs without errors, you're good to go!

