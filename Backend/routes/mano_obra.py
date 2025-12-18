from flask import Blueprint, request, jsonify
from flask_login import login_required
from db import get_db_connection

mano_bp = Blueprint("mano", __name__)


@mano_bp.route("/mano", methods=["GET"])
@login_required
def listar_mano():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM mano_obra")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)


# ================================
# CREATE MANO DE OBRA
# ================================
@mano_bp.route("/mano", methods=["POST"])
@login_required
def crear_mano():
    data = request.json

    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
        INSERT INTO mano_obra (descripcion, costo, id_ordenes)
        VALUES (%s, %s, %s)
    """

    cursor.execute(sql, (
        data.get("descripcion"),
        data.get("costo"),
        data.get("id_ordenes")
    ))

    conn.commit()
    new_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({
        "id_mano": new_id,
        "message": "Mano de obra agregada correctamente"
    })


# ================================
# UPDATE MANO DE OBRA
# ================================
@mano_bp.route("/mano/<int:id_mano>", methods=["PUT"])
@login_required
def actualizar_mano(id_mano):
    data = request.json

    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
        UPDATE mano_obra
        SET descripcion=%s, costo=%s, id_ordenes=%s
        WHERE id_mano=%s
    """

    cursor.execute(sql, (
        data.get("descripcion"),
        data.get("costo"),
        data.get("id_ordenes"),
        id_mano
    ))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({
        "message": "Mano de obra actualizada correctamente"
    })


# ================================
# DELETE MANO DE OBRA
# ================================
@mano_bp.route("/mano/<int:id_mano>", methods=["DELETE"])
@login_required
def eliminar_mano(id_mano):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM mano_obra WHERE id_mano=%s",
        (id_mano,)
    )

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({
        "message": "Mano de obra eliminada correctamente"
    })
