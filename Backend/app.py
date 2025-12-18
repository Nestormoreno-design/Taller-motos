from flask import Flask, jsonify
from flask_cors import CORS
from flask_login import LoginManager
from models import User

# Blueprints
from routes.login import auth_bp
from routes.empleado import empleado_bp
from routes.cliente import cliente_bp
from routes.proveedores import proveedores_bp
from routes.vehiculo import vehiculo_bp
from routes.ordenes_trabajo import orden_bp
from routes.mano_obra import mano_bp
from routes.inventario import inventario_bp
from routes.factura import factura_bp
from routes.detalle_factura import detalle_bp

# Mail
from extensiones import mail

app = Flask(__name__)
app.secret_key = "clave_secreta_segura"

# =========================
# LOGIN MANAGER
# =========================
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "auth.login"  # Solo usado para formularios web

@login_manager.user_loader
def load_user(user_id):
    return User.get_by_id(user_id)

# =========================
# UNAUTORIZED HANDLER (para APIs)
# =========================
@login_manager.unauthorized_handler
def unauthorized_callback():
    # Devuelve JSON 401 en lugar de redirigir
    return jsonify({"error": "No autorizado"}), 401

# =========================
# CORS (React + Cookies)
# =========================
CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}
)

# =========================
# SESSION CONFIG (LOCAL)
# =========================
app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,  # ❗ FALSE en localhost
)

# =========================
# MAIL CONFIG
# =========================
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = "tallermotospyton@gmail.com"
app.config["MAIL_PASSWORD"] = "******************"

mail.init_app(app)

# =========================
# ROUTES
# =========================
@app.route("/")
def home():
    return {"status": "API Taller funcionando"}

# =========================
# REGISTER BLUEPRINTS
# =========================
app.register_blueprint(auth_bp, url_prefix="/auth")

app.register_blueprint(empleado_bp, url_prefix="/api")
app.register_blueprint(cliente_bp, url_prefix="/api")
app.register_blueprint(proveedores_bp, url_prefix="/api")
app.register_blueprint(vehiculo_bp, url_prefix="/api")
app.register_blueprint(orden_bp, url_prefix="/api")
app.register_blueprint(mano_bp, url_prefix="/api")
app.register_blueprint(inventario_bp, url_prefix="/api")
app.register_blueprint(factura_bp, url_prefix="/api")
app.register_blueprint(detalle_bp, url_prefix="/api")

# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(debug=True)
