from flask import Blueprint, request, jsonify
from flask_login import login_required
from db import get_db_connection

detalle_bp = Blueprint("detalle", __name__)

@detalle_bp.route("/detalle", methods=["POST"])
@login_required
def crear_detalle():
    data = request.json
    id_inventario = data.get("id_inventario")
    id_mano = data.get("id_mano")
    id_factura = data.get("id_factura")
    id_vehiculo = data.get("id_vehiculo")
    cantidad = data.get("cantidad", 1)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    precio_unitario = 0

    try:
        if id_inventario:
            # Verifica que la tabla sea 'inventario' e ID sea 'id_inventario'
            cursor.execute("SELECT precio_venta FROM inventario WHERE id_inventario=%s", (id_inventario,))
            res = cursor.fetchone()
            if res: precio_unitario = res["precio_venta"]
        elif id_mano:
            # AJUSTA EL NOMBRE DE LA TABLA AQUÍ: ¿mano_obra, mano o manos?
            cursor.execute("SELECT costo FROM mano_obra WHERE id_mano=%s", (id_mano,))
            res = cursor.fetchone()
            if res: precio_unitario = res["costo"]

        subtotal = float(precio_unitario) * int(cantidad)

        sql = """
            INSERT INTO detalle_factura (subtotal, id_factura, id_inventario, id_vehiculo, id_mano)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (subtotal, id_factura, id_inventario, id_vehiculo, id_mano))
        conn.commit()
        
        return jsonify({"status": "success", "subtotal": subtotal}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()