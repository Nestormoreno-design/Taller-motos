import os
import math 
from flask import Blueprint, request, jsonify, send_from_directory
from flask_login import login_required
from db import get_db_connection
from utilies.pdf import generar_factura_pdf 
from utilies.email import enviar_correo_con_pdf
from utilies.whatsapp import enviar_whatsapp
from datetime import datetime

factura_bp = Blueprint("factura", __name__)

# --- CONFIGURACIÓN DE RUTAS ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOLDER_FACTURAS = os.path.join(BASE_DIR, "facturas")

if not os.path.exists(FOLDER_FACTURAS):
    os.makedirs(FOLDER_FACTURAS, exist_ok=True)

# -----------------------------
# LISTAR FACTURAS (CON PAGINACIÓN)
# -----------------------------
@factura_bp.route("/factura", methods=["GET"])
@login_required
def listar_facturas():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    offset = (page - 1) * per_page

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT COUNT(*) as total FROM factura")
    total_records = cursor.fetchone()['total']

    query = "SELECT * FROM factura ORDER BY id_factura DESC LIMIT %s OFFSET %s"
    cursor.execute(query, (per_page, offset))
    data = cursor.fetchall()

    cursor.close()
    conn.close()

    total_pages = math.ceil(total_records / per_page)

    return jsonify({
        "data": data,
        "total_pages": total_pages,
        "current_page": page,
        "total_records": total_records
    })

# -----------------------------
# CREAR FACTURA (GUARDA DATOS Y DETALLES)
# -----------------------------
@factura_bp.route("/factura", methods=["POST"])
@login_required
def crear_factura():
    data = request.json
    fecha = data.get("fecha")
    total = data.get("total", 0)
    id_empleado = data.get("id_empleado")
    id_cliente = data.get("id_cliente")
    detalles = data.get("detalles", []) 

    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        sql = "INSERT INTO factura (fecha, total, id_empleado, id_cliente) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (fecha, total, id_empleado, id_cliente))
        new_id = cursor.lastrowid

        if detalles:
            sql_det = "INSERT INTO detalle_factura (id_factura, id_inventario, id_mano, id_vehiculo, subtotal) VALUES (%s, %s, %s, %s, %s)"
            for d in detalles:
                cursor.execute(sql_det, (
                    new_id, 
                    d.get('id_inventario'), 
                    d.get('id_mano'), 
                    d.get('id_vehiculo'), 
                    d.get('subtotal')
                ))

        conn.commit()
        return jsonify({"id_factura": new_id, "message": "Factura creada correctamente"}), 201
    except Exception as e:
        conn.rollback()
        print(f"Error guardando factura: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

#------------------------------------------------------
#ELIMINAR FACTURA (Y SUS DETALLES)
#------------------------------------------------------
# -----------------------------
# ELIMINAR FACTURA (Y PDF ASOCIADO)
# -----------------------------
@factura_bp.route("/factura/<int:id_factura>", methods=["DELETE"])
@login_required
def eliminar_factura(id_factura):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Eliminar el archivo PDF primero (si existe)
    filename = f"factura_{id_factura}.pdf"
    file_path = os.path.join(FOLDER_FACTURAS, filename)
    
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            # Aunque no pueda eliminar el archivo, la BD puede continuar
            print(f"Advertencia: No se pudo eliminar el archivo PDF {filename}. Error: {e}")

    try:
        # 2. Eliminar los detalles de la factura (foreign key constraint)
        cursor.execute("DELETE FROM detalle_factura WHERE id_factura = %s", (id_factura,))
        
        # 3. Eliminar la factura principal
        cursor.execute("DELETE FROM factura WHERE id_factura = %s", (id_factura,))
        
        if cursor.rowcount == 0:
            conn.rollback()
            return jsonify({"error": f"Factura {id_factura} no encontrada o ya eliminada"}), 404

        conn.commit()
        return jsonify({"message": f"Factura {id_factura} eliminada correctamente"}), 200

    except Exception as e:
        conn.rollback()
        print(f"Error eliminando factura {id_factura}: {e}")
        return jsonify({"error": f"Error del servidor al eliminar: {e}"}), 500
        
    finally:
        cursor.close()
        conn.close()

# -----------------------------
# NOTIFICAR FACTURA (GENERA PDF Y ENVÍA MENSAJES)
# -----------------------------
@factura_bp.route("/factura/<int:id_factura>/notificar", methods=["POST"])
@login_required
def notificar_factura(id_factura):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
        SELECT f.total, f.fecha, c.nombre, c.email, c.telefono, v.placa
        FROM factura f
        JOIN cliente c ON f.id_cliente = c.id_cliente
        LEFT JOIN detalle_factura df ON f.id_factura = df.id_factura
        LEFT JOIN vehiculo v ON df.id_vehiculo = v.id_vehiculo
        WHERE f.id_factura = %s
        LIMIT 1
    """
    cursor.execute(query, (id_factura,))
    info = cursor.fetchone()

    query_items = """
        SELECT COALESCE(i.nombre, mo.descripcion, 'Servicio') as descripcion, df.subtotal as costo
        FROM detalle_factura df
        LEFT JOIN inventario i ON df.id_inventario = i.id_inventario
        LEFT JOIN mano_obra mo ON df.id_mano = mo.id_mano
        WHERE df.id_factura = %s
    """
    cursor.execute(query_items, (id_factura,))
    items_factura = cursor.fetchall()

    cursor.close()
    conn.close()

    if not info:
        return jsonify({"error": "No se encontró la factura"}), 404

    ruta_pdf = generar_factura_pdf(
        id_factura, 
        info['nombre'], 
        info['total'], 
        fecha=str(info['fecha']), 
        placa=info.get('placa', 'N/A'),
        items_mano_obra=items_factura
    )

    if not os.path.exists(ruta_pdf):
        return jsonify({"error": "Error al generar el archivo físico del PDF"}), 500

    try:
        asunto_correo = f"Factura de Servicio Electrónica #{id_factura} - Moto GP Workshop"
        cuerpo_correo = f"Hola {info['nombre']},\n\nAdjuntamos su factura por el servicio realizado a su vehículo."
        
        enviar_correo_con_pdf(info['email'], asunto_correo, cuerpo_correo, ruta_pdf)
        
        mensaje_ws = f"✅ *Moto GP Workshop:* Hola {info['nombre']}, su factura #{id_factura} por ${info['total']:,} ya está lista. 🏍️"
        enviar_whatsapp(info['telefono'], mensaje_ws)
        
        return jsonify({"message": "Notificaciones enviadas con éxito", "pdf": ruta_pdf}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# DESCARGAR PDF
# -----------------------------
@factura_bp.route("/factura/descargar/<int:id_factura>", methods=["GET"])
def descargar_pdf(id_factura):
    filename = f"factura_{id_factura}.pdf"
    file_path = os.path.join(FOLDER_FACTURAS, filename)
    if os.path.exists(file_path):
        return send_from_directory(FOLDER_FACTURAS, filename, as_attachment=True)
    return jsonify({"error": "El archivo PDF no existe"}), 404

# ---------------------------------------------------------
# NUEVA FUNCIÓN: SOLO GENERAR ARCHIVO (SIN NOTIFICAR)
# ---------------------------------------------------------
@factura_bp.route("/factura/<int:id_factura>/generar-archivo", methods=["POST"])
@login_required
def generar_archivo_pdf(id_factura):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT f.total, f.fecha, c.nombre, v.placa
            FROM factura f
            JOIN cliente c ON f.id_cliente = c.id_cliente
            LEFT JOIN detalle_factura df ON f.id_factura = df.id_factura
            LEFT JOIN vehiculo v ON df.id_vehiculo = v.id_vehiculo
            WHERE f.id_factura = %s LIMIT 1
        """
        cursor.execute(query, (id_factura,))
        info = cursor.fetchone()

        if not info:
            return jsonify({"error": "Factura no encontrada"}), 404

        query_items = """
            SELECT COALESCE(i.nombre, mo.descripcion, 'Servicio') as descripcion, 
                   CAST(df.subtotal AS CHAR) as costo
            FROM detalle_factura df
            LEFT JOIN inventario i ON df.id_inventario = i.id_inventario
            LEFT JOIN mano_obra mo ON df.id_mano = mo.id_mano
            WHERE df.id_factura = %s
        """
        cursor.execute(query_items, (id_factura,))
        items_factura = cursor.fetchall()

        ruta_pdf = generar_factura_pdf(
            id_factura, info['nombre'], float(info['total']), 
            fecha=str(info['fecha']), placa=info.get('placa', 'N/A'),
            items_mano_obra=items_factura
        )

        return jsonify({"status": "success", "message": "PDF generado", "ruta": ruta_pdf}), 200
    except Exception as e:
        print(f"Error generando archivo: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()