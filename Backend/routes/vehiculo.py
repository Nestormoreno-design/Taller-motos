from flask import Blueprint, request, jsonify
from db import get_db_connection

vehiculo_bp = Blueprint("vehiculo", __name__)

# ---------------------------------------------------------
# LISTAR VEHÍCULOS
# ---------------------------------------------------------
@vehiculo_bp.get("/vehiculo")
def listar_vehiculos():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM vehiculo")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)

# ---------------------------------------------------------
# CREAR VEHÍCULO
# ---------------------------------------------------------
@vehiculo_bp.post("/vehiculo")
def crear_vehiculo():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
        INSERT INTO vehiculo (marca, modelo, anio, placa, kilometraje, id_cliente)
        VALUES (%s, %s, %s, %s, %s, %s)
    """

    cursor.execute(sql, (
        data["marca"],
        data["modelo"],
        data["anio"],
        data["placa"],
        data["kilometraje"],
        data["id_cliente"]
    ))

    conn.commit()
    new_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({"id_vehiculo": new_id, "message": "Vehículo creado"})

# ---------------------------------------------------------
# ACTUALIZAR VEHÍCULO
# ---------------------------------------------------------
@vehiculo_bp.put("/vehiculo/<int:id_vehiculo>")
def actualizar_vehiculo(id_vehiculo):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
        UPDATE vehiculo
        SET marca=%s, modelo=%s, anio=%s, placa=%s, kilometraje=%s, id_cliente=%s
        WHERE id_vehiculo=%s
    """

    cursor.execute(sql, (
        data["marca"],
        data["modelo"],
        data["anio"],
        data["placa"],
        data["kilometraje"],
        data["id_cliente"],
        id_vehiculo
    ))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Vehículo actualizado"})

# ---------------------------------------------------------
# ELIMINAR VEHÍCULO
# ---------------------------------------------------------
@vehiculo_bp.delete("/vehiculo/<int:id_vehiculo>")
def eliminar_vehiculo(id_vehiculo):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM vehiculo WHERE id_vehiculo=%s", (id_vehiculo,))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Vehículo eliminado"})
