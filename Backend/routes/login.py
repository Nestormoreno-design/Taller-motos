from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db_connection
from models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


# ==========================
# REGISTRO
# ==========================
@auth_bp.route("/registrarse", methods=["POST"])
def registrarse():
    data = request.json

    nombre = data.get("nombre")
    usuario = data.get("usuario")
    password = data.get("password")
    rol = data.get("rol", "empleado")

    if not usuario or not password or not nombre:
        return jsonify({"error": "Datos incompletos"}), 400

    hashed_pw = generate_password_hash(password)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        sql = """
            INSERT INTO empleado (nombre, usuario, contrasena_hash, rol)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (nombre, usuario, hashed_pw, rol))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "Usuario ya existe"}), 400
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": "Registro exitoso"}), 201


# ==========================
# LOGIN (Corregido para enviar el NOMBRE)
# ==========================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    usuario = data.get("usuario")
    password = data.get("password")

    if not usuario or not password:
        return jsonify({"error": "Usuario y contraseña requeridos"}), 400

    user = User.get_by_usuario(usuario)

    if user and check_password_hash(user.password, password):
        login_user(user)
        return jsonify({
            "message": "Login exitoso",
            "user": {
                "id": user.id,
                "usuario": user.usuario,
                "nombre": user.nombre  # <--- Agregado para el Dashboard
            }
        }), 200

    return jsonify({"error": "Credenciales incorrectas"}), 401


# ==========================
# LOGOUT
# ==========================
@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Sesión cerrada"}), 200


# ==========================
# USUARIO ACTUAL (Corregido para enviar el NOMBRE)
# ==========================
@auth_bp.route("/me", methods=["GET"])
@login_required
def me():
    return jsonify({
        "id": current_user.id,
        "usuario": current_user.usuario,
        "nombre": current_user.nombre  # <--- Agregado para persistencia (F5)
    }), 200