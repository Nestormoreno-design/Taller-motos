from flask import Blueprint, request, jsonify
from flask_login import login_required
from db import get_db_connection
import math

inventario_bp = Blueprint("inventario", __name__)

@inventario_bp.route("/inventario", methods=["GET"])
@login_required
def listar_inventario():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '', type=str)
    offset = (page - 1) * per_page

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    search_param = f"%{search}%"

    try:
        # Contar total con búsqueda
        count_sql = "SELECT COUNT(*) as total FROM inventario WHERE nombre LIKE %s OR codigo LIKE %s"
        cursor.execute(count_sql, (search_param, search_param))
        total_records = cursor.fetchone()['total']

        # Obtener datos con el NOMBRE del proveedor ya incluido (JOIN)
        data_sql = """
            SELECT i.*, p.nombre as nombre_proveedor 
            FROM inventario i
            LEFT JOIN proveedores p ON i.id_proveedores = p.id_proveedores
            WHERE i.nombre LIKE %s OR i.codigo LIKE %s
            ORDER BY i.id_inventario ASC
            LIMIT %s OFFSET %s
        """
        cursor.execute(data_sql, (search_param, search_param, per_page, offset))
        data = cursor.fetchall()

        return jsonify({
            "data": data,
            "total_pages": math.ceil(total_records / per_page) if total_records > 0 else 1,
            "current_page": page,
            "total_records": total_records
        })
    finally:
        cursor.close()
        conn.close()