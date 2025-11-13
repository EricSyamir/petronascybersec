# AI Content Detector Web Application

A modern PHP/HTML web application that uses the SightEngine API to detect AI-generated images.

## Features

- 🖼️ **Image Upload**: Drag & drop or click to upload images
- 🔗 **URL Support**: Analyze images directly from URLs
- 🤖 **AI Detection**: Uses SightEngine's advanced AI detection models
- 📊 **Confidence Scoring**: Shows confidence percentage for detection results
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations and tabbed interface
- 🔒 **File Validation**: Secure file upload with size and type validation
- ⚡ **Real-time Results**: Instant feedback with loading indicators
- 🔄 **Dual Mode**: Switch between file upload and URL input seamlessly

## Files Structure

```
PetronasCyberCrime/
├── index.html          # Main web interface
├── check_ai.php        # API handler for AI detection
├── config.php          # Configuration file
├── uploads/            # Temporary upload directory (auto-created)
└── README.md           # This file
```

## Setup Instructions

### 1. Prerequisites
- PHP 7.4 or higher
- cURL extension enabled
- Web server (Apache/Nginx) or local development server

### 2. Configuration
The application is already configured with your SightEngine API credentials:
- **API User**: 1931720966
- **API Secret**: Ey7EbcJMjAtQZDiD38xLtyXvJrqpCVmw

If you need to change these credentials, edit the `config.php` file.

### 3. Running the Application

#### Option A: Using XAMPP (Recommended for Windows)
1. Copy all files to your XAMPP `htdocs` directory
2. Start Apache from XAMPP Control Panel
3. Open your browser and navigate to `http://localhost/PetronasCyberCrime/`

#### Option B: Using PHP Built-in Server
1. Open command prompt in the project directory
2. Run: `php -S localhost:8000`
3. Open your browser and navigate to `http://localhost:8000/`

## How to Use

1. **Open the Application**: Navigate to the application URL in your web browser

2. **Choose Input Method**: 
   - **Upload Tab**: Upload an image file from your device
   - **URL Tab**: Provide a direct link to an image

3. **Upload an Image** (Upload Tab):
   - Click the upload area or drag & drop an image file
   - Supported formats: JPG, PNG, GIF, WebP
   - Maximum file size: 10MB

4. **Enter Image URL** (URL Tab):
   - Paste a publicly accessible image URL
   - Supported sources: Direct image links, SightEngine examples, Imgur, Unsplash, etc.
   - Example: `https://sightengine.com/assets/img/examples/example7.jpg`

5. **Analyze**: Click the "Analyze Image" button

6. **View Results**: The application will show:
   - Whether the image is AI-generated or human-created
   - Confidence percentage
   - Color-coded results (red for AI, green for human)
   - Detection method used (upload or URL)

## API Response Format

The SightEngine API returns results in this format:
```json
{
  "status": "success",
  "request": {
    "id": "req_id",
    "timestamp": 1699123456.789,
    "operations": 1
  },
  "type": {
    "ai_generated": 0.85
  }
}
```

## Security Features

- File type validation (only images allowed)
- File size limits (10MB maximum)
- Temporary file cleanup after processing
- Input sanitization and error handling
- CSRF protection through proper form handling

## Troubleshooting

### Common Issues

1. **"No file uploaded" error**
   - Ensure you've selected a valid image file
   - Check that the file size is under 10MB

2. **"API request failed" error**
   - Verify your internet connection
   - Check that the SightEngine API credentials are correct
   - Ensure the SightEngine service is accessible

3. **"Invalid image file" error**
   - Make sure you're uploading a valid image format
   - Try a different image file

4. **Upload directory errors**
   - Ensure the web server has write permissions
   - The `uploads/` directory will be created automatically

### Debug Mode
To enable detailed error reporting, the application includes debug information in the API response. Check the browser's developer console for detailed error messages.

## Customization

### Changing API Credentials
Edit `config.php` and update:
```php
define('SIGHTENGINE_API_USER', 'your_api_user');
define('SIGHTENGINE_API_SECRET', 'your_api_secret');
```

### Modifying File Limits
Edit `config.php` to change:
```php
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // Change size limit
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp']); // Add/remove formats
```

### Styling Changes
The CSS is embedded in `index.html`. You can modify the styles in the `<style>` section to customize the appearance.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

This application is provided as-is for educational and demonstration purposes.

## Support

For issues with the SightEngine API, visit: https://sightengine.com/docs/
For application-specific issues, check the troubleshooting section above.
