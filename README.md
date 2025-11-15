# VeriDeep by SecureTech

**Advanced AI-Powered Deepfake Detection Platform**

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

### 📸 Image Deepfake Detection
- **Dual Detection**: Sightengine API (60%) + Machine Learning Model (40%)
- **Multiple Formats**: Supports JPEG, PNG, GIF, WebP, BMP
- **Real-time Analysis**: Instant results with detailed confidence scores

### 🔍 Additional Capabilities
- **OSINT Monitoring**: Real-time threat intelligence and monitoring
- **Incident Reporting**: Automated deepfake detection in reports
- **Scammer Database**: Searchable database of known scammers
- **Chrome Extension**: Browser-based scanning and analysis

---

## 🛠️ Technology Stack

### Core Technologies
- **Backend**: PHP 7.4+ with RESTful API architecture
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI/ML**: 
  - Google Gemini 2.0 Flash (Video transcription & analysis)
  - Sightengine API (Visual deepfake detection)
  - PyTorch (Local ML model for images)

### Key Integrations
- **Sightengine API**: Industry-leading visual deepfake detection
- **Google Gemini API**: Video transcription and LLM-based analysis
- **HaveIBeenPwned**: Data breach checking
- **Semak Mule**: Malaysian scammer database

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
1. **Upload**: User uploads an image file
2. **Dual Detection**: 
   - Sightengine API analyzes the image (60% weight)
   - Local ML model provides additional validation (40% weight)
3. **Combined Score**: Weighted average of both analyses
4. **Report**: Detailed authenticity assessment

---

## 📊 Evaluation Highlights

### Innovation Points
✅ **First-of-its-kind**: Combined audio transcript + visual analysis for video deepfake detection  
✅ **Intelligent Weighting**: 60/40 split prioritizes transcript analysis (more reliable for impersonation detection)  
✅ **Real-time Processing**: Fast analysis with comprehensive reporting  
✅ **Multi-format Support**: Handles both images and videos seamlessly  

### Technical Excellence
- **Robust Error Handling**: Graceful fallbacks if one analysis method fails
- **Comprehensive Logging**: Detailed error logs for debugging
- **User-friendly Interface**: Clean, intuitive UI with visual indicators
- **Bilingual Support**: English and Bahasa Malaysia

### Use Cases
- **Social Media Verification**: Verify authenticity of viral videos
- **News Media**: Fact-check video content before publication
- **Law Enforcement**: Investigate deepfake-related crimes
- **Corporate Security**: Verify video calls and communications
- **Public Awareness**: Educate users about deepfake threats

---

## 📁 Project Structure

```
petronas-cybercrime-platform/
├── api/
│   └── sightengine.php          # Main deepfake detection API
├── assets/
│   └── js/
│       └── deepfake-scanner.js  # Frontend logic
├── config/
│   └── database.php             # API configuration
├── deepfake-scanner.php         # Main scanner interface
└── test-gemini-transcript.php   # Testing utility
```

---

## 🧪 Testing

### Test Video Transcription
Access `test-gemini-transcript.php` to test Gemini video transcription independently.

### Demo Scenarios
1. **Deepfake Video**: Upload a video with AI-generated content
2. **Impersonation**: Test with videos claiming to be someone else
3. **Authentic Content**: Verify natural videos are correctly identified

---

## 📈 Performance Metrics

- **Video Analysis**: ~30-60 seconds (depending on video length)
- **Image Analysis**: <5 seconds
- **Accuracy**: Enhanced through dual-system validation
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

---

## 📝 License

This project is provided for educational and demonstration purposes.

---

## 🔗 Links

- **Repository**: https://github.com/EricSyamir/petronascybersec
- **Demo**: Access via `deepfake-scanner.php` after installation

---

## 📞 Contact

For questions or evaluation inquiries, please refer to the project repository.

---

**Version**: 2.0.0  
**Last Updated**: January 2025  
**Platform**: VeriDeep by SecureTech
