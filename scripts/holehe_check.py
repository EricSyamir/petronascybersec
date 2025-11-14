#!/usr/bin/env python3
"""
Holehe Email Checker Wrapper
Checks if an email is registered on various websites
Requires: pip install holehe
"""

import sys
import json
import subprocess
import re

def check_email(email):
    """Check email using holehe"""
    try:
        # Run holehe command (without --only-used to get all results)
        # Use --no-color to avoid ANSI color codes in output
        result = subprocess.run(
            ['holehe', email, '--no-color'],
            capture_output=True,
            text=True,
            timeout=120  # Increased timeout for comprehensive check
        )
        
        # Parse output
        platforms = []
        total_checked = 0
        time_taken = None
        
        # Parse each line of output
        for line in result.stdout.split('\n'):
            line = line.strip()
            
            # Skip empty lines and header lines
            if not line or line.startswith('*') or 'Email used' in line or 'Email not used' in line or 'Rate limit' in line:
                continue
            
            # Check for summary line: "121 websites checked in 11.04 seconds"
            time_match = re.search(r'(\d+)\s+websites\s+checked\s+in\s+([\d.]+)\s+seconds', line)
            if time_match:
                total_checked = int(time_match.group(1))
                time_taken = float(time_match.group(2))
                continue
            
            # Parse platform lines: [x] about.me, [+] eventbrite.com, [-] amazon.com
            # Format: [status] platform_name
            match = re.match(r'\[([+\-x])\]\s+(.+)', line)
            if match:
                status_symbol = match.group(1)
                platform_name = match.group(2).strip()
                
                # Map status symbols to status
                if status_symbol == '+':
                    status = 'used'
                    found = True
                elif status_symbol == '-':
                    status = 'not_used'
                    found = False
                elif status_symbol == 'x':
                    status = 'rate_limit'
                    found = None  # Unknown due to rate limit
                else:
                    continue
                
                platforms.append({
                    'platform': platform_name,
                    'status': status,
                    'found': found,
                    'status_symbol': status_symbol
                })
        
        # Count statistics
        used_count = len([p for p in platforms if p.get('status') == 'used'])
        not_used_count = len([p for p in platforms if p.get('status') == 'not_used'])
        rate_limit_count = len([p for p in platforms if p.get('status') == 'rate_limit'])
        
        return {
            'success': True,
            'email': email,
            'platforms': platforms,
            'statistics': {
                'total_checked': total_checked or len(platforms),
                'used_count': used_count,
                'not_used_count': not_used_count,
                'rate_limit_count': rate_limit_count,
                'time_taken': time_taken
            },
            'found_count': used_count
        }
        
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'error': 'Timeout: Email check took too long (over 2 minutes)',
            'email': email
        }
    except FileNotFoundError:
        return {
            'success': False,
            'error': 'Holehe not installed. Install with: pip install holehe',
            'email': email
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Error running holehe: {str(e)}',
            'email': email,
            'raw_output': result.stdout if 'result' in locals() else None
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Email address required'
        }))
        sys.exit(1)
    
    email = sys.argv[1]
    result = check_email(email)
    print(json.dumps(result, indent=2))

