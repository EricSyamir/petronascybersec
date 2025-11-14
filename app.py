#!/usr/bin/env python3
"""
PETRONAS Cybercrime Platform - Python Flask Application
Main application server for Render deployment
"""

import os
import json
import requests
from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
import tempfile
from datetime import datetime

app = Flask(__name__, 
            static_folder='.',
            static_url_path='',
            template_folder='templates')
CORS(app)

# Configuration
app.secret_key = os.environ.get('ENCRYPTION_KEY', 'petronas_secure_key_2024')
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads/deepfake_scans'

# Ensure upload directories exist
os.makedirs('uploads/deepfake_scans', exist_ok=True)
os.makedirs('uploads/evidence', exist_ok=True)
os.makedirs('uploads/test_ai_detection', exist_ok=True)

# Sightengine API Configuration
SIGHTENGINE_API_USER = os.environ.get('SIGHTENGINE_API_USER', '1931720966')
SIGHTENGINE_API_SECRET = os.environ.get('SIGHTENGINE_API_SECRET', 'Ey7EbcJMjAtQZDiD38xLtyXvJrqpCVmw')
SIGHTENGINE_API_URL = 'https://api.sightengine.com/1.0/check.json'

# Fake data (matching PHP version)
FAKE_SCAMMERS = [
    {
        'id': 1,
        'scammer_email': 'sc***er@example.com',
        'scammer_phone': '011-***-4567',
        'scammer_website': 'fake-petronas-job.com',
        'scammer_social_media': {'facebook': 'fakerecruitment', 'telegram': '@scammer123'},
        'scam_type': 'job',
        'description': 'Fake PETRONAS recruitment scam. Requesting payment for job application processing.',
        'verification_status': 'verified',
        'threat_level': 'high',
        'location': 'Kuala Lumpur',
        'first_reported': '2025-01-15 10:00:00',
        'last_updated': '2025-01-23 14:30:00',
        'report_count': 15,
        'is_active': True
    },
    {
        'id': 2,
        'scammer_email': 'inv***@gmail.com',
        'scammer_phone': '012-***-8901',
        'scammer_website': 'quick-crypto-profits.net',
        'scammer_social_media': {'whatsapp': '0128888901', 'instagram': '@cryptoinvestor'},
        'scam_type': 'cryptocurrency',
        'description': 'Cryptocurrency investment scam promising 500% returns in 30 days.',
        'verification_status': 'verified',
        'threat_level': 'critical',
        'location': 'Selangor',
        'first_reported': '2024-12-25 08:00:00',
        'last_updated': '2025-01-24 16:45:00',
        'report_count': 42,
        'is_active': True
    }
]

FAKE_OSINT_DATA = [
    {
        'id': 1,
        'source': 'Facebook Malaysia Cybersecurity Group',
        'content': 'New phishing campaign targeting Malaysian bank customers. Fake SMS claiming account suspension.',
        'keywords': ['phishing', 'bank', 'sms', 'maybank', 'account'],
        'threat_level': 'high',
        'location': 'Kuala Lumpur',
        'url': 'https://facebook.com/groups/malaysiasec/posts/123456',
        'collected_at': '2025-01-24 12:00:00',
        'verified': True
    }
]


def get_base_url():
    """Get base URL for the application"""
    protocol = 'https' if request.is_secure else 'http'
    return f"{protocol}://{request.host}"


@app.route('/')
def index():
    """Main index page"""
    lang = session.get('language', 'en')
    base_url = get_base_url()
    
    stats = {
        'total_scammers': len(FAKE_SCAMMERS),
        'verified_scammers': len([s for s in FAKE_SCAMMERS if s['verification_status'] == 'verified']),
        'total_reports': 1247,
        'deepfakes_detected': 89
    }
    
    return render_template('index.html', 
                         lang=lang, 
                         base_url=base_url,
                         stats=stats,
                         translations=get_translations(lang))


@app.route('/api/status.php')
@app.route('/api/status')
def status():
    """Health check endpoint"""
    python_available = True  # We're running Python!
    
    status_data = {
        'success': True,
        'status': 'online',
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'version': '1.0.0',
        'services': {
            'database': False,  # Using fake data
            'sightengine': bool(SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET),
            'gemini': True,
            'python': python_available
        },
        'overall': 'healthy' if SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET else 'degraded'
    }
    
    return jsonify(status_data)


@app.route('/api/sightengine.php', methods=['POST'])
@app.route('/api/sightengine', methods=['POST'])
def sightengine_api():
    """Sightengine API wrapper"""
    action = request.form.get('action') or request.json.get('action', '') if request.is_json else ''
    
    if action == 'analyze_upload':
        if 'media' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
        file = request.files['media']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Save temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join(tempfile.gettempdir(), filename)
        file.save(temp_path)
        
        try:
            result = analyze_with_sightengine(temp_path, is_url=False)
            return jsonify({'success': True, 'result': result})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    elif action == 'analyze_url':
        url = request.form.get('url') or (request.json.get('url', '') if request.is_json else '')
        if not url:
            return jsonify({'success': False, 'error': 'No URL provided'}), 400
        
        try:
            result = analyze_with_sightengine(url, is_url=True)
            return jsonify({'success': True, 'result': result})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    else:
        return jsonify({'success': False, 'error': 'Invalid action. Use "analyze_upload" or "analyze_url"'}), 400


def analyze_with_sightengine(media_path_or_url, is_url=False):
    """Analyze media using Sightengine API"""
    try:
        if is_url:
            params = {
                'api_user': SIGHTENGINE_API_USER,
                'api_secret': SIGHTENGINE_API_SECRET,
                'url': media_path_or_url,
                'models': 'deepfake,face-attributes'
            }
            response = requests.get(SIGHTENGINE_API_URL, params=params, timeout=60)
        else:
            with open(media_path_or_url, 'rb') as f:
                files = {'media': f}
                data = {
                    'api_user': SIGHTENGINE_API_USER,
                    'api_secret': SIGHTENGINE_API_SECRET,
                    'models': 'deepfake,face-attributes'
                }
                response = requests.post(SIGHTENGINE_API_URL, files=files, data=data, timeout=60)
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f'Sightengine API error: {str(e)}')


@app.route('/api/scammer-search.php', methods=['GET', 'POST'])
@app.route('/api/scammer-search', methods=['GET', 'POST'])
def scammer_search():
    """Search scammers"""
    query = request.args.get('q') or request.form.get('q') or request.json.get('q', '') if request.is_json else ''
    
    if not query:
        return jsonify({
            'success': True,
            'results': [],
            'total': 0
        })
    
    query_lower = query.lower()
    results = []
    
    for scammer in FAKE_SCAMMERS:
        if (query_lower in scammer['scammer_email'].lower() or
            query_lower in scammer['scammer_phone'].lower() or
            query_lower in scammer.get('scammer_website', '').lower() or
            query_lower in scammer['description'].lower()):
            results.append(scammer)
    
    return jsonify({
        'success': True,
        'results': results,
        'total': len(results)
    })


@app.route('/api/osint-collector.php', methods=['POST'])
@app.route('/api/osint-collector', methods=['POST'])
def osint_collector():
    """OSINT data collector"""
    action = request.form.get('action') or (request.json.get('action', '') if request.is_json else '')
    
    if action == 'collect_threats':
        return jsonify({
            'success': True,
            'threats': FAKE_OSINT_DATA,
            'count': len(FAKE_OSINT_DATA)
        })
    elif action == 'search_threats':
        keywords = request.form.get('keywords', '').split(',') or (request.json.get('keywords', []) if request.is_json else [])
        results = FAKE_OSINT_DATA  # Simple implementation
        return jsonify({
            'success': True,
            'threats': results,
            'count': len(results)
        })
    else:
        return jsonify({
            'success': True,
            'threats': FAKE_OSINT_DATA,
            'count': len(FAKE_OSINT_DATA)
        })


@app.route('/deepfake-scanner')
@app.route('/deepfake-scanner.php')
def deepfake_scanner():
    """Deepfake scanner page"""
    lang = session.get('language', 'en')
    base_url = get_base_url()
    return render_template('deepfake-scanner.html', 
                         lang=lang, 
                         base_url=base_url,
                         translations=get_translations(lang))


@app.route('/osint-monitor')
@app.route('/osint-monitor.php')
def osint_monitor():
    """OSINT monitor page"""
    lang = session.get('language', 'en')
    base_url = get_base_url()
    return render_template('osint-monitor.html', 
                         lang=lang, 
                         base_url=base_url,
                         translations=get_translations(lang))


@app.route('/report-incident')
@app.route('/report-incident.php')
def report_incident():
    """Report incident page"""
    lang = session.get('language', 'en')
    base_url = get_base_url()
    return render_template('report-incident.html', 
                         lang=lang, 
                         base_url=base_url,
                         translations=get_translations(lang))


@app.route('/api/language', methods=['POST'])
def set_language():
    """Set language preference"""
    lang = request.json.get('lang', 'en') if request.is_json else request.form.get('lang', 'en')
    if lang in ['en', 'bm']:
        session['language'] = lang
        return jsonify({'success': True, 'lang': lang})
    return jsonify({'success': False, 'error': 'Invalid language'}), 400


@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    # Don't serve PHP files
    if path.endswith('.php'):
        return "PHP files not supported. Please use Python endpoints.", 404
    
    # Try to serve from root directory
    if os.path.exists(path) and os.path.isfile(path):
        return send_from_directory('.', path)
    
    return "Not found", 404


def get_translations(lang='en'):
    """Get translations for a language"""
    translations = {
        'en': {
            'platform_title': 'Cybercrime Platform',
            'deepfake_scanner': 'Deepfake Scanner',
            'osint_monitor': 'OSINT Monitor',
            'report_incident': 'Report Incident',
            'welcome_title': 'Welcome to PETRONAS Cybercrime Platform',
            'welcome_subtitle': 'Protecting Malaysia\'s digital ecosystem',
            'report_now': 'Report Now',
            'scan_media': 'Scan Media',
            'total_reports': 'Total Reports',
            'deepfakes_detected': 'Deepfakes Detected'
        },
        'bm': {
            'platform_title': 'Platform Jenayah Siber',
            'deepfake_scanner': 'Pengimbas Deepfake',
            'osint_monitor': 'Monitor OSINT',
            'report_incident': 'Laporkan Insiden',
            'welcome_title': 'Selamat Datang ke Platform Jenayah Siber PETRONAS',
            'welcome_subtitle': 'Melindungi ekosistem digital Malaysia',
            'report_now': 'Lapor Sekarang',
            'scan_media': 'Imbas Media',
            'total_reports': 'Jumlah Laporan',
            'deepfakes_detected': 'Deepfake Dikesan'
        }
    }
    return translations.get(lang, translations['en'])


@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'success': False, 'error': 'File too large. Maximum size is 50MB'}), 413


@app.errorhandler(404)
def not_found(error):
    return "Page not found", 404


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

