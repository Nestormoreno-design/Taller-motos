from flask import Blueprint, request, jsonify
from flask_login import login_required
from db import get_db_connection
import math

proveedores_bp = Blueprint("proveedores", __name__)

@proveedores_bp.route("/proveedores", methods=["GET"])
@login_required
def listar_proveedores():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '', type=str)
    offset = (page - 1) * per_page

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    search_param = f"%{search}%"

    # 1. Contar total de proveedores que coinciden con la búsqueda
    count_sql = """
        SELECT COUNT(*) as total FROM proveedores 
        WHERE nombre LIKE %s OR email LIKE %s OR telefono LIKE %s
    """
    cursor.execute(count_sql, (search_param, search_param, search_param))
    total_records = cursor.fetchone()['total']

    # 2. Obtener registros paginados (Ordenados por ID)
    data_sql = """
        SELECT * FROM proveedores
        WHERE nombre LIKE %s OR email LIKE %s OR telefono LIKE %s
        ORDER BY id_proveedores ASC
        LIMIT %s OFFSET %s
    """
    cursor.execute(data_sql, (search_param, search_param, search_param, per_page, offset))
    data = cursor.fetchall()

    cursor.close()
    conn.close()

    total_pages = math.ceil(total_records / per_page) if total_records > 0 else 1

    return jsonify({
        "data": data,
        "total_pages": total_pages,
        "current_page": page,
        "total_records": total_records
    })

# ... (mantén tus rutas de POST, PUT y DELETE iguales)