"""
Sistema de notificaciones por email para cambios en aranceles
Usa Resend para enviar emails transaccionales
"""
import os
import asyncio
import logging
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr

# Verificar si resend está disponible
try:
    import resend
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False
    logging.warning("Resend not installed. Email notifications disabled.")

logger = logging.getLogger(__name__)

# Configuración de Resend
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'notifications@taricai.com')
APP_URL = os.environ.get('APP_URL', os.environ.get('REACT_APP_BACKEND_URL', 'https://taricai.com'))

if RESEND_AVAILABLE and RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Modelos
class TariffAlert(BaseModel):
    hs_code: str
    product_description: str
    old_rate: str
    new_rate: str
    country: str
    effective_date: str
    source_url: Optional[str] = None

class NotificationSubscription(BaseModel):
    user_id: str
    email: str
    hs_codes: List[str]  # Lista de códigos HS a monitorear
    countries: List[str]  # Países de interés
    created_at: str
    active: bool = True

class EmailNotification(BaseModel):
    recipient_email: EmailStr
    subject: str
    html_content: str

# Templates de email
def generate_tariff_alert_email(alert: TariffAlert, user_name: str) -> str:
    """Genera el HTML del email de alerta de cambio arancelario"""
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; background-color: #0a0f1a; color: #ffffff; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #0d1424; border-radius: 12px; padding: 30px; border: 1px solid rgba(0, 212, 255, 0.2);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00d4ff; margin: 0;">TaricAI</h1>
            <p style="color: #888; margin-top: 5px;">Sistema de Alertas Arancelarias</p>
        </div>
        
        <div style="background-color: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
            <h2 style="color: #ffc107; margin: 0 0 10px 0;">⚠️ Cambio Arancelario Detectado</h2>
            <p style="color: #ccc; margin: 0;">Se ha detectado un cambio en los aranceles que podría afectar tus operaciones.</p>
        </div>
        
        <div style="background-color: #111827; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #00d4ff; margin-top: 0;">Detalles del Cambio</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #374151; color: #888;">Código HS:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #374151; color: #00d4ff; font-family: monospace; font-weight: bold;">{alert.hs_code}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #374151; color: #888;">Producto:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #374151; color: #fff;">{alert.product_description}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #374151; color: #888;">País:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #374151; color: #fff;">{alert.country}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #374151; color: #888;">Arancel Anterior:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #374151; color: #ef4444;">{alert.old_rate}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #374151; color: #888;">Nuevo Arancel:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #374151; color: #22c55e; font-weight: bold;">{alert.new_rate}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; color: #888;">Fecha Efectiva:</td>
                    <td style="padding: 10px 0; color: #fff;">{alert.effective_date}</td>
                </tr>
            </table>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
            <a href="{APP_URL}" 
               style="display: inline-block; background: linear-gradient(to right, #00d4ff, #0066ff); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold;">
                Ver Detalles en TaricAI
            </a>
        </div>
        
        <div style="border-top: 1px solid #374151; margin-top: 30px; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Este es un mensaje automático de TaricAI.</p>
            <p>Para modificar tus preferencias de notificación, accede a tu panel de control.</p>
        </div>
    </div>
</body>
</html>
"""

def generate_subscription_confirmation_email(user_name: str, hs_codes: List[str], countries: List[str]) -> str:
    """Genera email de confirmación de suscripción"""
    hs_list = "".join([f"<li style='color: #00d4ff; font-family: monospace;'>{code}</li>" for code in hs_codes[:10]])
    country_list = "".join([f"<li style='color: #fff;'>{country}</li>" for country in countries[:10]])
    
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; background-color: #0a0f1a; color: #ffffff; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #0d1424; border-radius: 12px; padding: 30px; border: 1px solid rgba(0, 212, 255, 0.2);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00d4ff; margin: 0;">TaricAI</h1>
            <p style="color: #888; margin-top: 5px;">Alertas Arancelarias</p>
        </div>
        
        <div style="background-color: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
            <h2 style="color: #22c55e; margin: 0;">✓ Suscripción Confirmada</h2>
        </div>
        
        <p style="color: #ccc;">Hola {user_name},</p>
        <p style="color: #ccc;">Te has suscrito correctamente a las alertas de cambios arancelarios para:</p>
        
        <div style="background-color: #111827; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #00d4ff; margin-top: 0;">Códigos HS Monitoreados:</h4>
            <ul style="list-style-type: none; padding: 0; margin: 0;">
                {hs_list}
            </ul>
            
            <h4 style="color: #00d4ff; margin-top: 20px;">Países de Interés:</h4>
            <ul style="list-style-type: none; padding: 0; margin: 0;">
                {country_list}
            </ul>
        </div>
        
        <p style="color: #888; font-size: 14px;">Recibirás una notificación cada vez que detectemos cambios en los aranceles de tus productos o países de interés.</p>
        
        <div style="border-top: 1px solid #374151; margin-top: 30px; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>TaricAI - Plataforma de Comercio Internacional con IA</p>
        </div>
    </div>
</body>
</html>
"""

async def send_email_notification(notification: EmailNotification) -> dict:
    """Envía una notificación por email usando Resend"""
    if not RESEND_AVAILABLE:
        logger.warning("Resend not available, email not sent")
        return {"status": "disabled", "message": "Email service not configured"}
    
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured")
        return {"status": "disabled", "message": "Email service not configured"}
    
    params = {
        "from": SENDER_EMAIL,
        "to": [notification.recipient_email],
        "subject": notification.subject,
        "html": notification.html_content
    }
    
    try:
        # Run sync SDK in thread to keep FastAPI non-blocking
        email = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent successfully to {notification.recipient_email}")
        return {
            "status": "success",
            "message": f"Email sent to {notification.recipient_email}",
            "email_id": email.get("id") if isinstance(email, dict) else str(email)
        }
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return {
            "status": "error",
            "message": f"Failed to send email: {str(e)}"
        }

async def send_tariff_alert(
    recipient_email: str, 
    user_name: str, 
    alert: TariffAlert
) -> dict:
    """Envía una alerta de cambio arancelario"""
    html_content = generate_tariff_alert_email(alert, user_name)
    notification = EmailNotification(
        recipient_email=recipient_email,
        subject=f"⚠️ Cambio Arancelario: {alert.hs_code} - {alert.country}",
        html_content=html_content
    )
    return await send_email_notification(notification)

async def send_subscription_confirmation(
    recipient_email: str,
    user_name: str,
    hs_codes: List[str],
    countries: List[str]
) -> dict:
    """Envía confirmación de suscripción a alertas"""
    html_content = generate_subscription_confirmation_email(user_name, hs_codes, countries)
    notification = EmailNotification(
        recipient_email=recipient_email,
        subject="✓ Suscripción a Alertas TaricAI Confirmada",
        html_content=html_content
    )
    return await send_email_notification(notification)
