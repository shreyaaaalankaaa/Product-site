#!/usr/bin/env python3
"""
Simple HTTP server for serving the ShopHub e-commerce showcase website.
Serves static files and handles CORS for local development.
"""

import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
import mimetypes
from urllib.parse import urlparse, unquote

class ShopHubHTTPRequestHandler(SimpleHTTPRequestHandler):
    """
    Custom request handler with proper MIME types and CORS support
    """
    
    def __init__(self, *args, **kwargs):
        # Add additional MIME types
        mimetypes.add_type('application/javascript', '.js')
        mimetypes.add_type('text/css', '.css')
        mimetypes.add_type('application/json', '.json')
        mimetypes.add_type('image/svg+xml', '.svg')
        mimetypes.add_type('text/html', '.html')
        super().__init__(*args, **kwargs)
    
    def end_headers(self):
        """Add CORS headers and cache control"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        
        # Cache control for static assets
        if self.path.endswith(('.css', '.js', '.svg', '.json')):
            self.send_header('Cache-Control', 'public, max-age=3600')  # 1 hour
        elif self.path.endswith('.html') or self.path == '/':
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
        
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests with proper routing"""
        parsed_path = urlparse(self.path)
        path = unquote(parsed_path.path)
        
        # Serve index.html for root path
        if path == '/' or path == '':
            self.path = '/index.html'
        
        # Security: prevent directory traversal
        if '..' in path or path.startswith('/..'):
            self.send_error(403, 'Forbidden')
            return
        
        # Check if file exists
        file_path = self.translate_path(self.path)
        if os.path.isfile(file_path):
            super().do_GET()
        else:
            # For SPA routing, serve index.html for non-file paths
            if not path.startswith('/assets/') and not path.startswith('/css/') and \
               not path.startswith('/js/') and not path.startswith('/data/') and \
               not '.' in os.path.basename(path):
                self.path = '/index.html'
                super().do_GET()
            else:
                self.send_error(404, 'File not found')
    
    def log_message(self, format, *args):
        """Custom logging format"""
        timestamp = self.log_date_time_string()
        client_ip = self.address_string()
        message = format % args
        print(f"[{timestamp}] {client_ip} - {message}", file=sys.stderr)
    
    def guess_type(self, path):
        """Enhanced MIME type detection"""
        mime_type, _ = mimetypes.guess_type(path)
        
        # Default MIME types for common web files
        if mime_type is None:
            if path.endswith('.js'):
                return 'application/javascript'
            elif path.endswith('.css'):
                return 'text/css'
            elif path.endswith('.json'):
                return 'application/json'
            elif path.endswith('.svg'):
                return 'image/svg+xml'
            elif path.endswith('.html'):
                return 'text/html'
            else:
                return 'application/octet-stream'
        
        return mime_type

def run_server(port=5000, host='0.0.0.0'):
    """
    Start the development server
    
    Args:
        port (int): Port number to serve on
        host (str): Host address to bind to
    """
    try:
        # Change to script directory to serve files from correct location
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        
        # Create server
        server_address = (host, port)
        httpd = HTTPServer(server_address, ShopHubHTTPRequestHandler)
        
        print(f"\n🚀 ShopHub Development Server Starting...")
        print(f"📂 Serving files from: {script_dir}")
        print(f"🌐 Server URL: http://{host}:{port}")
        print(f"🔗 Local URL: http://localhost:{port}")
        print(f"⚡ Press Ctrl+C to stop the server\n")
        
        # Validate required files exist
        required_files = [
            'index.html',
            'css/styles.css',
            'css/themes.css',
            'js/main.js',
            'js/products.js',
            'js/modal.js',
            'js/theme.js',
            'data/products.json',
            'assets/icons.svg'
        ]
        
        missing_files = []
        for file_path in required_files:
            if not os.path.exists(file_path):
                missing_files.append(file_path)
        
        if missing_files:
            print("⚠️  Warning: Missing files detected:")
            for missing_file in missing_files:
                print(f"   ❌ {missing_file}")
            print()
        else:
            print("✅ All required files found")
            print()
        
        # Start serving
        httpd.serve_forever()
        
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
        httpd.socket.close()
        sys.exit(0)
        
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"\n❌ Error: Port {port} is already in use")
            print(f"💡 Try running with a different port: python server.py --port 5001")
        else:
            print(f"\n❌ Server error: {e}")
        sys.exit(1)
        
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)

def main():
    """Main entry point with argument parsing"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='ShopHub E-commerce Showcase Development Server',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python server.py                    # Default: localhost:5000
  python server.py --port 8080        # Custom port
  python server.py --host 0.0.0.0     # Bind to all interfaces
  python server.py --port 3000 --host 127.0.0.1  # Custom host and port
        """
    )
    
    parser.add_argument(
        '--port', '-p',
        type=int,
        default=5000,
        help='Port number to serve on (default: 5000)'
    )
    
    parser.add_argument(
        '--host',
        default='0.0.0.0',
        help='Host address to bind to (default: 0.0.0.0)'
    )
    
    parser.add_argument(
        '--version',
        action='version',
        version='ShopHub Server 1.0.0'
    )
    
    args = parser.parse_args()
    
    # Validate port range
    if not 1 <= args.port <= 65535:
        print("❌ Error: Port must be between 1 and 65535")
        sys.exit(1)
    
    # Start server
    run_server(port=args.port, host=args.host)

if __name__ == '__main__':
    main()
