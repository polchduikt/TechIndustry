function showTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    const forms = document.querySelectorAll('.form');

    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
}

async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const messageDiv = document.getElementById('loginMessage');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = result.message;
            setTimeout(() => window.location.href = '/', 1000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = result.message;
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Помилка з\'єднання з сервером';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const messageDiv = document.getElementById('registerMessage');

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = result.message;
            setTimeout(() => window.location.href = '/', 1000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = result.message || result.errors?.[0]?.msg;
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Помилка з\'єднання з сервером';
    }
}