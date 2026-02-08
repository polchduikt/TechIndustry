let registrationState = {
    step: 1,
    email: '',
    firstName: '',
    formData: null
};

function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

function showTab(tab, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
    if (tab === 'register') {
        registrationState = { step: 1, email: '', firstName: '', formData: null };
        renderRegistrationForm();
    }
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
            <h3 class="modal-title">Відновлення паролю</h3>
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
            <p class="modal-description">Код надіслано на вашу пошту</p>
            <div class="form-group">
                <input type="text" id="resetCode" class="glass-input" style="text-align:center;letter-spacing:10px" maxlength="6" placeholder="000000">
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
        headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify({ emailOrPhone })
    });
    const result = await res.json();
    const msg = document.getElementById('resetMessage');
    if (res.ok) {
        resetData.emailOrPhone = emailOrPhone;
        resetData.step = 2;
        msg.textContent = 'Код відновлення надіслано на вашу пошту';
        msg.className = 'message success';
        setTimeout(() => updateModalContent(), 1500);
    } else {
        msg.textContent = result.message;
        msg.className = 'message error';
    }
}

async function verifyResetCode() {
    const code = document.getElementById('resetCode').value.trim();
    const res = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify({ emailOrPhone: resetData.emailOrPhone, code })
    });
    const result = await res.json();
    const msg = document.getElementById('resetMessage');

    if (res.ok) {
        resetData.code = code;
        resetData.step = 3;
        msg.textContent = 'Код підтверджено!';
        msg.className = 'message success';
        setTimeout(() => updateModalContent(), 1000);
    } else {
        msg.textContent = result.message;
        msg.className = 'message error';
    }
}

async function resetPasswordFinal() {
    const newPassword = document.getElementById('newResetPassword').value;
    const confirmPassword = document.getElementById('confirmResetPassword').value;
    const msg = document.getElementById('resetMessage');
    if (newPassword !== confirmPassword) {
        msg.textContent = 'Паролі не співпадають';
        msg.className = 'message error';
        return;
    }
    if (newPassword.length < 8) {
        msg.textContent = 'Пароль має бути мінімум 8 символів';
        msg.className = 'message error';
        return;
    }

    const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify({
            emailOrPhone: resetData.emailOrPhone,
            code: resetData.code,
            newPassword
        })
    });
    const result = await res.json();
    if (res.ok) {
        msg.textContent = 'Пароль успішно змінено!';
        msg.className = 'message success';
        setTimeout(() => {
            closeForgotPasswordModal();
            showTab('login', document.querySelector('.tab'));
        }, 1500);
    } else {
        msg.textContent = result.message;
        msg.className = 'message error';
    }
}

async function handleRegisterStep1(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const firstName = formData.get('first_name');
    registrationState.email = email;
    registrationState.firstName = firstName;
    registrationState.formData = formData;
    const msg = document.getElementById('registerMessage');

    try {
        const res = await fetch('/api/auth/request-email-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify({ email, first_name: firstName })
        });
        const result = await res.json();
        if (res.ok) {
            msg.textContent = 'Код підтвердження надіслано на вашу пошту!';
            msg.className = 'message success';
            registrationState.step = 2;
            renderRegistrationForm();
        } else {
            msg.textContent = result.message;
            msg.className = 'message error';
        }
    } catch (error) {
        msg.textContent = 'Помилка з\'єднання. Спробуйте пізніше';
        msg.className = 'message error';
    }
}

async function verifyEmailAndRegister() {
    const code = document.getElementById('verificationCode').value.trim();
    const msg = document.getElementById('registerMessage');
    if (!code || code.length !== 6) {
        msg.textContent = 'Введіть 6-значний код';
        msg.className = 'message error';
        return;
    }
    try {
        const verifyRes = await fetch('/api/auth/verify-email-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify({
                email: registrationState.email,
                code
            })
        });
        const verifyResult = await verifyRes.json();

        if (!verifyRes.ok) {
            msg.textContent = verifyResult.message;
            msg.className = 'message error';
            return;
        }

        registrationState.formData.append('emailVerified', 'true');
        const registerRes = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'CSRF-Token': getCsrfToken()
            },
            body: registrationState.formData
        });
        const registerResult = await registerRes.json();

        if (registerRes.ok) {
            msg.textContent = 'Реєстрація успішна!';
            msg.className = 'message success';
            setTimeout(() => window.location.href = '/profile', 1000);
        } else {
            msg.textContent = registerResult.message;
            msg.className = 'message error';
        }
    } catch (error) {
        msg.textContent = 'Помилка з\'єднання. Спробуйте пізніше';
        msg.className = 'message error';
    }
}

function renderRegistrationForm() {
    const formContainer = document.getElementById('registerForm');
    if (registrationState.step === 1) {
        formContainer.innerHTML = `
            <form onsubmit="handleRegisterStep1(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Ім'я *</label>
                        <input type="text" name="first_name" class="glass-input" required>
                    </div>
                    <div class="form-group">
                        <label>Прізвище *</label>
                        <input type="text" name="last_name" class="glass-input" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>По-батькові</label>
                    <input type="text" name="patronymic" class="glass-input" placeholder="Необов'язково">
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" class="glass-input" placeholder="example@gmail.com" required>
                </div>
                <div class="form-group">
                    <label>Телефон *</label>
                    <input type="text" id="phoneInput" name="phone" class="glass-input" value="+380" required>
                </div>
                <div class="form-group">
                    <label>Ім'я користувача *</label>
                    <input type="text" name="username" class="glass-input" minlength="3" required>
                </div>
                <div class="form-group">
                    <label>Пароль *</label>
                    <div class="password-input-wrapper">
                        <input type="password" id="registerPassword" name="password" class="glass-input" minlength="8" required>
                        <button type="button" class="toggle-password" onclick="togglePassword('registerPassword', this)">
                            <svg class="eye" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <svg class="eye-slash" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="display:none">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div id="registerMessage" class="message"></div>
                <button type="submit" class="btn btn-primary auth-btn">Продовжити</button>
            </form>
        `;

        const phoneInput = document.getElementById('phoneInput');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => formatPhoneNumber(e.target));
        }
    } else if (registrationState.step === 2) {
        formContainer.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">📧</div>
                <h3 style="margin-bottom: 10px;">Підтвердіть email</h3>
                <p style="color: var(--text-muted); margin-bottom: 30px;">
                    Ми надіслали 6-значний код на<br><strong>${registrationState.email}</strong>
                </p>
                <div class="form-group">
                    <input type="text" id="verificationCode" class="glass-input" 
                           style="text-align:center; letter-spacing:10px; font-size:24px" 
                           maxlength="6" placeholder="000000" autofocus>
                </div>
                <div id="registerMessage" class="message"></div>
                <button onclick="verifyEmailAndRegister()" class="btn btn-primary auth-btn">
                    Підтвердити і зареєструватися
                </button>
                <div style="margin-top: 20px;">
                    <a href="#" onclick="event.preventDefault(); registrationState.step = 1; renderRegistrationForm();" 
                       style="color: var(--primary); font-size: 14px;">
                        ← Повернутися назад
                    </a>
                </div>
            </div>
        `;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const msg = document.getElementById('loginMessage');
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if (res.ok) {
        localStorage.setItem('token', result.token);
        msg.textContent = 'Успішний вхід!';
        msg.className = 'message success';
        setTimeout(() => window.location.href = '/profile', 1000);
    } else {
        msg.textContent = result.message;
        msg.className = 'message error';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('registerForm')) {
        renderRegistrationForm();
    }
});