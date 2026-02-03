function showTab(tab, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    button.classList.toggle('active');
}

function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length === 0) { input.value = '+380'; return; }
    if (!value.startsWith('380')) { value = '380' + value.replace(/^380/, ''); }
    value = value.substring(0, 12);
    let formatted = '+380';
    if (value.length > 3) formatted += value.substring(3, 5);
    if (value.length > 5) formatted += '-' + value.substring(5, 8);
    if (value.length > 8) formatted += '-' + value.substring(8, 10);
    if (value.length > 10) formatted += '-' + value.substring(10, 12);
    input.value = formatted;
}

let resetData = { emailOrPhone: '', code: '', step: 1 };

function showForgotPasswordModal() {
    resetData = {emailOrPhone: '', code: '', step: 1};
    document.getElementById('forgotPasswordModal').classList.add('active');
    updateModalContent();
}

function closeForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').classList.remove('active');
}

function updateModalContent() {
    const modal = document.getElementById('modalBody');
    if (resetData.step === 1) {
        modal.innerHTML = `
            <h3 class="modal-title">Відновлення пароля</h3>
            <p class="modal-description">Введіть email або телефон вашого акаунта</p>
            <div class="form-group">
                <input type="text" id="resetEmailOrPhone" class="glass-input" placeholder="email@example.com або +380...">
            </div>
            <div id="resetMessage" class="message"></div>
            <button onclick="requestResetCode()" class="btn btn-primary auth-btn">Надіслати код</button>
        `;
    } else if (resetData.step === 2) {
        modal.innerHTML = `
            <h3 class="modal-title">Введіть код</h3>
            <p class="modal-description">Ми надіслали 6-значний код підтвердження</p>
            <div class="form-group">
                <input type="text" id="resetCode" class="glass-input" style="text-align:center;letter-spacing:10px" maxlength="6">
            </div>
            <div id="resetMessage" class="message"></div>
            <button onclick="verifyResetCode()" class="btn btn-primary auth-btn">Підтвердити код</button>
        `;
    } else {
        modal.innerHTML = `
            <h3 class="modal-title">Новий пароль</h3>
            <div class="form-group">
                <input type="password" id="newResetPassword" class="glass-input" placeholder="Мінімум 8 символів">
            </div>
            <div class="form-group">
                <input type="password" id="confirmResetPassword" class="glass-input" placeholder="Підтвердіть пароль">
            </div>
            <div id="resetMessage" class="message"></div>
            <button onclick="resetPasswordFinal()" class="btn btn-primary auth-btn">Змінити пароль</button>
        `;
    }
}

async function requestResetCode() {
    const emailOrPhone = document.getElementById('resetEmailOrPhone').value.trim();
    const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ emailOrPhone })
    });
    const result = await res.json();
    if (res.ok) {
        resetData.emailOrPhone = emailOrPhone;
        resetData.step = 2;
        showCodeNotification(result.code);
        updateModalContent();
    } else {
        const msg = document.getElementById('resetMessage');
        msg.textContent = result.message; msg.className = 'message error';
    }
}

function showCodeNotification(code) {
    const notification = document.createElement('div');
    notification.className = 'code-notification';
    notification.innerHTML = `
        <div class="code-notification-content">
            <h4>🔐 Код відновлення:</h4>
            <div class="code-display">${code}</div>
            <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary">Зрозуміло</button>
        </div>
    `;
    document.body.appendChild(notification);
}

async function handleLogin(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const msg = document.getElementById('loginMessage');
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if (res.ok) {
        localStorage.setItem('token', result.token);
        msg.textContent = 'Успішний вхід!'; msg.className = 'message success';
        setTimeout(() => window.location.href = '/profile', 1000);
    } else {
        msg.textContent = result.message; msg.className = 'message error';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const msg = document.getElementById('registerMessage');
    const res = await fetch('/api/auth/register', { method: 'POST', body: formData });
    const result = await res.json();
    if (res.ok) {
        msg.textContent = 'Реєстрація успішна!'; msg.className = 'message success';
        setTimeout(() => window.location.href = '/profile', 1000);
    } else {
        msg.textContent = result.message; msg.className = 'message error';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => formatPhoneNumber(e.target));
    }
});