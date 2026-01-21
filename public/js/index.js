async function loadProfile() {
    try {
        const response = await fetch('/api/auth/profile');
        if (response.ok) {
            const data = await response.json();
            document.getElementById('username').textContent = data.username;
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        window.location.href = '/login';
    }
}

async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        console.error('Помилка виходу:', error);
    }
}

loadProfile();