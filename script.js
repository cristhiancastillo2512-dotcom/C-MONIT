document.addEventListener('DOMContentLoaded', function() {
    // Constantes de la aplicación
    const ADMIN_KEY = '123456';
    
    // Elementos del DOM
    const elements = {
        loginContainer: document.getElementById('loginContainer'),
        appContainer: document.getElementById('appContainer'),
        adminKeyInput: document.getElementById('adminKey'),
        loginBtn: document.getElementById('loginBtn'),
        logoutBtn: document.getElementById('logoutBtn'),
        driverNameInput: document.getElementById('driverName'),
        destinationInput: document.getElementById('destination'),
        dateInput: document.getElementById('date'),
        timeInput: document.getElementById('time'),
        saveBtn: document.getElementById('saveBtn'),
        deleteAllBtn: document.getElementById('deleteAllBtn'),
        driverList: document.getElementById('driverList'),
        confirmationModal: document.getElementById('confirmationModal'),
        confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
        cancelDeleteBtn: document.getElementById('cancelDeleteBtn')
    };

    // Verificar que todos los elementos existan
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Elemento no encontrado: ${key}`);
        }
    }

    // Base de datos simulada
    let drivers = JSON.parse(localStorage.getItem('drivers')) || [];
    
    // Configurar fecha actual por defecto (solo si el elemento existe)
    if (elements.dateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        elements.dateInput.value = formattedDate;
    }
    
    // Verificar si hay sesión activa al cargar
    checkSession();
    
    // Evento para iniciar sesión
    elements.loginBtn?.addEventListener('click', function() {
        const enteredKey = elements.adminKeyInput?.value.trim();
        
        if (enteredKey === ADMIN_KEY) {
            // Credenciales correctas
            localStorage.setItem('adminLoggedIn', 'true');
            showApp();
        } else {
            // Credenciales incorrectas
            showError('Clave incorrecta. Intente nuevamente.');
        }
    });
    
    // Evento para cerrar sesión
    elements.logoutBtn?.addEventListener('click', function() {
        localStorage.removeItem('adminLoggedIn');
        showLogin();
        if (elements.adminKeyInput) elements.adminKeyInput.value = '';
    });
    
    // Evento para guardar un nuevo conductor
    elements.saveBtn?.addEventListener('click', function() {
        const driverName = elements.driverNameInput?.value.trim();
        const destination = elements.destinationInput?.value.trim();
        const date = elements.dateInput?.value;
        const time = elements.timeInput?.value;
        
        if (driverName && destination && date && time) {
            const newDriver = {
                id: Date.now(),
                name: driverName,
                destination: destination,
                date: formatDisplayDate(date),
                time: time,
                rawDate: date
            };
            
            drivers.push(newDriver);
            localStorage.setItem('drivers', JSON.stringify(drivers));
            
            displayDrivers();
            
            // Limpiar formulario (excepto fecha)
            if (elements.driverNameInput) elements.driverNameInput.value = '';
            if (elements.destinationInput) elements.destinationInput.value = '';
            if (elements.timeInput) elements.timeInput.value = '';
        } else {
            showError('Por favor complete todos los campos');
        }
    });
    
    // Evento para borrar todos los datos
    elements.deleteAllBtn?.addEventListener('click', function() {
        if (elements.confirmationModal) {
            elements.confirmationModal.style.display = 'block';
        }
    });
    
    // Confirmar borrado
    elements.confirmDeleteBtn?.addEventListener('click', function() {
        drivers = [];
        localStorage.setItem('drivers', JSON.stringify(drivers));
        displayDrivers();
        if (elements.confirmationModal) {
            elements.confirmationModal.style.display = 'none';
        }
        showMessage('Todos los datos han sido borrados');
    });
    
    // Cancelar borrado
    elements.cancelDeleteBtn?.addEventListener('click', function() {
        if (elements.confirmationModal) {
            elements.confirmationModal.style.display = 'none';
        }
    });
    
    // Cerrar modal haciendo clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === elements.confirmationModal) {
            elements.confirmationModal.style.display = 'none';
        }
    });
    
    // Función para verificar la sesión
    function checkSession() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        
        if (isLoggedIn) {
            showApp();
        } else {
            showLogin();
        }
    }
    
    // Función para mostrar la aplicación
    function showApp() {
        if (elements.loginContainer) elements.loginContainer.style.display = 'none';
        if (elements.appContainer) elements.appContainer.style.display = 'block';
        displayDrivers();
    }
    
    // Función para mostrar el login
    function showLogin() {
        if (elements.loginContainer) elements.loginContainer.style.display = 'block';
        if (elements.appContainer) elements.appContainer.style.display = 'none';
    }
    
    // Función para mostrar errores
    function showError(message) {
        // Eliminar mensajes de error anteriores
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        const errorElement = document.createElement('p');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        const container = elements.loginContainer?.style.display !== 'none' ? elements.loginContainer : elements.appContainer;
        if (container) {
            container.appendChild(errorElement);
        }
    }
    
    // Función para mostrar mensajes
    function showMessage(message) {
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageElement = document.createElement('p');
        messageElement.className = 'success-message';
        messageElement.textContent = message;
        messageElement.style.color = '#4CAF50';
        messageElement.style.textAlign = 'center';
        messageElement.style.marginTop = '10px';
        
        if (elements.appContainer) {
            elements.appContainer.insertBefore(messageElement, elements.driverList);
        }
        
        // Eliminar el mensaje después de 3 segundos
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
    
    // Función para mostrar los conductores
    function displayDrivers() {
        if (!elements.driverList) return;
        
        elements.driverList.innerHTML = '';
        
        if (drivers.length === 0) {
            elements.driverList.innerHTML = '<p>No hay conductores registrados</p>';
            return;
        }
        
        // Ordenar por fecha (más reciente primero)
        drivers.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
        
        drivers.forEach(driver => {
            const driverCard = document.createElement('div');
            driverCard.className = 'driver-card';
            
            const formattedTime = formatTime(driver.time);
            
            driverCard.innerHTML = `
                <p class="driver-info">${driver.name}</p>
                <p>Destino: ${driver.destination}</p>
                <p class="time">Fecha: ${driver.date} - Hora: ${formattedTime}</p>
            `;
            
            elements.driverList.appendChild(driverCard);
        });
    }
    
    // Función para formatear la fecha para mostrar
    function formatDisplayDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    // Función para formatear la hora
    function formatTime(timeString) {
        if (!timeString) return '';
        
        const [hours, minutes] = timeString.split(':');
        let period = 'AM';
        let hourNum = parseInt(hours);
        
        if (hourNum >= 12) {
            period = 'PM';
            if (hourNum > 12) hourNum -= 12;
        }
        
        return `${hourNum}:${minutes} ${period}`;
    }
});