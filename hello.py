from flask import Flask, render_template, request, redirect, url_for, session, flash, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, date
from flask import session 
import os
import re
import uuid
import time
import pyodbc
import traceback
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import random
import string
import reportlab
from flask import send_file
from flask_cors import CORS
from flasgger import Swagger, swag_from



app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])



app.config['SWAGGER'] = {
    'title': 'TalentUPQ API',
    'version': '1.0.0',
    'description': 'API para la bolsa de trabajo TalentUPQ - Universidad Politécnica de Querétaro',
    'termsOfService': '/terms',
    'contact': {
        'name': 'TalentUPQ',
        'email': 'bolsa.trabajo@upq.edu.mx',
        'url': 'http://127.0.0.1:5000/'
    },
    'license': {
        'name': 'MIT',
        'url': 'https://opensource.org/licenses/MIT'
    },
    'specs_route': '/apidocs/',
    'uiversion': 3,
    'swagger_ui': True,
    'specs': [
        {
            'endpoint': 'apispec',
            'route': '/apispec.json',
            'rule_filter': lambda rule: True,
            'model_filter': lambda tag: True,
        }
    ],
    'static_url_path': '/flasgger_static',
    'swagger_ui_bundle_js': '//unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js',
    'swagger_ui_standalone_preset_js': '//unpkg.com/swagger-ui-dist@3/swagger-ui-standalone-preset.js',
    'swagger_ui_css': '//unpkg.com/swagger-ui-dist@3/swagger-ui.css',
}

swagger = Swagger(app)

app.secret_key = 'upq_bolsa_trabajo_secret_key'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'png', 'jpg', 'jpeg'}

app.config['SQL_SERVER_DRIVER'] = 'ODBC Driver 18 for SQL Server'
app.config['SQL_SERVER_SERVER'] = 'localhost,1433'
app.config['SQL_SERVER_DATABASE'] = 'BolsaTrabajoUPQ'
app.config['SQL_SERVER_UID'] = 'sa'
app.config['SQL_SERVER_PWD'] = 'Thefernando9'
app.config['SQL_SERVER_ENCRYPT'] = 'yes'
app.config['SQL_SERVER_TRUST_SERVER_CERTIFICATE'] = 'yes'



app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'ferhernandezdimas@gmail.com'  
app.config['MAIL_PASSWORD'] = 'yaah cbey ukdo itqc'  



def enviar_correo_bienvenida(email_usuario, nombre_usuario, tipo_usuario):
    """Envía un correo de bienvenida al usuario registrado"""
    try:
        
        if not app.config.get('MAIL_USERNAME') or app.config['MAIL_USERNAME'] == 'tu_email@gmail.com':
            print("❌ ERROR: Configuración de correo no establecida correctamente")
            print("⚠️  Configura tu GMAIL real y contraseña de aplicación")
            return False
        
        print(f"📧 Intentando enviar correo a: {email_usuario}")
        print(f"📧 Usando cuenta: {app.config['MAIL_USERNAME']}")
        
        msg = MIMEMultipart()
        msg['From'] = f'TalentUPQ <{app.config["MAIL_USERNAME"]}>'
        msg['To'] = email_usuario
        
        if tipo_usuario == 'candidato':
            msg['Subject'] = f'¡Bienvenido a TalentUPQ, {nombre_usuario.split()[0]}!'
        elif tipo_usuario == 'empresa':
            msg['Subject'] = f'¡Bienvenida a TalentUPQ, {nombre_usuario}!'
        else:
            msg['Subject'] = f'¡Bienvenido a TalentUPQ!'
        
        
        if tipo_usuario == 'candidato':
            cuerpo = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{ font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; }}
                    .header {{ background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%); color: white; padding: 40px; text-align: center; border-radius: 10px; margin-bottom: 30px; }}
                    .content {{ background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }}
                    .footer {{ margin-top: 30px; padding-top: 20px; border-top: 2px solid #3498db; color: #5a6c7d; font-size: 13px; text-align: center; }}
                    .btn {{ display: inline-block; background: linear-gradient(135deg, #3498db, #2ecc71); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 15px 0; font-weight: bold; }}
                    .steps {{ margin: 25px 0; }}
                    .step {{ background: #f1f8ff; padding: 15px; border-left: 4px solid #3498db; margin-bottom: 10px; border-radius: 5px; }}
                    .highlight {{ background: #e8f6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px dashed #3498db; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎓 ¡Bienvenido a TalentUPQ!</h1>
                    <p>Tu puente hacia oportunidades profesionales</p>
                </div>
                
                <div class="content">
                    <h2>Hola {nombre_usuario},</h2>
                    <p>¡Gracias por registrarte en <strong>TalentUPQ</strong>, la bolsa de trabajo oficial de la Universidad Politécnica de Querétaro!</p>
                    
                    <p>Tu cuenta ha sido creada exitosamente:</p>
                    <ul>
                        <li><strong>Nombre:</strong> {nombre_usuario}</li>
                        <li><strong>Email:</strong> {email_usuario}</li>
                        <li><strong>Tipo de cuenta:</strong> Candidato</li>
                        <li><strong>Fecha de registro:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M')}</li>
                    </ul>
                    
                    <div class="highlight">
                        <p>🌟 <strong>¡Tu próximo paso importante!</strong></p>
                        <p>Completa tu perfil profesional para aumentar tus posibilidades de ser contratado:</p>
                    </div>
                    
                    <p><strong>¿Qué puedes hacer ahora?</strong></p>
                    <div class="steps">
                        <div class="step">
                            <strong>1. Completa tu perfil</strong><br>
                            Sube tu CV, foto profesional y agrega tus habilidades
                        </div>
                        <div class="step">
                            <strong>2. Agrega tu experiencia</strong><br>
                            Destaca tu trayectoria profesional y académica
                        </div>
                        <div class="step">
                            <strong>3. Busca vacantes</strong><br>
                            Encuentra oportunidades que se ajusten a tu perfil
                        </div>
                        <div class="step">
                            <strong>4. Postúlate</strong><br>
                            Aplica a las mejores empresas de la región
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{url_for('candidato_perfil', _external=True)}" class="btn">
                            ✨ Completar Mi Perfil
                        </a>
                    </div>
                    
                    <p><strong>Beneficios exclusivos para candidatos UPQ:</strong></p>
                    <ul>
                        <li>✅ Acceso a vacantes exclusivas para egresados UPQ</li>
                        <li>✅ Conexión directa con empresas aliadas</li>
                        <li>✅ Asesoría profesional y consejería</li>
                        <li>✅ Eventos de networking y ferias de empleo</li>
                        <li>✅ Seguimiento personalizado de tus postulaciones</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p><strong>TalentUPQ - Bolsa de Trabajo UPQ</strong></p>
                    <p>📍 Universidad Politécnica de Querétaro</p>
                    <p>📞 (773) 108-7368 | ✉️ bolsa.trabajo@upq.edu.mx</p>
                    <p>© {datetime.now().year} TalentUPQ. Todos los derechos reservados.</p>
                </div>
            </body>
            </html>
            """
        elif tipo_usuario == 'empresa':
            cuerpo = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{ font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; }}
                    .header {{ background: linear-gradient(135deg, #9b59b6 0%, #3498db 100%); color: white; padding: 40px; text-align: center; border-radius: 10px; margin-bottom: 30px; }}
                    .content {{ background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }}
                    .footer {{ margin-top: 30px; padding-top: 20px; border-top: 2px solid #9b59b6; color: #5a6c7d; font-size: 13px; text-align: center; }}
                    .btn {{ display: inline-block; background: linear-gradient(135deg, #9b59b6, #3498db); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 15px 0; font-weight: bold; }}
                    .benefits {{ margin: 25px 0; }}
                    .benefit {{ background: #f5f0fa; padding: 15px; border-left: 4px solid #9b59b6; margin-bottom: 10px; border-radius: 5px; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🏢 ¡Bienvenida a TalentUPQ, {nombre_usuario}!</h1>
                    <p>Encuentra al talento que tu empresa necesita</p>
                </div>
                
                <div class="content">
                    <h2>Estimado equipo de {nombre_usuario},</h2>
                    <p>¡Gracias por unirse a <strong>TalentUPQ</strong>, la bolsa de trabajo oficial de la Universidad Politécnica de Querétaro!</p>
                    
                    <p>Su cuenta de empresa ha sido creada exitosamente:</p>
                    <ul>
                        <li><strong>Empresa:</strong> {nombre_usuario}</li>
                        <li><strong>Email:</strong> {email_usuario}</li>
                        <li><strong>Tipo de cuenta:</strong> Empresa</li>
                        <li><strong>Fecha de registro:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M')}</li>
                    </ul>
                    
                    <div style="background: #e8f4fc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #3498db;">
                        <p>💼 <strong>¡Comience a publicar vacantes!</strong></p>
                        <p>Acceda a nuestro talento calificado de egresados UPQ</p>
                    </div>
                    
                    <p><strong>Beneficios para empresas aliadas:</strong></p>
                    <div class="benefits">
                        <div class="benefit">
                            <strong>Acceso a talento especializado</strong><br>
                            Egresados de ingenierías y licenciaturas UPQ
                        </div>
                        <div class="benefit">
                            <strong>Proceso de selección optimizado</strong><br>
                            Filtros inteligentes y perfiles detallados
                        </div>
                        <div class="benefit">
                            <strong>Eventos exclusivos</strong><br>
                            Ferias de empleo y días de entrevistas
                        </div>
                        <div class="benefit">
                            <strong>Soporte personalizado</strong><br>
                            Asesoría en reclutamiento y selección
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{url_for('empresa_dashboard', _external=True)}" class="btn">
                            📝 Publicar Mi Primera Vacante
                        </a>
                    </div>
                    
                    <p><strong>Próximos pasos recomendados:</strong></p>
                    <ol>
                        <li>Complete el perfil de su empresa</li>
                        <li>Suba su logo y descripción corporativa</li>
                        <li>Publique su primera vacante (aprobación requerida)</li>
                        <li>Revise candidatos y programe entrevistas</li>
                    </ol>
                </div>
                
                <div class="footer">
                    <p><strong>TalentUPQ - Bolsa de Trabajo UPQ</strong></p>
                    <p>📍 Universidad Politécnica de Querétaro</p>
                    <p>📞 (442) 192-1200 | ✉️ bolsa.trabajo@upq.edu.mx</p>
                    <p>© {datetime.now().year} TalentUPQ. Todos los derechos reservados.</p>
                </div>
            </body>
            </html>
            """
        
        msg.attach(MIMEText(cuerpo, 'html'))
        
        print(f"📤 Conectando a SMTP: {app.config['MAIL_SERVER']}:{app.config['MAIL_PORT']}")
        
        server = smtplib.SMTP(app.config['MAIL_SERVER'], app.config['MAIL_PORT'])
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
        
        print("✅ Login exitoso")
        
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Correo de bienvenida enviado exitosamente a: {email_usuario}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ ERROR DE AUTENTICACIÓN: {e}")
        print("🔑 Verifica:")
        print("   1. Tu correo GMAIL real")
        print("   2. Contraseña de APLICACIÓN (no la normal)")
        print("   3. Verifica que tengas activada la verificación en 2 pasos")
        return False
    except Exception as e:
        print(f"❌ ERROR enviando correo: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    

@app.route('/test_correo/<email>')
def test_correo(email):
    """Ruta para probar el envío de correos"""
    try:
        print(f"🧪 Probando envío de correo a: {email}")
        
        if not app.config.get('MAIL_USERNAME'):
            return jsonify({
                'success': False,
                'message': 'Configuración de correo no encontrada'
            })
        
        resultado = enviar_correo_bienvenida(email, "Usuario de Prueba", "candidato")
        
        if resultado:
            return jsonify({
                'success': True, 
                'message': '✅ Correo enviado correctamente',
                'to': email,
                'from': app.config['MAIL_USERNAME']
            })
        else:
            return jsonify({
                'success': False, 
                'message': '❌ Error enviando correo'
            })
    except Exception as e:
        return jsonify({
            'success': False, 
            'message': f'❌ Error: {str(e)}'
        })



def generar_codigo_recuperacion():
    """Genera un código de 6 dígitos para recuperación"""
    return ''.join(random.choices(string.digits, k=6))

def enviar_codigo_recuperacion(email, codigo):
    """Envía correo con código de verificación"""
    try:
        usuario = execute_query(
            "SELECT UsuarioID, Email FROM Usuarios WHERE Email = ?",
            (email,)
        )
        
        if not usuario:
            return False
        
        msg = MIMEMultipart()
        msg['From'] = f'TalentUPQ <{app.config["MAIL_USERNAME"]}>'
        msg['To'] = email
        msg['Subject'] = 'Código de recuperación - TalentUPQ'
        
        cuerpo = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; }}
                .header {{ background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px; }}
                .content {{ background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center; }}
                .code {{ background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; font-family: monospace; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; border-radius: 12px; margin: 20px 0; color: #2c3e50; border: 2px dashed #3498db; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 2px solid #3498db; color: #5a6c7d; font-size: 13px; text-align: center; }}
                .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; color: #856404; font-size: 14px; }}
                .btn {{ display: inline-block; background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔐 Código de Recuperación</h1>
                <p>TalentUPQ - Bolsa de Trabajo UPQ</p>
            </div>
            
            <div class="content">
                <h2>¡Hola!</h2>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>TalentUPQ</strong>.</p>
                
                <div class="warning">
                    <p>⚠️ <strong>Importante:</strong> Si no solicitaste este cambio, ignora este correo. Tu contraseña permanecerá segura.</p>
                </div>
                
                <p>Tu código de verificación es:</p>
                
                <div class="code">
                    {codigo}
                </div>
                
                <p>Este código expirará en <strong>10 minutos</strong> por razones de seguridad.</p>
                <p>Ingresa este código en la página de recuperación para restablecer tu contraseña.</p>
            </div>
            
            <div class="footer">
                <p><strong>TalentUPQ - Bolsa de Trabajo UPQ</strong></p>
                <p>📍 Universidad Politécnica de Querétaro</p>
                <p>📞 (773) 108-7368 | ✉️ bolsa.trabajo@upq.edu.mx</p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(cuerpo, 'html'))
        
        server = smtplib.SMTP(app.config['MAIL_SERVER'], app.config['MAIL_PORT'])
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
        
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Código de recuperación enviado a: {email}")
        return True
        
    except Exception as e:
        print(f"❌ Error enviando código de recuperación: {str(e)}")
        return False

@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        
        if not email:
            flash('Por favor ingresa tu correo electrónico', 'error')
            return redirect(url_for('forgot_password'))
        
        # Verificar si el email existe
        usuario = execute_query(
            "SELECT UsuarioID, Email FROM Usuarios WHERE Email = ?",
            (email,)
        )
        
        if usuario:
            # Generar código de 6 dígitos
            codigo = generar_codigo_recuperacion()
            fecha_expiracion = datetime.now()
            
            # Guardar código en la base de datos
            execute_query(
                """UPDATE Usuarios SET 
                ResetToken = ?, 
                ResetTokenExpira = DATEADD(MINUTE, 10, GETDATE())
                WHERE Email = ?""",
                (codigo, email),
                fetch=False
            )
            
            # Enviar correo con el código
            if enviar_codigo_recuperacion(email, codigo):
                # Guardar email en sesión temporal
                session['reset_email'] = email
                flash('Se ha enviado un código de verificación a tu correo electrónico. Revisa tu bandeja de entrada.', 'success')
                return redirect(url_for('verify_code'))
            else:
                flash('Hubo un problema al enviar el código. Por favor intenta más tarde.', 'error')
        else:
            # Por seguridad, no revelar si el email existe o no
            flash('Si el correo existe en nuestro sistema, recibirás un código de verificación.', 'info')
            return redirect(url_for('forgot_password'))
    
    return render_template('forgot_password.html')

@app.route('/verify_code', methods=['GET', 'POST'])
def verify_code():
    # Verificar que hay un email en sesión
    if 'reset_email' not in session:
        flash('Por favor inicia el proceso de recuperación primero.', 'error')
        return redirect(url_for('forgot_password'))
    
    email = session['reset_email']
    
    if request.method == 'POST':
        codigo = request.form.get('codigo', '').strip()
        
        if not codigo:
            flash('Por favor ingresa el código de verificación', 'error')
            return redirect(url_for('verify_code'))
        
        # Verificar código
        usuario = execute_query(
            """SELECT UsuarioID, ResetToken, ResetTokenExpira 
            FROM Usuarios 
            WHERE Email = ? AND ResetToken = ?""",
            (email, codigo)
        )
        
        if not usuario:
            flash('Código de verificación incorrecto.', 'error')
            return redirect(url_for('verify_code'))
        
        usuario = usuario[0]
        
        # Verificar si el código ha expirado (10 minutos)
        if usuario['ResetTokenExpira']:
            if datetime.now() > usuario['ResetTokenExpira']:
                flash('El código de verificación ha expirado. Por favor solicita uno nuevo.', 'error')
                return redirect(url_for('forgot_password'))
        
        # Guardar token en sesión para el siguiente paso
        session['reset_token'] = codigo
        return redirect(url_for('reset_password'))
    
    return render_template('verify_code.html', email=email)

@app.route('/reset_password', methods=['GET', 'POST'])
def reset_password():
    # Verificar que hay un código válido en sesión
    if 'reset_email' not in session or 'reset_token' not in session:
        flash('Proceso de recuperación no válido. Por favor solicita un nuevo código.', 'error')
        return redirect(url_for('forgot_password'))
    
    email = session['reset_email']
    token = session['reset_token']
    
    # Verificar nuevamente que el código es válido
    usuario = execute_query(
        """SELECT UsuarioID, ResetToken, ResetTokenExpira 
        FROM Usuarios 
        WHERE Email = ? AND ResetToken = ?""",
        (email, token)
    )
    
    if not usuario:
        flash('El código de verificación ya no es válido. Por favor solicita uno nuevo.', 'error')
        return redirect(url_for('forgot_password'))
    
    usuario = usuario[0]
    
    if request.method == 'POST':
        password = request.form.get('password', '').strip()
        confirm_password = request.form.get('confirm_password', '').strip()
        
        # Validaciones
        errors = []
        
        if len(password) < 8:
            errors.append('La contraseña debe tener al menos 8 caracteres')
        
        if not any(c.isupper() for c in password):
            errors.append('La contraseña debe contener al menos una letra mayúscula')
        
        if not any(c.islower() for c in password):
            errors.append('La contraseña debe contener al menos una letra minúscula')
        
        if not any(c.isdigit() for c in password):
            errors.append('La contraseña debe contener al menos un número')
        
        if password != confirm_password:
            errors.append('Las contraseñas no coinciden')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return redirect(url_for('reset_password'))
        
        try:
            # Actualizar contraseña
            password_hash = generate_password_hash(password)
            execute_query(
                """UPDATE Usuarios SET 
                PasswordHash = ?, 
                ResetToken = NULL, 
                ResetTokenExpira = NULL 
                WHERE UsuarioID = ?""",
                (password_hash, usuario['UsuarioID']),
                fetch=False
            )
            
            # Limpiar sesión
            session.pop('reset_email', None)
            session.pop('reset_token', None)
            
            flash('Contraseña actualizada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.', 'success')
            return redirect(url_for('login'))
            
        except Exception as e:
            current_app.logger.error(f"Error al actualizar contraseña: {str(e)}")
            flash('Ocurrió un error al actualizar la contraseña. Por favor intenta nuevamente.', 'error')
            return redirect(url_for('reset_password'))
    
    return render_template('reset_password.html')



def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Por favor inicia sesión para acceder a esta página.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if session.get('tipo') != role:
                flash('No tienes permisos para acceder a esta página.', 'danger')
                return redirect(url_for('index'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def get_db_connection():
    connection_string = (
        f"DRIVER={{{app.config['SQL_SERVER_DRIVER']}}};"
        f"SERVER={app.config['SQL_SERVER_SERVER']};"
        f"DATABASE={app.config['SQL_SERVER_DATABASE']};"
        f"UID={app.config['SQL_SERVER_UID']};"
        f"PWD={app.config['SQL_SERVER_PWD']};"
        f"Encrypt={app.config['SQL_SERVER_ENCRYPT']};"
        f"TrustServerCertificate={app.config['SQL_SERVER_TRUST_SERVER_CERTIFICATE']};"
    )
    return pyodbc.connect(connection_string)

def execute_query(query, params=None, fetch=True):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if fetch:
            if query.strip().upper().startswith('SELECT'):
                columns = [column[0] for column in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                return results
            elif query.strip().upper().startswith(('INSERT', 'UPDATE', 'DELETE')):
                conn.commit()
                return cursor.rowcount
        else:
            conn.commit()
            return None
            
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        raise e
    finally:
        cursor.close()
        conn.close()


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def calcular_edad(fecha_nacimiento):
    if not fecha_nacimiento:
        return 0
    hoy = date.today()
    return hoy.year - fecha_nacimiento.year - ((hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day))

def get_usuario_actual():
    if 'user_id' in session:
        result = execute_query(
            "SELECT * FROM Usuarios WHERE UsuarioID = ?", 
            (session['user_id'],)
        )
        return result[0] if result else None
    return None

def get_candidato_actual():
    usuario = get_usuario_actual()
    if usuario and usuario['TipoUsuario'] == 'candidato':
        result = execute_query(
            "SELECT * FROM Candidatos WHERE UsuarioID = ?", 
            (usuario['UsuarioID'],)
        )
        return result[0] if result else None
    return None

def get_empresa_actual():
    usuario = get_usuario_actual()
    if usuario and usuario['TipoUsuario'] == 'empresa':
        result = execute_query(
            "SELECT * FROM Empresas WHERE UsuarioID = ?", 
            (usuario['UsuarioID'],)
        )
        return result[0] if result else None
    return None

def get_admin_actual():
    usuario = get_usuario_actual()
    if usuario and usuario['TipoUsuario'] == 'admin':
        result = execute_query(
            "SELECT * FROM Administradores WHERE UsuarioID = ?", 
            (usuario['UsuarioID'],)
        )
        return result[0] if result else None
    return None


@app.route('/')
def index():

    vacantes = execute_query(
    "SELECT TOP 3 v.*, e.Nombre as EmpresaNombre FROM Vacantes v "
    "JOIN Empresas e ON v.EmpresaID = e.EmpresaID "
    "WHERE v.Estatus = 'aprobada' ORDER BY v.FechaPublicacion DESC"
)


    return render_template('index.html', usuario=get_usuario_actual(), vacantes=vacantes)

##################################################################################################

@app.route('/registro', methods=['GET', 'POST'])
def registro():
    if request.method == 'POST':
        email = request.form['email'].strip()
        password = request.form['password'].strip()
        confirm_password = request.form.get('confirm_password', '').strip()
        tipo = request.form['tipo']
        nombre = request.form.get('nombre', '').strip()
        apellido_paterno = request.form.get('apellido_paterno', '').strip()
        apellido_materno = request.form.get('apellido_materno', '').strip()
        telefono = request.form.get('telefono', '').strip()
        direccion = request.form.get('direccion', '').strip()
        

        errors = []

        if not email or '@' not in email or '.' not in email.split('@')[-1]:
            errors.append('Ingrese un correo electrónico válido')

        if len(password) < 8:
            errors.append('La contraseña debe tener al menos 8 caracteres')         

        if tipo not in ['candidato', 'empresa', 'admin']:
            errors.append('Tipo de usuario no válido')

        if tipo == 'candidato':
            if not nombre:
                errors.append('El nombre es obligatorio')
            if not apellido_paterno:
                errors.append('El apellido paterno es obligatorio')
            if telefono and (not telefono.isdigit() or len(telefono) != 10):
                errors.append('El teléfono debe tener 10 dígitos')
                
        if tipo == 'empresa':
            if not nombre:
                errors.append('El nombre de la empresa es obligatorio')
            if telefono and (not telefono.isdigit() or len(telefono) != 10):
                errors.append('El teléfono debe tener 10 dígitos')

        if errors:
            for error in errors:
                flash(error, 'error')
            return redirect(url_for('registro'))
    

        existe = execute_query(
            "SELECT 1 FROM Usuarios WHERE Email = ?", 
            (email,)
        )
        
        if existe:
            flash('El correo electrónico ya está registrado.', 'error')
            return redirect(url_for('registro'))
        
        try:
  
            execute_query(
                "INSERT INTO Usuarios (Email, PasswordHash, TipoUsuario) VALUES (?, ?, ?)",
                (email, generate_password_hash(password), tipo),
                fetch=False
            )
            
        
            nuevo_usuario = execute_query(
                "SELECT UsuarioID FROM Usuarios WHERE Email = ?",
                (email,)
            )
            usuario_id = nuevo_usuario[0]['UsuarioID']
            
            
            if tipo == 'candidato':
                execute_query(
                    """INSERT INTO Candidatos 
                    (CandidatoID, UsuarioID, Nombre, ApellidoPaterno, ApellidoMaterno, Telefono, Direccion)
                    VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (usuario_id, usuario_id, nombre, apellido_paterno, apellido_materno, telefono, direccion),
                    fetch=False
                )
                
              
                nombre_correo = f"{nombre} {apellido_paterno} {apellido_materno}".strip()
                
            elif tipo == 'empresa':
                execute_query(
                    """INSERT INTO Empresas 
                    (EmpresaID, UsuarioID, Nombre, Telefono, Direccion)
                    VALUES (?, ?, ?, ?, ?)""",
                    (usuario_id, usuario_id, nombre, telefono, direccion),
                    fetch=False
                )
                
                
                nombre_correo = nombre
                
            elif tipo == 'admin':
                execute_query(
                    "INSERT INTO Administradores (AdministradorID, UsuarioID) VALUES (?, ?)",
                    (usuario_id, usuario_id),
                    fetch=False
                )
                
           
                nombre_correo = email.split('@')[0]
            

            try:
                if tipo in ['candidato', 'empresa']:  
                    enviar_correo_bienvenida(email, nombre_correo, tipo)
                    print(f"📧 Correo de bienvenida enviado a: {email}")
                else:
                    print(f"ℹ️  No se envía correo de bienvenida para tipo de usuario: {tipo}")
            except Exception as e:
    
                print(f"⚠️  Error enviando correo de bienvenida: {str(e)}")
         
            
            flash('Registro exitoso. Por favor inicia sesión.', 'success')
            return redirect(url_for('login'))
        
        except Exception as e:
            current_app.logger.error(f"Error en registro: {str(e)}")
            flash('Ocurrió un error durante el registro. Por favor intente nuevamente.', 'error')
            return redirect(url_for('registro'))
    
    return render_template('registro.html')



@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':

        if request.form.get('is_admin') == 'true':
            email = request.form.get('email')
            password = request.form.get('password')
            

            if email == 'Admin@upq.edu.mx' and password == 'Admin1234':
                admin_user = {
                    'id': 0,  
                    'email': email,
                    'rol': 'admin',
                    'nombre': 'Administrador',
                    'is_authenticated': True,
                    'is_active': True,
                    'is_anonymous': False
                }
                return redirect(url_for('admin_dashboard'))
            else:
                flash('Credenciales administrativas incorrectas', 'error')
                return redirect(url_for('login'))
        

        email = request.form['email']
        password = request.form['password']
        

        usuario = execute_query(
            "SELECT * FROM Usuarios WHERE Email = ?", 
            (email,)
        )
        
        if usuario and check_password_hash(usuario[0]['PasswordHash'], password):
            session['email'] = email
            session['tipo'] = usuario[0]['TipoUsuario']
            session['user_id'] = usuario[0]['UsuarioID']
            flash('Inicio de sesión exitoso.', 'success')
            
            if usuario[0]['TipoUsuario'] == 'admin':
                return redirect(url_for('admin_dashboard'))
            elif usuario[0]['TipoUsuario'] == 'empresa':
                return redirect(url_for('empresa_dashboard'))
            else:
                return redirect(url_for('candidato_dashboard'))
        else:
            flash('Correo electrónico o contraseña incorrectos.', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Has cerrado sesión correctamente.', 'info')
    return redirect(url_for('index'))


@app.route('/candidato')
@login_required
@role_required('candidato')
def candidato_dashboard():
    candidato = get_candidato_actual()
    if not candidato:
        flash('Perfil de candidato no encontrado', 'error')
        return redirect(url_for('login'))
    

    candidato_id = candidato['CandidatoID']
    

    edad = calcular_edad(candidato.get('FechaNacimiento'))
    

    preparacion_academica = execute_query(
        "SELECT * FROM PreparacionAcademica WHERE CandidatoID = ?",
        (candidato_id,)
    )
    

    experiencia_laboral = execute_query(
        "SELECT TOP 1 * FROM ExperienciaLaboral WHERE CandidatoID = ? ORDER BY FechaIngreso DESC",
        (candidato_id,)
    )
    

    habilidades = execute_query(
        "SELECT h.Nombre FROM CandidatoHabilidades ch "
        "JOIN Habilidades h ON ch.HabilidadID = h.HabilidadID "
        "WHERE ch.CandidatoID = ?",
        (candidato_id,)
    )
    

    referencias = execute_query(
        "SELECT * FROM Referencias WHERE CandidatoID = ?",
        (candidato_id,)
    )
    

    postulaciones = execute_query(
        "SELECT TOP 3 p.*, v.Puesto, e.Nombre as EmpresaNombre "
        "FROM Postulaciones p "
        "JOIN Vacantes v ON p.VacanteID = v.VacanteID "
        "JOIN Empresas e ON v.EmpresaID = e.EmpresaID "
        "WHERE p.CandidatoID = ? "
        "ORDER BY p.FechaPostulacion DESC",
        (candidato_id,)
    )
    
   
    completed = 0
    if candidato.get('Nombre'): completed += 20
    if preparacion_academica: completed += 20
    if experiencia_laboral: completed += 20
    if habilidades: completed += 20
    if referencias: completed += 20
    
    return render_template('candidato/dashboard.html', 
                         candidato=candidato,
                         edad=edad,
                         completed=completed,
                         preparacion_academica=preparacion_academica,
                         experiencia_laboral=experiencia_laboral,
                         habilidades=habilidades,
                         referencias=referencias,
                         postulaciones=postulaciones)

@app.route('/candidato/perfil', methods=['GET', 'POST'])
@login_required
@role_required('candidato')
def candidato_perfil():
    candidato = get_candidato_actual()
    if not candidato:
        flash('Perfil de candidato no encontrado', 'error')
        return redirect(url_for('login'))

    if request.method == 'POST':
        try:
   
            errors = []
            

            if not request.form['nombre'].strip() or not request.form['apellido_paterno'].strip():
                errors.append('Nombre y apellido paterno son obligatorios')
                
  
            telefono = request.form['telefono'].strip()
            if not telefono.isdigit() or len(telefono) != 10:
                errors.append('El teléfono debe tener 10 dígitos')
                

            rfc = request.form['rfc'].strip().upper()
            if len(rfc) < 12 or len(rfc) > 13:
                errors.append('El RFC debe tener entre 12 y 13 caracteres')
                

            fecha_nacimiento_str = request.form['fecha_nacimiento']
            if fecha_nacimiento_str:
                try:
                    fecha_nacimiento = datetime.strptime(fecha_nacimiento_str, '%Y-%m-%d').date()
                    hoy = date.today()
                    edad = hoy.year - fecha_nacimiento.year - ((hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day))
                    if edad < 18:
                        errors.append('Debes ser mayor de edad (18 años)')
                except ValueError:
                    errors.append('Formato de fecha inválido (AAAA-MM-DD)')
            else:
                fecha_nacimiento = None
                
 
            if 'foto_perfil' in request.files:
                file = request.files['foto_perfil']
                if file and file.filename:
                    if not allowed_file(file.filename):
                        errors.append('Formato de imagen no permitido')
                    if file.content_length > 2 * 1024 * 1024:  # 2MB
                        errors.append('La imagen no debe exceder 2MB')
                        
            if 'cv' in request.files:
                file = request.files['cv']
                if file and file.filename:
                    if not file.filename.lower().endswith('.pdf'):
                        errors.append('El CV debe ser un archivo PDF')
                    if file.content_length > 5 * 1024 * 1024:  # 5MB
                        errors.append('El CV no debe exceder 5MB')
            
            if errors:
                for error in errors:
                    flash(error, 'error')
                return redirect(url_for('candidato_perfil'))


            update_data = {
                'Nombre': request.form['nombre'],
                'ApellidoPaterno': request.form['apellido_paterno'],
                'ApellidoMaterno': request.form['apellido_materno'],
                'Telefono': telefono,
                'EstadoCivil': request.form['estado_civil'],
                'Sexo': request.form['sexo'],
                'FechaNacimiento': fecha_nacimiento,
                'Nacionalidad': request.form['nacionalidad'],
                'RFC': rfc,
                'Direccion': request.form['direccion'],
                'Reubicacion': 1 if 'reubicacion' in request.form else 0,
                'Viajar': 1 if 'viajar' in request.form else 0,
                'LicenciaConducir': 1 if 'licencia_conducir' in request.form else 0,
                'ModalidadTrabajo': request.form['modalidad'],
                'PuestoActual': request.form['puesto_actual'],
                'PuestoSolicitado': request.form['puesto_solicitado'],
                'ResumenProfesional': request.form['resumen']
            }


            if 'foto_perfil' in request.files:
                file = request.files['foto_perfil']
                if file and allowed_file(file.filename):
                    filename = secure_filename(f"perfil_{candidato['CandidatoID']}.{file.filename.rsplit('.', 1)[1].lower()}")
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    update_data['FotoPerfil'] = filename

            if 'cv' in request.files:
                file = request.files['cv']
                if file and file.filename.lower().endswith('.pdf'):
                    filename = secure_filename(f"cv_{candidato['CandidatoID']}.pdf")
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    update_data['CV'] = filename

            execute_query(
                """UPDATE Candidatos SET
                Nombre = ?, ApellidoPaterno = ?, ApellidoMaterno = ?,
                Telefono = ?, EstadoCivil = ?, Sexo = ?,
                FechaNacimiento = ?, Nacionalidad = ?, RFC = ?,
                Direccion = ?, Reubicacion = ?, Viajar = ?,
                LicenciaConducir = ?, ModalidadTrabajo = ?,
                PuestoActual = ?, PuestoSolicitado = ?,
                ResumenProfesional = ?,
                FotoPerfil = COALESCE(?, FotoPerfil),
                CV = COALESCE(?, CV)
                WHERE CandidatoID = ?""",
                (
                    update_data['Nombre'],
                    update_data['ApellidoPaterno'],
                    update_data['ApellidoMaterno'],
                    update_data['Telefono'],
                    update_data['EstadoCivil'],
                    update_data['Sexo'],
                    update_data['FechaNacimiento'],
                    update_data['Nacionalidad'],
                    update_data['RFC'],
                    update_data['Direccion'],
                    update_data['Reubicacion'],
                    update_data['Viajar'],
                    update_data['LicenciaConducir'],
                    update_data['ModalidadTrabajo'],
                    update_data['PuestoActual'],
                    update_data['PuestoSolicitado'],
                    update_data['ResumenProfesional'],
                    update_data.get('FotoPerfil'),
                    update_data.get('CV'),
                    candidato['CandidatoID']
                ),
                fetch=False
            )

            flash('Perfil actualizado correctamente.', 'success')
            return redirect(url_for('candidato_perfil'))

        except Exception as e:
            current_app.logger.error(f"Error al actualizar perfil: {str(e)}")
            flash('Ocurrió un error al actualizar el perfil', 'error')


    edad = calcular_edad(candidato.get('FechaNacimiento'))
    
    return render_template('candidato/perfil.html', 
                         candidato=candidato, 
                         edad=edad,
                         estados_civiles=['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre'],
                         generos=['Masculino', 'Femenino', 'Otro'],
                         modalidades=['Presencial', 'Remoto', 'Híbrido'])


@app.route('/candidato/preparacion', methods=['GET', 'POST'])
@login_required
@role_required('candidato')
def candidato_preparacion():
    candidato = get_candidato_actual()
    if not candidato:
        flash('Perfil de candidato no encontrado', 'error')
        return redirect(url_for('login'))
    
    editar_index = request.args.get('editar', type=int)
    preparacion_editar = None
    
    if editar_index is not None:
        preparaciones = execute_query(
            "SELECT * FROM PreparacionAcademica WHERE CandidatoID = ?",
            (candidato['CandidatoID'],)
        )
        if 0 <= editar_index < len(preparaciones):
            preparacion_editar = preparaciones[editar_index]
    
    if request.method == 'POST':
        if 'eliminar' in request.form:
            try:
                index = int(request.form['eliminar'])
                preparaciones = execute_query(
                    "SELECT PreparacionID FROM PreparacionAcademica WHERE CandidatoID = ?",
                    (candidato['CandidatoID'],)
                )
                if 0 <= index < len(preparaciones):
                    execute_query(
                        "DELETE FROM PreparacionAcademica WHERE PreparacionID = ?",
                        (preparaciones[index]['PreparacionID'],),
                        fetch=False
                    )
                    flash('Preparación académica eliminada correctamente', 'success')
            except (ValueError, KeyError):
                flash('Error al eliminar la preparación académica', 'danger')
        else:
            required_fields = ['grado', 'estatus', 'institucion', 'pais', 'fecha_inicio']
            if not all(field in request.form and request.form[field].strip() for field in required_fields):
                flash('Complete todos los campos requeridos', 'danger')
                return redirect(url_for('candidato_preparacion'))
            
            try:
                fecha_inicio = datetime.strptime(request.form['fecha_inicio'], '%Y-%m-%d').date()
                fecha_fin = datetime.strptime(request.form['fecha_fin'], '%Y-%m-%d').date() if request.form.get('fecha_fin') else None
                
        
                if request.form['estatus'] == 'Completado' and fecha_fin:
                    duracion = (fecha_fin.year - fecha_inicio.year) - ((fecha_fin.month, fecha_fin.day) < (fecha_inicio.month, fecha_inicio.day))
                    if duracion < 3:
                        flash('Los estudios completados deben tener al menos 3 años de duración', 'danger')
                        return redirect(url_for('candidato_preparacion'))
                
 
                if fecha_fin and fecha_fin < fecha_inicio:
                    flash('La fecha de finalización no puede ser anterior a la fecha de inicio', 'danger')
                    return redirect(url_for('candidato_preparacion'))
                

                if fecha_inicio > date.today():
                    flash('La fecha de inicio no puede ser en el futuro', 'danger')
                    return redirect(url_for('candidato_preparacion'))
                

                if request.form['estatus'] == 'En progreso' and fecha_fin:
                    flash('Los estudios en progreso no deben tener fecha de finalización', 'danger')
                    return redirect(url_for('candidato_preparacion'))
                

                grados_validos = ['Primaria', 'Secundaria', 'Bachillerato', 'Licenciatura', 
                                 'Maestría', 'Doctorado', 'Técnico', 'Diplomado', 'Certificación']
                if request.form['grado'] not in grados_validos:
                    flash('Seleccione un grado académico válido', 'danger')
                    return redirect(url_for('candidato_preparacion'))
                
                nueva_preparacion = {
                    'Grado': request.form['grado'],
                    'Cedula': request.form.get('cedula', ''),
                    'Estatus': request.form['estatus'],
                    'Institucion': request.form['institucion'],
                    'Pais': request.form['pais'],
                    'FechaInicio': fecha_inicio,
                    'FechaFin': fecha_fin
                }

                if len(nueva_preparacion['Institucion'].strip()) < 5:
                    flash('El nombre de la institución debe ser válido', 'danger')
                    return redirect(url_for('candidato_preparacion'))
                
                if 'editar_index' in request.form and request.form['editar_index'].strip():
                    try:
                        index = int(request.form['editar_index'])
                        preparaciones = execute_query(
                            "SELECT PreparacionID FROM PreparacionAcademica WHERE CandidatoID = ?",
                            (candidato['CandidatoID'],)
                        )
                        if 0 <= index < len(preparaciones):
                            execute_query(
                                """UPDATE PreparacionAcademica SET
                                Grado = ?, Cedula = ?, Estatus = ?,
                                Institucion = ?, Pais = ?,
                                FechaInicio = ?, FechaFin = ?
                                WHERE PreparacionID = ?""",
                                (
                                    nueva_preparacion['Grado'],
                                    nueva_preparacion['Cedula'],
                                    nueva_preparacion['Estatus'],
                                    nueva_preparacion['Institucion'],
                                    nueva_preparacion['Pais'],
                                    nueva_preparacion['FechaInicio'],
                                    nueva_preparacion['FechaFin'],
                                    preparaciones[index]['PreparacionID']
                                ),
                                fetch=False
                            )
                            flash('Preparación académica actualizada correctamente', 'success')
                    except ValueError:
                        flash('Índice de edición inválido', 'danger')
                else:
                    execute_query(
                        """INSERT INTO PreparacionAcademica
                        (CandidatoID, Grado, Cedula, Estatus, Institucion, Pais, FechaInicio, FechaFin)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                        (
                            candidato['CandidatoID'],
                            nueva_preparacion['Grado'],
                            nueva_preparacion['Cedula'],
                            nueva_preparacion['Estatus'],
                            nueva_preparacion['Institucion'],
                            nueva_preparacion['Pais'],
                            nueva_preparacion['FechaInicio'],
                            nueva_preparacion['FechaFin']
                        ),
                        fetch=False
                    )
                    flash('Preparación académica agregada correctamente', 'success')
            except ValueError as e:
                flash(f'Error en el formato de fecha: {str(e)}', 'danger')
        
        return redirect(url_for('candidato_preparacion'))
    
    preparaciones = execute_query(
        "SELECT * FROM PreparacionAcademica WHERE CandidatoID = ? ORDER BY FechaInicio DESC",
        (candidato['CandidatoID'],)
    )
    
    return render_template('candidato/preparacion.html', 
                         candidato=candidato,
                         preparaciones=preparaciones,
                         editar_index=editar_index,
                         preparacion_editar=preparacion_editar)


@app.route('/candidato/experiencia', methods=['GET', 'POST'])
@login_required
@role_required('candidato')
def candidato_experiencia():
    candidato = get_candidato_actual()
    if not candidato:
        flash('Perfil de candidato no encontrado', 'error')
        return redirect(url_for('login'))
    

    editar_index = request.args.get('editar', type=int)
    experiencia_editar = None
    if editar_index is not None:
        experiencias = execute_query(
            "SELECT * FROM ExperienciaLaboral WHERE CandidatoID = ?",
            (candidato['CandidatoID'],)
        )
        if 0 <= editar_index < len(experiencias):
            experiencia_editar = experiencias[editar_index]
    
    if request.method == 'POST':
        try:
            if 'eliminar' in request.form:
            
                try:
                    index = int(request.form['eliminar'])
                    experiencias = execute_query(
                        "SELECT ExperienciaID FROM ExperienciaLaboral WHERE CandidatoID = ?",
                        (candidato['CandidatoID'],)
                    )
                    if 0 <= index < len(experiencias):
                        execute_query(
                            "DELETE FROM ExperienciaLaboral WHERE ExperienciaID = ?",
                            (experiencias[index]['ExperienciaID'],),
                            fetch=False
                        )
                        flash('Experiencia laboral eliminada correctamente', 'success')
                except (ValueError, KeyError):
                    flash('Error al eliminar la experiencia laboral', 'danger')
            else:

                required_fields = ['empresa', 'puesto', 'fecha_ingreso', 'funciones']
                if not all(field in request.form and request.form[field].strip() for field in required_fields):
                    flash('Por favor complete todos los campos requeridos', 'danger')
                    return redirect(url_for('candidato_experiencia'))
                
                try:
 
                    fecha_ingreso = datetime.strptime(request.form['fecha_ingreso'], '%Y-%m-%d').date()
                    fecha_salida = datetime.strptime(request.form['fecha_salida'], '%Y-%m-%d').date() if request.form.get('fecha_salida') else None
                    
                   
                    if fecha_salida and fecha_salida < fecha_ingreso:
                        flash('La fecha de salida no puede ser anterior a la fecha de ingreso', 'danger')
                        return redirect(url_for('candidato_experiencia'))

                    if fecha_salida and (fecha_salida - fecha_ingreso).days < 90:
                        flash('La experiencia laboral debe ser de al menos 3 meses', 'danger')
                        return redirect(url_for('candidato_experiencia'))

                    if fecha_ingreso > date.today():
                        flash('La fecha de ingreso no puede ser en el futuro', 'danger')
                        return redirect(url_for('candidato_experiencia'))

                    SALARIO_MINIMO_DIARIO = 207.44
                    SALARIO_MINIMO_MENSUAL = SALARIO_MINIMO_DIARIO * 30
                    
                    sueldo_inicial = float(request.form['sueldo_inicial']) if request.form.get('sueldo_inicial') else 0
                    sueldo_final = float(request.form['sueldo_final']) if request.form.get('sueldo_final') else 0
                    
                    if sueldo_inicial > 0 and sueldo_inicial < SALARIO_MINIMO_MENSUAL:
                        flash(f'El sueldo inicial no puede ser menor al salario mínimo mensual (${SALARIO_MINIMO_MENSUAL:,.2f} MXN)', 'danger')
                        return redirect(url_for('candidato_experiencia'))
                    
                    if sueldo_final > 0 and sueldo_final < sueldo_inicial:
                        flash('El sueldo final no puede ser menor al sueldo inicial', 'danger')
                        return redirect(url_for('candidato_experiencia'))
                    
                  
                    empresa = request.form['empresa'].strip()
                    if len(empresa) < 3:
                        flash('El nombre de la empresa debe tener al menos 3 caracteres', 'danger')
                        return redirect(url_for('candidato_experiencia'))
                    
        
                    puesto = request.form['puesto'].strip()
                    if len(puesto) < 3:
                        flash('El puesto debe tener al menos 3 caracteres', 'danger')
                        return redirect(url_for('candidato_experiencia'))
                    
      
                    funciones = request.form['funciones'].strip()
                    if len(funciones) < 10:
                        flash('Las funciones deben tener al menos 10 caracteres', 'danger')
                        return redirect(url_for('candidato_experiencia'))
                    

                    nueva_experiencia = {
                        'Empresa': empresa,
                        'Domicilio': request.form.get('domicilio', '').strip(),
                        'Telefono': request.form.get('telefono', '').strip(),
                        'Puesto': puesto,
                        'FechaIngreso': fecha_ingreso,
                        'FechaSalida': fecha_salida,
                        'Funciones': funciones,
                        'SueldoInicial': sueldo_inicial,
                        'SueldoFinal': sueldo_final,
                        'MotivoSeparacion': request.form.get('motivo_separacion', '').strip()
                    }
                    
                    if 'editar_index' in request.form and request.form['editar_index'].strip():
                        try:
                            index = int(request.form['editar_index'])
                            experiencias = execute_query(
                                "SELECT ExperienciaID FROM ExperienciaLaboral WHERE CandidatoID = ?",
                                (candidato['CandidatoID'],)
                            )
                            if 0 <= index < len(experiencias):
                                execute_query(
                                    """UPDATE ExperienciaLaboral SET
                                    Empresa = ?, Domicilio = ?, Telefono = ?,
                                    Puesto = ?, FechaIngreso = ?, FechaSalida = ?,
                                    Funciones = ?, SueldoInicial = ?, SueldoFinal = ?,
                                    MotivoSeparacion = ?
                                    WHERE ExperienciaID = ?""",
                                    (
                                        nueva_experiencia['Empresa'],
                                        nueva_experiencia['Domicilio'],
                                        nueva_experiencia['Telefono'],
                                        nueva_experiencia['Puesto'],
                                        nueva_experiencia['FechaIngreso'],
                                        nueva_experiencia['FechaSalida'],
                                        nueva_experiencia['Funciones'],
                                        nueva_experiencia['SueldoInicial'],
                                        nueva_experiencia['SueldoFinal'],
                                        nueva_experiencia['MotivoSeparacion'],
                                        experiencias[index]['ExperienciaID']
                                    ),
                                    fetch=False
                                )
                                flash('Experiencia laboral actualizada correctamente', 'success')
                        except ValueError:
                            flash('Índice de edición inválido', 'danger')
                    else:
                        execute_query(
                            """INSERT INTO ExperienciaLaboral
                            (CandidatoID, Empresa, Domicilio, Telefono, Puesto, 
                            FechaIngreso, FechaSalida, Funciones, SueldoInicial, SueldoFinal, MotivoSeparacion)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                            (
                                candidato['CandidatoID'],
                                nueva_experiencia['Empresa'],
                                nueva_experiencia['Domicilio'],
                                nueva_experiencia['Telefono'],
                                nueva_experiencia['Puesto'],
                                nueva_experiencia['FechaIngreso'],
                                nueva_experiencia['FechaSalida'],
                                nueva_experiencia['Funciones'],
                                nueva_experiencia['SueldoInicial'],
                                nueva_experiencia['SueldoFinal'],
                                nueva_experiencia['MotivoSeparacion']
                            ),
                            fetch=False
                        )
                        flash('Experiencia laboral agregada correctamente', 'success')
                except ValueError as e:
                    flash(f'Error en el formato de datos: {str(e)}', 'danger')
            
            return redirect(url_for('candidato_experiencia'))
        
        except Exception as e:
            current_app.logger.error(f"Error en experiencia laboral: {str(e)}")
            flash('Ocurrió un error al procesar la solicitud', 'danger')
    

    experiencias = execute_query(
        "SELECT * FROM ExperienciaLaboral WHERE CandidatoID = ? ORDER BY FechaIngreso DESC",
        (candidato['CandidatoID'],)
    )
    
    return render_template('candidato/experiencia.html',
                         candidato=candidato,
                         experiencias=experiencias,
                         editar_index=editar_index,
                         experiencia_editar=experiencia_editar)


@app.route('/candidato/referencias', methods=['GET', 'POST'])
@login_required
@role_required('candidato')
def candidato_referencias():
    candidato = get_candidato_actual()
    if not candidato:
        flash('Perfil de candidato no encontrado', 'error')
        return redirect(url_for('login'))
    

    editar_index = request.args.get('editar', type=int)
    referencia_editar = None
    if editar_index is not None:
        referencias = execute_query(
            "SELECT * FROM Referencias WHERE CandidatoID = ?",
            (candidato['CandidatoID'],)
        )
        if 0 <= editar_index < len(referencias):
            referencia_editar = referencias[editar_index]
    
    if request.method == 'POST':
        try:
            if 'eliminar' in request.form:

                try:
                    index = int(request.form['eliminar'])
                    referencias = execute_query(
                        "SELECT ReferenciaID FROM Referencias WHERE CandidatoID = ?",
                        (candidato['CandidatoID'],)
                    )
                    if 0 <= index < len(referencias):
                        execute_query(
                            "DELETE FROM Referencias WHERE ReferenciaID = ?",
                            (referencias[index]['ReferenciaID'],),
                            fetch=False
                        )
                        flash('Referencia eliminada correctamente', 'success')
                except (ValueError, KeyError):
                    flash('Error al eliminar la referencia', 'danger')
            
            else:
      
                required_fields = ['nombre', 'ocupacion', 'telefono', 'anos_conocer']
                if not all(field in request.form and request.form[field].strip() for field in required_fields):
                    flash('Complete todos los campos requeridos', 'danger')
                    return redirect(url_for('candidato_referencias'))
                
         
                nombre = request.form['nombre'].strip()
                if len(nombre) < 5 or len(nombre.split()) < 2:
                    flash('Ingrese un nombre completo válido (nombre y apellido)', 'danger')
                    return redirect(url_for('candidato_referencias'))
                
           
                ocupacion = request.form['ocupacion'].strip()
                if len(ocupacion) < 3:
                    flash('La ocupación debe tener al menos 3 caracteres', 'danger')
                    return redirect(url_for('candidato_referencias'))
                

                telefono = request.form['telefono'].strip()
                if not telefono.isdigit() or len(telefono) != 10:
                    flash('Ingrese un número de teléfono válido (10 dígitos)', 'danger')
                    return redirect(url_for('candidato_referencias'))
                
   
                try:
                    anos_conocer = int(request.form['anos_conocer'])
                    if anos_conocer < 1:
                        flash('Debe conocer a la persona al menos 1 año', 'danger')
                        return redirect(url_for('candidato_referencias'))
                    if anos_conocer > 100:
                        flash('Ingrese un valor realista de años', 'danger')
                        return redirect(url_for('candidato_referencias'))
                except ValueError:
                    flash('Años de conocer debe ser un número válido', 'danger')
                    return redirect(url_for('candidato_referencias'))
                

                empresa = request.form.get('empresa', '').strip()
                if empresa and len(empresa) < 3:
                    flash('El nombre de la empresa debe tener al menos 3 caracteres', 'danger')
                    return redirect(url_for('candidato_referencias'))
                
        
                documento = request.form.get('documento_actual', '')
                if 'documento' in request.files:
                    file = request.files['documento']
                    if file and file.filename != '':
                        if not allowed_file(file.filename):
                            flash('Solo se permiten documentos PDF (máx 5MB)', 'danger')
                            return redirect(url_for('candidato_referencias'))
                        
                   
                        file.seek(0, os.SEEK_END)
                        file_size = file.tell()
                        file.seek(0)
                        if file_size > 5 * 1024 * 1024:  
                            flash('El documento no debe exceder 5MB', 'danger')
                            return redirect(url_for('candidato_referencias'))
                        
                        filename = secure_filename(f"ref_{candidato['CandidatoID']}_{int(time.time())}.pdf")
                        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                        documento = filename
                

                nueva_referencia = {
                    'nombre': nombre,
                    'ocupacion': ocupacion,
                    'telefono': telefono,
                    'anos_conocer': anos_conocer,
                    'empresa': empresa,
                    'documento': documento
                }
                

                if 'editar_index' in request.form and request.form['editar_index'].strip():
                    try:
                        index = int(request.form['editar_index'])
                        referencias = execute_query(
                            "SELECT ReferenciaID FROM Referencias WHERE CandidatoID = ?",
                            (candidato['CandidatoID'],)
                        )
                        if 0 <= index < len(referencias):
                            execute_query(
                                """UPDATE Referencias SET
                                Nombre = ?, Ocupacion = ?, Telefono = ?,
                                AnosConocer = ?, Empresa = ?, Documento = COALESCE(?, Documento)
                                WHERE ReferenciaID = ?""",
                                (
                                    nueva_referencia['nombre'],
                                    nueva_referencia['ocupacion'],
                                    nueva_referencia['telefono'],
                                    nueva_referencia['anos_conocer'],
                                    nueva_referencia['empresa'],
                                    nueva_referencia.get('documento'),
                                    referencias[index]['ReferenciaID']
                                ),
                                fetch=False
                            )
                            flash('Referencia actualizada correctamente', 'success')
                    except ValueError:
                        flash('Error al editar la referencia', 'danger')
                else:
                    execute_query(
                        """INSERT INTO Referencias
                        (CandidatoID, Nombre, Ocupacion, Telefono, AnosConocer, Empresa, Documento)
                        VALUES (?, ?, ?, ?, ?, ?, ?)""",
                        (
                            candidato['CandidatoID'],
                            nueva_referencia['nombre'],
                            nueva_referencia['ocupacion'],
                            nueva_referencia['telefono'],
                            nueva_referencia['anos_conocer'],
                            nueva_referencia['empresa'],
                            nueva_referencia.get('documento', '')
                        ),
                        fetch=False
                    )
                    flash('Referencia agregada correctamente', 'success')
            
            return redirect(url_for('candidato_referencias'))
        
        except Exception as e:
            current_app.logger.error(f"Error en referencias: {str(e)}")
            flash('Ocurrió un error al procesar la solicitud', 'danger')
    

    referencias = execute_query(
        "SELECT * FROM Referencias WHERE CandidatoID = ?",
        (candidato['CandidatoID'],)
    )
    
    return render_template('candidato/referencias.html', 
                         candidato=candidato,
                         referencias=referencias,
                         editar_index=editar_index,
                         referencia_editar=referencia_editar)


@app.route('/candidato/habilidades', methods=['GET', 'POST'])
@login_required
@role_required('candidato')
def candidato_habilidades():
    candidato = get_candidato_actual()
    if not candidato:
        flash('Perfil de candidato no encontrado', 'error')
        return redirect(url_for('login'))
    

    todas_habilidades = execute_query("SELECT * FROM Habilidades")
    todas_competencias = execute_query("SELECT * FROM Competencias")
    

    habilidades_actuales = execute_query(
        "SELECT h.HabilidadID FROM CandidatoHabilidades ch "
        "JOIN Habilidades h ON ch.HabilidadID = h.HabilidadID "
        "WHERE ch.CandidatoID = ?",
        (candidato['CandidatoID'],)
    )
    habilidades_actuales = [h['HabilidadID'] for h in habilidades_actuales]
    
    competencias_actuales = execute_query(
        "SELECT c.CompetenciaID FROM CandidatoCompetencias cc "
        "JOIN Competencias c ON cc.CompetenciaID = c.CompetenciaID "
        "WHERE cc.CandidatoID = ?",
        (candidato['CandidatoID'],)
    )
    competencias_actuales = [c['CompetenciaID'] for c in competencias_actuales]
    
    if request.method == 'POST':
        try:

            habilidades_seleccionadas = [int(h) for h in request.form.getlist('habilidades')]
            competencias_seleccionadas = [int(c) for c in request.form.getlist('competencias')]
            
     
            execute_query(
                "DELETE FROM CandidatoHabilidades WHERE CandidatoID = ?",
                (candidato['CandidatoID'],),
                fetch=False
            )
            for habilidad_id in habilidades_seleccionadas:
                execute_query(
                    "INSERT INTO CandidatoHabilidades (CandidatoID, HabilidadID) VALUES (?, ?)",
                    (candidato['CandidatoID'], habilidad_id),
                    fetch=False
                )
            
      
            execute_query(
                "DELETE FROM CandidatoCompetencias WHERE CandidatoID = ?",
                (candidato['CandidatoID'],),
                fetch=False
            )
            for competencia_id in competencias_seleccionadas:
                execute_query(
                    "INSERT INTO CandidatoCompetencias (CandidatoID, CompetenciaID) VALUES (?, ?)",
                    (candidato['CandidatoID'], competencia_id),
                    fetch=False
                )
            
            flash('Habilidades actualizadas correctamente.', 'success')
            return redirect(url_for('candidato_habilidades'))
        
        except Exception as e:
            current_app.logger.error(f"Error al actualizar habilidades: {str(e)}")
            flash('Ocurrió un error al actualizar las habilidades', 'error')
    
    return render_template('candidato/habilidades.html', 
                         candidato=candidato,  
                         todas_habilidades=todas_habilidades,
                         todas_competencias=todas_competencias,
                         habilidades_actuales=habilidades_actuales,
                         competencias_actuales=competencias_actuales)

@app.route('/candidato/vacantes')
@login_required
@role_required('candidato')
def candidato_vacantes():
    candidato = get_candidato_actual()
    if not candidato:
        flash('Perfil de candidato no encontrado', 'error')
        return redirect(url_for('login'))

 
    query = request.args.get('q', '').strip().lower()
    modalidad = request.args.get('modalidad', '').strip().lower()
    grado_estudios = request.args.get('grado_estudios', '').strip()

    sql = """
    SELECT 
        v.VacanteID as id,
        v.Puesto,
        e.Nombre as empresa_nombre,
        v.Ubicacion,
        v.GradoEstudios as grado_estudios,
        v.Modalidad as modalidad,
        v.TipoContrato as tipo_contrato,
        FORMAT(v.FechaPublicacion, 'dd/MM/yyyy') as fecha_publicacion,
        v.PlazasDisponibles,
        v.Resumen,
        v.Salario,
        v.ExperienciaRequerida,
        v.Beneficios,
        CASE WHEN EXISTS (
            SELECT 1 FROM Postulaciones p 
            WHERE p.VacanteID = v.VacanteID 
            AND p.CandidatoID = ?
        ) THEN 1 ELSE 0 END as ya_postulado
    FROM Vacantes v
    JOIN Empresas e ON v.EmpresaID = e.EmpresaID
    WHERE v.Estatus = 'aprobada'
    AND v.PlazasDisponibles > 0
    """
    
    params = [candidato['CandidatoID']]


    if query:
        sql += """
            AND (LOWER(v.Puesto) LIKE ? OR 
                 LOWER(v.Resumen) LIKE ? OR 
                 LOWER(e.Nombre) LIKE ? OR 
                 LOWER(v.Ubicacion) LIKE ?)
        """
        params.extend([f"%{query}%"] * 4)
    
    if modalidad:
        sql += " AND LOWER(v.Modalidad) = ?"
        params.append(modalidad)
    
    if grado_estudios:
        sql += " AND v.GradoEstudios = ?"
        params.append(grado_estudios)


    sql += " ORDER BY v.FechaPublicacion DESC"

    try:
        vacantes = execute_query(sql, params)
    except Exception as e:
        print(f"Error en la consulta SQL: {e}")
        flash('Error al cargar las vacantes', 'error')
        vacantes = []
    
    return render_template('candidato/vacantes.html',
                         vacantes=vacantes,
                         search_query=query,
                         modalidad_filter=modalidad,
                         grado_filter=grado_estudios)

@app.route('/candidato/vacantes/<int:vacante_id>')
@login_required
@role_required('candidato')
def candidato_ver_vacante(vacante_id):
    candidato = get_candidato_actual()
    if not candidato:
        flash('Perfil de candidato no encontrado', 'error')
        return redirect(url_for('login'))
    

    vacante = execute_query(
        """
        SELECT 
            v.VacanteID as id,
            v.Puesto as puesto,
            v.GradoEstudios as grado_estudios,
            v.Resumen as resumen,
            v.Plazas as plazas,
            v.PlazasDisponibles,
            v.Estatus,
            v.FechaPublicacion,
            v.Salario as salario,
            v.TipoContrato as tipo_contrato,
            v.Modalidad as modalidad,
            v.Ubicacion as ubicacion,
            v.ExperienciaRequerida as experiencia_requerida,
            v.Beneficios as beneficios,
            e.Nombre as empresa_nombre,
            e.Logo as empresa_logo,
            STUFF((
                SELECT ', ' + h.Nombre
                FROM VacanteHabilidadesRequeridas vhr
                JOIN Habilidades h ON vhr.HabilidadID = h.HabilidadID
                WHERE vhr.VacanteID = v.VacanteID
                FOR XML PATH('')
            ), 1, 2, '') as habilidades_requeridas,
            STUFF((
                SELECT ', ' + h.Nombre
                FROM VacanteHabilidadesOpcionales vho
                JOIN Habilidades h ON vho.HabilidadID = h.HabilidadID
                WHERE vho.VacanteID = v.VacanteID
                FOR XML PATH('')
            ), 1, 2, '') as habilidades_opcionales,
            CASE WHEN EXISTS (
                SELECT 1 FROM Postulaciones p 
                WHERE p.VacanteID = v.VacanteID 
                AND p.CandidatoID = ?
            ) THEN 1 ELSE 0 END as ya_postulado
        FROM Vacantes v
        JOIN Empresas e ON v.EmpresaID = e.EmpresaID
        WHERE v.VacanteID = ? AND v.Estatus = 'aprobada'
        """,
        (candidato['CandidatoID'], vacante_id)
    )
       
    if not vacante:
        flash('Vacante no encontrada.', 'error')
        return redirect(url_for('candidato_vacantes'))
    
    vacante = vacante[0]
    
 
    vacante['fecha_publicacion'] = vacante['FechaPublicacion'].strftime('%d/%m/%Y') if vacante['FechaPublicacion'] else 'No especificada'
    

    vacante['disponibilidad'] = "Disponible" if vacante['PlazasDisponibles'] > 0 else "Agotado"
    vacante['habilidades_requeridas'] = [h.strip() for h in vacante['habilidades_requeridas'].split(',')] if vacante['habilidades_requeridas'] else []
    vacante['habilidades_opcionales'] = [h.strip() for h in vacante['habilidades_opcionales'].split(',')] if vacante['habilidades_opcionales'] else []
    vacante['empresa_logo'] = vacante['empresa_logo'] if vacante['empresa_logo'] else 'images/default-company.png'
    vacante['salario'] = vacante['salario'] if vacante['salario'] else 'Negociable'
    vacante['ubicacion'] = vacante['ubicacion'] if vacante['ubicacion'] else 'No especificada'
    vacante['beneficios'] = vacante['beneficios'] if vacante['beneficios'] else 'No especificados'
    

    vacante['responsabilidades'] = [] 
    vacante['requisitos'] = []  
    
    return render_template('candidato/ver_vacante.html', 
                         vacante=vacante,
                         ya_postulado=vacante['ya_postulado'])


@app.route('/candidato/postular/<int:vacante_id>')
@login_required
@role_required('candidato')
def candidato_postular(vacante_id):
    candidato = get_candidato_actual()
    if not candidato:
        flash('Perfil de candidato no encontrado', 'error')
        return redirect(url_for('login'))
    

    vacante = execute_query(
        "SELECT 1 FROM Vacantes WHERE VacanteID = ? AND Estatus = 'aprobada' AND PlazasDisponibles > 0",
        (vacante_id,)
    )
    if not vacante:
        flash('Vacante no disponible.', 'error')
        return redirect(url_for('candidato_vacantes'))
    

    ya_postulado = execute_query(
        "SELECT 1 FROM Postulaciones WHERE VacanteID = ? AND CandidatoID = ?",
        (vacante_id, candidato['CandidatoID'])
    )
    if ya_postulado:
        flash('Ya te has postulado a esta vacante.', 'warning')
        return redirect(url_for('candidato_ver_vacante', vacante_id=vacante_id))
    

    if not candidato.get('CV'):
        flash('Debes subir tu CV antes de postularte a una vacante.', 'warning')
        return redirect(url_for('candidato_perfil'))
    
    try:

        execute_query(
            "INSERT INTO Postulaciones (VacanteID, CandidatoID, Estatus) VALUES (?, ?, 'pendiente')",
            (vacante_id, candidato['CandidatoID']),
            fetch=False
        )
        
        flash('Postulación exitosa. La empresa revisará tu perfil.', 'success')
        return redirect(url_for('candidato_ver_vacante', vacante_id=vacante_id))
    
    except Exception as e:
        current_app.logger.error(f"Error al postular: {str(e)}")
        flash('Ocurrió un error al procesar tu postulación', 'error')
        return redirect(url_for('candidato_vacantes'))

@app.route('/candidato/postulaciones')
@login_required
@role_required('candidato')
def candidato_postulaciones():
    candidato = get_candidato_actual()
    if not candidato:
        flash('Perfil de candidato no encontrado', 'error')
        return redirect(url_for('login'))
    

    postulaciones = execute_query(
        """SELECT p.*, v.Puesto, v.Estatus as VacanteEstatus, 
        e.Nombre as EmpresaNombre, e.Logo as EmpresaLogo
        FROM Postulaciones p
        JOIN Vacantes v ON p.VacanteID = v.VacanteID
        JOIN Empresas e ON v.EmpresaID = e.EmpresaID
        WHERE p.CandidatoID = ?
        ORDER BY p.FechaPostulacion DESC""",
        (candidato['CandidatoID'],)
    )
    
    return render_template('candidato/postulaciones.html', postulaciones=postulaciones)

@app.route('/candidato/cancelar_postulacion/<int:postulacion_id>')
@login_required
@role_required('candidato')
def candidato_cancelar_postulacion(postulacion_id):
    candidato = get_candidato_actual()
    if not candidato:
        flash('Perfil de candidato no encontrado', 'error')
        return redirect(url_for('login'))
    
    try:

        postulacion = execute_query(
            "SELECT * FROM Postulaciones WHERE PostulacionID = ? AND CandidatoID = ?",
            (postulacion_id, candidato['CandidatoID'])
        )
        
        if not postulacion:
            flash('Postulación no encontrada.', 'error')
            return redirect(url_for('candidato_postulaciones'))
        

        execute_query(
            "DELETE FROM Postulaciones WHERE PostulacionID = ?",
            (postulacion_id,),
            fetch=False
        )
        
        flash('Postulación cancelada correctamente.', 'success')
        return redirect(url_for('candidato_postulaciones'))
    
    except Exception as e:
        current_app.logger.error(f"Error al cancelar postulación: {str(e)}")
        flash('Ocurrió un error al cancelar la postulación', 'error')
        return redirect(url_for('candidato_postulaciones'))



# ==================== CHATBOT INTELIGENTE ====================

import nltk
from nltk.stem import SnowballStemmer
import re
import json

# Descargar recursos de NLTK (solo primera vez)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

class ChatbotInteligente:
    def __init__(self):
        self.stemmer = SnowballStemmer('spanish')
        self.respuestas = self.cargar_respuestas()
        
    def cargar_respuestas(self):
        """Base de conocimientos del chatbot"""
        return {
            # Saludos
            r'\b(holla|hola|buenas|que tal|hey|saludos)\b': [
                "¡Hola! Soy el asistente virtual de TalentUPQ. ¿En qué puedo ayudarte? 😊",
                "¡Bienvenido/a! Estoy aquí para ayudarte con el proceso de búsqueda de empleo. ¿Qué necesitas?",
                "¡Hola! ¿Cómo puedo asistirte hoy?"
            ],
            
            # Cómo postularse
            r'\b(postular|aplicar|candidatar|como aplicar)\b': [
                "Para postularte a una vacante:\n1. Inicia sesión en tu cuenta\n2. Ve a la sección 'Vacantes'\n3. Busca la vacante que te interesa\n4. Haz clic en 'Postular'\n5. Completa tu perfil si no lo has hecho\n\n¿Necesitas ayuda con algún paso específico?",
                "El proceso es sencillo: encuentra la vacante que te gusta y haz clic en 'Postular'. Asegúrate de tener tu CV actualizado en tu perfil."
            ],
            
            # Crear vacante (empresa)
            r'\b(crear vacante|publicar vacante|nueva vacante)\b': [
                "Para publicar una vacante:\n1. Ve a tu panel de empresa\n2. Haz clic en 'Nueva Vacante'\n3. Completa todos los campos (puesto, requisitos, etc.)\n4. Espera la aprobación del administrador\n\n¿Te ayudo con algún campo específico?"
            ],
            
            # Requisitos para postular
            r'\b(requisitos|necesito|necesario|que se necesita)\b': [
                "Los requisitos básicos son:\n✅ Tener un perfil completo\n✅ CV actualizado\n✅ Cumplir con los requisitos de la vacante\n✅ Ser estudiante o egresado UPQ\n\n¿Te gustaría saber más sobre algún requisito específico?"
            ],
            
            # Estado de postulación
            r'\b(estado de mi postulacion|como va mi postulacion|revisar postulacion)\b': [
                "Puedes revisar el estado de tus postulaciones en la sección 'Mis Postulaciones' de tu panel. Los estados posibles son:\n• Pendiente: La empresa aún no la revisa\n• Aceptado: ¡Felicidades! Te contactarán pronto\n• Rechazado: No te desanimes, hay más oportunidades"
            ],
            
            # Entrevista
            r'\b(entrevista|como prepararme|consejos entrevista)\b': [
                "¡Excelente pregunta! Consejos para tu entrevista:\n🎯 Investiga sobre la empresa\n🎯 Prepara respuestas sobre tu experiencia\n🎯 Viste apropiadamente\n🎯 Llega puntual\n🎯 Prepara preguntas para el entrevistador\n\n¿Necesitas más consejos específicos?"
            ],
            
            # Currículum/CV
            r'\b(curriculum|cv|hoja de vida)\b': [
                "Consejos para tu CV:\n📄 Manténlo de 1-2 páginas\n📄 Destaca logros, no solo tareas\n📄 Usa palabras clave de la industria\n📄 Revisa ortografía\n📄 Incluye habilidades técnicas y blandas\n\n¿Quieres que revise tu CV?"
            ],
            
            # Habilidades
            r'\b(habilidades|que habilidades|competencias)\b': [
                "Las habilidades más demandadas actualmente son:\n💻 Python, Java, SQL\n📊 Análisis de datos\n🤝 Trabajo en equipo\n🗣️ Comunicación efectiva\n🎯 Gestión de proyectos\n\n¿Te gustaría agregar habilidades a tu perfil?"
            ],
            
            # Perfil
            r'\b(completar perfil|actualizar perfil|mi perfil)\b': [
                "Para completar tu perfil:\n1. Ve a 'Mi Perfil'\n2. Completa tus datos personales\n3. Agrega tu experiencia laboral\n4. Sube tu CV y foto\n5. Añade tus habilidades\n\n¡Un perfil completo atrae más oportunidades!"
            ],
            
            # Vacantes disponibles
            r'\b(vacantes disponibles|que vacantes hay|buscar trabajo|oportunidades)\b': [
                "¡Claro! Puedes ver todas las vacantes disponibles en la sección 'Vacantes'. También puedes filtrar por:\n• Modalidad (presencial/remoto)\n• Tipo de contrato\n• Grado de estudios\n\n¿Te ayudo a buscar algo específico?"
            ],
            
            # Salario
            r'\b(salario|sueldo|cuanto pagan)\b': [
                "El salario varía según la empresa y el puesto. Puedes ver el rango salarial en cada vacante. ¿Te gustaría que te ayude a buscar vacantes dentro de tu rango esperado?"
            ],
            
            # Tiempo de respuesta
            r'\b(cuanto tardan|tiempo respuesta|demoran)\b': [
                "El tiempo de respuesta varía por empresa. Generalmente, las empresas responden entre 1-3 semanas. Puedes dar seguimiento desde 'Mis Postulaciones'."
            ],
            
            # Despedida
            r'\b(gracias|graciass|muchas gracias|ok|excelente)\b': [
                "¡De nada! ¿Necesitas ayuda con algo más? Estoy aquí para ti. 🤗",
                "¡Con gusto! Recuerda que puedes preguntarme lo que necesites sobre el proceso de búsqueda de empleo."
            ],
            
            # Ayuda general
            r'\b(ayuda|que puedes hacer|comandos|funciones)\b': [
                "Puedo ayudarte con:\n💬 Preguntas sobre postulación\n📝 Consejos para entrevistas\n📄 Mejora de tu CV\n🔍 Información de vacantes\n📊 Estado de tus postulaciones\n\n¿Qué te gustaría saber?"
            ],
            
            # Contacto
            r'\b(contacto|soporte|quejas|problemas)\b': [
                "Puedes contactar a soporte:\n📧 Email: bolsa.trabajo@upq.edu.mx\n📞 Teléfono: (773) 108-7368\n\n¿Hay algo específico en lo que pueda ayudarte?"
            ]
        }
    
    def procesar_mensaje(self, mensaje):
        """Procesa el mensaje del usuario y genera respuesta"""
        mensaje = mensaje.lower().strip()
        
        # Buscar coincidencias con los patrones
        for patron, respuestas in self.respuestas.items():
            if re.search(patron, mensaje):
                import random
                return random.choice(respuestas)
        
        # Si no hay coincidencia, respuesta por defecto
        return self.respuesta_default(mensaje)
    
    def respuesta_default(self, mensaje):
        """Respuesta cuando no entiende la pregunta"""
        temas = ["postular", "vacante", "perfil", "CV", "entrevista", "habilidades", "salario"]
        
        for tema in temas:
            if tema in mensaje:
                return f"Parece que preguntas sobre '{tema}'. ¿Podrías ser más específico/a? Estoy aquí para ayudarte."
        
        return """Lo siento, no entendí tu pregunta. Puedo ayudarte con:
• Proceso de postulación
• Consejos para entrevistas
• Mejora de tu CV
• Información de vacantes

Escribe "ayuda" para ver más opciones."""
    
    def obtener_sugerencias(self):
        """Sugerencias rápidas para el usuario"""
        return [
            "¿Cómo me postulo a una vacante?",
            "Consejos para entrevistas",
            "¿Cómo mejorar mi CV?",
            "¿Qué vacantes hay disponibles?",
            "¿Cómo actualizo mi perfil?"
        ]

# Instancia global del chatbot
chatbot = ChatbotInteligente()

@app.route('/chatbot', methods=['GET', 'POST'])
@login_required
def chatbot_view():
    """Vista del chatbot"""
    if request.method == 'POST':
        data = request.get_json()
        mensaje = data.get('mensaje', '')
        
        if mensaje:
            respuesta = chatbot.procesar_mensaje(mensaje)
            return jsonify({
                'success': True,
                'respuesta': respuesta,
                'sugerencias': chatbot.obtener_sugerencias()
            })
        
        return jsonify({'success': False, 'error': 'Mensaje vacío'})
    
    return render_template('chatbot.html', 
                         sugerencias=chatbot.obtener_sugerencias())







@app.route('/empresa')
@login_required
@role_required('empresa')
def empresa_dashboard():
    empresa = get_empresa_actual()
    if not empresa:
        flash('Perfil de empresa no encontrado', 'error')
        return redirect(url_for('login'))

    # Vacantes de la empresa
    vacantes_empresa = execute_query(
        """SELECT TOP 3 v.*, 
        (SELECT COUNT(*) FROM Postulaciones p WHERE p.VacanteID = v.VacanteID) as NumPostulaciones,
        CASE v.Estatus
            WHEN 'en_revision' THEN 'badge-warning'
            WHEN 'aprobada' THEN 'badge-success'
            WHEN 'rechazada' THEN 'badge-danger'
            WHEN 'cerrada' THEN 'badge-secondary'
            ELSE 'badge-light'
        END as EstadoClase
        FROM Vacantes v
        WHERE v.EmpresaID = ?
        ORDER BY v.FechaPublicacion DESC""",
        (empresa['EmpresaID'],)
    )

    # Postulaciones pendientes
    postulaciones_recientes = execute_query(
        """SELECT TOP 3 p.*, c.Nombre as CandidatoNombre, 
        c.ApellidoPaterno as CandidatoApellido, v.Puesto as VacantePuesto
        FROM Postulaciones p
        JOIN Candidatos c ON p.CandidatoID = c.CandidatoID
        JOIN Vacantes v ON p.VacanteID = v.VacanteID
        WHERE v.EmpresaID = ? AND p.Estatus = 'pendiente'
        ORDER BY p.FechaPostulacion DESC""",
        (empresa['EmpresaID'],)
    )

    # Notificaciones
    notificaciones = execute_query(
        "SELECT COUNT(*) as Count FROM Notificaciones WHERE EmpresaID = ? AND Leida = 0",
        (empresa['EmpresaID'],)
    )
    num_notificaciones = notificaciones[0]['Count'] if notificaciones else 0

    # ========== NUEVO: Conversaciones recientes ==========
    conversaciones_recientes = []
    no_leidos_empresa = 0
    
    try:
        # Obtener las 5 conversaciones más recientes
        conversaciones_recientes = execute_query(
            """SELECT TOP 5 
               c.ConversacionID,
               c.VacanteID,
               c.CandidatoID,
               c.FechaInicio,
               v.Puesto as VacantePuesto,
               cand.Nombre as CandidatoNombre,
               cand.ApellidoPaterno as CandidatoApellido,
               cand.FotoPerfil as CandidatoFoto,
               (SELECT TOP 1 Mensaje FROM Mensajes 
                WHERE ConversacionID = c.ConversacionID 
                ORDER BY FechaEnvio DESC) as UltimoMensaje,
               (SELECT TOP 1 FechaEnvio FROM Mensajes 
                WHERE ConversacionID = c.ConversacionID 
                ORDER BY FechaEnvio DESC) as UltimoMensajeFecha,
               (SELECT COUNT(*) FROM Mensajes 
                WHERE ConversacionID = c.ConversacionID 
                AND RemitenteTipo = 'candidato' 
                AND Leido = 0) as NoLeidos
               FROM Conversaciones c
               JOIN Vacantes v ON c.VacanteID = v.VacanteID
               JOIN Candidatos cand ON c.CandidatoID = cand.CandidatoID
               WHERE c.EmpresaID = ? AND c.Activa = 1
               ORDER BY UltimoMensajeFecha DESC""",
            (empresa['EmpresaID'],)
        )
        
        # Obtener total de mensajes no leídos para el badge
        result_no_leidos = execute_query(
            """SELECT COUNT(*) as Total FROM Mensajes m
               JOIN Conversaciones c ON m.ConversacionID = c.ConversacionID
               WHERE c.EmpresaID = ? AND m.RemitenteTipo = 'candidato' AND m.Leido = 0""",
            (empresa['EmpresaID'],)
        )
        if result_no_leidos:
            no_leidos_empresa = result_no_leidos[0]['Total']
            
    except Exception as e:
        # Si hay error (tabla no existe o algo), simplemente ignorar
        print(f"Error al obtener conversaciones: {e}")
        conversaciones_recientes = []
        no_leidos_empresa = 0

    return render_template('empresa/dashboard.html',
                         empresa=empresa,
                         vacantes_empresa=vacantes_empresa,
                         postulaciones_recientes=postulaciones_recientes,
                         num_notificaciones=num_notificaciones,
                         conversaciones_recientes=conversaciones_recientes,
                         no_leidos_empresa=no_leidos_empresa)  # Nuevas variables

@app.route('/empresa/perfil', methods=['GET', 'POST'])
@login_required
@role_required('empresa')
def empresa_perfil():
    empresa = get_empresa_actual()
    if not empresa:
        flash('Perfil de empresa no encontrado', 'error')
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        try:

            logo = empresa.get('Logo', '')
            if 'logo' in request.files:
                file = request.files['logo']
                if file and allowed_file(file.filename):
                    filename = secure_filename(f"logo_{empresa['EmpresaID']}.{file.filename.rsplit('.', 1)[1].lower()}")
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    logo = filename
            

            execute_query(
                """UPDATE Empresas SET
                Nombre = ?, Direccion = ?, Telefono = ?,
                SitioWeb = ?, Descripcion = ?, Logo = ?
                WHERE EmpresaID = ?""",
                (
                    request.form['nombre'],
                    request.form['direccion'],
                    request.form['telefono'],
                    request.form['sitio_web'],
                    request.form['descripcion'],
                    logo,
                    empresa['EmpresaID']
                ),
                fetch=False
            )
            
            flash('Perfil de empresa actualizado correctamente.', 'success')
            return redirect(url_for('empresa_perfil'))
        
        except Exception as e:
            current_app.logger.error(f"Error al actualizar perfil de empresa: {str(e)}")
            flash('Ocurrió un error al actualizar el perfil', 'error')
    
    return render_template('empresa/perfil.html', empresa=empresa)

@app.route('/empresa/vacantes')
@login_required
@role_required('empresa')
def empresa_vacantes():
    empresa = get_empresa_actual()
    if not empresa:
        flash('Perfil de empresa no encontrado', 'error')
        return redirect(url_for('login'))
    

    vacantes = execute_query(
        """SELECT v.*, 
        (SELECT COUNT(*) FROM Postulaciones p WHERE p.VacanteID = v.VacanteID) as NumPostulaciones,
        CASE v.Estatus
            WHEN 'en_revision' THEN 'badge-warning'
            WHEN 'aprobada' THEN 'badge-success'
            WHEN 'rechazada' THEN 'badge-danger'
            WHEN 'cerrada' THEN 'badge-secondary'
            ELSE 'badge-light'
        END as EstadoClase
        FROM Vacantes v
        WHERE v.EmpresaID = ?
        ORDER BY v.FechaPublicacion DESC""",
        (empresa['EmpresaID'],)
    )
    
    return render_template('empresa/vacantes.html', vacantes=vacantes, empresa=empresa)

@app.route('/empresa/vacantes/nueva', methods=['GET', 'POST'])
@login_required
@role_required('empresa')
def empresa_nueva_vacante():
    empresa = get_empresa_actual()
    if not empresa:
        flash('Perfil de empresa no encontrado', 'error')
        return redirect(url_for('login'))


    todas_habilidades = execute_query("SELECT * FROM Habilidades ORDER BY Nombre")
    tipos_contrato = ['Tiempo completo', 'Medio tiempo', 'Por proyecto', 'Prácticas', 'Freelance']
    modalidades = ['Presencial', 'Remoto', 'Híbrido']
    niveles_experiencia = ['Sin experiencia', '1-3 años', '3-5 años', '5+ años']
    grados_estudios = ['Secundaria', 'Bachillerato', 'Licenciatura', 'Maestría', 'Doctorado']

    if request.method == 'POST':
        try:
    
            required_fields = {
                'puesto': 'Puesto',
                'grado_estudios': 'Grado de estudios',
                'resumen': 'Descripción del puesto',
                'plazas': 'Plazas disponibles',
                'tipo_contrato': 'Tipo de contrato',
                'modalidad': 'Modalidad de trabajo',
                'experiencia': 'Experiencia requerida'
            }
            
            for field, name in required_fields.items():
                if not request.form.get(field):
                    flash(f'El campo {name} es requerido', 'error')
                    return redirect(url_for('empresa_nueva_vacante'))

            execute_query(
                """INSERT INTO Vacantes 
                (EmpresaID, Puesto, GradoEstudios, Resumen, Plazas, PlazasDisponibles,
                Estatus, Salario, TipoContrato, Modalidad, Ubicacion, ExperienciaRequerida,
                Beneficios, FechaCierre)
                VALUES (?, ?, ?, ?, ?, ?, 'en_revision', ?, ?, ?, ?, ?, ?, ?)""",
                (
                    empresa['EmpresaID'],
                    request.form['puesto'],
                    request.form['grado_estudios'],
                    request.form['resumen'],
                    int(request.form['plazas']),
                    int(request.form['plazas']),
                    request.form.get('salario', ''),
                    request.form['tipo_contrato'],
                    request.form['modalidad'],
                    request.form.get('ubicacion', ''),
                    request.form['experiencia'],
                    request.form.get('beneficios', ''),
                    datetime.strptime(request.form['fecha_cierre'], '%Y-%m-%d').date() if request.form.get('fecha_cierre') else None
                ),
                fetch=False
            )
            

            nueva_vacante = execute_query(
                "SELECT TOP 1 VacanteID FROM Vacantes WHERE EmpresaID = ? ORDER BY FechaPublicacion DESC",
                (empresa['EmpresaID'],)
            )
            vacante_id = nueva_vacante[0]['VacanteID']
            

            for habilidad_id in request.form.getlist('habilidades_requeridas'):
                execute_query(
                    "INSERT INTO VacanteHabilidadesRequeridas (VacanteID, HabilidadID) VALUES (?, ?)",
                    (vacante_id, int(habilidad_id)),
                    fetch=False
                )
            
            for habilidad_id in request.form.getlist('habilidades_opcionales'):
                execute_query(
                    "INSERT INTO VacanteHabilidadesOpcionales (VacanteID, HabilidadID) VALUES (?, ?)",
                    (vacante_id, int(habilidad_id)),
                    fetch=False
                )
            

            admins = execute_query("SELECT AdministradorID FROM Administradores")
            for admin in admins:
                execute_query(
                    "INSERT INTO VacantesRevision (AdministradorID, VacanteID) VALUES (?, ?)",
                    (admin['AdministradorID'], vacante_id),
                    fetch=False
                )
            
            flash('Vacante creada correctamente. Pendiente de aprobación.', 'success')
            return redirect(url_for('empresa_vacantes'))
        
        except ValueError as e:
            flash('Error en los datos proporcionados: ' + str(e), 'error')
            return redirect(url_for('empresa_nueva_vacante'))
        except Exception as e:
            current_app.logger.error(f"Error al crear vacante: {str(e)}")
            flash('Ocurrió un error al crear la vacante', 'error')
            return redirect(url_for('empresa_nueva_vacante'))
    
    return render_template('empresa/nueva_vacante.html',
                        todas_habilidades=todas_habilidades,
                        tipos_contrato=tipos_contrato,
                        modalidades=modalidades,
                        niveles_experiencia=niveles_experiencia,
                        grados_estudios=grados_estudios,
                        editar=False,
                        vacante=None)

@app.route('/empresa/vacantes/<int:vacante_id>', methods=['GET', 'POST'])
@login_required
@role_required('empresa')
def empresa_ver_vacante(vacante_id):
    empresa = get_empresa_actual()
    if not empresa:
        flash('Perfil de empresa no encontrado', 'error')
        return redirect(url_for('login'))
    

    vacante = execute_query(
        "SELECT * FROM Vacantes WHERE VacanteID = ? AND EmpresaID = ?",
        (vacante_id, empresa['EmpresaID'])
    )
    if not vacante:
        flash('Vacante no encontrada.', 'error')
        return redirect(url_for('empresa_vacantes'))
    
    vacante = vacante[0]

    habilidades_requeridas = execute_query(
        "SELECT h.* FROM VacanteHabilidadesRequeridas vh "
        "JOIN Habilidades h ON vh.HabilidadID = h.HabilidadID "
        "WHERE vh.VacanteID = ?",
        (vacante_id,)
    )
    
    habilidades_opcionales = execute_query(
        "SELECT h.* FROM VacanteHabilidadesOpcionales vh "
        "JOIN Habilidades h ON vh.HabilidadID = h.HabilidadID "
        "WHERE vh.VacanteID = ?",
        (vacante_id,)
    )
    

    postulaciones = execute_query(
        """SELECT p.*, c.*, 
        (SELECT COUNT(*) FROM CandidatoHabilidades ch 
         JOIN VacanteHabilidadesRequeridas vh ON ch.HabilidadID = vh.HabilidadID
         WHERE ch.CandidatoID = c.CandidatoID AND vh.VacanteID = ?) as HabilidadesCoincidentes
        FROM Postulaciones p
        JOIN Candidatos c ON p.CandidatoID = c.CandidatoID
        WHERE p.VacanteID = ?
        ORDER BY p.FechaPostulacion DESC""",
        (vacante_id, vacante_id)
    )
    

    num_habilidades_req = len(habilidades_requeridas)
    for post in postulaciones:
        if num_habilidades_req > 0:
            post['PorcentajeCoincidencia'] = round((post['HabilidadesCoincidentes'] / num_habilidades_req) * 100, 1)
        else:
            post['PorcentajeCoincidencia'] = 0
    
    return render_template('empresa/ver_vacante.html', 
                         vacante=vacante, 
                         postulaciones=postulaciones,
                         habilidades_requeridas=habilidades_requeridas,
                         habilidades_opcionales=habilidades_opcionales,
                         ahora=datetime.now())



@app.route('/empresa/aceptar_candidato/<int:vacante_id>/<int:candidato_id>')
@login_required
@role_required('empresa')
def empresa_aceptar_candidato(vacante_id, candidato_id):
    empresa = get_empresa_actual()
    if not empresa:
        flash('Perfil de empresa no encontrado', 'error')
        return redirect(url_for('login'))
    
    vacante = execute_query(
        "SELECT * FROM Vacantes WHERE VacanteID = ? AND EmpresaID = ?",
        (vacante_id, empresa['EmpresaID'])
    )
    if not vacante:
        flash('Vacante no encontrada.', 'error')
        return redirect(url_for('empresa_vacantes'))
    
    vacante = vacante[0]
    
    try:
        # Actualizar postulación
        execute_query(
            "UPDATE Postulaciones SET Estatus = 'aceptado' WHERE VacanteID = ? AND CandidatoID = ?",
            (vacante_id, candidato_id),
            fetch=False
        )
        
        # Actualizar plazas
        execute_query(
            "UPDATE Vacantes SET PlazasDisponibles = PlazasDisponibles - 1 WHERE VacanteID = ?",
            (vacante_id,),
            fetch=False
        )
        
        # Cerrar vacante si no hay más plazas
        if vacante['PlazasDisponibles'] <= 1:
            execute_query(
                "UPDATE Vacantes SET Estatus = 'cerrada' WHERE VacanteID = ?",
                (vacante_id,),
                fetch=False
            )
        
        # Crear conversación automáticamente
        conversacion_existente = execute_query(
            "SELECT 1 FROM Conversaciones WHERE VacanteID = ? AND CandidatoID = ?",
            (vacante_id, candidato_id)
        )
        
        if not conversacion_existente:
            execute_query(
                """INSERT INTO Conversaciones (VacanteID, CandidatoID, EmpresaID)
                   VALUES (?, ?, ?)""",
                (vacante_id, candidato_id, empresa['EmpresaID']),
                fetch=False
            )
            
            # Enviar mensaje de bienvenida automático
            conversacion = execute_query(
                "SELECT ConversacionID FROM Conversaciones WHERE VacanteID = ? AND CandidatoID = ?",
                (vacante_id, candidato_id)
            )
            
            if conversacion:
                mensaje_bienvenida = f"""¡Hola! 👋

Te escribo de {empresa['Nombre']}. Hemos revisado tu postulación para la vacante de {vacante['Puesto']} y ¡nos alegra informarte que has sido seleccionado/a para continuar con el proceso!

A través de este chat podremos coordinar los siguientes pasos:

1. 📝 Revisión de documentos
2. 📅 Programación de entrevista
3. 📋 Detalles adicionales sobre la posición

¿Qué te parece si comenzamos conversando sobre tus expectativas y disponibilidad?

Estamos muy entusiasmados con tu perfil y esperamos trabajar juntos. ✨

Saludos cordiales,
Equipo de {empresa['Nombre']}"""
                
                execute_query(
                    """INSERT INTO Mensajes (ConversacionID, RemitenteID, RemitenteTipo, Mensaje)
                       VALUES (?, ?, 'empresa', ?)""",
                    (conversacion[0]['ConversacionID'], empresa['EmpresaID'], mensaje_bienvenida),
                    fetch=False
                )
        
        # Notificación
        execute_query(
            """INSERT INTO Notificaciones 
            (EmpresaID, Mensaje, Tipo, VacanteID)
            VALUES (?, 'Tu postulación ha sido aceptada. Ya puedes chatear con la empresa.', 'postulacion', ?)""",
            (empresa['EmpresaID'], vacante_id),
            fetch=False
        )
        
        flash('Candidato aceptado correctamente. Se ha abierto un chat para seguimiento.', 'success')
        return redirect(url_for('ver_conversacion', vacante_id=vacante_id, candidato_id=candidato_id))
    
    except Exception as e:
        current_app.logger.error(f"Error al aceptar candidato: {str(e)}")
        flash('Ocurrió un error al aceptar al candidato', 'error')
        return redirect(url_for('empresa_ver_vacante', vacante_id=vacante_id))
    
@app.template_filter('nl2br')
def nl2br_filter(s):
    """Convierte saltos de línea en <br> tags"""
    if not s:
        return ''
    return s.replace('\n', '<br>\n')

@app.context_processor
def inject_global_variables():
    """Inyecta variables globales en todos los templates"""
    no_leidos = 0
    
    if 'user_id' in session:
        usuario_actual = get_usuario_actual()
        if usuario_actual:
            if usuario_actual['TipoUsuario'] == 'candidato':
                candidato = get_candidato_actual()
                if candidato:
                    try:
                        result = execute_query(
                            """SELECT COUNT(*) as Total FROM Mensajes m
                               JOIN Conversaciones c ON m.ConversacionID = c.ConversacionID
                               WHERE c.CandidatoID = ? AND m.RemitenteTipo = 'empresa' AND m.Leido = 0""",
                            (candidato['CandidatoID'],)
                        )
                        if result:
                            no_leidos = result[0]['Total']
                    except Exception:
                        pass
            elif usuario_actual['TipoUsuario'] == 'empresa':
                empresa = get_empresa_actual()
                if empresa:
                    try:
                        result = execute_query(
                            """SELECT COUNT(*) as Total FROM Mensajes m
                               JOIN Conversaciones c ON m.ConversacionID = c.ConversacionID
                               WHERE c.EmpresaID = ? AND m.RemitenteTipo = 'candidato' AND m.Leido = 0""",
                            (empresa['EmpresaID'],)
                        )
                        if result:
                            no_leidos = result[0]['Total']
                    except Exception:
                        pass
    
    return {
        'no_leidos': no_leidos,
        'current_year': datetime.now().year
    }
########


@app.route('/empresa/rechazar_candidato/<int:vacante_id>/<int:candidato_id>', methods=['GET', 'POST'])
@login_required
@role_required('empresa')
def empresa_rechazar_candidato(vacante_id, candidato_id):
    empresa = get_empresa_actual()
    if not empresa:
        flash('Perfil de empresa no encontrado', 'error')
        return redirect(url_for('login'))
    

    vacante = execute_query(
        "SELECT * FROM Vacantes WHERE VacanteID = ? AND EmpresaID = ?",
        (vacante_id, empresa['EmpresaID'])
    )
    if not vacante:
        flash('Vacante no encontrada.', 'error')
        return redirect(url_for('empresa_vacantes'))
    
    if request.method == 'POST':
        comentarios = request.form.get('comentarios', '').strip()
        if len(comentarios) < 10:
            flash('Por favor ingresa un motivo de rechazo (mínimo 10 caracteres)', 'warning')
            return redirect(url_for('empresa_rechazar_candidato', 
                                 vacante_id=vacante_id, 
                                 candidato_id=candidato_id))
        
        try:

            execute_query(
                "UPDATE Postulaciones SET Estatus = 'rechazado', Comentarios = ? WHERE VacanteID = ? AND CandidatoID = ?",
                (comentarios, vacante_id, candidato_id),
                fetch=False
            )
            
    
            execute_query(
                """INSERT INTO Notificaciones 
                (EmpresaID, Mensaje, Tipo, Comentarios, VacanteID)
                VALUES (?, 'Tu postulación ha sido rechazada', 'postulacion', ?, ?)""",
                (empresa['EmpresaID'], comentarios, vacante_id),
                fetch=False
            )
            
            flash('Candidato rechazado correctamente.', 'success')
            return redirect(url_for('empresa_ver_vacante', vacante_id=vacante_id))
        
        except Exception as e:
            current_app.logger.error(f"Error al rechazar candidato: {str(e)}")
            flash('Ocurrió un error al rechazar al candidato', 'error')
            return redirect(url_for('empresa_ver_vacante', vacante_id=vacante_id))
    
    return render_template('empresa/rechazar_candidato.html', 
                         vacante_id=vacante_id, 
                         candidato_id=candidato_id)

@app.route('/empresa/candidatos/<int:candidato_id>')
@login_required
@role_required('empresa')
def empresa_ver_candidato(candidato_id):
    empresa = get_empresa_actual()
    if not empresa:
        flash('Perfil de empresa no encontrado', 'error')
        return redirect(url_for('login'))

    candidato = execute_query(
        "SELECT * FROM Candidatos WHERE CandidatoID = ?",
        (candidato_id,)
    )
    
    if not candidato:
        flash('Candidato no encontrado', 'error')
        return redirect(url_for('empresa_vacantes'))
    
    candidato = candidato[0]
    

    nombres = [candidato['Nombre']]
    if candidato.get('ApellidoPaterno'):
        nombres.append(candidato['ApellidoPaterno'])
    if candidato.get('ApellidoMaterno'):
        nombres.append(candidato['ApellidoMaterno'])
    candidato['NombreCompleto'] = ' '.join(nombres)
    

    habilidades = execute_query(
        "SELECT h.* FROM CandidatoHabilidades ch "
        "JOIN Habilidades h ON ch.HabilidadID = h.HabilidadID "
        "WHERE ch.CandidatoID = ?",
        (candidato_id,)
    )
    

    experiencia = []
    try:
        experiencia = execute_query(
            "SELECT * FROM ExperienciaLaboral "
            "WHERE CandidatoID = ? "
            "ORDER BY CASE WHEN FechaSalida IS NULL THEN 0 ELSE 1 END, FechaSalida DESC",
            (candidato_id,)
        )
    except Exception as e:
        print(f"Error al obtener experiencia: {e}")
    

    educacion = []
    try:
        educacion = execute_query(
            "SELECT * FROM PreparacionAcademica "
            "WHERE CandidatoID = ? "
            "ORDER BY CASE WHEN FechaFin IS NULL THEN 0 ELSE 1 END, FechaFin DESC",
            (candidato_id,)
        )
    except Exception as e:
        print(f"Error al obtener educación: {e}")
    

    referencias = []
    try:
        referencias = execute_query(
            "SELECT * FROM Referencias "
            "WHERE CandidatoID = ?",
            (candidato_id,)
        )
    except Exception as e:
        print(f"Error al obtener referencias: {e}")
    

    cv_url = None
    if candidato.get('CV'):
        cv_url = url_for('static', filename='uploads/' + candidato['CV'])
    
    return render_template('empresa/ver_candidato.html',
                        candidato=candidato,
                        habilidades=habilidades,
                        experiencia=experiencia,
                        educacion=educacion,
                        referencias=referencias,
                        cv_url=cv_url)

@app.route('/empresa/notificaciones')
@login_required
@role_required('empresa')
def empresa_notificaciones():
    empresa = get_empresa_actual()
    if not empresa:
        flash('Perfil de empresa no encontrado', 'error')
        return redirect(url_for('login'))
    
   
    notificaciones = execute_query(
        "SELECT * FROM Notificaciones WHERE EmpresaID = ? ORDER BY Fecha DESC",
        (empresa['EmpresaID'],)
    )
    
  
    execute_query(
        "UPDATE Notificaciones SET Leida = 1 WHERE EmpresaID = ? AND Leida = 0",
        (empresa['EmpresaID'],),
        fetch=False
    )
    
    return render_template('empresa/notificaciones.html', notificaciones=notificaciones)

@app.route('/empresa/vacante/<int:vacante_id>/<nuevo_estado>')
@login_required
@role_required('empresa')
def empresa_cambiar_estado_vacante(vacante_id, nuevo_estado):
    empresa = get_empresa_actual()
    if not empresa:
        flash('Perfil de empresa no encontrado', 'error')
        return redirect(url_for('login'))
    
    
    vacante = execute_query(
        "SELECT * FROM Vacantes WHERE VacanteID = ? AND EmpresaID = ?",
        (vacante_id, empresa['EmpresaID'])
    )
    if not vacante:
        flash('Vacante no encontrada', 'error')
        return redirect(url_for('empresa_vacantes'))
    
    vacante = vacante[0]
    
    estados_validos = ['abierta', 'cerrada']
    if nuevo_estado not in estados_validos:
        flash('Estado no válido', 'error')
        return redirect(url_for('empresa_ver_vacante', vacante_id=vacante_id))
    
    try:
 
        if (vacante['Estatus'] == 'aprobada' and nuevo_estado == 'abierta') or \
           (vacante['Estatus'] == 'abierta' and nuevo_estado == 'cerrada'):
            
            execute_query(
                "UPDATE Vacantes SET Estatus = ? WHERE VacanteID = ?",
                (nuevo_estado, vacante_id),
                fetch=False
            )
            
            flash(f'Estado de la vacante actualizado a "{nuevo_estado}"', 'success')
        else:
            flash('Transición de estado no permitida', 'error')
        
        return redirect(url_for('empresa_ver_vacante', vacante_id=vacante_id))
    
    except Exception as e:
        current_app.logger.error(f"Error al cambiar estado de vacante: {str(e)}")
        flash('Ocurrió un error al cambiar el estado', 'error')
        return redirect(url_for('empresa_ver_vacante', vacante_id=vacante_id))


def crear_admin_inicial():
    admin_existente = execute_query(
        "SELECT 1 FROM Usuarios WHERE Email = 'Admin@upq.edu.mx'"
    )
    
    if not admin_existente:
        execute_query(
            """INSERT INTO Usuarios 
            (Email, PasswordHash, Rol, Nombre, Activo) 
            VALUES (?, ?, 'admin', 'Administrador', 1)""",
            ('Admin@upq.edu.mx', generate_password_hash('Admin1234')),
            fetch=False
        )



@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():

    if 'user_id' in session and session.get('tipo') == 'admin':
        return redirect(url_for('admin_dashboard'))

    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')


        if email == 'Admin@upq.edu.mx' and password == 'Admin1234':
            session['email'] = email
            session['tipo'] = 'admin'
            session['user_id'] = 0  
            flash('Bienvenido Administrador', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Credenciales administrativas incorrectas', 'error')


    return render_template('admin/login.html')  

# Rutas para administrador
@app.route('/admin')
@login_required
@role_required('admin')
def admin_dashboard():

    vacantes_pendientes = execute_query(
        """SELECT DISTINCT v.VacanteID as id, v.*, e.Nombre as empresa_nombre, 
           FORMAT(v.FechaPublicacion, 'dd/MM/yyyy') as fecha_formateada
           FROM Vacantes v
           JOIN Empresas e ON v.EmpresaID = e.EmpresaID
           WHERE v.Estatus = 'en_revision'
           ORDER BY v.FechaPublicacion DESC"""
    )
    
   
    if vacantes_pendientes:
        for vacante in vacantes_pendientes:
     
            habilidades_req = execute_query(
                """SELECT h.Nombre 
                   FROM VacanteHabilidadesRequeridas vh
                   JOIN Habilidades h ON vh.HabilidadID = h.HabilidadID
                   WHERE vh.VacanteID = ?""",
                (vacante['id'],)
            )
            vacante['habilidades_requeridas'] = [h['Nombre'] for h in habilidades_req]
            
    
            habilidades_opc = execute_query(
                """SELECT h.Nombre 
                   FROM VacanteHabilidadesOpcionales vh
                   JOIN Habilidades h ON vh.HabilidadID = h.HabilidadID
                   WHERE vh.VacanteID = ?""",
                (vacante['id'],)
            )
            vacante['habilidades_opcionales'] = [h['Nombre'] for h in habilidades_opc]
    

    estadisticas = {
        'total_empresas': execute_query("SELECT COUNT(*) as Count FROM Empresas")[0]['Count'],
        'total_candidatos': execute_query("SELECT COUNT(*) as Count FROM Candidatos")[0]['Count'],
        'vacantes_activas': execute_query("SELECT COUNT(*) as Count FROM Vacantes WHERE Estatus = 'aprobada'")[0]['Count'],
        'postulaciones': execute_query("SELECT COUNT(*) as Count FROM Postulaciones")[0]['Count']
    }
    
    return render_template('admin/dashboard.html', 
                         vacantes=vacantes_pendientes,
                         estadisticas=estadisticas)

@app.route('/admin/vacantes/<int:vacante_id>')
@login_required
@role_required('admin')
def admin_ver_vacante(vacante_id):

    vacante_result = execute_query(
        """SELECT 
            v.VacanteID,
            v.Puesto,
            v.GradoEstudios,
            v.Resumen,
            v.Plazas,
            v.PlazasDisponibles,
            v.Estatus,
            FORMAT(v.FechaPublicacion, 'dd/MM/yyyy') as FechaPublicacion,
            FORMAT(v.FechaAprobacion, 'dd/MM/yyyy') as FechaAprobacion,
            v.ComentariosAdmin,
            v.Salario,
            v.TipoContrato,
            v.Modalidad,
            v.Ubicacion,
            v.ExperienciaRequerida,
            v.Beneficios,
            FORMAT(v.FechaCierre, 'dd/MM/yyyy') as FechaCierre,
            e.Nombre as EmpresaNombre
           FROM Vacantes v
           JOIN Empresas e ON v.EmpresaID = e.EmpresaID
           WHERE v.VacanteID = ?""",
        (vacante_id,)
    )
    
    if not vacante_result:
        flash('Vacante no encontrada', 'error')
        return redirect(url_for('admin_dashboard'))
    

    vacante = vacante_result[0] if vacante_result else None
    

    habilidades_requeridas_result = execute_query(
        """SELECT h.Nombre 
           FROM VacanteHabilidadesRequeridas vh
           JOIN Habilidades h ON vh.HabilidadID = h.HabilidadID
           WHERE vh.VacanteID = ?""",
        (vacante_id,)
    )
    habilidades_requeridas = [h['Nombre'] for h in habilidades_requeridas_result] if habilidades_requeridas_result else []
    

    habilidades_opcionales_result = execute_query(
        """SELECT h.Nombre 
           FROM VacanteHabilidadesOpcionales vh
           JOIN Habilidades h ON vh.HabilidadID = h.HabilidadID
           WHERE vh.VacanteID = ?""",
        (vacante_id,)
    )
    habilidades_opcionales = [h['Nombre'] for h in habilidades_opcionales_result] if habilidades_opcionales_result else []
    
    return render_template('admin/ver_vacante.html',
                         vacante=vacante,
                         empresa={'nombre': vacante['EmpresaNombre']},
                         habilidades_requeridas=habilidades_requeridas,
                         habilidades_opcionales=habilidades_opcionales)

@app.route('/admin/aprobar_vacante/<int:vacante_id>', methods=['POST'])
@login_required
@role_required('admin')
def admin_aprobar_vacante(vacante_id):
    try:

        execute_query(
            """UPDATE Vacantes SET 
            Estatus = 'aprobada', 
            FechaAprobacion = GETDATE(),
            ComentariosAdmin = 'Aprobada por el administrador'
            WHERE VacanteID = ?""",
            (vacante_id,),
            fetch=False
        )
        

        vacante = execute_query(
            "SELECT EmpresaID, Puesto FROM Vacantes WHERE VacanteID = ?",
            (vacante_id,)
        )
        if vacante:
            execute_query(
                """INSERT INTO Notificaciones 
                (EmpresaID, Mensaje, Tipo, VacanteID)
                VALUES (?, 'Tu vacante ha sido aprobada', 'aprobacion', ?)""",
                (vacante[0]['EmpresaID'], vacante_id),
                fetch=False
            )
        
        flash('Vacante aprobada correctamente', 'success')
        return redirect(url_for('admin_dashboard'))
    
    except Exception as e:
        current_app.logger.error(f"Error al aprobar vacante: {str(e)}")
        flash('Error al aprobar la vacante', 'error')
        return redirect(url_for('admin_dashboard'))

@app.route('/admin/rechazar_vacante/<int:vacante_id>', methods=['POST'])
@login_required
@role_required('admin')
def admin_rechazar_vacante(vacante_id):
    comentarios = request.form.get('comentarios', '').strip()
    if len(comentarios) < 10:
        flash('Por favor ingresa un motivo de rechazo (mínimo 10 caracteres)', 'warning')
        return redirect(url_for('admin_ver_vacante', vacante_id=vacante_id))
    
    try:

        execute_query(
            """UPDATE Vacantes SET 
            Estatus = 'rechazada', 
            ComentariosAdmin = ?
            WHERE VacanteID = ?""",
            (comentarios, vacante_id),
            fetch=False
        )
        

        vacante = execute_query(
            "SELECT EmpresaID, Puesto FROM Vacantes WHERE VacanteID = ?",
            (vacante_id,)
        )
        if vacante:
            execute_query(
                """INSERT INTO Notificaciones 
                (EmpresaID, Mensaje, Tipo, Comentarios, VacanteID)
                VALUES (?, 'Tu vacante ha sido rechazada', 'rechazo', ?, ?)""",
                (vacante[0]['EmpresaID'], comentarios, vacante_id),
                fetch=False
            )
        
        flash('Vacante rechazada correctamente', 'success')
        return redirect(url_for('admin_dashboard'))
    
    except Exception as e:
        current_app.logger.error(f"Error al rechazar vacante: {str(e)}")
        flash('Error al rechazar la vacante', 'error')
        return redirect(url_for('admin_dashboard'))


@app.route('/admin/panel-control')
@login_required
@role_required('admin')
def admin_panel_control():

    estadisticas = {
        'usuarios_count': execute_query("SELECT COUNT(*) as Count FROM Usuarios")[0]['Count'],
        'empresas_count': execute_query("SELECT COUNT(*) as Count FROM Empresas")[0]['Count'],
        'candidatos_count': execute_query("SELECT COUNT(*) as Count FROM Candidatos")[0]['Count'],
        'vacantes_count': execute_query("SELECT COUNT(*) as Count FROM Vacantes")[0]['Count'],
        'postulaciones_count': execute_query("SELECT COUNT(*) as Count FROM Postulaciones")[0]['Count'],
        'vacantes_pendientes': execute_query("SELECT COUNT(*) as Count FROM Vacantes WHERE Estatus = 'en_revision'")[0]['Count']
    }
    
    return render_template('admin/panel_control.html', **estadisticas)

@app.route('/admin/usuarios')
def admin_usuarios():

    admin_id = session.get('UsuarioID')  
    
    usuarios = execute_query(
    """SELECT 
        UsuarioID, 
        Email, 
        TipoUsuario, 
        FechaRegistro, 
        Activo
    FROM Usuarios 
    ORDER BY FechaRegistro ASC"""
)
    return render_template('admin/usuarios.html', usuarios=usuarios)



# ==================== REPORTES Y ESTADÍSTICAS ====================

@app.route('/admin/reportes')
@login_required
@role_required('admin')
def admin_reportes():
    """Panel de reportes con estadísticas y gráficas"""
    return render_template('admin/reportes.html')

@app.route('/admin/api/estadisticas')
@login_required
@role_required('admin')
def api_estadisticas():
    """API para obtener datos estadísticos para gráficas"""
    try:
        # Estadísticas generales
        estadisticas = {
            'total_usuarios': execute_query("SELECT COUNT(*) as Total FROM Usuarios")[0]['Total'],
            'total_empresas': execute_query("SELECT COUNT(*) as Total FROM Empresas")[0]['Total'],
            'total_candidatos': execute_query("SELECT COUNT(*) as Total FROM Candidatos")[0]['Total'],
            'total_vacantes': execute_query("SELECT COUNT(*) as Total FROM Vacantes")[0]['Total'],
            'total_postulaciones': execute_query("SELECT COUNT(*) as Total FROM Postulaciones")[0]['Total'],
            'vacantes_aprobadas': execute_query("SELECT COUNT(*) as Total FROM Vacantes WHERE Estatus = 'aprobada'")[0]['Total'],
            'vacantes_pendientes': execute_query("SELECT COUNT(*) as Total FROM Vacantes WHERE Estatus = 'en_revision'")[0]['Total'],
            'vacantes_rechazadas': execute_query("SELECT COUNT(*) as Total FROM Vacantes WHERE Estatus = 'rechazada'")[0]['Total'],
            'vacantes_cerradas': execute_query("SELECT COUNT(*) as Total FROM Vacantes WHERE Estatus = 'cerrada'")[0]['Total'],
        }
        
        # Registros por mes (últimos 12 meses)
        registros_mensuales = execute_query("""
            SELECT 
                FORMAT(FechaRegistro, 'yyyy-MM') as Mes,
                COUNT(*) as Total,
                SUM(CASE WHEN TipoUsuario = 'candidato' THEN 1 ELSE 0 END) as Candidatos,
                SUM(CASE WHEN TipoUsuario = 'empresa' THEN 1 ELSE 0 END) as Empresas
            FROM Usuarios
            WHERE FechaRegistro >= DATEADD(MONTH, -12, GETDATE())
            GROUP BY FORMAT(FechaRegistro, 'yyyy-MM')
            ORDER BY Mes ASC
        """)
        
        # Postulaciones por mes
        postulaciones_mensuales = execute_query("""
            SELECT 
                FORMAT(FechaPostulacion, 'yyyy-MM') as Mes,
                COUNT(*) as Total,
                SUM(CASE WHEN Estatus = 'aceptado' THEN 1 ELSE 0 END) as Aceptadas,
                SUM(CASE WHEN Estatus = 'rechazado' THEN 1 ELSE 0 END) as Rechazadas,
                SUM(CASE WHEN Estatus = 'pendiente' THEN 1 ELSE 0 END) as Pendientes
            FROM Postulaciones
            WHERE FechaPostulacion >= DATEADD(MONTH, -12, GETDATE())
            GROUP BY FORMAT(FechaPostulacion, 'yyyy-MM')
            ORDER BY Mes ASC
        """)
        
        # Vacantes por empresa (top 10)
        vacantes_por_empresa = execute_query("""
            SELECT TOP 10
                e.Nombre as Empresa,
                COUNT(v.VacanteID) as Total
            FROM Empresas e
            LEFT JOIN Vacantes v ON e.EmpresaID = v.EmpresaID
            GROUP BY e.Nombre
            ORDER BY Total DESC
        """)
        
        # Habilidades más demandadas
        habilidades_demandadas = execute_query("""
            SELECT TOP 10
                h.Nombre as Habilidad,
                COUNT(vh.VacanteID) as TotalVacantes
            FROM Habilidades h
            LEFT JOIN VacanteHabilidadesRequeridas vh ON h.HabilidadID = vh.HabilidadID
            GROUP BY h.Nombre
            ORDER BY TotalVacantes DESC
        """)
        
        # Estado de vacantes
        estado_vacantes = execute_query("""
            SELECT 
                Estatus,
                COUNT(*) as Total
            FROM Vacantes
            GROUP BY Estatus
        """)
        
        return jsonify({
            'success': True,
            'estadisticas': estadisticas,
            'registros_mensuales': registros_mensuales,
            'postulaciones_mensuales': postulaciones_mensuales,
            'vacantes_por_empresa': vacantes_por_empresa,
            'habilidades_demandadas': habilidades_demandadas,
            'estado_vacantes': estado_vacantes
        })
        
    except Exception as e:
        current_app.logger.error(f"Error en api_estadisticas: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/admin/exportar_reporte/<tipo>')
@login_required
@role_required('admin')
def exportar_reporte(tipo):
    """Exportar reporte en PDF"""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter, landscape
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib.enums import TA_CENTER
    import io
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))
    styles = getSampleStyleSheet()
    story = []
    
    # Título
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2c3e50'),
        alignment=TA_CENTER,
        spaceAfter=30
    )
    
    story.append(Paragraph(f"Reporte de {tipo.capitalize()} - TalentUPQ", title_style))
    story.append(Spacer(1, 20))
    
    if tipo == 'usuarios':
        # Datos de usuarios
        usuarios = execute_query("""
            SELECT Email, TipoUsuario, FechaRegistro 
            FROM Usuarios 
            ORDER BY FechaRegistro DESC
        """)
        
        data = [['Email', 'Tipo', 'Fecha Registro']]
        for u in usuarios:
            data.append([
                u['Email'],
                u['TipoUsuario'],
                u['FechaRegistro'].strftime('%d/%m/%Y')
            ])
        
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(table)
        
    elif tipo == 'vacantes':
        vacantes = execute_query("""
            SELECT v.Puesto, e.Nombre as Empresa, v.Estatus, 
                   v.FechaPublicacion, v.PlazasDisponibles
            FROM Vacantes v
            JOIN Empresas e ON v.EmpresaID = e.EmpresaID
            ORDER BY v.FechaPublicacion DESC
        """)
        
        data = [['Puesto', 'Empresa', 'Estatus', 'Fecha', 'Plazas']]
        for v in vacantes:
            data.append([
                v['Puesto'],
                v['Empresa'],
                v['Estatus'],
                v['FechaPublicacion'].strftime('%d/%m/%Y'),
                str(v['PlazasDisponibles'])
            ])
        
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2ecc71')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(table)
        
    elif tipo == 'postulaciones':
        postulaciones = execute_query("""
            SELECT v.Puesto, e.Nombre as Empresa, 
                   c.Nombre + ' ' + c.ApellidoPaterno as Candidato,
                   p.Estatus, p.FechaPostulacion
            FROM Postulaciones p
            JOIN Vacantes v ON p.VacanteID = v.VacanteID
            JOIN Empresas e ON v.EmpresaID = e.EmpresaID
            JOIN Candidatos c ON p.CandidatoID = c.CandidatoID
            ORDER BY p.FechaPostulacion DESC
        """)
        
        data = [['Puesto', 'Empresa', 'Candidato', 'Estatus', 'Fecha']]
        for p in postulaciones:
            data.append([
                p['Puesto'],
                p['Empresa'],
                p['Candidato'],
                p['Estatus'],
                p['FechaPostulacion'].strftime('%d/%m/%Y')
            ])
        
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e74c3c')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(table)
    
    # Construir PDF
    doc.build(story)
    buffer.seek(0)
    
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f'reporte_{tipo}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf',
        mimetype='application/pdf'
    )




@app.route('/admin/usuarios/crear', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def crear_usuario():
    if request.method == 'POST':
        try:
            email = request.form['email']
            password = request.form['password']
            tipo_usuario = request.form['tipo_usuario']
            
            if not email or not password:
                flash('Email y contraseña son obligatorios', 'error')
                return redirect(url_for('crear_usuario'))
            
       
            existe = execute_query(
                "SELECT 1 FROM Usuarios WHERE Email = ?",
                (email,)
            )
            if existe:
                flash('El email ya está registrado', 'error')
                return redirect(url_for('crear_usuario'))
            

            password_hash = generate_password_hash(password)
            
        
            execute_query(
                "INSERT INTO Usuarios (Email, PasswordHash, TipoUsuario) VALUES (?, ?, ?)",
                (email, password_hash, tipo_usuario),
                fetch=False
            )
            
            flash('Usuario creado exitosamente', 'success')
            return redirect(url_for('admin_usuarios'))
        
        except Exception as e:
            print(f"Error al crear usuario: {str(e)}")
            flash('Error al crear el usuario', 'error')
            return redirect(url_for('crear_usuario'))
    
    return render_template('admin/crear_usuario.html')


@app.route('/admin/usuarios/editar/<int:usuario_id>', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def editar_usuario(usuario_id):

    admin_id = session.get('UsuarioID')
    

    if usuario_id == admin_id:
        flash('No puedes editar tu propio usuario aquí', 'error')
        return redirect(url_for('admin_usuarios'))
    

    if request.method == 'POST':
        try:
            email = request.form['email']
            tipo_usuario = request.form['tipo_usuario']
            activo = request.form.get('activo', '0') == '1'
            
            if not email:
                flash('Email es obligatorio', 'error')
                return redirect(url_for('editar_usuario', usuario_id=usuario_id))
            
           
            existe = execute_query(
                "SELECT 1 FROM Usuarios WHERE Email = ? AND UsuarioID != ?",
                (email, usuario_id)
            )
            if existe:
                flash('El email ya está registrado por otro usuario', 'error')
                return redirect(url_for('editar_usuario', usuario_id=usuario_id))
            

            execute_query(
                """UPDATE Usuarios 
                   SET Email = ?, TipoUsuario = ?, Activo = ?
                   WHERE UsuarioID = ?""",
                (email, tipo_usuario, activo, usuario_id),
                fetch=False
            )
            
            flash('Usuario actualizado exitosamente', 'success')
            return redirect(url_for('admin_usuarios'))
        
        except Exception as e:
            print(f"Error al actualizar usuario: {str(e)}")
            flash('Error al actualizar el usuario', 'error')
            return redirect(url_for('editar_usuario', usuario_id=usuario_id))
    

    usuario = execute_query(
        """SELECT 
            UsuarioID, 
            Email, 
            TipoUsuario, 
            Activo,
            'Sin perfil' as TipoPerfil  
        FROM Usuarios 
        WHERE UsuarioID = ?""",
        (usuario_id,)
    )
    
    if not usuario:
        flash('Usuario no encontrado', 'error')
        return redirect(url_for('admin_usuarios'))
    
    return render_template('admin/editar_usuario.html', usuario=usuario[0])

@app.route('/admin/usuarios/eliminar/<int:usuario_id>', methods=['POST'])
@login_required
@role_required('admin')
def eliminar_usuario(usuario_id):
    
    admin_id = session.get('UsuarioID')
    

    if usuario_id == admin_id:
        flash('No puedes eliminarte a ti mismo.', 'error')
        return redirect(url_for('admin_usuarios'))
    
    try:

        usuario = execute_query(
            "SELECT 1 FROM Usuarios WHERE UsuarioID = ?",
            (usuario_id,)
        )
        
        if not usuario:
            flash('Usuario no encontrado.', 'error')
            return redirect(url_for('admin_usuarios'))
        
        execute_query(
            "DELETE FROM Usuarios WHERE UsuarioID = ?",
            (usuario_id,),
            fetch=False
        )
        
        flash('Usuario eliminado correctamente.', 'success')
        return redirect(url_for('admin_usuarios'))
    
    except Exception as e:
        print(f"Error al eliminar usuario: {str(e)}")  # Debug
        flash('Ocurrió un error al eliminar el usuario', 'error')
        return redirect(url_for('admin_usuarios'))


#CRUD EMPRESAS:

@app.route('/admin/empresas')
def admin_empresas():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Empresas ORDER BY FechaRegistro ASC")
    empresas = cursor.fetchall()
    conn.close()
    
 
    empresas_list = []
    columns = [column[0] for column in cursor.description]
    for empresa in empresas:
        empresas_list.append(dict(zip(columns, empresa)))
    
    return render_template('admin/empresas.html', empresas=empresas_list)

@app.route('/admin/empresas/crear', methods=['GET', 'POST'])
def crear_empresa():
    if request.method == 'POST':
        usuario_id = request.form['usuario_id']
        nombre = request.form['nombre']
        direccion = request.form.get('direccion', '')
        telefono = request.form.get('telefono', '')
        sitio_web = request.form.get('sitio_web', '')
        descripcion = request.form.get('descripcion', '')
        

        logo = None
        if 'logo' in request.files:
            file = request.files['logo']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                logo = filename
        

        if sitio_web and not sitio_web.startswith(('http://', 'https://')):
            sitio_web = f'https://{sitio_web}'
        
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT ISNULL(MAX(EmpresaID), 0) + 1 FROM Empresas")
            empresa_id = cursor.fetchone()[0]
            
            cursor.execute("""
                INSERT INTO Empresas (EmpresaID, UsuarioID, Nombre, Direccion, Telefono, SitioWeb, Descripcion, Logo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (empresa_id, usuario_id, nombre, direccion, telefono, sitio_web, descripcion, logo))
            
            conn.commit()
            conn.close()
            
            flash('Empresa creada exitosamente', 'success')
            return redirect(url_for('admin_empresas'))
        except Exception as e:
            flash(f'Error al crear la empresa: {str(e)}', 'error')
    
    return render_template('admin/crear_empresa.html')

@app.route('/admin/empresas/editar/<int:empresa_id>', methods=['GET', 'POST'])
def editar_empresa(empresa_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if request.method == 'POST':
        usuario_id = request.form['usuario_id']
        nombre = request.form['nombre']
        direccion = request.form.get('direccion', '')
        telefono = request.form.get('telefono', '')
        sitio_web = request.form.get('sitio_web', '')
        descripcion = request.form.get('descripcion', '')
        
 
        cursor.execute("SELECT Logo FROM Empresas WHERE EmpresaID = ?", (empresa_id,))
        current_logo = cursor.fetchone()[0]
        logo = current_logo
        

        if 'logo' in request.files:
            file = request.files['logo']
            if file and allowed_file(file.filename):
         
                if current_logo and os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], current_logo)):
                    os.remove(os.path.join(app.config['UPLOAD_FOLDER'], current_logo))
                
        
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                logo = filename
        
        if sitio_web and not sitio_web.startswith(('http://', 'https://')):
            sitio_web = f'https://{sitio_web}'
        
        try:
            cursor.execute("""
                UPDATE Empresas 
                SET UsuarioID = ?, Nombre = ?, Direccion = ?, Telefono = ?, 
                    SitioWeb = ?, Descripcion = ?, Logo = ?
                WHERE EmpresaID = ?
            """, (usuario_id, nombre, direccion, telefono, sitio_web, descripcion, logo, empresa_id))
            
            conn.commit()
            conn.close()
            
            flash('Empresa actualizada exitosamente', 'success')
            return redirect(url_for('admin_empresas'))
        except Exception as e:
            flash(f'Error al actualizar la empresa: {str(e)}', 'error')
    
    cursor.execute("SELECT * FROM Empresas WHERE EmpresaID = ?", (empresa_id,))
    empresa = cursor.fetchone()
    conn.close()
    
    if not empresa:
        flash('Empresa no encontrada', 'error')
        return redirect(url_for('admin_empresas'))
    
    columns = [column[0] for column in cursor.description]
    empresa_dict = dict(zip(columns, empresa))
    
    return render_template('admin/editar_empresa.html', empresa=empresa_dict)

@app.route('/admin/empresas/eliminar/<int:empresa_id>', methods=['POST'])
def eliminar_empresa(empresa_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        cursor.execute("SELECT Logo FROM Empresas WHERE EmpresaID = ?", (empresa_id,))
        logo = cursor.fetchone()[0]
        
        if logo and os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], logo)):
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], logo))
        

        cursor.execute("DELETE FROM Empresas WHERE EmpresaID = ?", (empresa_id,))
        conn.commit()
        conn.close()
        
        flash('Empresa eliminada exitosamente', 'success')
    except Exception as e:
        flash(f'Error al eliminar la empresa: {str(e)}', 'error')
    
    return redirect(url_for('admin_empresas'))


#CRUD CANDIDATOS:
@app.route('/admin/candidatos')
def admin_candidatos():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT CandidatoID, UsuarioID, Nombre, ApellidoPaterno, ApellidoMaterno, 
               Telefono, PuestoActual, PuestoSolicitado, FotoPerfil
        FROM Candidatos 
        ORDER BY Nombre, ApellidoPaterno
    """)
    candidatos = cursor.fetchall()
    conn.close()
    
    candidatos_list = []
    columns = [column[0] for column in cursor.description]
    for candidato in candidatos:
        candidatos_list.append(dict(zip(columns, candidato)))
    
    return render_template('admin/candidatos.html', candidatos=candidatos_list)

@app.route('/admin/candidatos/crear', methods=['GET', 'POST'])
def crear_candidato():
    if request.method == 'POST':
      
        usuario_id = request.form['usuario_id']
        nombre = request.form['nombre']
        apellido_paterno = request.form['apellido_paterno']
        apellido_materno = request.form.get('apellido_materno', '')
        telefono = request.form.get('telefono', '')
        estado_civil = request.form.get('estado_civil', '')
        sexo = request.form.get('sexo', '')
        fecha_nacimiento = request.form.get('fecha_nacimiento', '')
        nacionalidad = request.form.get('nacionalidad', '')
        rfc = request.form.get('rfc', '')
        direccion = request.form.get('direccion', '')
        reubicacion = 1 if request.form.get('reubicacion') == 'on' else 0
        viajar = 1 if request.form.get('viajar') == 'on' else 0
        licencia = 1 if request.form.get('licencia') == 'on' else 0
        modalidad_trabajo = request.form.get('modalidad_trabajo', '')
        puesto_actual = request.form.get('puesto_actual', '')
        puesto_solicitado = request.form.get('puesto_solicitado', '')
        resumen = request.form.get('resumen_profesional', '')


        foto_perfil = None
        cv = None
        
        if 'foto_perfil' in request.files:
            file = request.files['foto_perfil']
            if file and allowed_file(file.filename) and file.filename != '':
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                foto_perfil = filename
        
        if 'cv' in request.files:
            file = request.files['cv']
            if file and allowed_file(file.filename) and file.filename != '':
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                cv = filename

        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            

            cursor.execute("SELECT ISNULL(MAX(CandidatoID), 0) + 1 FROM Candidatos")
            candidato_id = cursor.fetchone()[0]
            
   
            fecha_nac = datetime.strptime(fecha_nacimiento, '%Y-%m-%d').date() if fecha_nacimiento else None
            
            cursor.execute("""
                INSERT INTO Candidatos (
                    CandidatoID, UsuarioID, Nombre, ApellidoPaterno, ApellidoMaterno,
                    Telefono, EstadoCivil, Sexo, FechaNacimiento, Nacionalidad, RFC,
                    Direccion, Reubicacion, Viajar, LicenciaConducir, ModalidadTrabajo,
                    PuestoActual, PuestoSolicitado, FotoPerfil, CV, ResumenProfesional
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                candidato_id, usuario_id, nombre, apellido_paterno, apellido_materno,
                telefono, estado_civil, sexo, fecha_nac, nacionalidad, rfc,
                direccion, reubicacion, viajar, licencia, modalidad_trabajo,
                puesto_actual, puesto_solicitado, foto_perfil, cv, resumen
            ))
            
            conn.commit()
            conn.close()
            
            flash('Candidato creado exitosamente', 'success')
            return redirect(url_for('admin_candidatos'))
        except Exception as e:
            flash(f'Error al crear el candidato: {str(e)}', 'error')
    
    return render_template('admin/crear_candidato.html')

@app.route('/admin/candidatos/editar/<int:candidato_id>', methods=['GET', 'POST'])
def editar_candidato(candidato_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if request.method == 'POST':

        usuario_id = request.form['usuario_id']
        nombre = request.form['nombre']
        apellido_paterno = request.form['apellido_paterno']
        apellido_materno = request.form.get('apellido_materno', '')
        telefono = request.form.get('telefono', '')
        estado_civil = request.form.get('estado_civil', '')
        sexo = request.form.get('sexo', '')
        fecha_nacimiento = request.form.get('fecha_nacimiento', '')
        nacionalidad = request.form.get('nacionalidad', '')
        rfc = request.form.get('rfc', '')
        direccion = request.form.get('direccion', '')
        reubicacion = 1 if request.form.get('reubicacion') == 'on' else 0
        viajar = 1 if request.form.get('viajar') == 'on' else 0
        licencia = 1 if request.form.get('licencia') == 'on' else 0
        modalidad_trabajo = request.form.get('modalidad_trabajo', '')
        puesto_actual = request.form.get('puesto_actual', '')
        puesto_solicitado = request.form.get('puesto_solicitado', '')
        resumen = request.form.get('resumen_profesional', '')


        cursor.execute("SELECT FotoPerfil, CV FROM Candidatos WHERE CandidatoID = ?", (candidato_id,))
        current_files = cursor.fetchone()
        current_foto = current_files[0]
        current_cv = current_files[1]
        
        foto_perfil = current_foto
        cv = current_cv
        

        if 'foto_perfil' in request.files:
            file = request.files['foto_perfil']
            if file and allowed_file(file.filename) and file.filename != '':

                if current_foto and os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], current_foto)):
                    os.remove(os.path.join(app.config['UPLOAD_FOLDER'], current_foto))
                
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                foto_perfil = filename
        
        if 'cv' in request.files:
            file = request.files['cv']
            if file and allowed_file(file.filename) and file.filename != '':
    
                if current_cv and os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], current_cv)):
                    os.remove(os.path.join(app.config['UPLOAD_FOLDER'], current_cv))
                
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                cv = filename

        try:
            fecha_nac = datetime.strptime(fecha_nacimiento, '%Y-%m-%d').date() if fecha_nacimiento else None
            
            cursor.execute("""
                UPDATE Candidatos SET
                    UsuarioID = ?, Nombre = ?, ApellidoPaterno = ?, ApellidoMaterno = ?,
                    Telefono = ?, EstadoCivil = ?, Sexo = ?, FechaNacimiento = ?, Nacionalidad = ?, RFC = ?,
                    Direccion = ?, Reubicacion = ?, Viajar = ?, LicenciaConducir = ?, ModalidadTrabajo = ?,
                    PuestoActual = ?, PuestoSolicitado = ?, FotoPerfil = ?, CV = ?, ResumenProfesional = ?
                WHERE CandidatoID = ?
            """, (
                usuario_id, nombre, apellido_paterno, apellido_materno,
                telefono, estado_civil, sexo, fecha_nac, nacionalidad, rfc,
                direccion, reubicacion, viajar, licencia, modalidad_trabajo,
                puesto_actual, puesto_solicitado, foto_perfil, cv, resumen,
                candidato_id
            ))
            
            conn.commit()
            conn.close()
            
            flash('Candidato actualizado exitosamente', 'success')
            return redirect(url_for('admin_candidatos'))
        except Exception as e:
            flash(f'Error al actualizar el candidato: {str(e)}', 'error')
    

    cursor.execute("SELECT * FROM Candidatos WHERE CandidatoID = ?", (candidato_id,))
    candidato = cursor.fetchone()
    conn.close()
    
    if not candidato:
        flash('Candidato no encontrado', 'error')
        return redirect(url_for('admin_candidatos'))
    
   
    columns = [column[0] for column in cursor.description]
    candidato_dict = dict(zip(columns, candidato))
    

    if candidato_dict['FechaNacimiento']:
        candidato_dict['FechaNacimiento'] = candidato_dict['FechaNacimiento'].strftime('%Y-%m-%d')
    
    return render_template('admin/editar_candidato.html', candidato=candidato_dict)

@app.route('/admin/candidatos/eliminar/<int:candidato_id>', methods=['POST'])
def eliminar_candidato(candidato_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:

        cursor.execute("SELECT FotoPerfil, CV FROM Candidatos WHERE CandidatoID = ?", (candidato_id,))
        files = cursor.fetchone()
        

        if files[0] and os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], files[0])):
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], files[0]))
        if files[1] and os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], files[1])):
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], files[1]))
        
       
        cursor.execute("DELETE FROM Candidatos WHERE CandidatoID = ?", (candidato_id,))
        conn.commit()
        conn.close()
        
        flash('Candidato eliminado exitosamente', 'success')
    except Exception as e:
        flash(f'Error al eliminar el candidato: {str(e)}', 'error')
    return redirect(url_for('admin_candidatos'))

#CRUD VACANTES

@app.route('/admin/vacantes')
def admin_vacantes():
    conn = get_db_connection()
    cursor = conn.cursor()
    
   
    cursor.execute("""
        SELECT v.*, e.Nombre as EmpresaNombre 
        FROM Vacantes v
        JOIN Empresas e ON v.EmpresaID = e.EmpresaID
        ORDER BY v.FechaPublicacion DESC
    """)
    vacantes = cursor.fetchall()
    

    columns = [column[0] for column in cursor.description]
    vacantes = [dict(zip(columns, vacante)) for vacante in vacantes]
    
    conn.close()
    return render_template('admin/vacantes.html', vacantes=vacantes)

@app.route('/admin/vacantes/crear', methods=['GET', 'POST'])
def crear_vacante():
    if request.method == 'POST':

        empresa_id = request.form['empresa_id']
        puesto = request.form['puesto']
        grado_estudios = request.form['grado_estudios']
        resumen = request.form['resumen']
        plazas = request.form['plazas']
        plazas_disponibles = request.form['plazas_disponibles']
        estatus = request.form['estatus']
        salario = request.form.get('salario', '')
        tipo_contrato = request.form['tipo_contrato']
        modalidad = request.form['modalidad']
        ubicacion = request.form.get('ubicacion', '')
        experiencia_requerida = request.form['experiencia_requerida']
        beneficios = request.form.get('beneficios', '')
        fecha_cierre = request.form.get('fecha_cierre', '')
        
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            

            fecha_cierre_date = datetime.strptime(fecha_cierre, '%Y-%m-%d').date() if fecha_cierre else None
            
            cursor.execute("""
                INSERT INTO Vacantes (
                    EmpresaID, Puesto, GradoEstudios, Resumen, Plazas, PlazasDisponibles,
                    Estatus, Salario, TipoContrato, Modalidad, Ubicacion, 
                    ExperienciaRequerida, Beneficios, FechaCierre
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                empresa_id, puesto, grado_estudios, resumen, plazas, plazas_disponibles,
                estatus, salario, tipo_contrato, modalidad, ubicacion,
                experiencia_requerida, beneficios, fecha_cierre_date
            ))
            
            conn.commit()
            conn.close()
            
            flash('Vacante creada exitosamente', 'success')
            return redirect(url_for('admin_vacantes'))
        except Exception as e:
            flash(f'Error al crear la vacante: {str(e)}', 'error')
    

    return render_template('admin/crear_vacante.html')

@app.route('/admin/vacantes/editar/<int:vacante_id>', methods=['GET', 'POST'])
def editar_vacante(vacante_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if request.method == 'POST':
 
        empresa_id = request.form['empresa_id']
        puesto = request.form['puesto']
        grado_estudios = request.form['grado_estudios']
        resumen = request.form['resumen']
        plazas = request.form['plazas']
        plazas_disponibles = request.form['plazas_disponibles']
        estatus = request.form['estatus']
        salario = request.form.get('salario', '')
        tipo_contrato = request.form['tipo_contrato']
        modalidad = request.form['modalidad']
        ubicacion = request.form.get('ubicacion', '')
        experiencia_requerida = request.form['experiencia_requerida']
        beneficios = request.form.get('beneficios', '')
        fecha_cierre = request.form.get('fecha_cierre', '')
        comentarios_admin = request.form.get('comentarios_admin', '')
        
        try:
     
            fecha_cierre_date = datetime.strptime(fecha_cierre, '%Y-%m-%d').date() if fecha_cierre else None
            
            cursor.execute("""
                UPDATE Vacantes SET
                    EmpresaID = ?, Puesto = ?, GradoEstudios = ?, Resumen = ?,
                    Plazas = ?, PlazasDisponibles = ?, Estatus = ?, Salario = ?,
                    TipoContrato = ?, Modalidad = ?, Ubicacion = ?,
                    ExperienciaRequerida = ?, Beneficios = ?, FechaCierre = ?,
                    ComentariosAdmin = ?
                WHERE VacanteID = ?
            """, (
                empresa_id, puesto, grado_estudios, resumen,
                plazas, plazas_disponibles, estatus, salario,
                tipo_contrato, modalidad, ubicacion,
                experiencia_requerida, beneficios, fecha_cierre_date,
                comentarios_admin, vacante_id
            ))
            
            conn.commit()
            conn.close()
            
            flash('Vacante actualizada exitosamente', 'success')
            return redirect(url_for('admin_vacantes'))
        except Exception as e:
            flash(f'Error al actualizar la vacante: {str(e)}', 'error')

    cursor.execute("SELECT * FROM Vacantes WHERE VacanteID = ?", (vacante_id,))
    vacante = cursor.fetchone()
    
    if not vacante:
        flash('Vacante no encontrada', 'error')
        return redirect(url_for('admin_vacantes'))
    

    columns = [column[0] for column in cursor.description]
    vacante_dict = dict(zip(columns, vacante))
    

    if vacante_dict['FechaCierre']:
        vacante_dict['FechaCierre'] = vacante_dict['FechaCierre'].strftime('%Y-%m-%d')
    if vacante_dict['FechaPublicacion']:
        vacante_dict['FechaPublicacion'] = vacante_dict['FechaPublicacion'].strftime('%Y-%m-%dT%H:%M')
    if vacante_dict['FechaAprobacion']:
        vacante_dict['FechaAprobacion'] = vacante_dict['FechaAprobacion'].strftime('%Y-%m-%dT%H:%M')
    
    conn.close()
    return render_template('admin/editar_vacante.html', vacante=vacante_dict)

@app.route('/admin/vacantes/eliminar/<int:vacante_id>', methods=['POST'])
def eliminar_vacante(vacante_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
     
        cursor.execute("UPDATE Vacantes SET Estatus = 'cerrada' WHERE VacanteID = ?", (vacante_id,))
        
        conn.commit()
        conn.close()
        
        flash('Vacante cerrada exitosamente', 'success')
    except Exception as e:
        flash(f'Error al cerrar la vacante: {str(e)}', 'error')
        if 'conn' in locals():
            conn.rollback()
    
    return redirect(url_for('admin_vacantes'))




# ==================== SISTEMA DE MENSAJERÍA ====================

@app.route('/conversacion/<int:vacante_id>/<int:candidato_id>')
@login_required
def ver_conversacion(vacante_id, candidato_id):
    """Ver conversación entre empresa y candidato"""
    usuario_actual = get_usuario_actual()
    
    # Verificar que el usuario tenga acceso a esta conversación
    if usuario_actual['TipoUsuario'] == 'empresa':
        empresa = get_empresa_actual()
        if not empresa:
            flash('Perfil de empresa no encontrado', 'error')
            return redirect(url_for('login'))
        
        # Verificar que la vacante pertenece a esta empresa
        vacante = execute_query(
            "SELECT * FROM Vacantes WHERE VacanteID = ? AND EmpresaID = ?",
            (vacante_id, empresa['EmpresaID'])
        )
        if not vacante:
            flash('No tienes acceso a esta conversación', 'error')
            return redirect(url_for('empresa_dashboard'))
    
    elif usuario_actual['TipoUsuario'] == 'candidato':
        candidato = get_candidato_actual()
        if not candidato:
            flash('Perfil de candidato no encontrado', 'error')
            return redirect(url_for('login'))
        
        # Verificar que el candidato es el correcto
        if candidato['CandidatoID'] != candidato_id:
            flash('No tienes acceso a esta conversación', 'error')
            return redirect(url_for('candidato_dashboard'))
    else:
        flash('Acceso no autorizado', 'error')
        return redirect(url_for('index'))
    
    # Obtener o crear conversación
    conversacion = execute_query(
        """SELECT * FROM Conversaciones 
           WHERE VacanteID = ? AND CandidatoID = ?""",
        (vacante_id, candidato_id)
    )
    
    if not conversacion:
        # Crear nueva conversación
        empresa_id = execute_query(
            "SELECT EmpresaID FROM Vacantes WHERE VacanteID = ?",
            (vacante_id,)
        )[0]['EmpresaID']
        
        execute_query(
            """INSERT INTO Conversaciones (VacanteID, CandidatoID, EmpresaID)
               VALUES (?, ?, ?)""",
            (vacante_id, candidato_id, empresa_id),
            fetch=False
        )
        
        conversacion = execute_query(
            """SELECT * FROM Conversaciones 
               WHERE VacanteID = ? AND CandidatoID = ?""",
            (vacante_id, candidato_id)
        )
    
    conversacion = conversacion[0]
    
    # Obtener mensajes
    mensajes = execute_query(
        """SELECT m.*, 
           CASE 
               WHEN m.RemitenteTipo = 'candidato' THEN c.Nombre
               WHEN m.RemitenteTipo = 'empresa' THEN e.Nombre
           END as RemitenteNombre
           FROM Mensajes m
           LEFT JOIN Candidatos c ON m.RemitenteTipo = 'candidato' AND m.RemitenteID = c.CandidatoID
           LEFT JOIN Empresas e ON m.RemitenteTipo = 'empresa' AND m.RemitenteID = e.EmpresaID
           WHERE m.ConversacionID = ?
           ORDER BY m.FechaEnvio ASC""",
        (conversacion['ConversacionID'],)
    )
    
    # Marcar mensajes como leídos
    if usuario_actual['TipoUsuario'] == 'empresa':
        execute_query(
            """UPDATE Mensajes SET Leido = 1, FechaLectura = GETDATE()
               WHERE ConversacionID = ? AND RemitenteTipo = 'candidato' AND Leido = 0""",
            (conversacion['ConversacionID'],),
            fetch=False
        )
    else:
        execute_query(
            """UPDATE Mensajes SET Leido = 1, FechaLectura = GETDATE()
               WHERE ConversacionID = ? AND RemitenteTipo = 'empresa' AND Leido = 0""",
            (conversacion['ConversacionID'],),
            fetch=False
        )
    
    # Obtener información de la vacante
    vacante = execute_query(
        "SELECT v.*, e.Nombre as EmpresaNombre FROM Vacantes v "
        "JOIN Empresas e ON v.EmpresaID = e.EmpresaID "
        "WHERE v.VacanteID = ?",
        (vacante_id,)
    )[0]
    
    candidato = execute_query(
        "SELECT * FROM Candidatos WHERE CandidatoID = ?",
        (candidato_id,)
    )[0]
    
    return render_template('mensajeria/conversacion.html',
                         conversacion=conversacion,
                         mensajes=mensajes,
                         vacante=vacante,
                         candidato=candidato,
                         usuario_actual=usuario_actual)

@app.route('/enviar_mensaje', methods=['POST'])
@login_required
def enviar_mensaje():
    """Enviar un mensaje en la conversación"""
    conversacion_id = request.form.get('conversacion_id')
    mensaje = request.form.get('mensaje', '').strip()
    
    if not mensaje:
        flash('El mensaje no puede estar vacío', 'error')
        return redirect(request.referrer)
    
    if len(mensaje) > 2000:
        flash('El mensaje no puede exceder los 2000 caracteres', 'error')
        return redirect(request.referrer)
    
    usuario_actual = get_usuario_actual()
    
    # Obtener conversación
    conversacion = execute_query(
        "SELECT * FROM Conversaciones WHERE ConversacionID = ?",
        (conversacion_id,)
    )
    
    if not conversacion:
        flash('Conversación no encontrada', 'error')
        return redirect(request.referrer)
    
    conversacion = conversacion[0]
    
    # Verificar permisos
    if usuario_actual['TipoUsuario'] == 'empresa':
        empresa = get_empresa_actual()
        if not empresa or empresa['EmpresaID'] != conversacion['EmpresaID']:
            flash('No tienes permisos para enviar mensajes aquí', 'error')
            return redirect(request.referrer)
        remitente_id = empresa['EmpresaID']
        remitente_tipo = 'empresa'
    elif usuario_actual['TipoUsuario'] == 'candidato':
        candidato = get_candidato_actual()
        if not candidato or candidato['CandidatoID'] != conversacion['CandidatoID']:
            flash('No tienes permisos para enviar mensajes aquí', 'error')
            return redirect(request.referrer)
        remitente_id = candidato['CandidatoID']
        remitente_tipo = 'candidato'
    else:
        flash('Acceso no autorizado', 'error')
        return redirect(request.referrer)
    
    # Guardar mensaje
    try:
        execute_query(
            """INSERT INTO Mensajes (ConversacionID, RemitenteID, RemitenteTipo, Mensaje)
               VALUES (?, ?, ?, ?)""",
            (conversacion_id, remitente_id, remitente_tipo, mensaje),
            fetch=False
        )
        
        flash('Mensaje enviado correctamente', 'success')
    except Exception as e:
        current_app.logger.error(f"Error al enviar mensaje: {str(e)}")
        flash('Error al enviar el mensaje', 'error')
    
    return redirect(request.referrer)

@app.route('/mis_conversaciones')
@login_required
def mis_conversaciones():
    """Ver todas las conversaciones del usuario"""
    usuario_actual = get_usuario_actual()
    
    if usuario_actual['TipoUsuario'] == 'empresa':
        empresa = get_empresa_actual()
        if not empresa:
            flash('Perfil de empresa no encontrado', 'error')
            return redirect(url_for('login'))
        
        conversaciones = execute_query(
            """SELECT c.*, 
               v.Puesto as VacantePuesto,
               cand.Nombre as CandidatoNombre,
               cand.ApellidoPaterno as CandidatoApellido,
               (SELECT TOP 1 Mensaje FROM Mensajes 
                WHERE ConversacionID = c.ConversacionID 
                ORDER BY FechaEnvio DESC) as UltimoMensaje,
               (SELECT TOP 1 FechaEnvio FROM Mensajes 
                WHERE ConversacionID = c.ConversacionID 
                ORDER BY FechaEnvio DESC) as UltimoMensajeFecha,
               (SELECT COUNT(*) FROM Mensajes 
                WHERE ConversacionID = c.ConversacionID 
                AND RemitenteTipo = 'candidato' 
                AND Leido = 0) as NoLeidos
               FROM Conversaciones c
               JOIN Vacantes v ON c.VacanteID = v.VacanteID
               JOIN Candidatos cand ON c.CandidatoID = cand.CandidatoID
               WHERE c.EmpresaID = ?
               ORDER BY UltimoMensajeFecha DESC""",
            (empresa['EmpresaID'],)
        )
        
    elif usuario_actual['TipoUsuario'] == 'candidato':
        candidato = get_candidato_actual()
        if not candidato:
            flash('Perfil de candidato no encontrado', 'error')
            return redirect(url_for('login'))
        
        conversaciones = execute_query(
            """SELECT c.*, 
               v.Puesto as VacantePuesto,
               e.Nombre as EmpresaNombre,
               (SELECT TOP 1 Mensaje FROM Mensajes 
                WHERE ConversacionID = c.ConversacionID 
                ORDER BY FechaEnvio DESC) as UltimoMensaje,
               (SELECT TOP 1 FechaEnvio FROM Mensajes 
                WHERE ConversacionID = c.ConversacionID 
                ORDER BY FechaEnvio DESC) as UltimoMensajeFecha,
               (SELECT COUNT(*) FROM Mensajes 
                WHERE ConversacionID = c.ConversacionID 
                AND RemitenteTipo = 'empresa' 
                AND Leido = 0) as NoLeidos
               FROM Conversaciones c
               JOIN Vacantes v ON c.VacanteID = v.VacanteID
               JOIN Empresas e ON c.EmpresaID = e.EmpresaID
               WHERE c.CandidatoID = ?
               ORDER BY UltimoMensajeFecha DESC""",
            (candidato['CandidatoID'],)
        )
    else:
        flash('Acceso no autorizado', 'error')
        return redirect(url_for('index'))
    
    return render_template('mensajeria/conversaciones.html', 
                         conversaciones=conversaciones,
                         tipo_usuario=usuario_actual['TipoUsuario'])

@app.route('/marcar_leidos/<int:conversacion_id>')
@login_required
def marcar_leidos(conversacion_id):
    """Marcar todos los mensajes como leídos"""
    usuario_actual = get_usuario_actual()
    
    if usuario_actual['TipoUsuario'] == 'empresa':
        remitente_tipo = 'candidato'
    elif usuario_actual['TipoUsuario'] == 'candidato':
        remitente_tipo = 'empresa'
    else:
        flash('Acceso no autorizado', 'error')
        return redirect(request.referrer)
    
    execute_query(
        """UPDATE Mensajes SET Leido = 1, FechaLectura = GETDATE()
           WHERE ConversacionID = ? AND RemitenteTipo = ? AND Leido = 0""",
        (conversacion_id, remitente_tipo),
        fetch=False
    )
    
    return redirect(request.referrer)

@app.route('/obtener_no_leidos')
@login_required
def obtener_no_leidos():
    """Obtener cantidad de mensajes no leídos (para AJAX)"""
    usuario_actual = get_usuario_actual()
    
    if usuario_actual['TipoUsuario'] == 'empresa':
        empresa = get_empresa_actual()
        if not empresa:
            return jsonify({'no_leidos': 0})
        
        no_leidos = execute_query(
            """SELECT COUNT(*) as Total FROM Mensajes m
               JOIN Conversaciones c ON m.ConversacionID = c.ConversacionID
               WHERE c.EmpresaID = ? AND m.RemitenteTipo = 'candidato' AND m.Leido = 0""",
            (empresa['EmpresaID'],)
        )
        
    elif usuario_actual['TipoUsuario'] == 'candidato':
        candidato = get_candidato_actual()
        if not candidato:
            return jsonify({'no_leidos': 0})
        
        no_leidos = execute_query(
            """SELECT COUNT(*) as Total FROM Mensajes m
               JOIN Conversaciones c ON m.ConversacionID = c.ConversacionID
               WHERE c.CandidatoID = ? AND m.RemitenteTipo = 'empresa' AND m.Leido = 0""",
            (candidato['CandidatoID'],)
        )
    else:
        return jsonify({'no_leidos': 0})
    
    return jsonify({'no_leidos': no_leidos[0]['Total'] if no_leidos else 0})




# ==================== API PÚBLICA PARA REACT ====================
# Agregar CORS para permitir peticiones desde React
from flask_cors import CORS

# Habilitar CORS para React
CORS(app, origins=['http://localhost:3000'])

@app.route('/api/v1/vacantes', methods=['GET', 'OPTIONS'])
def api_vacantes():
    """
    Obtener todas las vacantes aprobadas
    ---
    tags:
      - Vacantes
    summary: Lista todas las vacantes activas
    description: Retorna un array con todas las vacantes que están aprobadas y tienen plazas disponibles
    responses:
      200:
        description: Lista de vacantes
        schema:
          type: array
          items:
            type: object
            properties:
              VacanteID:
                type: integer
                description: ID único de la vacante
              Puesto:
                type: string
                description: Título del puesto
              EmpresaNombre:
                type: string
                description: Nombre de la empresa que publicó la vacante
              Modalidad:
                type: string
                description: Modalidad de trabajo (Presencial, Remoto, Híbrido)
              Salario:
                type: string
                description: Rango salarial ofrecido
              Ubicacion:
                type: string
                description: Ubicación del puesto
      500:
        description: Error interno del servidor
    """
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        vacantes = execute_query("""
            SELECT v.VacanteID, v.Puesto, v.Modalidad, v.Salario, v.Ubicacion,
                   e.Nombre as EmpresaNombre
            FROM Vacantes v
            JOIN Empresas e ON v.EmpresaID = e.EmpresaID
            WHERE v.Estatus = 'aprobada' AND v.PlazasDisponibles > 0
            ORDER BY v.FechaPublicacion DESC
        """)
        return jsonify(vacantes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/vacantes/<int:vacante_id>', methods=['GET', 'OPTIONS'])
def api_vacante_detalle(vacante_id):
    """
    Obtener detalle de una vacante específica
    ---
    tags:
      - Vacantes
    summary: Obtiene los detalles completos de una vacante
    description: Retorna toda la información de una vacante específica por su ID
    parameters:
      - name: vacante_id
        in: path
        type: integer
        required: true
        description: ID de la vacante a consultar
    responses:
      200:
        description: Detalle de la vacante
        schema:
          type: object
          properties:
            VacanteID:
              type: integer
            Puesto:
              type: string
            EmpresaNombre:
              type: string
            Resumen:
              type: string
            Salario:
              type: string
            Modalidad:
              type: string
            TipoContrato:
              type: string
            ExperienciaRequerida:
              type: string
      404:
        description: Vacante no encontrada
      500:
        description: Error interno del servidor
    """
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        vacante = execute_query("""
            SELECT v.*, e.Nombre as EmpresaNombre, e.Descripcion as EmpresaDescripcion
            FROM Vacantes v
            JOIN Empresas e ON v.EmpresaID = e.EmpresaID
            WHERE v.VacanteID = ? AND v.Estatus = 'aprobada'
        """, (vacante_id,))
        
        if not vacante:
            return jsonify({'error': 'Vacante no encontrada'}), 404
        
        return jsonify(vacante[0])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/estadisticas', methods=['GET', 'OPTIONS'])
def api_estadisticas_publicas():
    """
    Obtener estadísticas públicas del sistema
    ---
    tags:
      - Estadísticas
    summary: Estadísticas generales del sistema
    description: Retorna métricas como total de vacantes, empresas y distribución por modalidad
    responses:
      200:
        description: Estadísticas generales
        schema:
          type: object
          properties:
            total_vacantes:
              type: integer
              description: Número total de vacantes activas
            total_empresas:
              type: integer
              description: Número total de empresas registradas
            vacantes_por_modalidad:
              type: array
              description: Distribución de vacantes por modalidad
              items:
                type: object
                properties:
                  Modalidad:
                    type: string
                  Total:
                    type: integer
      500:
        description: Error interno del servidor
    """
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        total_vacantes = execute_query("SELECT COUNT(*) as Total FROM Vacantes WHERE Estatus = 'aprobada'")[0]['Total']
        total_empresas = execute_query("SELECT COUNT(*) as Total FROM Empresas")[0]['Total']
        
        modalidades = execute_query("""
            SELECT Modalidad, COUNT(*) as Total 
            FROM Vacantes 
            WHERE Estatus = 'aprobada'
            GROUP BY Modalidad
        """)
        
        return jsonify({
            'total_vacantes': total_vacantes,
            'total_empresas': total_empresas,
            'vacantes_por_modalidad': modalidades
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/habilidades', methods=['GET', 'OPTIONS'])
def api_habilidades():
    """
    Obtener todas las habilidades disponibles
    ---
    tags:
      - Habilidades
    summary: Lista todas las habilidades registradas
    description: Retorna un array con todas las habilidades que pueden agregar los candidatos
    responses:
      200:
        description: Lista de habilidades
        schema:
          type: array
          items:
            type: object
            properties:
              HabilidadID:
                type: integer
                description: ID único de la habilidad
              Nombre:
                type: string
                description: Nombre de la habilidad
      500:
        description: Error interno del servidor
    """
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        habilidades = execute_query("SELECT HabilidadID, Nombre FROM Habilidades ORDER BY Nombre")
        return jsonify(habilidades)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/docs')
def api_docs():
    """Redirigir a la documentación Swagger"""
    return redirect('/apidocs')


@app.context_processor
def inject_current_year():
    return {'current_year': datetime.now().year}

if __name__ == '__main__':

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    

    try:
        conn = get_db_connection()
        print("✅ Conexión exitosa a la base de datos")
        conn.close()
    except Exception as e:
        print(f"❌ Error al conectar a la base de datos: {str(e)}")
        exit(1)
    
    app.run(debug=True)

