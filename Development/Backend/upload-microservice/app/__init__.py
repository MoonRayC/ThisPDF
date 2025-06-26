from flask import Flask
from flasgger import Swagger
from app.config.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Swagger config (optional customization)
    Swagger(app)

    from app.routes.upload_routes import upload_bp
    app.register_blueprint(upload_bp)

    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'upload-microservice'}, 200

    return app
