let originalData = {};
let hasAvatar = false;

// Функція форматування телефону (така ж як в login.js)
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

// Ініціалізація поля телефону
function initPhoneInput(phoneInput) {
    if (!phoneInput) return;

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

// Модальне вікно для відновлення пароля
let resetData = {
    emailOrPhone: '',
    code: '',
    step: 1
};

function showForgotPasswordModal() {
    resetData = { emailOrPhone: '', code: '', step: 1 };
    document.getElementById('forgotPasswordModal').classList.add('active');
    updateModalContent();
}

function closeForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').classList.remove('active');
    resetData = { emailOrPhone: '', code: '', step: 1 };
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
            <button onclick="resetPasswordFromModal()" class="btn btn-primary" style="width: 100%; margin-top: 20px;">Змінити пароль</button>
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

// Нова функція для показу коду (додати в settings.js)
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
            headers: { 'Content-Type': 'application/json' },
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

async function resetPasswordFromModal() {
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                emailOrPhone: resetData.emailOrPhone,
                code: resetData.code,
                newPassword
            })
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Пароль успішно змінено! Перенаправлення на сторінку входу...';
            setTimeout(() => {
                closeForgotPasswordModal();
                window.location.href = '/login';
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
    loadSettingsData();
    setupAvatarUpload();
    setupForms();

    const phoneInput = document.getElementById('phone');
    initPhoneInput(phoneInput);

    // Закриття модалки при кліку поза нею
    document.getElementById('forgotPasswordModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'forgotPasswordModal') {
            closeForgotPasswordModal();
        }
    });
});

async function loadSettingsData() {
    try {
        const response = await fetch('/api/auth/profile');
        if (!response.ok) {
            window.location.href = '/login';
            return;
        }

        const data = await response.json();

        const formattedPhone = data.Customer?.phone || '+380';

        originalData = {
            username: data.username || '',
            email: data.Customer?.email || '',
            first_name: data.Customer?.first_name || '',
            last_name: data.Customer?.last_name || '',
            patronymic: data.Customer?.patronymic || '',
            phone: formattedPhone,
            birth_date: data.Customer?.birth_date || ''
        };

        document.getElementById('username').value = originalData.username;
        document.getElementById('displayUsername').textContent = originalData.username || 'Користувач';

        if (data.Customer) {
            document.getElementById('email').value = originalData.email;
            document.getElementById('displayEmail').textContent = originalData.email;
            document.getElementById('first_name').value = originalData.first_name;
            document.getElementById('last_name').value = originalData.last_name;
            document.getElementById('patronymic').value = originalData.patronymic;

            const phoneInput = document.getElementById('phone');
            phoneInput.value = formattedPhone;
            formatPhoneNumber(phoneInput);

            document.getElementById('birth_date').value = originalData.birth_date;

            const avatarImg = document.getElementById('currentAvatar');
            const avatarPreview = document.querySelector('.avatar-preview');
            const deleteBtn = document.getElementById('deleteAvatarBtn');

            if (data.Customer.avatar_data) {
                avatarImg.src = data.Customer.avatar_data;
                avatarPreview.classList.add('has-avatar');
                deleteBtn.classList.remove('hidden');
                hasAvatar = true;
            } else {
                avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=6366f1&color=fff&size=200`;
                avatarPreview.classList.remove('has-avatar');
                deleteBtn.classList.add('hidden');
                hasAvatar = false;
            }
        }

        setupChangeDetection();
    } catch (error) {
        window.location.href = '/login';
    }
}

function setupAvatarUpload() {
    const input = document.getElementById('avatarInput');
    const preview = document.getElementById('currentAvatar');
    const avatarPreview = document.querySelector('.avatar-preview');
    const headerAvatar = document.getElementById('headerAvatarImg');
    const deleteBtn = document.getElementById('deleteAvatarBtn');

    avatarPreview.addEventListener('click', () => {
        input.click();
    });

    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            showNotification('Можна завантажувати тільки зображення (JPG, PNG, GIF, WebP, SVG)', 'error');
            input.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showNotification('Файл занадто великий (макс. 5МБ)', 'error');
            input.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/auth/upload-avatar', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                preview.src = result.avatarUrl;
                if (headerAvatar) headerAvatar.src = result.avatarUrl;
                avatarPreview.classList.add('has-avatar');
                deleteBtn.classList.remove('hidden');
                hasAvatar = true;
                showNotification('Аватар оновлено!', 'success');
            } else {
                showNotification(result.message || 'Помилка завантаження', 'error');
            }
        } catch (error) {
            showNotification('Помилка завантаження', 'error');
        } finally {
            input.value = '';
        }
    });

    deleteBtn.addEventListener('click', async () => {
        if (!confirm('Ви впевнені, що хочете видалити аватар?')) return;

        try {
            const response = await fetch('/api/auth/delete-avatar', {
                method: 'DELETE'
            });

            const result = await response.json();
            if (response.ok) {
                const username = document.getElementById('displayUsername').textContent;
                preview.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6366f1&color=fff&size=200`;
                if (headerAvatar) {
                    headerAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6366f1&color=fff&size=200`;
                }
                avatarPreview.classList.remove('has-avatar');
                deleteBtn.classList.add('hidden');
                hasAvatar = false;
                showNotification('Аватар видалено', 'success');
            }
        } catch (error) {
            showNotification('Помилка видалення', 'error');
        }
    });
}

function setupChangeDetection() {
    const profileForm = document.getElementById('settingsForm');
    const saveButton = profileForm.querySelector('button[type="submit"]');
    const cancelButton = document.getElementById('cancelProfileBtn');

    saveButton.disabled = true;
    saveButton.style.opacity = '0.5';
    saveButton.style.cursor = 'not-allowed';

    const inputs = profileForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const hasChanges = checkProfileChanges();
            saveButton.disabled = !hasChanges;
            saveButton.style.opacity = hasChanges ? '1' : '0.5';
            saveButton.style.cursor = hasChanges ? 'pointer' : 'not-allowed';
        });
    });

    cancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        resetProfileForm();
    });

    const passwordForm = document.getElementById('passwordForm');
    const updatePasswordBtn = passwordForm.querySelector('button[type="submit"]');

    updatePasswordBtn.disabled = true;
    updatePasswordBtn.style.opacity = '0.5';
    updatePasswordBtn.style.cursor = 'not-allowed';

    const passwordInputs = passwordForm.querySelectorAll('input');
    passwordInputs.forEach(input => {
        input.addEventListener('input', () => {
            const allFilled = Array.from(passwordInputs).every(inp => inp.value.trim() !== '');
            updatePasswordBtn.disabled = !allFilled;
            updatePasswordBtn.style.opacity = allFilled ? '1' : '0.5';
            updatePasswordBtn.style.cursor = allFilled ? 'pointer' : 'not-allowed';
        });
    });
}

function checkProfileChanges() {
    const phoneInput = document.getElementById('phone');
    const cleanCurrentPhone = phoneInput.value.replace(/\D/g, '');
    const cleanOriginalPhone = originalData.phone.replace(/\D/g, '');

    const currentData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        patronymic: document.getElementById('patronymic').value,
        phone: cleanCurrentPhone,
        birth_date: document.getElementById('birth_date').value
    };

    const originalDataClean = {
        ...originalData,
        phone: cleanOriginalPhone
    };

    return Object.keys(originalDataClean).some(key => currentData[key] !== originalDataClean[key]);
}

function resetProfileForm() {
    document.getElementById('username').value = originalData.username;
    document.getElementById('email').value = originalData.email;
    document.getElementById('first_name').value = originalData.first_name;
    document.getElementById('last_name').value = originalData.last_name;
    document.getElementById('patronymic').value = originalData.patronymic;

    const phoneInput = document.getElementById('phone');
    phoneInput.value = originalData.phone;
    formatPhoneNumber(phoneInput);

    document.getElementById('birth_date').value = originalData.birth_date;

    const saveButton = document.querySelector('#settingsForm button[type="submit"]');
    saveButton.disabled = true;
    saveButton.style.opacity = '0.5';
    saveButton.style.cursor = 'not-allowed';

    showNotification('Зміни скасовано', 'info');
}

function setupForms() {
    document.getElementById('settingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const phoneInput = document.getElementById('phone');
        const cleanPhone = phoneInput.value.replace(/\D/g, '');

        const emailInput = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (cleanPhone.length !== 12) {
            showNotification('Введіть повний номер телефону', 'error');
            return;
        }

        if (!emailRegex.test(emailInput.value)) {
            showNotification('Введіть валідну email адресу', 'error');
            return;
        }

        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            patronymic: document.getElementById('patronymic').value,
            phone: '+' + cleanPhone,
            birth_date: document.getElementById('birth_date').value
        };

        try {
            const response = await fetch('/api/auth/update-profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                if (result.requiresReauth) {
                    showNotification('Дані оновлено! Перенаправлення на сторінку входу...', 'success');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                } else {
                    showNotification('Дані збережено!', 'success');
                    originalData = {
                        ...formData,
                        phone: phoneInput.value
                    };
                    document.getElementById('displayUsername').textContent = formData.username;

                    const saveButton = e.target.querySelector('button[type="submit"]');
                    saveButton.disabled = true;
                    saveButton.style.opacity = '0.5';
                    saveButton.style.cursor = 'not-allowed';
                }
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            showNotification('Помилка збереження', 'error');
        }
    });

    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword.length < 8) {
            showNotification('Новий пароль має містити мінімум 8 символів', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification('Паролі не співпадають', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            const result = await response.json();

            if (response.ok) {
                showNotification('Пароль змінено! Перенаправлення на сторінку входу...', 'success');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            showNotification('Помилка зміни пароля', 'error');
        }
    });
}

function showNotification(message, type = 'info') {
    const note = document.createElement('div');
    note.className = `notification notification-${type} show`;
    note.textContent = message;
    document.body.appendChild(note);
    setTimeout(() => {
        note.classList.remove('show');
        setTimeout(() => note.remove(), 300);
    }, 3000);
}

function togglePasswordSettings(inputId, button) {
    const input = document.getElementById(inputId);
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    button.classList.toggle('active');
}