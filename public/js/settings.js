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

function initPhoneInput(phoneInput) {
    if (!phoneInput) return;
    phoneInput.addEventListener('input', (e) => formatPhoneNumber(e.target));
    phoneInput.addEventListener('keydown', (e) => {
        const cursorPosition = e.target.selectionStart;
        if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPosition <= 4) {
            e.preventDefault();
        }
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function showDeleteAccountModal() {
    document.getElementById('deleteAccountModal').classList.add('active');
}

function closeDeleteAccountModal() {
    document.getElementById('deleteAccountModal').classList.remove('active');
    document.getElementById('deleteConfirmInput').value = '';
}

function showForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').classList.add('active');
}

function closeForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').classList.remove('active');
}

function togglePasswordSettings(inputId, button) {
    const input = document.getElementById(inputId);
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    button.classList.toggle('active');
}

function checkProfileChanges() {
    if (!window.originalUserData) return false;
    const phoneInput = document.getElementById('phone');
    const cleanCurrentPhone = phoneInput.value.replace(/\D/g, '');
    const cleanOriginalPhone = window.originalUserData.phone.replace(/\D/g, '');
    const currentData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        patronymic: document.getElementById('patronymic').value || '',
        phone: cleanCurrentPhone,
        birth_date: document.getElementById('birth_date').value || ''
    };
    const originalDataClean = {
        ...window.originalUserData,
        patronymic: window.originalUserData.patronymic || '',
        birth_date: window.originalUserData.birth_date || '',
        phone: cleanOriginalPhone
    };

    return Object.keys(originalDataClean).some(key => currentData[key] !== originalDataClean[key]);
}

function resetProfileForm() {
    if (!window.originalUserData) return;
    document.getElementById('username').value = window.originalUserData.username;
    document.getElementById('email').value = window.originalUserData.email;
    document.getElementById('first_name').value = window.originalUserData.first_name;
    document.getElementById('last_name').value = window.originalUserData.last_name;
    document.getElementById('patronymic').value = window.originalUserData.patronymic || '';
    const phoneInput = document.getElementById('phone');
    phoneInput.value = window.originalUserData.phone;
    formatPhoneNumber(phoneInput);
    document.getElementById('birth_date').value = window.originalUserData.birth_date || '';
    const saveButton = document.querySelector('#settingsForm button[type="submit"]');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.style.opacity = '0.5';
        saveButton.style.cursor = 'not-allowed';
    }
}

function validateProfileForm(e) {
    const phoneInput = document.getElementById('phone');
    const cleanPhone = phoneInput.value.replace(/\D/g, '');
    const emailInput = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cleanPhone.length !== 12) {
        e.preventDefault();
        alert('Введіть повний номер телефону');
        return false;
    }
    if (!emailRegex.test(emailInput.value)) {
        e.preventDefault();
        alert('Введіть валідну email адресу');
        return false;
    }

    return true;
}

function validatePasswordForm(e) {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (newPassword.length < 8) {
        e.preventDefault();
        alert('Новий пароль має містити мінімум 8 символів');
        return false;
    }
    if (newPassword !== confirmPassword) {
        e.preventDefault();
        alert('Паролі не співпадають');
        return false;
    }
    return true;
}

function validateDeleteForm(e) {
    const confirmInput = document.getElementById('deleteConfirmInput').value;
    if (confirmInput !== 'ВИДАЛИТИ') {
        e.preventDefault();
        alert('Введіть "ВИДАЛИТИ" для підтвердження');
        return false;
    }
    return confirm('Ви впевнені? Всі дані будуть втрачені назавжди!');
}

function showFlashMessage() {
    const flashData = document.body.getAttribute('data-flash-message');
    if (flashData) {
        try {
            const flash = JSON.parse(flashData);
            if (flash && flash.text) {
                showNotification(flash.text, flash.type || 'info');
            }
        } catch (e) {
            console.error('Error parsing flash message:', e);
        }
        document.body.removeAttribute('data-flash-message');
    }
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

document.addEventListener('DOMContentLoaded', () => {
    showFlashMessage();
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        initPhoneInput(phoneInput);
        formatPhoneNumber(phoneInput);
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    const deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', showDeleteAccountModal);
    }

    const deleteForm = document.getElementById('deleteAccountForm');
    if (deleteForm) {
        deleteForm.addEventListener('submit', validateDeleteForm);
    }

    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', validatePasswordForm);
    }

    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', validateProfileForm);
    }

    const cancelBtn = document.getElementById('cancelProfileBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetProfileForm();
        });
    }

    if (settingsForm) {
        const saveButton = settingsForm.querySelector('button[type="submit"]');
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.style.opacity = '0.5';
            saveButton.style.cursor = 'not-allowed';

            const inputs = settingsForm.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    const hasChanges = checkProfileChanges();
                    saveButton.disabled = !hasChanges;
                    saveButton.style.opacity = hasChanges ? '1' : '0.5';
                    saveButton.style.cursor = hasChanges ? 'pointer' : 'not-allowed';
                });
            });
        }
    }
    if (passwordForm) {
        const updatePasswordBtn = passwordForm.querySelector('button[type="submit"]');
        if (updatePasswordBtn) {
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
    }

    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.querySelector('.avatar-preview');

    if (avatarPreview && avatarInput) {
        avatarPreview.addEventListener('click', () => avatarInput.click());
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('Можна завантажувати тільки зображення (JPG, PNG, GIF, WebP)');
                avatarInput.value = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Файл занадто великий (макс. 5МБ)');
                avatarInput.value = '';
                return;
            }
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/api/auth/upload-avatar';
            form.enctype = 'multipart/form-data';
            form.style.display = 'none';
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.name = 'avatar';
            fileInput.files = e.target.files;

            form.appendChild(fileInput);
            document.body.appendChild(form);
            form.submit();
        });
    }

    const deleteAvatarBtn = document.getElementById('deleteAvatarBtn');
    if (deleteAvatarBtn) {
        deleteAvatarBtn.addEventListener('click', () => {
            if (!confirm('Ви впевнені, що хочете видалити аватар?')) return;
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/api/auth/delete-avatar';
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        });
    }
});