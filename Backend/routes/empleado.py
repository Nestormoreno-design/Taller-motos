from flask import Blueprint, request, jsonify
from flask_login import login_required
from werkzeug.security import generate_password_hash
from db import get_db_connection

empleado_bp = Blueprint("empleado", __name__)


@empleado_bp.route("/empleado", methods=["GET"])
@login_required
def get_empleado():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM empleado")
    empleado = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(empleado)


# ================================
# GET EMPLEADO BY ID
# ================================
@empleado_bp.route("/empleado/<int:id>", methods=["GET"])
@login_required
def get_empleados(id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM empleado WHERE id_empleado=%s", (id,))
    empleado = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify(empleado)


# ================================
# ADD EMPLEADO
# ================================
@empleado_bp.route("/empleado", methods=["POST"])
@login_required
def add_empleado():
    data = request.json
    nombre = data.get("nombre")
    rol = data.get("rol")
    usuario = data.get("usuario")
    password = data.get("password")

    hashed_pw = generate_password_hash(password)

    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
        INSERT INTO empleado (nombre, rol, usuario, contrasena_hash)
        VALUES (%s, %s, %s, %s)
    """
    cursor.execute(sql, (nombre, rol, usuario, hashed_pw))
    conn.commit()

    cursor.close()
    conn.close()
    return jsonify({"message": "Empleado agregado correctamente"})


# ================================
# UPDATE EMPLEADO
# ================================
@empleado_bp.route("/empleado/<int:id>", methods=["PUT"])
@login_required
def update_empleado(id):
    data = request.json
    nombre = data.get("nombre")
    rol = data.get("rol")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Si viene contraseña nueva → re-hash
    if password:
        hashed_pw = generate_password_hash(password)
        sql = """
            UPDATE empleado
            SET nombre=%s, rol=%s, contrasena_hash=%s
            WHERE id_empleado=%s
        """
        cursor.execute(sql, (nombre, rol, hashed_pw, id))
    else:
        sql = """
            UPDATE empleado
            SET nombre=%s, rol=%s
            WHERE id_empleado=%s
        """
        cursor.execute(sql, (nombre, rol, id))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Empleado actualizado correctamente"})


# ================================
# DELETE EMPLEADO
# ================================
@empleado_bp.route("/empleado/<int:id>", methods=["DELETE"])
@login_required
def delete_empleado(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM empleado WHERE id_empleado=%s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Empleado eliminado correctamente"})
