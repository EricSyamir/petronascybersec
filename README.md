# VeriDeep by SecureTech
<div>
  <p align="center">
    <img src="verideep_banner.jpg" width="400"> 
  </p>
</div>

**Advanced AI-Powered Deepfake Detection Platform**

<div>
  <p align="center">
    <img src="AI part 1.gif" width="500"> 
  </p>
</div>

---

## 🏢 About

**VeriDeep** is an innovative cybersecurity platform developed by **SecureTech** that specializes in detecting AI-generated content and deepfakes in images and videos. The platform combines multiple detection technologies to provide accurate, real-time analysis with comprehensive reporting.

---

## ✨ Key Features

### 🎯 Advanced Video Deepfake Detection
- **Dual Analysis System**: 60% Gemini AI Transcript Analysis + 40% Sightengine Visual Analysis
- **Video Transcription**: Automatic audio transcription using Google Gemini 2.0 Flash
- **LLM-Powered Analysis**: Detects AI-generated speech, impersonation, and deepfake indicators
- **Weighted Scoring**: Intelligent combination of audio and visual analysis for maximum accuracy

### 📸 Advanced Image Deepfake Detection
- **Adaptive Multi-Model System**: Intelligent detection based on image content (faces vs. no faces)
- **Images with Faces**: 60% Sightengine AI Generated + 20% ML Model + 20% Sightengine Deepfake Detection
- **Images without Faces**: 60% Sightengine AI Generated + 40% ML Model
- **Machine Learning Model**: EfficientNetV2-S architecture (PyTorch) for AI-generated content classification
- **Error Level Analysis (ELA)**: JPEG tampering detection using compression error analysis
- **Multiple Formats**: Supports JPEG, PNG, GIF, WebP, BMP
- **Real-time Analysis**: Instant results with detailed confidence scores and visual indicators

### 🔍 Additional Capabilities
- **OSINT Monitoring**: Real-time threat intelligence and monitoring
- **Incident Reporting**: Automated deepfake detection in reports
- **Scammer Database**: Searchable database of known scammers
- **Chrome Extension**: Browser-based scanning and analysis

---

## Example Usage

### 🚓 Fake Media
<div>
  <p align="center">
    <img src="AI part 1.gif" width="600"> 
  </p>
</div>

<div>
  <p align="center">
    <img src="ai part 2.gif" width="600"> 
  </p>
</div>

### 🎞 Real Media
<div>
  <p align="center">
    <img src="real_real.gif" width="600"> 
  </p>
</div>

---


## 🛠️ Technology Stack

### Core Technologies
- **Backend**: PHP 7.4+ with RESTful API architecture
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI/ML**: 
  - Google Gemini 2.0 Flash (Video transcription & analysis)
  - Sightengine API (Visual deepfake detection & AI-generated content analysis)
  - EfficientNetV2-S (PyTorch/timm) - Local ML model for image classification
  - Error Level Analysis (ELA) - JPEG tampering detection algorithm

### Key Integrations
- **Sightengine API**: Industry-leading visual deepfake detection
- **Google Gemini API**: Video transcription and LLM-based analysis
- **HaveIBeenPwned**: Data breach checking
- **Semak Mule**: Malaysian scammer database

## Architecture Diagram
<div>
  <p align="center">
    <img src="arch diagram.jpeg" width="600"> 
  </p>
</div>
---

## 🚀 Quick Start

### Prerequisites
- PHP 7.4+ with cURL extension
- Web server (Apache/Nginx) or XAMPP
- Python 3.7+ (optional, for ML model)
- API keys:
  - Sightengine API credentials
  - Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EricSyamir/petronascybersec.git
   cd petronas-cybercrime-platform
   ```

2. **Configure API keys**
   Edit `config/database.php`:
   ```php
   define('SIGHTENGINE_API_USER', 'your_user');
   define('SIGHTENGINE_API_SECRET', 'your_secret');
   // Gemini API key is configured in api/sightengine.php
   ```

3. **Set up upload directories**
   ```bash
   mkdir -p uploads/deepfake_scans uploads/evidence
   chmod 755 uploads uploads/deepfake_scans uploads/evidence
   ```

4. **Access the platform**
   - Navigate to `deepfake-scanner.php` for video/image analysis
   - Upload a video or image to test the detection system

---

## 🎓 How It Works

### Video Analysis Flow
1. **Upload**: User uploads a video file (MP4, MOV, AVI, etc.)
2. **Transcription**: Video is uploaded to Gemini API for audio transcription
3. **LLM Analysis**: Transcript is analyzed for AI/deepfake/impersonation indicators (60% weight)
4. **Visual Analysis**: Sightengine analyzes video frames for visual deepfake indicators (40% weight)
5. **Weighted Score**: Final score = (Transcript Score × 0.6) + (Visual Score × 0.4)
6. **Report**: Comprehensive analysis report with detailed findings

### Image Analysis Flow

#### Step 1: Image Upload & Preprocessing
- User uploads an image file (JPEG, PNG, GIF, WebP, BMP)
- System validates file type, size, and format
- User selects whether the image contains faces (optional but recommended)

#### Step 2: Multi-Model Analysis
The system performs parallel analysis using multiple detection methods:

**A. Sightengine API Analysis:**
- **AI-Generated Content Detection**: Analyzes image for AI generation artifacts
- **Deepfake Detection** (if faces detected): Specialized face manipulation detection
- Returns confidence scores for both AI generation and deepfake likelihood

**B. Machine Learning Model Analysis:**
- **EfficientNetV2-S Model**: Local PyTorch-based classifier
- Input: 384×384 pixel image preprocessing
- Output: Binary classification (AI-generated vs. Human-generated) with confidence scores
- Provides detailed probability distributions and raw model outputs

**C. Error Level Analysis (ELA)** - For JPEG/PNG images:
- Compression error analysis to detect image tampering
- Identifies inconsistencies in JPEG compression levels
- Calculates suspicious pixel percentage and confidence scores
- Generates visual ELA heatmap for manual inspection

#### Step 3: Intelligent Weighted Scoring
The system applies different weightage based on image content:

**For Images WITH Faces:**
```
Final Score = (Sightengine AI Score × 0.6) + (ML Model Score × 0.2) + (Sightengine Deepfake Score × 0.2)
```
- Prioritizes Sightengine's AI detection (60%)
- ML model provides validation (20%)
- Deepfake detection adds face-specific analysis (20%)

**For Images WITHOUT Faces:**
```
Final Score = (Sightengine AI Score × 0.6) + (ML Model Score × 0.4)
```
- Sightengine AI detection (60%)
- ML model provides stronger validation (40%)
- No deepfake detection (not applicable without faces)

**Fallback Scenarios:**
- If ML model unavailable: Uses 75% Sightengine AI + 25% Deepfake (with faces) or 100% Sightengine (no faces)
- Graceful degradation ensures analysis continues even if one component fails

#### Step 4: Comprehensive Reporting
- **Confidence Score**: Combined weighted score (0-100%)
- **Detection Indicators**: Individual scores from each model with weightage breakdown
- **Visual Indicators**: Color-coded circular progress indicators
- **Detailed Breakdown**: Separate tabs for Sightengine, ML Model, and ELA analysis
- **Model Information**: Architecture details, input specifications, and analysis methods

---

## 📊 Evaluation Highlights

### Innovation Points

- ✅ **First-of-its-kind**: Combined audio transcript + visual analysis for video deepfake detection  
- ✅ **Intelligent Weighting**: 60/40 split prioritizes transcript analysis (more reliable for impersonation detection)  
- ✅ **Face-Aware Analysis**: Specialized deepfake detection when faces are present (60/20/20 weightage) 
- ✅ **Triple-Layer Detection**: Combines Sightengine API, local ML model, and ELA for comprehensive analysis  
- ✅ **Adaptive Multi-Model System**: Different weightage strategies based on image content (faces vs. no faces)  
 
### Technical Excellence
- **Robust Error Handling**: Graceful fallbacks if one analysis method fails
- **Comprehensive Logging**: Detailed error logs for debugging
- **User-friendly Interface**: Clean, intuitive UI with visual indicators
- **Bilingual Support**: English and Bahasa Malaysia

### Use Cases

**Video Detection:**
- **Social Media Verification**: Verify authenticity of viral videos
- **News Media**: Fact-check video content before publication
- **Law Enforcement**: Investigate deepfake-related crimes
- **Corporate Security**: Verify video calls and communications
- **Public Awareness**: Educate users about deepfake threats

**Image Detection:**
- **Profile Photo Verification**: Verify authenticity of profile pictures on social media and dating platforms
- **Document Authentication**: Detect tampered images in official documents and certificates
- **News Media**: Verify authenticity of photos before publication
- **E-commerce**: Detect AI-generated product images and fake reviews
- **Identity Verification**: Verify profile photos in identity verification systems
- **Forensic Analysis**: Investigate image tampering in legal cases
- **Content Moderation**: Automatically flag AI-generated or manipulated images

---

## 📁 Project Structure

```
petronas-cybercrime-platform/
├── api/
│   ├── sightengine.php          # Main deepfake detection API
│   └── ela_analysis.php         # Error Level Analysis functions
├── assets/
│   └── js/
│       └── deepfake-scanner.js  # Frontend logic & result combination
├── config/
│   └── database.php             # API configuration
├── deepfake-scanner.php         # Main scanner interface
└── test-gemini-transcript.php   # Testing utility
```

---

### Demo Scenarios

**Video Testing:**
1. **Deepfake Video**: Upload a video with AI-generated content
2. **Impersonation**: Test with videos claiming to be someone else
3. **Authentic Content**: Verify natural videos are correctly identified

**Image Testing:**
1. **AI-Generated Image with Faces**: Test deepfake detection (60/20/20 weightage)
2. **AI-Generated Image without Faces**: Test AI generation detection (60/40 weightage)
3. **Tampered JPEG**: Test ELA detection for compression inconsistencies
4. **Authentic Photo**: Verify natural images are correctly identified
5. **Mixed Content**: Test various formats (JPEG, PNG, GIF, WebP)

---

## 📈 Performance Metrics

- **Video Analysis**: ~30-60 seconds (depending on video length)
  - Transcription: ~10-30 seconds
  - Visual analysis: ~5-10 seconds
  - LLM analysis: ~5-10 seconds
  
- **Image Analysis**: <5 seconds
  - Sightengine API: ~1-2 seconds
  - ML Model inference: ~0.5-1 second
  - ELA analysis: ~1-2 seconds (JPEG/PNG only)
  
- **Accuracy**: Enhanced through multi-model validation and intelligent weighting
- **Rate Limiting**: 10 scans per 5 minutes per user

---

## 🔒 Security & Privacy

- **Secure File Handling**: Temporary files are automatically cleaned
- **API Key Protection**: Keys stored in configuration files
- **Rate Limiting**: Prevents abuse and API quota exhaustion
- **Input Validation**: Comprehensive file type and size validation

---

## 👥 Team

**SecureTech**  
*Advanced Cybersecurity Solutions*
- Eric
- Syafi
- Almas
- Haiqal
- Irfan

---

## 📝 License

This project is provided for educational and demonstration purposes.

---

## 🔗 Links

- [Repository](https://github.com/EricSyamir/petronascybersec)
- [Project Report](https://github.com/EricSyamir/petronascybersec/blob/main/SYSTEM_REPORT.md)
- [Slides Presentation](https://www.canva.com/design/DAG4u2iozz8/HtrALtwViLWlkevRud_QlA/edit?utm_content=DAG4u2iozz8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

