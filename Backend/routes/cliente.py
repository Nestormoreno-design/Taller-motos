
from flask import Blueprint, request, jsonify
from db import get_db_connection

cliente_bp = Blueprint("cliente", __name__)

@cliente_bp.get("/cliente")
def listar_clientes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cliente")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)

@cliente_bp.post("/cliente")
def crear_cliente():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """INSERT INTO cliente (nombre, telefono, email, direccion)
             VALUES (%s, %s, %s, %s)"""
    cursor.execute(sql, (
        data["nombre"],
        data["telefono"],
        data["email"],
        data["direccion"]
    ))
    conn.commit()
    new_id = cursor.lastrowid

    cursor.close()
    conn.close()
    return jsonify({"id_cliente": new_id, "message": "Cliente creado"})

@cliente_bp.put("/cliente/<int:id_cliente>")
def actualizar_cliente(id_cliente):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """UPDATE cliente SET nombre=%s, telefono=%s, email=%s, direccion=%s
             WHERE id_cliente=%s"""
    cursor.execute(sql, (
        data["nombre"],
        data["telefono"],
        data["email"],
        data["direccion"],
        id_cliente
    ))
    conn.commit()

    cursor.close()
    conn.close()
    return jsonify({"message": "Cliente actualizado"})

@cliente_bp.delete("/cliente/<int:id_cliente>")
def eliminar_cliente(id_cliente):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM cliente WHERE id_cliente=%s", (id_cliente,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Cliente eliminado"})
