let originalData = {};
let hasAvatar = false;

document.addEventListener('DOMContentLoaded', () => {
    loadSettingsData();
    setupAvatarUpload();
    setupForms();
});

async function loadSettingsData() {
    try {
        const response = await fetch('/api/auth/profile');
        if (!response.ok) {
            window.location.href = '/login';
            return;
        }

        const data = await response.json();

        originalData = {
            username: data.username || '',
            email: data.Customer?.email || '',
            first_name: data.Customer?.first_name || '',
            last_name: data.Customer?.last_name || '',
            patronymic: data.Customer?.patronymic || '',
            phone: data.Customer?.phone || '',
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
            document.getElementById('phone').value = originalData.phone;
            document.getElementById('birth_date').value = originalData.birth_date;

            const avatarImg = document.getElementById('currentAvatar');
            const avatarIcon = document.getElementById('avatarIcon');
            const deleteBtn = document.getElementById('deleteAvatarBtn');

            if (data.Customer.avatar_data) {
                avatarImg.src = data.Customer.avatar_data;
                avatarIcon.textContent = '🔄';
                deleteBtn.classList.remove('hidden');
                hasAvatar = true;
            } else {
                avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=6366f1&color=fff&size=200`;
                avatarIcon.textContent = '+';
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
    const headerAvatar = document.getElementById('headerAvatarImg');
    const avatarIcon = document.getElementById('avatarIcon');
    const deleteBtn = document.getElementById('deleteAvatarBtn');

    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showNotification('Файл занадто великий (макс. 5МБ)', 'error');
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
                avatarIcon.textContent = '🔄';
                deleteBtn.classList.remove('hidden');
                hasAvatar = true;
                showNotification('Аватар оновлено!', 'success');
            }
        } catch (error) {
            showNotification('Помилка завантаження', 'error');
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
                avatarIcon.textContent = '+';
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
    const currentData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        patronymic: document.getElementById('patronymic').value,
        phone: document.getElementById('phone').value,
        birth_date: document.getElementById('birth_date').value
    };

    return Object.keys(originalData).some(key => currentData[key] !== originalData[key]);
}

function resetProfileForm() {
    document.getElementById('username').value = originalData.username;
    document.getElementById('email').value = originalData.email;
    document.getElementById('first_name').value = originalData.first_name;
    document.getElementById('last_name').value = originalData.last_name;
    document.getElementById('patronymic').value = originalData.patronymic;
    document.getElementById('phone').value = originalData.phone;
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

        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            patronymic: document.getElementById('patronymic').value,
            phone: document.getElementById('phone').value,
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
                    originalData = { ...formData };
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