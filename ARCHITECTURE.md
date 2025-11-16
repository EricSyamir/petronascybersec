# VeriDeep System Architecture

**SecureTech - VeriDeep**  
*Advanced AI-Powered Deepfake Detection Platform*

---

## System Overview

VeriDeep is a comprehensive deepfake detection platform that combines multiple AI technologies to analyze images and videos for AI-generated content, deepfakes, and impersonation attempts.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Browser    │  │   Chrome     │  │   Mobile     │        │
│  │   (Web UI)   │  │  Extension   │  │   Browser    │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                    APPLICATION LAYER                            │
├────────────────────────────┼────────────────────────────────────┤
│                            │                                    │
│         ┌──────────────────▼──────────────────┐                │
│         │      PHP Backend (XAMPP)            │                │
│         │  ┌──────────────────────────────┐   │                │
│         │  │  api/sightengine.php         │   │                │
│         │  │  - File Upload Handler       │   │                │
│         │  │  - URL Analysis Handler      │   │                │
│         │  │  - Result Aggregation        │   │                │
│         │  └──────────────────────────────┘   │                │
│         │  ┌──────────────────────────────┐   │                │
│         │  │  api/ai_detection.php        │   │                │
│         │  │  - ML Model Integration      │   │                │
│         │  └──────────────────────────────┘   │                │
│         │  ┌──────────────────────────────┐   │                │
│         │  │  api/ela_analysis.php        │   │                │
│         │  │  - JPEG Tampering Detection  │   │                │
│         │  └──────────────────────────────┘   │                │
│         └──────────────────┬──────────────────┘                │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   EXTERNAL     │  │   EXTERNAL      │  │   EXTERNAL     │
│   API LAYER    │  │   API LAYER     │  │   API LAYER    │
├────────────────┤  ├─────────────────┤  ├────────────────┤
│                │  │                 │  │                │
│  Sightengine   │  │  Google Gemini  │  │  ML Model      │
│  API           │  │  API            │  │  (PyTorch)     │
│                │  │                 │  │                │
│  - Visual      │  │  - Video        │  │  - Local       │
│    Analysis    │  │    Transcription│  │    Inference   │
│  - Deepfake    │  │  - Transcript   │  │  - EfficientNet│
│    Detection   │  │    Analysis     │  │    Architecture│
│                │  │                 │  │                │
└────────────────┘  └─────────────────┘  └────────────────┘
```

---

## Detection Flow Architecture

### Image Analysis Flow (With Faces)

```
┌─────────────┐
│ User Uploads│
│   Image     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Face Detection      │
│ Selection Prompt    │
│ (Yes/No)           │
└──────┬──────────────┘
       │ User selects "Yes"
       ▼
┌─────────────────────────────────────────────────────────┐
│              PARALLEL ANALYSIS                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │  Sightengine API │  │  ML Model API    │           │
│  │                  │  │                  │           │
│  │  - AI Generated  │  │  - AI vs Human   │           │
│  │    Score (60%)   │  │    Score (20%)   │           │
│  │                  │  │                  │           │
│  │  - Deepfake      │  │                  │           │
│  │    Score (20%)   │  │                  │           │
│  └────────┬─────────┘  └────────┬─────────┘           │
│           │                     │                      │
│           └──────────┬──────────┘                      │
│                      │                                 │
│                      ▼                                 │
│           ┌──────────────────────┐                     │
│           │  Weighted Scoring    │                     │
│           │  60% SightEngine AI  │                     │
│           │  20% ML Model        │                     │
│           │  20% SightEngine DF  │                     │
│           └──────────┬───────────┘                     │
│                      │                                 │
└──────────────────────┼─────────────────────────────────┘
                       │
                       ▼
            ┌──────────────────┐
            │  Final Result    │
            │  Display         │
            └──────────────────┘
```

### Image Analysis Flow (Without Faces)

```
┌─────────────┐
│ User Uploads│
│   Image     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Face Detection      │
│ Selection Prompt    │
│ (Yes/No)           │
└──────┬──────────────┘
       │ User selects "No"
       ▼
┌─────────────────────────────────────────┐
│      PARALLEL ANALYSIS                  │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────┐  ┌──────────────┐│
│  │  Sightengine API │  │  ML Model    ││
│  │                  │  │  API         ││
│  │  - AI Generated  │  │              ││
│  │    Score (60%)   │  │  - AI vs     ││
│  │                  │  │    Human     ││
│  │                  │  │    Score     ││
│  │                  │  │    (40%)     ││
│  └────────┬─────────┘  └──────┬───────┘│
│           │                   │         │
│           └─────────┬─────────┘         │
│                     │                   │
│                     ▼                   │
│          ┌──────────────────┐           │
│          │ Weighted Scoring │           │
│          │ 60% SightEngine  │           │
│          │ 40% ML Model     │           │
│          └────────┬─────────┘           │
│                   │                     │
└───────────────────┼─────────────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │  Final Result    │
         │  Display         │
         └──────────────────┘
```

### Video Analysis Flow

```
┌─────────────┐
│ User Uploads│
│   Video     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│              PARALLEL ANALYSIS                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │  Sightengine API │  │  Google Gemini API       │   │
│  │                  │  │                          │   │
│  │  - Visual Frame  │  │  Step 1: Upload Video    │   │
│  │    Analysis      │  │  Step 2: Poll Status     │   │
│  │    (40%)         │  │  Step 3: Transcribe      │   │
│  │                  │  │  Step 4: LLM Analysis    │   │
│  │                  │  │    - AI Speech Detection │   │
│  │                  │  │    - Impersonation       │   │
│  │                  │  │    - Deepfake Indicators │   │
│  │                  │  │    - Scam Detection      │   │
│  │                  │  │    Score (60%)           │   │
│  └────────┬─────────┘  └────────────┬─────────────┘   │
│           │                         │                  │
│           └──────────────┬──────────┘                  │
│                          │                             │
│                          ▼                             │
│           ┌──────────────────────────┐                 │
│           │  Weighted Scoring        │                 │
│           │  60% Gemini Transcript   │                 │
│           │  40% Sightengine Visual  │                 │
│           └──────────┬───────────────┘                 │
│                      │                                 │
└──────────────────────┼─────────────────────────────────┘
                       │
                       ▼
            ┌──────────────────┐
            │  Final Result    │
            │  Display         │
            └──────────────────┘
```

---

## Component Architecture

### Frontend Components

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (JavaScript)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  assets/js/deepfake-scanner.js                         │
│  ├── DeepfakeScanner Class                             │
│  │   ├── handleFileUpload()                            │
│  │   ├── analyzeUrl()                                  │
│  │   ├── combineResults()                              │
│  │   │   └── Weighted Scoring Logic                    │
│  │   ├── updateIndicatorsList()                        │
│  │   ├── displayResults()                              │
│  │   └── formatAIGeneratedAnalysis()                   │
│  │                                                      │
│  └── UI Components                                      │
│      ├── Progress Indicators                           │
│      ├── Results Display                               │
│      ├── Detection Indicators                          │
│      └── Analysis Tabs                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Backend Components

```
┌─────────────────────────────────────────────────────────┐
│              BACKEND (PHP)                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  api/sightengine.php                                    │
│  ├── SightengineAPI Class                              │
│  │   ├── analyzeFile()                                 │
│  │   │   ├── Image: Sightengine API call              │
│  │   │   └── Video: Sightengine + Gemini              │
│  │   ├── transcribeVideo()                            │
│  │   │   ├── Upload to Gemini                         │
│  │   │   ├── Poll for status                          │
│  │   │   └── Request transcription                    │
│  │   ├── analyzeTranscriptWithLLM()                   │
│  │   │   └── Gemini LLM analysis                      │
│  │   ├── analyzeResults()                             │
│  │   │   └── Weighted scoring logic                   │
│  │   └── processDetection()                           │
│  │                                                      │
│  api/ai_detection.php                                   │
│  ├── ML Model Integration                              │
│  │   ├── PyTorch Model Loading                        │
│  │   ├── Image Preprocessing                          │
│  │   └── Inference                                    │
│  │                                                      │
│  api/ela_analysis.php                                   │
│  ├── Error Level Analysis                              │
│  │   ├── JPEG Compression Analysis                    │
│  │   └── Tampering Detection                          │
│  │                                                      │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Complete Analysis Pipeline

```
┌──────────────┐
│   User       │
│   Input      │
└──────┬───────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌──────────┐    ┌──────────┐
│  Image   │    │  Video   │
│  File    │    │  File    │
└────┬─────┘    └────┬─────┘
     │               │
     │               │
     ▼               ▼
┌─────────────────────────────────────┐
│     PHP Backend Processing          │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │  File Validation             │  │
│  │  - Type Check                │  │
│  │  - Size Check                │  │
│  │  - Duration Check (Video)    │  │
│  └──────────────┬───────────────┘  │
│                 │                   │
│                 ▼                   │
│  ┌──────────────────────────────┐  │
│  │  Route to Analysis Engine    │  │
│  └──────────────┬───────────────┘  │
│                 │                   │
│     ┌───────────┴───────────┐      │
│     │                       │      │
│     ▼                       ▼      │
│  ┌──────────┐          ┌─────────┐│
│  │  Image   │          │  Video  ││
│  │  Path    │          │  Path   ││
│  └────┬─────┘          └────┬────┘│
│       │                     │      │
└───────┼─────────────────────┼──────┘
        │                     │
        │                     │
        ▼                     ▼
┌──────────────────┐  ┌──────────────────────┐
│  IMAGE ANALYSIS  │  │  VIDEO ANALYSIS      │
├──────────────────┤  ├──────────────────────┤
│                  │  │                      │
│  ┌────────────┐  │  │  ┌────────────────┐ │
│  │ Sightengine│  │  │  │ Sightengine    │ │
│  │ API Call   │  │  │  │ Visual Analysis│ │
│  │            │  │  │  │ (40%)          │ │
│  │ - genai    │  │  │  └────────┬───────┘ │
│  │ - deepfake │  │  │           │         │
│  └─────┬──────┘  │  │           │         │
│        │         │  │  ┌────────▼───────┐ │
│  ┌─────▼──────┐  │  │  │ Gemini API     │ │
│  │ ML Model   │  │  │  │                │ │
│  │ API Call   │  │  │  │ 1. Upload      │ │
│  │            │  │  │  │ 2. Poll        │ │
│  │ - PyTorch  │  │  │  │ 3. Transcribe  │ │
│  │ - Inference│  │  │  │ 4. LLM Analyze │ │
│  └─────┬──────┘  │  │  │    (60%)       │ │
│        │         │  │  └────────┬───────┘ │
│        │         │  │           │         │
│        └────┬────┘  │           │         │
│             │       │           │         │
│             ▼       │           ▼         │
│    ┌──────────────┐ │  ┌──────────────┐  │
│    │  Combine     │ │  │  Combine     │  │
│    │  Results     │ │  │  Results     │  │
│    │              │ │  │              │  │
│    │  60% SE AI   │ │  │  60% Gemini  │  │
│    │  20% ML      │ │  │  40% SE Vis  │  │
│    │  20% SE DF   │ │  │              │  │
│    └──────┬───────┘ │  └──────┬───────┘  │
│           │         │         │          │
└───────────┼─────────┴─────────┼──────────┘
            │                   │
            └─────────┬─────────┘
                      │
                      ▼
            ┌──────────────────┐
            │  JSON Response   │
            │  - Scores        │
            │  - Indicators    │
            │  - Transcript    │
            │  - Analysis      │
            └─────────┬────────┘
                      │
                      ▼
            ┌──────────────────┐
            │  Frontend        │
            │  Display         │
            └──────────────────┘
```

---

## Technology Stack

### Frontend
- **HTML5/CSS3**: Structure and styling
- **JavaScript (ES6+)**: Client-side logic
- **Fetch API**: HTTP requests
- **File API**: File handling and preview

### Backend
- **PHP 7.4+**: Server-side processing
- **cURL**: External API communication
- **JSON**: Data serialization

### External APIs
- **Sightengine API**: Visual deepfake detection
  - Models: `genai`, `deepfake`
  - Endpoints: `/1.0/check.json`, `/1.0/video/check-sync.json`
  
- **Google Gemini API**: Video transcription and LLM analysis
  - Model: `gemini-2.0-flash`
  - Endpoints: File upload, transcription, content generation

### Machine Learning
- **PyTorch**: ML model framework
- **EfficientNet**: Model architecture
- **Python 3.7+**: ML inference runtime

### Additional Tools
- **Error Level Analysis (ELA)**: JPEG tampering detection
- **FFmpeg**: Video processing (optional)

---

## Weightage System

### Image with Faces
```
Final Score = (SightEngine AI × 0.6) + (ML Model × 0.2) + (SightEngine Deepfake × 0.2)
```

### Image without Faces
```
Final Score = (SightEngine AI × 0.6) + (ML Model × 0.4)
```

### Video
```
Final Score = (Gemini Transcript × 0.6) + (SightEngine Visual × 0.4)
```

---

## API Endpoints

### Internal APIs

#### `POST api/sightengine.php`
- **Action**: `analyze_upload`
  - Uploads file for analysis
  - Returns detection results with weighted scores
  
- **Action**: `analyze_url`
  - Analyzes media from URL
  - Returns detection results

#### `POST api/ai_detection.php`
- **Action**: `analyze_upload`
  - Runs ML model inference on image
  - Returns AI vs Human probabilities

#### `POST api/ela_analysis.php`
- Runs Error Level Analysis
- Detects JPEG tampering
- Returns suspicious pixel analysis

---

## Security Features

- **Rate Limiting**: 10 scans per 5 minutes per user
- **File Validation**: Type, size, and content validation
- **CSRF Protection**: Token-based request validation
- **Input Sanitization**: XSS prevention
- **Secure File Handling**: Temporary file cleanup

---

## File Structure

```
verideep/
├── api/
│   ├── sightengine.php          # Main detection API
│   ├── ai_detection.php         # ML model API
│   └── ela_analysis.php         # JPEG analysis
├── assets/
│   ├── js/
│   │   └── deepfake-scanner.js  # Frontend logic
│   └── css/
│       └── petronas-master.css  # Styling
├── config/
│   └── database.php             # Configuration
├── deepfake-scanner.php         # Main UI
├── index.php                    # Homepage
└── ARCHITECTURE.md              # This file
```

---

## Data Flow Summary

1. **User Upload** → File validation
2. **Image**: Face detection prompt → Parallel API calls → Weighted combination
3. **Video**: Direct parallel analysis (Sightengine + Gemini) → Weighted combination
4. **Results Aggregation** → JSON response
5. **Frontend Display** → Visual indicators and detailed analysis

---

**Version**: 2.0.0  
**Last Updated**: January 2025  
**Platform**: VeriDeep by SecureTech

