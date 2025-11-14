#!/usr/bin/env python3
"""
Mr.Holmes Username Checker Wrapper
Checks username availability across multiple platforms
Requires: pip install mr-holmes or clone from https://github.com/Lucksi/Mr.Holmes
"""

import sys
import json
import subprocess
import os

def check_username(username):
    """Check username using Mr.Holmes"""
    try:
        # Try to find Mr.Holmes installation
        mr_holmes_path = None
        
        # Check common installation paths
        possible_paths = [
            'mr-holmes',
            'Mr.Holmes',
            os.path.expanduser('~/Mr.Holmes/mr-holmes.py'),
            os.path.expanduser('~/Mr.Holmes/mr-holmes'),
            '/usr/local/bin/mr-holmes',
            '/usr/bin/mr-holmes'
        ]
        
        for path in possible_paths:
            if os.path.exists(path) or subprocess.run(['which', path.split('/')[-1]], 
                                                      capture_output=True).returncode == 0:
                mr_holmes_path = path.split('/')[-1]
                break
        
        if not mr_holmes_path:
            # Try running as module
            result = subprocess.run(
                ['python', '-m', 'mr_holmes', username],
                capture_output=True,
                text=True,
                timeout=60
            )
        else:
            result = subprocess.run(
                [mr_holmes_path, username],
                capture_output=True,
                text=True,
                timeout=60
            )
        
        # Parse output (Mr.Holmes format may vary)
        platforms = []
        for line in result.stdout.split('\n'):
            if ':' in line or '|' in line:
                parts = line.split(':') if ':' in line else line.split('|')
                if len(parts) >= 2:
                    platform = parts[0].strip()
                    status = parts[1].strip().lower()
                    
                    platforms.append({
                        'platform': platform,
                        'status': status,
                        'exists': 'found' in status or 'exists' in status or 'yes' in status
                    })
        
        return {
            'success': True,
            'username': username,
            'platforms': platforms,
            'found_count': len([p for p in platforms if p.get('exists', False)])
        }
        
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'error': 'Timeout: Username check took too long',
            'username': username
        }
    except FileNotFoundError:
        return {
            'success': False,
            'error': 'Mr.Holmes not installed. Install from: https://github.com/Lucksi/Mr.Holmes',
            'username': username
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'username': username
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Username required'
        }))
        sys.exit(1)
    
    username = sys.argv[1]
    result = check_username(username)
    print(json.dumps(result))

