import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3003))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"🚀 Upload Microservice starting on port {port}")
    print(f"🔧 Debug mode: {debug}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )