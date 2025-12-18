from flask import Blueprint, request, jsonify
from db import get_db_connection
from utilies.email import enviar_correo_con_pdf
from utilies.whatsapp import enviar_whatsapp
from utilies.pdf import generar_factura_pdf
from datetime import datetime

orden_bp = Blueprint("orden", __name__)

def limpiar_fecha(fecha_str):
    if not fecha_str: return None
    try:
        if "GMT" in str(fecha_str):
            dt = datetime.strptime(fecha_str, '%a, %d %b %Y %H:%M:%S %Z')
            return dt.strftime('%Y-%m-%d')
        return str(fecha_str).split('T')[0]
    except Exception: return str(fecha_str)

# 1. LISTAR ORDENES (GET)
@orden_bp.route("/orden", methods=["GET"])
def listar_ordenes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    sql = """
        SELECT 
            o.*, 
            v.placa, 
            v.id_cliente, 
            c.nombre AS nombre_cliente 
        FROM ordenes_trabajo o
        LEFT JOIN vehiculo v ON o.id_vehiculo = v.id_vehiculo
        LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
        ORDER BY o.id_ordenes DESC
    """
    cursor.execute(sql)
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)

# 2. CREAR ORDEN (POST)
@orden_bp.route("/orden", methods=["POST"])
def crear_orden():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = """
    INSERT INTO ordenes_trabajo 
    (estado, fecha_ingreso, fecha_salida, diagnostico, id_vehiculo, id_empleado)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (
        data.get("estado"),
        limpiar_fecha(data.get("fecha_ingreso")),
        limpiar_fecha(data.get("fecha_salida")),     
        data.get("diagnostico"),      
        data.get("id_vehiculo"),
        data.get("id_empleado")
    ))
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({"id_ordenes": new_id, "message": "Orden creada"})

# 3. ACTUALIZAR Y FINALIZAR (PUT)
@orden_bp.route("/orden/<int:id_ordenes>", methods=["PUT"])
def actualizar_orden(id_ordenes):
    data = request.json
    nuevo_estado = str(data.get("estado", "")).lower()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # 1. Actualizar estado y diagnóstico en la orden de trabajo
    cursor.execute("UPDATE ordenes_trabajo SET estado=%s, diagnostico=%s WHERE id_ordenes=%s", 
                   (data.get("estado"), data.get("diagnostico"), id_ordenes))
    conn.commit()

    if nuevo_estado == "finalizado":
        # Buscamos la factura que el frontend ya insertó previamente
        cursor.execute("""
            SELECT f.id_factura, f.total, v.placa, c.nombre, c.email, c.telefono
            FROM factura f
            JOIN cliente c ON f.id_cliente = c.id_cliente
            JOIN vehiculo v ON c.id_cliente = v.id_cliente
            JOIN ordenes_trabajo o ON v.id_vehiculo = o.id_vehiculo
            WHERE o.id_ordenes = %s
            ORDER BY f.id_factura DESC LIMIT 1
        """, (id_ordenes,))
        info = cursor.fetchone()

        if info:
            id_f = info['id_factura']
            total_factura = info['total']

            # 2. Consultar detalles registrados para el PDF
            sql_pdf = """
                SELECT 
                    COALESCE(m.descripcion, i.nombre, 'Servicio Técnico') AS descripcion, 
                    df.subtotal AS costo
                FROM detalle_factura df
                LEFT JOIN mano_obra m ON df.id_mano = m.id_mano
                LEFT JOIN inventario i ON df.id_inventario = i.id_inventario
                WHERE df.id_factura = %s
            """
            cursor.execute(sql_pdf, (id_f,))
            items_finales = cursor.fetchall()

            # 3. Generar el PDF profesional
            ruta_pdf = generar_factura_pdf(
                id_factura=id_f,
                cliente=info["nombre"],
                total=total_factura,
                placa=info["placa"],
                fecha=datetime.now().strftime('%Y-%m-%d'),
                items_mano_obra=items_finales
            )

            # 4. Notificaciones con textos profesionales
            try:
                # --- Configuración de Correo ---
                asunto_correo = f"Factura de Servicio Electrónica - Orden #{id_ordenes} - MOTO GP WORKSHOP"
                cuerpo_correo = f"""
Estimado/a {info['nombre']},

Le informamos que el servicio técnico de su vehículo con placa {info['placa']} ha sido completado exitosamente. 

Adjunto a este mensaje encontrará su factura detallada en formato PDF. Agradecemos su confianza.
Atentamente,
El equipo de MOTO GP WORKSHOP
                """
                enviar_correo_con_pdf(info["email"], asunto_correo, cuerpo_correo, ruta_pdf)

                # --- Configuración de WhatsApp ---
                mensaje_ws = (
                    f"✅ *MOTO GP WORKSHOP Informa:* \n\n"
                    f"Hola {info['nombre']}, le notificamos que su vehículo con placa *{info['placa']}* ya se encuentra listo para ser retirado. \n\n"
                    f"Hemos enviado el detalle de la factura a su correo electrónico: {info['email']}. \n\n"
                    f"¡Gracias por elegirnos! 🚗"
                )
                enviar_whatsapp(info["telefono"], mensaje_ws)

            except Exception as e:
                print(f"Error enviando notificaciones: {e}")

    cursor.close()
    conn.close()
    return jsonify({"message": "Estado actualizado correctamente", "status": "success"})