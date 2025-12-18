from flask_mail import Message
from extensiones import mail

def enviar_correo(destinatario, asunto, mensaje):
    msg = Message(
        subject=asunto,
        sender="tallermotospyton@gmail.com",
        recipients=[destinatario],
        # Usamos html=mensaje para que Flask-Mail renderice el diseño
        html=mensaje 
    )
    mail.send(msg)


def enviar_correo_con_pdf(destinatario, asunto, mensaje_html, ruta_pdf):
    msg = Message(
        subject=asunto,
        sender="tallermotospyton@gmail.com",
        recipients=[destinatario],
        # Cambiamos body por html para que procese las etiquetas del diseño
        html=mensaje_html 
    )

    # Adjuntar el archivo PDF
    try:
        with open(ruta_pdf, "rb") as f:
            msg.attach(
                filename=ruta_pdf.split("/")[-1],
                content_type="application/pdf",
                data=f.read()
            )
    except Exception as e:
        print(f"Error al adjuntar PDF: {e}")

    mail.send(msg)