import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch


def generar_factura_pdf(id_factura, cliente, total, placa=None, fecha=None, items_mano_obra=None):
    
    # Obtiene la ruta de la carpeta donde está este archivo y sube a la raíz
    directorio_actual = os.path.dirname(os.path.abspath(__file__))
    raiz_proyecto = os.path.dirname(directorio_actual) 
    folder_path = os.path.join(raiz_proyecto, "facturas")

    if not os.path.exists(folder_path):
        os.makedirs(folder_path, exist_ok=True)

    # Ruta absoluta final
    ruta = os.path.join(folder_path, f"factura_{id_factura}.pdf")
    
    # --- INICIO DE TU LÓGICA ORIGINAL (SIN CAMBIOS) ---
    doc = SimpleDocTemplate(ruta, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = []

    color_principal = colors.HexColor("#2C3E50")

    style_title_white = ParagraphStyle(
        'TitleWhite', parent=styles['Heading1'], fontSize=20, 
        textColor=colors.white, fontName="Helvetica-Bold"
    )
    
    header_title_data = [[Paragraph("COMPROBANTE DE SERVICIO", style_title_white)]]
    header_title_table = Table(header_title_data, colWidths=[7.2*inch])
    header_title_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), color_principal),
        ('LEFTPADDING', (0,0), (-1,-1), 15),
        ('TOPPADDING', (0,0), (-1,-1), 15),
        ('BOTTOMPADDING', (0,0), (-1,-1), 15),
    ]))
    story.append(header_title_table)
    story.append(Spacer(1, 15))

    style_normal = styles["Normal"]
    info_data = [
        [Paragraph(f"<b>N° Factura:</b> {id_factura}", style_normal), Paragraph(f"<b>Fecha:</b> {fecha if fecha else 'N/A'}", style_normal)],
        [Paragraph(f"<b>Taller:</b> MOTO GP WORKSHOP", style_normal), ""]
    ]
    info_table = Table(info_data, colWidths=[3.6*inch, 3.6*inch])
    info_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
    story.append(info_table)
    story.append(Spacer(1, 15))

    style_label = ParagraphStyle('Label', parent=styles['Normal'], fontSize=10, fontName="Helvetica-Bold", spaceAfter=5)
    story.append(Paragraph("DATOS DEL CLIENTE Y VEHÍCULO", style_label))
    
    client_data = [
        ["CLIENTE:", str(cliente).upper(), "PLACA:", str(placa).upper() if placa else "N/A"],
        ["ESTADO:", "PAGADO", "MONEDA:", "COP"]
    ]
    client_table = Table(client_data, colWidths=[1*inch, 2.5*inch, 0.8*inch, 1.2*inch])
    client_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('BACKGROUND', (0,0), (0,1), colors.HexColor("#F2F4F4")),
        ('BACKGROUND', (2,0), (2,1), colors.HexColor("#F2F4F4")),
        ('FONTNAME', (0,0), (0,1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,1), 'Helvetica-Bold'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(client_table)
    story.append(Spacer(1, 25))

    table_data = [["CANT.", "DESCRIPCIÓN DEL SERVICIO", "PRECIO UNIT.", "SUBTOTAL"]]
    items = items_mano_obra if items_mano_obra else []
    if not items:
        table_data.append(["-", "No se encontraron detalles registrados.", "-", f"${float(total):,.2f}"])
    else:
        for item in items:
            desc = item.get('descripcion' )
            precio = float(item.get('costo', 0))
            table_data.append(["1", desc, f"${precio:,.2f}", f"${precio:,.2f}"])

    services_table = Table(table_data, colWidths=[0.7*inch, 3.9*inch, 1.3*inch, 1.3*inch])
    services_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), color_principal),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (2,1), (-1,-1), 'RIGHT'),
        ('BOTTOMPADDING', (0,0), (-1,0), 10),
        ('TOPPADDING', (0,0), (-1,0), 10),
    ]))
    story.append(services_table)

    story.append(Spacer(1, 10))
    total_data = [["", "", "TOTAL A PAGAR:", f"${float(total):,.2f}"]]
    total_table = Table(total_data, colWidths=[0.7*inch, 3.9*inch, 1.3*inch, 1.3*inch])
    total_table.setStyle(TableStyle([
        ('FONTNAME', (2,0), (2,0), 'Helvetica-Bold'),
        ('FONTSIZE', (2,0), (3,0), 14),
        ('ALIGN', (2,0), (3,0), 'RIGHT'),
        ('TEXTCOLOR', (3,0), (3,0), color_principal),
    ]))
    story.append(total_table)

    story.append(Spacer(1, 60))
    line_data = [[""]]
    line_table = Table(line_data, colWidths=[7.2*inch])
    line_table.setStyle(TableStyle([('LINEBELOW', (0,0), (-1,-1), 2, color_principal)]))
    story.append(line_table)
    story.append(Spacer(1, 10))
    
    footer_text = "Gracias por su confianza. Este documento es un soporte de los servicios realizados."
    story.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=style_normal, fontSize=10, alignment=1, textColor=colors.black, fontName="Helvetica-Oblique")))

    doc.build(story)
    return ruta