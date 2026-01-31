function showTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    const forms = document.querySelectorAll('.form');

    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));

    event.target.classList.add('active');
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

    if (value.length === 0) {
        input.value = '+380';
        return;
    }

    if (!value.startsWith('380')) {
        value = '380' + value.replace(/^380/, '');
    }

    value = value.substring(0, 12);

    let formatted = '+380';

    if (value.length > 3) {
        formatted += value.substring(3, 5);
    }
    if (value.length > 5) {
        formatted += '-' + value.substring(5, 8);
    }
    if (value.length > 8) {
        formatted += '-' + value.substring(8, 10);
    }
    if (value.length > 10) {
        formatted += '-' + value.substring(10, 12);
    }

    input.value = formatted;
}

let resetData = {
    emailOrPhone: '',
    code: '',
    step: 1
};

function showForgotPasswordModal() {
    resetData = {emailOrPhone: '', code: '', step: 1};
    document.getElementById('forgotPasswordModal').classList.add('active');
    updateModalContent();
}

function closeForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').classList.remove('active');
    resetData = {emailOrPhone: '', code: '', step: 1};
}

function updateModalContent() {
    const modal = document.getElementById('modalBody');

    if (resetData.step === 1) {
        modal.innerHTML = `
            <h3 class="modal-title">Відновлення пароля</h3>
            <p class="modal-description">Введіть email або телефон, прив'язаний до вашого акаунта</p>
            <div class="form-group">
                <label>Email або телефон</label>
                <input type="text" id="resetEmailOrPhone" class="glass-input" placeholder="email@example.com або +380XXXXXXXXX">
            </div>
            <div id="resetMessage" class="message"></div>
            <button onclick="requestResetCode()" class="btn btn-primary" style="width: 100%; margin-top: 20px;">Надіслати код</button>
        `;
    } else if (resetData.step === 2) {
        modal.innerHTML = `
            <h3 class="modal-title">Введіть код</h3>
            <p class="modal-description">Код відновлення надіслано. Перевірте консоль сервера (для розробки)</p>
            <div class="form-group">
                <label>6-значний код</label>
                <input type="text" id="resetCode" class="glass-input code-input" maxlength="6" placeholder="000000">
            </div>
            <div id="resetMessage" class="message"></div>
            <button onclick="verifyResetCode()" class="btn btn-primary" style="width: 100%; margin-top: 20px;">Підтвердити код</button>
        `;
    } else if (resetData.step === 3) {
        modal.innerHTML = `
            <h3 class="modal-title">Новий пароль</h3>
            <p class="modal-description">Введіть новий пароль для вашого акаунта</p>
            <div class="form-group">
                <label>Новий пароль</label>
                <div class="password-input-wrapper">
                    <input type="password" id="newResetPassword" class="glass-input" minlength="8">
                    <button type="button" class="toggle-password" onclick="toggleModalPassword('newResetPassword', this)">
                        <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path class="eye-open" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle class="eye-open" cx="12" cy="12" r="3"></circle>
                            <line class="eye-slash" x1="3" y1="3" x2="21" y2="21" stroke-width="2"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Підтвердіть пароль</label>
                <div class="password-input-wrapper">
                    <input type="password" id="confirmResetPassword" class="glass-input" minlength="8">
                    <button type="button" class="toggle-password" onclick="toggleModalPassword('confirmResetPassword', this)">
                        <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path class="eye-open" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle class="eye-open" cx="12" cy="12" r="3"></circle>
                            <line class="eye-slash" x1="3" y1="3" x2="21" y2="21" stroke-width="2"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div id="resetMessage" class="message"></div>
            <button onclick="resetPassword()" class="btn btn-primary" style="width: 100%; margin-top: 20px;">Змінити пароль</button>
        `;
    }
}

function toggleModalPassword(inputId, button) {
    const input = document.getElementById(inputId);
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    button.classList.toggle('active');
}

async function requestResetCode() {
    const emailOrPhone = document.getElementById('resetEmailOrPhone').value.trim();
    const messageDiv = document.getElementById('resetMessage');

    if (!emailOrPhone) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Введіть email або телефон';
        return;
    }

    try {
        const response = await fetch('/api/auth/request-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailOrPhone })
        });

        const result = await response.json();

        if (response.ok) {
            resetData.emailOrPhone = emailOrPhone;
            resetData.step = 2;

            // Показуємо notification з кодом
            showCodeNotification(result.code);

            updateModalContent();
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = result.message;
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Помилка з\'єднання з сервером';
    }
}

// Нова функція для показу коду
function showCodeNotification(code) {
    const notification = document.createElement('div');
    notification.className = 'code-notification';
    notification.innerHTML = `
        <div class="code-notification-content">
            <h4>🔐 Ваш код відновлення:</h4>
            <div class="code-display">${code}</div>
            <p>Код дійсний протягом 10 хвилин</p>
            <button onclick="this.parentElement.parentElement.remove()" class="btn btn-secondary" style="margin-top: 10px; width: 100%;">Зрозуміло</button>
        </div>
    `;
    document.body.appendChild(notification);
}

async function verifyResetCode() {
    const code = document.getElementById('resetCode').value.trim();
    const messageDiv = document.getElementById('resetMessage');

    if (!code || code.length !== 6) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Введіть 6-значний код';
        return;
    }

    try {
        const response = await fetch('/api/auth/verify-reset-code', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                emailOrPhone: resetData.emailOrPhone,
                code
            })
        });

        const result = await response.json();

        if (response.ok) {
            resetData.code = code;
            resetData.step = 3;
            updateModalContent();
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = result.message;
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Помилка з\'єднання з сервером';
    }
}

async function resetPassword() {
    const newPassword = document.getElementById('newResetPassword').value;
    const confirmPassword = document.getElementById('confirmResetPassword').value;
    const messageDiv = document.getElementById('resetMessage');

    if (newPassword.length < 8) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Пароль має бути мінімум 8 символів';
        return;
    }

    if (newPassword !== confirmPassword) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Паролі не співпадають';
        return;
    }

    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                emailOrPhone: resetData.emailOrPhone,
                code: resetData.code,
                newPassword
            })
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Пароль успішно змінено! Перенаправлення...';
            setTimeout(() => {
                closeForgotPasswordModal();
                if (window.location.pathname === '/login') {
                } else {
                    window.location.href = '/login';
                }
            }, 2000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = result.message;
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Помилка з\'єднання з сервером';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phoneInput');

    if (phoneInput) {
        phoneInput.value = '+380';

        phoneInput.addEventListener('input', (e) => {
            formatPhoneNumber(e.target);
        });

        phoneInput.addEventListener('keydown', (e) => {
            const cursorPosition = e.target.selectionStart;
            const selectionEnd = e.target.selectionEnd;
            const hasSelection = cursorPosition !== selectionEnd;

            if ((e.key === 'Backspace' || e.key === 'Delete') && hasSelection) {
                if (cursorPosition < 4) {
                    e.preventDefault();
                    const value = e.target.value;
                    const beforeSelection = value.substring(0, 4);
                    const afterSelection = value.substring(selectionEnd);
                    e.target.value = beforeSelection + afterSelection;
                    formatPhoneNumber(e.target);
                    e.target.setSelectionRange(4, 4);
                }
                return;
            }

            if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPosition <= 4 && !hasSelection) {
                e.preventDefault();
            }
        });

        phoneInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const numbers = pastedText.replace(/\D/g, '');

            if (numbers) {
                let value = numbers;
                if (!value.startsWith('380')) {
                    value = '380' + value.replace(/^380/, '');
                }
                e.target.value = '+380';

                const event = new Event('input', {bubbles: true});
                e.target.value = '+' + value;
                formatPhoneNumber(e.target);
            }
        });

        phoneInput.addEventListener('click', (e) => {
            if (e.target.selectionStart < 4) {
                e.target.setSelectionRange(e.target.value.length, e.target.value.length);
            }
        });

        phoneInput.addEventListener('select', (e) => {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;

            if (start < 4 && end > 4) {
                e.target.setSelectionRange(4, end);
            } else if (start < 4 && end <= 4) {
                e.target.setSelectionRange(4, 4);
            }
        });
    }

    document.getElementById('forgotPasswordModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'forgotPasswordModal') {
            closeForgotPasswordModal();
        }
    });
});

async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const data = Object.fromEntries(new FormData(form));
    const messageDiv = document.getElementById('loginMessage');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('token', result.token);
            messageDiv.className = 'message success';
            messageDiv.textContent = result.message;
            setTimeout(() => window.location.href = '/', 1000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = result.message;
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Connection error';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const phoneInput = document.getElementById('phoneInput');
    const cleanPhone = phoneInput.value.replace(/\D/g, '');

    if (cleanPhone.length !== 12) {
        const messageDiv = document.getElementById('registerMessage');
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Введіть повний номер телефону';
        return;
    }

    formData.set('phone', '+' + cleanPhone);
    const messageDiv = document.getElementById('registerMessage');

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            body: formData
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
        messageDiv.textContent = 'Connection error';
    }
}