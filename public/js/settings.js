document.addEventListener('DOMContentLoaded', () => {
    const avatarInput = document.getElementById('avatarInput');
    const deleteAvatarBtn = document.getElementById('deleteAvatarBtn');
    const settingsForm = document.getElementById('settingsForm');
    const passwordForm = document.getElementById('passwordForm');
    const phoneInput = document.getElementById('phone');

    function showNotification(message, type = 'info') {
        const note = document.createElement('div');
        note.className = `notification notification-${type} show`;
        note.textContent = message;
        document.body.appendChild(note);
        setTimeout(() => {
            note.classList.remove('show');
            setTimeout(() => note.remove(), 300);
        }, 4000);
    }

    phoneInput?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (!value.startsWith('380')) value = '380' + value;
        value = value.substring(0, 12);
        let f = '+380';
        if (value.length > 3) f += value.substring(3, 5);
        if (value.length > 5) f += '-' + value.substring(5, 8);
        if (value.length > 8) f += '-' + value.substring(8, 10);
        if (value.length > 10) f += '-' + value.substring(10, 12);
        e.target.value = f;
    });

    avatarInput?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await fetch('/api/auth/upload-avatar', { method: 'POST', body: formData });
            if (res.ok) {
                showNotification('Фото успішно оновлено', 'success');
                setTimeout(() => location.reload(), 1000);
            } else {
                const err = await res.json();
                showNotification(err.message, 'error');
            }
        } catch (e) { showNotification('Помилка завантаження', 'error'); }
    });

    deleteAvatarBtn?.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Видалити фото профілю?')) return;

        try {
            const res = await fetch('/api/auth/delete-avatar', { method: 'DELETE' });
            if (res.ok) {
                showNotification('Фото видалено', 'success');
                setTimeout(() => location.reload(), 1000);
            }
        } catch (e) { showNotification('Помилка видалення', 'error'); }
    });

    settingsForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            phone: document.getElementById('phone').value,
            birth_date: document.getElementById('birth_date').value
        };

        const res = await fetch('/api/auth/update-profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();

        if (res.ok) {
            showNotification(result.message, 'success');
            if (result.requiresReauth) setTimeout(() => location.href = '/login', 2000);
        } else {
            showNotification(result.message, 'error');
        }
    });

    passwordForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            return showNotification('Нові паролі не співпадають!', 'error');
        }

        const res = await fetch('/api/auth/change-password', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldPassword, newPassword })
        });

        const result = await res.json();
        if (res.ok) {
            showNotification('Пароль змінено! Перенаправлення на вхід...', 'success');
            setTimeout(() => location.href = '/login', 2000);
        } else {
            showNotification(result.message, 'error');
        }
    });
});

let resetStep = 1;
let resetIdentifier = '';
let resetTokenCode = '';

function showForgotPasswordModal() {
    resetStep = 1;
    document.getElementById('forgotPasswordModal').classList.add('active');
    updateModalUI();
}

function closeForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').classList.remove('active');
}

function updateModalUI() {
    const body = document.getElementById('modalBody');
    const msgId = 'modalMsg';

    if (resetStep === 1) {
        body.innerHTML = `
            <h3>Відновлення пароля</h3>
            <p>Введіть Email або телефон вашого акаунта</p>
            <input type="text" id="resetInput" class="glass-input" placeholder="email@example.com">
            <div id="${msgId}" class="modal-error-msg"></div>
            <button onclick="requestReset()" class="btn btn-primary" style="width:100%; margin-top:20px;">Отримати код</button>
        `;
    } else if (resetStep === 2) {
        body.innerHTML = `
            <h3>Перевірка коду</h3>
            <p>Введіть 6-значний код, надісланий вам</p>
            <input type="text" id="resetCodeInput" class="glass-input" maxlength="6" style="text-align:center; letter-spacing:8px; font-weight:bold;">
            <div id="${msgId}" class="modal-error-msg"></div>
            <button onclick="verifyResetCode()" class="btn btn-primary" style="width:100%; margin-top:20px;">Підтвердити код</button>
        `;
    } else if (resetStep === 3) {
        body.innerHTML = `
            <h3>Новий пароль</h3>
            <div class="form-group" style="text-align:left">
                <label>Новий пароль</label>
                <input type="password" id="resetNewPass" class="glass-input" minlength="8">
            </div>
            <div class="form-group" style="text-align:left; margin-top:10px;">
                <label>Підтвердіть пароль</label>
                <input type="password" id="resetConfirmPass" class="glass-input">
            </div>
            <div id="${msgId}" class="modal-error-msg"></div>
            <button onclick="finishReset()" class="btn btn-primary" style="width:100%; margin-top:20px;">Змінити пароль</button>
        `;
    }
}

async function requestReset() {
    resetIdentifier = document.getElementById('resetInput').value;
    const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ emailOrPhone: resetIdentifier })
    });
    if (res.ok) {
        resetStep = 2;
        updateModalUI();
    } else {
        const err = await res.json();
        document.getElementById('modalMsg').textContent = err.message;
    }
}

async function verifyResetCode() {
    resetTokenCode = document.getElementById('resetCodeInput').value;
    const res = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ emailOrPhone: resetIdentifier, code: resetTokenCode })
    });
    if (res.ok) {
        resetStep = 3;
        updateModalUI();
    } else {
        const err = await res.json();
        document.getElementById('modalMsg').textContent = err.message;
    }
}

async function finishReset() {
    const newPassword = document.getElementById('resetNewPass').value;
    const confirm = document.getElementById('resetConfirmPass').value;
    if (newPassword !== confirm) {
        return document.getElementById('modalMsg').textContent = 'Паролі не співпадають';
    }
    const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            emailOrPhone: resetIdentifier,
            code: resetTokenCode,
            newPassword
        })
    });
    if (res.ok) {
        closeForgotPasswordModal();
        alert('Пароль успішно змінено!');
        window.location.href = '/login';
    } else {
        const err = await res.json();
        document.getElementById('modalMsg').textContent = err.message;
    }
}