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
        document.getElementById('username').value = data.username || '';
        document.getElementById('displayUsername').textContent = data.username || 'Користувач';

        if (data.Customer) {
            document.getElementById('email').value = data.Customer.email || '';
            document.getElementById('displayEmail').textContent = data.Customer.email || '';
            document.getElementById('first_name').value = data.Customer.first_name || '';
            document.getElementById('last_name').value = data.Customer.last_name || '';
            document.getElementById('patronymic').value = data.Customer.patronymic || '';
            document.getElementById('phone').value = data.Customer.phone || '';
            document.getElementById('birth_date').value = data.Customer.birth_date || '';

            const avatarImg = document.getElementById('currentAvatar');
            if (data.Customer.avatar_data) {
                avatarImg.src = data.Customer.avatar_data;
            } else {
                avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=6366f1&color=fff&size=200`;
            }
        }
    } catch (error) {
        window.location.href = '/login';
    }
}

function setupAvatarUpload() {
    const input = document.getElementById('avatarInput');
    const preview = document.getElementById('currentAvatar');
    const headerAvatar = document.getElementById('headerAvatarImg');

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
                showNotification('Аватар оновлено!', 'success');
            }
        } catch (error) {
            showNotification('Помилка завантаження', 'error');
        }
    });
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

        const response = await fetch('/api/auth/update-profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showNotification('Дані збережено!', 'success');
            document.getElementById('displayUsername').textContent = formData.username;
        }
    });

    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            showNotification('Паролі не співпадають', 'error');
            return;
        }

        const response = await fetch('/api/auth/change-password', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldPassword, newPassword })
        });

        if (response.ok) {
            showNotification('Пароль змінено!', 'success');
            e.target.reset();
        } else {
            const result = await response.json();
            showNotification(result.message, 'error');
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