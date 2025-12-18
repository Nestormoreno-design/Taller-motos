from twilio.rest import Client

ACCOUNT_SID = "AC0a6b94374ffda73d48cc6201c8da6379"
AUTH_TOKEN = "*********************************"
FROM_WHATSAPP = "whatsapp:+14155238886"  # sandbox de Twilio

client = Client(ACCOUNT_SID, AUTH_TOKEN)

def enviar_whatsapp(numero, mensaje):
    client.messages.create(
        body=mensaje,
        from_=FROM_WHATSAPP,
        to=f"whatsapp:{numero}"
    )
