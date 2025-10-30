const API_URL = window.location.origin;

async function loginUser() {
    const selectedUserType = document.querySelector('.user-type.active').dataset.type;

    const loginData = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value,
        role: selectedUserType
    };

    console.log('Enviando datos de login:', loginData);

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();
        console.log('Respuesta del login:', data);

        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('session', JSON.stringify(data.session));

            alert('✅ ' + data.message);

            if (data.user.role === 'patient') {
                window.location.href = 'index.html';
            } else if (data.user.role === 'doctor') {
                window.location.href = 'doctorIndex.html';
            } else if (data.user.role === 'admin') {
                window.location.href = 'admin.html';
            }
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al conectar con el servidor');
    }
}

async function registerUser(userType) {
    let userData = {};

    if (userType === 'patient') {
        userData = {
            email: document.getElementById('patient-email').value,
            password: document.getElementById('patient-password').value,
            fullName: document.getElementById('patient-name').value,
            role: 'patient',
            phone: document.getElementById('patient-phone').value,
            birthDate: document.getElementById('patient-birthdate').value
        };
    } else if (userType === 'doctor') {
        userData = {
            email: document.getElementById('doctor-email').value,
            password: document.getElementById('doctor-password').value,
            fullName: document.getElementById('doctor-name').value,
            role: 'doctor',
            phone: document.getElementById('doctor-phone').value,
            specialty: document.getElementById('doctor-specialty').value,
            licenseNumber: document.getElementById('doctor-license').value
        };
    } else if (userType === 'admin') {
        userData = {
            email: document.getElementById('admin-email').value,
            password: document.getElementById('admin-password').value,
            fullName: document.getElementById('admin-name').value,
            role: 'admin',
            phone: document.getElementById('admin-phone').value
        };
    }

    console.log('Enviando datos de registro:', userData);

    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        if (data.success) {
            alert('✅ ' + data.message);
            showSection('login-section');
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al conectar con el servidor');
    }
}

function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'login.html';
    }
    return JSON.parse(user);
}

async function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    window.location.href = 'login.html';
}
