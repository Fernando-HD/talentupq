// static/js/preserve-forms.js
// Solución universal para preservar datos de formularios - SOLO EN ERRORES

class FormPreserver {
    constructor() {
        this.storageKey = 'temp_form_data';
        this.debug = false; // Cambiar a true para ver logs en consola
        this.hasError = false; // Bandera para saber si hubo error
        this.init();
    }

    init() {
        // Detectar si hay errores en la página
        this.detectErrors();
        
        // Si hay errores, restaurar datos automáticamente
        if (this.hasError) {
            this.autoRestore();
        } else {
            // Si no hay error, limpiar datos guardados
            this.clearFormData();
        }
        
        // Escuchar el envío de formularios para guardar en caso de error
        this.listenToFormSubmit();
    }

    // Escuchar el envío de formularios
    listenToFormSubmit() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            
            // No guardar si el formulario tiene atributo data-no-preserve
            if (form.getAttribute('data-no-preserve') === 'true') {
                return;
            }
            
            // No guardar si es formulario de login o admin
            if (form.action.includes('login') || form.action.includes('admin')) {
                return;
            }
            
            // Guardar datos ANTES de enviar por si hay error
            this.saveFormData(form);
            
            // Pequeño retraso para verificar si hubo error después del envío
            setTimeout(() => {
                // Verificar si aparecieron mensajes de error después del envío
                const errorMessages = document.querySelectorAll('.alert-danger');
                if (errorMessages.length > 0) {
                    // Si hay error, los datos ya están guardados
                    if (this.debug) console.log('⚠️ Error detectado, datos preservados');
                } else {
                    // Si no hay error, limpiar datos
                    setTimeout(() => {
                        this.clearFormData();
                    }, 500);
                }
            }, 500);
        });
    }

    // Guardar datos del formulario en localStorage
    saveFormData(form) {
        if (!form) return;
        
        const formData = {};
        
        const elements = form.elements;
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (!element.name) continue;
            
            // No guardar contraseñas ni archivos
            if (element.type === 'password' || element.type === 'file') {
                continue;
            }
            
            // Guardar según tipo de campo
            if (element.type === 'checkbox' || element.type === 'radio') {
                if (element.checked) {
                    formData[element.name] = element.value;
                }
            } else {
                formData[element.name] = element.value;
            }
        }
        
        // Solo guardar si hay datos
        if (Object.keys(formData).length > 0) {
            // Guardar también la URL actual para saber de qué página es
            formData['_saved_url'] = window.location.pathname;
            formData['_saved_time'] = new Date().getTime();
            
            localStorage.setItem(this.storageKey, JSON.stringify(formData));
            
            if (this.debug) {
                console.log('💾 Datos guardados (por posible error):', formData);
            }
        }
    }

    // Restaurar datos del formulario automáticamente
    autoRestore() {
        const stored = localStorage.getItem(this.storageKey);
        if (!stored) return false;
        
        try {
            const formData = JSON.parse(stored);
            
            // Verificar que estamos en la misma página donde se guardaron los datos
            if (formData['_saved_url'] !== window.location.pathname) {
                if (this.debug) console.log('📍 Página diferente, no restaurando');
                this.clearFormData();
                return false;
            }
            
            // Verificar que no haya pasado mucho tiempo (10 minutos máximo)
            const savedTime = formData['_saved_time'];
            const now = new Date().getTime();
            const maxAge = 10 * 60 * 1000; // 10 minutos (más seguro)
            
            if (now - savedTime > maxAge) {
                if (this.debug) console.log('⏰ Datos expirados');
                this.clearFormData();
                return false;
            }
            
            // Restaurar datos a los campos
            let restoredCount = 0;
            
            for (let [name, value] of Object.entries(formData)) {
                if (name.startsWith('_')) continue;
                
                // Buscar el campo por nombre
                const elements = document.querySelectorAll(`[name="${name}"]`);
                
                elements.forEach(element => {
                    if (element.type === 'checkbox' || element.type === 'radio') {
                        if (element.value === value) {
                            element.checked = true;
                            restoredCount++;
                        }
                    } else if (element.tagName === 'SELECT') {
                        element.value = value;
                        restoredCount++;
                    } else {
                        element.value = value;
                        restoredCount++;
                        
                        // Disparar eventos para validaciones en tiempo real
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            }
            
            if (this.debug && restoredCount > 0) {
                console.log(`🔄 Restaurados automáticamente ${restoredCount} campos`);
            }
            
            return restoredCount > 0;
            
        } catch (e) {
            console.error('Error restaurando datos:', e);
            return false;
        }
    }

    // Limpiar datos guardados
    clearFormData() {
        localStorage.removeItem(this.storageKey);
        if (this.debug) console.log('🗑️ Datos guardados eliminados');
    }

    // Detectar errores en la página
    detectErrors() {
        // Verificar si hay mensajes de error
        const errorMessages = document.querySelectorAll('.alert-danger');
        if (errorMessages.length > 0) {
            this.hasError = true;
            if (this.debug) console.log('⚠️ Errores detectados en la página');
        } else {
            this.hasError = false;
        }
        
        // También verificar si hay campos con errores de validación HTML5
        const invalidFields = document.querySelectorAll(':invalid');
        if (invalidFields.length > 0 && document.querySelector('form')) {
            this.hasError = true;
            if (this.debug) console.log('⚠️ Campos inválidos detectados');
        }
    }
    
    // Método manual para limpiar datos (útil para botón de desarrollo)
    manualClear() {
        this.clearFormData();
        this.showTemporaryMessage('🗑️ Datos guardados eliminados', 'info');
    }
    
    // Mostrar mensaje temporal
    showTemporaryMessage(message, type = 'info') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `alert alert-${type}`;
        msgDiv.style.position = 'fixed';
        msgDiv.style.top = '20px';
        msgDiv.style.right = '20px';
        msgDiv.style.zIndex = '9999';
        msgDiv.style.maxWidth = '300px';
        msgDiv.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <div class="alert-progress">
                <div class="alert-progress-bar"></div>
            </div>
        `;
        
        document.body.appendChild(msgDiv);
        
        setTimeout(() => {
            msgDiv.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            msgDiv.classList.remove('show');
            msgDiv.classList.add('hide');
            setTimeout(() => {
                if (msgDiv.parentNode) msgDiv.remove();
            }, 500);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.formPreserver = new FormPreserver();
});

// Función global para limpiar datos manualmente (solo desarrollo)
function clearSavedFormData() {
    if (window.formPreserver) {
        window.formPreserver.manualClear();
    }
}